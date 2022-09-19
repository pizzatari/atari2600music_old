import {Carousel} from "./carousel.js";

export const NTSC_FREQ          = 315/88*1000*1000;    // MHz
export const NTSC_FPS           = 60/1.001;            // fields per second
export const PAL_FREQ           = 283.75*15625*4/5+25; // MHz
export const PAL_FPS            = 50;                  // fields per second
export const NTSC_CPU_FREQ      = NTSC_FREQ/3;
export const PAL_CPU_FREQ       = PAL_FREQ/3;

const A4_KEY_FREQ        = 440.0;
const A4_KEY		 	 = 49;

const KEY_FIRST         = 1;
const KEY_LAST          = 88;

const LETTER_FIRST       = 3;
const OCTAVE_FIRST       = 0;

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

let changeInputs = [
    'A4FreqId',
    'TuningSensitivityId',
    //'TuningId',
    'TransposeId',
    'NumMicroTonesId',
    'AtariPitchId',
    'VideoFormatId',
    'PrintBlackKeysId',
    'PrintGeometryId',
    'PrintFrequencyId',
    //'ExpandPianoId',
    'ShrinkPianoId',
    'JumpToFirstId'
    //'InnerJoinId'
    //'JumpToFirstId',
    //'SoundOnId'
];

let rangeInputs = new Map([
    [ 'A4FreqRangeId',            'A4FreqId' ],
    [ 'TuningSensitivityRangeId', 'TuningSensitivityId' ],
    [ 'TransposeRangeId',         'TransposeId' ],
    [ 'NumMicroTonesRangeId',     'NumMicroTonesId' ]
]);

let reverseRangeInputs = new Map();
rangeInputs.forEach((value, key) => { reverseRangeInputs.set(value, key); });

// classes
export class Options {
    static ntsc_cfg = {
        'name'      : 'ntsc',
        'vid_freq'  : NTSC_FREQ,
        'cpu_freq'  : NTSC_CPU_FREQ,
        'fps'       : NTSC_FPS
    };

    static pal_cfg = {
        'name'      : 'pal',
        'vid_freq'  : PAL_FREQ,
        'cpu_freq'  : PAL_CPU_FREQ,
        'fps'       : PAL_FPS
    };

    static cfg = {
        'ntsc': Options.ntsc_cfg,
        'pal': Options.pal_cfg
    };

	static videoCfg = Options.ntsc_cfg;
	static a4Freq = 440.0
	static atariPitch = 4;
	static numMicroTones = 1;
	static tuningSensitivity = 50;
	static tuningPrecision = 1;
	static freqPrecision = 1;
	static centPrecison = 1;
    static printBlackKeys = false;
    static printGeometry = true;
    static printFrequency = false;
	static expandPiano = false;
	static shrinkPiano = false;
    static jumpToFirst = false;
    static innerJoin = false;
    static firstPianoKey = KEY_FIRST;
    static lastPianoKey = KEY_LAST;
    static firstPianoOctave = OCTAVE_FIRST;

    static getCfg(name) {
        return Options.cfg[name];
    }

    static save() {
        let frm = document.getElementsByClassName("frm");
        let data = {};

        for (let i = 0; i < frm.length; i++) {
            if (typeof frm[i].value != 'undefined') {
                if (frm[i].type === 'checkbox') 
                    data[frm[i].name] = (frm[i].checked ? 'Yes' : 'No');
                else
                    data[frm[i].name] = frm[i].value;
            }
        }

        window.localStorage.setItem("OptionsFormId", JSON.stringify(data));
    }

    static load() {
        let frm = document.getElementsByClassName("frm");
        let str = window.localStorage.getItem("OptionsFormId");

	    let obj = {};
	    for (let i = 0; i < frm.length; i++) {
		    obj[frm[i].name] = frm[i];
	    }

        if (str != null) {
            let data = JSON.parse(str);
            for (let key in data) {
                if (typeof obj[key] != 'undefined') {
                    if (obj[key].type === 'checkbox') {
                        obj[key].checked = (data[key] === 'Yes' ? true : false);
                    } else {
                        obj[key].value = data[key];
                    }
                }
            }
        }
    }

