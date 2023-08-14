import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';


/** Takes an .obj file download link and returns the mesh generated after loading the obj as a THREE.js' object 3D.
 * @param {string} objDownloadUrl : Download link of a .obj file.
 * @returns {Promise<THREE.Mesh | Object} : The Mesh generated from the given 
 * download URL's obj file or an error object.
 */
const objDownloadUrlToMesh = (objDownloadUrl) => {
  return new Promise((resolve, reject) => {
    let voxelized3dModel;
    let mesh;
    const loadModel = () => {
      const geometries = [];
      let combinedGeometry;
      voxelized3dModel.traverse(function(child) {
        if (child.isMesh) {
          geometries.push(child.geometry);
        }
        if (geometries.length)
          combinedGeometry = mergeBufferGeometries(geometries);
      });

      const material = new THREE.MeshPhongMaterial({
        color: 0x666666,
        shininess: 0,
        side: THREE.DoubleSide,
        // Clipping setup:
        clipShadows: true,
      });
      mesh = new THREE.Mesh(combinedGeometry, material);
      return resolve(mesh);
    };

    const manager = new THREE.LoadingManager(loadModel);
    const loader = new OBJLoader(manager);

    loader.load(
      objDownloadUrl,
      (object) => {
        voxelized3dModel = object;
      },
      () => {
        // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      (error) => {
        console.log(error);
        return reject(error);
      }
    );
  });
};

const createHeightMapFromMesh = (mesh, platesX, platesY) => {
  console.time('Execution Time');
  const geometryBuffer = mesh.geometry;
  if (!geometryBuffer.attributes.position.array)
  throw new Error('geometryBuffer empty');

geometryBuffer.computeBoundingBox(); //Generate Bounding box of the geometry
  const legoPerPlate = 32;
  const maxLegoHeight = 15; // Max lego height for the higher buildings in the geometry
  const bbMockUp = geometryBuffer.boundingBox;
  const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
  const heightMockUp = bbMockUp.max.y - bbMockUp.min.y;
  const totalNumberOfLegosX = platesX * legoPerPlate;
  const totalNumberOfLegosY = platesY * legoPerPlate;
  // TODO  : Update step distance according to number of voxels given by backend
  const stepDistanceX = widthMockUp / legoPerPlate / platesX; // Step to launch a ray
  const stepDistanceY = heightMockUp / legoPerPlate / platesY; // Step to launch a ray
  const raycaster = new THREE.Raycaster();
  const maxZMockup = bbMockUp.max.z;
  const ratioZ = maxZMockup / maxLegoHeight; // Divide the size in Z with the maximum height of the building in the geometry - Maybe should be calculate differently if there is to much difference between the higher and the shorter ex : Skyscrapers
  
  const heightMap = Array.from(
    Array(platesY * legoPerPlate),
    () => new Array(platesX * legoPerPlate)
  );

  let positionRaycast = new THREE.Vector3(0,0,0);
  const vectorMinusOne = new THREE.Vector3(0,0,-1);
  let objects;

  for (let j = 0; j < totalNumberOfLegosY; j++) {
    for (let i = 0; i < totalNumberOfLegosX; i++) {
      positionRaycast.set(
        bbMockUp.min.x + i * stepDistanceX,
        bbMockUp.min.y + j * stepDistanceY,
        maxZMockup
      );
      raycaster.set(positionRaycast, vectorMinusOne);
      objects = raycaster.intersectObject(mesh);
      if (objects.length > 0) {
        const object = objects[0];
        heightMap[j][i] = Math.trunc((maxZMockup - object.distance) / ratioZ  );
      } else {
        heightMap[j][i] = 0;
      }
    }
  }
  // Lego transformation
  // for (let i = 0; i < heightMap.length; i++) {
  //   for (let j = 0; j < heightMap[i].length; j++)
  //     heightMap[i][j] = Math.trunc(heightMap[i][j] / ratioZ);
  // }
  console.timeEnd('Execution Time');
  return heightMap;
}
const createWorker = () => {
  const worker = new Worker(
    new URL('./raycasterOperations.js', import.meta.url)
  );
  return worker;
};

