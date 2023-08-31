import { generateCSV, generateHeightMap } from '../utils/threeUtils';
import { axiosInstance as axios } from '../axios';

const map = {
  namespaced: true,
  state: () => ({
    selectedArea: null,
    platesX: null,
    platesY: null,
    voxelizedMesh: null,
    voxelizedMeshObjContent: null,
    heightMap: null,
    isCSVGenerationOngoing: false,
    csvString: null,
  }),
  mutations: {
    SET_SELECTED_AREA(state, selectedArea) {
      state.selectedArea = selectedArea;
    },
    SET_PLATES_X(state, platesX) {
      state.platesX = platesX;
    },
    SET_PLATES_Y(state, platesY) {
      state.platesY = platesY;
    },
    SET_HEIGHT_MAP(state, heightMap) {
      state.heightMap = heightMap;
    },
    SET_OBJ_CONTENT(state, content) {
      state.voxelizedMeshObjContent = content;
    },
    SET_CSV_STRING(state, csvString) {
      state.csvString = csvString;
    },
    SET_VOXELIZED_MESH(state, voxelizedMesh) {
      state.voxelizedMesh = voxelizedMesh;
    },
    SET_IS_CSV_GENERATION_ONGOING(state, isCSVGenerationOngoing) {
      state.isCSVGenerationOngoing = isCSVGenerationOngoing;
    },
  },
  actions: {
    /**
     * @param {{x: number, y: number}} plates : Number of horizontal (x) and vertical (y) plates
     */
    setPlates({ commit }, plates) {
      commit('SET_PLATES_X', plates.x);
      commit('SET_PLATES_Y', plates.y);
    },
    setSelectedArea({ commit }, selectedArea) {
      commit('SET_SELECTED_AREA', selectedArea);
    },
    setVoxelizedMeshObjContent({ commit }, content) {
      commit('SET_OBJ_CONTENT', content);
    },
    setVoxelizedMesh({ commit }, voxelizedMesh) {
      commit('SET_VOXELIZED_MESH', voxelizedMesh);
    },
    voxelizeBbox({ commit }, bbox) {
      return axios
        .post('/dataprocess/bbox', { bbox, ratio: 1 })
        .then((response) => {
          commit('SET_OBJ_CONTENT', atob(response.data.data));
          return Promise.resolve(atob(response.data.data));
        })
        .catch((e) => {
          return Promise.reject(e);
        });
    },
    /**
     * Calls {@link generateHeightMap}, returns the heightmap and stores it in the store (state.heightMap).
     * @param {{mesh: THREE.Mesh, platesX: number, platesY: number}} data
     */
    generateHeightMap({ commit }, data) {
      return new Promise((resolve) => {
        try {
          commit('SET_IS_CSV_GENERATION_ONGOING', true);
          generateHeightMap(data.mesh, data.platesX, data.platesY).then(
            (heightMap) => {
              commit('SET_HEIGHT_MAP', heightMap);
              return resolve(heightMap);
            }
          );
        } catch (error) {
          return reject(error);
        }
      });
    },
    /**
     * Calls {@link generateCSV}, returns the CSV string and stores it in the store (state.csvString).
     * @param {{heightMap: Uint8Array, platesX: number}} data
     */
    generateCSVString({ commit }, data) {
      return new Promise((resolve, reject) => {
        try {
          const csvString = generateCSV(data.heightMap, data.platesX);
          commit('SET_CSV_STRING', csvString);
          return resolve(csvString);
        } catch (error) {
          return reject(error);
        }
      });
    },
    downloadCSV({ commit }, { csvString, name }) {
      let encodedUri = encodeURI(csvString);
      let link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      commit('SET_IS_CSV_GENERATION_ONGOING', false);
    },
    downloadMesh({ state }) {
      const blob = new Blob([state.voxelizedMeshObjContent], {
        type: 'text/plain',
      });
      const downloadUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'Modele3D.obj'; // Change the file name as desired
      downloadLink.click();
    },
  },
  getters: {
    getSelectedArea(state) {
      return state.selectedArea;
    },
    getPlates(state) {
      return { x: state.platesX, y: state.platesY };
    },
    getVoxelizedMeshObjContent(state) {
      return state.voxelizedMeshObjContent;
    },
    getVoxelizedMesh(state) {
      return state.voxelizedMesh;
    },
    getIsCSVGenerationOngoing(state) {
      return state.isCSVGenerationOngoing;
    },
  },
};

export default map;
