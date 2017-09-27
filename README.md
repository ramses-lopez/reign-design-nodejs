# reign-design-nodejs

## Installation notes

### Requirements
- NodeJS version 8+
- MongoDB

The application expects an environment variable with the connection string for mongo.

If not set, it defaults to `mongodb://localhost:27017/hn_test`
```shell
export MONGO_URL=<mongo server url> #defaults to mongodb://localhost:27017/hn_test`
#optionally, set the time to wait between fetching of articles
export REFRESH_INTERVAL=60000 #defaults to 1 hour
```

After this is done, run:
```shell
npm install # installs all dependencies
```

Then, you can
```shell
npm start # starts a server on http://localhost:3001
npm test # run the tests
```

The app will fetch the current news available at `https://hn.algolia.com/api/v1/search_by_date?query=nodejs`.
After that, it will automatically fetch articles according to the time defined on `REFRESH_INTERVAL`.
To avoid duplication of articles, before each fetch, the app checks the creation date of the last article,
and saves only the newer articles.

---------------------
Thanks for for your review! :shipit:
