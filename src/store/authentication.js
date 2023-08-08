import { axiosInstance as axios, setToken as setAxiosToken, removeToken as removeAxiosToken } from '../axios';
import { cookies } from '../utils/cookies';

const authentication = {
  namespaced: true,
  state: () => ({
    isUserLoggedIn: false,
    loggedUser: {
      firstname: null,
      lastname: null,
      email: null,
    },
  }),
  mutations: {
    SET_LOGGED_USER(state, loggedUser) {
      state.loggedUser = loggedUser;
      state.isUserLoggedIn = true;
    },
    LOGOUT(state) {
      state.loggedUser = { firstname: null, lastname: null, email: null };
      state.isUserLoggedIn = false;
    },
  },
  actions: {
    verifySession({ dispatch, commit }) {
      const cookiesToken = cookies.get('token');
      if (!cookiesToken) {
        cookies.remove('token'); // just in case
        removeAxiosToken();
        commit('LOGOUT');
        console.log('TOKEN NOT IN COOKIES')
        return;
      }
      dispatch('verifyToken', cookiesToken)
        .then(() => {
          // The token is valid : add it again to axios config just in case
          setAxiosToken(cookiesToken);
          dispatch('fetchUserInfo');
          console.log('TOKEN IN COOKIES IS VALID');
        })
        .catch(() => {
          // If not valid, logout
          console.log('TOKEN IN COOKIES IS NOT VALID');
          cookies.remove('token'); // just in case
          removeAxiosToken();
          commit('LOGOUT');
        });
    },
    verifyToken({}, token) {
      return axios
        .get('/auth/token', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    // data: { firstname: string, lastname: string, token: string }
    setLoggedUser({ commit }, data) {
      cookies.set('token', data.token, { path: '/' });
      setAxiosToken(data.token);
      commit('SET_LOGGED_USER', { firstname: data.firstname, lastname: data.lastname });
    },
    logout({ commit }) {
      cookies.remove('token');
      removeAxiosToken();
      commit('LOGOUT');
    },
    postLogin({}, formLogin) {
      return axios
        .post('/auth/login', formLogin)
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    fetchUserInfo({ commit }) {
      return axios
        .get('/auth/user', {
          // headers: { Authorization: `Bearer ${cookies.get('token')}` },
        })
        .then((response) => {
          const userInfos = response.data.user;
          commit('SET_LOGGED_USER', {
            firstname: userInfos.firstname,
            lastname: userInfos.lastname,
            email: userInfos.email,
          });
          return Promise.resolve(response);
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    },
  },
  getters: {
    getLoggedUser(state) {
      return state.loggedUser;
    },
    getIsUserLoggedIn(state) {
      return state.isUserLoggedIn;
    },
  },
};

export default authentication;
