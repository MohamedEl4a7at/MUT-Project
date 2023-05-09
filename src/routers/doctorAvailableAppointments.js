const express = require('express')
const router = express.Router()
const Doctor = require('../models/doctor')
const auth = require('../middelware/auth')
const availableAppointment = require('../models/doctorAvailableAppointments')

router.post('/freeAppointments',auth.doctorAuth,async(req,res)=>{
    try{
        const Appointment = await new availableAppointment({...req.body,doctor:req.doctor._id})
        await Appointment.save()
        res.status(200).json({message:'Appointments added'})
    }
    catch(err){
        res.status(400).send(err)
    }
})

router.get('/allAppointments',auth.doctorAuth,async(req,res)=>{
    try{
        await req.doctor.populate('freeAppointments')
        res.send(req.doctor.freeAppointments)
    } 
    catch(err){
        res.status(400).json({message:'Error'})
    }
})
router.patch('/updateAppointment',auth.doctorAuth,async(req,res)=>{
    try{
        const appointment = await availableAppointment.findById(req.body.id)
        if(!appointment){
            return res.status(404).json({message:'Appointment not found'})
        }else{
            if(!appointment.doctor.equals(req.doctor._id)){
                return res.status(401).json({message:'You are not authorized to update this appointment'})
            }else{
                await availableAppointment.updateOne({_id:req.body.id},{date:req.body.date})
                await appointment.save()
                res.status(200).json({message:'Appointment updated'})
            }
        }
    }catch(err){
        res.status(400).send(err)
    }
})
module.exports = router