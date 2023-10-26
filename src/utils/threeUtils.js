import * as THREE from 'three';

// This is the first implementation that took ~8 secondes to execute.
// TODO : Delete after checking this out.
/** Takes an .obj file download link and returns the mesh generated after loading the obj as a THREE.js' object 3D.
 * @param {string} objDownloadUrl : Download link of a .obj file.
 * @returns {Promise<THREE.Mesh | Object} : The Mesh generated from the given 
 * download URL's obj file or an error object.
 */
// const objToMesh = (objDownloadUrl) => {
//   return new Promise((resolve, reject) => {
//     let voxelized3dModel;
//     let mesh;
//     const loadModel = () => {
//       const geometries = [];
//       let combinedGeometry;
//       voxelized3dModel.traverse(function(child) {
//         if (child.isMesh) {
//           geometries.push(child.geometry);
//         }
//         if (geometries.length)
//           combinedGeometry = mergeBufferGeometries(geometries);
//       });
  
//       const material = new THREE.MeshPhongMaterial({
//         color: 0x666666,
//         shininess: 0,
//         side: THREE.DoubleSide,
//         // Clipping setup:
//         clipShadows: true,
//       });
//       mesh = new THREE.Mesh(combinedGeometry, material);
//       return resolve(mesh);
//     };

//     const manager = new THREE.LoadingManager(loadModel);
//     console.time('Operation');
//     const loader = new OBJLoader(manager);
    
//     loader.load(
//       objDownloadUrl,
//       (object) => {
//         console.timeEnd('Operation');
//         voxelized3dModel = object;
//       },
//       () => {
//         // console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
//       },
//       (error) => {
//         console.log(error);
//         return reject(error);
//       }
//     );
//   });
// };

/** Takes an .obj file's content and returns the mesh generated after loading the obj as a THREE.js' object 3D.
 * @param {string} objFileContent : Content of an .obj file.
 * @returns {Promise<THREE.Mesh} : The Mesh generated from the given 
 * download URL's obj file or an error object.
 */
const objToMesh = (objFileContent) => {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(new URL('./loadObj.js', import.meta.url));
      worker.postMessage({
        objFileContent,
      });
      worker.onmessage = (messageEvent) => {
        const { data } = messageEvent;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(data.geometryAttributes.positionArray, 3)
        );
        geometry.setAttribute(
          'normal',
          new THREE.BufferAttribute(data.geometryAttributes.positionArray, 3)
        );
        
        // MeshPhongMaterial is more complex that MeshBasicMaterial and allows light
        // to interact with the 3D object. Ideal when rendering.
        const material = new THREE.MeshPhongMaterial({
          color: 0x666666,
          shininess: 0,
          side: THREE.DoubleSide,
          clipShadows: true,
        });
        const mesh = new THREE.Mesh(geometry, material);
        worker.terminate();
        return resolve(mesh);
      };
    } catch (error) {
      return reject(error);
    }
  });
};

const createWorker = () => {
  const worker = new Worker(
    new URL('./raycasterOperations.js', import.meta.url)
  );
  return worker;
};

const maxWorkers = window.navigator.hardwareConcurrency;

//? Average time : 5-15 seconds for 1x1 plates
// The THREE.js heavy work is delegated to Web Workers instead of handling it in the main thread
// To prevent the browser from freezing & to parallelize the work.
/**
 * 
 * @param {THREE.Mesh} mesh 
 * @param {number} platesX 
 * @param {number} platesY 
 * @returns {Array<Uint8Array>} heightMap
 */
