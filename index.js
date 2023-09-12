require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')

const NumberInfo = require('./modules/numberInfo')

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

let persons = [
  { 
    "name": "Arto Hellas", 
    "number": "040-123456",
    "id": 1},
  { 
    "name": "Ada Lovelace", 
    "number": "39-44-5323523",
    "id": 2
  },
  { 
    "name": "Dan Abramov", 
    "number": "12-43-234345",
    "id": 3
  },
  { 
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122",
    "id": 4
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
  NumberInfo.find({}).then(infos => {
    let info =
    '<div><p>Phonebook has info for ' + infos.length + ' people</p><p>' + new Date() +'</p></div>'

  res.send(info)
  })
})

app.get('/api/persons/:id', (req, res) => {
  NumberInfo.findById(req.params.id).then(info => {
    res.json(info)
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
