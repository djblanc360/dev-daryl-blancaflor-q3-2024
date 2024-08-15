
Utils.api = {
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
}