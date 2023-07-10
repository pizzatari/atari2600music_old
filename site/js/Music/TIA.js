import { Instrument } from "./Instrument.js"

const TIA_AUDC0 = 0x15;
const TIA_AUDC1 = 0x16;

const TIA_AUDF0 = 0x17;
const TIA_AUDF1 = 0x18;

const TIA_AUDV0 = 0x19;
const TIA_AUDV1 = 0x1A;

const TIA_AUDC = [ TIA_AUDC0, TIA_AUDC1 ];
const TIA_AUDF = [ TIA_AUDF0, TIA_AUDF1 ];
const TIA_AUDV = [ TIA_AUDV0, TIA_AUDV1 ];

export class TIA extends Instrument {
    constructor(audioCtx, noteList, instance) {
        if (instance > 1) {
            console.log("TIA instance exceeds physical polyphony");
            instance = 0;
        }
		super(audioCtx, noteList, instance);
    }

    clone(instance = 0) {
        return new TIA(this.AudioContext, this.NoteList, instance);
    }

    noteOn(midiNote, microNum = 0, velocity = 1.0) {
        let note = this.getNote(midiNote, microNum);

        if (note != null)  {
            Javatari.room.console.tia.write(TIA_AUDC[this.Instance], note.Tone);
            Javatari.room.console.tia.write(TIA_AUDF[this.Instance], note.Pitch);
            Javatari.room.console.tia.write(TIA_AUDV[this.Instance], Math.round(velocity * 15));
        } else {
            console.log("No defined TIA note: " + midiNote + ' ' + microNum);
        }

        return note;
    }

    noteOff(midiNote, microNum = 0, velocity = 1.0) {
        let note = this.getNote(midiNote, microNum);

        if (note != null)  {
            Javatari.room.console.tia.write(TIA_AUDV[this.Instance], 0);
        } else {
            console.log("No defined TIA note: " + midiNote + ' ' + microNum);
        }

        return note;
    }

    sustainOn() { }

    sustainOff() { }
}
