const express = require('express')
const router = express.Router()
const Articles = require('../models/articles')
const auth = require('../middelware/auth')
const multer = require('multer')

/////////////////////////upload with image
const upload = multer({
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('please upload valid image'),null)
        }
        //accept file
        cb(null,true)
    }
})

router.post('/postArticles',auth.doctorAuth,upload.single('image'),async(req,res)=>{
    try{
        const articles = new Articles({...req.body,auther:req.doctor._id})
        articles.image = req.file.buffer
        await articles.save()
        res.status(200).send(articles)
    }
    catch(e){
        res.status(400).send(e)
    }
})
////////////////////////get all in doctor dashboard
// router.get('/articles',auth.doctorAuth,async(req,res)=>{
//     try{
//         await req.doctor.populate("articles")
//         res.status(200).send(req.doctor.articles)
//     }
//     catch(err){
//         res.status(400).send(err)
//     }
// })
////////////////////////get all to mom
router.get('/showArticles',auth.momAuth,async(req,res)=>{
    try{
        const articles = await Articles.find({}) 
        res.status(200).send(articles)
    }
    catch(err){
        res.status(400).send(err)
    }
})
// router.delete('/news/:id',auth.adminAuth,auth.requiresAdmin,async(req,res)=>{
//     try{
//         const _id = req.params.id
//         const news = await News.findByIdAndDelete({_id})
//         if(!news){
//             return res.status(404).send('No news is Found')
//         }
//         res.status(200).send('Deleted')
//     }
// catch(e){
//     res.status(400).send(e)
// }

// })
module.exports = router