const express = require('express')
const app = express()
const cors = require('cors')
const port = 4000

const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose
	.connect(`mongodb+srv://${process.env.LOGIN}:${process.env.PASSWORD}@cluster0.cxq1a.azure.mongodb.net/efficient_meal`, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('DB Connection succesful!'))

const menu = new Schema({
  name: String,
  price: String,
  calories: String,
  efficiency: Number,
  url: String,
})

const Item = mongoose.model('mcdonalds_menu', menu)

Item.find().exec().then(docs => {
	app.use(cors())
	
	app.get('/', (req, res) => {
		res.send(docs)
	})
	
	app.listen(port, () => {
		console.log(`App listening at http://localhost:${port}`)
	})
}).catch(err => console.log(err))

