const fetch = require('node-fetch')
const moment = require('moment')
const Connection = require('./mongoConnect')
const Article = Connection.model

//opens the mongo connection
Connection.init()

let refreshInterval = process.env.REFRESH_INTERVAL || 1000*60*60 //defaults to one hour

if(process.env.REFRESH_INTERVAL == undefined){
    console.log('REFRESH_INTERVAL not set. defaulting to ', refreshInterval)
}

const DBHandler = {
    latestFetch: null
}

function dateSort(field){
    return function(a, b){
        const dateA = moment(a[field])
        const dateB = moment(b[field])
        return dateA.isAfter(dateB) ? -1 : dateA.isBefore(dateB) ? 1 : 0;
    }
}

DBHandler.removeArticle = async function removeArticle(id){
    try{
        await Article.findById(id).remove()
    }
    catch(err){
        throw err
    }
}

//retrieves articles from the API
DBHandler.getArticlesFromAPI = async function getArticlesFromAPI(){
    try{
        //&page=1&hitsPerPage=10
        const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
        const envelope = response.ok ? await response.json() : []
        const articles = envelope.hits

        const articlesToBeSaved = articles
        //let's discard news w/o title
        .filter(art => art.story_title !== null || art.title !== null)
        .sort(dateSort('created_at'))
        .map(DBHandler.handleArticle)
        .map(art => art.save())

        return await Promise.all(articlesToBeSaved)
    }
    catch(err){
        throw err
    }
}

//gets all the articles on the database
DBHandler.latestNews = async function latestNews(){
    const latestNews = await Article.find()
	const now = new Date()
    return latestNews
    .sort(dateSort('createdAt'))
    .map(news => {
        news.date = DBHandler.dateLabel(news.createdAt, now)
        return news
    })
}

DBHandler.handleArticle = (art) => {
	return new Article({
		title: art.title || art.story_title,
		author: art.author,
		url: art.url || art.story_url,
		createdAt: moment(art.created_at)
	})
}

DBHandler.dateLabel = (date, relativeDate) => {
	const dateA = moment(date)
	const dateB = moment(relativeDate)
	const diff = dateB.diff(dateA, 'days')

	if(diff > 1) return dateA.format('MMM D')
	else if(diff == 1) return 'Yesterday'
	else return dateA.format('hh:mm a')
}

//article refresh
;(() => {
    if(DBHandler.latestFetch === null){
        console.log('loading initial batch...');
        DBHandler.getArticlesFromAPI()
        .then(() => console.log('articles fetched!'))
        .catch(err => console.error(err))
    }

    setInterval(() => {
        console.log('Getting new articles ' + (new Date()).toString())
        DBHandler.getArticlesFromAPI()
        .then(() => console.log(`Articles retrieved!`))
        .catch(err => console.error(err))
    }, refreshInterval)
})()

module.exports = DBHandler
