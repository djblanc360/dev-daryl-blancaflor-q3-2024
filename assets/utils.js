const Utils = {};
// polling.js
Utils.api ={polling: async (callback, ms, attempts)=> {return new Promise(async (resolve, reject)=> {const interval = setInterval(async ()=> {if(await callback()){resolve();clearInterval(interval);}else if(attempts <= 1){reject('Max attempts reached');clearInterval(interval);}attempts -= 1;}, ms);});}, sleep: async (ms)=> {return new Promise(resolve => setTimeout(resolve, ms));}, }
export default Utils;