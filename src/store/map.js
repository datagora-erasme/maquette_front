import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const map = {
  namespaced: true,
  state: () => ({
    platesX: null,
    platesY: null,
    currentMockupUrl: null,
    currentMockupObjFile: null, //Blob containing the obj file's content. Downloadable with a .obj extension.
    // voxelizedSingleMesh: null,
  }),
  mutations: {
    SET_CURRENT_MOCKUP_URL(state, url) {
      state.currentMockupUrl = url;
    },
    SET_CURRENT_MOCKUP_OBJ(state, blob) {
      state.currentMockupObjFile = blob;
    },
    SET_PLATES_X(state, platesX) {
      state.platesX = platesX;
    },
    SET_PLATES_Y(state, platesY) {
      state.platesY = platesY;
    },
  },
  actions: {
    setPlates({ commit }, plates) {
      commit('SET_PLATES_X', plates.x);
      commit('SET_PLATES_Y', plates.y);
    },
    setCurrentMockupDownloadLink({ commit }, url) {
      commit('SET_CURRENT_MOCKUP_URL', url);
    },
    setCurrentMockupObjFile({ commit }, blob) {
      commit('SET_CURRENT_MOCKUP_OBJ', blob);
    },
  },
  getters: {
    getCurrentMockupDownloadLink(state) {
      return state.currentMockupUrl;
    },
    getPlates(state) {
      return { x: state.platesX, y: state.platesY };
    },
    // getVoxelizedSingleMesh(state) {
    //   return state.voxelizedSingleMesh;
    // },
  },
};

export default map;
