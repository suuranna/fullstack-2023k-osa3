const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://suuranna:${password}@cluster0.wfno6.mongodb.net/?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const numberInfoSchema = new mongoose.Schema({
  name: String,
  number: String
})

const NumberInfo = mongoose.model('NumberInfo', numberInfoSchema)

const name = process.argv[3]
const number = process.argv[4]

if (name === undefined || number === undefined) {
  console.log('phonebook:')
  NumberInfo.find({}).then(result => {
    result.forEach(numberinfo => {
      console.log(numberinfo.name, numberinfo.number)
    })
    mongoose.connection.close()
  })
} else {
  const numberInfo = new NumberInfo({
    name,
    number
  })

  numberInfo.save().then(result => {
    console.log('added', name, number, 'to phonebook')
    mongoose.connection.close()
  })
}
