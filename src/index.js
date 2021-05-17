import 'babel-polyfill';
import * as Tone from 'tone';

const startBtn = document.querySelector('#start-btn');
const serialBtn = document.querySelector('#serial-btn');

let serialState = false;
let port, reader, inputDone, inputStream;

class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = "";
  }

  transform(chunk, controller) {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}

startBtn.addEventListener('click', (e) => {
    //const synth = new Tone.Synth().toDestination();
    //synth.triggerAttackRelease("D1", "8n"); //play a middle 'C' for the duration of an 8th note

    const bass = new Tone.Player("/bass.wav").toDestination();
    const drums = new Tone.Player("/drums.wav").toDestination();
    const other = new Tone.Player("/other.wav").toDestination();
    
    // effects
    const distortion = new Tone.Distortion(0.9).toDestination();
    bass.connect(distortion);

    //
    Tone.loaded().then(() => {
        bass.start();
        //drums.start();
        //other.start();
    });
});

serialBtn.addEventListener('click', async (e) => {
    console.log("Open Serial");
    
    if (!serialState) {
        serialState = true;
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        await connectSerial();
        serialBtn.textContent ="Close Serial";
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
    if (value) {
      console.log(value );
    }
    if (done) {
      console.log('[readLoop] DONE', done);
      reader.releaseLock();
      break;
    }
  }
}