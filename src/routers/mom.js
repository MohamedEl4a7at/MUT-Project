    const express = require('express')
    const router = express.Router()
    const Mom = require('../models/mom')
    const auth = require('../middelware/auth')
    const multer = require('multer')
    const Token = require('../models/token')
    const sendEmail = require('../utils/sendEmail')
    const crypto = require('crypto')
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
            const token = await new Token({
                userId:mom._id,
                token:crypto.randomBytes(32).toString("hex")
            }).save();

            const url = `${process.env.BASE_URL}/users/${mom._id}/verify/${token.token}`
            await sendEmail(mom.email,"Verify Email",url)
            res.status(200).send({message:"An Email sent to your account please verify",mom})
            
        }}
        catch(e){
            // console.log('wrong')
            res.status(400).send(e.message)
        }
    })

    /////////////////////////////////Verify token
    router.get('/users/:id/verify/:token',async(req,res)=>{
        try{
            const mom = await Mom.findById(req.params.id);
            if(!mom) return res.status(400).send({message:"Invalid Link Or Expired"});

            const token = await Token.findOne({
                userId:mom._id,
                token:req.params.token
            });
            if(!token) return res.status(400).send({message:"Invalid Link Or Expired"});

            await Mom.updateOne({_id:mom._id,verified:true});
            await token.remove()

            res.status(200).send({message:"Email verified successfully"})
        } catch(error){
            res.status(500).send({message:"Internal Server Error"})
        }
    })

    //////////////////////////////// add photo
    const upload = multer({
        fileFilter(req,file,cb){
            if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
                return cb(new Error('Please upload image'),null)
            }

            cb(null,true)
        }
    })

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

    router.patch('/momData',auth.momAuth,upload.single('image'),async(req,res)=>{
        try{
            // const data = Object.keys(req.body)
            // data.forEach((el)=>req.mom[el] = req.body[el])
            req.mom.image = req.file.buffer
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
                let verifyToken = await Token.findOne({userId:mom._id});
                if(!verifyToken){
                    verifyToken = await new Token({
                        userId:mom._id,
                        token:crypto.randomBytes(32).toString("hex")
                    }).save();
                    const url = `${process.env.BASE_URL}/users/${mom._id}/verify/${verifyToken.token}`
                    await sendEmail(mom.email,"Verify Email",url)
                }
                res.status(400).send({message:"An Email sent to your account please verify"});
            }else{
            const token = mom.generateToken()
            res.status(200).send({mom,token})
            }
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
router.patch('/profile',auth.momAuth,upload.single('image'),async(req,res)=>{
    const updates = Object.keys(req.body)
    try{
    updates.forEach((el)=>{
        req.mom[el] = req.body[el] 
        if(req.file){
        req.mom.image = req.file.buffer
        }
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
        } 
        let token = await Token.findOne({userId:mom._id})
        if(!token){
            // console.log(mom)
             token = await new Token({
                userId:mom._id,
                token:crypto.randomBytes(30).toString("hex")
            }).save();
        }
        const link = `${process.env.BASE_URL}/password-reset/${mom._id}/${token.token}`;
        await sendEmail(mom.email,"password reset",link);
        res.send('password reset link sent to your email account')
    }
    catch(e){
        res.send('An error occured');
        console.log(e)
    }

})
////////////////////////////////////////////////
router.post('/password-reset/:momId/:token',async(req,res)=>{
    try{
        const mom = await Mom.findById(req.params.momId);
        if(!mom){
          return res.status(400).send('Invalid Link Or Expired')
        }

        const token = await Token.findOne({
            userId : mom._id,
            token : req.params.token
        });
        if(!token){
            return res.status(400).send('Invalid Link Or Expired')
        }

        mom.password = req.body.password;
        await mom.save();
        await token.delete();

        res.send('password reset sucessfully.')
    }
    catch(e){
        res.status(400).send('An error occured!')
        console.log(e)
    }
})
module.exports = router