    static refresh() {
        Options.videoCfg = Options.getCfg(document.getElementById('VideoFormatId').value);
        Options.a4Freq = parseFloat(document.getElementById('A4FreqId').value);
        Options.atariPitch = parseInt(document.getElementById('AtariPitchId').value);
        Options.numMicroTones = parseInt(document.getElementById('NumMicroTonesId').value);
        Options.tuningSensitivity = parseInt(document.getElementById('TuningSensitivityId').value);
        Options.printBlackKeys = document.getElementById('PrintBlackKeysId').checked ? true : false;
        Options.printGeometry = document.getElementById('PrintGeometryId').checked ? true : false;
        Options.printFrequency = document.getElementById('PrintFrequencyId').checked ? true : false;
        //Options.expandPiano = document.getElementById('ExpandPianoId').checked ? true : false;
        Options.shrinkPiano = document.getElementById('ShrinkPianoId').checked ? true : false;
        Options.jumpToFirst = document.getElementById('JumpToFirstId').checked ? true : false;
        //Options.innerJoin = document.getElementById('InnerJoinId').checked ? true : false;
    }

    static loadDefaults() {
	    Options.a4Freq = 440.0
	    Options.tuningSensitivity = 50;
        Options.transpose = 0;
	    Options.numMicroTones = 1;
	    Options.atariPitch = 1;
	    Options.videoCfg = Options.ntsc_cfg;
        Options.printBlackKeys = false;
        Options.printGeometry = true;
        Options.printFrequency = false;
        Options.shrinkPiano = false;
        Options.expandPiano = false;
        Options.jumpToFirst = false;

	    Options.tuningPrecision = 1;
	    Options.freqPrecision = 1;
	    Options.centPrecison = 1;
        Options.innerJoin = false;

        document.getElementById('A4FreqId').value = Options.a4Freq;
        document.getElementById('A4FreqRangeId').value = parseInt(Options.a4Freq);
        document.getElementById('TuningSensitivityId').value = Options.tuningSensitivity;
        document.getElementById('TuningSensitivityRangeId').value = Options.tuningSensitivity;
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

        document.getElementById('TuningSensitivityId').value = Options.tuningSensitivity;
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

	static precision = 1;

	get getOctave() { return this.#octave; }
	get getKey() { return this.#key; }
	get getSharpKey() { return this.#sharpKey; }
	get getFlatKey() { return this.#flatKey; }

	get getFrequency() { return Math.round(this.#frequency * 10**PianoNote.precision)/10**PianoNote.precision; }
	get getSharpFrequency() { return Math.round(this.#sharpFrequency * 10**PianoNote.precision)/10**PianoNote.precision; }
	get getFlatFrequency() { return Math.round(this.#flatFrequency * 10**PianoNote.precision)/10**PianoNote.precision; }

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

export class NotesTable {
    #containerElem = '';
    #tableHtml = '<table class="tone-list"><tbody id="tone-data"></tbody></table>';

    constructor(containerElem) {
        this.#containerElem = containerElem;
    }

    render() {
        updatePage();
    }

    static getPianoNotes() {
        let ary = new Array();
        let octave = Options.firstPianoOctave;
        let mid = Math.floor(Options.numMicroTones/2);
	    let step = Options.numMicroTones > 0 ? 1/Options.numMicroTones : 0;

        for (let keyNum = Options.firstPianoKey; keyNum <= Options.lastPianoKey; keyNum++) {
		    let key = noteList[keyNum % 12].note;
		    let keyFreq = getKeyFrequency(Options.a4Freq, keyNum - A4_KEY);

            if (key == "C")
        	    octave++

            for (let microStep = 0-mid; microStep < (Options.numMicroTones-mid); microStep++) {
			    let microFreq = getKeyFrequency(Options.a4Freq, keyNum - A4_KEY + (microStep * step));
			    let microNum = Math.round(getKeyNum(Options.a4Freq, microFreq) * Options.numMicroTones);

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
        		    flatFreq = getKeyFrequency(Options.a4Freq, keyNum - 1 - A4_KEY);
				    sharpKey = sharpLetters[key] ? sharpLetters[key] : '';
      			    sharpFreq = getKeyFrequency(Options.a4Freq, keyNum + 1 - A4_KEY);

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
    static getPianoNotes(A4Freq, numMicroTones) {
        let ary = new Array();
        let octave = OCTAVE_FIRST;
        let mid = Math.floor(numMicroTones/2);
	    let step = numMicroTones > 0 ? 1/numMicroTones : 0;

        for (let keyNum = KEY_FIRST; keyNum <= KEY_LAST; keyNum++) {
		    let key = noteLetters[keyNum % 12];
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
    */

    static getAtariNotes(A4Freq, cfg, atariTone, numMicroTones) {
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

    static getNotePairs() {
        let pianoNotes = NotesTable.getPianoNotes(Options.a4Freq, Options.numMicroTones);
        let atariNotes = NotesTable.getAtariNotes(Options.a4Freq, Options.videoCfg, Options.atariPitch, Options.numMicroTones);

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
}

for (let e of changeInputs) {
    document.getElementById(e).addEventListener('change', (evt) => {
		if(evt.target.id == 'NumMicroTonesId' && parseInt(evt.target.value) < 1)
			evt.target.value = 1;
			
        if (reverseRangeInputs.has(evt.target.id))
            document.getElementById(reverseRangeInputs.get(evt.target.id)).value = evt.target.value;

        updatePage();
    });
}

for (let [src, dst] of rangeInputs) {
    document.getElementById(src).addEventListener('change', (evt) => {
        if (rangeInputs.has(evt.target.id))
            document.getElementById(rangeInputs.get(evt.target.id)).value = evt.target.value;
        updatePage();
    });
}

document.getElementById('ResetId').addEventListener('click', (evt) => {
    Options.loadDefaults();
    updatePage();
});

export function updatePage() {
    Options.refresh();
    notesTable = NotesTable.getNotePairs();
    tuning = new Tuning(notesTable);

    let outHtml = `<tr>
<th>Piano</th>
<th class="spacer"></th>
<th class="freq">P. Freq</th>
<th>Atari</th>
<th class="freq">A. Freq</th>
<th>Cents</th>
<th>Key#</th>
<th>Micro#</th>
</tr>`;

	let firstAtariNote = 0;
	let lastAtariNote = 0;
    for (let [microNum, pair] of notesTable) {
		if(pair.getAtariNote != null) {
			if (firstAtariNote == 0)
				firstAtariNote = microNum;
			lastAtariNote = microNum;
		}
	}

    for (let [microNum, pair] of notesTable) {
        let note = pair.getPianoNote;
        let atari = pair.getAtariNote;

		if (Options.shrinkPiano && firstAtariNote > 0 && lastAtariNote > 0) {
			if (microNum < firstAtariNote || microNum > lastAtariNote)
				continue;
		}

        if (!note.getIsBlackKey || (note.getIsBlackKey && Options.printBlackKeys)) {
            outHtml += buildRowHtml(pair);
        }

    }

    let node = document.getElementById('tone-data');
    $(node).html(outHtml);

    updateBlackKeys();
    updateKeyColors();
    alterTable();

    outHtml = buildMajorChordsHtml(notesTable);
    node = document.getElementById('ChordsListId');
    $(node).html(outHtml);

    // info
    outHtml = Math.round(Options.videoCfg.vid_freq).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "/" + Math.round(Options.videoCfg.fps);
    $("#VidFreqId").html(`${outHtml} Hz`);
    $("#TotalTunedId").html(tuning.getNumTuned);
    $("#QualityId").html(tuning.getAvgCents);
    $("#MaxRangeId").html(`[${tuning.getMinCents} to ${tuning.getMaxCents}] &Delta;${tuning.getCentRange}`);
    
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

    let canvas = document.getElementById("GeometryId");
    if (Options.printGeometry) {
        const notes = noteList.map(elem => elem.note);
        let carousel = new Carousel(canvas, notes, 'bold 14pt sans-serif');
		canvas.style.display = 'block';
    } else {
		canvas.style.display = 'none';
	}

	if (Options.jumpToFirst && firstAtariNote > 0) {
		$([document.documentElement, document.body]).animate({
        	scrollTop: ($(`.micronum-${firstAtariNote}`).offset().top - 20)
    	}, 2000)
	}

    Options.save();
}

function alterTable() {
	if(Options.printFrequency) {
		$('th.freq').show();
		$('td.freq').show();
	} else {
		$('th.freq').hide();
		$('td.freq').hide();
	}
}

function buildRowHtml(pair) {
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

    if (flatKey && sharpKey) {
        blackKey = `<div>${flatKey} / ${sharpKey}</div>`;
        blackFreq = `<div>${note.getFlatFrequency} / ${note.getSharpFrequency} Hz</div>`;
    } else if (sharpKey) {
        blackKey = `<div>${sharpKey}</div>`;
        blackFreq = `<div>${note.getSharpFrequency} Hz</div>`;
    } else if (flatKey) {
        blackKey = flatKey;
        blackFreq = `${note.getFlatFrequency} Hz`;
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

function updateBlackKeys() {
    let prevNote = null;
    let i = 0;
    for (let [microNum, pair] of notesTable) {
        let currNote = pair.getPianoNote;

        if (i++ > 0 && currNote.getMicroStep == 0 && currNote.getFlatKey.indexOf('b') >= 0) {
            let elem = document.getElementById(`blackkey-${currNote.getKeyNum}`);
			if(elem != null) {
            	let html = currNote.getFlatKey;
            	if (prevNote != null)
                	html += ` / ${prevNote.getSharpKey}`;
            	html += `<small>${prevNote.getOctave}</small>`;

            	elem.innerHTML = `${html}`;
			}
        }

        if (currNote.getMicroStep == 0 && currNote.getSharpKey.indexOf('#') >= 0)
            prevNote = currNote;
    }
}

function updateKeyColors() {
    for (let [microNum, pair] of notesTable) {
        let color = 128;
        let blue = 192;
        let colorRange = 255-color;
        let blueRange= 255-blue;

        if (pair.getAtariNote != null) {
            let cents = pair.getCents;
            let colorRatio = Math.abs(cents) / Options.tuningSensitivity;
            let blueRatio = Math.abs(cents) / Options.tuningSensitivity;
            color = Math.round(255 - Math.min(128 * colorRatio, 128));
            blue  = Math.round(255 - Math.min(64 * blueRatio, 64));
        }

        let e = document.getElementsByClassName(`micronum-${microNum}`)[0];
        if (e) {
            e.style.backgroundColor = `rgb(${color},${color},${blue})`;
        }
    }
}

function shrinkTable() {
/*
    let firstNote = null;
    let lastNote = null;

    for (let [microNum, pair] of notesTable) {
        let curr = pair.getAtariNote;
        if(firstNote == null && curr != null)
            firstNote = curr;
        if(curr != null)
            lastNote = curr;
    }

    if (firstNote != null && lastNote != null) {
    for (let [microNum, pair] of notesTable) {
    }
*/
}

function buildMajorChordsHtml(notesTable) {
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

function setOnly(obj, val) {
    return obj == null || obj === '' || obj === false || typeof obj === 'undefined' ? '' : val;
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

