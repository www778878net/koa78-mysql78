import Mysql78 from '../src/index';
import UpInfo from 'koa78-upinfo';

declare global {
  var __TEST_CONFIG__: any;
}

const config = global.__TEST_CONFIG__;
const mysql78 = new Mysql78(config.mysql);

describe('Mysql78', () => {
  let upInfo: UpInfo;

  beforeAll(() => {
    upInfo = new UpInfo(null).getGuest();
  });

  test('creatTb should create system tables', async () => {
    const result = await mysql78.creatTb(upInfo);
    expect(result).toBe('ok');
  });

  test('doGet should return data', async () => {
    const cmdtext = 'SELECT * FROM testtb LIMIT 1';
    const result = await mysql78.doGet(cmdtext, [], upInfo);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test('doM should modify data', async () => {
    const cmdtext = 'UPDATE testtb SET data = ? WHERE idpk = ?';
    const newData = 'updated_data';
    const result = await mysql78.doM(cmdtext, [newData, 1], upInfo);
    expect(result).toBe(1);
  });

  test('doMAdd should insert data and return insertId', async () => {
    const cmdtext = 'INSERT INTO testtb (cid, kind, item, data, upby, uptime, id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = ['test_cid', 'test_kind', 'test_item', 'test_data', upInfo.uname, new Date(), upInfo.getNewid()];
    const result = await mysql78.doMAdd(cmdtext, values, upInfo);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('doT should perform transaction', async () => {
    const cmds = [
      'UPDATE testtb SET data = ? WHERE idpk = ?',
      'INSERT INTO testtb (cid, kind, item, data, upby, uptime, id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ];
    const values = [
      ['updated_data_1', 1],
      ['test_cid_2', 'test_kind_2', 'test_item_2', 'test_data_2', upInfo.uname, new Date(), upInfo.getNewid()]
    ];
    const errtexts = ['Error updating', 'Error inserting'];
    const logtext = 'Transaction test';
    const logvalue = ['test1', 'test2'];

    const result = await mysql78.doT(cmds, values, errtexts, logtext, logvalue, upInfo);
    expect(result).toBe('ok');
  });

  test('getConnection should return a connection', async () => {
    const connection = await mysql78.getConnection();
    expect(connection).not.toBeNull();
    if (connection) {
      await mysql78.releaseConnection(connection);
    }
  });

  test('_addWarn should add a warning', async () => {
    mysql78.isLog = true;
    const result = await mysql78['_addWarn']('Test warning', 'test_kind', upInfo);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  test('_saveLog should save a log', async () => {
    mysql78.isCount = true;
    const result = await mysql78['_saveLog']('SELECT * FROM testtb', [], 100, 1000, upInfo);
    expect(result).toBe('ok');
  });

  afterAll(async () => {
    await mysql78.close(); // 假设您在 Mysql78 类中添加了一个 close 方法
  });
});
