import axios from "axios"

const axiosClient = axios.create({
    // baseURL: 'https://api.algobench.site', // AWS deployment URL (commented out for local dev)
    baseURL: 'http://localhost:3000', // Local development URL
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

