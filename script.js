/*
 * setup
 */

const audioCtx = new AudioContext();

const samples = new Array(4);
const pos = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
};

let box;

init();

/*
 * functions
 */

async function init() {
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
}

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
  pos.x = event.clientX;
  pos.y = event.clientY;

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
}

function handleMouseMove(event) {
  pos.dx = event.clientX - pos.x;
  pos.dy = event.clientY - pos.y;
  box.style.transform = `translate(
    ${dragX(pos.dx)}px,
    ${dragY(pos.dy)}px
  )`;
}

function handleMouseUp(event) {
  let easingDelta = 0;

  if (Math.abs(pos.dx) > 500) {
    play(samples[3]);
  } else if (Math.abs(pos.dx) > 400) {
    play(samples[2]);
    easingDelta = -20;
  } else if (Math.abs(pos.dx) > 300) {
    play(samples[1]);
    easingDelta = -40;
  } else if (Math.abs(pos.dx) < 300) {
    play(samples[0]);
    easingDelta = -80;
  }

  const easing = easeOutBack;
  const duration = 300 + easingDelta;
  const keyframes = [];

  for (let i = 0; i < duration; i++) {
    keyframes.push({
      transform: `translate(
        ${dragX(pos.dx * (1 - easing(i / duration)))}px, 
        ${dragY(pos.dy * (1 - easing(i / duration)))}px
      )`,
    });
  }

  box.style.transform = `translate(0px, 0px)`;
  box.animate(keyframes, { duration: duration });

  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
}

/*
 * easing
 */

function dragX(x) {
  return Math.atan(x / 500) * 250;
}

function dragY(x) {
  return Math.atan(x / 500) * 100;
}

function easeOutBack(x) {
  const c1 = 0.50158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 9) + c1 * Math.pow(x - 1, 2);
}
