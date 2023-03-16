const express = require('express')
const router = express.Router()
const Doctor = require('../models/doctor')
const auth = require('../middelware/auth')
const multer = require('multer')
const Token = require('../models/token')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')
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
/////////////////////////signUp with Email verification
 const cpUpload = upload.fields([{ name: 'image'},{ name: 'professionCertificate'}])

router.post('/doctorSignUp',cpUpload,async(req,res)=>{
    try{
        let doctor = await Doctor.findOne({email:req.body.email})
        if(doctor){
            res.status(409).send({message:"User with given email already exist"})
        }else{
         doctor = new Doctor(req.body)
        // req.files for 2 different property
        if(req.body.password !== req.body.confirmPassword){
            throw new Error('password does not match')
        }else{
         doctor.image = req.files['image'][0].buffer
         doctor.professionCertificate = req.files['professionCertificate'][0].buffer
        await doctor.save()
        }
        const token = await new Token({
            userId:doctor._id,
            token:crypto.randomBytes(32).toString("hex")
        }).save();
        const url = `${process.env.BASE_URL}/doctors/${doctor._id}/verify/${token.token}`
        await sendEmail(doctor.email,"Verify Email",url)
        res.status(200).send({message:"An Email sent to your account please verify",doctor})
    }}
    catch(e){
        res.status(400).send(e.message)
    }
})
/////////////////////Verify token
router.get('/doctors/:id/verify/:token',async(req,res)=>{
    try{
        const doctor = await Doctor.findById(req.params.id);
        if(!doctor) return res.status(400).send({message:"Invalid Link Or Expired"});

        const token = await Token.findOne({
            userId:doctor._id,
            tokrn:req.params.token
        })
        if(!token) return res.status(400).send("Invalid Link Or Expired");
        
        await Doctor.updateOne({_id:doctor._id,verified:true});
        await token.remove()

        res.status(200).send({message:"Email verified successfully"});
    }
    catch(error){
        res.status(500).send({message:"Internal Server Error"})
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
// router.post('/doctorLogin',async(req,res)=>{
//     try{
//         const doctor = await Doctor.findByCredentials(req.body.email,req.body.password)
//         if(!doctor.verified){
//             const verifyToken = await Token.findOne({userId:doctor._id});
//             if(!verifyToken){
//                 verifyToken = aw
//             }
//         }
//         const token = doctor.generateToken()
//         res.status(200).send({doctor,token})
//     }
//     catch(e){
//         res.status(400).send(e.message)
//     }
// })

////////profile
router.get('/doctorProfile',auth.doctorAuth,(req,res)=>{
    res.status(200).send(req.doctor)
})

///////update
router.patch('/doctorProfile',auth.doctorAuth,cpUpload,async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
        updates.forEach((el)=>req.doctor[el] = req.body[el])
        if(req.files['image'] && !req.files['professionCertificate']){
            req.doctor.image = req.files['image'][0].buffer
        }else if(!req.files['image'] && req.files['professionCertificate'] ){
            req.doctor.professionCertificate = req.files['professionCertificate'][0].buffer
        }else if(req.files['image'] && req.files['professionCertificate']){
            req.doctor.image = req.files['image'][0].buffer
            req.doctor.professionCertificate = req.files['professionCertificate'][0].buffer
        }
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