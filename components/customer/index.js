// functionality for customer to be used in admin settings
const POLLING_DELAY = {
    MIN: 5000, // 5 seconds
    MAX: 30000, // 30 seconds
}
const POLLING_ATTEMPTS = 3;

const Customer = {

    init: (customer) => {
        Customer.promotionHistory.init(customer);
        Customer.ipTracking.init(); // server must be running, condition with schema
    },

    // for testing new customer
    // can remove sub-objects by passing in key
    // example: Customer.clear('ipTracking');
    clear: (obj) => {
        const customer = Customer.get();
        if (!obj) customer = {};

        for (const key in customer) {
            if (key === obj) {
                delete customer[key];
                break;
            }
        }
        Customer.save(customer);
        window.customer = customer;
    },

    get: () => {
        const customer = JSON.parse(localStorage.getItem('customer'));
        if (customer && customer.promotionHistory) {
            customer.promotionHistory = new Map(customer.promotionHistory);
        }
        return customer;
    },

    // refactor to /integrations/ipTracking
    ipTracking: {
        init: async () =>{
            const customer = Customer.get();

            try {
                await Customer.ipTracking.polling(async () => {
                    // if server directory is running
                    const active = await Customer.ipTracking.isServerActive()
                    if (!customer.ipTracking && active) {
                        await Customer.ipTracking.getIp(customer);
                        console.log('ipTracking initialized');
                    } else {
                        // console.log('ipTracking not initialized');
                    }
                }, POLLING_DELAY.MIN, POLLING_ATTEMPTS);
            } catch (error) {
                console.error(`Failed to initialize ipTracking after ${POLLING_ATTEMPTS}: ${error}`);
            }
        },

        api: async (type, body={}) => {
            const url = 'http://localhost:3000/ip/track';
            const queryParams = {
                method: type,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            try {
                const response = await fetch(url, queryParams);
                if (!response.ok) {
                    throw new Error('Network response failed');
                }
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('ipTracking error', error);
            }
        },

        getIp: async (customer) => {
            const type = 'GET';
            const data = await Customer.ipTracking.api(type);
            customer.ipTracking = data;
            Customer.save(customer);
        },

        isServerActive: async () => {
            try {
                const response = await fetch(`http://localhost:3000`, {
                    method: 'HEAD',
                    mode: 'no-cors'
                });
        
                return true;
            } catch (error) {
                return false;
            }
        },

        // utility refactor or do websocket in server/
        // https://morioh.com/a/2e1c6c90f85a/how-to-turn-settimeout-and-setinterval-into-promises
        polling: async (callback, ms, attempts) => {
            return new Promise(async (resolve, reject) => {
                const interval = setInterval(async () => {
                    if (await callback()) {
                        resolve();
                        clearInterval(interval);
                    } else if (attempts <= 1) {
                        reject('Max attempts reached');
                        clearInterval(interval);
                    }
                    attempts -= 1;
                }, ms);
            });
        },

        sleep: async (ms) => { // utility refactor
            return new Promise(resolve => setTimeout(resolve, ms));
        },
    },

    promotionHistory: {
        init:(customer) => {
            customer.promotionHistory = customer.promotionHistory 
                ? new Map(customer.promotionHistory) : new Map();
            // console.log('promotionHistory initialized', customer.promotionHistory);
            Customer.save(customer);
        },

        addPromotion: (customer, promo) => {
            customer.promotionHistory.set(
                promo.key,
                {
                    promo: promo,
                    seen: 1,
                    seenAt: null,
                    dismissed: 0,
                    dismissedAt: null,
                }
            );
            Customer.save(customer);
        },

        handleSeenPromotion: (promo) => {
            const customer = Customer.get();

            if (customer.promotionHistory.size == 0) {
                Customer.promotionHistory.addPromotion(customer, promo);
                return;
            }
            

            if (!customer.promotionHistory.has(promo.key)) {
                Customer.promotionHistory.addPromotion(customer, promo);
                return;
            }

            let obj = customer.promotionHistory.get(promo.key);
            obj.seenAt = new Date();
            obj.seen += 1;
            customer.promotionHistory.set(promo.key, obj);
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
        window.customer = customer; // run first to keep promoHistory as map

        if (!customer.promotionHistory) customer.promotionHistory = new Map();

        const customerSave = {
            ...customer,
            promotionHistory: Array.from(customer.promotionHistory.entries()),
        };
        
        localStorage.setItem('customer', JSON.stringify(customerSave));
        // window.customer = customerSave;
    },


}

export default Customer;
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
    // console.log('DOMContentLoaded', customer);
    if (customer) {
        window.dispatchEvent(new CustomEvent('Customer:loaded', { 
            bubbles: true,
            detail:customer 
        }));
    }
});