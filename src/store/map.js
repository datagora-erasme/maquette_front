const map = {
  state: () => ({
    currentMockup: null,
  }),
  mutations: {
    SET_CURRENT_MOCKUP(state, currentMockup) {
      state.currentMockup = currentMockup;
    },
  },
  actions: {
    setCurrentMockup({ commit }, currentMockup) {
      commit('SET_CURRENT_MOCKUP', currentMockup);
    },
  },
  getters: {
    getCurrentMockup(state) {
      return state.currentMockup;
    },
  },
};

export default map;
