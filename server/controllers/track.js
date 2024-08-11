import os from 'os'

const useIP = async (ipData) => {
    const ip = ipData['Wi-Fi'].find(item => item.family === 'IPv6').address;

    const fields = 'fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query'
    const query = `${ip}?${fields}`
    const url = `http://ip-api.com/json/${query}`
    const queryParams = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    try {
        const res = await fetch(url, queryParams);
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await res.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('error', error);
    }
}


const trackUser = async (req, res) => {
    const ipData = os.networkInterfaces();
    const data = await useIP(ipData);
    res.send(data);
}

export { trackUser }