const express = require('express')
const router = express.Router()
const News = require('../models/news')
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

router.post('/postNews',auth.adminAuth,auth.requiresAdmin,upload.single('image'),async(req,res)=>{
    try{
        const news = new News(req.body)
        news.image = req.file.buffer
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e)
    }
})
////////////////////////get all
// router.get('/news',auth.adminAuth,auth.requiresAdmin,async(req,res)=>{
//     try{
//         await req.admin.populate
//     }
// })
////////////////////////delete

router.delete('/news/:id',auth.adminAuth,auth.requiresAdmin,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findByIdAndDelete({_id})
        if(!news){
            return res.status(404).send('No news is Found')
        }
        res.status(200).send('Deleted')
    }
catch(e){
    res.status(400).send(e)
}

})
module.exports = router