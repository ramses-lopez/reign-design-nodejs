var express = require('express')
var app = express()
const fetch = require('node-fetch')

app.set('view engine', 'jade');

app.use('/js', express.static(__dirname + '/js'))
app.use('/css', express.static(__dirname + '/css'))
app.use('/node_modules', express.static(__dirname + '/node_modules'))


const ticker = () => {
    setTimeout(() => {
        console.log('its ' + (new Date()).toString())
        ticker()
    }, 1000)
}

ticker()

app.get('/', async (req, res) => {
    const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?query=nodejs&page=1&hitsPerPage=5')
    const newArticles = response.ok ? await response.json() : []

    debugger

	res.render('index.jade', {pageTitle: 'HN Feed', articles: newArticles})
})

port = process.env.PORT || 3001

app.listen(port, () => {
	console.log('Running on http://locahost:' + port)
})
