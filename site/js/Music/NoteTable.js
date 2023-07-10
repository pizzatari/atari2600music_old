import { Music } from "./Music.js"

export class NoteJoiner {
    #analyzer = new Analyzer();
    #tableMap = new Map();
    //#label = "";
    #pivotNotes = null;
    #matchedNotes = [];
    #unmatchedNotes = [];
    #noteLists = [];
    #pivotBounds = { firstMicroId:-1, lastMicroId:0 };
    #noteBounds = { firstMicroId:-1, lastMicroId:0 };

    #noteTable = null;
	#blackKeys = null;

    get PivotNotes() { return this.#pivotNotes }
    get MatchedNotes() { return this.#matchedNotes }
    get PivotBounds() { return this.#pivotBounds }
    get NoteBounds() { return this.#noteBounds }
    get Analyzer() { return this.#analyzer }

    constructor(pivotNotes) {
        //this.#label = label;
        this.#pivotNotes = pivotNotes;

        for (let pivot of pivotNotes) {
            let pair = new NotePair(pivot);
            this.#tableMap.set(pivot.MicroId, pair);

            if (this.#pivotBounds.firstMicroId == -1 || pivot.MicroId < this.#pivotBounds.firstMicroId)
                this.#pivotBounds.firstMicroId = pivot.MicroId;

            if (pivot.MicroId > this.#pivotBounds.lastMicroId )
                this.#pivotBounds.lastMicroId = pivot.MicroId;
        }
    }

    join(noteList) {
        this.#noteLists.push(noteList);

        for (let n of noteList) {
            let note = n.clone(n);
        	let pair = this.#tableMap.get(note.MicroId);
            if (pair !== undefined) {
                pair.add(note);
                this.#matchedNotes.push(note);
        		this.#tableMap.set(note.MicroId, pair);
                this.#analyzer.addPair(pair);
            } else {
                this.#unmatchedNotes.push(note);
            }

            if (this.#noteBounds.firstMicroId == -1 || note.MicroId < this.#noteBounds.firstMicroId)
                this.#noteBounds.firstMicroId = note.MicroId;

            if (note.MicroId > this.#noteBounds.lastMicroId)
                this.#noteBounds.lastMicroId = note.MicroId;
        }
    }

    getNoteTable() {
        if (this.#noteTable == null) {
            let pairs = [];

            for(let [microId, pair] of this.#tableMap)
                pairs.push(pair);

            this.#noteTable = new NoteTable(pairs);
        }

        return this.#noteTable;
    }

    getBlackKeys() {
        if (this.#blackKeys == null)
		    this.#blackKeys = new BlackKeys(this.#tableMap);

        return this.#blackKeys;
    }
}

// pairs pivot note with the best note among a list of similar notes
export class NotePair {
    #pivotNote = null;
    #noteList = [];

    constructor(pivotNote) {
        this.#pivotNote = pivotNote;
    }

    //set NoteList(noteList) { this.#noteList = noteList }

    get PivotNote() { return this.#pivotNote }
    get BestNote() { return this.#noteList.length > 0 ? this.#noteList[0] : null }
    get NoteList() { return this.#noteList }

    add(note) {
        this.#noteList.push(note);
        this.#noteList.sort((a,b) => {
            let centsA = Math.abs(a.Cents);
            let centsB = Math.abs(b.Cents);
            return centsA < centsB ? -1 : (centsA > centsB ? 1 : 0)
        });
    }

    clone(_pair) {
        let pair = new NotePair(_pair.PivotNote.clone(_pair.PivotNote));
        for(let note of _pair.NoteList)
            pair.add(note.clone(note));
        return pair;
    }

    // old
    get pivot() { return this.PivotNote }
    get notes() { return this.#noteList }
}

export class NoteTable extends Array {
    constructor(notePairs = null) {
        super();

        if (Array.isArray(notePairs)) {
            if (notePairs.length > 0) {
                for(let elem of notePairs) {
                    if (typeof(elem) === 'object' && elem.constructor.name === 'NotePair')
                        this.push(elem);
                    else
                        throw("NoteTable: argument must an Array of NotePair type");
                }
            }
        }
    }

    addRow(notePair) {
        if (typeof(notePair) === 'object' && notePair.constructor.name === 'NotePair')
            this.push(notePair);
        else
            throw("NoteTable: argument must be NotePair type");
    }

    getRow(rowIdx) {
        if(rowIdx >= 0 && rowIdx <= this.length)
            return this[rowIdx];

        return null;
    }

    getStandardNotes() {
        return this.filter(pair => pair.PivotNote.MicroNum == 0);
    }
}

export class BlackKeys {
    #pairs = new Map();

	getPreviousPair(microId) {
		return this.#pairs.get(microId);
	}

    constructor(tableMap) {
        let prevPair = null;

        for (let [microId, _pair] of tableMap) {
            if (_pair.pivot.microNum == 0) {
                //let pair = new NotePair(_pair.pivot.clone(_pair.pivot));
                //let pair = _pair;
                let pair = _pair.clone(_pair);

            	if (!pair.pivot.isWhite) {
                	prevPair = pair;

				} else if (prevPair != null) {
                	this.#pairs.set(microId, prevPair); 
					prevPair = null;
				}
			}
        }
    }
}

export class Analyzer {
    #pianoNotes = [];
    #tunedNotes = [];
    #untunedNotes = [];

    #majorChords = [];
    #minorChords = [];
    #diminishedChords = [];
    #augmentedChords = [];

    #majorScales = [];
    #minorScales = [];
    #diminishedScales = [];
    #augmentedScales = [];
    #chromaticScales = [];

    #totalCents = 0.0;
    #totalAbsCents = 0.0;
    #centBounds = { min:100000.0, max:-100000.0 };
    #centAbsBounds = { min:100000.0, max:-100000.0 };

    constructor(tableMap = null) {
        if (tableMap != null) {
            for (let [microId, pair] of tableMap) {
                if (pair.notes.length > 0) {
                    this.addPair(pair);
                }
            }
        }
    }

    addPair(pair) {
        let note = pair.notes[0];
        let absCents = Math.abs(note.cents);

        if (absCents <= Music.TuningSensitivity) {
            this.#tunedNotes.push(pair.pivot);

            this.#totalCents += note.cents;
            this.#centBounds.min = Math.min(this.#centBounds.min, note.cents);
            this.#centBounds.max = Math.max(this.#centBounds.max, note.cents);

            this.#totalAbsCents += absCents;
            this.#centAbsBounds.min = Math.min(this.#centAbsBounds.min, absCents);
            this.#centAbsBounds.max = Math.max(this.#centAbsBounds.max, absCents);
        } else {
            this.#untunedNotes.push(pair.pivot);
        }
    }

    get TunedNotes() { return this.#tunedNotes }
    get UntunedNotes() { return this.#untunedNotes }
    get AvgCents() { return this.#totalCents / this.#tunedNotes.length }
    get AvgAbsCents() { return this.#totalAbsCents / this.#tunedNotes.length }
    get CentBounds() { return this.#centBounds }
    get CentAbsBounds() { return this.#centAbsBounds }

    get Scales() {
    }

    get MajorChords() {
    }

    get MinorChords() {
    }

    get AugmentedChords() {
    }

    get DiminishedChords() {
    }

    get ChordProgressions() {
    }

    get ChromaticScales() {
    }

    get Cadences() {
    }
}
