# Mondo Food Hygiene Ratings Webhook

A play with the Mondo webhook API. Node JS.

When it recieves an eating_out category transaction it queries the [Food Hygiene Rating Scheme API](http://api.ratings.food.gov.uk/help) and creates a feed item with the rating to let you know.

![KFC Rating :)](http://labs.redweb.com/wp-content/uploads/2016/03/fhr.png)

You'll need add your Mondo account ID and also a temporary access token from the Mondo developer console. Currently investigating a more permanent and flexible solution (>72 hours) using the OAuth API.

Currently the first Mondo card use at a new place has an incorrect latitude/longitude returned, so I've added in a workaround for now to query Google's geolocation API to get one from the merchants address. So you'll need to add an API key for that too.

Then create a webhook using the developer console pointing to your server.

[An accompanying post at Redweb Labs](http://labs.redweb.com/projects/codebar-hack-day-mondo/).