const maxWorkers = window.navigator.hardwareConcurrency;
const workers = [
  createWorker(),
  createWorker(),
  createWorker(),
  createWorker(),
  createWorker(),
  createWorker(),
  createWorker(),
  createWorker(),
];
let heightMap;
let lastEmptyCell = 0;
let isWorkOver = false;

// Alternative de .indexOf() ou includes() car elles parcourent linéairement la totalité du tableau.
// Ici, on ne reprend la recherche qu'à partir de  lastEmptyCell - 16 pour s'assurer de n'oublier aucune case
// Si la machine d'un utilisateur possède au plus maxWorkers threads.
const findNextEmptyCell = (array) => {
  for (let i = lastEmptyCell; i < array.length; i++) {
    if (array[i] === undefined) {
      // Réduire le parcours du tableau aux maxWorkers dernières cases plutôt que de repasser par tout le tableau.
      lastEmptyCell = i - maxWorkers;
      if (lastEmptyCell < 0) lastEmptyCell = 0;
      // To prevent other threads from considering this cell "empty". alreadySelected means that a thread is currently
      // using this cell, but its not filled with the final result yet.
      array[i] = 'alreadySelected'
      return i;
    }
  }
};

const doOperation = (heightMapPosToFill, workerIndex) => {
  workers[workerIndex].postMessage({ index: heightMapPosToFill, worker: workerIndex });
  workers[workerIndex].onmessage = (messageEvent) => {
    const { data } = messageEvent;
    const currentWorkerIndex = data.worker;
    heightMap[data.pos] = data.value;
    const heightMapPosToFill = findNextEmptyCell(heightMap);
    if (
      heightMapPosToFill !== undefined
    ) {
      doOperation(heightMapPosToFill, currentWorkerIndex);
    } else {
      if (findNextEmptyCell(heightMap) === undefined && !isWorkOver) {
        isWorkOver = true;
        console.log('Work is Over');
        console.log(heightMap);
        console.timeEnd('workers');
      }
    }
  };
};

const createHeightMapFromMeshUsingWorkers = (mesh, platesX, platesY) => {
  const geometryBuffer = mesh.geometry;
  geometryBuffer.computeBoundingBox(); //Generate Bounding box of the geometry
  const legoPerPlate = 32;
  const maxLegoHeight = 15; // Max lego height for the higher buildings in the geometry
  const bbMockUp = geometryBuffer.boundingBox;
  const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
  const heightMockUp = bbMockUp.max.y - bbMockUp.min.y;
  const totalNumberOfLegosX = platesX * legoPerPlate;
  const totalNumberOfLegosY = platesY * legoPerPlate;
  // TODO  : Update step distance according to number of voxels given by backend
  const stepDistanceX = widthMockUp / legoPerPlate / platesX; // Step to launch a ray
  const stepDistanceY = heightMockUp / legoPerPlate / platesY; // Step to launch a ray
  const maxZMockup = bbMockUp.max.z;
  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
  // 0 to 255
  const raycastArray = new Array(
    (platesY * legoPerPlate) * (platesX * legoPerPlate)
  );
  heightMap = new Array(
    (platesY * legoPerPlate) * (platesX * legoPerPlate)
  );

  console.time('TimePosRaycast')
  let j =0;
  let i =0;
  for (let posRaycastArray = 0; posRaycastArray < raycastArray.length; posRaycastArray++) {
    // Code here
    const positionRaycast = new THREE.Vector3(
      bbMockUp.min.x + i * stepDistanceX,
      bbMockUp.min.y + j * stepDistanceY,
      maxZMockup
    );
    raycastArray[posRaycastArray] = positionRaycast;
    // Then iteration
    j++;
    if (posRaycastArray % legoPerPlate === 0) {
      i++;
      j = 0;
    }
  }
  console.timeEnd('TimePosRaycast');
  console.log(raycastArray)
  console.time('workers');
  
  for (let i = 0; i < workers.length; i++) {
    const heightMapPosToFill = findNextEmptyCell(heightMap);
    workers[i].postMessage({ index: heightMapPosToFill, worker: i });
    workers[i].onmessage = (messageEvent) => {
      const { data } = messageEvent;
      const currentWorker = data.worker;
      heightMap[data.pos] = data.value;
      const heightMapPosToFill = findNextEmptyCell(heightMap);
      if (heightMapPosToFill !== undefined) {
        doOperation(heightMapPosToFill, currentWorker);
      }
    };
  }
};

