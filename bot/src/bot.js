import { Bot, session } from 'grammy';
import { run } from "@grammyjs/runner";
import dotenv from 'dotenv';
import moment from 'moment';

import { connectToMongo, createUser, findUser } from './db/index.js';
import { mainMenu, cakeCategorys, requestContact, requestLocation } from './keyboards/markup/index.js';
import { deliveryChoose, infoKeyboard, clearHelp, help, orderConfirm, emptyKeyboard, productMenu, cartConfirm } from './keyboards/inline/index.js';
import { cakesMenuUpdate, nextPage, prevPage, createOrder, sMail } from './customFuncs.js';
import Calendar from './calendar.js';
import { reverseLocation } from './geocoder.js';

import cakeModel from './db/models/cake.model.js';
import userModel from './db/models/user.model.js';
import optionsModel from './db/models/options.model.js';

dotenv.config();
moment.locale('uk');


connectToMongo(process.env.MONGO_URI);
let calendarShift = -1
if (moment().hours() < 11) {
    calendarShift = -1;
}
else {
    calendarShift = 0;
}

const calendar = new Calendar(calendarShift, 81)

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Bot(BOT_TOKEN);
const managerPhoneNum = '+380981234516';

function initial() {
    return { product: {}, cart: [], order: {}, currentCategory: 'WOW торти', waitDeliveryPoint: false, deliveryPoint: '' };
}
bot.use(session({ initial }));

bot.on(':location', async (ctx) => {
    ctx.session.order.deliveryPoint = await reverseLocation(ctx.message.location.latitude, ctx.message.location.longitude)
    console.log(ctx.session.order.deliveryPoint);
    ctx.reply('Ваша ардеса: ' + ctx.session.order.deliveryPoint, { reply_markup: { resize_keyboard: true, keyboard: cakeCategorys.build() } })
    ctx.reply('Оберіть дату доставки:', { reply_markup: calendar.getCalendarKeyboard() })
    ctx.session.waitDeliveryPoint = false;
})

bot.on('msg:contact', async ctx => {
    createUser({ firstName: ctx.from.first_name, phoneNumber: ctx.message.contact.phone_number, _id: ctx.from.id })
    ctx.reply('Привіт, ' + ctx.from.first_name + '!')
    await sleep(1)
    ctx.reply('Ласкаво просимо до боту WOW доставки!☺')
    await sleep(1)

    // tmp
    if (moment().isBefore(moment("2022-08-26", "YYYY-MM-DD"))) {
        ctx.reply('В період с 23.08 по 25.08 чат бот тимчасово не приймає замовлення.')
        await sleep(1)
    }
    //

    ctx.reply('Використовуй меню, для навігації⬇', { reply_markup: { resize_keyboard: true, keyboard: mainMenu.build() } })
})

