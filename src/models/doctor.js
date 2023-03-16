const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator') // for duplicated email
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')


const doctorSchema = new mongoose.Schema({
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
    previousExperience:{
        type:String,
        minLength:20
    },
    biography:{
        type:String,
        minLength:30
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6,
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
    //     minlength:6,
    //     validate(value){
    //         if(value !== this.password){
    //             throw new Error('Password does not match ')
    //         }
    //     }
    // },
    image:{
        type:Buffer,
        required:true
    },
    professionCertificate:{
        type:Buffer,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    }
})

doctorSchema.plugin(uniqueValidator);   //for duplicated email


doctorSchema.pre('save',async function(){
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password,8)
        // this.confirmPassword = await bcryptjs.hash(this.confirmPassword,8)
    }
})


doctorSchema.statics.findByCredentials = async(email,password)=>{
    const doctor = await Doctor.findOne({email})

    if(!doctor){
        throw new Error('Please check email or password')
    }
    const isMatch = await bcryptjs.compare(password,doctor.password)
    if(!isMatch){
        throw new Error('Please check email or password')
    }
    return doctor
}

doctorSchema.methods.generateToken = function(){
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    return token
}


doctorSchema.methods.toJSON = function(){
    const doctorObject = this.toObject()
    delete doctorObject.password
    delete doctorObject.confirmPassword
    return doctorObject
}



const Doctor = mongoose.model('Doctor',doctorSchema)
module.exports = Doctor