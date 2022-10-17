import AdminBro from 'admin-bro'
import AdminBroMongoose from '@admin-bro/mongoose'
import AdminBroExpress from '@admin-bro/express'

import mongoose from 'mongoose'
import express from 'express'
import dotenv from 'dotenv';

import orderModel from './models/order.model.js'
import userModel from './models/user.model.js'
import adminModel from './models/admin.model.js'
import cakeModel from './models/cake.model.js'
import optionsModel from './models/options.model.js'

dotenv.config();

const app = express()
app.use('/public', express.static('public'));
AdminBro.registerAdapter(AdminBroMongoose)

mongoose.connect(process.env.MONGO_URI)
const AdminBroOptions = {
  resources: [
    { 
      resource: userModel, options: {
        listProperties: ['firstName', '_id', 'phoneNumber'],
        properties :{
          firstName: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          _id: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          phoneNumber: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        }
      },
    },
    {
      resource: orderModel, options: {
        properties :{
          _id: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          cart: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          cartArray: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          price: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          deliveryPoint: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          date: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          phoneNumber: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
        }
      },
    },
    {
      resource: cakeModel, options: {
        listProperties: ['name', 'description', 'price', 'weight', 'expiration', 'category'],
        properties :{
          _id: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          category : {
            availableValues: [{value: 'WOW торти', label: 'WOW торти'}, {value: 'Патріотичні цукерки', label: 'Патріотичні цукерки'}, {value: 'Пряники', label: 'Пряники'}, {value: 'Печиво ТМ Любчик', label: 'Печиво ТМ Любчик'}]
          }
        }
      }
    },
    {
      resource: optionsModel, options: {
        actions: {
          new: {
            isVisible: false,
          },
        },
        listProperties: ['mail'],
        properties :{
          _id: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
          mail: {
            isVisible: { list: true, filter: false, show: true, edit: true },
          },
        }
      },
    }
  ],
  locale: {
    language: 'ua',
    translations: {
      actions: {
        new: 'Створити новий',
        edit: 'Редагувати',
        show: 'Детальніше',
        delete: 'Видалити',
        list: 'Список',
        search: 'Поиск',
        bulkDelete: 'Видалити',
        filter: 'Фільтр'
      },
      buttons: {
        save: 'Зберегти',
      },
      properties: {
        name: 'Назва',
        description: 'Опис',
        price: 'Ціна',
        source: 'Посилання на зображення товару',
        category: 'Категорія',
        phoneNumber: 'Номер телефону',
        _id: 'ID',
        cartArray: 'Кошик',
        weight: 'Вага',
        deliveryPoint: 'Точка вивезення',
        date: 'Дата',
        base: 'Основа',
        firstName: 'Ім’я',
        phoneNumber: 'Номер користувача',
        minWeight: 'Мінімальна вага',
        expiration: 'Термін придатності'
      },
    }
  },
  branding: {
    companyName: 'Wow Tort',
    softwareBrothers: false,
  },
}
const adminBro = new AdminBro(AdminBroOptions)

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    const admins = await adminModel.findOne({ email })
      if (admins) {
        if (password === admins.password) {
          return admins
        }
      }
    return false
  },
  cookiePassword: 'session Key',
})

app.use(adminBro.options.rootPath, router)
app.listen(process.env.PORT, () => console.log('AdminBro is under http://localhost:8080/admin'))