import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// axios.defaults.baseURL = config.baseURL;
axios.defaults.timeout = 12000;

axios.interceptors.response.use((res) => {
    if (res?.data?.errors && res?.data?.errors.length > 0) {
        return { errors: res?.data?.errors, code: 500 };
    }
    if (res?.status == 200) {
        return { ...res?.data, code: 200 };
    }
    return { code: 400 };

}, (error) => {
    return Promise.reject(error);
});

export default axios;
