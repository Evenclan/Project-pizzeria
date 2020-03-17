import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './amountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingElem) {
    this.render(bookingElem);
    this.initWidgets();
    this.getData();
  }

  render(bookingElem) {
    const generatedHTML = templates.bookingWidget();

    this.dom = {};

    this.dom.wrapper = bookingElem;
    this.dom.wrapper.innerHTML = generatedHTML;
    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
    this.dom.duration = this.dom.wrapper.querySelector('[name="hours"]');
    this.dom.people = this.dom.wrapper.querySelector('[name="people"]');
    this.dom.starters = this.dom.wrapper.querySelectorAll(select.booking.starters);
    this.dom.formSubmit = this.dom.wrapper.querySelector(select.booking.formSubmit);
  }

  getData() {
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params:', params);

    const urls = {
      booking:      settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls:', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        console.log('bookings from API', bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};

    for (let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.datePicker.minDate;
    const maxDate = this.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    //console.log('this.booked', this.booked);

    this.updateDOM();
  }

  sendBooking() {
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const booking = {
      date: this.datePicker.value,
      hour: this.hourPicker.value,
      table: [],
      duration: parseInt(this.dom.duration.value),
      ppl: parseInt(this.dom.people.value),
      starters: [],
    };

    for (let starter of this.dom.starters) {
      if (starter.checked === true) {
        booking.starters.push(starter.value);
      }
    }

    for (let table of this.dom.tables) {
      if (table.classList.contains('selected')) {
        thisBooking.tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if (!isNaN(thisBooking.tableId)) {
          thisBooking.tableId = parseInt(thisBooking.tableId);
        }
        booking.table.push(thisBooking.tableId);
      }
    }

    //console.log('booking', booking);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse booking', parsedResponse);
      });

    this.makeBooked(booking.date, booking.hour, booking.duration, booking.table);
    //console.log('this.booked after booking', this.booked);
  }

  makeBooked(date, hour, duration, table) {

    if (typeof this.booked[date] === 'undefined') {
      this.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log('loop', hourBlock);

      if (typeof this.booked[date][hourBlock] === 'undefined') {
        this.booked[date][hourBlock] = [];
      }

      this.booked[date][hourBlock] = this.booked[date][hourBlock].concat(table).filter((number, index, array) => array.indexOf(number) === index);
    }

    //console.log('this.booked', this.booked);
  }

  updateDOM() {
    this.date = this.datePicker.value;
    this.hour = utils.hourToNumber(this.hourPicker.value);

    let allAvailable = false;

    //console.log('this.booked', this.booked);

    if (typeof this.booked[this.date] === 'undefined' || typeof this.booked[this.date][this.hour] === 'undefined') {
      allAvailable = true;
    }

    for (let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (table.classList.contains('selected')) {
        return;
      }


      if (!allAvailable && this.booked[this.date][this.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }

  }

  initWidgets() {
    const thisBooking = this;

    this.peopleAmount = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmount = new AmountWidget(this.dom.hoursAmount);

    this.datePicker = new DatePicker(this.dom.datePicker);

    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }

}

export default Booking;
