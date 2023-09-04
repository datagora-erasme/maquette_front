import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api-dev-maquette.exo-dev.fr/api',
});

const setToken = (token) => {
  axiosInstance.defaults.headers.common.Authorization = 'Bearer ' + token;
}
const removeToken = () => {
  axiosInstance.defaults.headers.common.Authorization = undefined;
}

export { axiosInstance, setToken, removeToken };