var express = require('express')
var router = express.Router()
var { col, objectId } = require('../db')
var persons = col(process.env.PERSONS_COLLECTION_NAME)
var debug = require('debug')('api:persons')

const globalPageSize = Number(process.env.PAGE_SIZE)
const projection = { name: 1, birth: 1, death: 1 }

const getFilter = req => {
  const filter = {}

  if (req.query.n) {
    const text = req.query.n
    filter.$text = { $search: text }
  }

  const birthBefore = req.query.bb && new Date(req.query.bb)
  const birthAfter = req.query.ba && new Date(req.query.ba)
  if (birthAfter || birthBefore) {
    filter.birth = {}
    birthAfter && (filter.birth.$gt = birthAfter)
    birthBefore && (filter.birth.$lt = birthBefore)
  }

  if (req.query.pid) {
    filter[`properties._id`] = objectId(req.query.pid)
  }
  return filter
}

router.get('/count', (req, res) => {
  const filter = getFilter(req)
  persons.countDocuments(filter)
    .then((count) => res.send({count}))
    .catch(debug)
})

router.get('/', (req, res) => {
  const pageSize = req.query.ps ? Number(req.query.ps) : globalPageSize
  const pageNumber = req.query.pn ? Number(req.query.pn) : 0
  const filter = getFilter(req)

  persons
    .find(filter, { projection })
    .sort({ birth: 1 })
    .skip(pageNumber * pageSize)
    .limit(pageSize)
    .toArray()
    .then((persons) => res.send(persons))
    .catch(debug)
})

router.get('/:_id', (req, res) => {
  const _id = objectId(req.params._id)
  persons.findOne({ _id })
    .then((person) => res.send(person))
    .catch(debug)
})

module.exports = router
