    const express = require('express')
    const router = express.Router()
    const Mom = require('../models/mom')
    const auth = require('../middelware/auth')

    /////////////////////signup
    router.post('/signup',async(req,res)=>{
        try{
            const mom = new Mom(req.body)
            await mom.save()
            const token = mom.generateToken()
            res.status(200).send({mom,token})
            
        }
        catch(e){
            // console.log('wrong')
            res.status(400).send(e.message)
        }
    })


    //////////////////////login
    router.post('/login',async(req,res)=>{
        try{
            const mom = await Mom.findByCredentials(req.body.email,req.body.password)
            const token = mom.generateToken()
            res.status(200).send({mom,token})
        }
        catch(e){
            res.status(400).send(e.message)
        }
    })


//////////////////get profile
router.get('/profile',auth.momAuth,(req,res)=>{
    res.send(req.mom)
})

/////////////////update proile
router.patch('/profile',auth.momAuth,async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
    updates.forEach((el)=>{
        req.mom[el] = req.body[el] 
    })
    await req.mom.save()
    res.status(200).send(req.mom)
}
catch(e){
    res.status(400).send(e.message)
}
})
////////////////delete profile
router.delete('/profile',auth.momAuth,(req,res)=>{
    req.mom.delete()
    res.status(200).send('deleted')
})
module.exports = router