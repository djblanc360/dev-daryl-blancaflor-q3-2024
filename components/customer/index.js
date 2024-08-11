// functionality for customer to be used in admin settings

const Customer = {

    init: (customer) => {
        Customer.promotionHistory.init(customer);
        console.log('Customer initialized', customer);
        window.customer = customer;
    },

    get: () => {
        const customer = JSON.parse(localStorage.getItem('customer'));
        if (customer && customer.promotionHistory) {
            customer.promotionHistory = new Map(customer.promotionHistory);
        }
        return customer;
    },

    promotionHistory: {
        init:(customer) => {
            customer.promotionHistory = customer.promotionHistory 
                ? new Map(customer.promotionHistory) : new Map();
            Customer.save(customer);
        },

        handleSeenPromotion: (promo) => {
            const customer = Customer.get();
            console.log('handleSeenPromotion customer.promotionHistory', customer.promotionHistory);
            if (customer.promotionHistory.has(promo.key)) {
                let obj = customer.promotionHistory.get(promo.key);
                obj.seenAt = new Date();
                obj.seen += 1;
                customer.promotionHistory.set(promo.key, obj);
            } else {
                customer.promotionHistory.set(
                    promo.key,
                    {
                        promo: promo,
                        seen: 1,
                        seenAt: new Date(),
                        dismissed: 0,
                        dismissedAt: null,
                    }
                );
            }
            Customer.save(customer);
        },

        dismissPromotion: (key) => {
            const customer = Customer.get();
            if (customer.promotionHistory.has(key)) {
                let promo = customer.promotionHistory.get(key);
                promo.dismissedAt = new Date();
                promo.dismissed += 1;
                customer.promotionHistory.set(key, promo);
            }
            Customer.save(customer);
        },
    },

    save: (customer) => {
        const customerSave = {
            ...customer,
            promotionHistory: Array.from(customer.promotionHistory.entries()),
        };

        localStorage.setItem('customer', JSON.stringify(customerSave));
        window.customer = customerSave;
    },


}

window.Customer = Customer;


window.addEventListener('Customer:loaded', e => {
    console.log('Customer:loaded', e.detail);
    Customer.init(e.detail);
});

window.addEventListener('Promotions:seen', e => {
    console.log('Promotions:seen', e.detail);
    Customer.promotionHistory.handleSeenPromotion(e.detail);
});

window.addEventListener('Promotions:dismissed', e => {
    console.log('Promotions:dismissed', e.detail);
    Customer.promotionHistory.dismissPromotion(e.detail);
});



window.addEventListener('DOMContentLoaded', e => {
    const customer = JSON.parse(localStorage.getItem('customer'));
    console.log('DOMContentLoaded', customer);
    if (customer) {
        window.dispatchEvent(new CustomEvent('Customer:loaded', { 
            bubbles: true,
            detail:customer 
        }));
    }
});