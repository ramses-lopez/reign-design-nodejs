const mongoose = require('mongoose')
const fetch = require('node-fetch')
const moment = require('moment')

const connectionString = process.env.MONGO_URL || 'mongodb://172.17.0.2:27017/hn_test'

//mongoose database schema
const articleSchema = mongoose.Schema({
    title: String,
    author: String,
    createdAt: Date,
    url: String
})
const Article = mongoose.model('Article', articleSchema)

mongoose.connect(connectionString,
    { useMongoClient: true, promiseLibrary: global.Promise });

//mongo connection handling
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('mongo connnection succesful'))

//main object
const DBHandler = {
    latestUpdate: null,
    mostRecentArticle: null,
    connectionString: connectionString,
    getArticles: getArticles,
    latestNews: latestNews
}

async function getArticles(){
    try{
        //&page=1&hitsPerPage=10
        const response = await fetch('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
        const envelope = response.ok ? await response.json() : []
        const articles = envelope.hits

        console.log(moment(articles[0].created_at).format('lll'))

        const articlesToBeSaved = articles
        //let's discard news w/o title
        .filter(art => art.story_title !== null || art.title !== null)
        .sort((a, b) => {
            const dateA = moment(a.created_at)
            const dateB = moment(b.created_at)
            return dateA.isAfter(dateB) ? -1 : dateA.isBefore(dateB) ? 1 : 0;
        })
        .filter(art => {
            // if its the first load, then we get all the articles available.
            // otherwise I'll check against the latest article date, and get the most recent ones.
            return DBHandler.mostRecentArticle === null || moment(art.created_at.isAfter(moment(DBHandler.mostRecentArticle)))
        })
        //here we create new models for the newly received news
        .map(art => {
            console.log(art.created_at, art.story_title || art.title)
            return new Article({
                title: art.title || art.story_title,
                author: art.author,
                url: art.url || art.story_url,
                createdAt: moment(art.created_at)
            })
        })
        .map(art => art.save())

        //To avoid duplicating articles on the DB, I'll save the most recent article date
        if(DBHandler.mostRecentArticle === null) articles[0].created_at
        console.log(`${articlesToBeSaved.length} articles will be saved`)
        return await Promise.all(articlesToBeSaved)
    }
    catch(err){
        throw err
    }
}

async function latestNews(){
    const latestNews = await Article.find()
    return latestNews.map(news => {
        news.date = moment(news.createdAt).fromNow()
        return news
    })
}

module.exports = DBHandler
