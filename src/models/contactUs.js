const mongoose= require('mongoose')
const validator= require('validator')
const contactUsSchema = new mongoose.Schema({
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Mom'
    },
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
    email:{
        type:String,
        trim:true,
        required:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    description:{
        type:String,
        max:500
    }
},
{timestamps:true})


contactUsSchema.methods.toJSON = function(){
    const contactUsObject = this.toObject()
    return contactUsObject
}
const Contact = mongoose.model('Contact',contactUsSchema)
module.exports = Contact