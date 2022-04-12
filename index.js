const http = require('http')
const cors = require('cors')

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2022-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2022-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2022-05-30T19:20:14.298Z",
    important: true
  }
]

//const app = http.createServer((request, response) => {
//  response.writeHead(200, { 'Content-Type': 'application/json' })
//  response.end(JSON.stringify(notes))
//})

const express = require('express')
const app = express()
app.use(express.json())

app.use(cors())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)


const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.get('/', (request, response) =>{
  response.send('Hello world...')
})

app.get('/api/notes', (request, response) =>{
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)

  const note = notes.find(note => {
    //console.log(note.id, typeof note.id, id, typeof id, note.id === id)
    return note.id === id
  })

  if (note)
    response.json(note)
  else
    response.status(404).end('badbadbad') //https://stackoverflow.com/questions/14154337/how-to-send-a-custom-http-status-message-in-node-express/36507614#36507614
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)

  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const body = request.body
  console.log('POST..........')

  if (!body.content) {
    return response.status(400).json({
      error: 'bad data'
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)
  response.json(note)  
})


app.put('/api/notes/:id', (request, response) => {
  const body = request.body
  const id = Number(body.id)

  if (!body.content) {
    return response.status(400).json({
      error: 'bad data'
    })
  }

  const updatedNotes = []

 for (let i=0; i < notes.length; i ++) 
   if (notes[i].id !== id)
     updatedNotes.push(notes[i])
   else
     updatedNotes.push(body)

  notes = updatedNotes
  response.json(body)  
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

//INTERNAL: 
//const PORT = 3001 
//app.listen(PORT)
//console.log(`Server is running on ${PORT}`)

//FOR HEROKU:
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})