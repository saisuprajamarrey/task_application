const express = require('express')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('../src/routers/userRouter')
const taskRouter = require('../src/routers/taskRouter')
require('./db/mongoose')

const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})