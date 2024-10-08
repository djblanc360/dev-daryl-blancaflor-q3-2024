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
    // console.log('in ProductForm');
    window.addEventListener('variantChange', this.updateForm.bind(this));
  }

  updateForm(event) {

  }

  addToCart() {}
}

class VariantSwatch extends HTMLElement {
  constructor() {
    super();
    this.product = window.product;
    this.selectedOptions = [...this.product.selected_options]
  }

  initSwatches() {
    this.querySelectorAll('button[swatch]').forEach((swatch) => {
      swatch.addEventListener('click', (event) => {
        const optionValue = event.target.dataset.option;
        const optionIndex = event.target.dataset['optionIndex'];
        console.log('index, value ',optionIndex , optionValue)
        this.selectOption(optionIndex , optionValue)


        const variantId = event.target.dataset.variantId;
        const selectedVariant = this.product.variants.find(variant => variant.id == variantId);
        if (selectedVariant) {
          this.selectVariant(selectedVariant);
        }
      });
    });
  }

  selectOption(index, value) {
    this.selectedOptions[index] = value;
    console.log('pdp - in select variant, selected options: ',this.selectedOptions)

    this.querySelectorAll(`button[swatch][data-option-index="${index}"]`).forEach((swatch) => {
      if (swatch.dataset.option === value) {
        swatch.classList.add('border-black');
      } else {
        swatch.classList.remove('border-black');
      }
    });

    this.optionTitle(index, value);
  }

  optionTitle(index, value) {
    const title = this.querySelector(`[option-title][data-option-index="${index}"]`);
    if (title) {
      title.textContent = value;
    }
  }

  initOptions() {
    for (const [index, option] of this.selectedOptions.entries()) {
      this.selectOption(index, option)
    }
  }

  selectVariant(variant) {
    this.selectedOptions = variant.options;

    const event = new CustomEvent('variantChange', { detail: { variant } });
    this.dispatchEvent(event);
  }

  initVariant() {
    const selected = this.product.selected_variant;
    if (selected) {
        this.selectVariant(selected);
    }
  }

  connectedCallback() {
    // initialize swatches once the component is connected
    this.initSwatches();
    this.initOptions();
    this.initVariant();
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
