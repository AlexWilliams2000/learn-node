# Learn Node

My solution to Wesbos' [Learn Node](https://github.com/wesbos/Learn-Node) course.

The course leads you through building a simple Node web app, making use of Express, Pug, Webpack, Babel, and Mongo (Mongoose).

The app allows a user to make an account. Logged in users can create "stores" (e.g. restaurants, bars) and leave starred reviews of other stores.

Stores have tags (e.g. Family Friendly, Free Wifi) which can be used to filter for stores of interest. Stores also have geolocation data, the app uses google maps to display the stores as pins on a map. 

User can reset their passwords via an emailed password reset link.

The app uses a Google Maps API key from the course page which gets used by a lot of people and is usually rate limited, so the geolocation funtionality is intermittent.

## Dependencies

 - A running instance of MongoDB listening on port 27017
 - Node v7.6+
 - npm v4+

## Install

Clone the repo:

```bash
git clone git@github.com:AlexWilliams2000/learn-node.git
```

Navigate to the `learn-node` directory and install the Node dependencies:

```bash
npm install
```

## Sample Data

To load sample data:

```bash
npm run sample
```

That will populate 16 stores with 3 authors and 41 reviews. The logins for the authors are as follows:

|Name|Email (login)|Password|
|---|---|---|
|Wes Bos|wes@example.com|wes|
|Debbie Downer|debbie@example.com|debbie|
|Beau|beau@example.com|beau|

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

## Run the App

```bash
npm start
```

## Open the Web App

With the server up and running, in a browser navigate to 

```
localhost:7777
```
