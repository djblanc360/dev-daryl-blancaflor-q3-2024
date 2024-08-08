import Swiper from 'swiper';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/swiper-bundle.css'; 
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

Swiper.use([Navigation, Pagination, Thumbs]);

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.quantity = 0;
    this.init();
  }

  connectedCallback() {
  }

  init() {
    console.log('in ProductForm');
  }

  addToCart() {}
}

class VariantSwatch extends HTMLElement {
  constructor() {
    super();
    console.log('in VariantSwatch');
  }

  connectedCallback() {
    // this.initSwiper();
  }

  initSwiper() {
    new Swiper(this.querySelector('.swiper'), {
      modules: [Navigation, Pagination],
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
      },
      loop: true,
      slidesPerView: 3,
      spaceBetween: 10,
    });
  }
}
// customElements.define('variant-swatch', VariantSwatch);

class MediaGallery extends HTMLElement {
  constructor() {
    super();
    this.initSwiper();
    console.log('in MediaGallery');
  }

  connectedCallback() {
    this.initSwiper();
  }

  initSwiper() {
    const galleryThumbs = new Swiper('.gallery-thumbs', {
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
      direction: 'vertical',
    });

    new Swiper('.gallery-main', {
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      thumbs: {
        swiper: galleryThumbs,
      },
    });
  }
}
// customElements.define('media-gallery', MediaGallery);



class Product {
  constructor() {
    console.log('in Product');
    this.initializeWebComponents();
  }

  connectedCallback() {
    console.log('in Product connectedCallback');
  }

  initializeWebComponents() {
      customElements.define('product-form', ProductForm);
      customElements.define('variant-swatch', VariantSwatch);
      customElements.define('media-gallery', MediaGallery);
  }
}

if (document.querySelector('.product-page')) {
  new Product();
}
