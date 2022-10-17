import { InlineKeyboard } from "grammy";
import moment from "moment";

export default class Calendar {
    constructor(options) {
        this.minDate = options.minDate;
        this.maxDate = options.maxDate;

        this.page = moment().month();
    }

    getCalendarArray() {
        const startWeek = moment().set('month', this.page).startOf('month').week();
        const endWeek = moment().set('month', this.page).endOf('month').week();
        const calendarArray = [];

        for (let week = startWeek; week <= endWeek; week++) {
            calendarArray.push(Array(7).fill(0).map((e, i) => {
                if (moment().set('month', this.page).week(week).startOf('week').add(e + i, 'day').month() !== moment().set('month', this.page).month()) {
                    return ' ';
                }
                return moment().set('month', this.page).week(week).startOf('week').add(e + i, 'day');
            }))
        }

        return calendarArray;
    }

    getCalendarKeyboard() {
        const calendarKeyboard = new InlineKeyboard()

        if(moment().set('month', this.page-1).endOf('month').isAfter(moment().add(this.minDate, 'day'))) {
            calendarKeyboard.text('⬅️', 'prev')
        }
        else{
            calendarKeyboard.text(' ', 'null')
        }

        calendarKeyboard.text(moment().set('month', this.page).format("MMMM") + ' ' + moment().year(), 'null')

        if(moment().set('month', this.page+1).startOf('month').isBefore(moment().add(this.maxDate, 'day'))) {
            calendarKeyboard.text('➡️', 'next')
        }
        else{
            calendarKeyboard.text(' ', 'null')
        }

        calendarKeyboard.row()
            .text('Пн', 'null')
            .text('Вт', 'null')
            .text('Ср', 'null')
            .text('Чт', 'null')
            .text('Пт', 'null')
            .text('Сб', 'null')
            .text('Нд', 'null')
            .row()

        this.getCalendarArray().forEach(week => {
            week.forEach(day => {
                if (day !== ' ') {
                    if (day.isAfter(moment().add(this.minDate, 'day')) && day.isBefore(moment().add(this.maxDate, 'day')) && day.day() != 0 && day.day() != 6) {
                        calendarKeyboard.text(day.date(), day);
                    }
                    else {
                        calendarKeyboard.text('❌' + day.date(), 'null');
                    }
                } else {
                    calendarKeyboard.text(' ', 'null');
                }
            })
            calendarKeyboard.row()
        })

        return calendarKeyboard;
    }

    getNextMonth() {
        this.page++;
        return this.getCalendarKeyboard();
    }

    getPrevMonth() {
        this.page--;
        return this.getCalendarKeyboard();
    }
}