const mongoose= require('mongoose')
const validator= require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const momSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minLength:2
    },
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age:{
        type:Number,
        validate(value){
            if(value<=20){
                throw new Error('age must be more then 20 years old')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minLength:6,
        validate(value){
            let regExp = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if(!regExp.test(value)){
                throw new Error('Password must include uppercase,lowercase,numbers and speical characters')
            }
        }
    }
})

momSchema.pre('save',async function(){
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password,8)
    }
})

momSchema.statics.findByCredentials = async(email,password)=>{
    const mom = await Mom.findOne({email})
    if(!mom){
        throw new Error('Please check email or password')
    }
    const isMatch = await bcryptjs.compare(password,mom.password)
    if(!isMatch){
        throw new Error('Please check email or password')
    }
    return mom
}

momSchema.methods.generateToken = function(){
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    return token
}











const Mom = mongoose.model('Mom',momSchema)
module.exports = Mom