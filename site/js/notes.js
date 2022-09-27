import {Carousel} from "./carousel.js";

export const NTSC_FREQ          = 315/88*1000*1000;    // MHz
export const NTSC_FPS           = 60/1.001;            // fields per second
export const PAL_FREQ           = 283.75*15625*4/5+25; // MHz
export const PAL_FPS            = 50;                  // fields per second
export const NTSC_CPU_FREQ      = NTSC_FREQ/3;
export const PAL_CPU_FREQ       = PAL_FREQ/3;

const A4_KEY_FREQ               = 440.0;
const A4_KEY                    = 49;

const KEY_FIRST                 = 1;
const KEY_LAST                  = 88;

const LETTER_FIRST              = 3;
const OCTAVE_FIRST              = 0;

const NUM_PIANO_KEYS            = 88;

export const noteList = [
    { note: 'G#/Ab', isWhite: false },
    { note: 'A',     isWhite: true  },
    { note: 'A#/Bb', isWhite: false },
    { note: 'B',     isWhite: true  },
    { note: 'C',     isWhite: true  },
    { note: 'C#/Db', isWhite: false },
    { note: 'D',     isWhite: true  },
    { note: 'D#/Eb', isWhite: false },
    { note: 'E',     isWhite: true  },
    { note: 'F',     isWhite: true  },
    { note: 'F#/Gb', isWhite: false },
    { note: 'G',     isWhite: true  }
];
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

const majorChords = new Set([
    "CEG",
    "C#FG#",
    "DbFAb",
    "DF#A",
    "D#GA#",
    "EbGBb",
    "EG#B",
    "FAC",
    "F#A#C#",
    "GbBbDb",
    "GBD",
    "G#CD#",
    "AbCEb",
    "AC#E",
    "A#DF",
    "BbDF",
    "BD#F#"
]);

let pianoNotes;
let atariNotes;
let notesTable;
let tuning;
let tunedNotes = new Array();

const ntsc_cfg = {
    'name'      : 'ntsc',
    'vid_freq'  : NTSC_FREQ,
    'cpu_freq'  : NTSC_CPU_FREQ,
    'fps'       : NTSC_FPS
};

const pal_cfg = {
    'name'      : 'pal',
    'vid_freq'  : PAL_FREQ,
    'cpu_freq'  : PAL_CPU_FREQ,
    'fps'       : PAL_FPS
};

const vid_cfg = {
    'ntsc': ntsc_cfg,
    'pal': pal_cfg
};

// classes
export class Options {
    static a4Freq;
    static tuningSensitivity;
    static tuningGradient;
    static transpose;
    static numMicroTones;
    static staticriPitch;
    static videoCfg;
    static printBlackKeys;
    static printGeometry;
    static printFrequency;
    static expandPiano;
    static shrinkPiano;
    static jumpToFirst;
    static innerJoin;
    static enableSound;

    static freqPrecision;
    static centPrecision;

    static firstPianoKey;
    static lastPianoKey;
    static firstPianoOctave;

    static {
        Options.loadDefaults();
    }

    static getVideoCfg(name) {
        return vid_cfg[name];
    }

    static loadDefaults() {
        Options.a4Freq = 440.0
        Options.tuningSensitivity = 50;
        Options.tuningGradient = true;
        Options.transpose = 0;
        Options.numMicroTones = 1;
        Options.atariPitch = 1;
        Options.videoCfg = ntsc_cfg;
        Options.printBlackKeys = false;
        Options.printGeometry = true;
        Options.printFrequency = true;
        Options.shrinkPiano = false;
        Options.expandPiano = false;
        Options.jumpToFirst = false;
        Options.innerJoin = false;
        Options.enableSound = false;

        Options.freqPrecision = 1;
        Options.centPrecision = 1;

        Options.firstPianoKey = KEY_FIRST;
        Options.lastPianoKey = KEY_LAST;
        Options.firstPianoOctave = OCTAVE_FIRST;
    }

    static readFromForm() {
        Options.a4Freq = parseFloat(document.getElementById('A4FreqId').value);
        Options.tuningSensitivity = parseInt(document.getElementById('TuningSensitivityId').value);
        Options.tuningGradient = document.getElementById('TuningGradientId').checked ? true : false;
        Options.transpose = parseInt(document.getElementById('TransposeId').value);
        Options.numMicroTones = parseInt(document.getElementById('NumMicroTonesId').value);
        Options.atariPitch = parseInt(document.getElementById('AtariPitchId').value);
        Options.videoCfg = Options.getVideoCfg(document.getElementById('VideoFormatId').value);
        Options.printBlackKeys = document.getElementById('PrintBlackKeysId').checked ? true : false;
        Options.printGeometry = document.getElementById('PrintGeometryId').checked ? true : false;
        Options.printFrequency = document.getElementById('PrintFrequencyId').checked ? true : false;
        //Options.expandPiano = document.getElementById('ExpandPianoId').checked ? true : false;
        Options.shrinkPiano = document.getElementById('ShrinkPianoId').checked ? true : false;
        Options.jumpToFirst = document.getElementById('JumpToFirstId').checked ? true : false;
        //Options.innerJoin = document.getElementById('InnerJoinId').checked ? true : false;
        //Options.enableSound = document.getElementById('EnableSoundId').checked ? true : false;
    }

