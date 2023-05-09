const mongoose= require('mongoose')
const postSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    description:{
        type:String,
        max:500
    },
    image:{
        type:Buffer,
        default:null
    },
    likes:{
        type:Array,
        default:[]
    }
},
{timestamps:true})


postSchema.methods.toJSON = function(){
    const postObject = this.toObject()
    return postObject
}
const Post = mongoose.model('Post',postSchema)
module.exports = Post