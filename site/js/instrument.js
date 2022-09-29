export class Piano {
    ctx = null;
    maxPolyphony = 2;
    numPlaying = 0;
    currNotes = null;

    constructor() {
        this.currNotes = new Map();

		try {
			this.ctx = new AudioContext();
		} catch(e) {
        	alert('Cannot create AudioContext(). Please use a modern browser.\n\n' + e.toString());
    	}
	}

    playFrequency(freqHz, durationMs) {
        if (this.numPlaying >= this.maxPolyphony)
            return;

        // extend note if already playing
        if (this.currNotes.has(freqHz)) {
            let o = this.currNotes.get(freqHz);

            clearTimeout(o.timeoutId);

		    o.timeoutId = setTimeout((me, f, osc) => {
                osc.stop();
                me.currNotes.delete(f);
                me.numPlaying--;
            }, durationMs, this, freqHz, o.oscillator);

            this.currNotes.set(freqHz, o);
            return;
        }

        if (durationMs == undefined)
            durationMs = 500;

		let osc = this.ctx.createOscillator();
		osc.type = "square";
		osc.frequency.setValueAtTime(freqHz, this.ctx.currentTime);
		osc.connect(this.ctx.destination);
      	osc.start();

        this.numPlaying++;
		let id = setTimeout((me, f) => {
            osc.stop();
            me.currNotes.delete(f);
            me.numPlaying--;
        }, durationMs, this, freqHz);

        this.currNotes.set(freqHz, { timeoutId: id, oscillator: osc });
    }

    suspend() {
        this.ctx.suspend();
    }

    resume() {
        this.ctx.resume();
    }
}
