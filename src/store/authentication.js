import axios from 'axios';

const authentication = {
  state: () => ({
    isUserLoggedIn: false,
    loggedUser: {
      firstname: null,
      lastname: null,
    },
  }),
  mutations: {
    SET_LOGGED_USER(state, loggedUser) {
      state.loggedUser = loggedUser;
      state.isUserLoggedIn = true;
    },
  },
  actions: {
    setLoggedUser({ commit }, loggedUser) {
      commit('SET_LOGGED_USER', loggedUser);
    },
    postLogin({ commit }, formLogin) {
      return axios
        .post('https://dev-maquette.exo-dev.fr//api/auth/login', formLogin)
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
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
