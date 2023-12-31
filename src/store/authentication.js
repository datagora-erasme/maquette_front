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
    ongoingPasswordRecuperation: false,
    ongoingPasswordModification: false,
  }),
  getters: {
    getLoggedUser(state) {
      return state.loggedUser;
    },
    getIsUserLoggedIn(state) {
      return state.isUserLoggedIn;
    },
    getOngoingPasswordRecuperation(state) {
      return state.ongoingPasswordRecuperation;
    },
    getOngoingPasswordModification(state) {
      return state.ongoingPasswordModification;
    }
  },
  mutations: {
    SET_LOGGED_USER(state, loggedUser) {
      state.loggedUser = loggedUser;
      state.isUserLoggedIn = true;
    },
    LOGOUT(state) {
      state.loggedUser = { firstname: null, lastname: null, email: null };
      state.isUserLoggedIn = false;
    },
    ONGOING_PASSWORD_RECUPERATION(state, value) {
      state.ongoingPasswordRecuperation = value;
    },
    ONGOING_PASSWORD_MODIFICATION(state, value) {
      state.ongoingPasswordModification = value;
    },
  },
  actions: {
    setOngoingPasswordRecuperation({ commit }, value) {
      commit('ONGOING_PASSWORD_RECUPERATION', value);
    },
    setOngoingPasswordModification({ commit }, value) {
      commit('ONGOING_PASSWORD_MODIFICATION', value);
    },
    patchChangePasswordWithToken({}, formPassword) {
      const headers = {
        Authorization: `Bearer ${formPassword.token}`,
      };
      return axios
        .patch('/auth', 
        { password: formPassword.password }, 
        { headers })
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    verifySession({ dispatch, commit }) {
      const cookiesToken = cookies.get('token');
      if (!cookiesToken) {
        cookies.remove('token'); // just in case
        removeAxiosToken();
        commit('LOGOUT');
        // console.log('TOKEN NOT IN COOKIES');
        return;
      }
      dispatch('verifyToken', cookiesToken)
        .then(() => {
          // The token is valid : add it again to axios config just in case
          setAxiosToken(cookiesToken);
          dispatch('fetchUserInfo');
          // console.log('TOKEN IN COOKIES IS VALID');
        })
        .catch(() => {
          // If not valid, logout
          // console.log('TOKEN IN COOKIES IS NOT VALID');
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
      commit('SET_LOGGED_USER', {
        firstname: data.firstname,
        lastname: data.lastname,
      });
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
    postResetPassword({}, email) {
      return axios
        .post('/auth/reset', email)
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
            id: userInfos.id,
            id_user: userInfos.id_user,
          });
          return Promise.resolve(response);
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    },
    patchUserInfo({ commit }, updatedUserInfos) {
      return axios
        .patch('/users/' + updatedUserInfos.id_user, updatedUserInfos)
        .then((response) => {
          commit('SET_LOGGED_USER', {
            firstname: updatedUserInfos.firstname,
            lastname: updatedUserInfos.lastname,
            email: updatedUserInfos.email,
            id: updatedUserInfos.id,
            id_user: updatedUserInfos.id_user,
          });
          return Promise.resolve(response);
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    }
  },
};

export default authentication;
