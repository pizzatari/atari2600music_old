export class Instrument {
	#audioCtx = null;
    #instance = 0;
    #noteList = null;
    #midiMap = new Map();

    constructor(audioCtx, noteList, instance=0) {
		this.#audioCtx = audioCtx;
        this.#instance = instance >= 0 ? instance : 0;
		this.NoteList = noteList;
    }

    get AudioContext() { return this.#audioCtx }
    get Instance() { return this.#instance }

    get NoteList() { return this.#noteList }
    set NoteList(list) {
        this.#noteList = list;
        this.#midiMap.clear();
        for(let note of list) {
            let key = this.#key(note.midiNote, note.microNum);
            this.#midiMap.set(key, note);
        }
    }

    clone(instance = 0) { return null }

    noteOn(midiNote, microNum = 0, velocity = 1.0) { }

    noteOff(midiNote, microNum = 0, velocity = 1.0) { }

    sustainOn() { }

    sustainOff() { }

    getNote(midiNote, microNum) {
        let key = this.#key(midiNote, microNum);
        return this.#midiMap.get(key);
    }

    #key(midiNote, microNum) {
        return midiNote + '_' + microNum;
    }
}
