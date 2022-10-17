import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
})

let adminModel = mongoose.model('admins', adminSchema)
export default adminModel