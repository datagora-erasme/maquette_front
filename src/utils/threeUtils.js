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

const maxWorkers = window.navigator.hardwareConcurrency;
let numberOfOperations = 50;
let numberOfWorkingWorkers = 0;
let isOver = false;

const createWorker = (data) => {
  const worker = new Worker(
    new URL('./raycasterOperations.js', import.meta.url)
  );
  return worker;
};


const doOperation = (createNewWorker) => {
  const worker = createWorker();
  worker.postMessage({ text: 'AAA' });
  numberOfWorkingWorkers--;
  numberOfOperations--;
  console.log('Number of operations left: ' + numberOfOperations);
  worker.onmessage = (msg) => {
    worker.terminate();
    if (numberOfOperations > 0 && numberOfWorkingWorkers < maxWorkers) {
      doOperation();
    } else {
      if (!isOver) {
        isOver = true;
        console.log('Work is over');
      }
    }
  };
};

const createHeightMapFromMeshUsingWorkers = () => {
  console.log(window.navigator.hardwareConcurrency)
  for (let i = 0; i < maxWorkers; i++) {
      const worker = createWorker();
      worker.postMessage({ text: 'AAA' });
      numberOfWorkingWorkers--;
      numberOfOperations--;
      worker.onmessage = (msg) => {
        worker.terminate();
        console.log('Number of operations left: ' + numberOfOperations);
        if (numberOfOperations > 0 && numberOfWorkingWorkers < maxWorkers) {
          doOperation();
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
  const raycaster = new THREE.Raycaster();
  const maxZMockup = bbMockUp.max.z;
  const heightMap = Array.from(
    Array(platesY * legoPerPlate),
    () => new Array(platesX * legoPerPlate)
  );

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

export {
  objDownloadUrlToMesh,
  createHeightMapFromMesh,
  generateCSVwithHeightMap,
  createHeightMapFromMeshUsingWorkers,
};