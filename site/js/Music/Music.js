// 69 is set by the MIDi standard
const MIDI_A4KEY = 69;

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
    'b' : '&flat;',  	// music flat sign
    'n' : '&natur;',    // music natural sign
    '#' : '&sharp;'     // music sharp sign
};

const ScaleDownLetters  = [ 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab' ];
const ScaleUpLetters    = [ 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#' ];

// white = (N % 12) in (1, 3, 4, 6, 8, 9, 11)
// black = (N % 12) in (0, 2, 5, 7, 10)
const WhiteKeys    = { 0:false, 1:true,  2:false, 3:true,  4:true,  5:false,
                       6:true,  7:false, 8:true,  9:true, 10:false, 11:true };

export class MusicConfig {
    #a4Key = 49;
    #a4Frequency = 440.0;
    #numTranspose = 0;
    #numMicroTones = 1;
    #tuningSensitivity = 50.0;
    #tones = [1];
    #referenceFrequency = 1.0;

    set A4Key(key) { this.#a4Key = key }
    set A4Frequency(freq) { this.#a4Frequency = freq }
    set NumTranspose(cents) { this.#numTranspose = cents }
    set NumMicroTones(num) { this.#numMicroTones = num }
    set TuningSensitivity(cents) { this.#tuningSensitivity = cents }
    set Tones(tones) { this.#tones = tones }
    set ReferenceFrequency(freq) { this.#referenceFrequency = freq }

    get A4Key() { return this.#a4Key }
    get A4Frequency() { return this.#a4Frequency }
    get NumTranspose () { return this.#numTranspose }
    get NumMicroTones() { return this.#numMicroTones }
    get TuningSensitivity() { return this.#tuningSensitivity }
    get Tones() { return this.#tones }
    get ReferenceFrequency() { return this.#referenceFrequency }

    equals(cfg) {
        if (this.A4Key != cfg.A4Key)
            return false;
        if (this.A4Frequency != cfg.A4Frequency)
            return false;
        if (this.NumTranspose != cfg.NumTranspose)
            return false;
        if (this.NumMicroTones != cfg.NumMicroTones)
            return false;
        if (this.TuningSensitivity != cfg.TuningSensitivity)
            return false;
        if (this.Tones != cfg.Tones)
            return false;
        if (this.ReferenceFrequency != cfg.ReferenceFrequency)
            return false;
        return true;
    }

    getKey(params = null) {
        let ary = [this.A4Key, this.A4Frequency, this.NumTranspose, this.NumMicroTones, this.TuningSensitivity, this.Tones, this.ReferenceFrequency ];

        if (params != null) {
            for (let [name, value] of params)
                ary.push(value);
        }

        return ary.join(":");
    }
}

export class Music {
    static #config = new MusicConfig();

    static set A4Key(key) { this.#config.A4Key = key }
    static set A4Frequency(freq) { this.#config.A4Frequency = freq }
    static set NumTranspose(cents) { this.#config.NumTranspose = cents }
    static set NumMicroTones(num) { this.#config.NumMicroTones = num }
    static set TuningSensitivity(cents) { this.#config.TuningSensitivityg = cents }
    static set Tones(tones) { Music.tones = this.#config.Tones }
    static set ReferenceFrequency(freq) { this.#config.ReferenceFrequency = freq }

    static get A4Key() { return this.#config.A4Key }
    static get A4Frequency() { return this.#config.A4Frequency }
    static get NumTranspose () { return this.#config.NumTranspose }
    static get NumMicroTones() { return this.#config.NumMicroTones }
    static get TuningSensitivity() { return this.#config.TuningSensitivityg }
    static get Tones() { return this.#config.Tones }
    static get ReferenceFrequency() { return this.#config.ReferenceFrequency }

    static getConfig() {
        return this.#config;
    }

    static getNearestNote(frequency) {
        let microId = this.MicroId(frequency);
        let keyNum = this.KeyNum(frequency);
        return new PianoNote(keyNum, this.MicroNum(frequency));
    }

    /* semi-tone frequency formula:
                    d/12
        440.0 Hz * 2
      
       With key (K) relative to A4
                    (K - A4)/12
        440.0 Hz * 2
      
       Relative to microtones (M):
                    (K*M - A4*M + microNum)/(12*M)
        440.0 Hz * 2
      
       With transpose shifting in cent units:
                    ((K*M - A4*M + microNum)*100 + cents)/(12*M*100)
        440.0 Hz * 2
    */

    static Frequency(keyNum) {
        let keyDistance = keyNum - this.#config.A4Key;
        let exp = (keyDistance * 100 + this.#config.NumTranspose) / 1200;
        return 2**exp * this.#config.A4Frequency;
	}

    static MicroFrequency(keyNum, microNum = 0) {
        let microDistance = (keyNum * this.#config.NumMicroTones) - (this.#config.A4Key * this.#config.NumMicroTones) + microNum;
        let exp = (microDistance * 100 + this.#config.NumTranspose) / (1200 * this.#config.NumMicroTones);
        return 2**exp * this.#config.A4Frequency;
    }

    static MidiFrequency(midiKeyNum) {
        let keyDistance = midiKeyNum - MIDI_A4KEY;
        return 2 ** ((keyDistance * 100 + this.#config.NumTranspose) / 1200) * this.#config.A4Frequency;
    }

    static MidiToKeyNum(midiKeyNum) {
        return midiKeyNum - 20;
    }

    static KeyNumToMidi(keyNum) {
        return keyNum + 20;
    }

	static KeyDistance(fromFreq, toFreq) {
        return 12 * Math.log2(toFreq/fromFreq);
	}

	static MicroDistance(fromFreq, toFreq) {
        return (12 * this.#config.NumMicroTones) * Math.log2(toFreq/fromFreq);
	}

    static Cents(fromFreq, toFreq) {
        return fromFreq == 0 ? NaN : Math.log2(toFreq/fromFreq) * 1200;
    }

    static Octave(keyNum) {
        return Math.round((keyNum + 2) / 12); // begin on C and end on B
    }

    static MicroOctave(keyNum) {
        return Math.round(((keyNum + 2) * this.#config.NumMicroTones) / (12 * this.#config.NumMicroTones));
    }

    static Transpose(freq, cents) {
        return freq * (2**(cents/1200));
    }

    static KeyNum(freq) {
        return Math.round(this.KeyDistance(this.Transpose(this.A4Frequency,this.NumTranspose), freq) + this.#config.A4Key);
    }

    static MidiNote(freq) {
        return this.KeyNumToMidi(this.KeyNum(freq));
    }

    static MicroId(freq) {
        return Math.round(this.MicroDistance(this.Transpose(this.A4Frequency,this.NumTranspose), freq) + (this.#config.A4Key * this.#config.NumMicroTones));
    }

    static MicroNum(freq) {
        let microId = this.MicroId(freq);
        let keyNum = this.KeyNum(freq);
        return microId - (keyNum * this.NumMicroTones); 
    }

	static Entity(n) {
        return musicEntitities[n] ? musicEntities[n] : '';
    }

    static ToEntities(str) {
        for(let key in musicEntities) {
            str = str.replace(key, musicEntities[key]);
        }
        return str;
    }

    static NumToLetter(keyNum) {
        let idx = (keyNum+11) % 12; // -1, but avoid negative numbers, so (+12-1)
        let letter = ScaleUpLetters[idx];

        return this.NumIsWhite(keyNum)
            ? letter
            : ScaleDownLetters[idx] + '/' + letter;
    }

    // direction = true is moving up the scale, false is moving down
    static NumToScaleLetter(keyNum, direction = true) {
        let idx = (keyNum+11) % 12;
        return direction ? ScaleUpLetters[idx] : ScaleDownLetters[idx];
    }

    static NumToFlatLetter(keyNum) {
        let idx = (keyNum+11) % 12;
        return !this.NumIsWhite(keyNum) ? ScaleDownLetters[idx] : '';
    }

    static NumToSharpLetter(keyNum) {
        let idx = (keyNum+11) % 12;
        return !this.NumIsWhite(keyNum) ? ScaleUpLetters[idx] : '';
    }

    static NumIsWhite(keyNum) {
        return WhiteKeys[keyNum % 12];
    }

    static NumIsBlack(keyNum) {
        return !this.NumIsWhite(keyNum);
    }

	static round(num, precision) {
    	return Math.round(num * (10**precision)) / (10**precision);
	}
}

export class Note {
    #microId = 0;
    #midiNote = 0;
    #microNum = 0;
    #frequency = 0.0;

    constructor(frequency = 0.0) {
        this.#microId = Music.MicroId(frequency);
        this.#midiNote = Music.MidiNote(frequency);
        this.#frequency = frequency;
    }

    get MicroId() { return this.#microId }
    get MidiNote() { return this.#midiNote }
    get Frequency() { return this.#frequency }
    get Label() { return "" + this.#midiNote + "." + this.#microId }
}

export class PianoNote extends Note {
    #keyNum = 0;
    #microNum = 0;
    #letter = '';
    #octave = 0;
	#isWhite = true;

    constructor(keyNum, microNum) {
        super(Music.MicroFrequency(keyNum, microNum));

        this.#keyNum = keyNum;
        this.#microNum = microNum;
        this.#letter = Music.NumToLetter(keyNum);
        this.#octave = Music.Octave(keyNum);
        this.#isWhite = Music.NumIsWhite(keyNum);
    }

    get Label() { return this.Letter; }

    get KeyNum() { return this.#keyNum }
    get MicroNum() { return this.#microNum }
    get Letter() { return this.#letter }
    get FlatLetter() { return Music.NumToFlatLetter(this.#keyNum) }
    get SharpLetter() { return Music.NumToSharpLetter(this.#keyNum) }
    get Octave() { return this.#octave }

	get IsWhite() { return this.#isWhite }
	get IsBlack() { return !this.#isWhite }

    centsBetween(toNote) {
        return Music.Cents(this.Frequency, toNote.Frequency);
    }

    clone(note) {
        return new PianoNote(note.KeyNum, note.MicroNum);
    }

    // old fields
    get microId() { return this.MicroId }
    get keyNum() { return this.KeyNum }
    get microNum() { return this.MicroNum }
    get midiNote() { return this.MidiNote }
    get letter() { return this.Letter }
    get octave() { return this.Octave }
    get isWhite() { return this.IsWhite }
    get flatLetter() { return this.FlatLetter }
    get sharpLetter() { return this.SharpLetter }
    get frequency() { return this.Frequency }
}

