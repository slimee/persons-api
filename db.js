const { MongoClient, ObjectId } = require('mongodb')
const debug = require('debug')('api:mongo')

let database = null

const dbConnectionString = process.env.DB_CONNECTION_STRING
const dbName = process.env.DB_NAME

const dbConnect = () =>
  database && Promise.resolve(database)
  ||
  Promise.resolve(dbConnectionString)
    .then(url => {
      debug(`CONNECTING TO %o`, url)
      return MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    })
    .then(client => {
      debug('CONNECTED')
      database = client.db(dbName)
    })

const col = function (collectionName) {
  return database.collection(collectionName)
}

const objectId = value => new ObjectId(value)

module.exports = { dbConnect, col, objectId }