bot.on('msg', async ctx => {
    const product = ctx.session.product;
    const cart = ctx.session.cart;
    const currentCategory = ctx.session.currentCategory;

    if (await findUser(ctx.from.id) === null)
        ctx.reply('❗️Для роботи з ботом необхідно відправити свій номер телефону❗️\n\n🍬 Натисніть на кнопку "Надіслати номер телефону". Якщо така кнопка не відображається, натисніть на іконку 🎛 в полі повідомлення.', { reply_markup: { resize_keyboard: true, keyboard: requestContact.build() } })
    else {
        let text = ctx.message.text
        if (text == '/start') {
            ctx.reply('Привіт, ' + ctx.from.first_name + '!')
            await sleep(1)
            ctx.reply('Ласкаво просимо до боту WOW доставки!☺')
            await sleep(1)

            // tmp
            if (moment().isBefore(moment("2022-08-26", "YYYY-MM-DD"))) {
                ctx.reply('В період с 23.08 по 25.08 чат бот тимчасово не приймає замовлення.')
                await sleep(1)
            }
            //

            ctx.reply('Використовуй меню, для навігації⬇', { reply_markup: { resize_keyboard: true, keyboard: mainMenu.build() } })
        }
        if (text == '🛒Зробити замовлення')
            ctx.reply('Меню товарів:', { reply_markup: { resize_keyboard: true, keyboard: cakeCategorys.build() } })
        if (text == '🛍️Кошик') {
            if (cart[0] == undefined) {
                ctx.reply('Ваш кошик порожній')
            }
            else {
                let cartList = '';
                ctx.session.order.price = 0;
                for (let i = 0; i < cart.length; i++) {
                    let prefix = '';
                    if (cart[i].category == 'WOW торти') {
                        prefix = "Торт "
                    }
                    else if (cart[i].category == 'Патріотичні цукерки') {
                        prefix = "Цукерки "
                    }
                    else if (cart[i].category == 'Пряники') {
                        prefix = "Пряники "
                    }
                    else if (cart[i].category == 'Печиво ТМ Любчик') {
                        prefix = "Печиво "
                    }
                    ctx.session.order.price += cart[i].price;
                    cartList += `${prefix + cart[i].cake} (${cart[i].price} грн.);\n`
                }
                ctx.reply(`Товари у вашому кошику: ${cart.length}\n\nВаш кошик:\n${cartList}\nВсього до сплати: ${ctx.session.order.price} грн.\nПри замовленні від 500 грн - доставка безкоштовна\nДоставка, кожного дня крім суботи та неділі з 9:00 до 11:00 та з 16:00 до 18:00.`, { reply_markup: cartConfirm })
            }
        }
        if (text == 'ℹ️Інформація')
            ctx.reply('Wow tort. Україна, м. Кременчук, вул. Чкалова 186', { reply_markup: infoKeyboard })
        if (text == '⭐Залишити відгук')
            ctx.reply('Отправте фото чтобы оставить отзыв: (пока не работает)')

        if (text == 'WOW торти') {
            await ctx.reply('WOW торти:')
            ctx.session.currentCategory = 'WOW торти'
            await cakesMenuUpdate(ctx, { category: ctx.session.currentCategory })
        }
        if (text == 'Патріотичні цукерки') {
            await ctx.reply('Патріотичні цукерки:')
            ctx.session.currentCategory = 'Патріотичні цукерки'
            await cakesMenuUpdate(ctx, { category: ctx.session.currentCategory })
        }
        if (text == 'Пряники') {
            await ctx.reply('Пряники:')
            ctx.session.currentCategory = 'Пряники'
            await cakesMenuUpdate(ctx, { category: ctx.session.currentCategory })
        }
        if (text == 'Печиво ТМ Любчик') {
            await ctx.reply('Печиво ТМ Любчик:')
            ctx.session.currentCategory = 'Печиво ТМ Любчик'
            await cakesMenuUpdate(ctx, { category: ctx.session.currentCategory })
        }

        if (text == "🆘Зв'язок з менеджером") {
            ctx.reply("Бажаєте зв'язатися з менеджером та додатково проконсультуватися? (Зв'язатися з менеджером можно тільки у будні, з 9:00 до 17:00)", { reply_markup: clearHelp })
        }
        if (text == '⬅️Головне меню') {
            ctx.reply('Головне меню:', { reply_markup: { resize_keyboard: true, keyboard: mainMenu.build() } })
        }
        if (text == '⬅️Категорії') {
            ctx.reply('Категорії:', { reply_markup: { resize_keyboard: true, keyboard: cakeCategorys.build() } })
        }

        if (text == 'Ще торти➡️') {
            nextPage(ctx, currentCategory)
        }
        if (text == '⬅️Ще торти') {
            prevPage(ctx, currentCategory)
        }

        if (ctx.session.waitDeliveryPoint) {
            ctx.session.order.deliveryPoint = text;
            await ctx.reply('Ваша ардеса: ' + text, { reply_markup: { resize_keyboard: true, keyboard: cakeCategorys.build() } })
            ctx.reply('Оберіть дату доставки:', { reply_markup: calendar.getCalendarKeyboard() })
            ctx.session.waitDeliveryPoint = false;
        }
        cakeModel.findOne({ name: text }).then(async cake => {
            if (cake != null) {
                ctx.session.product.cake = text
                ctx.session.product.price = cake.price
                ctx.session.cart.push({ cake: product.cake, price: product.price, category: cake.category })
                await ctx.reply('Товар додано в кошик', { reply_markup: productMenu })
            }
        })
    }
})

