require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')

const NumberInfo = require('./modules/numberInfo')

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

app.use(express.json())

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))

app.use(express.static('build'))

const persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  NumberInfo.find({}).then(infos => {
    res.json(infos)
  })
})

app.get('/info', (req, res) => {
  NumberInfo.find({})
    .then(infos => {
      const info =
        '<div><p>Phonebook has info for ' + infos.length + ' people</p><p>' + new Date() + '</p></div>'

      res.send(info)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
  NumberInfo.findById(req.params.id)
    .then(info => {
      res.json(info)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  NumberInfo.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
  const person = req.body

  if (!person.name || !person.number) {
    res.status(422).end('must have number and name')
  } else if (persons.find(p => p.name === person.name)) {
    res.status(422).end('name must be unique')
  } else {
    const numberInfo = new NumberInfo({
      name: person.name,
      number: person.number
    })

    numberInfo.save().then(savedInfo => {
      res.json(savedInfo)
    })
  }
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