    static writeToForm() {
        document.getElementById('A4FreqId').value = Options.a4Freq;
        document.getElementById('A4FreqRangeId').value = parseInt(Options.a4Freq);
        document.getElementById('TuningSensitivityId').value = Options.tuningSensitivity;
        document.getElementById('TuningSensitivityRangeId').value = Options.tuningSensitivity;
        document.getElementById('TuningGradientId').checked = Options.tuningGradient;
        document.getElementById('TransposeId').value = Options.transpose;
        document.getElementById('TransposeRangeId').value = Options.transpose;
        document.getElementById('NumMicroTonesId').value = Options.numMicroTones;
        document.getElementById('NumMicroTonesRangeId').value = Options.numMicroTones;
        document.getElementById('AtariPitchId').value = Options.atariPitch;
        document.getElementById('VideoFormatId').value = Options.videoCfg.name;
        document.getElementById('PrintBlackKeysId').checked = Options.printBlackKeys;
        document.getElementById('PrintGeometryId').checked = Options.printGeometry;
        document.getElementById('PrintFrequencyId').checked = Options.printFrequency;
        //document.getElementById('ExpandPianoId').checked = Options.expandPiano;
        document.getElementById('ShrinkPianoId').checked = Options.shrinkPiano;
        document.getElementById('JumpToFirstId').checked = Options.jumpToFirst;
        //document.getElementById('EnableSoundId').checked = Options.enableSound;
    }

    static saveToStorage() {
		let opts = {};

		for (let n in Options) {
			if (n === 'videoCfg')
				opts[n] = Options[n].name
			else
				opts[n] = Options[n];
		}

        window.localStorage.setItem("Options", JSON.stringify(opts));
    }

    static loadFromStorage() {
        let str = window.localStorage.getItem("Options");
		if (str == null) return;

        let opts = JSON.parse(str);
		if (opts == null) return;

		for (let n in opts) {
			if (n === 'videoCfg')
				Options[n] = Options.getVideoCfg(opts[n]);
			else
				Options[n] = opts[n];
		}
    }
}

export class PianoNote {
    #octave = 0;
    #key = '';
    #sharpKey = '';
    #flatKey = '';

    #frequency = 0.0;
    #sharpFrequency = 0.0;
    #flatFrequency = 0.0;

    #keyColor = 'white';
    #isBlackKey = false;

    #keyNum = 0;
    #microNum = '';
    #microStep = 0;

