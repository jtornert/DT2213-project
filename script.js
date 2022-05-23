/*
 * setup
 */

const audioContext = new AudioContext();

class SoundString {
  constructor(hues, samples, path, circle) {
    this.hues = hues;
    this.samples = samples;
    this.current = -1;
    this.pos = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
    };
    this.path = path;
    this.circle = circle;
    this.timeout = 0;

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
      const buffer = string.samples[string.current % string.samples.length];
      const lengthInSeconds = buffer.length / 44100;

      play(buffer, string.pos.dx);
      changeColor(string);
      animateRelease(string);
      showCircle(string, lengthInSeconds);

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

  const hueList = [300, 200, 100, 350, 250, 40, 150];

  let i = 0;
  for (const fileNames of fileNamesByString) {
    const samples = [];

    for (const fileName of fileNames) {
      const buffer = await fetchAudioBuffer(fileName);
      samples.push(buffer);
    }

    pathElement = document.getElementById(`string${i + 1}`);
    circleElement = document.getElementById(`circle${i + 1}`);
    const string = new SoundString(
      hueList.slice(i, i + fileNames.length),
      samples,
      pathElement,
      circleElement
    );
    const stringFunction = generateHandleMouseDown(string);
    pathElement.addEventListener("mousedown", stringFunction);
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

function tension(string, x, y) {
  string.path.setAttribute(
    "d",
    `M 100 50 q ${easeDragX(x)} ${100 + easeDragY(y)} 0 200`
  );
}

function animateRelease(string) {
  const easing = easeOutBack;
  const duration = 30;
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
  string.path.style.setProperty(
    "--h",
    string.hues[++string.current % string.hues.length]
  );
}

function changeGlow(string, x) {
  string.path.style.setProperty("--glow", x * 0.5 + 0.5);
}

function changeWidth(string, x) {
  string.path.style.setProperty("--width", `${x * 0.25 + 1}em`);
}

function showCircle(string, timeout) {
  string.circle.classList.add("show");

  if (string.timeout) clearTimeout(string.timeout);

  string.timeout = setTimeout(() => {
    string.circle.classList.remove("show");
  }, timeout * 1000);
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
