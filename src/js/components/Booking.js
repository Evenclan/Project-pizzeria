import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingSubpage) {
    const thisBooking = this;

    thisBooking.render(bookingSubpage);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initActions();
  }

  render(bookingSubpage) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingSubpage;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(
      select.widgets.amount.hours
    );
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(
      select.widgets.amount.people
    );
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.starters
    );
    thisBooking.dom.formSubmit = thisBooking.dom.wrapper.querySelector(
      select.booking.formSubmit
    );
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );

    thisBooking.dom.adress = thisBooking.dom.wrapper.querySelector(
      select.booking.adress
    );
  }

  getData() {
    const thisBooking = this;

    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      thisBooking.datePicker.minDate
    )}`;
    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(
      thisBooking.datePicker.maxDate
    )}`;

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam]
    };

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}?${params.booking.join(
        '&'
      )}`,
      eventsCurrent: `${settings.db.url}/${
        settings.db.event
      }?${params.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${
        settings.db.event
      }?${params.eventsRepeat.join('&')}`
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
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
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeReservation() {
    const thisBooking = this;
    const url = `${settings.db.url}/${settings.db.booking}`;

    const booking = {
      hour: thisBooking.hourPicker.value,
      date: thisBooking.datePicker.value,
      table: [],
      starters: [],
      duration: parseInt(thisBooking.dom.duration.value),
      people: parseInt(thisBooking.dom.people.value),
      phone: thisBooking.dom.phone.value,
      adress: thisBooking.dom.adress.value
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked === true) {
        booking.starters.push(starter.value);
      }
    }

    for (let table of thisBooking.dom.tables) {
      if (table.classList.contains('selected')) {
        thisBooking.tableId = table.getAttribute(
          settings.booking.tableIdAttribute
        );
        if (!isNaN(thisBooking.tableId)) {
          thisBooking.tableId = parseInt(thisBooking.tableId);
        }
        booking.table.push(thisBooking.tableId);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(booking)
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock] = this.booked[date][hourBlock].concat(table).filter((number, index, array) => array.indexOf(number) === index);
    }
  }

  isAvaible() {
    const thisBooking = this;

    console.log(thisBooking.dom.duration);
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ===
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initActions() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function() {
        if (table.classList.contains('booked')) {
          return;
        } else {
          table.classList.toggle('selected');
          thisBooking.tableId = table.getAttribute(
            settings.booking.tableIdAttribute
          );
        }
      });
    }

    thisBooking.hour = thisBooking.hourPicker.dom.input;
    thisBooking.date = thisBooking.datePicker.dom.input;

    thisBooking.hour.addEventListener('change', function() {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove('selected');
      }
    });

    thisBooking.date.addEventListener('change', function() {
      for (let table of thisBooking.dom.tables) {
        table.classList.remove('selected');
      }
    });
    thisBooking.dom.formSubmit.addEventListener('click', function() {
      event.preventDefault();
      thisBooking.makeReservation();
      for (let table of thisBooking.dom.tables) {
        table.classList.remove('selected');
      }
    });
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
  }
}

export default Booking;
