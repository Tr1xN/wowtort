import mongoose from "mongoose";
import orderModel from "./models/order.model.js";
import userModel from "./models/user.model.js";
import moment from "moment";

export function connectToMongo(URI) {
    mongoose.connect(URI, { useNewUrlParser: true })
        .then(() => console.log('[OK] DB is connected'))
        .catch(err => console.error(err));
}

export function createOrder(order) {
    return orderModel.create(order)
        .then(() => console.log('[OK] Order is created'))
        .catch(err => console.error(err));
}

export function createUser(user) {
    return userModel.create(user)
        .then(() => console.log('[OK] User is created'))
        .catch(err => console.error(err));
}

export function findUser(telegramID) {
    return userModel.findById(telegramID).exec();
}