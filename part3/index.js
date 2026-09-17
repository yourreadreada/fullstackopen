const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.json())

// Custom morgan token for HTTP POST body payload (Exercise 3.8)
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

// Configure morgan logging (Exercise 3.7 & 3.8)
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

let persons = [
  { 
    id: '1',
    name: 'Arto Hellas', 
    number: '040-123456'
  },
  { 
    id: '2',
    name: 'Ada Lovelace', 
    number: '39-44-5323523'
  },
  { 
    id: '3',
    name: 'Dan Abramov', 
    number: '12-43-234345'
  },
  { 
    id: '4',
    name: 'Mary Poppendieck', 
    number: '39-23-6423122'
  }
]

// Exercise 3.1: Get all persons
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

// Exercise 3.2: Info page
app.get('/info', (req, res) => {
  const count = persons.length
  const currentTime = new Date()
  res.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${currentTime}</p>
  `)
})

// Exercise 3.3: Get single person
app.get('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const person = persons.find(p => p.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

// Exercise 3.4: Delete person
app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(p => p.id !== id)
  res.status(204).end()
})

// Exercise 3.5 & 3.6: Add person with random id and validation
app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'name or number is missing' 
    })
  }

  const nameExists = persons.some(
    p => p.name.toLowerCase() === body.name.trim().toLowerCase()
  )

  if (nameExists) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const newId = String(Math.floor(Math.random() * 1000000000))

  const person = {
    id: newId,
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  res.json(person)
})

// Unknown endpoint fallback
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
