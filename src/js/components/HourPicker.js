import BaseWidget from './BaseWidget.js';
import utils from '../utils.js';
import { settings, select } from '../settings.js';

// import { select, settings } from '../settings.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );

    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.output
    );

    thisWidget.initPlugin();
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  initPlugin() {
    const thisWidget = this;

    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.output.innerHTML = `${settings.hours.open}`;

    thisWidget.dom.input.addEventListener('input', function() {
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;

  }
}

export default HourPicker;
