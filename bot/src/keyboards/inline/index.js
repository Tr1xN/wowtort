import { InlineKeyboard } from "grammy";

const deliveryChoose = new InlineKeyboard()
    .text('Доставка (Безкоштовно)', 'delivery').row()
    .text('Самовивіз (Кременчуг вул. Чкалова, 186)', 'pickup');

const infoKeyboard = new InlineKeyboard()
    .url('📸Instagram', 'https://www.instagram.com/tort.wow/')
    .url('🍭Інтернет-магазин', 'https://lukas-sweet.shop/')

const clearHelp = new InlineKeyboard()
    .url('Так', 'https://t.me/LukasSweetshop')
    .text('Ні', 'delete');

const help = new InlineKeyboard()
    .url('Так', 'https://t.me/LukasSweetshop')
    .text('Ні', 'helpNo');

const orderConfirm = new InlineKeyboard()
    .text('Замовити', 'bought')

const finalMenu = new InlineKeyboard()
    .text('⬅️Повернутися в меню', 'backToMainMenu')
    .url("📞Зв'язатися з менеджером", 'https://t.me/LukasSweetshop').row()
    .text('Ок', 'closeKeyboard');

const productMenu = new InlineKeyboard()
    .text('🛒Відкрити кошик', 'openCart').row()
    .text('❌Видалити товар', 'deleteProduct').row()

const cartConfirm = new InlineKeyboard()
    .text('🚚Замовити', 'orderCart')
    .text('🧹Очистити', 'clearCart')

const paymentType = new InlineKeyboard()
    .text('Сплатити готівкою', 'cash')
    .text('Безготівковий розрахунок', 'cashless')

const emptyKeyboard = new InlineKeyboard()

export { deliveryChoose, infoKeyboard, clearHelp, help, orderConfirm, finalMenu, emptyKeyboard, productMenu, cartConfirm, paymentType };