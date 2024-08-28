<h1 align="center">koa78-mysql78</h1>
<div align="center">

English | [简体中文](./README.cn.md)

## "koa78-mysql78" encapsulates debugging and efficiency statistics functions for the framework

[![License](https://img.shields.io/badge/license-Apache%202-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://dev.azure.com/www778878net/basic_ts/_apis/build/status/www778878net.koa78-mysql78?branchName=main)](https://dev.azure.com/www778878net/basic_ts/_build/latest?definitionId=24&branchName=main)
[![QQ Group](https://img.shields.io/badge/QQ群-323397913-blue.svg?style=flat-square&color=12b7f5&logo=qq)](https://qm.qq.com/cgi-bin/qm/qr?k=it9gUUVdBEDWiTOH21NsoRHAbE9IAzAO&jump_from=webapi&authKey=KQwSXEPwpAlzAFvanFURm0Foec9G9Dak0DmThWCexhqUFbWzlGjAFC7t0jrjdKdL)

</div>

## API Documentation

[http://www.778878.net/docs/#/koa78-mysql78/](http://www.778878.net/docs/#/koa78-mysql78/)

## Feedback QQ Group (Click to join)

[323397913](https://qm.qq.com/cgi-bin/qm/qr?k=it9gUUVdBEDWiTOH21NsoRHAbE9IAzAO&jump_from=webapi&authKey=KQwSXEPwpAlzAFvanFURm0Foec9G9Dak0DmThWCexhqUFbWzlGjAFC7t0jrjdKdL)

## Background

1. 18 years of ERP development experience, 10 years of cloud development experience, 15 years of stock and futures investment experience, 10 years of investment analysis platform development experience
2. Not highly technical, but understands business and excels at solving practical production and operation problems
3. Gradually open-sourcing projects that have been optimized over many years and are still running stably

## Introduction

1. Encapsulates Koa to reduce learning costs
2. Stable: Running for years, two single-core 1G machines handle thousands of concurrent requests
3. Fast development: A few lines of code handle common CRUD APIs and batch insertions
4. High efficiency: Has a complete low-code front-end and back-end framework, 1 back-end can easily cooperate with 4+ front-ends
5. Easy to extend: Business tables correspond to data tables, one directory is a set of small functions, one file is a data table
6. Strong adaptability: Runs simultaneously on Alibaba Cloud and Tencent Cloud
7. Easy to debug: Can set to track all calls for certain users, tables, or directories
8. Easy to learn: Ten lines of code to get started, hard not to understand
9. Easy to maintain: Has complete API call counting and time-consuming statistics, as well as WeChat error reporting mechanism
10. Quick updates: The main operating project also uses this set, if there are bugs or new features, they will be updated in time
11. Easy to refactor: One directory is a small system, one version is one path, new and old APIs can coexist for a long time, changing tires while driving
12. SAAS: Supports data isolation by account set or user, same table with different permissions, complete permission control

## Applicable for

**use for `nodejs ts` project**

## Installation

~~~
npm i @www778878net/koa78-mysql78
~~~

## Properties

- isLog: boolean - Whether to enable log recording
- isCount: boolean - Whether to enable performance statistics
- _pool: mysql.Pool | null - MySQL connection pool

## Methods

- constructor(config: object): Create a Mysql78 instance
- creatTb(up: UpInfo): Promise<string> - Create commonly used system tables
- doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]> - Execute SELECT query
- doM(cmdtext: string, values: any[], up: UpInfo): Promise<number> - Execute UPDATE operation
- doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<number> - Execute INSERT operation
- doT(cmds: string[], values: any[][], errtexts: string[], logtext: string, logvalue: any[], up: UpInfo): Promise<string> - Execute transaction
- doTran(cmdtext: string, values: any[], con: mysql.PoolConnection, up: UpInfo): Promise<any> - Execute single transaction operation
- getConnection(): Promise<mysql.PoolConnection | null> - Get database connection
- releaseConnection(client: mysql.PoolConnection): Promise<void> - Release database connection
- setWarnHandler(handler: Function): void - Set custom warning handler
- close(): Promise<void> - Close connection pool

## Usage Example

~~~
import Mysql78 from "@www778878net/koa78-mysql78";
import UpInfo from "@www778878net/koa78-upinfo";

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

// Execute query
const result = await mysql78.doGet("SELECT * FROM users WHERE id = ?", [1], upInfo);

// Execute update
const affectedRows = await mysql78.doM("UPDATE users SET name = ? WHERE id = ?", ["John", 1], upInfo);

// Execute insert
const insertId = await mysql78.doMAdd("INSERT INTO users (name, email) VALUES (?, ?)", ["Alice", "alice@example.com"], upInfo);

// Execute transaction
const transactionResult = await mysql78.doT(
  ["UPDATE users SET balance = balance - ? WHERE id = ?", "UPDATE users SET balance = balance + ? WHERE id = ?"],
  [[100, 1], [100, 2]],
  ["Transfer out failed", "Transfer in failed"],
  "Transfer operation",
  [100, 1, 2],
  upInfo
);

// Set custom warning handler
mysql78.setWarnHandler(async (info, kind, up) => {
  console.log(`Custom warning handler: ${kind} - ${info}`);
  // Implement custom warning handling logic here
});

// Close connection pool
await mysql78.close();
~~~

## Notes

- After using `getConnection()` to get a connection, remember to use `releaseConnection()` to release the connection.
- The `isLog` and `isCount` options affect performance, it is recommended to enable them only during debugging.
- For transaction operations, please prioritize using the `doT` method instead of manually managing transactions.
- In production environments, make sure to properly handle all possible errors and exceptions.
- You can use the `setWarnHandler` method to set custom warning handling logic for more flexible handling and recording of warning information.
- After use, please call the `close()` method to close the connection pool and release resources.

## OTHER

you can see test/
