import { Options } from "./Options.js"
import { Page } from "./UI/Page.js";
import { Music, MusicConfig } from "./Music/Music.js"
import { PianoNotes } from "./Music/PianoNotes.js"
import { TIANotes } from "./Music/TIANotes.js"
import { NoteJoiner, NoteTable } from "./Music/NoteTable.js";
import { MidiParser, MidiCC } from "./Music/MidiParser.js"
import { Synth } from "./Music/Synth.js"
import { Piano } from "./Music/Piano.js";
import { TIA } from "./Music/TIA.js";


let atariScreenNotified = false;

export class Controller {
    #musicConfig = null;
	#pianoSource = null;
	#noteSources = [];
    #noteJoiner = null;
    #page = null;

	#midiParser = new MidiParser();
	#midiAccess = null;
    #synth = null;

    constructor(musicConfig) {
        this.#musicConfig = musicConfig;
		this.#pianoSource = new PianoNotes(musicConfig);
        this.#noteJoiner = new NoteJoiner(this.#pianoSource.getNotes());
        this.#page = new Page(this.#pianoSource.TypeName);
		this.#initSynth();
		this.#initMidi();
    }

    start() {
        this.#updateAll();
        this.#page.update(this.#noteJoiner);
        this.#setupEventHandlers();
        //this.#resetSynth("piano");

    	document.querySelector("#A4FreqId").focus();
        let bounds = this.#noteJoiner.NoteBounds;
        if (document.querySelector("#JumpToFirstId").checked && bounds.firstMicroId > 0)
            this.#page.scrollTo(`#m_${bounds.firstMicroId}id`);

        //let tia = new TIA(this.#synth.AudioContext, []);
    }

