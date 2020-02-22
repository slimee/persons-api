var express = require('express')
var router = express.Router()
var { col, objectId } = require('../db')
var properties = col(process.env.PROPERTIES_COLLECTION_NAME)
var debug = require('debug')('api:properties')

router.get('/', (req, res) => {
    const filter = {}

    properties
      .find(filter)
      .toArray()
      .then((properties) => res.send(properties))
  },
)

router.get('/:_id', (req, res) => {
  const _id = objectId(req.params._id)
  properties.findOne({ _id })
    .then((property) => res.send(property))
    .catch(debug)
})

module.exports = router
