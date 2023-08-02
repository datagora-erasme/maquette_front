import { createStore } from 'vuex';
import authentication from './authentication';
import map from './map';

// Create a new store instance.
const store = createStore({
  modules: {
    authentication: authentication,
    map: map,
  },
});

export default store;