bot.on('callback_query:data', async ctx => {
    const data = ctx.callbackQuery.data;
    const cart = ctx.session.cart;
    const order = ctx.session.order;
    const product = ctx.session.product;

    if (data == 'delete') {
        ctx.editMessageReplyMarkup({ reply_markup: emptyKeyboard });
    }

    if (data == 'openCart') {
        let cartList = '';
        ctx.session.order.price = 0;
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].category == 'WOW торти') {
                cartList += "Торт "
            }
            else if (cart[i].category == 'Патріотичні цукерки') {
                cartList += "Цукерки "
            }
            else if (cart[i].category == 'Пряники') {
                cartList += "Пряники "
            }
            else if (cart[i].category == 'Печиво ТМ Любчик') {
                cartList += "Печиво "
            }
            ctx.session.order.price += cart[i].price;
            cartList += `${cart[i].cake} (${cart[i].price} грн.);\n`
        }
        ctx.deleteMessage();
        ctx.reply(`Товари у вашому кошику: ${cart.length}\n\nВаш кошик:\n${cartList}\nВсього до сплати: ${ctx.session.order.price} грн.\nПри замовленні від 500 грн - доставка безкоштовна\nДоставка, кожного дня крім суботи та неділі з 9:00 до 11:00 та з 16:00 до 18:00.`, { reply_markup: cartConfirm })
    }

    if (data == 'orderCart') {
        let cartList = '';
        ctx.session.order.price = 0;
        ctx.session.order.cartArray = [];
        for (let i = 0; i < cart.length; i++) {
            ctx.session.order.price += cart[i].price;
            ctx.session.order.cartArray.push(`${cart[i].cake} (${cart[i].price} грн.)`)
            cartList += `${cart[i].cake} (${cart[i].price} грн.);\n`
        }
        ctx.session.order.cart = cartList;
        JSON.stringify(order.cartArray);
        ctx.editMessageText('Оберіть спосіб отримання замовлення:', { reply_markup: deliveryChoose })
    }

    if (data == 'clearCart') {
        ctx.deleteMessage();
        ctx.reply('🗑️Кошик порожній')
        ctx.session.cart = [];
    }

    if (data == 'deleteProduct') {
        ctx.deleteMessage();
        ctx.session.cart.shift();
        ctx.reply('Товар видалено з кошику')
    }

    if (data == 'delivery') {
        ctx.deleteMessage()
        ctx.reply('Напишіть адрессу доставки, або відправте своє місцезнаходження⬇️', { reply_markup: { resize_keyboard: true, keyboard: requestLocation.build() } })
        ctx.session.waitDeliveryPoint = true
    }

    if (data == 'pickup') {
        ctx.deleteMessage()
        ctx.session.order.deliveryPoint = 'Самовивіз'
        ctx.reply('Оберіть дату доставки:', { reply_markup: calendar.getCalendarKeyboard() })
    }

    if (data == 'helpNo') {
        if (order.date == undefined)
            ctx.editMessageText('Підтвердіть замовлення:\n\nКошик:\n' + order.cart + '\nДата отримання замовлення: (не вказана)' + '\nВсього до сплати: ' + order.price + 'грн\При замовленні від 500 грн - доставка безкоштовна\nДоставка, кожного дня крім суботи та неділі з 9:00 до 11:00 та з 16:00 до 18:00.', { reply_markup: orderConfirm })
        else
            ctx.editMessageText('Підтвердіть замовлення:\n\nКошик:\n' + order.cart + '\nДата отримання замовлення: ' + order.date + '\nВсього до сплати: ' + order.price + 'грн\nПри замовленні від 500 грн - доставка безкоштовна\nДоставка, кожного дня крім суботи та неділі з 9:00 до 11:00 та з 16:00 до 18:00.', { reply_markup: orderConfirm })
    }
    if (data == 'bought') {
        await userModel.findOne({ _id: ctx.from.id }).then(user => {
            ctx.session.order.phoneNumber = user.phoneNumber
        })
        await createOrder(ctx, order)
        await optionsModel.findOne({}).then(async options => {
            sMail(options.mail, ctx.from.first_name + ' (' + ctx.from.id + ')', 'Кошик:\n' + order.cart + '\nВсього до сплати: ' + order.price + ' грн\n' + 'Адреса: ' + order.deliveryPoint + '\nДата отримання замовлення: ' + order.date + '\nНомер телефону: ' + order.phoneNumber)
        })
        ctx.session.order = {}
        ctx.session.cart = []
    }
    if (data == 'backToMainMenu') {
        ctx.editMessageReplyMarkup({ reply_markup: emptyKeyboard })
        ctx.reply('Головне меню:', { reply_markup: { resize_keyboard: true, keyboard: mainMenu.build() } })
    }
    if (data == 'callHelp') {
        ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } })
        if ((moment(new Date).day() < 6) && (moment(new Date, moment.TIME).isAfter(moment(new Date, moment.TIME).startOf('day').add(17, 'h')) || moment(new Date, moment.TIME).isBefore(moment(new Date, moment.TIME).startOf('day').add(9, 'h')))) {
            ctx.reply('Ваш поточний час: ' + moment(new Date, moment.TIME).format('HH:mm') + '\nМенеджер може підключитись тільки у будні, з 9:00 до 17:00', { reply_markup: { remove_keyboard: true } })
        }
        else {
            await ctx.deleteMessage(ctx.update.callback_query.message.message_id)
            await ctx.replyWithContact(managerPhoneNum, 'Оператор').catch(async err => { await ctx.reply('Оператор:\n' + managerPhoneNum) })
        }
    }
    if (data == 'closeKeyboard') {
        ctx.editMessageReplyMarkup({ reply_markup: emptyKeyboard })
    }

    if (data === 'null') {
        return;
    }
    else if (data === 'prev') {
        ctx.editMessageReplyMarkup({ reply_markup: calendar.getPrevMonth() });
    }
    else if (data === 'next') {
        ctx.editMessageReplyMarkup({ reply_markup: calendar.getNextMonth() });
    }
    else if (moment(data).isValid()) {
        ctx.deleteMessage();
        ctx.session.order.date = moment(data).format('DD-MM-YYYY');
        ctx.reply("Бажаєте зв'язатися з менеджером та додатково проконсультуватися? (Зв'язатися з менеджером можно тільки у будні, з 9:00 до 17:00)", { reply_markup: help })
    }
    await ctx.answerCallbackQuery();
})

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    console.error(err);
});

run(bot);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms * 1000));
