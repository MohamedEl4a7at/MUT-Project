const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Contact = require('../models/contactUs')

router.post('/contactUs',auth.momAuth,async(req,res)=>{
    try{
        const report = new Contact({...req.body,patient:req.mom._id})
        await report.save()
        res.status(201).send({message:'report submitted',report})
    }catch(err){
        res.status(400).send(err)
    }
})


module.exports = router