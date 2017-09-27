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
npm start # starts a server on http://localhost:3001
```
The app will fetch the current news available at ``.
After that, it will automatically fetch articles according to the time defined on `REFRESH_INTERVAL`

Enjoy! :shipit:
