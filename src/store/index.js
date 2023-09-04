import { createStore } from 'vuex';
import authentication from './authentication';
import aside from './aside';
import map from './map';

const store = createStore({
  modules: {
    authentication,
    aside,
    map,
  },
});

export default store;
