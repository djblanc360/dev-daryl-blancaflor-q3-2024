import Swiper from 'swiper'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'
import { Navigation, Thumbs } from 'swiper/modules'

Swiper.use([Navigation, Thumbs]);

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

  selectVariant(variant) {
    const event = new CustomEvent('variantChange', { detail: { variant } });
    this.dispatchEvent(event);
  }

  connectedCallback() {
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
      watchSlidesProgress: true,
      direction: 'vertical',
      rewind: true,
      breakpoints: {
        640: {
          slidesPerView: 3,
          spaceBetween: 40
        }
      },
    });

    new Swiper('.gallery-main', {
      spaceBetween: 10,
      slidesPerView: 1,
      centeredSlides: true,
      rewind: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
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
    // console.log('in Product', window.product);
    this.initializeWebComponents();
    window.addEventListener('variantChange', this.updateProductState)
  }

  connectedCallback() {
    // console.log('in Product connectedCallback');
  }

  updateProductState(event) {
    // console.log('in updateProductState', event.detail);
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
