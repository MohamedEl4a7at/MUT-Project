const express = require('express')
const router = express.Router()
const Doctor = require('../models/doctor')
const auth = require('../middelware/auth')
const multer = require('multer')
const Admin = require('../models/admin')

const upload = multer({
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('Please upload image'),null)
        }

        cb(null,true)
    }
})
// upload 2 photos with 2 different property (image,certificate) 
// we use array for multi photos for seme property
//signUp
 const cpUpload = upload.fields([{ name: 'image'},{ name: 'professionCertificate'}])

router.post('/doctorSignUp',cpUpload,async(req,res)=>{
    try{
        const doctor = new Doctor(req.body)
        // req.files for 2 different property
         doctor.image = req.files['image'][0].buffer
         doctor.professionCertificate = req.files['professionCertificate'][0].buffer
        await doctor.save()
        const token = doctor.generateToken()
        res.status(200).send({doctor,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
// add doctor data
router.post('/doctorData',auth.doctorAuth,async(req,res)=>{
    try{
        const data = Object.keys(req.body)
        data.forEach((el)=>req.doctor[el] = req.body[el])
        await req.doctor.save()
        res.status(200).send(req.doctor)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

//another way but still missing something
// router.post('/doctorData',auth.doctorAuth,async(req,res)=>{
//     try{
//         req.doctor.previousExperience = req.body.previousExperience
//         req.doctor.biography = req.body.biography
//         await req.doctor.save()
//         res.status(200).send(req.doctor)
//     }
//     catch(e){
//         res.status(400).send(e.message)
//     }
// })

///login
router.post('/doctorLogin',async(req,res)=>{
    try{
        const doctor = await Doctor.findByCredentials(req.body.email,req.body.password)
        const token = doctor.generateToken()
        res.status(200).send({doctor,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

////////profile
router.get('/doctorProfile',auth.doctorAuth,(req,res)=>{
    res.status(200).send(req.doctor)
})

///////update
router.patch('/doctorProfile',auth.doctorAuth,async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
        updates.forEach((el)=>req.doctor[el] = req.body[el])
        await req.doctor.save()
        res.status(200).send(req.doctor)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

//////////delete
router.delete('/doctorProfile',auth.doctorAuth,async(req,res)=>{
    try{
        const _id = req.doctor._id
        const doctor = await Doctor.findByIdAndDelete(_id)
        ///// We can remove this condition
        if(!doctor){
            return res.status(404).send('Not Found')
        }
        res.status(200).send('Deleted')
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
module.exports = router