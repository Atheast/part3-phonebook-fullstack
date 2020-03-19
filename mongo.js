const mongoose = require('mongoose')

if(process.argv.length < 3) {
  console.log('give passsword as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0-w3cwn.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person',personSchema)

if(process.argv.length === 3) {
  Person.find({}).then(persons => {
    console.log('phonebook')
    persons.forEach(x => console.log(x.name,x.number))
    mongoose.connection.close()
  })
} else {
  const person = new Person ({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(() => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}