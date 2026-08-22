self.onmessage = (event) => {
  self.postMessage({ doubled: event.data.value * 2 });
};
