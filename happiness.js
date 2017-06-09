/**
 * Created by Omri on 09-Jun-17.
 */
/**
 * Created by Omri on 08-Jun-17.
 */

var sentiment = require('./sentiment.js');
var _ = require('underscore-node');
var NodeGeocoder = require('node-geocoder');
var Promise = require('promise');

const MAX_DOCUMENTS_PER_REQUEST = 1000;

module.exports = function (db) {

    var happiness = {
        db: db,
        analyze: function () {

            // get tweets to analyze
            let tweets = this.db.getCollection('tweets').chain().data();
            // select top maximum tweets allowed
            tweets = _.last(tweets, MAX_DOCUMENTS_PER_REQUEST);
            // convert to documents
            let documents = _.map(tweets, function (tweet) {

                return {
                    id: tweet.$loki,
                    language: tweet.lang,
                    text: tweet.text
                }
            });

            // analyze sentiment of tweets
            sentiment.analyze(documents).then(
                function (results) {

                    // iterate results
                    _.each(results, function(result) {
                        // get loki id
                        let id = parseInt(result.id);
                        // get tweets collection
                        let tweets = this.db.getCollection('tweets');
                        // get relevant tweet by id
                        let tweet = tweets.get(id);
                        // set sentiment score on tweet
                        tweet.sentiment = result.score;
                        // get country name of tweet
                        getCountry(tweet.user.location).then(function (location) {

                            // if we figured out the location
                            if (location && location.length === 1) {
                                let sentimentScore = this.tweet.sentiment;
                                // if sentiment was determined
                                // adjust score
                                sentimentScore += 0.5;

                                // get country
                                let country = location[0].country;
                                // read country happiness level from db
                                let happiness = this.db.getCollection('happiness').findOne({'country': country});
                                // if exists
                                if (happiness) {
                                    // update score
                                    happiness.score *= sentimentScore;
                                    // save
                                    this.db.getCollection('happiness').update(happiness);
                                    // save database
                                    this.db.saveDatabase();

                                } else {
                                    // add score
                                    var countryScore = {
                                        country: country,
                                        score: 100 * sentimentScore
                                    }

                                    // delete tweet

                                    // save to database
                                    this.db.getCollection('happiness').insert(countryScore);
                                    // save database
                                    this.db.saveDatabase();
                                }
                            }

                            // delete tweet
                            this.db.getCollection('tweets').remove(this.tweet);

                        }.bind({
                            tweet: tweet,
                            db: this.db
                            }),
                        function (err) {

                        })

                    }, this);


                }.bind(this),
                function (err) {

                }
            );
        }
    }

    function getCountry(location) {
        return new Promise(function (fulfill, reject) {

            var options = {
                provider: 'google',

                // Optional depending on the providers
                httpAdapter: 'https', // Default
                apiKey: 'AIzaSyCqkteRgDgPcq2pQuJFbatLPCEeq2QK7bg', // for Mapquest, OpenCage, Google Premier
                formatter: null         // 'gpx', 'string', ...
            };

            var geocoder = NodeGeocoder(options);

            // Using callback
            geocoder.geocode(location, function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    fulfill( res);
                }
            });

        })
    }

    return happiness;
}

