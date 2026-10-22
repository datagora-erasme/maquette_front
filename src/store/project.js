import { axiosInstance as axios } from '../axios';

const project = {
  namespaced: true,
  state: () => ({
    projectsList: []
  }),
  getters: {
    getProjectsList(state) {
      return state.projectsList
    }
  },
  mutations: {
    SET_PROJECTS_LIST(state, newList) {
      state.projectsList = newList
    }
  },
  actions: {
    fetchProjectsList({ commit, dispatch, rootGetters }) {
      // The role is not known right after login : fetch user infos if needed
      const userInfosPromise = rootGetters['authentication/getLoggedUser'].role
        ? Promise.resolve()
        : dispatch('authentication/fetchUserInfo', null, { root: true });
      return userInfosPromise
        .then(() => {
          const { role, id_user } = rootGetters['authentication/getLoggedUser'];
          // A SUPERADMIN can see all projects, other users only their own
          const params = role === 'SUPERADMIN' ? {} : { user_id: id_user };
          return axios.get('/projects', { params });
        })
        .then((response) => {
          commit('SET_PROJECTS_LIST', response.data);
          return Promise.resolve(response.data);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    saveProject({ commit }, newMockupObj) {
      return axios
        .post('/projects', newMockupObj)
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    updateProject({ commit }, updatedMockupObj) {
      return axios
        .patch('/projects/' + updatedMockupObj.id, updatedMockupObj)
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    deleteProject({ commit }, deleteMockupId) {
      return axios
        .delete('/projects/' + deleteMockupId)
        .then((response) => {
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    }
  }
}

export default project;