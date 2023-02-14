const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator'); //// for duplicate email 
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minLength:3
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
    age:{
        type:Number,
        validate(value){
            if(value<25){
                throw new Error('age must be above 24')
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
    confirmPassword:{
        type:String,
        required:true,
        minlength:6,
        validate(value){
            if(value !== this.password){
                throw new Error('The password does not match ')
            }
        }
    },
    image:{
        type:Buffer
    },
    roles:{
        required:true,
        type:String,
        enum:['user','admin']
    }
})

adminSchema.plugin(uniqueValidator);  ///for duplicate email 


adminSchema.pre('save',async function(){
    if(this.isModified('password'||'confirmPassword')){
        this.password = await bcryptjs.hash(this.password,8)
        this.confirmPassword = await bcryptjs.hash(this.confirmPassword,8)
    }
})

adminSchema.statics.findByCredentials = async(email,password)=>{
    const admin = await Admin.findOne({email})

    if(!admin){
        throw new Error ('Please check email or password')
    }
    if(admin.roles !== 'admin'){  // to make sure he is admin while log in
        throw new Error ('Not Admin')
    }
    const isMatch = await bcryptjs.compare(password,admin.password)
    if(!isMatch){
        throw new Error('Please check email or password')
    }
    return admin
}

adminSchema.methods.generateToken = function(){
    const token = jwt.sign({_id:this._id.toString()},process.env.JWT_SECRET)
    return token
}
// hide sensetive data and problem of image
adminSchema.methods.toJSON = function(){ 
    const adminObject = this.toObject()
    delete adminObject.password
    delete adminObject.confirmPassword
    return adminObject
}


const Admin = mongoose.model('Admin',adminSchema)
module.exports = Admin