// Avg time : 15s for 1x1 plates
const createHeightMapFromMeshFirstVersion = (mesh, platesX, platesY) => {
  const geometryBuffer = mesh.geometry;
  if (!geometryBuffer.attributes.position.array)
    throw new Error('geometryBuffer empty');

  geometryBuffer.computeBoundingBox(); //Generate Bounding box of the geometry
  const legoPerPlate = 32;
  const maxLegoHeight = 15; // Max lego height for the higher buildings in the geometry
  const bbMockUp = geometryBuffer.boundingBox;
  const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
  const heightMockUp = bbMockUp.max.y - bbMockUp.min.y;
  const totalNumberOfLegosX = platesX * legoPerPlate;
  const totalNumberOfLegosY = platesY * legoPerPlate;
  // TODO  : Update step distance according to number of voxels given by backend
  const stepDistanceX = widthMockUp / legoPerPlate / platesX; // Step to launch a ray
  const stepDistanceY = heightMockUp / legoPerPlate / platesY; // Step to launch a ray
  const maxZMockup = bbMockUp.max.z;
  const heightMap = Array.from(
    Array(platesY * legoPerPlate),
    () => new Array(platesX * legoPerPlate)
  );

  const raycaster = new THREE.Raycaster();

  for (let j = 0; j < totalNumberOfLegosY; j++) {
    for (let i = 0; i < totalNumberOfLegosX; i++) {
      const positionRaycast = new THREE.Vector3(
        bbMockUp.min.x + i * stepDistanceX,
        bbMockUp.min.y + j * stepDistanceY,
        maxZMockup
      );
      raycaster.set(positionRaycast, new THREE.Vector3(0, 0, -1));
      const objects = raycaster.intersectObject(mesh);
      if (objects.length > 0) {
        const object = objects[0];
        heightMap[j][i] = maxZMockup - object.distance;
      } else {
        heightMap[j][i] = 0;
      }
    }
  }
  // Lego transformation
  const ratioZ = maxZMockup / maxLegoHeight; // Divide the size in Z with the maximum height of the building in the geometry - Maybe should be calculate differently if there is to much difference between the higher and the shorter ex : Skyscrapers
  for (let i = 0; i < heightMap.length; i++) {
    for (let j = 0; j < heightMap[i].length; j++)
      heightMap[i][j] = Math.trunc(heightMap[i][j] / ratioZ);
  }
  return heightMap;
};

const generateCSVwithHeightMap = (heightMap, name) => {
  console.log(heightMap)
  let csvContent = 'data:text/csv;charset=utf-8,';

  //Complete CSV
  for (let j = heightMap.length - 1; j >= 0; j--) {
    //decrement because the filling start in top left
    const value = heightMap[j];
    for (let i = 0; i < value.length; i++) {
      const innerValue = value[i] === null ? '' : value[i].toString();
      const result = innerValue.replace(/"/g, '""');
      if (i > 0) csvContent += ';';
      csvContent += result;
    }

    csvContent += '\n';
  }

  let encodedUri = encodeURI(csvContent);
  let link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', name);
  document.body.appendChild(link); // Required for FF

  link.click();
};

// This version will loop through the 1D array
const generateCSVwithHeightMapV2 = (heightMap, name) => {
  console.log(heightMap)
  let csvContent = 'data:text/csv;charset=utf-8,';

  //Complete CSV
  for (let j = heightMap.length - 1; j >= 0; j--) {
    //decrement because the filling start in top left
    const value = heightMap[j];
    for (let i = 0; i < value.length; i++) {
      const innerValue = value[i] === null ? '' : value[i].toString();
      const result = innerValue.replace(/"/g, '""');
      if (i > 0) csvContent += ';';
      csvContent += result;
    }

    csvContent += '\n';
  }

  let encodedUri = encodeURI(csvContent);
  let link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', name);
  document.body.appendChild(link); // Required for FF

  link.click();
};

export {
  objDownloadUrlToMesh,
  createHeightMapFromMesh,
  generateCSVwithHeightMap,
  createHeightMapFromMeshUsingWorkers,
};