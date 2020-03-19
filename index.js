require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./modules/person')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
morgan.token('data',(req) => {
  return JSON.stringify(req.body)
})
app.use(morgan((tokens,req,res) => {
  if(tokens.method(req, res) === 'POST') {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.data(req)
    ].join(' ')
  } else {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')
  }
}))

app.get('/api/persons',(req,res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(note => note.toJSON()))
  })
})

app.get('/info',(req,res) => {
  Person.find({}).then(persons => {
    res.end(`Phonebook has info for ${persons.length} people \n\n${new Date()}`)
  })
})

app.get('/api/persons/:id', (req,res,next) => {
  Person.findById(req.params.id)
    .then(person => {
      res.json(person.toJSON())
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (req,res,next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      return res.status(204).end()
    })
    .catch(err => next(err))
})

app.post('/api/persons',(req,res,next) => {
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson.toJSON())
    })
    .catch(err => next(err))
})

app.put('/api/persons/:id',(req,res,next) => {
  Person.findByIdAndUpdate(req.params.id,req.body,{ new: true })
    .then(person => {
      res.json(person.toJSON())
    })
    .catch(err => next(err))
})

const unknowEndpoint = (req,res) => {
  res.status(404).send({ error: 'unknow endpoint' })
}

app.use(unknowEndpoint)

const errorHandler = (err,req,res,next) => {
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT,() => {
  console.log(`App is listining on ${PORT} port`)
})