class Modal extends HTMLElement {
  constructor() {
    super();
    this.handleClose = this.handleClose.bind(this);
    this.modal = this.querySelector('.modal');
    this.overlay = this.querySelector('.modal-overlay');
    this.settings = JSON.parse(this.dataset.settings);
    this.currentLocation = window.location.href;
    console.log('location', this.currentLocation);
    console.log('settings', this.settings);
    this.modalRequirements();
  }

  connectedCallback() {
    this.querySelector('[modal-close]').addEventListener('click', this.handleClose);
  }

  disconnectedCallback() {
    this.querySelector('[modal-close]').removeEventListener('click', this.handleClose);
  }

  handleClose() {
    this.modal.style.display = 'none';
    this.overlay.style.display = 'none';
    // send dismiss event to customer object
  }

  handleOpen() {
    this.modal.style.display = 'block';
    this.overlay.style.display = 'block';
  }

  modalRequirements() {
    const isDisplayLocation = this.currentLocation.includes(this.settings.location_type);

    console.log('isDisplayLocation', isDisplayLocation);
    if (!isDisplayLocation) {
      return;
    }

    const { select_type } = this.settings;
    console.log('selectType', select_type);
    switch (select_type) {
      case 'promo':
        if (this.validatePromotion()) this.handleOpen();
        break;
      case 'newsletter':
        break;
      case 'back_in_stock':
        break;
      default:
        console.log('no modal type');
    }
  }

  validatePromotion() {
    const promotions = JSON.parse(localStorage.getItem('promotions'));
    console.log('promotions', promotions);
    const promotion = promotions.find((promo) => promo.key === this.settings.promo_key);
    console.log('promotion', promotion);




    const checkUTMparams = (utm) => {
      if (promotion.utm_medium) console.log('utm_medium', utm);
      let params = new URLSearchParams(window.location.search);
      let utmMedium = params.has('utm_medium') ? params.get('utm_medium') : false;
      console.log('utmMedium', utmMedium);
      return utm === utmMedium;
    }

    const validUTMparams = promotion.utm_medium ? checkUTMparams(promotion.utm_medium) : true;

    const checkDiscount = (discount) => {
      let substr = 'discount_code';
      let cookies = document.cookie.split("; ");
      let discountCode = cookies.find(cookie => cookie.startsWith(substr));
      let value = discountCode ? discountCode.split('=')[1] : null;
      console.log('discountCode', discountCode);
      return value === discount;
    }

    const validDiscount = promotion.discount ? checkDiscount(promotion.discount) : true;



    const isPromoLocation = validUTMparams && validDiscount;
    console.log('isPromoLocation', isPromoLocation);



    const condition = promotion.condition ? new String(promotion.condition) : '';
    console.log('condition', condition);
    const meetsCondition = eval(String(condition));
    console.log('meetsCondition', meetsCondition);

    const isActive = promotion.isActive;
    console.log('isActive', isActive);

    if (!isActive) return false;

    if (isPromoLocation || meetsCondition) {
      console.log('show promotion');
    }
    // if customer dismissed modal 

    return isPromoLocation || meetsCondition
  }
}

customElements.define('base-modal', Modal);
