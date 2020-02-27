var express = require('express')
var router = express.Router()
var { col, objectId } = require('../db')
var properties = col(process.env.PROPERTIES_COLLECTION_NAME)
var debug = require('debug')('api:properties')

const globalPageSize = Number(process.env.PAGE_SIZE)

const search = (filter, pageNumber, pageSize) => properties
  .find(filter)
  .skip(pageNumber * pageSize)
  .limit(pageSize)
  .toArray()

router.get('/', async (req, res) => {
    const pageSize = req.query.ps ? Number(req.query.ps) : globalPageSize
    const pageNumber = req.query.pn ? Number(req.query.pn) : 0
    const filter = { type: { $ne: 'Enfant' } }

    if (req.query.n) {
      const text = req.query.n
      const textFilter = { ...filter, $text: { $search: text } }
      const regexFilter = { ...filter, title: { $regex: new RegExp(`${text}.*`, 'gi') } }

      let results = await search(textFilter, pageNumber, pageSize)
      if (results.length === 0) {
        results = await search(regexFilter, pageNumber, pageSize)
      }
      res.send(results)
    }
  },
)

router.get('/:_id', (req, res) => {
  const _id = objectId(req.params._id)
  properties.findOne({ _id })
    .then((property) => res.send(property))
    .catch(debug)
})

module.exports = router
