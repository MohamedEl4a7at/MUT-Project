const mongoose= require('mongoose')
const commentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    comment:{
        type:String,
        max:500,
        required:true
    }
},
{timestamps:true})


// postSchema.methods.toJSON = function(){
//     const postObject = this.toObject()
//     return postObject
// }
const Comment = mongoose.model('Comment',commentSchema)
module.exports = Comment