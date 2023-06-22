    const express = require('express')
    const router = express.Router()
    const Mom = require('../models/mom')
    const auth = require('../middleware/auth')
    const multer = require('multer')
    const OTP = require('../models/otp')
    const sendEmail = require('../utils/sendEmail')
    // const crypto = require('crypto')
    const Doctor = require('../models/doctor')
    const randomstring = require('randomstring');
    // const Joi = require('joi')

    /////////////////////signup with Email Verification
    router.post('/momSignUp',async(req,res)=>{
        try{
            let mom = await Mom.findOne({email:req.body.email})
            if(mom){
                res.status(409).send({message:"User with given email already exist"})
            }else{
             mom = new Mom(req.body)
            if(req.body.password !== req.body.confirmPassword){
                throw new Error('password does not match')
            }else{
            await mom.save();
            }
            // const otp = randomstring.generate({
            //     length: 4,
            //     charset: 'numeric'
            //   });
            const otp = await new OTP({
                userId:mom._id,
                otp:randomstring.generate({
                    length: 4,
                    charset: 'numeric'
                  })
            }).save();

            // const url = `${process.env.BASE_URL}/users/${mom._id}/verify/${token.token}`
            await sendEmail(mom.email,"Verify Email",`Your verification OTP is: ${otp.otp}`)
            res.status(200).send({message:"An Email sent to your account please verify",mom})
            
        }}
        catch(e){
            res.status(400).send({"message":e.message})
        }
    })

    /////////////////////////////////Verify OTP
    router.post('/users/:id/verify',async(req,res)=>{
        try{
            const mom = await Mom.findById(req.params.id);
            if(!mom) return res.status(400).send({message:"User Not Found"});

            const otp = await OTP.findOne({
                userId:mom._id,
                otp:req.body.otp
            });
            if(!otp) return res.status(400).send({message:"Invalid OTP Or Expired"});

            await Mom.updateOne({_id:mom._id},{ $set :{"verified":true}});
            await otp.remove()

            res.status(200).send({message:"Email verified successfully"})
        } catch(error){
            res.status(500).send({message:"Internal Server Error",error})
            console.log(error)
        }
    })

    //////////////////////////////// add photo
    const storage = multer.diskStorage({
        destination:  (req, file, cb)=> {
          cb(null, 'uploads/')
        },
        filename:  (req, file, cb)=> {
          cb(null, Date.now() + '-' + file.originalname)
        }
      })
      
      const upload = multer({
        fileFilter(req,file,cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
                return cb(new Error('Please upload a valid image'),null)
            }
            //accept file
            cb(null,true)
        }
    , storage: storage })

    // router.post('/momSignUp',upload.single('image'),async(req,res)=>{
    //     try{
    //         const mom = new Mom(req.body)
    //         mom.image = req.file.buffer
    //         await mom.save()
    //         const token = mom.generateToken()
    //         res.status(200).send({mom,token})
    //     }
    //     catch(e){
    //         res.status(400).send(e.message)
    //     }
    // })

    router.patch('/momImage',auth.momAuth,upload.single('image'),async(req,res)=>{
        try{
            req.mom.image = "https://mut-project.onrender.com/" + req.file.path
            await req.mom.save()
            res.status(200).send(req.mom)
        }
        catch(e){
            res.status(400).send(e.message)
        }
    })
    //////////////////////login
    router.post('/login',async(req,res)=>{
        try{
            const mom = await Mom.findByCredentials(req.body.email,req.body.password)
            if(!mom.verified){
                let verifyOtp = await OTP.findOne({userId:mom._id});
                if(!verifyOtp){
                    verifyOtp = await new OTP({
                        userId:mom._id,
                        otp:randomstring.generate({
                            length: 4,
                            charset:'numeric'
                        })
                    }).save();
                }
                // const url = `${process.env.BASE_URL}/users/${mom._id}/verify/${verifyToken.token}`
                await sendEmail(mom.email,"Verify Email",`Your verification OTP is: ${verifyOtp.otp}`)
                res.status(400).send({message:"An Email sent to your account please verify"});
            }else{
            const token = mom.generateToken()
            res.status(200).send({mom,token})
            }
        }
        catch(e){
            res.status(400).send({"message":e.message})
        }
    })


//////////////////get profile
router.get('/profile',auth.momAuth,(req,res)=>{
    res.send(req.mom)
})

