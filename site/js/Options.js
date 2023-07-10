export class Options {
    static #fields = {
        TuningMethod:null,
        A4Freq:null,
        TuningSensitivity:null,
        TuningGradient:null,
        Transpose:null,
        NumMicroTones:null,
        AtariTones: new Array(),
        VideoFormat:null,
        PrintBlackKeys:null,
        PrintGeometry:null,
        PrintFrequency:null,
        ExpandPiano:null,
        ShrinkPiano:null,
        JumpToFirst:null,
        InnerJoin:null,
        EnableSound:null,
        Volume:null,
        Polyphony:null,

        //

        FreqPrecision:null,
        CentPrecision:null,

        FirstPianoKey:null,
        LastPianoKey:null,
        FirstPianoOctave:null
    };

    static loadDefaults() {
        this.#fields.VideoFormat = 'ntsc';
        this.#fields.TuningMethod = '12-tet';
        this.#fields.A4Freq = 440.0
        this.#fields.TuningSensitivity = 50;
        this.#fields.TuningGradient = true;
        this.#fields.Transpose = 0;
        this.#fields.NumMicroTones = 1;
        this.#fields.AtariTones = [ 1 ];
        this.#fields.PrintBlackKeys = false;
        this.#fields.PrintGeometry = true;
        this.#fields.PrintFrequency = true;
        this.#fields.ShrinkPiano = false;
        this.#fields.ExpandPiano = false;
        this.#fields.JumpToFirst = false;
        this.#fields.InnerJoin = false;
        this.#fields.EnableSound = false;
        this.#fields.Volume = 64;
        this.#fields.Polyphony = 2;

        this.#fields.FreqPrecision = 1;
        this.#fields.CentPrecision = 1;

        this.#fields.FirstPianoKey = 1;
        this.#fields.LastPianoKey = 88;
        this.#fields.FirstPianoOctave = 0;
    }

    static {
        this.loadDefaults();
    }

    // special form values
    static get AtariTones() { return [...this.#fields.AtariTones] }
    static set AtariTones(ary) { this.#fields.AtariTones = (Array.isArray(ary) ? ary : this.#fields.AtariTones) } 

    static getAtariTone(idx) { return this.#fields.AtariTones[idx] }
    static setAtariTone(idx, val) { this.#fields.AtariTones[idx] = parseInt(val) }

    // form values
    static get VideoFormat() { return this.#fields.VideoFormat }
    static get TuningMethod() { return this.#fields.TuningMethod }
    static get A4Freq() { return this.#fields.A4Freq }
    static get Transpose() { return this.#fields.Transpose }
    static get NumMicroTones() { return this.#fields.NumMicroTones }
    static get TuningSensitivity() { return this.#fields.TuningSensitivity }
    static get TuningGradient() { return this.#fields.TuningGradient }
    static get PrintBlackKeys() { return this.#fields.PrintBlackKeys }
    static get PrintGeometry() { return this.#fields.PrintGeometry }
    static get PrintFrequency() { return this.#fields.PrintFrequency }
    static get ShrinkPiano() { return this.#fields.ShrinkPiano }
    static get JumpToFirst() { return this.#fields.JumpToFirst }
    static get EnableSound() { return this.#fields.EnableSound }
    static get Volume() { return this.#fields.Volume }
    static get Polyphony() { return this.#fields.Polyphony }

    static set VideoFormat(val) { this.#fields.VideoFormat = val }
    static set A4Freq(val) { this.#fields.A4Freq = val }
    static set TuningMethod(val) { this.#fields.TuningMethod = val }
    static set Transpose(val) { this.#fields.Transpose = val }
    static set NumMicroTones(val) { this.#fields.NumMicroTones = val }
    static set TuningSensitivity(val) { this.#fields.TuningSensitivity = val }
    static set TuningGradient(val) { this.#fields.TuningGradient = val }
    static set PrintBlackKeys(val) { this.#fields.PrintBlackKeys = val }
    static set PrintGeometry(val) { this.#fields.PrintGeometry = val }
    static set PrintFrequency(val) { this.#fields.PrintFrequency = val }
    static set ShrinkPiano(val) { this.#fields.ShrinkPiano = val }
    static set JumpToFirst(val) { this.#fields.JumpToFirst = val }
    static set EnableSound(val) { this.#fields.EnableSound = val }
    static set Volume(val) { this.#fields.Volume = val }
    static set Polyphony(val) { this.#fields.Polyphony = val }

    // non form values
    static get FreqPrecision() { return this.#fields.FreqPrecision }
    static get CentPrecision() { return this.#fields.CentPrecision }
    static get FirstPianoKey() { return this.#fields.FirstPianoKey }
    static get LastPianoKey() { return this.#fields.LastPianoKey }
    static get FirstPianoOctave() { return this.#fields.FirstPianoOctave }

    static set FreqPrecision(val) { this.#fields.FreqPrecision = val }
    static set CentPrecision(val) { this.#fields.CentPrecision = val }
    static set FirstPianoKey(val) { this.#fields.FirstPianoKey = val }
    static set LastPianoKey(val) { this.#fields.LastPianoKey = val }
    static set FirstPianoOctave(val) { this.#fields.FirstPianoOctave = val }

    static get Options() { return this.#fields }

    // unimplemented
    //static get ExpandPiano() { return this.#fields.ExpandPiano }
    //static get InnerJoin() { return this.#fields.InnerJoin }

    //static set ExpandPiano(val) { this.#fields.ExpandPiano = val }
    //static set InnerJoin(val) { this.#fields.InnerJoin = val }

    static readFromForm() {
        this.#fields.AtariTones.length = 0;
        this.#fields.AtariTones.push(parseInt(document.getElementById('AtariTone0Id').value));

        let e = document.getElementById('AtariTone1Id').value;
        if (e != '')
            this.#fields.AtariTones.push(parseInt(e));

        e = document.getElementById('AtariTone2Id').value;
        if (e != '')
            this.#fields.AtariTones.push(parseInt(e));

        this.#fields.VideoFormat = document.getElementById('VideoFormatId').value;
        this.#fields.TuningMethod = document.getElementById('TuningMethodId').value;
        this.#fields.A4Freq = parseFloat(document.getElementById('A4FreqId').value);
        this.#fields.TuningSensitivity = parseInt(document.getElementById('TuningSensitivityId').value);
        this.#fields.TuningGradient = document.getElementById('TuningGradientId').checked ? true : false;
        this.#fields.Transpose = parseInt(document.getElementById('TransposeId').value);
        this.#fields.NumMicroTones = parseInt(document.getElementById('NumMicroTonesId').value);
        this.#fields.PrintBlackKeys = document.getElementById('PrintBlackKeysId').checked ? true : false;
        this.#fields.PrintGeometry = document.getElementById('PrintGeometryId').checked ? true : false;
        this.#fields.PrintFrequency = document.getElementById('PrintFrequencyId').checked ? true : false;
        //this.#fields.ExpandPiano = document.getElementById('ExpandPianoId').checked ? true : false;
        this.#fields.ShrinkPiano = document.getElementById('ShrinkPianoId').checked ? true : false;
        this.#fields.JumpToFirst = document.getElementById('JumpToFirstId').checked ? true : false;
        //this.#fields.InnerJoin = document.getElementById('InnerJoinId').checked ? true : false;
        //this.#fields.EnableSound = document.getElementById('EnableSoundId').checked ? true : false;
        this.#fields.Volume = parseInt(document.getElementById('VolumeId').value);
        this.#fields.Polyphony = parseInt(document.getElementById('PolyphonyId').value);
    }

    static writeToForm() {
        document.getElementById('AtariTone0Id').value = this.#fields.AtariTones[0];
        document.getElementById('AtariTone1Id').value = this.#fields.AtariTones[1];
        document.getElementById('AtariTone2Id').value = this.#fields.AtariTones[2];

        document.getElementById('VideoFormatId').value = this.#fields.VideoFormat;
        document.getElementById('TuningMethodId').value = this.#fields.TuningMethod;
        document.getElementById('A4FreqId').value = this.#fields.A4Freq;
        document.getElementById('A4FreqRangeId').value = parseInt(this.#fields.A4Freq);
        document.getElementById('TuningSensitivityId').value = this.#fields.TuningSensitivity;
        document.getElementById('TuningSensitivityRangeId').value = this.#fields.TuningSensitivity;
        document.getElementById('TuningGradientId').checked = this.#fields.TuningGradient;
        document.getElementById('TransposeId').value = this.#fields.Transpose;
        document.getElementById('TransposeRangeId').value = this.#fields.Transpose;
        document.getElementById('NumMicroTonesId').value = this.#fields.NumMicroTones;
        document.getElementById('NumMicroTonesRangeId').value = this.#fields.NumMicroTones;
        document.getElementById('PrintBlackKeysId').checked = this.#fields.PrintBlackKeys;
        document.getElementById('PrintGeometryId').checked = this.#fields.PrintGeometry;
        document.getElementById('PrintFrequencyId').checked = this.#fields.PrintFrequency;
        //document.getElementById('ExpandPianoId').checked = this.#fields.ExpandPiano;
        document.getElementById('ShrinkPianoId').checked = this.#fields.ShrinkPiano;
        document.getElementById('JumpToFirstId').checked = this.#fields.JumpToFirst;
        //document.getElementById('EnableSoundId').checked = this.#fields.EnableSound;
        document.getElementById('VolumeId').value = this.#fields.Volume;
        document.getElementById('PolyphonyId').value = this.#fields.Polyphony;
    }

    static saveToStorage() {
		let opts = {};
		for (let n in this.#fields) {
			opts[n] = this.#fields[n];
		}

        window.localStorage.setItem("Options", JSON.stringify(opts));
    }

    static loadFromStorage() {
        let str = window.localStorage.getItem("Options");
		if (str == null) return;

        let opts = JSON.parse(str);
		if (opts == null) return;

		for (let n in opts) {
			this.#fields[n] = opts[n];
		}
    }

    static clearStorage() {
        window.localStorage.removeItem("Options");
    }
}
