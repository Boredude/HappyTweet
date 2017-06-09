/**
 * Created by Omri on 08-Jun-17.
 */
var Promise = require('promise');

var sentiment = {

    analyze: function(documents) {
        return new Promise(function (fulfill, reject) {

            let request= require('request');
            // Create post data
            var post_data =
                {
                    documents: documents
                }

            // An object of options to indicate where to post to
            var post_options = {
                url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': '044f3bf8e65e4807bd9946ffc8f7f2f6',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    //'Content-Length': Buffer.byteLength(post_data)
                },
                json: post_data
            };

            request(post_options, function(err, res, body) {
                if (res && (res.statusCode === 200 || res.statusCode === 201)) {
                    fulfill(res.body.documents);
                } else {
                  reject(err);
                }
            });
        });
    }
}

module.exports = sentiment
