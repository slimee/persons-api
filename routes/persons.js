var express = require('express')
var router = express.Router()
var { col, objectId } = require('../db')
var persons = col(process.env.PERSONS_COLLECTION_NAME)
var debug = require('debug')('api:persons')

const globalPageSize = Number(process.env.PAGE_SIZE)
const projection = { name: 1, birth: 1, death: 1 }

const getDateFilter = (term) => {
  const [, symbol, year] = term.split(':')
  const date = new Date(year)
  const dateNext = new Date((Number(year) + 1) + '')
  switch (symbol) {
    case '=':
      return { $gt: date, $lt: dateNext }
    case '<':
      return { $lt: dateNext }
    case '>':
      return { $gt: date }
  }
}

const getFilter = req => {
  const filter = {}

  if (req.query.n) {
    if (req.query.n.startsWith('born:') || req.query.n.startsWith('ne:') || req.query.n.startsWith('né:')) {
      filter.birth = getDateFilter(req.query.n)
    } else if (req.query.n.startsWith('death:') || req.query.n.startsWith('mort:') || req.query.n.startsWith('morte:')) {
      filter.death = getDateFilter(req.query.n)
    } else {
      const text = req.query.n
      filter.$text = { $search: `\"${text}\"` }
    }
  }

  if (req.query.pid) {
    filter[`properties._id`] = objectId(req.query.pid)
  }
  return filter
}

router.get('/count', (req, res) => {
  const filter = getFilter(req)
  persons.countDocuments(filter)
    .then((count) => res.send({ count }))
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
