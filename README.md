# reign-design-nodejs

## Installation notes

### Requirements
- NodeJS version 8+
- MongoDB

The application expects an enviroment variable with the connection string for mongo:
```shell
export MONGO_URL=<mongo server url> #i.e: mongodb://172.17.0.2:27017/hn_test
```

After this is done, run:
```shell
npm install # installs all dependencies
npm start # starts a server on http://localhost:3001
```

Enjoy! :shipit:
