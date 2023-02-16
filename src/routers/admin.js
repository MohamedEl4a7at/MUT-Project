const express = require('express')
const router = express.Router()
const Admin = require('../models/admin')
const auth = require('../middelware/auth')
const multer = require('multer')
/////////////////////signup
///////////////////without image
// router.post('/adminSignUp',async(req,res)=>{
//     try{
//         const admin = new Admin(req.body)
//         await admin.save()
//         const token = admin.generateToken()
//        res.status(200).send({admin,token})
//     }
//     catch(e){
//         res.status(400).send(e)
//     }
// })
//////////////////////with image
const upload = multer({
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('Please upload image'),null)
        }

        cb(null,true)
    }
})

router.post('/adminSignUp',upload.single('image'),async(req,res)=>{
    try{
        const admin = new Admin(req.body)
        admin.image = req.file.buffer
        if(admin.roles!=='admin'){
            throw new Error('not admin')
        }
        await admin.save()
        const token = admin.generateToken()
        res.status(200).send({admin,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
//////////////////////////////login
router.post('/adminLogin',async(req,res)=>{
    try{
        const admin = await Admin.findByCredentials(req.body.email,req.body.password)
        const token = admin.generateToken()
        res.status(200).send({admin,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
/////////////////////////////////////profile
router.get('/adminProfile',auth.adminAuth,auth.requiresAdmin,(req,res)=>{
    res.send(req.admin)
})
////////////////////////////////////////update
router.patch('/adminProfile',auth.adminAuth,auth.requiresAdmin,async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
        updates.forEach((el)=> req.admin[el] = req.body[el] )
        await req.admin.save()
        res.status(200).send(req.admin)
    }
    catch(e){
        res.status(400).send(e)
    }
})
///////////////////////////////////delete
router.delete('/adminDelete',auth.adminAuth,auth.requiresAdmin,async(req,res)=>{
    try{
        const _id = req.admin._id
        const admin = await Admin.findByIdAndDelete(_id)
        ///// We can remove this condition
        if(!admin){
            return res.status(404).send('Not Found')
        }
        res.status(200).send('Deleted')
    }
    catch(e){
        res.status(400).send(e)
    }
})
module.exports = router
