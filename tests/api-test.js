const test = require('tape')

test('it saves into the db', t => {
    t.equal(1, 1)
    t.end()
})

test('it reads from mongo', t => {
    t.equal(2, 1)
    t.end()
})
