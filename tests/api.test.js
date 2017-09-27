const test = require('tape')
const moment = require('moment')
const Article = require('../mongoConnect.js').model
const dbHandler = require('../dbHandler.js')

test('it takes an article object from API and turns it into a valid object', assert => {
	const article = {
		"created_at": "2017-09-08T09:54:58.000Z",
		"title": "A Node.js opensource lib to send transactional notifications, what next?",
		"url": "https://github.com/notifme/notifme-sdk?",
		"author": "bdav24",
		"points": 1,
		"story_text": null,
		"comment_text": null,
		"num_comments": 1,
		"story_id": null,
		"story_title": null,
		"story_url": null,
		"parent_id": null,
		"created_at_i": 1504864498,
		"_tags": [
			"story",
			"author_bdav24",
			"story_15199023"
		],
		"objectID": "15199023",
		"_highlightResult": {
			"title": {
				"value": "A <em>Node.js</em> opensource lib to send transactional notifications, what next?",
				"matchLevel": "full",
				"fullyHighlighted": false,
				"matchedWords": [
					"nodejs"
				]
			},
			"url": {
				"value": "https://github.com/notifme/notifme-sdk?",
				"matchLevel": "none",
				"matchedWords": []
			},
			"author": {
				"value": "bdav24",
				"matchLevel": "none",
				"matchedWords": []
			}
		}
	}
	const expected = new Article({
		title: 'A Node.js opensource lib to send transactional notifications, what next?',
		author: 'bdav24',
		url: 'https://github.com/notifme/notifme-sdk?',
		createdAt: moment('2017-09-08T09:54:58.000Z')
	})

	const actual = dbHandler.handleArticle(article)

	assert.equal(actual.title, expected.title, 'article must have the expected title')
	assert.equal(actual.author, expected.author, 'article must have the expected author')
	assert.equal(actual.url, expected.url, 'article must have the expected url')
	assert.looseEqual(actual.createdAt, expected.createdAt, 'article must have the expected createdAt')
	assert.end()
})

test('it sets an appropriate date label according to the article date', assert => {
	let expected = 'Yesterday'
	let actual = dbHandler.dateLabel('2017-09-07T09:54:58.000Z', '2017-09-08T09:54:58.000Z')
	assert.equal(actual, expected, 'should return a yesterday label')

	expected = 'Apr 27'
	actual = dbHandler.dateLabel('2016-04-27T09:54:58.000Z', '2017-09-08T09:54:58.000Z')
	assert.equal(actual, expected, 'should return a date label')

	expected = '09:54 am'
	actual = dbHandler.dateLabel('2017-09-08T09:54:58', '2017-09-08T10:54:58')
	assert.equal(actual, expected, 'should return an hour label')

	assert.end()
})

test('it returns just the articles newer than a given date', assert => {
	const articlesMock = [
		{ "created_at": "2016-09-08T09:54:58.000Z", "title": 'fake title 1'},
		{ "created_at": "2017-09-03T09:54:58.000Z", "title": 'fake title 2'},
		{ "created_at": "2017-08-08T09:54:58.000Z", "title": 'fake title 3'},
		{ "created_at": "2017-09-08T09:54:58.000Z", "title": 'fake title 4'}
	]

	const expected = [
		{ "created_at": "2017-09-03T09:54:58.000Z", "title": 'fake title 2'},
		{ "created_at": "2017-09-08T09:54:58.000Z", "title": 'fake title 4'}
	]

	const actual = articlesMock.filter(dbHandler.filterArticlesByDate('2017-09-01T09:54:58.000Z') )

	assert.deepEqual(actual, expected, 'should return just the articles newer than given date')
	assert.end()
})
