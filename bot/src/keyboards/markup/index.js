import { Keyboard } from "grammy";

const requestContact = new Keyboard()
    .requestContact('📞Надіслати номер телефону')

const requestLocation = new Keyboard()
    .requestLocation('🗺️Надіслати своє місцезнаходження');

const mainMenu = new Keyboard()
    .text('🛒Зробити замовлення')
    .text('ℹ️Інформація').row()
    .text("🆘Зв'язок з менеджером");

const cakeCategorys = new Keyboard()
    .text('🛍️Кошик').row()
    .text('WOW торти')
    .text('Печиво ТМ Любчик').row()
    .text('Патріотичні цукерки')
    .text('Пряники').row()
    .text('⬅️Головне меню');

export { requestContact, mainMenu, cakeCategorys, requestLocation }