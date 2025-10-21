import express from "express";
import "dotenv/config";
import logger from "./logger.js";
import morgan from "morgan";
 


const app = express();
const port = process.env.PORT || 8000;

const morganFormat = ":method :url :status :response-time ms";


app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);



// a simple crud app using express 

app.use(express.json())

let data = []
let nextId = 1

// create

app.post('/tea', (req, res) => {
    const { name, price } = req.body
    const newTea = { id: nextId++, name, price }
    data.push(newTea)
    res.status(201).send(newTea)
})

// read

app.get('/teas', (req, res) => {
    res.status(200).send(data)
})

//read through index

app.get('/teas/:id', (req, res) => {
    const tea = data.find(t => t.id === parseInt(req.params.id)) // if user send any kind of data through url we can get it through the req.params
    if (!tea) {
        return res.status(404).send("tea not found")
    }
    res.status(200).send(tea)

})

// update 


app.put('/teas/:id', (req, res) => {
    const tea = data.find(t => t.id === parseInt(req.params.id))
    if (!tea) {
        return res.status(404).send("tea not found")
    }
    const { name, price } = req.body
    tea.name = name
    tea.price = price
    res.status(200).send(tea)
})

//delete

app.delete('/teas/:id', (req, res) => {
    const index = data.findIndex(t => t.id === parseInt(req.params.id))
    if (index === -1) {
        return res.status(404).send("tea not found")
    } data.splice(index, 1)
        return res.status(204).send("Deleted")
})



app.listen(port, () => {
    console.log(`server is Running at:  ${port}...`)
})
