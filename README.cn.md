<h1 align="center">koa78-mysql78</h1>
<div align="center">

[English](./README.md) | 简体中文

##「koa78-mysql78」专为框架封装了调试 效率统计等功能

[![License](https://img.shields.io/badge/license-Apache%202-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://dev.azure.com/www778878net/basic_ts/_apis/build/status/www778878net.koa78-mysql78?branchName=main)](https://dev.azure.com/www778878net/basic_ts/_build/latest?definitionId=24&branchName=main)
[![QQ群](https://img.shields.io/badge/QQ群-323397913-blue.svg?style=flat-square&color=12b7f5&logo=qq)](https://qm.qq.com/cgi-bin/qm/qr?k=it9gUUVdBEDWiTOH21NsoRHAbE9IAzAO&jump_from=webapi&authKey=KQwSXEPwpAlzAFvanFURm0Foec9G9Dak0DmThWCexhqUFbWzlGjAFC7t0jrjdKdL)

</div>

## API文档地址

[http://www.778878.net/docs/#/koa78-mysql78/](http://www.778878.net/docs/#/koa78-mysql78/)

## 反馈qq群(点击加群)

[323397913](https://qm.qq.com/cgi-bin/qm/qr?k=it9gUUVdBEDWiTOH21NsoRHAbE9IAzAO&jump_from=webapi&authKey=KQwSXEPwpAlzAFvanFURm0Foec9G9Dak0DmThWCexhqUFbWzlGjAFC7t0jrjdKdL)

## 背景

1. 十八年ERP开发经验 十年云开发经验 十五年股票期货投资经验 十年投资分析平台开发经验
2. 技术不高 了解业务 擅长解决生产经营实际问题
3. 逐步把多年开发优化 并且在一直稳定运行中的项目开源

## 简介 introduction

1. 封装koa 减少学习成本
2. 稳定:运行数年 二台单核1G机器搞定数千并发
3. 开发快:几行代码搞定增删查改 批量新增等常用API
4. 效率高:有完善的低代码前后端框架 在框架下开发 1后端可轻松配合4前端以上
5. 易扩展:业务表与数据表对应 一个目录就是一套小功能 一个文件就是一个数据表
6. 适应强:同时运行在阿里云和腾迅云
7. 易调试:可设置追踪某几个用户或某表或某目录的所有调用
8. 易学习:十行代码搞定 想装不会都难
9. 易运维:有完善的api调用计数和耗时统计 还有出错微信报警机制
10. 更新快:主要运营中的项目也是这套 如有bug或新功能 必然及时更新
11. 易重构:一个目录一个小系统 一个版本一个路径 新旧api可长期共存 边开车边换胎
12. SAAS:支持分帐套或分用户数据隔离 同表不同权 完善权限控制

## 适用端 apply

**use for `nodejs ts` project**

## 安装 rely on

```
npm i koa78-mysql78
```

## 属性 props

- isLog: boolean - 是否启用日志记录
- isCount: boolean - 是否启用性能统计
- _pool: mysql.Pool | null - MySQL连接池

## 方法 method

- constructor(config: object): 创建Mysql78实例
- creatTb(up: UpInfo): Promise<string> - 创建系统常用表
- doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]> - 执行SELECT查询
- doM(cmdtext: string, values: any[], up: UpInfo): Promise<number> - 执行UPDATE操作
- doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<number> - 执行INSERT操作
- doT(cmds: string[], values: any[][], errtexts: string[], logtext: string, logvalue: any[], up: UpInfo): Promise<string> - 执行事务
- doTran(cmdtext: string, values: any[], con: mysql.PoolConnection, up: UpInfo): Promise<any> - 执行单个事务操作
- getConnection(): Promise<mysql.PoolConnection | null> - 获取数据库连接
- releaseConnection(client: mysql.PoolConnection): Promise<void> - 释放数据库连接
- setWarnHandler(handler: Function): void - 设置自定义警告处理器
- close(): Promise<void> - 关闭连接池

## 使用示例

```
import Mysql78 from "koa78-mysql78";
import UpInfo from "koa78-upinfo";

const config = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "your_password",
  database: "your_database",
  isLog: true,
  isCount: true
};

const mysql78 = new Mysql78(config);
const upInfo = new UpInfo(null).getGuest();

// 执行查询
const result = await mysql78.doGet("SELECT * FROM users WHERE id = ?", [1], upInfo);

// 执行更新
const affectedRows = await mysql78.doM("UPDATE users SET name = ? WHERE id = ?", ["John", 1], upInfo);

// 执行插入
const insertId = await mysql78.doMAdd("INSERT INTO users (name, email) VALUES (?, ?)", ["Alice", "alice@example.com"], upInfo);

// 执行事务
const transactionResult = await mysql78.doT(
  ["UPDATE users SET balance = balance - ? WHERE id = ?", "UPDATE users SET balance = balance + ? WHERE id = ?"],
  [[100, 1], [100, 2]],
  ["转出失败", "转入失败"],
  "转账操作",
  [100, 1, 2],
  upInfo
);

// 设置自定义警告处理器
mysql78.setWarnHandler(async (info, kind, up) => {
  console.log(`自定义警告处理: ${kind} - ${info}`);
  // 在这里可以实现自定义的警告处理逻辑
});

// 关闭连接池
await mysql78.close();
```

## 注意事项

- 使用 `getConnection()` 获取连接后，记得使用 `releaseConnection()` 释放连接。
- `isLog` 和 `isCount` 选项会影响性能，建议仅在调试时启用。
- 事务操作请优先使用 `doT` 方法，而不是手动管理事务。
- 在生产环境中，请确保正确处理所有可能的错误和异常。
- 可以通过 `setWarnHandler` 方法设置自定义的警告处理逻辑，以便更灵活地处理和记录警告信息。
- 使用完毕后，请调用 `close()` 方法关闭连接池，以释放资源。

## OTHER

you can see test/
