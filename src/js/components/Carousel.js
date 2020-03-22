import {select } from '../settings.js';

class Carousel {
  constructor() {
    const thisCarousel = this;

    setInterval(thisCarousel.getQuotes, 2000);
  }

  getQuotes() {
    let slideNumber = 0;

    const sliders = document.querySelectorAll(select.carousel.slider);
    const circles = document.querySelectorAll(select.carousel.circle);

    console.log(sliders);
    console.log(circles);

    for (let i = 0; i < sliders.length; i++) {
      sliders[i].classList.remove('active');
      circles[i].classList.remove('active');
    }

    slideNumber++;
    console.log(slideNumber);

    if (slideNumber > sliders.length) {
      slideNumber = 1;

    }
    for (let i = 0; i < circles.length; i++) {
      circles[i].classList.remove('active');
    }
    sliders[slideNumber - 1].classList.add('active');
    circles[slideNumber - 1].classList.add('active');
  }


}

export default Carousel;
