const mongoose= require('mongoose')
const appointmentSchema = new mongoose.Schema({
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Doctor'
    },
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'Mom'
    },
    date:{
        type:Date,
        // get: function(date) {
        //     return moment(date).format('YYYY-MM-DD HH:mm');
        //   },
        //   set: function(date) {
        //     return moment(date).toDate();
        //   }
    },
    note:{
        type:String,
        default:null,
        max:500
    },
},
{timestamps:true})

// postSchema.methods.toJSON = function(){
//     const postObject = this.toObject()
//     return postObject
// }
const Appointment = mongoose.model('Appointment',appointmentSchema)
module.exports = Appointment