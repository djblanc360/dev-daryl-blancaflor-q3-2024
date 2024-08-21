import Swiper from 'swiper'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
Swiper.use([Navigation, Pagination]);


class Carousel extends HTMLElement {
  constructor() {
    super();
    this.products = JSON.parse(this.dataset.products || '[]');
    this.settings = JSON.parse(this.dataset.settings || '{}');
    this.initSwiper();
    console.log('in Carousel', this.products);
    console.log('in Carousel', this.settings);
  }

  connectedCallback() {
    this.initSwiper();
  }

  initSwiper() {

    new Swiper('.carousel', {
      spaceBetween: 10,
      slidesPerView: 1,
      centeredSlides: true,
      rewind: true,
      breakpoints: {
        640: {
          slidesPerView: 3,
          spaceBetween: 40
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 50
        },
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }
}

class Collection {
  constructor() {
    this.init();
  }

  init() {
    // init collection-specific logic
    customElements.define('base-carousel', Carousel);
  }
}

// conditionally instantiate Collection if a specific DOM element exists to prevent running on all pages
if (document.querySelector('.collection-wrapper')) {
  new Collection();
}
