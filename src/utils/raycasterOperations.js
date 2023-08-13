self.onmessage = (data) => {
  setTimeout(() => {
    self.postMessage({ text: 'RECIEVED msg from worker' + data.worker });
  }, 1000);
}