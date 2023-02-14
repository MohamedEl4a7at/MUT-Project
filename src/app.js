const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT
require('./db/mongoose')
app.use(express.json())
const momRouter = require('./routers/mom')
const newsRouter = require('./routers/news')
const adminRouter = require('./routers/admin')
app.use(momRouter)
app.use(newsRouter)
app.use(adminRouter)
app.listen(port,()=>{
    console.log('Server is running')
})