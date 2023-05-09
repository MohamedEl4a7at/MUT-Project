const router = require('express').Router();
const multer = require('multer');
const auth = require('../middelware/auth');
const Post = require('../models/posts');

const upload = multer({
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            return cb(new Error('please upload valid image'),null)
        }
        //accept file
        cb(null,true)
    }
})

// create a post
router.post("/createPost",auth.momAuth,upload.single('image'),async(req,res)=>{
    try{
        const newPost = new Post ({...req.body,userId:req.mom._id})
        if(req.file){
            newPost.image = req.file.buffer;
        };
        await newPost.save()
        res.status(200).send(newPost)
    }catch(err){
        res.status(500).send(err)
    }
})
//update a post
router.patch('/updatePost/:id',auth.momAuth,upload.single('image'),async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).send("Not Found")
        }
        if(post.userId.equals(req.mom._id)){
            
            const updates = Object.keys(req.body)
            updates.forEach((el)=>{post[el] = req.body[el]})
            if(req.file){
                post.image = req.file.buffer
            }
            await post.save()
            res.status(200).send(post)
        }
    }catch(err){
        res.status(500).send(err)
    }
})
//delete a post
router.delete('/deletePost/:id',auth.momAuth,async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            res.status(404).send("Not Found")
        }
        else{
        if(post.userId.equals( req.mom._id) ){
            await post.deleteOne()
            res.status(200).send('post deleted')
        }else{
            res.status(403).send({message:"You can only delete your own post"})
        }}
    }catch(err){
        res.status(500).send(err)
    }
})
//like / dislike a post
router.patch('/likePost/:id',auth.momAuth,async (req,res)=>{
    try{
        const post  = await Post.findById(req.params.id);
        if(!post){
            res.status(404).send('Not Found')
        }else{
            if(!post.likes.includes(req.mom._id)){
                await post.updateOne({ $push: { likes: req.mom._id}});
                res.status(200).send({ message: "A post has been liked"});
            } else{
                await post.updateOne({ $pull: { likes: req.mom._id}});
                res.status(200).send({ message: "A post has been disliked"});
            }
        }
    } catch(err){
        res.status(500).send(err)
    }
})
//get a post
router.get('/getPost/:id',auth.momAuth,async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        res.status(200).send(post)
    }
    catch(err){
        res.status(500).send(err)
    }
})
//get timeline posts

module.exports = router