	#initSynth() {
    	try {
            this.#synth = new Synth(this.#musicConfig, Options.Polyphony);
			this.#page.log([
				'Audio API initialize: [<span class="ok">OK</span>]', 
				'Audio API requires a mouse click 🖱️ to activate.'
			]);
    	} catch(e) {
			console.log(e.toString());
			this.#page.log([
				'Audio API: [<span class="fail">FAIL</span>]',
				'Audio API failed to initialize. It may be unsupported by this browser.'
			]);
    	}
	}

	#initMidi() {
		if (this.#midiAccess != null)
			this.#midiAccess = null;

    	// FYI: Chrome & Firefox disable Microsoft GS Wavetable
    	navigator.requestMIDIAccess({'software':true}).then(
			(midiAccess) => {
				this.#midiAccess = midiAccess;

				this.#page.MidiInputs = [];
                let inputsAry = [];
            	if (this.#midiAccess.inputs.size > 0) {
                	for (let entry of midiAccess.inputs) {
                    	inputsAry.push(entry[1]);
                    	console.log("Found MIDI input device: " + entry[1].name);
                	}
            	}
                this.#page.MidiInputs = inputsAry;

				this.#page.MidiOutputs = [];
                let outputsAry = [];
            	if (this.#midiAccess.outputs.size > 0) {
                	for (let entry of midiAccess.outputs) {
                    	outputsAry.push(entry[1]);
                    	console.log("Found MIDI output device: " + entry[1].name);
                	}
            	}
                this.#page.MidiOutputs = outputsAry;

                let msgAry = [ 'Midi API initialize: [<span class="ok">OK</span>]'];
                if (inputsAry.length == 0)
                    msgAry.push('Plug in a Midi keyboard 🎹 for the best Midi experience.');

				this.#page.log(msgAry);

                this.#setupMidiHandlers();
			},
			(reason) => {
				this.#page.log([
					'Midi API failed to initialize. It is blocked by your settings or it may be unsupported by this browser.',
					reason
				]);
			}
    	);
	}

    #setupEventHandlers() {
        this.#setupFormHandlers();
	    this.#setupMouseHandlers();

        // showing frequency columns
        document.querySelector('#PrintFrequencyId').addEventListener('change', (evt) => {
            Options.readFromForm();
            Options.saveToStorage();
            this.#page.updateFrequencies();
        }),

        // scroll to first
        document.querySelector('#JumpToFirstId').addEventListener('change', (evt) => {
            let bounds = this.#noteJoiner.NoteBounds;

            if (evt.target.checked && bounds.firstMicroId > 0) {
                let id = '#m_' + bounds.firstMicroId + 'id';
                this.#page.scrollTo(id);
            }
        });

        // on click reset event
        document.querySelector('#ResetId').addEventListener('click', (evt) => {
            Options.clearStorage();
            Options.loadDefaults();
            Options.writeToForm();
            Options.saveToStorage();

            this.#musicConfig.A4Frequency = Options.A4Freq;
            this.#musicConfig.NumTranspose = Options.Transpose;
            this.#musicConfig.NumMicroTones = Options.NumMicroTones;
            this.#musicConfig.TuningSensitivity = Options.TuningSensitivity;

            this.#updateAll();
        	this.#page.update(this.#noteJoiner);
            this.#setupEventHandlers();
            this.#resetSynth("piano");
        });

        // rescan for Midi inputs
        document.querySelector('#RescanId').addEventListener('click', (evt) => {
			this.#initMidi();
        });

        // keyboard volume control
        document.querySelector('body').addEventListener('keydown', (evt) => {
            if (evt.key == '=' || evt.key == '+') {
                this.#synth.volumeUp();
            } else if (evt.key == '-' || evt.key == '_') {
                this.#synth.volumeDown();
            }

            let volume = document.querySelector('#VolumeId');
            volume.value = parseInt(this.#synth.MasterVolume * 127.0);
        });
    }

    // handlers for form input fields
    #setupFormHandlers() {
        // list of elements handled
        let formElements = [
            'VideoFormatId', 'AtariTone0Id', 'AtariTone1Id', 'AtariTone2Id', 'TuningMethodId',
            'A4FreqId', 'A4FreqRangeId',
            'TransposeId', 'TransposeRangeId', 'NumMicroTonesId', 'NumMicroTonesRangeId',
            'TuningSensitivityId', 'TuningSensitivityRangeId', 'TuningGradientId',
            'PrintBlackKeysId', 'PrintGeometryId', 'JumpToFirstId', 'ShrinkPianoId',
            'InstrumentId', 'VolumeId', 'PolyphonyId'
        ];

        // simple processing
        let simpleHandlers = {
            'A4FreqId':                 (e) => { document.querySelector('#A4FreqRangeId').value = Math.max(parseInt(e.target.value), 1) },
            'A4FreqRangeId':            (e) => { document.querySelector('#A4FreqId').value = Math.max(parseInt(e.target.value), 1) },
            'TransposeId':              (e) => { document.querySelector('#TransposeRangeId').value = e.target.value },
            'TransposeRangeId':         (e) => { document.querySelector('#TransposeId').value = e.target.value },
            'NumMicroTonesId':          (e) => { document.querySelector('#NumMicroTonesRangeId').value = Math.max(parseInt(e.target.value), 1) },
            'NumMicroTonesRangeId':     (e) => { document.querySelector('#NumMicroTonesId').value = Math.max(parseInt(e.target.value), 1) },
            'TuningSensitivityId':      (e) => { document.querySelector('#TuningSensitivityRangeId').value = Math.max(parseInt(e.target.value), 0) },
            'TuningSensitivityRangeId': (e) => { document.querySelector('#TuningSensitivityId').value = Math.max(parseInt(e.target.value), 0) },
            'VolumeId':                 (e) => { this.#synth.MasterVolume = parseInt(document.querySelector('#VolumeId').value) / 127.0; },
            'InstrumentId':             (e) => {
                switch(e.target.value) {
                    case 'tia':
                        $('#PianoOptsId').hide();
                        break;
                    case 'piano':
                    default:
                        $('#PianoOptsId').show();
                        break;
                }
            },
        };

        // these trigger data pulls
        let dataUpdaters = {
            'VideoFormatId':            (e) => { this.#updateAtari() },
            'AtariTone0Id':             (e) => { this.#updateAtari() },
            'AtariTone1Id':             (e) => { this.#updateAtari() },
            'AtariTone2Id':             (e) => { this.#updateAtari() },
            'TuningMethodId':           (e) => { this.#updatePiano() },
            'A4FreqId':                 (e) => { this.#updateAll() },
            'A4FreqRangeId':            (e) => { this.#updateAll() },
            'TransposeId':              (e) => { this.#updateAll() },
            'TransposeRangeId':         (e) => { this.#updateAll() },
            'NumMicroTonesId':          (e) => { this.#updateAll() },
            'NumMicroTonesRangeId':     (e) => { this.#updateAll() },
            'TuningSensitivityId':      (e) => { this.#updateAtari() },
            'TuningSensitivityRangeId': (e) => { this.#updateAtari() },
            'TuningGradientId':         (e) => { this.#updateAtari() },
            'ShrinkPianoId':            (e) => { this.#updateAll() },
            'InstrumentId':             (e) => { this.#resetSynth(e.target.value) },
            'PolyphonyId':              (e) => { this.#resetSynth(document.querySelector('#InstrumentId').value) }
        };

        for (let elemId of formElements) {
            document.getElementById(elemId).addEventListener('change',
                (e) => {
                    if (simpleHandlers[elemId] != null)
                        simpleHandlers[elemId](e);

                    // push form options to storage
                    Options.readFromForm();
                    Options.saveToStorage();

                    this.#musicConfig.A4Frequency = Options.A4Freq;
                    this.#musicConfig.NumTranspose = Options.Transpose;
                    this.#musicConfig.NumMicroTones = Options.NumMicroTones;
                    this.#musicConfig.TuningSensitivity = Options.TuningSensitivity;

                    if (dataUpdaters[elemId] != null)
                        dataUpdaters[elemId](e);

        			this.#page.update(this.#noteJoiner);
	                this.#setupMouseHandlers();
                }
            );
        }
    }

	// mouse handlers for piano keys: must be reset on piano rebuild
	#setupMouseHandlers() {
        let noteElem = document.querySelector('#PlayedNoteId');

    	for (let pivot of this.#noteJoiner.PivotNotes) {
            let elems = document.querySelectorAll('.mn_' + pivot.MidiNote + '_' + pivot.MicroNum);

        	let onMousedown = (evt) => {
                if (evt.buttons & 1) {      // if left mouse button down
				    let noteFound = this.#synth.noteOn(pivot.MidiNote, pivot.MicroNum);
                    if (noteFound != null) {
                        for (let elem of elems)
                            elem.classList.add('NoteOn');
                        noteElem.innerHTML = noteFound.Letter + " (" + (Math.round(noteFound.Frequency*100)/100) + " Hz)";
                    } else {
                        for (let elem of elems)
                            elem.classList.add('NoteError');
                    }
                }
			};

        	let onMouseup = (evt) => {
				let noteFound = this.#synth.noteOff(pivot.MidiNote, pivot.MicroNum);
                if (noteFound != null) {
                    for (let elem of elems)
                        elem.classList.remove('NoteOn');
                } else {
                    for (let elem of elems)
                        elem.classList.remove('NoteError');
                }
			};

            for (let elem of elems) {
                // wipe all existing event handlers
                var newElem = elem.cloneNode(true);
                elem.parentNode.replaceChild(newElem, elem);

        	    newElem.addEventListener('mousedown', onMousedown);
        	    newElem.addEventListener('mouseover', onMousedown);
        	    newElem.addEventListener('mouseup', onMouseup);
        	    newElem.addEventListener('mouseout', onMouseup);
            }
    	}
	}

	// key handlers for midi keyboard: must be reset on piano rebuild
	#setupMidiHandlers() {
		if (this.#midiAccess == null)
			return;

        let noteElem = document.querySelector('#PlayedNoteId');

        // listening to all midi keyboard inputs
        let inputs = this.#midiAccess.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = (message) => {
        		this.#midiParser.parse(message);

            	if (this.#midiParser.NoteOn) {
					let noteFound = this.#synth.noteOn(this.#midiParser.NoteKey, 0, this.#midiParser.Velocity/127.0);
                    let elems = document.querySelectorAll('.mn_' + this.#midiParser.NoteKey + '_0');
                    if (noteFound != null) {
                        for (let elem of elems)
                            elem.classList.add('NoteOn');

                        noteElem.innerHTML = noteFound.Letter + " (" + (Math.round(noteFound.Frequency*100)/100) + " Hz)";
                    } else {
                        for (let elem of elems)
                            elem.classList.add('NoteError');
                    }

            	} else if (this.#midiParser.NoteOff) {
					let noteFound = this.#synth.noteOff(this.#midiParser.NoteKey, 0);
                    let elems = document.querySelectorAll('.mn_' + this.#midiParser.NoteKey + '_0');
                    if (noteFound != null) {
                        for (let elem of elems)
                            elem.classList.remove('NoteOn');
                    } else {
                        for (let elem of elems)
                            elem.classList.remove('NoteError');
                    }

            	} else if (this.#midiParser.SustainOn) {
					    this.#synth.sustainOn();

            	} else if (this.#midiParser.SustainOff) {
					    this.#synth.sustainOff();

            	} else if (this.#midiParser.IsControl) {
                    if (this.#midiParser.ControlKey == MidiCC.VOLUME || this.#midiParser.ControlKey == MidiCC.ALESIS_VOLUME) {
                        let volume = document.querySelector('#VolumeId');
                        volume.value = this.#midiParser.Value;
                        this.#synth.MasterVolume = this.#midiParser.Value / 127.0;
                    }
            	}
			}
    	}
	}

    #updatePiano = () => {
        this.#noteJoiner = new NoteJoiner(this.#pianoSource.getNotes());
        for(let src of this.#noteSources)
            this.#noteJoiner.join(src.getNotes());

        let elem = document.querySelector('#InstrumentId');
        let instrumentName = elem.options[elem.selectedIndex].value;
        this.#resetSynth(instrumentName);
    };

    #updateAtari = () => {
        this.#noteSources = [];
        for(let tone of Options.AtariTones) {
            let src = new TIANotes(this.#musicConfig, { Tone: tone, VideoFormat: Options.VideoFormat });
            src.setModeByString(Options.VideoFormat);
            this.#noteSources.push(src);
        }

        this.#noteJoiner = new NoteJoiner(this.#noteJoiner.PivotNotes);
        for(let src of this.#noteSources)
            this.#noteJoiner.join(src.getNotes());

        let elem = document.querySelector('#InstrumentId');
        let instrumentName = elem.options[elem.selectedIndex].value;
        this.#resetSynth(instrumentName);
    }

    #updateAll = () => {
        let instrumentName = document.querySelector('#InstrumentId').value;
        let scaleName = document.querySelector('#FrequencySelectId').value;

        this.#synth.Config = this.#musicConfig;
        this.#synth.switchInstrument(instrumentName, scaleName, { Tone: Options.AtariTones[0], VideoFormat: Options.VideoFormat } );

        /*
        let cfg = new MusicConfig();
        let maker = this.#synth.InstrumentMaker;

        for(let tone of Options.AtariTones) {
        }

        this.#synth.reset(cfg, { VideoFormat: Options.VideoFormat } );
        */

        /*
        this.#noteSources = [];
        for(let tone of Options.AtariTones) {
            let src = new TIANotes(this.#musicConfig, { Tone: tone, VideoFormat: Options.VideoFormat });
            src.setModeByString(Options.VideoFormat);
            this.#noteSources.push(src);
        }

        this.#noteJoiner = new NoteJoiner(this.#pianoSource.getNotes());
        for(let src of this.#noteSources)
            this.#noteJoiner.join(src.getNotes());

        let elem = document.querySelector('#InstrumentId');
        let instrumentName = elem.options[elem.selectedIndex].value;
        this.#resetSynth(instrumentName);
        */
    }

    #resetSynth(instrumentName) {
        //this.#synth.reset(instrumentName);

        /*
        let noteList = null;
        let instruments = [];

        if (0) {
            console.log("resetting synth to " + instrumentName + " polyphony=" + Options.Polyphony);
            //this.#synth.switchInstrument(instrumentName, this.#noteJoiner.PivotNotes, Options.Polyphony);

        } else {
            if (instrumentName != 'piano') {
                noteList = this.#noteJoiner.MatchedNotes;
                let maxPolyphony = Math.min(Options.Polyphony, 2);
                for (let i = 0; i < maxPolyphony; i++) {
		            instruments.push(new TIA(this.#synth.AudioContext, noteList, i));
                }

            } else {
                noteList = this.#noteJoiner.PivotNotes;
                for (let i = 0; i < Options.Polyphony; i++)
		            instruments.push(new Piano(this.#synth.AudioContext, noteList));
            }

            this.#synth.Instruments = instruments;
        }
        */
    }
}
