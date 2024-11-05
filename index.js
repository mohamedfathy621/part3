const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
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
app.use(express.json());
app.use(cors(corsOptions));
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
function update_data(data){
    fs.writeFile(path, JSON.stringify(data), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('JSON data written successfully!');
    });
}
// Use Morgan with the custom format
app.use(morgan(customFormat));
app.get('/info',(request,response)=>{
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    const current_time=[date.getFullYear(),date.getMinutes(),date.getSeconds()].join(':');
    const current_date=`${days[date.getDay()]} ${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')} ${date.getFullYear()} ${current_time} GMT${date.getTimezoneOffset()}`
    const message=`<p>Phonebook has info for ${persons.length} people</P> <p>${current_date}</P>`;
    response.send(message);
});
app.get('/api/persons/:id', (request, response) => {
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    const id=request.params.id;
    const person=persons.find(person=>person.id==id);
    console.log("what");
    if(person){
        response.json({data:person,security:'vaild'});
    }
    else{
        console.log("what");
        response.status(404).send('no person with this id');
    }
});
app.delete('/api/persons/:id', (request, response) => {
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    const id=request.params.id;
    const person=persons.find(person=>person.id==id);
    if(person){
    update_data(persons.filter((person)=>person.id!=id));
    response.json({data:person,security:'valid'});
    }
    else{
        response.status(404).send('no person with this id');
    }
    
})
app.get('/api/persons', (request, response) => {
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    response.json({data:persons,security:'classfied'});
});
app.post('/api/persons', (request, response) => {
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    const {name,number}=request.body;
    const check = persons.find(person=>person.name==name);
    if(check||(name.length==0||number.length==0)){
        response.status(405).send(check?"name already taken":"please enter the name and the number");
        console.log('error occuerd');
    }
    else{
    var toogle=false;
    for(var i=0;i<100;i++){
        const id =Math.floor(Math.random() * (100000 - 100 + 1)) + 100;
        const person=persons.find(person=>person.id==id);
        if(!person){
            const new_person={...request.body,id:id};
            toogle=true;
            update_data(persons.concat(new_person));
            response.json({data:new_person,security:'valid'});
            break;
        }
    }
    
    if(!toogle){
        response.status(405).send("the phonebook is really crowded try again");
    }
    }
    
    
});
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})