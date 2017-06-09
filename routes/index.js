var express = require('express');
var router = express.Router();
var _ = require('underscore-node');

/* GET home page. */
router.get('/', function(req, res, next) {

    res.sendFile('index.html');
    //res.render('index', { title: 'Express' });
});


/* GET happiness. */
router.get('/happiness', function(req, res, next) {

    // get reference to db
    var db = req.app.get('db');
    // get happiness
    let happiness = db.getCollection('happiness').chain().data();

    // return json
    res.json(happiness);
});

module.exports = router;