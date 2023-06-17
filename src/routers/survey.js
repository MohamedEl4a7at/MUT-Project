const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Survey = require('../models/survey')

router.post('/addSurvey',auth.momAuth,async(req,res)=>{
    try{
        const survey = new Survey({...req.body,patient:req.mom._id})
        await survey.save()
        res.status(200).send({message:"Thank You",survey})
    }catch(err){
        return res.status(400).send({error:err.message})
    }

})

module.exports = router