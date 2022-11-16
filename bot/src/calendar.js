import { InlineKeyboard } from "grammy";
import dayjs from "dayjs";
import 'dayjs/locale/uk.js';

dayjs.locale('uk');

export default class Calendar {
    constructor(dateShift, availableGap) {
        this.dateShift = dateShift || 0;
        this.availableDays = availableGap || 28;
        this.pageDate = dayjs().startOf('month');
    }

    getCalendarArray(date = dayjs()){
        date = dayjs(date);
        let firstDay = date.startOf('month');
        const lastDay = date.endOf('month');
        const calendar = [];

        for(firstDay; firstDay.isBefore(lastDay.add(1, 'day')); firstDay = firstDay.add(7, 'days')){
            calendar.push(Array(7).fill(0).map((e, i) => {
                if (firstDay.startOf('week').add(i, 'day').month() !== date.month()) {
                    return ' ';
                }
                return firstDay.startOf('week').add(i, 'day');
            }))
        }

        return calendar;
    }

    getCalendarKeyboard(date){
        console.log(date);
        if(date == undefined){
            this.pageDate = dayjs().startOf('month');
            date = this.pageDate
        }

        const calendarKeyboard = new InlineKeyboard()

        calendarKeyboard.text(this.pageDate.format("MMMM") + ' ' + date.year(), 'null')

        calendarKeyboard.row()
            .text('Пн', 'null')
            .text('Вт', 'null')
            .text('Ср', 'null')
            .text('Чт', 'null')
            .text('Пт', 'null')
            .text('Сб', 'null')
            .text('Нд', 'null')
            .row()

        this.getCalendarArray(date).forEach(week => {
            week.forEach(day => {
                if (day !== ' ') {
                    if (day.isAfter(dayjs().add(this.dateShift, 'day')) && day.isBefore(dayjs().add(this.availableDays, 'day'))) {
                        calendarKeyboard.text(day.date(), day.format('YYYY-MM-DD'));
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

        if(this.pageDate.subtract(1, 'month').endOf('month').isAfter(dayjs().add(this.dateShift, 'day'))) {
            calendarKeyboard.text('⬅️', 'prev')
        }
        else{
            calendarKeyboard.text(' ', 'null')
        }

        if(this.pageDate.add(1, 'month').startOf('month').isBefore(dayjs().add(this.availableDays, 'day'))) {
            calendarKeyboard.text('➡️', 'next')
        }
        else{
            calendarKeyboard.text(' ', 'null')
        }

        return calendarKeyboard;
    }

    getNextMonth() {
        if(this.pageDate.add(1, 'month').startOf('month').isBefore(dayjs().add(this.availableDays, 'day'))) {
            this.pageDate = this.pageDate.add(1, 'month')
            return this.getCalendarKeyboard(this.pageDate);
        }
        return this.getCalendarKeyboard();
    }

    getPrevMonth() {
        if(this.pageDate.subtract(1, 'month').endOf('month').isAfter(dayjs().add(this.dateShift, 'day'))) {
            this.pageDate = this.pageDate.subtract(1, 'month')
            return this.getCalendarKeyboard(this.pageDate);
        }
            return this.getCalendarKeyboard();
    }
}