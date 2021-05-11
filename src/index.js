import 'babel-polyfill';
import * as Tone from 'tone';

const startBtn = document.querySelector('#start-btn');

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