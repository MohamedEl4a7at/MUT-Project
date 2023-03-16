const mongoose= require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const validator= require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const momSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
        minLength:3
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
        minLength:3
    },
    dateOfBirth:{
        type:Date,
        required:true,
        trim:true,
        
    },
    lastChildDateOfBirth:{
        type:Date,
        trim:true
        
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
    },
    // confirmPassword:{
    //     type:String,
    //     required:true,
    //     trim:true,
    //     validate(value){
    //         if(value!==this.password){
    //             throw new Error('Password does not match')
    //         }
    //     }
    // },
    image:{
        type:Buffer
    },
    // secretQuestion:{
    //     type:String,
    //     required:true,
    //     trim:true,
    // },
    // secretAnswer:{
    //     type:String,
    //     required:true,
    //     trim:true,
    //     lowercase:true,
    //     minLength:5
    // }
    verified:{
        type:Boolean,
        default:false
    }
})

momSchema.pre('save',async function(){
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password,8)
        // this.confirmPassword = await bcryptjs.hash(this.confirmPassword,8)
        // this.secretQuestion = await bcryptjs.hash(this.secretQuestion,8)
        // this.secretAnswer = await bcryptjs.hash(this.secretAnswer,8)
    }
})

momSchema.plugin(uniqueValidator)

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

// momSchema.statics.findByInputs = async(email,secretQuestion,secretAnswer)=>{
//     const mom = await Mom.findOne({email})
//     if(!mom){
//         throw new Error('Email not found')
//     }else{
//     const isMatch = await bcryptjs.compare(mom.secretQuestion,secretQuestion)
//     console.log(isMatch)
//     // if(!isMatch){
//     //     throw new Error('secretQuestion or secretAnswer is wrong 1')
//     // }else{
//     // const isEqual = await bcryptjs.compare(mom.secretAnswer,secretAnswer)
//     // if(!isEqual){
//     //     throw new Error('secretQuestion or secretAnswer is wrong 2')
//     // }
//     return mom
// // }
// }
// }

momSchema.methods.generateToken = function(){
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    return token
}

momSchema.methods.toJSON = function(){
    const momObject = this.toObject()
    delete momObject.password
    delete momObject.confirmPassword
    delete momObject.secretQuestion
    delete momObject.secretAnswer
    return momObject
}

const Mom = mongoose.model('Mom',momSchema)
module.exports = Mom