/////////////////update proile
router.patch('/profile',auth.momAuth,upload.single('image'),async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
    updates.forEach((el)=>{
        req.mom[el] = req.body[el] 
    })
    if(req.file){
        req.mom.image = "https://mut-project.onrender.com/" + req.file.path
        };
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

/////////////// forget password
// router.patch('/momPassword',async(req,res)=>{
//     try{
//         const mom = await Mom.findByInputs(req.body.email,req.body.secretQuestion,req.body.secretAnswer)
//         // if(req.body.password !== req.body.confirmPassword){
//         //     throw new Error('password does not match')
//         // }else{
//         //     mom.password = req.body.password
//         //    await mom.save()
//         //     const token = mom.generateToken()
//         //     res.status(200).send({mom,token})
//         // }
//         res.send(mom)
//     }
//     catch(e){
//         res.status(400).send(e.message)
//     }
// })
////////////////////////////////////////reset password
router.post('/resetPassword',async(req,res)=>{
    try{
        // const schema = Joi.object({ email: Joi.string().email().required() });
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);
        const mom = await Mom.findOne({email:req.body.email})
        if(!mom){
            return res.status(400).send("Email Not Found")
        }else{
            if(!mom.verified){
                return res.status(400).send("Email Not Verified Please Verify")
            }else{
                let otp = await OTP.findOne({userId:mom._id})
                if(!otp){
                    // console.log(mom)
                     otp = await new OTP({
                        userId:mom._id,
                        otp:randomstring.generate({
                            length: 4,
                            charset:'numeric'
                        })
                    }).save();
                }
                // const link = `${process.env.BASE_URL}/password-reset/${mom._id}/${token.token}`;
                await sendEmail(mom.email,"password reset",`Your verification OTP is: ${otp.otp}`);
                res.send('password reset otp sent to your email account please verify')
            }
        }
    }
    catch(e){
        res.status(400).send(e.message);
        // console.log(e)
    }

})
////////////////////////////////////////////////
router.post('/password-reset',async(req,res)=>{
    try{
        const mom = await Mom.findOne({email:req.body.email});
        if(!mom){
          return res.status(400).send('User Not Found')
        }
        else{
            const otp = await OTP.findOne({
                userId : mom._id,
                otp : req.body.otp
            });
            if(!otp){
                return res.status(400).send('Invalid OTP Or Expired')
            }
            else{
                mom.password = req.body.password;
                await mom.save();
                await otp.delete();
        
                res.status(200).send('password reset sucessfully.')
            }
    
        }
    }
    catch(e){
        res.status(400).send(e.message)
        // console.log(e)
    }
})
/////////////////////////////////////////////////////follow
router.put('/momFollow/:id',auth.momAuth,async(req,res)=>{
    if(req.mom._id !== req.params.id){
        try{
            const user = await Doctor.findById(req.params.id)
            if(!user.followers.includes(req.mom._id)){
                await user.updateOne({ $push: { followers:req.mom._id}});
                await req.mom.updateOne({ $push: { followings:req.params.id}});
                res.status(200).json("user has been followed")
            }
            else{
                res.status(403).json("you already follow this Doctor")
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("you can't follow yourself");
    }
})
//////////////////////////////////////////////////Unfollow
router.put('/momUnfollow/:id',auth.momAuth,async(req,res)=>{
    if(req.mom._id !== req.params.id){
        try{
            const user = await Doctor.findById(req.params.id)
            if(user.followers.includes(req.mom._id)){
                await user.updateOne({ $pull: { followers:req.mom._id}});
                await req.mom.updateOne({ $pull: { followings:req.params.id}});
                res.status(200).json("user has been unfollowed")
            }
            else{
                res.status(403).json("This user is not followed")
            }
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("you can't unfollow yourself");
    }
})
/////////////////////////////////////////////////////add score
router.patch('/addScore',async(req,res)=>{
    try{
        const mom = await Mom.findOne({email:req.body.email})
        if(!mom){
            res.status(404).send({message:"User Not Found!"})
        }else{
            mom.score = req.body.score
            await mom.save();
            res.status(200).send({message:"New Score Added"})
        }
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
//////////////////////////////////////////////////// Game Login
router.post('/gameLogin',async(req,res)=>{
    try{
        const mom = await Mom.findByCredentials(req.body.email,req.body.password)
        res.status(200).send({mom,message:"Login successful!"})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
////////////////////////////////////////////////Game Profile
router.get('/gameProfile',async(req,res)=>{
    try{
        const mom = await Mom.findOne({email:req.body.email})
        if(!mom){
            res.status(404).send({message:"User Not Found!"})
        }else{
            res.status(200).send(mom)
        }
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
module.exports = router