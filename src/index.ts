import { promises as fs } from 'node:fs';
import dayjs from 'dayjs';
import { createHash } from 'node:crypto';
import * as mysql from 'mysql2/promise';
import UpInfo from '@www778878net/koa78-upinfo';
import TsLog78, { ConsoleLog78 } from '@www778878net/tslog78';
import md5 from 'md5';

export default class Mysql78 {
  private _pool: mysql.Pool | null = null;
  private _host: string = '';
  public isLog: boolean = false;
  public isCount: boolean = false;
  private log: TsLog78 = new TsLog78();

  constructor(config: {
    host?: string;
    port?: number;
    max?: number;
    user?: string;
    password: string;
    database: string;
    isLog?: boolean;
    isCount?: boolean;
  }) {
    if (!config) return;

  
    this.log.setup(undefined, undefined, new ConsoleLog78(), 'mysql');
    this._host = config.host ?? '127.0.0.1';
    const port = config.port ?? 3306; // 端口
    const max = config.max ?? 200; // 最大线程数
    const user = config.user ?? 'root'; // mysql用户名
    this.isLog = config.isLog ?? false; // 是否打印日志（影响性能）
    this.isCount = config.isCount ?? false; // 是否统计效率（影响性能）

    this._pool = mysql.createPool({
      connectionLimit: max,
      host: this._host,
      port,
      user,
      password: config.password,
      database: config.database,
      dateStrings: true,
      connectTimeout: 30 * 1000
    });
  }

  /**
   * 创建系统常用表
   * Create system common table
   * 
   * */
  async creatTb(up: UpInfo): Promise<string> {
    if (!this._pool) {
      return 'pool null';
    }

    const cmdtext1 = "CREATE TABLE IF NOT EXISTS `sys_warn` (  `uid` varchar(36) NOT NULL DEFAULT '',  `kind` varchar(100) NOT NULL DEFAULT '',  `apisys` varchar(100) NOT NULL DEFAULT '',  `apiobj` varchar(100) NOT NULL DEFAULT '',  `content` text NOT NULL,  `upid` varchar(36) NOT NULL DEFAULT '',  `upby` varchar(50) DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`)) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";
    const cmdtext2 = "CREATE TABLE IF NOT EXISTS `sys_sql` (  `cid` varchar(36) NOT NULL DEFAULT '',  `apiv` varchar(50) NOT NULL DEFAULT '',  `apisys` varchar(50) NOT NULL DEFAULT '',  `apiobj` varchar(50) NOT NULL DEFAULT '',  `cmdtext` varchar(200) NOT NULL,  `uname` varchar(50) NOT NULL DEFAULT '',  `num` int(11) NOT NULL DEFAULT '0',  `dlong` int(32) NOT NULL DEFAULT '0',  `downlen` int(32) NOT NULL DEFAULT '0',  `upby` varchar(50) NOT NULL DEFAULT '',  `cmdtextmd5` varchar(50) NOT NULL DEFAULT '',  `uptime` datetime NOT NULL,  `idpk` int(11) NOT NULL AUTO_INCREMENT,  `id` varchar(36) NOT NULL,  `remark` varchar(200) NOT NULL DEFAULT '',  `remark2` varchar(200) NOT NULL DEFAULT '',  `remark3` varchar(200) NOT NULL DEFAULT '',  `remark4` varchar(200) NOT NULL DEFAULT '',  `remark5` varchar(200) NOT NULL DEFAULT '',  `remark6` varchar(200) NOT NULL DEFAULT '',  PRIMARY KEY (`idpk`),  UNIQUE KEY `u_v_sys_obj_cmdtext` (`apiv`,`apisys`,`apiobj`,`cmdtext`) USING BTREE) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;";

    try {
      await this._pool.execute(cmdtext1);
      await this._pool.execute(cmdtext2);
      return 'ok';
    } catch (err) {
      this.log.logErr(err as Error, 'mysql_creatTb');
      return 'error';
    }
  }

