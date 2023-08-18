import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const vectorMinusOne = new THREE.Vector3(0, 0, -1);

self.onmessage = (messageEvent) => {
  const { data } = messageEvent;
  const chunkOfRaycastArray = data.chunkOfRaycastArray;
  const currentWorker = data.worker;
  const dataGeometryAttributes = data.geometryAttributes;
  // const dataMaterial = data.geometry;
  const ratioZ = data.ratioZ;
  const heightMapSize = data.heightMapSize;
  // https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
  // 0 to 255
  const chunkOfHeightMap = new Uint8Array(heightMapSize);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(dataGeometryAttributes.positionArray, 3)
  );
  geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(dataGeometryAttributes.positionArray, 3)
  );

  const material = new THREE.MeshBasicMaterial();

  const mesh = new THREE.Mesh(geometry, material);
  let objects = [];

  // const mesh = new THREE.Mesh().toJSON(meshJson);
  for (let i = 0; i < chunkOfRaycastArray.length; i++) {
    raycaster.set(chunkOfRaycastArray[i], vectorMinusOne);
    objects = raycaster.intersectObject(mesh);
    chunkOfHeightMap[i] =
      objects[0] &&
      Math.trunc((chunkOfRaycastArray[i].z - objects[0].distance) / ratioZ); // chunkOfRaycastArray[i].z === maxZMockup
    objects = [];
  }
  self.postMessage({
    chunkOfHeightMap,
    worker: currentWorker,
  });
};
