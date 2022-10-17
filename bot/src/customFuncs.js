import cakeModel from './db/models/cake.model.js'
import orderModel from './db/models/order.model.js'
import { Keyboard, InputFile } from 'grammy'
import nodemailer from 'nodemailer'
import { finalMenu } from './keyboards/inline/index.js'

let cakesPerPage = 6,
    currentCakesPage = 1

const botmail = 'wowtortbot@lukas.com.ua',
    botpassword = 'Wowtort2701';
const transporter = nodemailer.createTransport({
    host: 'mail.lukas.com.ua',
    port: 465,
    secure: true,
    auth: {
        user: botmail,
        pass: botpassword
    }
});

function sMail(mail, subject, text) {
    let mailOptions = {
        from: botmail,
        to: mail,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function sendCakesPhotos(ctx, category) {
    cakeModel.find(category).then(cakes => {
        if (currentCakesPage != Math.ceil(cakes.length / cakesPerPage) || cakes.length%cakesPerPage == 0) {
            for (let i = 0; i < cakesPerPage; i++) {
                ctx.replyWithPhoto(new InputFile(cakes[(currentCakesPage - 1) * cakesPerPage + i].source), { caption: `<b>${cakes[(currentCakesPage - 1) * cakesPerPage + i].name}</b>\nОпис: ${cakes[(currentCakesPage - 1) * cakesPerPage + i].description}\nЦіна: <b>${cakes[(currentCakesPage - 1) * cakesPerPage + i].price} грн.</b>\nВага: ${cakes[(currentCakesPage - 1) * cakesPerPage + i].weight}\nТермін придатності: ${cakes[(currentCakesPage - 1) * cakesPerPage + i].expiration}`, parse_mode: "HTML" }).catch(err => { console.log(err) })
            }
        }
        else {
            for (let i = 0; i < cakes.length % cakesPerPage; i++) {
                ctx.replyWithPhoto(new InputFile(cakes[(currentCakesPage - 1) * cakesPerPage + i].source), { caption: `<b>${cakes[(currentCakesPage - 1) * cakesPerPage + i].name}</b>\nОпис: ${cakes[(currentCakesPage - 1) * cakesPerPage + i].description}\nЦіна: <b>${cakes[(currentCakesPage - 1) * cakesPerPage + i].price} грн.</b>\nВага: ${cakes[(currentCakesPage - 1) * cakesPerPage + i].weight}\nТермін придатності: ${cakes[(currentCakesPage - 1) * cakesPerPage + i].expiration}`, parse_mode: "HTML" }).catch(err => { console.log(err) })
            }
        }
    })
}


function cakesMenuUpdate(ctx, category) {
    cakeModel.find(category).then(cakes => {
        if (((currentCakesPage - 1) * cakesPerPage + 1) > cakes.length) {
            currentCakesPage = 1;
        }

        const menu = new Keyboard()

        if (cakes.length > 6) {
            menu.text('⬅️Ще торти').text('Ще торти➡️').row();
        }

        if (currentCakesPage != Math.ceil(cakes.length / cakesPerPage) || cakes.length%cakesPerPage == 0) {
            for (let i = 0; i < cakesPerPage; i++) {
                menu.text(cakes[(currentCakesPage - 1) * cakesPerPage + i].name)
                if (i == 2) {
                    menu.row()
                }
            }
        }
        else {
            for (let i = 0; i < cakes.length % cakesPerPage; i++) {
                menu.text(cakes[(currentCakesPage - 1) * cakesPerPage + i].name)
                if (i == 2) {
                    menu.row()
                }
            }
        }

        menu.row().text('⬅️Категорії').text('🆘Потрібна допомога');

        sendCakesPhotos(ctx, category)
        ctx.reply(`${currentCakesPage}/${Math.ceil(cakes.length / cakesPerPage)}`, { reply_markup: { resize_keyboard: true, keyboard: menu.build() } })
    })
}

function nextPage(ctx, currentCategory) {
    cakeModel.find({ category: currentCategory }).then(cakes => {
        if (currentCakesPage >= Math.ceil(cakes.length / cakesPerPage)) {
            currentCakesPage = 1
            cakesMenuUpdate(ctx, { category: currentCategory })
        }
        else {
            currentCakesPage++
            cakesMenuUpdate(ctx, { category: currentCategory })
        }
    })
}

function prevPage(ctx, currentCategory) {
    cakeModel.find({ category: currentCategory }).then(cakes => {
        if (currentCakesPage <= 1) {
            currentCakesPage = Math.ceil(cakes.length / cakesPerPage)
            cakesMenuUpdate(ctx, { category: currentCategory })
        }
        else {
            currentCakesPage--
            cakesMenuUpdate(ctx, { category: currentCategory })
        }
    })
}

async function createOrder(ctx, order) {
    orderModel.create(order)
        .then(() => console.log('[OK] Order is created'))
        .catch(err => console.error(err));
    if (order.date == undefined)
        order.date = '(не вказано)'
    await ctx.deleteMessage()
    await ctx.reply('Ваше замовлення:\nКошик: ' + order.cart + '\nДата отримання замовлення: ' + order.date + '\nВсього до сплати: ' + order.price + ' грн')
    await ctx.reply(`✅Замовлення підтверджено!✅\n\nБудь ласка, сплатіть ${ctx.session.order.price} грн. на карту: \n4246 0010 0214 6730\n\nПри оплаті вкажіть, будь ласка, Ваші ПІБ, та відправте копію квітанції про сплату нашому менеджеру, щоб ми могли швидше обробити Ваше замовлення.`)
    await ctx.reply('За для Вашої безпеки, під час дії повітрянної тривоги доставка на виконується')
    await ctx.reply("Найближчим часом з Вами зв'яжеться наш менеджер. Будь ласка, підтвердіть замовлення нашому менеджеру. Без підтвердження замовлення ми не зможемо взяти у виробництво.", { reply_markup: finalMenu })
}
export { cakesMenuUpdate, nextPage, prevPage, createOrder, sMail }