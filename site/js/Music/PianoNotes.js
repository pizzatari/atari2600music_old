import { MusicConfig, PianoNote } from "./Music.js"
import { MusicScale } from "./MusicScale.js"

const ScaleDownLetters  = [ 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab' ];
const ScaleUpLetters    = [ 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#' ];

// white = (N % 12) in (1, 3, 4, 6, 8, 9, 11)
// black = (N % 12) in (0, 2, 5, 7, 10)
const WhiteKeys    = { 0:false, 1:true,  2:false, 3:true,  4:true,  5:false,
                       6:true,  7:false, 8:true,  9:true, 10:false, 11:true };

/*
const Sharp             = '♯';
const Flat              = '♭';
const Natural           = '♮';
const Accidentals       = { '#':Sharp, 'b':Flat, 'n':Natural };

const FlatLetters       = { "A": "Ab", "B": "Bb", "D": "Db", "E": "Eb", "G": "Gb" };
const SharpLetters      = { "A": "A#", "C": "C#", "D": "D#", "F": "F#", "G": "G#" };
const NoteLetters       = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G' ];

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
*/

export class PianoNotes extends MusicScale {
    #firstOctave = 0;
    #firstNum = 1;
    #lastNum = 88;

    get TypeName() { return "Piano 12-TET" }
    get A4Frequency() { return this.Config.A4Frequency }
    get NumTranspose() { return this.Config.NumTranspose }
    get NumMicroTones() { return this.Config.NumMicroTones }

    get FirstNum() { return this.#firstNum }
    set FirstNum(num) { this.#firstNum = (num >= 0 ? num : 0) }

    get LastNum() { return this.#lastNum }
    set LastNum(num) { this.#lastNum = (num >= 0 ? num : 0) }

    static get Empty() {
		return {
			microId:'', keyNum:'', microNum:'', octave:'', isWhite:'', letter:'', frequency:''
		}
	}

    constructor(musicConfig = null) {
        super(musicConfig);
    }

    getNotes() {
        let ary = [];
        let mid = this.NumMicroTones > 0 ? (this.NumMicroTones-1)/2 : 0;
        let start = 0-Math.floor(mid);
        let end = Math.ceil(mid);

        for(let keyNum = this.#firstNum; keyNum <= this.#lastNum; keyNum++) {
            for(let microNum = start; microNum <= end; ++microNum) {
                let note = new PianoNote(keyNum, microNum);
                ary.push(note);
            }
        }

        return ary;
    }
}