  /**
   * sql get 
   * @param cmdtext sql  
   * @param values  
   * @param up user upload
   */
  async doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]> {
    if (!this._pool) {
      return [];
    }

    const debug = up.debug ?? false;
    const dstart = new Date();

    try {
      const [rows] = await this._pool.execute(cmdtext, values);
      const back = rows as any[];

      if (debug) {
        this._addWarn(JSON.stringify(back) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
      }

      const lendown = JSON.stringify(back).length;
      this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

      return back;
    } catch (err) {
      this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err_" + up.apisys, up);
      this.log.logErr(err as Error, 'mysql_doGet');
      throw err;
    }
  }

  /**
   * The transaction returns information about the success or failure of the operation
   * @param cmds more sql
   * @param values more value
   * @param errtexts more err
   * @param logtext log
   * @param logvalue log
   * @param up user upload
   */
  async doT(cmds: string[], values: any[][], errtexts: string[], logtext: string, logvalue: any[], up: UpInfo): Promise<string> {
    if (!this._pool) {
      return 'pool null';
    }

    const debug = up.debug ?? false;
    const dstart = new Date();

    try {
      const connection = await this._pool.getConnection();
      await connection.beginTransaction();

      try {
        for (let i = 0; i < cmds.length; i++) {
          await connection.execute(cmds[i], values[i]);
        }

        await connection.commit();
        connection.release();

        this._saveLog(logtext, logvalue, new Date().getTime() - dstart.getTime(), 1, up);
        return 'ok';
      } catch (err) {
        await connection.rollback();
        connection.release();

        const errmsg = errtexts.reduce((msg, text, i) => cmds[i] ? msg + text : msg, 'err!');
        this.log.logErr(err as Error, 'mysql_doT');
        return errmsg;
      }
    } catch (err) {
      this.log.logErr(err as Error, 'mysql_doT_connection');
      return 'error';
    }
  }

  /**
   * sql update Method returns the number of affected rows
   * @param cmdtext sql 
   * @param values  
   * @param up user upload
   */
  async doM(cmdtext: string, values: any[], up: UpInfo): Promise<number> {
    if (!this._pool) {
      return 0;
    }

    const debug = up.debug ?? false;
    const dstart = new Date();

    try {
      const [result] = await this._pool.execute(cmdtext, values);
      const affectedRows = (result as mysql.ResultSetHeader).affectedRows;

      if (debug) {
        this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
      }

      const lendown = JSON.stringify(result).length;
      this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

      return affectedRows;
    } catch (err) {
      this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
      this.log.logErr(err as Error, 'mysql_doM');
      return 0;
    }
  }

  /**
   * Inserting a row returns the inserted row number
   * @param cmdtext
   * @param values
   * @param up
   */
  async doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<number> {
    if (!this._pool) {
      return 0;
    }

    const debug = up.debug ?? false;
    const dstart = new Date();

    try {
      const [result] = await this._pool.execute(cmdtext, values);
      const insertId = (result as mysql.ResultSetHeader).insertId;

      if (debug) {
        this._addWarn(JSON.stringify(result) + " c:" + cmdtext + " v" + values.join(","), "debug_" + up.apisys, up);
      }

      const lendown = JSON.stringify(result).length;
      this._saveLog(cmdtext, values, new Date().getTime() - dstart.getTime(), lendown, up);

      return insertId;
    } catch (err) {
      this._addWarn(JSON.stringify(err) + " c:" + cmdtext + " v" + values.join(","), "err" + up.apisys, up);
      this.log.logErr(err as Error, 'mysql_doMAdd');
      return 0;
    }
  }

  /**
   * Transactions are executed piecemeal (it is usually better not to use doT)
   * You need to release the connection yourself
   * There may be complicated scenarios where the first sentence is successful but what condition has changed and you still need to roll back the transaction
   * @param cmdtext
   * @param values
   * @param con
   * @param up
   */
  async doTran(cmdtext: string, values: any[], con: mysql.PoolConnection, up: UpInfo): Promise<any> {
    const debug = up.debug ?? false;

    try {
      const [result] = await con.execute(cmdtext, values);

      if (debug) {
        this.log.log(`${cmdtext} v:${values.join(",")} r:${JSON.stringify(result)}`, 0, 'mysql', 'doTran', up.uname);
      }

      return result;
    } catch (err) {
      this.log.logErr(err as Error, 'mysql_doTran');
      throw err;
    }
  }

  /**
   * doget doM  does not need to be released manually
   * getConnection 
   * */
  async releaseConnection(client: mysql.PoolConnection): Promise<void> {
    if (this._pool) {
      this._pool.releaseConnection(client);
    }
  }

  /**
   * Get the connection (remember to release it)
   * */
  async getConnection(): Promise<mysql.PoolConnection | null> {
    if (!this._pool) {
      return null;
    }

    try {
      const connection = await this._pool.getConnection();
      return connection;
    } catch (err) {
      this.log.logErr(err as Error, 'mysql_getConnection');
      return null;
    }
  }

  /**
   *Debug function to track online debugging problems with SQL calls (can be set to track users or tables or directories or functions, etc.)
   *Opening affects performance Suggestions mainly track the developer and the directory under development
   * The table name sys warn follows the function
   * @param info log
   * @param kind select the log
   * @param up user upload
   */
  private async _addWarn(info: string, kind: string, up: UpInfo): Promise<string | number> {
    if (!this._pool || !this.isLog) {
      return this.isLog ? 'pool null' : 'isLog is false';
    }

    const cmdtext = 'INSERT INTO sys_warn (`kind`,apisys,apiobj,`content`,`upby`,`uptime`,`id`,upid)VALUES(?,?,?,?,?,?,?,?)';
    const values = [kind, up.apisys, up.apiobj, info, up.uname, up.uptime, up.getNewid(), up.upid];

    try {
      const [results] = await this._pool.execute(cmdtext, values);
      return (results as mysql.ResultSetHeader).affectedRows;
    } catch (err) {
      this.log.logErr(err as Error, 'mysql__addWarn');
      return 0;
    }
  }

  /**
   * If the table name SYS_SQL is opened after the function, it will affect performance
   * @param cmdtext SQL 
   * @param values  
   * @param dlong Function Timing
   * @param lendown down bytes
   * @param up user upload
   */
  private async _saveLog(cmdtext: string, values: any[], dlong: number, lendown: number, up: UpInfo): Promise<string> {
    if (!this.isCount || !this._pool) {
      return this.isCount ? 'pool null' : 'isCount is false';
    }

    const cmdtextmd5 = md5(cmdtext);
    const sb = 'INSERT INTO sys_sql(apiv,apisys,apiobj,cmdtext,num,dlong,downlen,id,uptime,cmdtextmd5)VALUES(?,?,?,?,?,?,?,?,?,?) ' +
               'ON DUPLICATE KEY UPDATE num=num+1,dlong=dlong+?,downlen=downlen+?';
    
    try {
      await this._pool.execute(sb, [
        up.v, up.apisys, up.apiobj, cmdtext, 1, dlong, lendown, up.getNewid(), new Date(), cmdtextmd5,
        dlong, lendown
      ]);
      return 'ok';
    } catch (err) {
      this.log.logErr(err as Error, 'mysql__saveLog');
      return 'error';
    }
  }
}