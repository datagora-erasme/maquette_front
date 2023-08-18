import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
var loader;
var combinedGeometry;
self.onmessage = (messageEvent) => {
  const { data } = messageEvent;
  let voxelized3dModel;

  loader = new OBJLoader();

  voxelized3dModel = loader.parse(data.objFileContent);
  
  const geometries = [];
  
  voxelized3dModel.traverse(function(child) {
    if (child.isMesh) {
      geometries.push(child.geometry);
    }
    if (geometries.length) combinedGeometry = mergeBufferGeometries(geometries);
  });
  self.postMessage({
    geometryAttributes: {
      positionArray: combinedGeometry.attributes.position.array,
      normalArray: combinedGeometry.attributes.normal.array,
    },
  });
};
