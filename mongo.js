const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('enter password , name and number ');
  process.exit(1)
}


const password = process.argv[2]

const url =
  `mongodb+srv://mohammedfathyzaky:${password}@cluster0.krh16.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`


mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    id: String,
    name: String,
    number: String
  })
  
const Person = mongoose.model('Person', personSchema)

if(process.argv.length==3){
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person)
        })
        mongoose.connection.close()
      })  
}

else{
    if(process.argv.length<5){
        console.log("enter a number");
        process.exit(1);
    }
    const person = new Person({
        id: String(Math.floor(Math.random() * (10000 - 1 + 1)) + 1),
        name: process.argv[3],
        number: process.argv[4]
      })
      
      person.save().then(result => {
        console.log('note saved!')
        mongoose.connection.close()
      })
}


