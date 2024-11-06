const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app=express();
const fs = require('fs');
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const path= './data.json';
const date=new Date();
const corsOptions = {
    origin: 'http://localhost:5173',
};
morgan.token('response-body', (req, res) => {
    return JSON.stringify(res.json) || ''; // Return the captured response body as a string
});


const id_error = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send( 'malformatted id' )
    } 
    next(error)
  }
const fetch_error= (request, response,next) => {
    response.status(400).send( 'error with database' )
    next(error)
}
  const unknownEndpoint = (request, response) => {
    response.status(404).send( 'unknown endpoint' )
  }
const Person = require('./modules/mongodb');

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('dist'))
app.use((req, res, next) => {
    // Store original res.json method
    const originalJson = res.json;

    // Create a variable to hold the response body
    res.responseBody = null;
    // Override res.json method
    res.json = function (body) {
        if(body.security=='classfied'){
            res.responseBody={data:'classfied'};
        }
        else{
            console.log(body.security);
            res.responseBody = body.data; // Store the body
        }
        return originalJson.call(this, body.data); // Call the original res.json method
    };

    next();
});
// Define a custom token for the response body
morgan.token('response-body', (req, res) => {
    return JSON.stringify(res.responseBody) || ''; // Return the captured response body as a string
});
const customFormat = ':method :url :status :response-time ms :response-body';
// Use Morgan with the custom format
app.use(morgan(customFormat));

app.get('/info',(request,response)=>{
    /*
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    const current_time=[date.getFullYear(),date.getMinutes(),date.getSeconds()].join(':');
    const current_date=`${days[date.getDay()]} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()} ${current_time} GMT${date.getTimezoneOffset()}`
    const message=`<p>Phonebook has info for ${persons.length} people</P> <p>${current_date}</P>`;
    response.send(message);
    */

   const current_time=[date.getFullYear(),date.getMinutes(),date.getSeconds()].join(':');
   const current_date=`${days[date.getDay()]} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()} ${current_time} GMT${date.getTimezoneOffset()}`
   Person.find({}).then(persons => {
    const message=`<p>Phonebook has info for ${persons.length} people</P> <p>${current_date}</P>`;
    response.send({data:message,security:'valid'});
    }).catch(error=>{
    next(error);
     }) 
  
   
});
app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id).then(person => {
        if(person){
            response.json({data:person,security:'vaild'});
        }
        else{
            console.log("what");
            response.status(404).send('no person with this id');
        }
      }).catch(error=>{
        next(error);
      })
});
app.delete('/api/persons/:id', (request, response) => {
  
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      if(result){
        response.status(204).end()
      }
      else{
        response.status(404).send('no person with this id');
      }
    })
    .catch(error =>  next(error))
    
})
app.get('/api/persons', (request, response,next) => {

    Person.find({}).then(result => {
        response.json({data:result,security:'classfied'});
      }) .catch(error=>{
        next(error);
      }) 
});

app.post('/api/persons', (request, response) => {
    const {name,number}=request.body;
    console.log(request.body);
    const person = new Person({
        name: name,
        number: number
      })
      person.save().then(result => {
        console.log('note saved!')
        response.json({data:result,security:'valid'});
      }).catch(error=>{
        console.log(error);
      })
    
    
});
app.put('/api/persons/:id', (request,response,next) =>{
    const {name,number}=request.body;
    console.log(request.body);
    const person ={
        name:name,
        number:number
    }
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(new_person => {
      response.json({data:new_person})
    })
    .catch(error => next(error))
})
app.use(unknownEndpoint);
app.use(id_error);
app.use(fetch_error);
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})