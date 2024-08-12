
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
    const { select_type } = this.settings;
    if (select_type === 'promo') {
      window.dispatchEvent(new CustomEvent('Promotions:dismissed', { 
        bubbles: true,
        detail:this.settings.promo_key
      }));
    }
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

  customerRequirements(promotion) {
    const customer = Customer.get();

    if (!this.settings.seenCount && !this.settings.dismissedCount) return true;

    const promotionHistory = customer.promotionHistory.get(promotion.key);

    if (!promotionHistory) return true;

    if (this.settings.seenCount && promotionHistory.seen >= this.settings.seenCount) return false;
    
    if (this.settings.dismissedCount && promotionHistory.dismissed >= this.settings.dismissedCount) return false;

    return true;
  }

  validatePromotion() {
    const promotions = JSON.parse(localStorage.getItem('promotions'));
    const promotion = promotions.find((promo) => promo.key === this.settings.promo_key);
    console.log('promotion', promotion);

    // modal requirements, refactor after newsletter and back_in_stock
    const validCustomer = this.customerRequirements(promotion);
    console.log('validCustomer', validCustomer);
    if (!validCustomer) return false;

    const checkUTMparams = (utm) => {
      if (promotion.utm_medium) console.log('utm_medium', utm);
      let params = new URLSearchParams(window.location.search);
      let utmMedium = params.has('utm_medium') ? params.get('utm_medium') : false;
      console.log('utmMedium', utmMedium);
      return utm === utmMedium;
    }

    const validUTMparams = promotion.utm_medium ? checkUTMparams(promotion.utm_medium) : false;

    const checkDiscount = (discount) => {
      console.log('checkDiscount - discount', discount);
      let substr = 'discount_code';
      let cookies = document.cookie.split("; ");
      let discountCode = cookies.find(cookie => cookie.startsWith(substr));
      let value = discountCode ? discountCode.split('=')[1] : null;
      console.log('checkDiscount - discountCode', discountCode, value === discount);
      return value === discount;
    }


    const validDiscount = promotion.discountCode ? checkDiscount(promotion.discountCode) : false;

    const isPromoLocation = validUTMparams || validDiscount;
    console.log(`isPromoLocation - validUTMparams: ${validUTMparams} || validDiscount: ${validDiscount} = ${isPromoLocation}`);

    const checkCondition = (condition) => {
      console.log('condition', condition);
      // const meetsCondition = eval(String(condition));
      const meetsCondition = new Function(`return (${condition})`)();
      console.log('meetsCondition', meetsCondition);
      return meetsCondition;
    }

    const validCondition = promotion.condition ? checkCondition(promotion.condition) : true;

    const isActive = promotion.isActive;
    console.log('isActive', isActive);

    if (!isActive) return false;

    if (isPromoLocation && validCondition) {
      // send seen event to customer object
      window.dispatchEvent(new CustomEvent('Promotions:seen', { 
        bubbles: true,
        detail:promotion 
      }));
      console.log('show promotion');
    }
    // if customer dismissed modal 

    return isPromoLocation && validCondition
  }
}
window.addEventListener('DOMContentLoaded', e => {
  customElements.define('base-modal', Modal); // ensures it runs after Customer
});
