const audioCtx = new AudioContext();

async function fetchAudioBuffer(url) {
  return fetch(new Request(url))
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioCtx.decodeAudioData(buffer))
    .catch((err) => console.log(err));
}

function play(buffer) {
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.onended = () => delete source;
  source.connect(audioCtx.destination);
  source.start(0);
}

(async function () {
  const buttonV1 = document.getElementById("v1");
  const buttonV2 = document.getElementById("v2");
  const buttonV3 = document.getElementById("v3");
  const buttonV4 = document.getElementById("v4");

  const bufferV1 = await fetchAudioBuffer("saw_V1.wav");
  const bufferV2 = await fetchAudioBuffer("saw_V2.wav");
  const bufferV3 = await fetchAudioBuffer("saw_V3.wav");
  const bufferV4 = await fetchAudioBuffer("saw_V4.wav");
  // const bufferV1 = await fetchAudioBuffer("loop.wav");
  // const bufferV2 = await fetchAudioBuffer("loop.wav");
  // const bufferV3 = await fetchAudioBuffer("loop.wav");
  // const bufferV4 = await fetchAudioBuffer("loop.wav");

  buttonV1.addEventListener("click", () => {
    play(bufferV1);
  });

  buttonV2.addEventListener("click", () => {
    play(bufferV2);
  });

  buttonV3.addEventListener("click", () => {
    play(bufferV3);
  });

  buttonV4.addEventListener("click", () => {
    play(bufferV4);
  });
})();
