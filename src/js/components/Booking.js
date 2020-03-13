import {select, templates} from '../settings.js';
import AmountWidget from './amountWidget.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(bookingSubpage) {
    const thisBooking = this;

    thisBooking.render(bookingSubpage);
    thisBooking.initWidgets();
  }

  render(bookingSubpage) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingSubpage;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    /*NOWE */ thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
  }

  initWidgets() {

    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    /* NOWE */ thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

  }
}

export default Booking;
