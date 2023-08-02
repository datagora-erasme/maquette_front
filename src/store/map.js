const map = {
  state: () => ({
    test: false,
  }),
  mutations: {
    SET_TEST(state, test) {
      state.test = test;
    },
  },
  actions: {
    setEmail({ commit }, test) {
      commit('SET_TEST', test);
    },
  },
  getters: {
    getTest(state) {
      return state.test;
    },
  },
};

export default map;
