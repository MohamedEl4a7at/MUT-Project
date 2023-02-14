const mongoose = require('mongoose')
const newsSchema = new mongoose.Schema({
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
    postedAt:{
        type:String,
        default:Date
    },
    image:{
        type:Buffer
    }
})

newsSchema.methods.toJSON = function(){
    const newsObject = this.toObject()
    return newsObject
}
const News = mongoose.model('News',newsSchema)

module.exports = News