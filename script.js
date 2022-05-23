/*
 * setup
 */

const audioContext = new AudioContext();

class SoundString {
  hues;
  samples;
  current;
  pos;
  element;

  constructor(hues, samples, current, element) {
    this.hues = hues;
    this.samples = samples;
    this.current = current % samples.length;
    this.pos = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    };
    this.element = element;

    changeColor(this);
  }
}

init();

/*
 * functions
 */

async function init() {
  const fileNamesByString = [
    [
      "concrete/bubbling.wav",
      "concrete/jumping.wav",
      "concrete/pop.wav",
      "concrete/shew.wav",
    ],
    [
      "Drums/Darbuka.wav",
      "Drums/Ddrums.wav",
      "Drums/Riq.wav",
      "Drums/Tabla.wav",
    ],
    ["string/guitar.wav", "string/harp.wav", "string/violin.wav"],
    ["synth/synth1.wav", "synth/synth2.wav", "synth/synth3.wav"],
    ["wind/accordion.wav", "wind/panflute.wav", "wind/saxophone.wav"],
  ];

  const ids = ["string1", "string2", "string3", "string4", "string5"];

  const generateHandleMouseDown = (string) => {
    const handleMouseMove = (event) => {
      string.pos.dx = event.clientX - string.pos.x;
      string.pos.dy = event.clientY - string.pos.y;

      tension(string, string.pos.dx, string.pos.dy);
    };

    const handleMouseUp = (event) => {
      let durationDelta = 0;

      play(
        string.samples[string.current % string.samples.length],
        string.pos.dx
      );
      changeColor(string);
      animateRelease(string, 30, durationDelta);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (event) => {
      string.pos.x = event.clientX;
      string.pos.y = event.clientY;

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    return handleMouseDown;
  };

  const hueList = [300, 200, 100, 350, 250, 40];

  let i = 0;
  for (const fileNames of fileNamesByString) {
    const samples = [];

    for (const fileName of fileNames) {
      const buffer = await fetchAudioBuffer(fileName);
      samples.push(buffer);
    }

    stringElement = document.getElementById(`string${i + 1}`);
    const string = new SoundString(
      hueList.slice(0, fileNames.length),
      samples,
      i,
      stringElement
    );
    const stringFunction = generateHandleMouseDown(string);
    stringElement.addEventListener("mousedown", stringFunction);
    ++i;
  }

  document
    .querySelectorAll("svg")
    .forEach((element) => element.classList.add("show"));

  await playAmbience();
}

async function fetchAudioBuffer(url) {
  return fetch(new Request("/sounds/" + url))
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioContext.decodeAudioData(buffer))
    .catch((err) => console.log(err));
}

function play(buffer, tension) {
  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = tension / 500;
  gainNode.connect(audioContext.destination);
  source.buffer = buffer;
  source.onended = () => delete source;
  source.connect(gainNode);
  source.start(0);
}

async function playAmbience() {
  const ambience = await fetchAudioBuffer("birds.wav");
  const ambienceNode = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.1;
  gainNode.connect(audioContext.destination);
  ambienceNode.buffer = ambience;
  ambienceNode.loop = true;
  ambienceNode.connect(gainNode);
  ambienceNode.start(0);
}

// function handleMouseDown(event) {
//   pos.x = event.clientX;
//   pos.y = event.clientY;

//   window.addEventListener("mousemove", handleMouseMove);
//   window.addEventListener("mouseup", handleMouseUp);
// }

// function handleMouseMove(event) {
//   pos.dx = event.clientX - pos.x;
//   pos.dy = event.clientY - pos.y;

//   tension(string, pos.dx, pos.dy);
// }

// function handleMouseUp(event) {
//   let durationDelta = 0;

//   play(samples[current % samples.length], pos.dx);
//   changeColor(string);
//   animateRelease(string, 30, durationDelta);

//   window.removeEventListener("mousemove", handleMouseMove);
//   window.removeEventListener("mouseup", handleMouseUp);
// }

function tension(string, x, y) {
  string.element.setAttribute(
    "d",
    `M 100 50 q ${easeDragX(x)} ${100 + easeDragY(y)} 0 200`
  );
}

function animateRelease(string, durationBase, durationDelta) {
  const easing = easeOutBack;
  const duration = durationBase + durationDelta;
  const keyframes = [];
  const max = string.pos.dx;

  for (let i = 0; i < duration; i++) {
    keyframes.push(() => {
      tension(
        string,
        string.pos.dx * (1 - easing(i / duration)),
        string.pos.dy * (1 - easing(i / duration))
      );
      changeGlow(string, (string.pos.dx / max) * (1 - i / duration));
      changeWidth(string, (string.pos.dx / max) * (1 - i / duration));
    });
  }

  let i = 0;
  const interval = setInterval(() => {
    if (i >= duration) {
      clearInterval(interval);
      tension(string, 0, 0);
    } else keyframes[i++]();
  }, 5);
}

function changeColor(string) {
  string.element.style.setProperty(
    "--h",
    string.hues[++string.current % string.hues.length]
  );
}

function changeGlow(string, x) {
  string.element.style.setProperty("--glow", x * 0.5 + 0.5);
}
function changeWidth(string, x) {
  string.element.style.setProperty("--width", `${x * 0.25 + 1}em`);
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

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}
