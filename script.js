const audioCtx = new AudioContext();

const samples = new Array(4);
const pos = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
};

let box;

(async function () {
  const bufferV1 = await fetchAudioBuffer("saw_V1.wav");
  const bufferV2 = await fetchAudioBuffer("saw_V2.wav");
  const bufferV3 = await fetchAudioBuffer("saw_V3.wav");
  const bufferV4 = await fetchAudioBuffer("saw_V4.wav");

  samples[0] = bufferV1;
  samples[1] = bufferV2;
  samples[2] = bufferV3;
  samples[3] = bufferV4;

  box = document.getElementById("box");

  box.addEventListener("mousedown", handleMouseDown);
})();

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

function handleMouseDown(event) {
  console.log("Enable drag");
  pos.x = event.clientX;
  pos.y = event.clientY;
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
}

function handleMouseMove(event) {
  console.log("Moving");
  pos.dx = event.clientX - pos.x;
  pos.dy = event.clientY - pos.y;
  console.log(pos.dx, pos.dy);
  box.style.transform = `translate(
    ${Math.atan(pos.dx / 500) * 250}px,
    ${Math.atan(pos.dy / 500) * 100}px
  )`;
}

function handleMouseUp(event) {
  console.log("Disable drag");
  console.log(pos.dx, pos.dy);
  if (Math.abs(pos.dx) > 500) {
    play(samples[3]);
  } else if (Math.abs(pos.dx) > 400) {
    play(samples[2]);
  } else if (Math.abs(pos.dx) > 300) {
    play(samples[1]);
  } else if (Math.abs(pos.dx) < 300) {
    play(samples[0]);
  }
  box.style.transform = `translate(${0}px, ${0}px)`;
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
}
