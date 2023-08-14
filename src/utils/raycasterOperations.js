import * as THREE from 'three';

self.onmessage = (messageEvent) => {
  const { data } = messageEvent;
  // console.log(data);
  setTimeout(() => {
    // console.log('Message recieved from worker ' + data.worker)
    self.postMessage({ pos: data.index, value: 1, worker: data.worker });
  }, Math.random() * 350)
};
