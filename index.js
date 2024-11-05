const express = require('express');
const app=express();
const fs = require('fs');
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const path= './data.json';
const date=new Date();
app.use(express.json());
function update_data(data){
    fs.writeFile(path, JSON.stringify(data), 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data written successfully!');
    });
}
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
        response.json(person);
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
    console.log(persons.filter((person)=>person.id!=id));
    update_data(persons.filter((person)=>person.id!=id));
    response.json(persons.filter((person)=>person.id!=id));
    }
    else{
        response.status(404).send('no person with this id');
    }
    
})
app.get('/api/persons', (request, response) => {
    const jsondata = fs.readFileSync(path, 'utf8'); 
    const persons = JSON.parse(jsondata); 
    response.json(persons);
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
            response.json(new_person);
            break;
        }
    }
    
    if(!toogle){
        response.status(405).send("the phonebook is really crowded try again");
    }
    }
    
    
});
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})