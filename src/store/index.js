import { createStore } from 'vuex';
import authentication from './authentication';
import map from './map';

const store = createStore({
  modules: {
    authentication,
    map,
  },
});

export default store;
