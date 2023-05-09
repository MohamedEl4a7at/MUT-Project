const mongoose= require('mongoose')
const availableAppointmentSchema = new mongoose.Schema({
    date:{
        type:Date,
        required:true,
            //         get: function(date) {
            //     return moment(date).format('YYYY-MM-DD HH:mm');
            //   },
            //   set: function(date) {
            //     return moment(date).toDate();
            //   }
    },
    doctor:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    reserved:{
        type:Boolean,
        default:false
    }
},
{timestamps:true})


// postSchema.methods.toJSON = function(){
//     const postObject = this.toObject()
//     return postObject
// }
const availableAppointment = mongoose.model('availableAppointment',availableAppointmentSchema)
module.exports = availableAppointment