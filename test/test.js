'use strict';
const expect = require('chai').expect;
const Mysql78 = require('../dist/index').default;
const UpInfo = require('@www778878net/koa78-upinfo').default
var iconv = require('iconv-lite');
var fs = require('fs'); 
console.log(process.argv)
var fspath = process.argv[3]
var config = loadjson(fspath);
console.log(config)
function loadjson(filepath) {
    var data;
    try {
        var jsondata = iconv.decode(fs.readFileSync(filepath, "binary"), "utf8");
        data = JSON.parse(jsondata); 
    }
    catch (err) {
        console.log(err);
    }
    return data;
}
let mysql78 = new Mysql78(config["mysql"]);
describe('test null ', () => {
    it(' return anything',async () => {
        let testmysql = new Mysql78(null)
        let testcon = await testmysql.getConnection()
        console.log(testcon)
        //no catch err
    
        expect(testcon).to.equal("pool null");
        //done(); // 通知Mocha测试结束
    });
});
describe('test creatTb ', () => {
    it(' return anything', () => {
        const result = 1;
        mysql78.creatTb(null)
        expect(result).to.equal(1);
        //done(); // 通知Mocha测试结束
    });
});
describe('test addwarn ', () => {
    it(' return 1', async() => {
        let up = new UpInfo().getGuest();//Simulated user upload
        mysql78.isLog = true;
        let result = await mysql78._addWarn("info info ", "kind", up) 
        expect(result).to.equal(1);
        //done(); // 通知Mocha测试结束
    });
});

describe('test get and release con ', () => {
    it(' return ok',async () => {
        let con = await mysql78.getConnection()
        expect(con.config.database).to.equal("testdb");
        let result = await mysql78.releaseConnection(con)
        expect(result).to.equal("ok");
            
    })
  
   
});

describe('test doT ', () => {
    it(' return ok', async () => {
        let up = new UpInfo().getGuest();//Simulated user upload
        let cmds = ["update testtb set data=? where idpk=?"
            , "update testtb set item=? where idpk=?"
        ]
        let values = [[up.getNewid(), "1"]
            , [up.getNewid(), "2"]]
        let errtexts = ["If the first command goes wrong, what do we want to see."
            , "What do we want to see if the second command fails."]
        let logtext = "What do we want to write in the past journal. Just like a normal call's  cmdText.  "
        let logvalues = ["Just like a normal call's  val1", "Just like a normal call's  val2"]

        let result = await mysql78.doT(cmds, values, errtexts, logtext, logvalues, up) 
        expect(result).to.equal("ok");
        //done(); // 通知Mocha测试结束
    });
});



describe('test select ', () => {
    it('should return 1 row', async () => {
        let up = new UpInfo().getGuest();//Simulated user upload
   
        let sb = "select * from testtb where id=?" 
        let tb = await mysql78.doGet(sb, ["id"], up)
        let result = tb.length;
        expect(result).to.equal(1);
      
  
        //done(); // 通知Mocha测试结束
    });
});

describe('test mAdd ', () => {
    it('should return insertId', async () => {
     
        let up = new UpInfo().getGuest();//Simulated guest upload
       
        let sb = "insert into testtb(cid,kind,item,data,upby,uptime,id)SELECT ?,?,?,?,?,?,?"
        let result = await mysql78.doMAdd(sb, ["cidval", "kindval", "itemval"
            , "dataval",   up.uname, up.utime, up.mid],up)
       
        expect(result).to.be.a('number');
        //done(); // 通知Mocha测试结束
    });
});

describe('test modify ', () => {
    it('should return affectedRows', async () => {

        let up = new UpInfo().getGuest();//Simulated guest upload

        let sb = "update testtb set data=? where idpk=?"
        let result = await mysql78.doM(sb, [up.mid,1], up)
     
        expect(result).to.equal(1);
    });
});