const aside = {
  namespaced: true,
  state: () => ({
    asideStatus: false,
    asidePosStatus: false,
  }),
  getters: {
    getAsideStatus(state) {
      return state.asideStatus
    },
    getAsidePosStatus(state) {
      return state.asidePosStatus
    },
  },
  mutations: {
    SET_ASIDE_STATUS(state, newStatus) {
      state.asideStatus = newStatus
    },
    SET_ASIDE_POS_STATUS(state, newStatus) {
      state.asidePosStatus = newStatus
    },
  },
  actions: {
    setAsideStatus({ dispatch, commit }, newStatus) {
      commit('SET_ASIDE_STATUS', newStatus)
    },
    setAsidePosStatus({ dispatch, commit }, newStatus) {
      commit('SET_ASIDE_POS_STATUS', newStatus)
    },
  },
};

export default aside;
