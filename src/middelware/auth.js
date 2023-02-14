const jwt = require('jsonwebtoken')
const Mom = require('../models/mom')
const Admin = require('../models/admin')
const momAuth = async(req,res,next)=>{
    try{
    const token = req.header('Authorization').replace('Bearer ','')
    const decode = jwt.verify(token,process.env.JWT_SECRET)
    const mom = await Mom.findById({_id:decode._id})
    req.mom = mom
    next()
    }
    catch(e){
        res.status(401).send({error:'Please Authenticate'})
    }
}


const adminAuth = async(req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token,process.env.JWT_SECRET)
        const admin = await Admin.findById({_id:decode._id})
        req.admin = admin
        next()
    }
    catch(e){
        res.status(401).send({error:'Please Authenticate'})
    }
}

const requiresAdmin = async(req,res,next)=>{
    
    if(req.admin.roles !=='admin'){
        res.status(401).send({error:'Not Admin'})
    }
    else{
        next()
    }
}
module.exports = { 
    momAuth,
    adminAuth,
    requiresAdmin
}