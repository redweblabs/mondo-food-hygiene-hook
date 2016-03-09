var express = require('express');
var request = require('request');
var bodyParser = require("body-parser");
var moment = require("moment");
require("string_score");

var app = express();

var server = app.listen(3334, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('server started');
});

app.use(bodyParser.json());

var account_id = "*******";
var authToken = "*******";
var googleGeocodeAPIKey = "******";


app.post("/mondo", function(req, res) {
	res.send('post okay');

	console.log(req.body.data.merchant.address);

	if (req.body.data.merchant.category === "eating_out") {

		request({
			"method": "get",
			"url": "https://maps.googleapis.com/maps/api/geocode/json",
			"qs": {
				"address": req.body.data.merchant.address.formatted,
				"key": googleGeocodeAPIKey
			}
		}, function(error, response, body) {

			var geometry = JSON.parse(body).results[0].geometry;

			var latitude = geometry.location.lat;
			var longitude = geometry.location.lng;

			request({
				"method": "get",
				"url": "http://api.ratings.food.gov.uk/Establishments",
				"qs": {
					"longitude": longitude,
					"latitude": latitude,
					"maxDistanceLimit": 1,
					"sortOptionKey": "distance"
				},
				"headers": {
					"x-api-version": 2
				}
			}, function(error, response, body) {
				if (!error) {

					var list = JSON.parse(body);

					var result = false;

					for (var i = 0; i < list.establishments.length; i++) {

						if (list.establishments[i].BusinessName.score(req.body.data.merchant.name) !== 0) {

							result = list.establishments[i];

							break;

						}
					}

					if (result !== false) {
						console.log(result.BusinessName, result.RatingValue);

						var emoji = ['0 💩', '1 😷', '2 😩', '3 😐', '4 😀', '5 😎'];

						var ratingImages = [
							"http://i.imgur.com/tV1sSi5.png",
							"http://i.imgur.com/txWKJxQ.png",
							"http://i.imgur.com/nFue20F.png",
							"http://i.imgur.com/vDndRks.png",
							"http://i.imgur.com/5nBJzOS.png",
							"http://i.imgur.com/0X72YhC.png"
						]

						var ratingText = [
							'Urgent Improvement Necessary',
							'Major Improvement Necessary',
							'Improvement Necessary',
							'Generally Satisfactory',
							'Good',
							'Very Good'
						];

						//todo: missing/might crash for: awaiting inspection, awaiting publication & excempt;

						request({
							"method": "post",
							"url": "https://api.getmondo.co.uk/feed",
							"json": true,
							"form": {
								"account_id": account_id,
								"type": "basic",
								"url": "http://ratings.food.gov.uk/business/en-GB/" + result.FHRSID,
								"params": {
									"title": result.BusinessName + "\nFood Hygiene Rating: " + emoji[result.RatingValue],
									"body": "\"" + ratingText[result.RatingValue] + "\" On: " + moment(result.RatingDate).format('Do MMM YYYY'),
									"image_url": ratingImages[result.RatingValue]
								}
							},
							"headers": {
								'Content-Type': 'application/x-www-form-urlencoded',
								"Authorization": "Bearer "+authToken
							}
						}, function(error, response, body) {

							// cool

						});


					} else {
						console.log("sorry, we could not find a rating");
					}


				}
			});

		});

	}

});
