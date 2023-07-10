import { Music, MusicConfig } from "./Music.js"
import { PianoNotes } from "./PianoNotes.js"
import { TIANotes, NTSCMode, PALMode } from "./TIANotes.js"
import { Piano } from "./Piano.js"
import { TIA } from "./TIA.js"

export class Synth {
	#audioCtx = null;
    #masterVolume = 1.0;
    #polyphony = 1;

    #instrumentMaker = null;
    #instruments = [];
    #freeList = [];
    #usedMap = new Map();

    #selectedInstrumentName = 'piano';
    #selectedScaleName = 'piano';

    #musicConfig = null;

    constructor(cfg, polyphony) {
        this.#musicConfig = cfg;
        this.#polyphony = polyphony;
        this.reset(cfg);
	}

    get AudioContext() { return this.#audioCtx }
    get State() { return this.#audioCtx.state }
    get MasterVolume() { return this.#masterVolume }
    get DesiredPolyphony() { return this.#polyphony }
    get Polyphony() { return this.#instruments.length }
    get VolumeIncrement() { return 0.10 };

    get NumPlaying() { return this.#usedMap.size }
    get NumFree() { return this.#freeList.length }

    get InstrumentMaker() { return this.#instrumentMaker }

    set MasterVolume(val) { this.#masterVolume = (val >= 0.0 && val <= 1.0) ? val : this.#masterVolume }

    set Config(cfg) { this.#instrumentMaker.Config = cfg }
    get Config() { return this.#instrumentMaker.Config }

    reset(cfg) {
        this.#audioCtx = new AudioContext();
		console.log("Audio: Web Audio API initialized");

        this.#instrumentMaker = new InstrumentMaker(this.#audioCtx, cfg);
        this.#instruments = this.#instrumentMaker.getInstruments(
            this.#selectedInstrumentName, this.#selectedScaleName, this.DesiredPolyphony
        );
        this.#freeList = this.#instruments;
    }

    switchInstrument(playerName, scaleName, opts) {
        if (playerName === 'tia' && scaleName === 'piano')
            scaleName = 'tia';

        this.#instruments = this.#instrumentMaker.getInstruments(playerName, scaleName, this.DesiredPolyphony, opts);
    }

    setInstruments(ary) {
        this.#polyphony = ary.length;
        this.#instruments = ary;
        this.#freeList = ary;

        // disable currently playing notes
        for (let [key, inst] of this.#usedMap) {
            let [midiNote, microNum] = key.split('_');
            inst.noteOff(midiNote, microNum);
        }

        this.#usedMap.clear();
    }

    getInstruments() {
        return this.#instruments;
    }

    volumeUp(amount = 0.0) {
        if (amount == 0.0)
            amount = this.VolumeIncrement;

        if (this.#masterVolume < 1.0 - amount)
            this.#masterVolume += amount;
        else
            this.#masterVolume = 1.0;
    }

    volumeDown(amount = 0.0) {
        if (amount == 0.0)
            amount = this.VolumeIncrement;

        if (this.#masterVolume > amount)
            this.#masterVolume -= amount;
        else
            this.#masterVolume = 0.0;
    }

    noteOn(midiNote, microNum = 0, velocity = 1.0) {
        let note = null;

        if (this.State == 'suspended')
            this.resume();

        if (this.#freeList.length > 0) {
            let key = this.#key(midiNote, microNum);
            let inst = this.#freeList.pop();
            note = inst.noteOn(midiNote, microNum, velocity, this.#masterVolume);
            this.#usedMap.set(key, inst);
        }

        return note;
    }

    noteOff(midiNote, microNum = 0, velocity = 1.0) {
        let note = null;

        if (this.State == 'suspended')
            this.resume();

        let key = this.#key(midiNote, microNum);
        let inst = this.#usedMap.get(key);
        if (inst != null) {
            note = inst.noteOff(midiNote, microNum);
            this.#freeList.push(inst);
            this.#usedMap.delete(key);
        }

        return note;
    }

    sustainOn() {
        if (this.State == 'suspended')
            this.resume();
    }

    sustainOff() {
        if (this.State == 'suspended')
            this.resume();
    }

    suspend() {
        this.#audioCtx.suspend();
    }

    resume() {
        this.#audioCtx.resume();
    }

    #key(midiNote, microNum) {
        return midiNote + '_' + microNum;
    }
}

export class InstrumentMaker {
    #musicConfig = null;
    #audioCtx = null;

    //#tiaMode = null;
    //#tiaTone = 0.0;

    #scaleCache = new Map();

    constructor(audioCtx, cfg) {
        this.#audioCtx = audioCtx;
        this.#musicConfig = cfg;
        this//.#tiaMode = new NTSCMode();
    }

    set Config(cfg) { this.#musicConfig = cfg }
    get Config() { return this.#musicConfig }

    set AudioContext(ctx) { this.#audioCtx = ctx }
    get AudioContext() { return this.#audioCtx }

    /*
    set TIAMode(tiaMode) { this.#tiaMode = tiamode }
    get TIAMode() { return this.#tiaMode }
    get TIAFrequency() { return this.#tiaMode.Frequency }

    set TIATone(tone) { this.#tiaTone = tone }
    get TIATone(tone) { return this.#tiaTone}
    */

    // playerName = [ piano | tia ]
    // scaleName = [ piano | tia ]
    //
    // player "tia" with scale "piano" will not return a playable instrument
    getInstruments(playerName, scaleName, numInstances, opts = null) {
        let noteList = null;
        let instruments = [];

        if (opts == null)
            opts = {};

        if (opts.Tone == null || opts.Tone < 0 || opts.Tone >= 16)
            opts.Tone = 1;

        if (opts.VideoFormat == null)
            opts.VideoFormat = 'ntsc';

        if (numInstances <= 0)
            numInstances = 1;

        if (playerName === 'tia' && numInstances > 2)
            numInstances = 2;

        switch(scaleName) {
            case 'tia':
                noteList = this.getTIAScale(opts).getNotes();
                break;
            case 'piano': 
                noteList = this.getPianoScale().getNotes();
                break;
            default:
        }

        if (noteList == null) {
            console.log("Failed to retrive noteList");
            return null;
        }

        for (let i=0; i < numInstances; i++) {
            switch(playerName) {
                case 'tia':
                    instruments.push(this.getTIAPlayer(noteList, i));
                    break;
                case 'piano': 
                    instruments.push(this.getPianoPlayer(noteList, i));
                    break;
                default:
                    return null;
            }
        }

        return instruments;
    }

    getPianoScale() {
        let key = this.Config.getKey();
        let scale = this.#scaleCache.get(key);
        
        if (scale == null) {
            scale = new PianoNotes(this.Config);
            this.#scaleCache.set(key, scale);
        }

        //console.log(this.#scaleCache);

        return scale;
    }

    getTIAScale(opts) {
        let key = this.Config.getKey(opts);
        let scale = this.#scaleCache.get(key);

        if (scale == null) {
            scale = new TIANotes(this.Config, opts);
            this.#scaleCache.set(key, scale);
        }

        //console.log(this.#scaleCache);

        return scale;
    }

    getPianoPlayer(noteList, instance) {
        return new Piano(this.#audioCtx, noteList, instance);
    }

    getTIAPlayer(noteList, instance) {
        return new TIA(this.#audioCtx, noteList, instance);
    }
}
