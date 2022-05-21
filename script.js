/*
 * setup
 */

const audioContext = new AudioContext();

const samples = [];
const pos = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
};
let string;

init();

/*
 * functions
 */

async function init() {
  const fileNames = ["saw_V1.wav", "saw_V2.wav", "saw_V3.wav", "saw_V4.wav"];

  for (const fileName of fileNames) {
    const buffer = await fetchAudioBuffer(fileName);
    samples.push(buffer);
  }

  string = document.getElementById("string1");

  string.addEventListener("mousedown", handleMouseDown);
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
  tension(pos.dx, pos.dy);
}

function handleMouseUp(event) {
  let durationDelta = 0;

  if (Math.abs(pos.dx) > 500) {
    play(samples[3]);
    durationDelta = -10;
  } else if (Math.abs(pos.dx) > 300) {
    play(samples[2]);
  } else if (Math.abs(pos.dx) > 100) {
    play(samples[1]);
  } else if (Math.abs(pos.dx) < 100) {
    play(samples[0]);
  }

  animateRelease(30, durationDelta);

  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
}

function tension(x, y) {
  string.setAttribute(
    "d",
    `M 100 10 q ${easeDragX(x)} ${100 + easeDragY(y)} 0 200`
  );
}

function animateRelease(durationBase, durationDelta) {
  const easing = easeOutBack;
  const duration = durationBase + durationDelta;
  const keyframes = [];

  for (let i = 0; i < duration; i++) {
    keyframes.push(() =>
      tension(
        pos.dx * (1 - easing(i / duration)),
        pos.dy * (1 - easing(i / duration))
      )
    );
  }

  let i = 0;
  const interval = setInterval(() => {
    if (i >= duration) clearInterval(interval);

    keyframes[i++]();
  }, 5);
}

/*
 * easing
 */

function easeDragX(x) {
  return Math.atan(x / 500) * 100;
}

function easeDragY(x) {
  return Math.atan(x / 500) * 75;
}

function easeOutBack(x) {
  const c1 = 0.50158;
  const c3 = c1 + 1;

  return 1 + c3 * Math.pow(x - 1, 9) + c1 * Math.pow(x - 1, 2);
}
