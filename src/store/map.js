
const map = {
  namespaced: true,
  state: () => ({
    currentMockupUrl: null,
  }),
  mutations: {
    SET_CURRENT_MOCKUP_URL(state, url) {
      state.currentMockupUrl = url;
    },
  },
  actions: {
    setCurrentMockupDownloadLink({ commit }, url) {
      commit('SET_CURRENT_MOCKUP_URL', url);
    },
  },
  getters: {
    getCurrentMockupDownloadLink(state) {
      return state.currentMockupUrl;
    },
  },
};

export default map;
