/**
 * Created by Omri on 08-Jun-17.
 */
var _ = require('underscore-node');

module.exports = function(db) {

    var twitter = {

        db : db,
        stream : function () {
            let Twitter = require('twitter');

            let client = new Twitter({
                consumer_key: 'yjujHs3NYPAJ7Fl4EhofzXzxe',
                consumer_secret: 'e6YaBopKysHFbcTAQYloLATJpXdG03TZYOVrFfSoRXojJX0MgF',
                access_token_key: '872883541402583040-RAd66NzCVZJEu5Z49OrS7NgUDx320cE',
                access_token_secret: 'IXAFgqEGowgFT6Mk2fmA5YyAbxOEQkzSs2mW8b57Fjrup',
                track: 'politics'
            });

            var stream = client.stream('statuses/sample');
            stream.on('data', saveTweet.bind(this));

            stream.on('error', function(error) {
                throw error;
            });
        }
    }

    function saveTweet(event) {
        if (legitTweet(event)) {
            // get collection
            var tweets = this.db.getCollection('tweets');
            // save to database
            tweets.insert(event);
            // save database
            this.db.saveDatabase();
        }
    }

    function legitTweet(tweet) {

        // if tweet doesn't have a location
        if (tweet.user.location === null)
            return false;

        // if tweet language is not supported for sentiment analysis
        let langs = ['da', 'de', 'el', 'en', 'es', 'fi', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'ru', 'sv', 'tr'];
        if (!_.contains(langs, tweet.lang))
            return false;

        return true;
    }

    return twitter;
}
