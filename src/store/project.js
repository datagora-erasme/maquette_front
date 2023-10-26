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
    fetchProjectsList({ commit }) {
      return axios
        .get('/projects')
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