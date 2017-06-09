var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
var Loki = require('lokijs');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname , 'views')));
//Store all HTML files in view folder.

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var db = new Loki('loki.json', {
    persistenceMethod:'fs',
    autoload: true,
    //autosave: true,
    autoloadCallback: loadHandler.bind(app),
    autosaveInterval: 60000
})

app.set('db', db);




function loadHandler() {

    /*
    // delete data
    var collection = db.getCollection('happiness');
    var data = collection.chain().data();
    for (var i = 0; i < data.length; i++)
    {
        collection.remove(data[i]);
    }
    db.saveDatabase();
    */


    // if database did not exist it will be empty so I will intitialize here
    if ( db.getCollection('tweets') == null ) {
        console.log('creating tweets collection in DB')
        db.addCollection('tweets');
        db.saveDatabase();
    }
    else if (db.getCollection('happiness') == null) {
        console.log('creating happiness collection in DB')
        db.addCollection('happiness');
        db.saveDatabase();
    }
    else {
        // load database
        db.loadDatabase();
    }

    // get modules
    var twitter = require('./twitter.js')(db);
    var happiness = require('./happiness.js')(db);

    // start getting twitter stream
    twitter.stream();
    // analyze tweets every 10 minutes
    happiness.analyze();
    setInterval(happiness.analyze, 10*60*1000);
}

module.exports = app;
