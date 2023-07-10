import { Music, Note, PianoNote } from "./Music.js"
import { MusicScale } from "./MusicScale.js"

// NoteFrequency = OscillatorRate / ColorClocks / WaveformLength / NoteValue
// https://forums.atariage.com/topic/257526-musicsound-programming-question-atari-2600/

// average color clocks per audio clock is an average of alternating values between 112 and 116
const COLOR_CLOCKS_PER_LINE		 = 228;
const AVG_COLOR_CLOCKS_PER_AUDIO = COLOR_CLOCKS_PER_LINE/2;	// color clocks per audio clock

// Atari 2600 NTSC crystal clock (C015510). This differs slightly from the computed
// NTSC frequency: 315/88*1000*1000 = 3.579545 MHz
const NTSC_FREQ = 3.579575 * 1e6;

// Atari 2600 PAL crystal clock (CO16112). This differs slightly from the computed
// PAL frequency: 283.75*15625*4/5+25 = 3.546900 MHz
const PAL_FREQ = 3.546894 * 1e6;

export class NTSCMode {
    #frequency      = NTSC_FREQ;
    #cpuFrequency   = NTSC_FREQ/3;
    #audioFrequency = NTSC_FREQ/AVG_COLOR_CLOCKS_PER_AUDIO;
    #fps            = 60/1.001; // fields per second

    get Frequency() { return this.#frequency }
    get FPS() { return this.#fps }
    get CpuFrequency() { return this.#cpuFrequency }
    get AudioFrequency () { return this.#audioFrequency }
}

export class PALMode {
    #frequency      = PAL_FREQ;
    #cpuFrequency   = PAL_FREQ/3;
    #audioFrequency = PAL_FREQ/AVG_COLOR_CLOCKS_PER_AUDIO;
    #fps            = 50; // fields per second

    get Frequency() { return this.#frequency }
    get FPS() { return this.#fps }
    get CpuFrequency() { return this.#cpuFrequency }
    get AudioFrequency () { return this.#audioFrequency }
}

export class TIANote extends Note {
	#pitch = 0;
	#tone = 0;
	#cents = 0.0;
    #pianoNote = null;

    constructor(frequency, pitch, tone) {
        super(frequency);
        this.#pitch = pitch;
        this.#tone = tone;
        this.#pianoNote = Music.getNearestNote(frequency);
        this.#cents = Music.Cents(this.#pianoNote.Frequency, frequency);
    }

    clone() {
        return new TIANote(this.Frequency, this.Pitch, this.Tone);
    }

    get Label() {
        return "" + this.Tone + "/" + this.Pitch;
    }

	get Pitch() { return this.#pitch }
	get Tone() { return this.#tone }
	get Cents() { return this.#cents }
    get NearestPianoNote() { return this.#pianoNote }

	get KeyNum() { return this.#pianoNote.KeyNum }
    get MicroNum() { return this.#pianoNote.MicroNum }
    get Letter() { return this.#pianoNote.Letter }

	set Cents(val) { this.#cents = val }

    // old fields
    get microId() { return this.MicroId }
	get pitch() { return this.Pitch }
	get tone() { return this.Tone }
	get frequency() { return this.Frequency }
	get cents() { return this.Cents }

    get midiNote() { return this.MidiNote }
    get keyNum() { return this.KeyNum }
    get microNum() { return this.MicroNum }

	set cents(val) { this.Cents = val }
}

export class TIANotes extends MusicScale {
    #mode = new NTSCMode();
	#tones = [1, 2, 3, 4, 5, 7, 8, 9, 12, 13, 14, 15];
	#allTones = Array(16).fill(0).map((e,i) => { return 15 - i });
	#allPitches = Array(32).fill(0).map((e,i) => { return 31 - i });
	#divisors = [
		/* AUDC control value (0 and 11 are silent)
   	    0   1    2    3  4  5   6   7    8   9  10 11 12 13  14  15
		*/
		1, 15, 465, 465, 2, 2, 31, 31, 511, 31, 31, 1, 6, 6, 93, 93
	];
    #selectedTone = 1;

    set Config(cfg) {
        super.Config = cfg;
        this.setModeByString(super.Config.VideoFormat);
    }
    get Config() { return super.Config }

    set Options(opts) {
        this.setModeByString(opts.VideoFormat);
        this.#selectedTone = opts.Tone;
    }

    set Mode(videoMode) { this.#mode = videoMode; }
    set SelectedTone(tone) { this.#selectedTone = tone; }

    get TypeName() { return "Atari TIA" }
    get Mode() { return this.#mode; }
	get Tones() { return this.#tones; }
	get AllTones() { return this.#allTones; }
	get AllPitches() { return this.#allPitches; }
	get Divisors() { return this.#divisors; }

    static get Empty() { return {microId:'', keyNum:'', tone:'', pitch:'', frequency:'', cents:'' } }

    constructor(musicConfig, opts) {
        super(musicConfig);
        this.setModeByString(opts.VideoFormat);
        this.#selectedTone = opts.Tone;
    }

    setModeByString(str) {
        const ModeMap = {
            'ntsc': new NTSCMode(),
            'pal': new PALMode()
        };

        if (typeof (ModeMap[str]) != 'undefined')
            this.#mode = ModeMap[str];
    }

	getNotes() {
		let ary = [];
		for (let pitch = 31; pitch >= 0; pitch--) {
			let frequency = this.computeFrequency(this.#selectedTone, pitch);
            let note = new TIANote(frequency, pitch, this.#selectedTone);
			ary.push(note);
        }
        ary.sort((a,b) => {
            let c = a.Frequency - b.Frequency;
            if (c != 0) return c;
            return Math.abs(a.Cents) - Math.abs(b.Cents);
        });
		return ary;
	}

	computeFrequency(tone, pitch) {
		if (tone < 0 || tone >= 16 || pitch < 0 || pitch >= 32)
			return 0.0;

        return this.#mode.AudioFrequency / this.#divisors[tone] / (pitch+1);
	}
}
