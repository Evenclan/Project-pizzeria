import { select, classNames } from '../settings.js';

class Carousel {
  constructor() {
    let slides = document.querySelectorAll(select.carousel.slider);
    let circles = document.querySelectorAll(select.carousel.circle);
    let currentSlide = 0;
    setInterval(nextSlide, 3000);

    function nextSlide() {
      slides[currentSlide].classList.remove(classNames.slider.active);
      circles[currentSlide].classList.remove(classNames.circle.active);

      currentSlide = (currentSlide + 1) % slides.length;
      console.log('currentSlide', currentSlide);

      slides[currentSlide].classList.add(classNames.slider.active);
      circles[currentSlide].classList.add(classNames.circle.active);
    }
  }
}

export default Carousel;
