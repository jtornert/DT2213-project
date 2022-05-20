/*
 * setup
 */

// needed for playing audio
const audioContext = new AudioContext();

// array of audio samples
const samples = [];
// position info of red box
const pos = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
};
// red box element info
let box;

init();

/*
 * functions
 */

async function init() {
  // download samples and store them in the samples array
  const fileNames = ["saw_V1.wav", "saw_V2.wav", "saw_V3.wav", "saw_V4.wav"];

  for (const fileName of fileNames) {
    const buffer = await fetchAudioBuffer(fileName);
    samples.push(buffer);
  }

  // find red box element in web page
  box = document.getElementById("box");

  box.addEventListener("mousedown", handleMouseDown);
}

async function fetchAudioBuffer(url) {
  return fetch(new Request(url))
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioContext.decodeAudioData(buffer))
    .catch((err) => console.log(err));
}

function play(buffer) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.onended = () => delete source;
  source.connect(audioContext.destination);
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
    ${easeDragX(pos.dx)}px,
    ${easeDragY(pos.dy)}px
  )`;
}

function handleMouseUp(event) {
  let durationDelta = 0;

  if (Math.abs(pos.dx) > 500) {
    play(samples[3]);
    durationDelta = -80;
  } else if (Math.abs(pos.dx) > 400) {
    play(samples[2]);
    durationDelta = -40;
  } else if (Math.abs(pos.dx) > 300) {
    play(samples[1]);
    durationDelta = -20;
  } else if (Math.abs(pos.dx) < 300) {
    play(samples[0]);
  }

  const easing = easeOutBack;
  const duration = 300 + durationDelta;
  const keyframes = [];

  for (let i = 0; i < duration; i++) {
    keyframes.push({
      transform: `translate(
        ${easeDragX(pos.dx * (1 - easing(i / duration)))}px, 
        ${easeDragY(pos.dy * (1 - easing(i / duration)))}px
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

function easeDragX(x) {
  return Math.atan(x / 500) * 250;
}

function easeDragY(x) {
  return Math.atan(x / 500) * 100;
}

function easeOutBack(x) {
  const c1 = 0.50158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 9) + c1 * Math.pow(x - 1, 2);
}
