import 'babel-polyfill';
import p5 from 'p5';

const serialBtn = document.querySelector('#serial-btn');
const writeBtnOn = document.querySelector('#write-btn-on');

const clrPicker = document.querySelector("#clr-picker");
const speedSlider = document.querySelector("#sp-slider");
const sensorValH2 = document.querySelector('#sensor-val');

let serialState = false;
let port, reader, inputDone, inputStream;
let outputDone, outputStream;
let val, str;

writeBtnOn.addEventListener('click', () => {
  let rgb = hexToRGB(clrPicker.value);

  const writer = outputStream.getWriter();
  // lines.forEach((line) => {
  //   console.log('[SEND]', line);
  //   writer.write(line + '\n');
  // });
  
  writer.write(`${255-rgb.r},${255-rgb.g},${255-rgb.b},${speedSlider.value}`);
  writer.releaseLock();
});


serialBtn.addEventListener('click', async (e) => {
    console.log("Open Serial");
    
    if (!serialState) {
        serialState = true;
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        await connectSerial();
        serialBtn.textContent ="Close Serial";
        serialBtn.style.background = "#000";
    }
    else {
        await disconnectSerial();
    }
});

async function connectSerial() {
    let decoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(decoder.writable);
    inputStream = decoder.readable;
    reader = inputStream.getReader();
    readLoop();

    const encoder = new TextEncoderStream();
    outputDone = encoder.readable.pipeTo(port.writable);
    outputStream = encoder.writable;
}

async function disconnectSerial() {
  if (reader) {
    await reader.cancel();
    await inputDone.catch(() => {});
    reader = null;
    inputDone = null;
  }
  await port.close();
  port = null;
  serialBtn.textContent ="Open Serial";
}

async function readLoop() {
  while (true) {
    const { value, done } = await reader.read();
    console.log(value);
    if (value) {
      str += value;
      const lines = str.split("}");
      const line = lines[lines.length - 2]+'}';
      try {
        let obj = JSON.parse(line);
        val = obj.ptr;
        sensorValH2.innerText = val;
      }
      catch(e) {
        console.log(e);
      }
    }
    if (done) {
      console.log('[readLoop] DONE', done);
      reader.releaseLock();
      break;
    }
  }
}

function hexToRGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const sketch = (s) => {
  let img;

  s.setup = () => {
     s.createCanvas(900, 600);
    // img = s.loadImage("/test.jpg");
  }

  s.draw = () => {
    s.background(255);
    s.fill(0);
    s.noStroke();
  }
}

const sketchInstance = new p5(sketch);