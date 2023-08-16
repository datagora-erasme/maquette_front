const aside = {
  namespaced: true,
  state: () => ({
    asideStatus: false,
  }),
  getters: {
    getAsideStatus(state) {
      return state.asideStatus;
    },
  },
  mutations: {
    SET_ASIDE_STATUS(state, newStatus) {
      state.asideStatus = newStatus;
    },
  },
  actions: {
    setAsideStatus({ dispatch, commit }, newStatus) {
      commit('SET_ASIDE_STATUS', newStatus);
    },
  },
};

export default aside;
