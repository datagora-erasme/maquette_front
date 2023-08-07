import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const authentication = {
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
    LOGOUT_APP(state) {
      state.loggedUser = { firstname: null, lastname: null, email: null };
      state.isUserLoggedIn = false;
    },
  },
  actions: {
    setLoggedUser({ commit }, loggedUser) {
      commit('SET_LOGGED_USER', loggedUser);
    },
    logout({ commit }) {
      cookies.remove('token');
      commit('LOGOUT_APP');
    },
    postLogin({ commit }, formLogin) {
      return axios
        .post('https://dev-maquette.exo-dev.fr/api/auth/login', formLogin)
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    fetchUserInfo({ commit }) {
      return axios
        .get('https://dev-maquette.exo-dev.fr/api/auth/user', {
          headers: { Authorization: `Bearer ${cookies.get('token')}` },
        })
        .then((response) => {
          const userInfos = response.data.user

          commit('SET_LOGGED_USER', {
            firstname: userInfos.firstname,
            lastname: userInfos.lastname,
            email: userInfos.email
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
