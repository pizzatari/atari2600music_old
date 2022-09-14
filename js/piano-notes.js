export const NTSC_FREQ          = 315/88*1000*1000;    // MHz
export const NTSC_FPS           = 60/1.001;            // fields per second
export const PAL_FREQ           = 283.75*15625*4/5+25; // MHz
export const PAL_FPS            = 50;                  // fields per second
export const NTSC_CPU_FREQ      = NTSC_FREQ/3;
export const PAL_CPU_FREQ       = PAL_FREQ/3;

export const ntsc_cfg = {
    'vid_freq'  : NTSC_FREQ,
    'cpu_freq'  : NTSC_CPU_FREQ,
};

export const pal_cfg = {
    'vid_freq'  : PAL_FREQ,
    'cpu_freq'  : PAL_CPU_FREQ,
};

export const PianoTemplate = {
	"MicroNum" : '',
	"MicroFreq" : '',
	"MicroStep": '',
	"KeyNum" : '',
	"Key" : '',
	"KeyFreq" : '',
	"Octave" : '',
	"FlatKey" : '',
	"FlatFreq" : '',
	"SharpKey" : '',
	"SharpFreq" : ''
};

export const AtariTemplate = {
	"MicroNum" : '',
	'KeyNum' : '',
	'AtariPitch': '',
	'AtariFreq': '',
	'AtariType': '',
	'Cents': ''
};

const A4_KEY_FREQ        = 440.0;
const A4_KEY		 	 = 49;

const KEY_FIRST         = 1;
const KEY_LAST          = 88;

const LETTER_FIRST       = 3;
const OCTAVE_FIRST       = 0;

const noteLetters = new Array(
    "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"
);
const flatLetters = {
    "A": "Ab", "B": "Bb", "D": "Db", "E": "Eb", "G": "Gb" 
};
const sharpLetters = {
    "A": "A#", "C": "C#", "D": "D#", "F": "F#", "G": "G#"
};

const pitch_divisors = new Array(
    // 0 and 11 are silent 
    //0   1    2    3  4  5   6   7    8  9   10  11  12  13  14  15
     0,  15, 465, 465, 2, 2, 31, 31, 511, 31, 31,  0,  2,  2, 31, 31
);
const pixel_tones = {
    1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 7: 1, 8: 1, 9: 1
};
const cpu_tones = {
    12: 1, 13: 1, 14: 1, 15: 1
};


Number.prototype.roundTo = function(digits) {
    return +(Math.round(`${this}e+${digits}`) + `1e-${digits}`);
}

// classes
export class Options {
	static videoCfg = ntsc_cfg;;
	static a4Freq = 440.0
	static numMicroTones = 1;
	static atariPitch = 4;
	static tuningPrecision = 1;
	static freqPrecision = 1;
	static centPrecison = 1;
	static tuningSensitivity = 50;
}

export class PianoNote {
	#octave = 0;
	#key = '';
	#flatKey = '';
	#sharpKey = '';
	#frequency = 0.0;
	#flatFrequency = 0.0;
	#sharpFrequency = 0.0;
	#keyNum = 0;
	#microNum = '';
	#microStep = 0;

	static precision = 1;

