import mongoose from 'mongoose'

const optionsSchema = new mongoose.Schema({
    mail:{
        type: String,
    },
})

let optionsModel = mongoose.model('options', optionsSchema)
export default optionsModel