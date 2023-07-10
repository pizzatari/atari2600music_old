import { Instrument } from "./Instrument.js";

export class Piano extends Instrument {
    //#audioCtx = null;
    //#midiMap = new Map();
    #oscillator= null;
    #gain = null;

    constructor(audioCtx, noteList, instance) {
        super(audioCtx, noteList, instance);

        //this.#audioCtx = audioCtx;
        this.#gain = this.AudioContext.createGain();
        this.#gain.connect(this.AudioContext.destination);
        this.#gain.gain.setValueAtTime(0, this.AudioContext.currentTime); // begin with volume at 0

        // Standard values are "sine", "square", "sawtooth", "triangle" and "custom". The default is "sine"
        let osc = this.AudioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 440.0;
        osc.connect(this.#gain);
        osc.start();
		this.#oscillator = osc;
	}

    clone(instance = 0) {
        return new Piano(this.AudioContext, this.NoteList, instance);
    }

    /*
    changeNoteList(list) {
        super.NoteList = list;
        this.#midiMap.clear();
        for(let note of list) {
			let key = this.#key(note.MidiNote, note.MicroNum);
            this.#midiMap.set(key, note);
		}
    }
    */

    // noteOn & noteOff are affected by sustain pedal
    noteOn(midiNote, microNum = 0, velocity = 1.0, volume = 1.0) {
		let note = this.getNote(midiNote, microNum);

        if (note != null) {
        	volume = Math.max(volume, 0.0);
        	volume = Math.min(volume, 1.0);

			let frequency = this.getFrequency(midiNote, microNum);

        	//let effectiveVolume = velocity * volume;
        	let effectiveVolume = velocity * volume**2;

			if (frequency > 0.0) {
            	this.#oscillator.frequency.setValueAtTime(frequency, this.AudioContext.currentTime);
            	this.#gain.gain.setValueAtTime(effectiveVolume, this.AudioContext.currentTime);
			}

            //console.log("Playing note: " + midiNote + " " + (Math.round(note.frequency * 100)/100));
        } else {
            console.log("No defined note: " + midiNote + ' ' + microNum);
        }

        //console.log(`Piano.noteOn(${midiNote}, ${microNum}, ${velocity}, ${volume})`);
        return note;
    }

    noteOff(midiNote, microNum = 0) {
		let note = this.getNote(midiNote, microNum);

        if (note != null) {
            this.#gain.gain.setValueAtTime(0, this.AudioContext.currentTime);
        }

        //console.log(`Piano.noteOff(${midiNote}, ${microNum})`);
        return note;
    }

    sustainOn() {
        //console.log('Piano.sustainOn');
    }

    sustainOff() {
        //console.log('Piano.sustainOff');
    }

	getFrequency(midiNote, microNum) {
		let note = this.getNote(midiNote, microNum);

		if (note != null)
			return note.frequency;

		return 0.0;
	}

    // playTimedNote plays a timed note unaffected by sustain pedal
    playTimedNote(midiNote, volume = 1.0, duration = 1.0) {
        /*
		let note = this.getNote(midiNote, microNum);
        if (note != null) {
            this.#synth.playTimedNote(note.frequency);
        }
        */
    }

}
