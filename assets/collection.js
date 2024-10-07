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

class OptionSwatch extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productId;
    this.collectionId = this.dataset.collectionId;
    this.product = window.collections[this.collectionId]?.products.find(product => product.id == this.productId);
    // console.log('in OptionSwatch product', this.product);
    if (!this.product) {
      console.error(`Product with ID ${this.productId} not found in collection ${this.collectionId}`);
    }
  }

  selectVariant(variant) {
    console.log('selectVarian variant', variant);
    const event = new CustomEvent('variantChange', { detail: { variant } });
    this.dispatchEvent(event);
  }

  connectedCallback() {
    this.querySelectorAll('[option-swatch]').forEach(swatch => {
        swatch.addEventListener('click', () => {
            const variantId = swatch.dataset.variantId
            console.log('on option swatch click', variantId)
            const selectedVariant = this.product.variants.find(variant => variant.id == variantId);
            if (selectedVariant) {
                this.selectVariant(selectedVariant);
            }
        })
    })

    this.addEventListener('variantChange', (event) => {
        const { variant } = event.detail;
        console.log('variant', variant);

        const card = this.closest('[product-card]');
        // console.log('card', card);
  
        if (card) {
          const allImages = card.querySelectorAll('img[option-image]');
          allImages.forEach(image => image.classList.add('hidden'));

          const matchingImage = Array.from(allImages).find(img => img.alt === variant.option1);
          if (matchingImage) {
            matchingImage.classList.remove('hidden'); // Show the matching image
          }
            const optionTitle = card.querySelector('[option-title]');
            optionTitle.textContent = variant.option1;

            const optionLink = card.querySelector('[option-url]');
            const baseUrl = optionLink.getAttribute('href').split('?')[0];
            const optionUrl = `${baseUrl}?variant=${variant.id}`;
            optionLink.setAttribute('href', optionUrl)
        }
        
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
    customElements.define('option-swatch', OptionSwatch);
  }
}

// conditionally instantiate Collection if a specific DOM element exists to prevent running on all pages
if (document.querySelector('.collection-wrapper')) {
  new Collection();
}
