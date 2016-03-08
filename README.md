# NodeJS服务端开发（Express+MySQL）

标签（空格分隔）： NodeJS

---

REF：<http://www.tuicool.com/articles/JfqYN3I>

# Express工程环境准备

## 1. 安装

- 安装express

	$ sudo npm install express -g

- 安装express项目生成器

	$ sudo npm install express-generator -g

## 2. 创建工程

进入工程目录，运行命令

	$ express ProjectName

expresst项目种子生成器会帮我们生成express相应的工程结构，如下:

![https://img.readitlater.com/i/img1.tuicool.com/Ez6by2M/RS/w704.png](https://img.readitlater.com/i/img1.tuicool.com/Ez6by2M/RS/w704.png)

	/bin: 用于应用启动
	
	/public: 静态资源目录
	
	/routes：可以认为是controller（控制器）目录
	
	/views: jade模板目录，可以认为是view(视图)目录

app.js 程序main文件

## 3. 安装依赖

进入工程，使用npm install安装依赖，使用npm start启动应用。

	$ sudo npm install
	$ sudo npm start

完成后，你在命令行工具里会看出如下界面，在浏览器中访问会得到我们应用的默认页面

![https://img.readitlater.com/i/img0.tuicool.com/uE3aui/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/uE3aui/RS/w704.png)

![https://img.readitlater.com/i/img1.tuicool.com/2uYNVb/RS/w704.png](https://img.readitlater.com/i/img1.tuicool.com/2uYNVb/RS/w704.png)

# MySQL环境准备

## 1. 当然，首先你要准备好MySQL环境。

可以参看<http://supportopensource.iteye.com/blog/1415527>进行安装，同时也建议安装一个数据库管理工具，如navicat for mysql,方便操作

## 2. 创建表

MySQL安装好了后，进入到数据库，创建要用到的表(如user), 结构如下

![https://img.readitlater.com/i/img2.tuicool.com/uEV7jq7/RS/w704.png](https://img.readitlater.com/i/img2.tuicool.com/uEV7jq7/RS/w704.png)

	create table user
	(
		id int(11) unsigned not null auto_increment primary key,
		name varchar(50) null,
		age tinyint(4) unsigned null
	);

## 3. 安装Node的MySQL驱动

在package.json的dependencies中新增, “mysql” : “latest”， 并执行npm install安装依赖

![](http://i.imgur.com/4Mvo640.png)

	$ sudo npm install

# 编写相关代码

整合Express+MySQL

## 1. 工程目录

首先，我们先建几个目录，简单分下层

在工程根目录新增三个目录：

	util – 工具方法
	conf – 配置
	dao – 与数据库交互

完成后的工程结构

![https://img.readitlater.com/i/img2.tuicool.com/fYr2IjZ/RS/w704.png](https://img.readitlater.com/i/img2.tuicool.com/fYr2IjZ/RS/w704.png)

## 2.MySQL连接配置

在conf目录中，编写mySQL数据库连接配置

	// conf/db.js
	// MySQL数据库联接配置
	module.exports = {
	        mysql: {
	                host: '127.0.0.1', 
	                user: 'root',
	                password: 'root',
	                database:'TestDB', // 前面建的user表位于这个数据库中
	                port: 3306
	        }
	};

## 3. 编写CRUD SQL语句

	// dao/userSqlMapping.js
	// CRUD SQL语句
	var user = {
	        insert:'INSERT INTO user(id, name, age) VALUES(0,?,?)',
	        update:'update user set name=?, age=? where id=?',
	        delete: 'delete from user where id=?',
	        queryById: 'select * from user where id=?',
	        queryAll: 'select * from user'
	};
	
	module.exports = user;

## 4. 增加路由及实现数据库的CRUD

以C（新增）的具体实现举例，在/routes/users.js 中增加一个路由

	var userDao = require('../dao/userDao');
	
	// 增加用户
	router.get('/addUser', function(req, res, next) {
	        userDao.add(req, res, next);
	});

在userDao中实现add方法

	// dao/userDao.js
	// 实现与MySQL交互
	var mysql = require('mysql');
	var $conf = require('../conf/db');
	var $util = require('../util/util');
	var $sql = require('./userSqlMapping');
	
	// 使用连接池，提升性能
	var pool  = mysql.createPool($util.extend({}, $conf.mysql));
	
	// 向前台返回JSON方法的简单封装
	var jsonWrite = function (res, ret) {
	        if(typeof ret === 'undefined') {
	                res.json({
	                        code:'1',
	                        msg: '操作失败'
	                });
	        } else {
	                res.json(ret);
	        }
	};
	
	module.exports = {
	        add: function (req, res, next) {
	                pool.getConnection(function(err, connection) {
	                        // 获取前台页面传过来的参数
	                        var param = req.query || req.params;
	
	                        // 建立连接，向表中插入值
	                        // 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
	                        connection.query($sql.insert, [param.name, param.age], function(err, result) {
	                                if(result) {
	                                        result = {
	                                                code: 200,
	                                                msg:'增加成功'
	                                        };    
	                                }
	
	                                // 以json形式，把操作结果返回给前台页面
	                                jsonWrite(res, result);
	
	                                // 释放连接 
	                                connection.release();
	                        });
	                });
	        }
	};

## 5. 测试整合是否成功

因为前面实现的是一个get请求的add方法， 所以可以在浏览器中直接使用地址访问，进入路由

<http://localhost:3000/users/addUser?name=xyz&age=18>

如果你得到如下JSON返回或看到数据表中有上面的数据插入，表示整合成功了

![https://img.readitlater.com/i/img1.tuicool.com/r2iq2m/RS/w704.png](https://img.readitlater.com/i/img1.tuicool.com/r2iq2m/RS/w704.png)

如果出现这样的错误，说明数据库的链接出了问题：

![](http://i.imgur.com/pMBU92u.png)

## 6. 完整的增删改查功能

修改routes/user.js文件：

	var express = require('express');
	var router = express.Router();
	
	var userDao = require('../dao/userDao');
	
	/* GET users listing. */
	router.get('/', function(req, res, next) {
	  res.send('respond with a resource');
	});
	
	// Add User
	router.get('/addUser', function(req, res, next){
	  console.log("router.get");
	  userDao.add(req, res, next);
	});
	
	// All Users
	router.get('/queryAll', function(req, res, next) {
	  userDao.queryAll(req, res, next);
	});
	
	// Query
	router.get('/query', function(req, res, next) {
	  userDao.queryById(req, res, next);
	});
	
	// Delte User
	router.get('/deleteUser', function(req, res, next) {
	  userDao.delete(req, res, next);
	});
	
	// Updae User
	router.post('/updateUser', function(req, res, next) {
	  userDao.update(req, res, next);
	});
	
	module.exports = router;


完整的dao/userDao.js为

	// dao/userDao.js
	// 实现与MySQL交互
	var mysql = require('mysql');
	var $conf = require('../conf/db');
	var $util = require('../util/util');
	var $sql = require('./userSqlMapping');
	
	// 使用连接池，提升性能
	var pool  = mysql.createPool($util.extend({}, $conf.mysql));
	
	// 向前台返回JSON方法的简单封装
	var jsonWrite = function (res, ret) {
	        if(typeof ret === 'undefined') {
	                res.json({
	                        code:'1',
	                        msg: '操作失败'
	                });
	        } else {
	                res.json(ret);
	        }
	};
	
	module.exports = {
	        add: function (req, res, next) {
	                pool.getConnection(function(err, connection) {
	                        // 获取前台页面传过来的参数
	                        var param = req.query || req.params;
	
	                        // 建立连接，向表中插入值
	                        // 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
	                        connection.query($sql.insert, [param.name, param.age], function(err, result) {
	                                if(result) {
	                                        result = {
	                                                code: 200,
	                                                msg:'增加成功'
	                                        };    
	                                }
	
	                                // 以json形式，把操作结果返回给前台页面
	                                jsonWrite(res, result);
	
	                                // 释放连接 
	                                connection.release();
	                        });
	                });
	        },
	        delete: function (req, res, next) {
	                // delete by Id
	                pool.getConnection(function(err, connection) {
	                        var id = +req.query.id;
	                        connection.query($sql.delete, id, function(err, result) {
	                                if(result.affectedRows > 0) {
	                                        result = {
	                                                code: 200,
	                                                msg:'删除成功'
	                                        };
	                                } else {
	                                        result = void 0;
	                                }
	                                jsonWrite(res, result);
	                                connection.release();
	                        });
	                });
	        },
	        update: function (req, res, next) {
	                // update by id
	                // 为了简单，要求同时传name和age两个参数
	                var param = req.body;
	                if(param.name == null || param.age == null || param.id == null) {
	                        jsonWrite(res, undefined);
	                        return;
	                }
	
	                pool.getConnection(function(err, connection) {
	                        connection.query($sql.update, [param.name, param.age, +param.id], function(err, result) {
	                                // 使用页面进行跳转提示
	                                if(result.affectedRows > 0) {
	                                        res.render('suc', {
	                                                result: result
	                                        }); // 第二个参数可以直接在jade中使用
	                                } else {
	                                        res.render('fail',  {
	                                                result: result
	                                        });
	                                }
	
	                                connection.release();
	                        });
	                });
	
	        },
	        queryById: function (req, res, next) {
	                var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
	                pool.getConnection(function(err, connection) {
	                        connection.query($sql.queryById, id, function(err, result) {
	                                jsonWrite(res, result);
	                                connection.release();
	
	                        });
	                });
	        },
	        queryAll: function (req, res, next) {
	                pool.getConnection(function(err, connection) {
	                        connection.query($sql.queryAll, function(err, result) {
	                                jsonWrite(res, result);
	                                connection.release();
	                        });
	                });
	        }
	
	};

除了update测试外，其它get请求都可以直接在浏览器中使用地址+参数完成测试。为了模拟post请求，同时简单使用下jade模板（Express支持的一种模板引擎），我们在/views目录新建三个jade文件

views/updateUser.jade

	extends layout
	block content
	        h1 更新用户资料
	        form(method='post', action='/p/users/updateUser')
	                div.form-row
	                        label
	                                span ID:
	                                input(type='text',name='id')
	                div.form-row
	                        label
	                                span name:
	                                input(type='text',name='name')
	                div.form-row
	                        label
	                                span age:
	                                input(type='text',name='age')
	                div.form-row
	                        input(type='submit')
	
suc.jade
	
	block content
	  h1 操作成功！
	  pre #{JSON.stringify(result)}

fail.jade

	block content
	  h1 操作失败！
	  pre #{JSON.stringify(result)}

## 7. 测试结果

<http://127.0.0.1:3001/users/addUser?name=xyz&age=18>  
<http://127.0.0.1:3001/users/queryAll>  
<http://127.0.0.1:3001/users/query>  
<http://127.0.0.1:3001/users/query?id=1>  
<http://127.0.0.1:3001/users/deleteUser?id=1>  
<http://127.0.0.1:3001/users/updateUser?id=1>  

![https://img.readitlater.com/i/img0.tuicool.com/VbIfQv/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/VbIfQv/RS/w704.png)

# IDE

最后，如果你使用的是idea或webStrom这样的IDE，你就不需要安装express和express项目种子生成器了。这两个IDE是可以直接创建NodeJS项目

![https://img.readitlater.com/i/img1.tuicool.com/7nYBRzV/RS/w704.png](https://img.readitlater.com/i/img1.tuicool.com/7nYBRzV/RS/w704.png)

![https://img.readitlater.com/i/img0.tuicool.com/IFrQBbY/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/IFrQBbY/RS/w704.png)

![https://img.readitlater.com/i/img0.tuicool.com/IFrQBbY/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/IFrQBbY/RS/w704.png)

![https://img.readitlater.com/i/img2.tuicool.com/Nn2Y7n/RS/w704.png](https://img.readitlater.com/i/img2.tuicool.com/Nn2Y7n/RS/w704.png)

![https://img.readitlater.com/i/img0.tuicool.com/JzYjUb6/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/JzYjUb6/RS/w704.png)

![https://img.readitlater.com/i/img0.tuicool.com/JzYjUb6/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/JzYjUb6/RS/w704.png)

![https://img.readitlater.com/i/img0.tuicool.com/JzYjUb6/RS/w704.png](https://img.readitlater.com/i/img0.tuicool.com/JzYjUb6/RS/w704.png)

小结：

一个Express的helloWorld就差不多完成了, 可以通过这个链接下载此例子源代码http://pan.baidu.com/s/1jGvd4Bc。更多Express的功能（如日志，自动化测试等），等待大家去解锁，愿玩得愉快！


----

1. 运行工程前要先准备数据库环境

2. 访问地址：
只有更新接口使用的是post，其它接口都是get。所以其它接口可以通过
直接输入URL地址访问

    增加 http://localhost:3000/p/users/addUser?name=XXX&age=12

    删除 http://localhost:3000/p/users/deleteUser?id=3

    查询全部 http://localhost:3000/p/users/queryAll

    ID查询 http://localhost:3000/p/users/query?id=1

    修改 http://localhost:3000/p/users，会返回一个页面。通过表单模拟一个post请求






