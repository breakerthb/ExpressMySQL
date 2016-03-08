var express = require('express');
var router = express.Router();

var userDao = require('../dao/userDao');

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');
    res.render('updateUser');
});


// Add User
//TODO 同时支持get,post
router.get('/addUser', function(req, res, next) {
    userDao.add(req, res, next);
});

// Query All Users
router.get('/queryAll', function(req, res, next) {
    console.log('查询所有user');
    userDao.queryAll(req, res, next);
});

// Query
router.get('/query', function(req, res, next) {
    userDao.queryById(req, res, next);
});

// Delete User
router.get('/deleteUser', function(req, res, next) {
    userDao.delete(req, res, next);
});

// Update User
router.post('/updateUser', function(req, res, next) {
    userDao.update(req, res, next);
});

module.exports = router;

