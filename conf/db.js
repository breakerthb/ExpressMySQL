// conf/db.js
// MySQL数据库联接配置
module.exports = {
    mysql: {
        host: '127.0.0.1', 
        user: 'root',
        password: 'root',
        database:'TestDB', // 前面建的user表位于些数据库中
        port: 3306
    }
};