    get getOctave() { return this.#octave; }
    get getKey() { return this.#key; }
    get getSharpKey() { return this.#sharpKey; }
    get getFlatKey() { return this.#flatKey; }

    get getFrequency() { return Math.round(this.#frequency * 10**Options.freqPrecision)/10**Options.freqPrecision; }
    get getSharpFrequency() { return Math.round(this.#sharpFrequency * 10**Options.freqPrecision)/10**Options.freqPrecision; }
    get getFlatFrequency() { return Math.round(this.#flatFrequency * 10**Options.freqPrecision)/10**Options.freqPrecision; }

    get getKeyColor() { return this.#keyColor; }
    get getIsBlackKey() { return this.#isBlackKey; }

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

        if (this.#key.indexOf('#') >= 0 || this.#key.indexOf('b') >= 0) {
            this.#isBlackKey = true;
            this.#keyColor = 'black';
        }
    }
}

export class AtariNote {
    #microNum = '';
    #type = '';
    #pitch = 0;
    #frequency = 0.0;

    constructor(microNum, type, pitch, frequency) {
        this.#microNum = microNum;
        this.#type = type;
        this.#pitch = pitch;
        this.#frequency = frequency;
    }
    
    get getMicroNum() { return this.#microNum; }
    get getPitch() { return this.#pitch; }
    get getFrequency() { return Math.round(this.#frequency * 10**Options.freqPrecision)/10**Options.freqPrecision; }
    get getType() { return this.#type; }
}

export class NotePair {
    #pianoNote = null;
    #atariNote = null;
    #cents = NaN;
    #maxCents = 50;

    static maxCents = 50;

	// pianoNote must not be null; atariNote can be null
    constructor(pianoNote, atariNote) {
        this.#pianoNote = pianoNote;
        this.#atariNote = atariNote;
        this.#calculateCents();
    }

    get getPianoNote() { return this.#pianoNote; }
    get getAtariNote() { return this.#atariNote; }

	get getMicroNum() { return this.#pianoNote.getMicroNum; }

    get getCents() {
		if (this.#atariNote != null && !isNaN(this.#cents)) {
			let tmp = Math.round(this.#cents * 10**Options.centPrecision) / 10**Options.centPrecision;
			if (tmp > 100) {
                console.log(JSON.stringify(this));
            }

			return Math.round(this.#cents * 10**Options.centPrecision) / 10**Options.centPrecision;
		}
		return NaN;
	}

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
            this.#cents = Music.getCents(this.#pianoNote.getFrequency, this.#atariNote.getFrequency);
        }
    }
}

export class Tuning {
    #tunedNotes = new Array();
    #totalTuned = 0;
    #totalCents = 0.0;
    #maxCents = 0.0;
    #minCents = 0.0;

    constructor(notePairs) {
        for (let [microNum, pair] of notePairs) {
            let pianoNote = pair.getPianoNote;

/*
if (pair.getAtariNote != null) {
	console.log(`${microNum} a4(${Options.a4Freq}) piano(${pair.getPianoNote.getFrequency}) atari(${pair.getAtariNote.getFrequency})`);
	console.log("  " + Music.getCents(pair.getPianoNote.getFrequency, pair.getAtariNote.getFrequency));
}
*/

            if (pair.getAtariNote != null && pianoNote.getMicroStep == 0) {
                if (Math.abs(pair.getCents) <= Options.tuningSensitivity)  {
                    this.#totalTuned++;
                    this.#totalCents += Math.abs(pair.getCents);
                    this.#tunedNotes.push(pianoNote);

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
    get getTotalCents() { return Math.round(this.#totalCents * 10**Options.centPrecision)/10**Options.centPrecision; }
    get getMaxCents() { return Math.round(this.#maxCents * 10**Options.centPrecision)/10**Options.centPrecision; }
    get getMinCents() { return Math.round(this.#minCents * 10**Options.centPrecision)/10**Options.centPrecision; }

    get getAvgCents() { 
        if (this.#totalTuned > 0)
            return Math.round(this.#totalCents / this.#totalTuned * 10**Options.centPrecision)/ 10 **Options.centPrecision;
        return 0.0;
    }

    get getCentRange() { 
        let diff = this.#maxCents - this.#minCents;
        return Math.round(diff * 10**Options.centPrecision) / 10**Options.centPrecision;
    }
}

export class NotesTable {
    #notePairs = null;
    #pianoNotes = null;
    #atariNotes = null;

	// constructor(Notestable) to copy construct
	// constructor(true): deep construct
	// constructor(): shallow construct
    constructor(arg1, arg2, arg3) {
		if (arg1 === true) {
			this.#pianoNotes = this.createPianoNotes();
			this.#atariNotes = this.createAtariNotes();
			this.#notePairs = this.createNotePairs();
		} else if (typeof arg1 == 'NotesTable') {
			this.#notePairs = arg1.getNotePairs();
			this.#pianoNotes = arg2.getPianoNotes();
			this.#atariNotes = arg3.getAtariNotes();
		}
    }

    get getNotePairs() { return this.#notePairs; }
	get getPianoNotes() { return this.#pianoNotes; }
	get getAtariNotes() { return this.#atariNotes; }

    set setNotePairs(notePairs) {
		this.#notePairs = notePairs;
		this.#pianoNotes = notePairs.getPianoNotes()
		this.#atariNotes = notePairs.getAtariNotes()
	}
	set setPianoNotes(pianoNotes) {
		this.#pianoNotes = pianoNotes;
		this.#notePairs = this.createNotePairs();
	}
	set setAtariNotes(atariNotes) {
		this.#atariNotes = atariNotes;
		this.#notePairs = this.createNotePairs();
	}

	rebuildNotePairs() {
		this.#pianoNotes = this.createPianoNotes();
		this.#atariNotes = this.createAtariNotes();
		this.#notePairs = this.createNotePairs();
	}

	rebuildPianoNotes() {
		this.#pianoNotes = this.createPianoNotes();
		this.#notePairs = this.createNotePairs();
	}

	rebuildAtariNotes() {
		this.#atariNotes = this.createAtariNotes();
		this.#notePairs = this.createNotePairs();
	}

	createNotePairs() {
		if (this.#pianoNotes == null)
			this.#pianoNotes = this.createPianoNotes();

		if (this.#atariNotes == null)
			this.#atariNotes = this.createAtariNotes();

		// load piano notes
        let map = new Map();
        for (let note of this.#pianoNotes) {
            map.set(note.getMicroNum, new NotePair(note, null));
        }

		// match up with atari notes
        for (let aNote of this.#atariNotes) {
            let pair = map.get(aNote.getMicroNum);
            if (pair == null) continue;

			// assign only if non-existing or current note is better tuned
			let newPair = new NotePair(pair.getPianoNote, aNote);
            if( isNaN(pair.getCents) || Math.abs(newPair.getCents) < Math.abs(pair.getCents) ) {
                map.set(newPair.getMicroNum, newPair);
            }
        }

        return map;
    }

    createPianoNotes() {
        let ary = new Array();
        let octave = Options.firstPianoOctave;
        let mid = Math.floor(Options.numMicroTones/2);
        let step = Options.numMicroTones > 0 ? 1/Options.numMicroTones : 0;

        for (let keyNum = Options.firstPianoKey; keyNum <= Options.lastPianoKey; keyNum++) {
            let key = noteList[keyNum % 12].note;
            let keyFreq = Music.getKeyFrequency(keyNum);

//console.log(`kn=${keyNum} key=${key} kf=${keyFreq}`);

            if (key == "C")
                octave++

            for (let microStep = 0-mid; microStep < (Options.numMicroTones-mid); microStep++) {
                //let microFreq = Music.getKeyFrequency(Options.a4Freq, keyNum - A4_KEY + (microStep * step), Options.transpose);
                //let microNum = Math.round(Music.getKeyNum(Options.a4Freq, microFreq) * Options.numMicroTones);
                let microFreq = Music.getMicroFrequency((keyNum - A4_KEY + (microStep * step)) * Options.numMicroTones, Options.numMicroTones, Options.transpose);
                let microNum = Math.round(Music.getMicroNum(microFreq));

//console.log(`mn=${microNum} mf=${microFreq}`);

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
                    flatFreq = Music.getKeyFrequency(keyNum - 1);
                    sharpKey = sharpLetters[key] ? sharpLetters[key] : '';
                    sharpFreq = Music.getKeyFrequency(keyNum + 1);

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
    /*
    createPianoNotes() {
        let ary = new Array();
        let currOctave = Options.firstPianoOctave;
        
        for (let num = 1; num < (NUM_PIANO_KEYS * Options.numMicroTones); num++) {
            let dist = num - (A4_KEY * Options.numMicroTones);
            let freq = Music.getMicroFrequency(Options.a4Freq, dist, Options.numMicroTones);
            let key = noteList[Math.ceil(num/Options.numMicroTones) % 12.note;

            let freq = getMicroFrequency(referenceFreq, microDistance, numMicroTones) {




        }



        for (let keyNum = Options.firstPianoKey; keyNum <= Options.lastPianoKey; keyNum++) {
            let key = noteList[keyNum % 12].note;
            let keyFreq = Music.getKeyFrequency(Options.a4Freq, keyNum - A4_KEY);

            if (key == "C")
                octave++

            for (let microStep = 0-mid; microStep < (Options.numMicroTones-mid); microStep++) {
                //let microFreq = Music.getKeyFrequency(Options.a4Freq, keyNum - A4_KEY + (microStep * step));
                //let microNum = Math.round(Music.getKeyNum(Options.a4Freq, microFreq) * Options.numMicroTones);
                let microFreq = Music.getMicroFrequency(Options.a4Freq, (keyNum - A4_KEY + (microStep * step)) * Options.numMicroTones, Options.numMicroTones);
                let microNum = Math.round(Music.getMicroNum(Options.a4Freq, microFreq, Options.numMicroTones));

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
                    flatFreq = Music.getKeyFrequency(Options.a4Freq, keyNum - 1 - A4_KEY);
                    sharpKey = sharpLetters[key] ? sharpLetters[key] : '';
                      sharpFreq = Music.getKeyFrequency(Options.a4Freq, keyNum + 1 - A4_KEY);

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
    */

    createAtariNotes(pitch) {
        let ary = new Array();

        if (pitch === undefined)
            pitch = Options.atariPitch;

        if (Options.atariPitch in pixel_tones) {
            let baseFreq = Options.videoCfg.vid_freq / 114 / pitch_divisors[Options.atariPitch];
            for (let i = 32; i > 0; i--) {
                let currFreq = baseFreq / i;
                let keyNum = Math.round(Music.getKeyNum(currFreq));
                //let microNum = Math.round(Music.getKeyNum(Options.a4Freq, currFreq)*Options.numMicroTones);
                let microNum = Math.round(Music.getMicroNum(currFreq));

                ary.push(new AtariNote(microNum, 'Color Clock', i-1, currFreq));
            }
        } else if (Options.atariPitch in cpu_tones) {
            let baseFreq = Options.videoCfg['cpu_freq'] / 114 / pitch_divisors[Options.atariPitch];
            for (let i = 32; i > 0; i--) {
                let currFreq = baseFreq / i;
                let keyNum = Math.round(Music.getKeyNum(currFreq));
                //let microNum = Math.round(Music.getKeyNum(currFreq) * Options.numMicroTones);
                let microNum = Math.round(Music.getMicroNum(currFreq));

                ary.push(new AtariNote(microNum, 'CPU Clock', i-1, currFreq));
            }
        }

        return ary;
    }
}

export class Page {
    static notesTable = null;
    static tableId = '';
    static canvasId = '';

	// input field => field specific updator
	static changeHandlers = null;
	static rangeHandlers = null;
	static rangeInputs = null;
	static reverseRangeInputs = null;

    //static tableHtml = '<table class="tone-list"><tbody id="tone-data"></tbody></table>';

    static initialize(notesTable, tableContainerId, canvasContainerId) {
        Page.notesTable = notesTable;
        Page.tableId = tableContainerId;
        Page.canvasId = canvasContainerId;

		Page.changeHandlers = {
    		'A4FreqId': (e) => {
				document.getElementById('A4FreqRangeId').value = e.target.value;
			},
    		'TuningSensitivityId': (e) => {
				document.getElementById('TuningSensitivityRangeId').value = e.target.value;
			},
    		'TuningGradientId': null,
    		//'TuningId': null,
    		'TransposeId': (e) => {
				document.getElementById('TransposeRangeId').value = e.target.value;
			},
    		'NumMicroTonesId': (e) => {
                if(e.target.id == 'NumMicroTonesId' && parseInt(e.target.value) < 1)
                    e.target.value = 1;
				document.getElementById('NumMicroTonesRangeId').value = e.target.value;
			},
    		'AtariPitchId': null,
    		'VideoFormatId': null,
    		'PrintBlackKeysId': null,
    		'PrintGeometryId': null,
    		'PrintFrequencyId': null,
    		//'ExpandPianoId': null,
    		'ShrinkPianoId': null,
    		'JumpToFirstId': null,
    		//'InnerJoinId': null,
    		//'SoundOnId': null
    		'A4FreqRangeId': (e) => {
				document.getElementById('A4FreqId').value = e.target.value;
			},
    		'TuningSensitivityRangeId': (e) => {
				document.getElementById('TuningSensitivityId').value = e.target.value;
			},
    		'TransposeRangeId': (e) => {
				document.getElementById('TransposeId').value = e.target.value;
			},
    		'NumMicroTonesRangeId': (e) => {
				document.getElementById('NumMicroTonesId').value = e.target.value;
			}
		}

		Page.rebuildHandlers = {
    		'A4FreqId': 				(e) => { Page.notesTable.rebuildNotePairs() },
    		'TuningSensitivityId': 		null,
    		'TuningGradientId': 		null,
    		//'TuningId': 				(e) => { Page.notesTable.rebuildPianoNotes() },
    		'TransposeId': 				(e) => { Page.notesTable.rebuildNotePairs() },
    		'AtariPitchId': 			(e) => { Page.notesTable.rebuildNotePairs() },
    		'VideoFormatId': 			(e) => { Page.notesTable.rebuildAtariNotes() },
    		'PrintBlackKeysId': 		null,
    		'PrintGeometryId': 			null,
    		'PrintFrequencyId': 		null,
    		//'ExpandPianoId':	 		(e) => { Page.notesTable.rebuildPianoNotes() },
    		'ShrinkPianoId': 			null,
    		'JumpToFirstId': 			null,
    		//'InnerJoinId': 			null,
    		//'SoundOnId': 				null,
    		'A4FreqRangeId':  			(e) => { Page.notesTable.rebuildNotePairs() },
    		'TuningSensitivityRangeId': null,
    		'TransposeRangeId': 		(e) => { Page.notesTable.rebuildNotePairs() },
    		'NumMicroTonesRangeId': 	(e) => { Page.notesTable.rebuildNotePairs() }
		}

        // on change events
        for (let id in Page.changeHandlers) {
            document.getElementById(id).addEventListener('change', (e) => {
				if (Page.changeHandlers[id] != null)
					Page.changeHandlers[id](e);

                Options.readFromForm();
                Options.saveToStorage();

				if (Page.rebuildHandlers[id] != null)
					Page.rebuildHandlers[id](e);

                Page.render();
            });
        }

        // on click reset event
        document.getElementById('ResetId').addEventListener('click', (evt) => {
            Options.loadDefaults();
            Options.writeToForm();
            Options.saveToStorage();
            Page.notesTable.rebuildNotePairs();
			Page.render();
        });
    }

	static render() {
		if (this.tableId != '')
			Page.renderTable();
		if (this.canvasId != '')
			Page.renderGeometry();

        Page.renderDistribution();
	}

    static renderTable() {
        tuning = new Tuning(Page.notesTable.getNotePairs);

        let outHtml = '<table class="tone-list"><tbody id="tone-data"></tbody></table>';
        document.getElementById(Page.tableId).innerHTML = outHtml;

        outHtml = `<tr>
            <th title="Piano notes relative to the A4 key frequency.">Piano</th>
            <th class="spacer"></th>
            <th class="freq" title="Piano Frequency">P. Freq</th>
            <th title="Atari pitch (AUDC)">Atari</th>
            <th class="freq" title="Atari Frequency">A. Freq</th>
            <th title="Tuning difference between the piano reference note and the Atari note.">Cents</th>
            <th title="Numeric key position on the piano">Key#</th>
            <th title="Numeric position if the piano had micro tones.">Micro#</th>
            </tr>`;

        let firstAtariNote = 0;
        let lastAtariNote = 0;
        for (let [microNum, pair] of Page.notesTable.getNotePairs) {
            if(pair.getAtariNote != null) {
                if (firstAtariNote == 0)
                    firstAtariNote = microNum;
                lastAtariNote = microNum;
            }
        }

        for (let [microNum, pair] of Page.notesTable.getNotePairs) {
            let note = pair.getPianoNote;
            let atari = pair.getAtariNote;

            if (Options.shrinkPiano && firstAtariNote > 0 && lastAtariNote > 0) {
                if (microNum < firstAtariNote || microNum > lastAtariNote)
                    continue;
            }

            if (!note.getIsBlackKey || (note.getIsBlackKey && Options.printBlackKeys)) {
                outHtml += Page.buildRowHtml(pair);
            }

        }

        let node = document.getElementById('tone-data');
        node.innerHTML = outHtml;

        Page.updateBlackKeys();
        Page.updateKeyColors();
        Page.alterTable();

        outHtml = Page.buildMajorChordsHtml(Page.notesTable.getNotePairs);
        node = document.getElementById('ChordsListId');
        node.innerHTML = outHtml;

        // info
        //outHtml = Math.round(Options.videoCfg.vid_freq).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + Math.round(Options.videoCfg.fps);
        outHtml = `Vid/FPS/CPU: <span>
            ${round(Options.videoCfg.vid_freq/1e6, 4)} MHz /
            ${round(Options.videoCfg.fps,1)} Hz /
            ${round(Options.videoCfg.cpu_freq/1e6,4)} MHz</span>`;

        $("#VidFreqId").html(outHtml);
        $("#VidFreqId").prop('title', `${round(Options.videoCfg.vid_freq,2)} Hz / ${round(Options.videoCfg.fps,6)} Hz / ${round(Options.videoCfg.cpu_freq,2)} Hz`);
        $("#TotalTunedId").html(tuning.getNumTuned);
        $("#QualityId").html(tuning.getAvgCents);
        $("#MaxRangeId").html(`[${tuning.getMinCents} &rarr; ${tuning.getMaxCents}] &Delta;${tuning.getCentRange}`);
        
        outHtml = '';
        let octave = NaN;
        let octaveHtml = '';
        for (let n of tuning.getTunedNotes) {
            if(isNaN(octave)) {
                octaveHtml += '<span>' + n.getKey + n.getOctave;
                octave = n.getOctave;
            } else if(octave != n.getOctave) {
                outHtml += octaveHtml + '</span><br>';
                octaveHtml = '<span>' + n.getKey + n.getOctave;
                octave = n.getOctave;
            } else {
                octaveHtml += ", " + n.getKey + n.getOctave;
            }
        }
        if (!isNaN(octave) && octaveHtml != '')
            outHtml += octaveHtml + '</span><br>';

        $("#NotesListId").html(outHtml);

        if (Options.jumpToFirst && firstAtariNote > 0) {
            $([document.documentElement, document.body]).animate({
                scrollTop: ($(`.micronum-${firstAtariNote}`).offset().top - 20)
            }, 2000)
        }

        Options.saveToStorage();
    }

    static renderGeometry(width, height) {
        width = (width == null || width <= 0) ? 400 : width;
        height = (height == null || height <= 0) ? 400 : height;

        let container = document.getElementById(Page.canvasId);
        container.innerHTML = '<canvas id="GeometryId" width="400" height="400"></canvas>';
        let canvas = document.getElementById('GeometryId');

        if (Options.printGeometry) {
            const notes = noteList.map(elem => elem.note);
            let img = document.getElementById('BachId');
            let carousel = new Carousel(canvas, notes, 'bold 14pt sans-serif', img);
            canvas.style.display = 'block';
        } else {
            canvas.style.display = 'none';
        }
    }

    // this is hacky. to be cleaned up later
    static renderDistribution() {
        if (Page.notesTable.getNotePairs.size == 0)
            return;
        if (Page.notesTable.getAtariNotes == null)
            return;
        if (Page.notesTable.getAtariNotes.length == 0)
            return;

        {
            let canvas = document.getElementById('Distribution2Id');
            let ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = "1px";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.save();

            let yScale = (canvas.height-5) / NotePair.maxCents;
            let w = Math.floor(canvas.width / Page.notesTable.getAtariNotes.length);
            let x = 0;
            let y = canvas.height;
            let colorScale = 128 / 32;

            let pivot = new Array(32);
            for(let [microNum, pair] of Page.notesTable.getNotePairs) {
                if (isNaN(pair.getCents)) continue;

                if (Math.abs(pair.getCents) > Options.tuningSensitivity) continue;

                let pitch = pair.getAtariNote.getPitch;
                pivot[pitch] = pair.getCents;
            }

            for (let pitch = pivot.length-1; pitch >= 0; pitch--) {
                let color = 128 - (pitch * colorScale);

                if(pivot[pitch]) {
                    let h = Math.ceil(Math.abs(pivot[pitch] * yScale));
                    ctx.fillStyle = `rgb(${color},${color},${color})`;
                    ctx.fillRect(x, y, w, -h - 5) ;
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x, y, w, -5);
                }

                x += w;
            }
        }
        
        {
            let canvas = document.getElementById('DistributionId');
            let ctx = canvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = "1px";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.strokeStyle = "black";
            ctx.save();

            let yScale = (canvas.height-5) / NotePair.maxCents;
            let w = Math.floor(canvas.width / Page.notesTable.getAtariNotes.length);
            let x = 0;
            let y = Math.round(canvas.height/2);
            let colorScale = 128 / 32;

            let pivot = new Array(32);
            for(let [microNum, pair] of Page.notesTable.getNotePairs) {
                if (isNaN(pair.getCents)) continue;

                if (Math.abs(pair.getCents) > Options.tuningSensitivity) continue;

                let pitch = pair.getAtariNote.getPitch;
                pivot[pitch] = pair.getCents;
            }

            for (let pitch = pivot.length-1; pitch >= 0; pitch--) {
                let color = 128 - (pitch * colorScale);

                if(pivot[pitch]) {
                    let h = Math.round(pivot[pitch] * yScale / 2 - 5);
                    ctx.fillStyle = `rgb(${color},${color},${color})`;
                    ctx.fillRect(x, y, w, -h - 5) ;
                } else {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x, y, w, -5);
                }


                if (pitch % 2 == 0) {
                    ctx.fillStyle = 'black';
                    ctx.fillText(pitch.toString(), x, canvas.height-5);
                }

                x += w;
            }
        }
    }

    static buildRowHtml(pair) {
        let numMicroTones = Options.numMicroTones; //parseInt(document.getElementById('NumMicroTonesId').value);

        let note = pair.getPianoNote;
        let atari = pair.getAtariNote;

        let key = `${note.getKey}<small>${note.getOctave}</small>`;
        key = key.replace(/#/g, "&#x266f;");
        key = key.replace(/b/g, "&#x266d;");

        let flatKey = note.getFlatKey;
        let sharpKey = note.getSharpKey;
        let blackKey = '';
        let blackFreq = '';

        if (note.getIsBlackKey) {
            blackKey = `<div>${sharpKey} / ${flatKey}</div>`;
            blackFreq = `<div>${note.getSharpFrequency} / ${note.getFlatFrequency} Hz</div>`;
        }

        blackKey = blackKey.replace(/#/g, "&#x266f;");
        blackKey = blackKey.replace(/b/g, "&#x266d;");

        let step = numMicroTones <= 1 ? '' : ` <span class="step">[${note.getMicroStep}]</span>`;

        let color = 128;
        let blue = 192;
        
        if (atari != null) {
            color = Math.round(255 - (Math.abs(pair.getCents)/Options.tuningSensitivity*128));
            blue = Math.round(255 - (Math.abs(pair.getCents)/Options.tuningSensititivy*64));
        }

        let clas = `micronum-${note.getMicroNum}`;
        clas += (note.getMicroStep == 0) ? ' pianonote"' : ' micronote';

        let bkId = (note.getMicroStep == 0) ? `id="blackkey-${note.getKeyNum}"` : '';

        let html = `
    <tr class="${clas}">
    <td>${key}<div ${bkId}></div></td>
    <td class="spacer"></td>
    <td class="freq">${note.getFrequency} Hz</td>`;

        if(atari != null) {
            let atariFreq = pair.getAtariNote.getFrequency + " Hz";
            let atariPitch = pair.getAtariNote.getPitch;
            let cents = pair.getCents;

            html += `
    <td>${atari.getPitch}</td>
    <td class="freq">${atari.getFrequency} Hz</td>
    <td>${pair.getCents}</td>`;
        } else {
            html += '<td></td><td class="freq"></td><td></td>';
        }

        html += `<td>${note.getKeyNum} ${step}</td><td>${note.getMicroNum}</td></tr>`;
        return html;
    }

    static buildMajorChordsHtml(notesTable) {
        /*
        let html = '';
        let tuned = new Set(tunedNotes);
        let intersection = new Set(Array.from(tuned).filter(x => s.has(x)));

        let currNotes = [];
        let currLetters = [];

        for (let note of tunedNotes) {
            let letter = note.match(/^[A-G#?]/);
            currLetters.push(letter);
            //currLetters.push(note);

            if (currNotes.length > 2) {
                let testChord = currNotes.join("");

                for (let ch of majorChords) {
                    if (ch.indexOf(testChord) >= 0) {
                        html += ` (<b>${ch}</b>)`;
                    }
                }

                currNotes.shift();
            }
        }

        return html;
        */
        return '';
    }

    static alterTable() {
        if(Options.printFrequency) {
            $('th.freq').show();
            $('td.freq').show();
        } else {
            $('th.freq').hide();
            $('td.freq').hide();
        }
    }

    static updateBlackKeys() {
        let prevNote = null;
        let i = 0;
        for (let [microNum, pair] of Page.notesTable.getNotePairs) {
            let currNote = pair.getPianoNote;

            if (i++ > 0 && currNote.getMicroStep == 0 && currNote.getFlatKey.indexOf('b') >= 0) {
                let elem = document.getElementById(`blackkey-${currNote.getKeyNum}`);
                if(elem != null) {
                    let html = currNote.getFlatKey;
                    if (prevNote != null)
                        html = `${prevNote.getSharpKey}/${html}`;
                    html += `<small>${prevNote.getOctave}</small>`;

                    elem.innerHTML = `${html}`;
                }
            }

            if (currNote.getMicroStep == 0 && currNote.getSharpKey.indexOf('#') >= 0)
                prevNote = currNote;
        }
    }

    static updateKeyColors() {
        let color = 128;		// out of tune color
        let blue = 192;
        let colorRange = 255-color;
        let blueRange = 255-blue;
		let offColor = `rgb(${color},${color},${blue})`;
		let onColor = '#fff';

		if (Options.tuningGradient) {
        	for (let [microNum, pair] of Page.notesTable.getNotePairs) {
            	let color = 128;
            	let blue = 192;
            	let colorRange = 255-color;
            	let blueRange= 255-blue;

            	if (pair.getAtariNote != null) {
                	let cents = pair.getCents;
                	let colorRatio = Math.abs(cents) / Options.tuningSensitivity;
                	let blueRatio = Math.abs(cents) / Options.tuningSensitivity;
                	color = Math.round(255 - Math.min(128 * colorRatio, 128));
//console.log(`cents=${cents} sens=${Options.tuningSensitivity} cRatio=${colorRatio} bRatio=${blueRatio}`);
                	blue  = Math.round(255 - Math.min(64 * blueRatio, 64));
            	}

            	let e = document.getElementsByClassName(`micronum-${microNum}`)[0];
            	if (e) {
                	e.style.backgroundColor = `rgb(${color},${color},${blue})`;
            	}
        	}
		} else {
        	for (let [microNum, pair] of Page.notesTable.getNotePairs) {
				let css = offColor;
            	if (pair.getAtariNote != null) {
                	if (Math.abs(pair.getCents) < Options.tuningSensitivity) {
						css = onColor;
					}
            	}

            	let e = document.getElementsByClassName(`micronum-${microNum}`)[0];
            	if (e) {
                	e.style.backgroundColor = css;
            	}
        	}
		}
    }

/*
    static updateKeyColors() {
        for (let [microNum, pair] of Page.notesTable.getNotePairs) {
            let color = 128;
            let blue = 192;
            let colorRange = 255-color;
            let blueRange= 255-blue;

            if (pair.getAtariNote != null) {
                let cents = pair.getCents;
                let colorRatio = Math.abs(cents) / Options.tuningSensitivity;
                let blueRatio = Math.abs(cents) / Options.tuningSensitivity;
                color = Math.round(255 - Math.min(128 * colorRatio, 128));
//console.log(`cents=${cents} sens=${Options.tuningSensitivity} cRatio=${colorRatio} bRatio=${blueRatio}`);
                blue  = Math.round(255 - Math.min(64 * blueRatio, 64));
            }

            let e = document.getElementsByClassName(`micronum-${microNum}`)[0];
            if (e) {
                e.style.backgroundColor = `rgb(${color},${color},${blue})`;
            }
        }
    }
*/

    static shrinkTable() {
    /*
        let firstNote = null;
        let lastNote = null;

        for (let [microNum, pair] of notesTable.getNotePairs) {
            let curr = pair.getAtariNote;
            if(firstNote == null && curr != null)
                firstNote = curr;
            if(curr != null)
                lastNote = curr;
        }

        if (firstNote != null && lastNote != null) {
        for (let [microNum, pair] of notesTable.getNotePairs) {
        }
    */
    }
}

// maps ASCII coded music symbol to HTML entity
const musicEntities = {
    '##': '&#119082;',  // musical symbol double sharp
    'bb': '&#119083;',  // musical symbol double flat
    'b^': '&#119084;',  // musical symbol flat up
    'bv': '&#119085;',  // musical symbol flat down
    'n^': '&#119086;',  // musical symbol natural up
    'nv': '&#119087;',  // musical symbol natural down
    '#^': '&#119088;',  // musical symbol sharp up
    '#v': '&#119089;',  // musical symbol sharp down
    '#4': '&#119090;',  // musical symbol quarter tone sharp
    'b4': '&#119091;',  // musical symbol quarter tone flat
    'b': '&flat;',  	// music flat sign
    'n': '&natur;',     // music natural sign
    '#': '&sharp;'      // music sharp sign
};

export class Music {
    static getKeyFrequency(keyNum) {
        let dist = keyNum - A4_KEY;     // semitone distance from A4
        return 2 ** ((dist*100+Options.transpose)/1200) * Options.a4Freq;
    }

    // cents: transpose frequency by cent value
    static getMicroFrequency(microDistance, numMicroTones, cents) {
        return 2 ** ((microDistance*100+Options.transpose)/(1200*Options.numMicroTones)) * Options.a4Freq;
    }

    static getKeyNum(freq) {
        return Music.getKeyDistance(Options.a4Freq, freq) + A4_KEY;
    }

    static getMicroNum(freq) {
        return Music.getMicroDistance(Options.a4Freq, freq, Options.numMicroTones) + (A4_KEY*Options.numMicroTones);
    }

    static getCents(fromFreq, toFreq) {
        if(fromFreq == 0)
            return NaN;

        return Math.log2(toFreq/fromFreq) * 1200;
    }

    static getOctave(a4Freq, freq) {
        let c0 = Music.getKeyFrequency(-A4_KEY - 9);

        let cents = 1200 * Math.log2();
    }

    /*
    static getMicroNum(a4Freq, freq, numSteps) {
        return Music.getNumMicrosBetween(Options.a4Freq, freq, numSteps) + (A4_KEY * numSteps);
    }
    */

    static getNumMicrosBetween(a4Freq, freq, numSteps) {
        return Math.round(numSteps * 12 * Math.log2(freq/Options.a4Freq)) - numSteps + 1;
    }

    //

    static getKeyDistance(fromFreq, toFreq) {
        return 12 * Math.log2(toFreq/fromFreq);
    }    

    static getMicroDistance(a4Freq, freq, numMicroTones) {
        return (12*numMicroTones) * Math.log2(freq/Options.a4Freq);
    }    

    static transpose(freq, cents) {
//        console.log('transpose ' + cents + ' freq ' + freq);
        return freq * (2**(cents/1200));
    }

    //

	static entity(n) {
        return musicEntitities[n] ? musicEntities[n] : '';
    }

    static toEntities(str) {
        for(let [key, val] of musicEntities) {
            str = str.replace(key, val);
        }
        return str;
    }

    /*
    // old
    static getKeyNum(referenceFreq, freq) {
        return Music.getNumKeysBetween(referenceFreq, freq) + 49;
    }

    static getNumKeysBetween(referenceFreq, freq) {
        return 12 * Math.log2(freq/referenceFreq);
    }

    //let microFreq = Music.getKeyFrequency(Options.a4Freq, keyNum - A4_KEY + (microStep * step));
    //let microNum = Math.round(Music.getKeyNum(Options.a4Freq, microFreq) * Options.numMicroTones);

    static getTotalNumKeys() {
        return KEY_LAST-KEY_FIRST+1;
    }

    static getMinKeyFreq(referenceFreq) {
        return getKeyFrequency(referenceFreq, KEY_FIRST-A4_KEY);
    }
    */
}

function round(num, precision) {
    return Math.round(num * (10**precision)) / (10**precision);
}

