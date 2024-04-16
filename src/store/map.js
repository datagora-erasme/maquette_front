import { generateCSV, generateHeightMap } from '../utils/threeUtils';
import { axiosInstance as axios } from '../axios';

const map = {
  namespaced: true,
  state: () => ({
    platesX: null,
    platesY: null,
    voxelizedMesh: null,
    voxelizedMeshObjContent: null,
    heightMap: null,
    isCSVGenerationOngoing: false,
    csvString: null,
    currentMockupUrl: null,
    currentMockupBbox: null,
    baseLayers: [],
    currAreaRotation: 0,
    newAreaRotation: 0,
    areaSelectionActive: false,
    areaDropped: false,
    areaSelected: false,
    selectedBbox: null,
    selectedPos: null,
    currentTabValue: null,
    isFullscreen: false,
    openedMockup: null,
    olZoom: 13,
  }),
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
    getBaseLayers(state) {
      return state.baseLayers
    },
    getCurrAreaRotation(state) {
      return state.currAreaRotation
    },
    getNewAreaRotation(state) {
      return state.newAreaRotation
    },
    getAreaSelectionActive(state) {
      return state.areaSelectionActive
    },
    getAreaDropped(state) {
      return state.areaDropped
    },
    getAreaSelected(state) {
      return state.areaSelected
    },
    getSelectedBbox(state) {
      return state.selectedBbox
    },
    getSelectedPos(state) {
      return state.selectedPos
    },
    getCurrentTabValue(state) {
      return state.currentTabValue
    },
    getIsFullscreen(state) {
      return state.isFullscreen
    },
    getOpenedMockup(state) {
      return state.openedMockup
    },
    getCurrentMockupBbox(state) {
      return state.currentMockupBbox
    },
    getOlZoom(state) {
      return state.olZoom
    },
  },
  mutations: {
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
    SET_BASE_LAYERS(state, newLayers) {
      state.baseLayers = newLayers
    },
    SET_CURR_AREA_ROTATION(state, currRotation) {
      state.currAreaRotation = currRotation
    },
    SET_NEW_AREA_ROTATION(state, newRotation) {
      state.newAreaRotation = newRotation
    },
    SET_AREA_SELECTION_ACTIVE(state, newState) {
      state.areaSelectionActive = newState
    },
    SET_AREA_DROPPED(state, newState) {
      state.areaDropped = newState
    },
    SET_AREA_SELECTED(state, newState) {
      state.areaSelected = newState
    },
    SET_SELECTED_BBOX(state, newBbox) {
      state.selectedBbox = newBbox
    },
    SET_SELECTED_POS(state, newPos) {
      state.selectedPos = newPos
    },
    SET_CURRENT_TAB_VALUE(state, newValue) {
      state.currentTabValue = newValue
    },
    SET_IS_FULLSCREEN(state, newState) {
      state.isFullscreen = newState
    },
    SET_OPENED_MOCKUP(state, newMockup) {
      state.openedMockup = newMockup
    },
    SET_CURRENT_MOCKUP_BBOX(state, newBbox) {
      state.currentMockupBbox = newBbox
    },
    SET_OL_ZOOM(state, newZoom) {
      state.olZoom = newZoom
    }
  },
  actions: {
    /**
     * @param {{x: number, y: number}} plates : Number of horizontal (x) and vertical (y) plates
     */
    setPlates({ commit }, plates) {
      commit('SET_PLATES_X', plates.x);
      commit('SET_PLATES_Y', plates.y);
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
    setBaseLayers({ commit }, newLayers) {
      commit('SET_BASE_LAYERS', newLayers)
    },
    setCurrAreaRotation({ commit }, currRotation) {
      commit('SET_CURR_AREA_ROTATION', currRotation)
    },
    setNewAreaRotation({ commit }, newRotation) {
      commit('SET_NEW_AREA_ROTATION', newRotation)
    },
    setAreaSelectionActive({ commit }, newState) {
      commit('SET_AREA_SELECTION_ACTIVE', newState)
    },
    setAreaDropped({ commit }, newState) {
      commit('SET_AREA_DROPPED', newState)
    },
    setAreaSelected({ commit }, newState) {
      commit('SET_AREA_SELECTED', newState)
    },
    setSelectedBbox({ commit }, newBbox) {
      commit('SET_SELECTED_BBOX', newBbox)
    },
    setSelectedPos({ commit }, newPos) {
      commit('SET_SELECTED_POS', newPos)
    },
    setCurrentTabValue({ commit }, newValue) {
      commit('SET_CURRENT_TAB_VALUE', newValue)
    },
    setIsFullscreen({ commit }, newState) {
      commit('SET_IS_FULLSCREEN', newState)
    },
    setCSVGenerationState({ commit }, newState) {
      commit('SET_IS_CSV_GENERATION_ONGOING', newState)
    },
    setOpenedMockup({ commit }, newMockup) {
      commit('SET_OPENED_MOCKUP', newMockup)
    },
    setCurrentMockupBbox({ commit }, newBbox) {
      commit('SET_CURRENT_MOCKUP_BBOX', newBbox)
    },
    setOlZoom({ commit }, newZoom) {
      commit('SET_OL_ZOOM', newZoom)
    }
  },
};

export default map;
