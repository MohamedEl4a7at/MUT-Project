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
router.post('/doctorLogin',async(req,res)=>{
    try{
        const doctor = await Doctor.findByCredentials(req.body.email,req.body.password)
        if(!doctor.verified){
            let verifyToken = await Token.findOne({userId:doctor._id})
            if(!verifyToken){
                verifyToken = await new Token({
                    userId:doctor._id,
                    token:crypto.randomBytes(32).toString("hex")
                }).save()
            }
            const url = `${process.env.BASE_URL}/doctors/${doctor._id}/verify/${verifyToken.token}`
            await sendEmail(doctor.email,"Verify Email",url)
            res.status(200).send({message:"An Email sent to your account please verify",doctor})
        }else{
        const token = doctor.generateToken()
        res.status(200).send({doctor,token})
        }
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

// add free appointments
// router.post('/freeAppointments',auth.doctorAuth,async(req,res)=>{
//     try{
//     const doctor = await Doctor.findById(req.doctor._id);
//     // await doctor.updateOne({$push: {availableAppointments: req.body.freeAppointments}});
//     await doctor.addAppointment(req.body.freeAppointments)
//     // await doctor.find({ "availableAppointments": "2023-05-06 5:00" }, (err, docs) => {
//     //     if (err) {
//     //       console.error(err);
//     //     } else {
//     //       console.log(docs);
//     //     }
//     //   });
//     await doctor.save();
//     res.status(200).send(doctor)
//     }
//     catch(e){
//         res.status(400).send(e)
//     }
// })
// update appointments
// router.patch('/updateAppointments',auth.doctorAuth,async(req,res)=>{
//     const doctor = await Doctor.findById(req.doctor._id);
//     const updates = req.body.date
//     doctor.availableAppointments.forEach((el)=>doctor.availableAppointments[el])

    
// })

//delete appointments
// get all 
// router.get('/allAppointments',auth.doctorAuth,async(req,res)=>{
//     try{
//         const doctor = await Doctor.findById(req.doctor._id);
//         res.status(200).send(doctor.availableAppointments)
//         // console.log(doctor.availableAppointments[0])
//     }
//     catch(e){
//         res.status(400).send(e)
//     }

// })
// router.patch('/updateAppointment',auth.doctorAuth,async(req,res)=>{
//     try{
//         const doctor = await Doctor.findOneAndUpdate({"availableAppointments._id":req.body._id},{
//             "$set":{
//                 "availableAppointments.$.date":req.body.date
//             }
//         },{new:true});
//         // // console.log(availableApp)
//         await doctor.save()
//     //    const dd =  doctor.forEach((el)=>{el.find(_id = req.body._id)})
//     //    doctor.find().forEach( function(myDoc) { print( "user: " + myDoc.name ); } );
//         // const index = await Doctor.find({ $indexOfArray: ['$availableAppointments', req.body._id] !== -1 });
//         // await Doctor.findOne({ "availableAppointments._id":req.body._id }, (err, doctor) => {
//         //     if (err) {
//         //       console.log(err);
//         //     } else {
//         //         // console.log(doctor)
//         //       doctor.availableAppointments.forEach((appointment) => {
//         //         if(appointment._id == req.body._id){
//         //             if(appointment.reserved){
//         //                 console.log(appointment)
//         //             }
//         //         }
//         //       });
//         //     }
//         //   });
          

//         // console.log(dd)
//         // console.log(doctor.availableAppointments[0])
//         res.status(200).send(doctor)
//     }
//     catch(err){
//         res.status(400).send(err)
//     }
// })
module.exports = router