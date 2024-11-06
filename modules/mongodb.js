const mongoose = require('mongoose')

const url =process.env.MONGODB_URI

mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(result => {
    console.log(result)
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function(value) {
        const phone_regex=/^\d{2,3}-\d+$/
        return phone_regex.test(value)
      },
      message: 'invlaid phone number form'
    }
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
