const express = require('express')
const router = express.Router()
const Appointment = require('../models/momAppointment')
const Doctor = require('../models/doctor')
const auth = require('../middelware/auth')
const doctorAvailableAppointment = require("../models/doctorAvailableAppointments")
// find by name even if it's first name
router.get('/getAllDoctors',auth.momAuth,async(req,res)=>{
    try{
        const regex = new RegExp(req.body.name, "i"); // Create a case-insensitive regular expression
        const results = await Doctor.find({ fullName: { $regex: regex } });
        // const doctors = await Doctor.find({fullName:req.body.name})
        console.log(results)
        res.send(results)
    }
    catch(err){
        console.log(err)
    }
})
//send Doctor Available Appointments
router.get('/doctorAppointments/:id',auth.momAuth,async(req,res)=>{
    try{
        const doctor = await Doctor.findById(req.params.id)
        if(!doctor){
            return res.status(404).send({message:'Doctor not found'})
        }else{
            const appointments = await doctorAvailableAppointment.find({doctor:req.params.id,reserved:false})
            // const appointment = new Appointment({...req.body,patient:req.mom._id})
            //  await appointment.save()
            //  res.status(200).send(appointment)
            res.status(200).send(appointments)
        }
        
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
})

//reserve appointment
router.post('/reserve/:id',auth.momAuth,async(req,res)=>{
    try{
        const appointment = await doctorAvailableAppointment.findOne({doctor:req.params.id,date:req.body.date}) 
        if(appointment === null){
            res.status(404).send({message:"Appointment Not Found"})
        }else{
            if(appointment.reserved == true){
                const availableAppointments = await doctorAvailableAppointment.find({doctor:req.params.id,reserved:false})
                res.status(400).send({message:"Appointment Already Booked These are Available Appointments",availableAppointments})
            }else{
                const session = new Appointment({ ...req.body, doctor: req.params.id, patient: req.mom._id })
                await session.save()
                appointment.reserved = true
                await appointment.save()
                res.status(200).send({message:"session booked successfully",session})
            }
        }
    }catch(err){
        res.status(400).send({message:err.message})
    }
})
//delete appointment
router.delete('/deleteSession/:id',auth.momAuth,async(req,res)=>{
    try{
        const session = await Appointment.findById(req.params.id)
        if(!session){
            return res.status(404).send({message:"Appointment not found"})
        }else{
            const appointment = await doctorAvailableAppointment.findOne({doctor:session.doctor,date:session.date})
            appointment.reserved = false
            await appointment.save()
            await session.delete()
            res.status(200).send({message:"Appointment Deleted Successfully"})
        }
    }catch(err){
        res.status(400).send({message:err.message})
    }
})
module.exports = router