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
const workers = [];

const createHeightMapFromMeshUsingWorkers = (mesh, platesX, platesY) => {
  return new Promise((resolve) => {
    console.time('TimeBeforeOperations')
    for (let i = 0; i < maxWorkers; i++) {
      console.log('Worker ' + i + ' created');
      workers.push(createWorker());
    }
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
    const raycastArray = new Array(
      (platesY * legoPerPlate) * (platesX * legoPerPlate)
    );
    let heightMap = new Array();
    const arrayOfChunks = new Array(maxWorkers);
    let operationsDone = 0;
    let j =0;
    let i =0;
    for (let posRaycastArray = 0; posRaycastArray < raycastArray.length; posRaycastArray++) {
      const positionRaycast = new THREE.Vector3(
        bbMockUp.min.x + i * stepDistanceX,
        bbMockUp.min.y + j * stepDistanceY,
        maxZMockup
      );
      raycastArray[posRaycastArray] = positionRaycast;
      i++;
      if (i % totalNumberOfLegosX === 0) {
        j++;
        i = 0;
      }
    }
    console.timeEnd('TimeBeforeOperations');
    console.time('workers');
    const chunkSize = raycastArray.length / maxWorkers;
    let lastChunkFirstCell = 0;
    for (let i = 0; i < workers.length; i++) {
      const chunkOfRaycastArray = raycastArray.slice(lastChunkFirstCell, lastChunkFirstCell + chunkSize);
      lastChunkFirstCell = lastChunkFirstCell + chunkSize;
      workers[i].postMessage({
        chunkOfRaycastArray,
        heightMapSize: chunkSize,
        geometryAttributes: {
          positionArray: mesh.geometry.attributes.position.array,
          normalArray: mesh.geometry.attributes.normal.array,
        },
        material: mesh.material,
        ratioZ: maxZMockup / maxLegoHeight,
        // index: heightMapPosToFill,
        worker: i,
      });
      workers[i].onmessage = (messageEvent) => {
        operationsDone++;
        const { data } = messageEvent;
        const currentWorker = data.worker;
        const chunkOfHeightMap = data.chunkOfHeightMap;
        arrayOfChunks[currentWorker] = chunkOfHeightMap;
        if (operationsDone === maxWorkers) {
          // console.log(arrayOfChunks)
          for (let i = 0; i < arrayOfChunks.length; i++) {
            // console.log(arrayOfChunks[i]);
            heightMap = [...heightMap, ...arrayOfChunks[i]]
            // .concat(arrayOfChunks[i]);
            console.log('Worker ' + i + ' destroyed');
            workers[i].terminate();
          }
          console.timeEnd('workers');
          // console.log(heightMap);
          return resolve(heightMap);
        }
      };
    }
  });
};

// Avg time : 15s for 1x1 plates
const createHeightMapFromMeshFirstVersion = (mesh, platesX, platesY) => {
  console.log('Generating heightmap')
  console.time('FirstVersion')
  const geometryBuffer = mesh.geometry;
  if (!geometryBuffer.attributes.position.array)
    throw new Error('geometryBuffer empty');

  geometryBuffer.computeBoundingBox(); //Generate Bounding box for the geometry
  const legoPerPlate = 32;
  const maxLegoHeight = 15; // Max lego height for the highest buildings in the geometry
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
      // Vector3(0, 0, -1) because the intersectObject() doc says tha t:
      // "for meshes, faces must be pointed towards the origin of the {@link Raycaster.ray | ray} in order to be detected;""
      // This way, the ray faces down
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
  console.timeEnd('FirstVersion');
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
const generateCSVwithHeightMapV2 = (heightMap, name, platesX, platesY) => {
  const legoPerPlate = 32;
  const totalNumberOfLegosX = platesX * legoPerPlate;
  const totalNumberOfLegosY = platesY * legoPerPlate;
  console.log(heightMap);
  // let csvContent = 'data:text/csv;charset=utf-8,';
  let csvContent = '';

  // let j = 0;
  let i = 0;

  for (let posHeightMap = 0; posHeightMap < heightMap.length; posHeightMap++) {
    // Here fill the lines
    const innerValue =
      heightMap[posHeightMap] === null
        ? ''
        : heightMap[posHeightMap].toString();
    const result = innerValue.replace(/"/g, '""');
    if (i > 0) csvContent += ';';
    csvContent += result;
    i++;
    // Then insert new line
    if (i % totalNumberOfLegosX === 0) {
      // j++;
      i = 0;
      csvContent += '\n';
    }
  }
  // Step 1: Split into rows
  const rows = csvContent.trim().split('\n');

  // Step 2 and 3: Split into columns and reverse the order within each row
  const reversedRows = rows.map((row) => {
    const columns = row.split(';');
    return columns.reverse();
  });

  // Step 4: Reverse the order of rows
  csvContent = reversedRows
    // .reverse()
    .map((row) => row.join(';'))
    .join('\n');

  csvContent = 'data:text/csv;charset=utf-8,' + csvContent;

  console.log(csvContent);
  let encodedUri = encodeURI(csvContent);
  let link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', name);
  document.body.appendChild(link); // Required for FF

  link.click();
};

export {
  objDownloadUrlToMesh,
  createHeightMapFromMeshFirstVersion,
  generateCSVwithHeightMap,
  createHeightMapFromMeshUsingWorkers,
  generateCSVwithHeightMapV2,
};