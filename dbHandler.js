const mongoose = require('mongoose')
const fetch = require('node-fetch')
const moment = require('moment')
let defaultConnection = 'mongodb://localhost:27017/hn_test'

if(process.env.MONGO_URL == undefined){
    console.log('MONGO_URL not set. defaulting to ', defaultConnection)
}

let refreshInterval = process.env.REFRESH_INTERVAL || 1000*60*60 //defaults to one hour

if(process.env.REFRESH_INTERVAL == undefined){
    console.log('REFRESH_INTERVAL not set. defaulting to ', refreshInterval)
}

const connectionString = process.env.MONGO_URL || defaultConnection

//mongoose database schema
const articleSchema = mongoose.Schema({
    title: String,
    author: String,
    createdAt: Date,
    url: String
})

const Article = mongoose.model('Article', articleSchema)

mongoose.connect(connectionString, { useMongoClient: true, promiseLibrary: global.Promise });

//mongo connection handling
const db = mongoose.connection
db.on('error', (err) => {
    console.error.bind(console, 'connection error:')
    throw err
})
db.once('open', () => console.log('mongo connnection succesful'))

//main object
const DBHandler = {
    latestFetch: null,
    latestNews: latestNews,
    removeArticle: removeArticle
}


//article refresh
;(() => {
    if(DBHandler.latestFetch === null){
        console.log('loading initial batch...');
        getArticlesFromAPI()
        .then(() => console.log('articles fetched!'))
        .catch(err => console.error(err))
    }

    setInterval(() => {
        console.log('Getting new articles ' + (new Date()).toString())
        getArticlesFromAPI()
        .then(() => console.log(`Articles retrieved!`))
        .catch(err => console.error(err))
    }, refreshInterval)
})()

function dateSort(field){
    return function(a, b){
        const dateA = moment(a[field])
        const dateB = moment(b[field])
        return dateA.isAfter(dateB) ? -1 : dateA.isBefore(dateB) ? 1 : 0;
    }
}

async function removeArticle(id){
    try{
        await Article.findById(id).remove()
    }
    catch(err){
        throw err
    }
}

//retrieves articles from the API
async function getArticlesFromAPI(){
    try{
        //&page=1&hitsPerPage=10
        const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
        const envelope = response.ok ? await response.json() : []
        const articles = envelope.hits

        const articlesToBeSaved = articles
        //let's discard news w/o title
        .filter(art => art.story_title !== null || art.title !== null)
        .sort(dateSort('created_at'))
        //here we create new models for the newly received news
        .map(art => {
            return new Article({
                title: art.title || art.story_title,
                author: art.author,
                url: art.url || art.story_url,
                createdAt: moment(art.created_at)
            })
        })
        .map(art => art.save())

        return await Promise.all(articlesToBeSaved)
    }
    catch(err){
        throw err
    }
}

//gets all the articles on the database
async function latestNews(){
    const latestNews = await Article.find()
    return latestNews
    .sort(dateSort('createdAt'))
    .map(news => {
        news.date = moment(news.createdAt).fromNow()
        return news
    })
}

module.exports = DBHandler
