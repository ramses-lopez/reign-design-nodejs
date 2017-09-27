const mongoose = require('mongoose')

let ConnectionModule = (() => {
	const connection = {}
	//mongoose model schema
	const articleSchema = mongoose.Schema({
	    title: String,
	    author: String,
	    createdAt: Date,
	    url: String
	})

	const Article = mongoose.model('Article', articleSchema)
	connection.model = Article

	//initializes the mongodb connection
	connection.init = () => {
		let defaultConnection = 'mongodb://localhost:27017/hn_test'

		if(process.env.MONGO_URL == undefined){
		    console.log('MONGO_URL not set. defaulting to ', defaultConnection)
		}

		const connectionString = process.env.MONGO_URL || defaultConnection

		mongoose.connect(connectionString, { useMongoClient: true, promiseLibrary: global.Promise });
		const db = mongoose.connection
		db.on('error', (err) => {
		    console.error.bind(console, 'connection error:')
		    throw err
		})
		db.once('open', () => console.log('mongo connnection succesful'))
	}

	return connection
})()

module.exports = ConnectionModule
