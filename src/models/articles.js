const mongoose = require('mongoose')
const articlesSchema = new mongoose.Schema({
    auther:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor'
    },
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:Buffer
    }
},
{timestamps:true})

articlesSchema.methods.toJSON = function(){
    const articlesObject = this.toObject()
    return articlesObject
}
const Articles = mongoose.model('Articles',articlesSchema)

module.exports = Articles