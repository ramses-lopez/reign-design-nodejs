const express = require('express')
const app = express()
const dbHandler = require('./dbHandler')

app.set('view engine', 'jade');

app.use('/js', express.static(__dirname + '/js'))
app.use('/css', express.static(__dirname + '/css'))
app.use('/node_modules', express.static(__dirname + '/node_modules'))

//article refresh
const refreshArticles = () => {
	setTimeout(() => {
		console.log('its ' + (new Date()).toString())
		refreshArticles()
	}, process.env.REFRESH_TIMEOUT)
}

// refreshArticles()
app.get('/', async (req, res) => {
	try{
		// await dbHandler.getArticles()
		res.render('index', {pageTitle: 'HN Feed', articles: await dbHandler.latestNews()})
	}
	catch(err){
		console.error(err);
		res.render('error', {error: err.toString()})
	}
})


app.delete('/remove/:article_id', async (req, res) => {
	try{
		console.log('deleting', req.params.article_id)
		await dbHandler.removeArticle(req.params.article_id)
		res.status(200).send(req.params.article_id)
	}
	catch(err){
		res.status(500).send(err.toString())
	}
})

port = process.env.PORT || 3001

app.listen(port, () => {
	console.log('Running on http://locahost:' + port)
})