const generateHeightMap = (mesh, platesX, platesY) => {
  return new Promise((resolve) => {
    const workers = [];
    for (let i = 0; i < maxWorkers; i++) {
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
    const chunkSize = raycastArray.length / maxWorkers;
    let lastChunkFirstCell = 0;
    for (let i = 0; i < workers.length; i++) {
      const chunkOfRaycastArray = raycastArray.slice(lastChunkFirstCell, lastChunkFirstCell + chunkSize);
      lastChunkFirstCell = lastChunkFirstCell + chunkSize;
      //! Only serializable data is allowed to pass through workers' postMessage handlers
      //! That's how the geometryAttributes have been passed and not the whole mesh
      workers[i].postMessage({
        chunkOfRaycastArray,
        heightMapSize: chunkSize,
        geometryAttributes: {
          positionArray: mesh.geometry.attributes.position.array,
          normalArray: mesh.geometry.attributes.normal.array,
        },
        ratioZ: maxZMockup / maxLegoHeight,
        worker: i,
      });
      workers[i].onmessage = (messageEvent) => {
        operationsDone++;
        const { data } = messageEvent;
        const currentWorker = data.worker;
        const chunkOfHeightMap = data.chunkOfHeightMap;
        arrayOfChunks[currentWorker] = chunkOfHeightMap;
        if (operationsDone === maxWorkers) {
          for (let i = 0; i < arrayOfChunks.length; i++) {
            heightMap = [...heightMap, ...arrayOfChunks[i]]
            workers[i].terminate();
          }
          operationsDone = 0;
          return resolve(heightMap);
        }
      };
    }
  });
};

/**
 * Turns the heightmap into a CSV manual for building the lego structure.
 * @param {Uint8Array} heightMap : Array of 8-bit unsigned integers (0 to 255) generated with the {@link generateHeightMap} function.
 * @param {number} platesX 
 * @returns {String} The CSV file.
 */
const generateCSV = (heightMap, platesX) => {
  const legoPerPlate = 32;
  const totalNumberOfLegosX = platesX * legoPerPlate;
  let csvContent = '';

  let i = 0;

  for (let posHeightMap = 0; posHeightMap < heightMap.length; posHeightMap++) {
    const innerValue =
      heightMap[posHeightMap] === null
        ? ''
        : heightMap[posHeightMap].toString();
    const result = innerValue.replace(/"/g, '""');
    if (i > 0) csvContent += ';';
    csvContent += result;
    i++;
    if (i % totalNumberOfLegosX === 0) {
      // j++;
      i = 0;
      csvContent += '\n';
    }
  }
  
  //? The following code mirrors the content of the CSV's rows in
  //? order to make the mockup look like the 3D model.
  const rows = csvContent.trim().split('\n');
  const reversedRows = rows.map((row) => {
    const columns = row.split(';');
    return columns.reverse();
  });

  csvContent = reversedRows
    .map((row) => row.join(';'))
    .join('\n');

  // TODO : Maybe split the CSV here according to the number of plates selected.

  csvContent = 'data:text/csv;charset=utf-8,' + csvContent;

  return csvContent;
};


//? Ud-Viz version
//? Average time : 30-40s for 1x1 plates + freezing the UI.
// const createHeightMapFromMeshFirstVersion = (mesh, platesX, platesY) => {
//   const geometryBuffer = mesh.geometry;
//   if (!geometryBuffer.attributes.position.array)
//     throw new Error('geometryBuffer empty');

//   geometryBuffer.computeBoundingBox(); //Generate Bounding box for the geometry
//   const legoPerPlate = 32;
//   const maxLegoHeight = 15; // Max lego height for the highest buildings in the geometry
//   const bbMockUp = geometryBuffer.boundingBox;
//   const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
//   const heightMockUp = bbMockUp.max.y - bbMockUp.min.y;
//   const totalNumberOfLegosX = platesX * legoPerPlate;
//   const totalNumberOfLegosY = platesY * legoPerPlate;
//   const stepDistanceX = widthMockUp / legoPerPlate / platesX; // Step to launch a ray
//   const stepDistanceY = heightMockUp / legoPerPlate / platesY; // Step to launch a ray
//   const maxZMockup = bbMockUp.max.z;
//   const heightMap = Array.from(
//     Array(platesY * legoPerPlate),
//     () => new Array(platesX * legoPerPlate)
//   );

//   const raycaster = new THREE.Raycaster();

//   for (let j = 0; j < totalNumberOfLegosY; j++) {
//     for (let i = 0; i < totalNumberOfLegosX; i++) {
//       const positionRaycast = new THREE.Vector3(
//         bbMockUp.min.x + i * stepDistanceX,
//         bbMockUp.min.y + j * stepDistanceY,
//         maxZMockup
//       );
//       // Vector3(0, 0, -1) because the intersectObject() doc says tha t:
//       // "for meshes, faces must be pointed towards the origin of the {@link Raycaster.ray | ray} in order to be detected;""
//       // This way, the ray faces down
//       raycaster.set(positionRaycast, new THREE.Vector3(0, 0, -1));
//       const objects = raycaster.intersectObject(mesh);
//       if (objects.length > 0) {
//         const object = objects[0];
//         heightMap[j][i] = maxZMockup - object.distance;
//       } else {
//         heightMap[j][i] = 0;
//       }
//     }
//   }
//   // Lego transformation
//   const ratioZ = maxZMockup / maxLegoHeight; // Divide the size in Z with the maximum height of the building in the geometry - Maybe should be calculate differently if there is to much difference between the higher and the shorter ex : Skyscrapers
//   for (let i = 0; i < heightMap.length; i++) {
//     for (let j = 0; j < heightMap[i].length; j++)
//       heightMap[i][j] = Math.trunc(heightMap[i][j] / ratioZ);
//   }
//   return heightMap;
// };

//? UD-Viz version
// const generateCSVwithHeightMap = (heightMap, name) => {
//   let csvContent = 'data:text/csv;charset=utf-8,';

//   //Complete CSV
//   for (let j = heightMap.length - 1; j >= 0; j--) {
//     //decrement because the filling start in top left
//     const value = heightMap[j];
//     for (let i = 0; i < value.length; i++) {
//       const innerValue = value[i] === null ? '' : value[i].toString();
//       const result = innerValue.replace(/"/g, '""');
//       if (i > 0) csvContent += ';';
//       csvContent += result;
//     }

//     csvContent += '\n';
//   }

//   let encodedUri = encodeURI(csvContent);
//   let link = document.createElement('a');
//   link.setAttribute('href', encodedUri);
//   link.setAttribute('download', name);
//   document.body.appendChild(link); // Required for FF

//   link.click();
// };

/**
 * Convert BBOX coordinates to POLYGON coordinates.
 * @param {String} bbox : Desired BBOX.
 * @returns {String} Polygon computed.
 */
const convertBboxToPolygon = (bbox) => {
  // Split bbox coordinates
  const bboxArray = bbox.split(',')
  // Get min/max from coord
  const bboxAminX = bboxArray[0]
  const bboxAminY = bboxArray[1]
  const bboxAmaxX = bboxArray[2]
  const bboxAmaxY = bboxArray[3]
  // Compute Points
  const pt1 = bboxAminX + ',' + bboxAminY
  const pt2 = bboxAminX + ',' + bboxAmaxY
  const pt3 = bboxAmaxX + ',' + bboxAmaxY
  const pt4 = bboxAmaxX + ',' + bboxAminY
  const pt5 = bboxAminX + ',' + bboxAminY
  // Build Polygon
  const polygon = new THREE.Shape();
  polygon.moveTo( pt1 );
  polygon.lineTo( pt2 );
  polygon.lineTo( pt3 );
  polygon.lineTo( pt4 );
  polygon.lineTo( pt5 );
  
  // DEBUG
  console.log(polygon)
  
  // Return
  return polygon
};


export {
  objToMesh,
  generateHeightMap,
  generateCSV,
  convertBboxToPolygon,
};