	get getOctave() { return this.#octave; }
	get getKey() { return this.#key; }
	get getFlatKey() { return this.#flatKey; }
	get getSharpKey() { return this.#sharpKey; }

	get getFlatFrequency() { return Math.round(this.#flatFrequency * 10**PianoNote.precision)/10**PianoNote.precision; }
	get getFrequency() { return Math.round(this.#frequency * 10**PianoNote.precision)/10**PianoNote.precision; }
	get getSharpFrequency() { return Math.round(this.#sharpFrequency * 10**PianoNote.precision)/10**PianoNote.precision; }

	get getKeyNum() { return this.#keyNum; }
	get getMicroNum() { return this.#microNum; }
	get getMicroStep() { return this.#microStep; }

	constructor(note, key, frequency,
			    flatKey, flatFrequency,
			    sharpKey, sharpFrequency,
				keyNum, microNum, microStep) {

		if (typeof(note) === 'PianoNote') {
			this.#octave = note.getOctave;
			this.#key = note.getKey;
			this.#flatKey = note.getFlatKey;
			this.#sharpKey = note.getSharpKey;

			this.#frequency = note.getFrequency;
			this.#flatFrequency = note.getFlatFrequency;
			this.#sharpFrequency = note.getSharpFrequency;

			this.#keyNum = note.getKeyNum;
			this.#microNum = note.getMicroNum;
			this.#microStep = note.getMicroStep;
		} else {
			this.#octave = note;
			this.#key = key;
			this.#flatKey = flatKey;
			this.#sharpKey = sharpKey;

			this.#frequency = frequency;
			this.#flatFrequency = flatFrequency;
			this.#sharpFrequency = sharpFrequency;

			this.#keyNum = keyNum;
			this.#microNum = microNum;
			this.#microStep = microStep;
		}
	}
}

export class AtariNote {
	#microNum = '';
	#type = '';
	#pitch = 0;
	#frequency = 0.0;

	static precision = 1;

	constructor(microNum, type, pitch, frequency) {
		this.#microNum = microNum;
		this.#type = type;
		this.#pitch = pitch;
		this.#frequency = frequency;
	}
	
	get getMicroNum() { return this.#microNum; }
	get getPitch() { return this.#pitch; }
	get getFrequency() { return Math.round(this.#frequency * 10**AtariNote.precision)/10**AtariNote.precision; }
	get getType() { return this.#type; }
}

export class NotePair {
    #pianoNote = null;
    #atariNote = null;
    #cents = NaN;

	static precision = 1;

    constructor(pianoNote, atariNote) {
        this.#pianoNote = pianoNote;
        this.#atariNote = atariNote;
        this.#calculateCents();
    }

	get getPianoNote() { return this.#pianoNote; }
	get getAtariNote() { return this.#atariNote; }
	get getCents() { return Math.round(this.#cents * 10**NotePair.precision) / 10**NotePair.precision; }

	set setPianoNote(pianoNote) {
        this.#pianoNote = pianoNote;
        this.#calculateCents();
    }

	set setAtariNote(atariNote) {
        this.#atariNote = atariNote;
        this.#calculateCents();
    }

    #calculateCents() {
        if (this.#pianoNote != null && this.#atariNote != null) {
            this.#cents = getCents(this.#pianoNote.getFrequency, this.#atariNote.getFrequency);
        }
    }
}

export class Tuning {
	#tunedNotes = new Array();
	#totalTuned = 0;
	#totalCents = 0.0;
	#maxCents = 0.0;
	#minCents = 0.0;

	static precision = Options.tuningPrecision;

	constructor(notesTable) {
    	for (let [microNum, pair] of notesTable) {
        	let pianoNote = pair.getPianoNote;
        	if (pair.getAtariNote != null && pianoNote.getMicroStep == 0) {
                if (Math.abs(pair.getCents) <= Options.tuningSensitivity)  {
            	    this.#totalTuned++;
            	    this.#totalCents += Math.abs(pair.getCents);
            	    this.#tunedNotes.push(pianoNote.getKey + pianoNote.getOctave.toString());

			        if (this.#maxCents < pair.getCents)
				        this.#maxCents = pair.getCents;

			        if (this.#minCents > pair.getCents)
				        this.#minCents = pair.getCents;
                }
        	}
    	}
	}

	get getTunedNotes() { return this.#tunedNotes; }
	get getNumTuned() { return this.#totalTuned; }
	get getTotalCents() { return Math.round(this.#totalCents * 10**Tuning.precision)/10**Tuning.precision; }
	get getMaxCents() { return Math.round(this.#maxCents * 10**Tuning.precision)/10**Tuning.precision; }
	get getMinCents() { return Math.round(this.#minCents * 10**Tuning.precision)/10**Tuning.precision; }

	get getAvgCents() { 
		if (this.#totalTuned > 0)
			return Math.round(this.#totalCents / this.#totalTuned * 10**Tuning.precision)/ 10 **Tuning.precision;
		return 0.0;
	}

	get getCentRange() { 
		let diff = this.#maxCents - this.#minCents;
		return Math.round(diff * 10**Tuning.precision) / 10**Tuning.precision;
	}
}

export function getPianoNotes(A4Freq, numMicroTones) {
    let ary = new Array();
    let octave = OCTAVE_FIRST;
    let mid = Math.floor(numMicroTones/2);
	let step = numMicroTones > 0 ? 1/numMicroTones : 0;

    for (let keyNum = KEY_FIRST; keyNum <= KEY_LAST; keyNum++) {
		let key = noteLetters[keyNum % noteLetters.length];
		let keyFreq = getKeyFrequency(A4Freq, keyNum - A4_KEY);

        if (key == "C")
        	octave++

        for (let microStep = 0-mid; microStep < (numMicroTones-mid); microStep++) {
			let microFreq = getKeyFrequency(A4Freq, keyNum - A4_KEY + (microStep * step));
			let microNum = Math.round(getKeyNum(A4Freq, microFreq) * numMicroTones);

			// don't store out of bound keys
			if (octave == 0 && microStep < 0)
				continue;

			if (octave == 8 && microStep > 0)
				continue;

			let flatKey = '';
        	let flatFreq = 0.0;
			let sharpKey = '';
      		let sharpFreq = 0.0;

			if (microStep == 0) {
				flatKey = flatLetters[key] ? flatLetters[key] : '';
        		flatFreq = getKeyFrequency(A4Freq, keyNum - 1 - A4_KEY);
				sharpKey = sharpLetters[key] ? sharpLetters[key] : '';
      			sharpFreq = getKeyFrequency(A4Freq, keyNum + 1 - A4_KEY);

				if (keyNum == KEY_FIRST) {
					flatKey = '';
					flatFreq = 0.0;
				}

				if (keyNum == KEY_LAST) {
					sharpKey = '';
					sharpFreq = 0.0;
				}
			}

			ary.push(new PianoNote(
				octave,
				key,
				microFreq,
				flatKey,
				flatFreq,
				sharpKey,
				sharpFreq,
				keyNum,
				microNum,
				microStep,
			));
		}
	}

	return ary;
}

export function getAtariNotes(A4Freq, cfg, atariTone, numMicroTones) {
    let ary = new Array();

	if (atariTone in pixel_tones) {
        let baseFreq = cfg.vid_freq / 114 / pitch_divisors[atariTone];
        for (let i = 32; i > 0; i--) {
			let currFreq = baseFreq / i;
			let keyNum = Math.round(getKeyNum(A4Freq, currFreq));
			let microNum = Math.round(getKeyNum(A4Freq, currFreq)*numMicroTones);

			ary.push(new AtariNote(microNum, 'Color Clock', i-1, currFreq));
        }
	} else if (atariTone in cpu_tones) {
        let baseFreq = cfg['cpu_freq'] / 114 / pitch_divisors[atariTone];
        for (let i = 32; i > 0; i--) {
			let currFreq = baseFreq / i;
			let keyNum = Math.round(getKeyNum(A4Freq, currFreq));
			let microNum = Math.round(getKeyNum(A4Freq, currFreq) * numMicroTones);

			ary.push(new AtariNote(microNum, 'CPU Clock', i-1, currFreq));
        }
    }

	return ary;
}

export function getNotePairs() {
    let pianoNotes = getPianoNotes(Options.a4Freq, Options.numMicroTones);
    let atariNotes = getAtariNotes(Options.a4Freq, Options.videoCfg, Options.atariPitch, Options.numMicroTones);

    let notesTable = new Map();

    for (let note of pianoNotes) {
        notesTable.set(note.getMicroNum, new NotePair(note, null));
    }

    for (let atariNote of atariNotes) {
        let pair = notesTable.get(atariNote.getMicroNum);
        if (pair == null)
            continue;

        let newPair = new NotePair(pair.getPianoNote, atariNote);

        if (pair.getAtariNote == null || (Math.abs(newPair.getCents) < Math.abs(pair.getCents)) ) {
            notesTable.set(atariNote.getMicroNum, newPair);
        }
    }

	return notesTable;
}

export function getKeyFrequency(referenceFreq, semiDistance) {
    return referenceFreq * (2 ** (semiDistance/12));
}

export function getKeyNum(referenceFreq, freq) {
    return getNumKeysBetween(referenceFreq, freq) + 49;
}

export function getNumKeysBetween(referenceFreq, freq) {
    return 12 * Math.log2(freq/referenceFreq);
}

export function getCents(referenceFreq, freq) {
    if(referenceFreq == 0)
        return NaN;

    return Math.log2(freq/referenceFreq) * 1200;
}

export function getTotalNumKeys() {
	return KEY_LAST-KEY_FIRST+1;
}

export function getMinKeyFreq(referenceFreq) {
	return getKeyFrequency(referenceFreq, KEY_FIRST-A4_KEY);
}

export function getMicroNum(referenceFreq, freq, numSteps) {
    return getNumMicrosBetween(referenceFreq, freq, numSteps) + (49 * numSteps);
}

export function getNumMicrosBetween(referenceFreq, freq, numSteps) {
    return Math.round(numSteps * 12 * Math.log2(freq/referenceFreq)) - numSteps + 1;
}

