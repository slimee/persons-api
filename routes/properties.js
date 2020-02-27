var express = require('express')
var router = express.Router()
var { col, objectId } = require('../db')
var properties = col(process.env.PROPERTIES_COLLECTION_NAME)
var debug = require('debug')('api:properties')

router.get('/', (req, res) => {
    const pageSize = req.query.ps ? Number(req.query.ps) : globalPageSize
    const pageNumber = req.query.pn ? Number(req.query.pn) : 0
    const filter = {}

    if (req.query.n) {
      const text = req.query.n
      filter.$text = { $search: text }
    }

    properties
      .find(filter)
      .skip(pageNumber * pageSize)
      .limit(pageSize)
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
