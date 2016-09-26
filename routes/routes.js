var express = require('express');
var router = express.Router();
// var movieBank = require('../movieBank');
var bodyParser = require('body-parser')
var models = require('../models/models.js')
var Page = models.Page;
var User = models.User;
var utils = require('../utils/utils.js');
var Promise = require('bluebird');

module.exports = function (io) {
  router.get('/', function(req, res, next) {
    res.redirect('/wiki')
  });

  router.get('/wiki', function(req, res, next) {
    Page.findAll()
    .then(function(eachPage){
      var pages = eachPage.map(page => page.dataValues);
      res.render('index.html', {pages: pages})
    }).catch(function(err){
      console.log(err)
    });
  });

  router.get('/wiki/search', function(req, res, next) {

    var query = req.query.search;

    Page.findAll({
      where: {
        tags: [query]
      }
    })
    .then(function(foundPage){
      var pages = foundPage.dataValues;
      res.redirect('foundtags.html', {pages: pages})
    })
    .catch(function(err){
      next(err);
    });

    res.render('tagsearch.html')
  });

  router.get('/users', function(req, res, next) {
    User.findAll()
    .then(function(eachUser){
      var users = eachUser.map(user => user.dataValues);
      res.render('users.html', {users: users})
    }).catch(function(err){
      console.log(err)
    });
  });

  router.get('/users/:usersId', function(req, res, next) {
    var usersId = req.params.usersId;

    var userPromise = User.findById(usersId)

    var pagePromise = Page.findAll({
      where: {
        authorId: usersId
      }
    })

    Promise.all([userPromise, pagePromise])
      .spread(function(user, pages){
        console.log('WHAT IS THE USER', user.dataValues)
        res.render('users.html', {users: [user.dataValues], pages: [pages.dataValues]})
      })
    .catch(next);
  });

  router.get('/wiki/add', function(req, res, next) {
    res.render('addpage');
  });

  router.post('/wiki', function(req, res, next) {

    var title = req.body.title;
    var content = req.body.content;
    var tags = req.body.tags.split(',');

    console.log(req.body)

    return User.findOrCreate({
      where: {
        name: req.body.name,
        email: req.body.email
      }
    })
    .spread((user, created) => {
      return Page.create({
        authorId: user.id,
        title: title,
        content: content,
        tags: tags
        })
      })
      .then(function(savedPage){
        res.redirect('wiki/' + savedPage.urlTitle); // route virtual FTW
      })
      .catch(next);
  });

  router.get('/wiki/:urlTitle', function (req, res, next) {
    Page.findOne({
      where: {
        urlTitle: req.params.urlTitle
      },
      include: [
        {model: User, as: 'author'}
      ]
    })
    .then(function(foundPage){
      var pages = foundPage.dataValues;
      var author = pages.author.dataValues;
      console.log('pages', pages)
      res.render('wikipage.html', {pages: pages, author: author})
    })
    .catch(function(err){
      next(err);
    });

  });


  router.get('/stylesheets/style.css', function(req, res) {
      var options = {
      root: './public/'
    };

    res.sendFile('stylesheets/style.css', options, function (err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
      else {
        console.log('Sent:', options, 'stylesheets/style.css');
      }
    });
  });

  return router;
};
