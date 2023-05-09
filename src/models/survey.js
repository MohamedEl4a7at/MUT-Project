const mongoose= require('mongoose')
const surveySchema = new mongoose.Schema({
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Mom"
    },
    q1:{
        type:String
    },
    q2:{
        type:String
    },
    q3:{
        type:String
    },
    q4:{
        type:String
    },
    q5:{
        type:String
    },
    q6:{
        type:String
    },
    q7:{
        type:String
    },
    q8:{
        type:String
    },
    q9:{
        type:String
    },
    q10:{
        type:String
    },
},
{timestamps:true})


surveySchema.methods.toJSON = function(){
    const surveyObject = this.toObject()
    return surveyObject
}
const Survey  = mongoose.model('Survey',surveySchema)
module.exports = Survey