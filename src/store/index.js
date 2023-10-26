import { createStore } from 'vuex';
import authentication from './authentication';
import aside from './aside';
import map from './map';
import project from './project';

const store = createStore({
  modules: {
    authentication,
    aside,
    map,
    project,
  },
});

export default store;
