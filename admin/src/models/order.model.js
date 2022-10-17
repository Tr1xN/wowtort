import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    cart:{
        type: String,
        required: true
    },
    cartArray:{
        type: [String],
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    deliveryPoint:{
        type: String,
        required: true
    },
    date:{
        type: String,
        required: false
    },
    phoneNumber:{
        type: String,
        required: true
    }
})

let orderModel = mongoose.model('orders', orderSchema)
export default orderModel