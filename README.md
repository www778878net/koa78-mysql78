# koa78-mysql78

<div align="center">
English| [简体中文](./README.cn.md) 


## "koa78-mysql78" encapsulates debugging and efficiency statistics functions for the framework

[![License](https://img.shields.io/badge/license-Apache%202-green.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Build Status](https://dev.azure.com/www778878net/basic_ts/_apis/build/status/www778878net.koa78-mysql78?branchName=main)](https://dev.azure.com/www778878net/basic_ts/_build/latest?definitionId=24&branchName=main)
[![QQ Group](https://img.shields.io/badge/QQ Group-323397913-blue.svg?style=flat-square&color=12b7f5&logo=qq)](https://qm.qq.com/cgi-bin/qm/qr?k=it9gUUVdBEDWiTOH21NsoRHAbE9IAzAO&jump_from=webapi&authKey=KQwSXEPwpAlzAFvanFURm0Foec9G9Dak0DmThWCexhqUFbWzlGjAFC7t0jrjdKdL)

</div>

## API Documentation

[http://www.778878.net/docs/#/koa78-mysql78/](http://www.778878.net/docs/#/koa78-mysql78/)

## Feedback QQ Group (Click to Join)

[323397913](https://qm.qq.com/cgi-bin/qm/qr?k=it9gUUVdBEDWiTOH21NsoRHAbE9IAzAO&jump_from=webapi&authKey=KQwSXEPwpAlzAFvanFURm0Foec9G9Dak0DmThWCexhqUFbWzlGjAFC7t0jrjdKdL)

## Background

1. 18 years of ERP development experience, 10 years of cloud development experience, 15 years of stock and futures investment experience, 10 years of investment analysis platform development experience
2. Not highly technical, but understands business and excels at solving practical production and operation problems
3. Gradually open-sourcing projects that have been optimized over many years and are still running stably

## Introduction

1. Encapsulates koa to reduce learning costs
2. Stable: Running for years, two single-core 1G machines handle thousands of concurrent requests
3. Fast development: A few lines of code handle common APIs like CRUD and batch inserts
4. High efficiency: Has a complete low-code front-end and back-end framework, 1 backend can easily support 4+ frontends
5. Easy to extend: Business tables correspond to data tables, one directory is a set of small functions, one file is one data table
6. Strong adaptability: Runs simultaneously on Alibaba Cloud and Tencent Cloud
7. Easy to debug: Can be set to track all calls for certain users, tables, or directories
8. Easy to learn: Ten lines of code to get started, hard not to understand
9. Easy to maintain: Has complete API call counting and time consumption statistics, as well as WeChat error reporting mechanism
10. Fast updates: The main operating project also uses this set, if there are bugs or new features, they will be updated promptly
11. Easy to refactor: One directory is a small system, one version is one path, old and new APIs can coexist for a long time, changing tires while driving
12. SAAS: Supports data isolation by account or user, same table different permissions, complete permission control

## Applicable for

**use for `nodejs ts` project**

## Installation

See API documentation for details

## Properties

See API documentation for details

## Methods

See API documentation for details

## Mysql78 Class Documentation

`Mysql78` is a class that encapsulates MySQL database operations, providing a series of convenient methods to execute SQL queries, updates, and transaction operations.

### Main Features

- Connection pool management
- Support for basic CRUD operations
- Transaction support
- Debugging and logging functionality
- Performance statistics

### Constructor

The constructor accepts a configuration object containing the following properties:

- `host`: Database host address (default is '127.0.0.1')
- `port`: Database port (default is 3306)
- `max`: Maximum number of connections in the pool (default is 200)
- `user`: Database username (default is 'root')
- `password`: Database password (required)
- `database`: Database name (required)
- `isLog`: Whether to enable logging (default is false)
- `isCount`: Whether to enable performance statistics (default is false)

### Main Methods

#### creatTb(up: UpInfo): Promise<string>

Creates commonly used system tables.

#### doGet(cmdtext: string, values: any[], up: UpInfo): Promise<any[]>

Executes a SELECT query and returns the results.

#### doM(cmdtext: string, values: any[], up: UpInfo): Promise<number>

Executes an UPDATE operation and returns the number of affected rows.

#### doMAdd(cmdtext: string, values: any[], up: UpInfo): Promise<number>

Executes an INSERT operation and returns the inserted ID.

#### doT(cmds: string[], values: any[][], errtexts: string[], logtext: string, logvalue: any[], up: UpInfo): Promise<string>

Executes transaction operations.

#### doTran(cmdtext: string, values: any[], con: mysql.PoolConnection, up: UpInfo): Promise<any>

Executes a single transaction operation, requires manual connection management.

#### getConnection(): Promise<mysql.PoolConnection | null>

Gets a database connection.

#### releaseConnection(client: mysql.PoolConnection): Promise<void>

Releases a database connection.

### Private Methods

#### _addWarn(info: string, kind: string, up: UpInfo): Promise<string | number>

Adds a warning log.

#### _saveLog(cmdtext: string, values: any[], dlong: number, lendown: number, up: UpInfo): Promise<string>

Saves SQL execution logs.

## Usage Example

import Mysql78 from "@www778878net/mysql78";
import UpInfo from "@www778878net/koa78-upinfo";

const config = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "testdb",
  isLog: true,
  isCount: true
};

const mysql78 = new Mysql78(config);
const upInfo = new UpInfo(null).getGuest();

// Execute a query
const result = await mysql78.doGet("SELECT * FROM users WHERE id = ?", [1], upInfo);

// Execute an update
const affectedRows = await mysql78.doM("UPDATE users SET name = ? WHERE id = ?", ["John", 1], upInfo);

// Execute an insert
const insertId = await mysql78.doMAdd("INSERT INTO users (name, email) VALUES (?, ?)", ["Alice", "alice@example.com"], upInfo);

// Execute a transaction
const transactionResult = await mysql78.doT(
  ["UPDATE users SET balance = balance - ? WHERE id = ?", "UPDATE users SET balance = balance + ? WHERE id = ?"],
  [[100, 1], [100, 2]],
  ["Transfer out failed", "Transfer in failed"],
  "Transfer operation",
  [100, 1, 2],
  upInfo
);

## Notes

- After using `getConnection()` to get a connection, remember to use `releaseConnection()` to release the connection.
- The `isLog` and `isCount` options will affect performance, it is recommended to enable them only during debugging.
- For transaction operations, prefer using the `doT` method instead of manually managing transactions.
- In production environments, make sure to properly handle all possible errors and exceptions.

## OTHER

you can see test/
