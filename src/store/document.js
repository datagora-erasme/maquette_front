import { axiosInstance as axios } from '../axios';

const project = {
  namespaced: true,
  state: () => ({
    document: null
  }),
  getters: {
    getDocument(state) {
      return state.document
    },
  },
  mutations: {
    SET_DOCUMENT(state, newDoc) {
      state.document = newDoc
    },
  },
  actions: {
    fetchDocument({ commit }, documentId) {
      return axios
        .get('/documents/' + documentId)
        .then((response) => {
          commit('SET_DOCUMENT', response);
          return Promise.resolve(response);
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    saveDocument({ commit }, newDoc) {
      return axios
        .post('/documents', newDoc)
        .then((response) => {
          return Promise.resolve(response)
        })
        .catch((e) => {
          return Promise.reject(e)
        });
    },
    deleteDocument({ commit }, deleteDocId) {
      return axios
        .delete('/documents/' + deleteDocId)
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