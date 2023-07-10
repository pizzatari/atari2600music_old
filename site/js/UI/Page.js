import { Options } from "../Options.js"
import { Music } from "../Music/Music.js"
import { NoteJoiner, NoteTable, BlackKeys } from "../Music/NoteTable.js"
import { Chart } from "../UI/Chart.js";

const Colors = {
    white: {
        backgroundOn:"hsl(235deg, 0%, 100%)",
        backgroundOff:"hsl(235deg, 15%, 60%)",
        colorOn:"black",
        colorOff:"black"
    },
    black: {
        backgroundOn:"hsl(235deg, 0%, 0%)",
        backgroundOff:"hsl(235deg, 15%, 60%)",
        colorOn:"white",
        colorOff:"black"
    }
};

export class Page {
    #pivotTypeName = null;
    /*
    #pivotNotes = null;

    constructor(pivotTypeName, pivotNotes) {
        this.#pivotTypeName = pivotTypeName;
        this.#pivotNotes = pivotNotes;
		this.#renderBackground();
    }

	set PivotNotes(pivotNotes) {
        this.#pivotNotes = pivotNotes;
	}
    */

    constructor(pivotTypeName) {
        this.#pivotTypeName = pivotTypeName;
		Page.renderBackground();
    }

    set MidiInputs(mInputAry) {
        let select = document.querySelector('#MidiInputDeviceId');
        select.options.length = 0;
        select.add(new Option("(scanning)", ''));

		// timeout delay is for user feedback
		setTimeout(function(mInputAry, select) {
        	if (mInputAry.length > 0) {
            	select.options.length = 0;
            	for(let input of mInputAry)
                	select.add(new Option(input.name, input.id));
            	select.selectedIndex = select.options.length - 1;
        	} else {
            	select.options.length = 0;
            	select.add(new Option("(none detected)", ''));
			}
		}, 1000, mInputAry, select);
    }

    set MidiOutputs(mOutputAry) {
        let select = document.querySelector('#MidiOutputDeviceId');
        if (mOutputAry.length > 0) {
            select.options.length = 0;
            for(let input of mOutputAry)
                select.add(new Option(input.name, input.id));
            select.selectedIndex = select.options.length - 1;
        } else {
            select.options.length = 0;
            select.add(new Option("(none detected)", ''));
        }
    }

    update(noteJoiner) {
        document.querySelector("#HorizRoll").innerHTML = PianoRoll.getHTML('12-tet', noteJoiner);
        document.querySelector("#VertRoll").innerHTML = PianoTable.getHTML(noteJoiner);
        document.querySelector("#VersionId").innerHTML = this.#getAppVersion();
        this.#updateDistribution(noteJoiner);
		this.#updateTunedNotes(noteJoiner.Analyzer);
	    this.updateFrequencies();
	}

	scrollTo(id) {
        $([document.documentElement, document.body]).animate({
            scrollTop: ($(id).offset().top - 20)
        }, 2000);
	}

	updateFrequencies() {
		if (Options.PrintFrequency) {
			$("#VertRoll table.notes th:nth-child(3)").show();
			$("#VertRoll table.notes td:nth-child(3)").show();

			$("#VertRoll table.notes th:nth-child(5)").show();
			$("#VertRoll table.notes td:nth-child(5)").show();
		} else {
			$("#VertRoll table.notes th:nth-child(3)").hide();
			$("#VertRoll table.notes td:nth-child(3)").hide();

			$("#VertRoll table.notes th:nth-child(5)").hide();
			$("#VertRoll table.notes td:nth-child(5)").hide();
		}
	}

    log(msg) {
        let con = document.querySelector('#ConsoleId');
        if (Array.isArray(msg)) {
            let str = '';
            for (let m of msg)
                str += '<p>' + m + '</p>';
            con.innerHTML += str + '<br/>';
        } else {
            con.innerHTML += '<p>' + msg + '</p><br/>';
        }
    }

    #updateDistribution(noteJoiner) {
		let noteTable = noteJoiner.getNoteTable();
		let pivotNotes = noteTable.getStandardNotes();
		//let notes = noteTable.getUniqueNotes();
		let notes = noteJoiner.MatchedNotes;
		let map = noteTable.TableMap;

        // build array to plot: pitch->cents
        let pivotData = new Array(pivotNotes.length).fill(null);
        let noteData = new Array(32).fill(null);

        for(let i=0; i < noteTable.length; i++) {
            let pair = noteTable.getRow(i);
            if (pair.notes.length == 0)
				continue;

            let note = pair.notes[0];

            if (Math.abs(note.cents) <= Options.TuningSensitivity) {
                pivotData[pair.pivot.keyNum] = note.cents;
                noteData[note.pitch] = note.cents;
            }
        }
        /*
        for(let [microId, pair] of noteJoiner.NoteTable.TableMap) {
            if (pair.notes.length == 0)
				continue;

            let note = pair.notes[0];

            if (Math.abs(note.cents) <= Options.TuningSensitivity) {
                pivotData[pair.pivot.keyNum] = note.cents;
                noteData[note.pitch] = note.cents;
            }
        }
        */

        // chart of cent values
        let chart = new Chart('DistributionId');
        chart.ReverseX = true;
        chart.draw(noteData);

        // chart of absolute cent values
        noteData = noteData.map(x => x == null ? null : Math.abs(x));
        let chart2 = new Chart('Distribution2Id');
        chart2.ReverseX = true;
        chart2.Absolute = true;
        chart2.ShowHorizLabels = false;
        chart2.draw(noteData);

        // chart of cent values by piano key
        let chart3 = new Chart('Distribution3Id');
        chart3.ZeroLabel = false;
        chart3.addLabelAt(156,48,"C4  ");
        chart3.draw(pivotData);

        // chart of absolute cent values
        pivotData = pivotData.map(x => x == null ? null : Math.abs(x));
        let chart4 = new Chart('Distribution4Id');
        chart4.Absolute = true;
        chart4.ShowHorizLabels = false;
        chart4.draw(pivotData);
    }

	#updateTunedNotes(analyzer) {
        let html = '';
        let octave = NaN;
        let octaveHtml = '';
        for (let n of analyzer.TunedNotes) {
			let letter = Music.ToEntities(n.letter);
            if(isNaN(octave)) {
                octaveHtml += '<span>' + letter + '<small>' + n.octave + '</small>';
                octave = n.octave;
            } else if(octave != n.octave) {
                html += octaveHtml + '</span><br>';
                octaveHtml = '<span>' + letter + '<small>' + n.octave + '</small>';
                octave = n.octave;
            } else {
                octaveHtml += ", " + letter + '<small>' + n.octave + '</small>';
            }
        }
        if (!isNaN(octave) && octaveHtml != '')
            html += octaveHtml + '</span><br>';

		let elem = document.querySelector('#TunedNotesListId');
		elem.innerHTML = html;

		elem = document.querySelector('#TotalTunedId');
		elem.innerHTML = analyzer.TunedNotes.length;

		elem = document.querySelector('#AvgCentsId');
		elem.innerHTML = Music.round(analyzer.AvgCents, Options.CentPrecision);

		elem = document.querySelector('#AvgAbsCentsId');
		elem.innerHTML = Music.round(analyzer.AvgAbsCents, Options.CentPrecision);

		elem = document.querySelector('#MaxRangeId');
		elem.innerHTML = '['
			+ Music.round(analyzer.CentBounds.min, Options.CentPrecision) + ' &rarr; '
			+ Music.round(analyzer.CentBounds.max, Options.CentPrecision) + '] &Delta;'
			+ Music.round(analyzer.CentBounds.max - analyzer.CentBounds.min, Options.CentPrecision);
	}

	static renderBackground() {
        let cssText = '';

        for (let x = 0; x < 5; x += 0.4) {
            let xPos = Math.round(Math.sin(x) * 100 + 300);
            let yPos = Math.round(x * 300 + 300);
            let stop1 = Math.round(x * 100 + 500);
            let stop2 = Math.round(stop1 + 10);
            cssText += `radial-gradient(circle at top ${yPos}px left ${xPos}px, rgba(128,128,255,0.05) ${stop1}px, rgba(0,0,128,0.05) ${stop2}px),`;
        }

        let css = `.bg-color { background-image: ${cssText} linear-gradient(#00f, #f00); }`;
        let props = { type:"text/css", media:"screen" };
        $("<style>").prop(props).html(css).appendTo("head");
        $("body").addClass("bg-color");
	}

    #getAppVersion() {
        return window.location.pathname.replace(/\/([0-9.]+).*/, "$1");
    }

	#updateTableCss() {
        if (Options.PrintBlackKeys) {
            $("#VertRoll notes.table div.bk").show();
        } else {
            $("#VertRoll notes.table div.bk").hide();
        }

        if (Options.PrintFrequency) {
            $("#VertRoll notes.table th:nth-child(3)").show();
            $("#VertRoll notes.table th:nth-child(5)").show();
            $("#VertRoll notes.table td:nth-child(3)").show();
            $("#VertRoll notes.table td:nth-child(5)").show();
        } else {
            $("#VertRoll notes.table th:nth-child(3)").hide();
            $("#VertRoll notes.table th:nth-child(5)").hide();
            $("#VertRoll notes.table td:nth-child(3)").hide();
            $("#VertRoll notes.table td:nth-child(5)").hide();
        }
    }

    /* 
    #updateStyles(noteJoiner) {
		let map = noteJoiner.NoteTable.TableMap;

        for (let [microId, pair] of map) {
			let elems = document.querySelectorAll('table.notes .m_' + microId);
			elems.forEach((e) => {
            	if (pair.notes.length > 0) {
					let color = KeyColor.getColor(pair);
					e.style.backgroundColor = color.backgroundColor;
					e.style.color = color.color;
				}
			}, this);
		}
    } */
}

class PianoRoll {
    static getHTML(legendName, noteJoiner) {
        let topHtml = `<fieldset><legend>${legendName}</legend><table class="notes" draggable="false"><tbody>`;
        let botHtml = '</tbody></table></fieldset>';
		let cols = '';
		let noteTable = noteJoiner.getNoteTable();

        for (let pair of noteTable) {
            if (pair.PivotNote.MicroNum == 0 && pair.PivotNote.IsWhite) {
                let blackPair = noteJoiner.getBlackKeys().getPreviousPair(pair.PivotNote.MicroId);
                if (blackPair != null)
                    cols += '<td>' + this.#getBlackKeyHTML(blackPair) + this.#getWhiteKeyHTML(pair) + '</td>';
                else
                    cols += '<td>' + this.#getWhiteKeyHTML(pair) + '</td>';
            }
		}
        return topHtml + '<tr>' + cols + '</tr>' + botHtml;
    }

    static #getBlackKeyHTML(pair) {
        let pianoNote = pair.PivotNote;
		if (pianoNote.MicroNum == 0 && pianoNote.IsBlack) {
			let color = KeyColor.getColor(pair);
            let htmlClass = 'bk m_' + pianoNote.MicroId + ' mn_' + pianoNote.MidiNote + '_' + pianoNote.MicroNum;
			let htmlStyle = 'color:' + color.color + '; background-color:' + color.backgroundColor;
			let sharp = Music.ToEntities(Music.NumToScaleLetter(pianoNote.KeyNum, true));
			let flat = Music.ToEntities(Music.NumToScaleLetter(pianoNote.KeyNum, false));
            return '<div class="' + htmlClass + '" style="' + htmlStyle + '">' + sharp + '<br/>' + flat + '</div>';
        }
        return '';
    }

    static #getWhiteKeyHTML(pair) {
        let pianoNote = pair.PivotNote;
		if (pianoNote.MicroNum == 0 && pianoNote.IsWhite) {
			let color = KeyColor.getColor(pair);
            let htmlClass = 'wh m_' + pianoNote.MicroId + ' mn_' + pianoNote.midiNote + '_' + pianoNote.MicroNum;
			let htmlStyle = 'color:' + color.color + '; background-color:' + color.backgroundColor;
			let letter = Music.ToEntities(Music.NumToScaleLetter(pianoNote.KeyNum, true));
            return '<div class="' + htmlClass + '" style="' + htmlStyle + '"><span>' + letter + '</span></div>';
		}
        return '';
    }
}

class PianoTable {
    static getHTML(noteJoiner) {
        let label = Options.TuningMethod;
        let topHtml = `<fieldset><legend>${label.toUpperCase()}</legend>
			<table class="notes" draggable="false"><tbody>
        	<tr><th title="Piano notes relative to the A4 key frequency.">Piano</th>
            	<th></th>
            	<th title="Piano Frequency">Freq</th>
            	<th title="Atari pitch (AUDC)">Atari</th>
            	<th title="Atari Frequency">Freq</th>
            	<th title="Tuning difference between the piano reference note and the Atari note.">Cents</th>
            	<th title="Numeric key position on the piano">Key#</th>
            	<th title="Numeric position if the piano had micro tones.">Micro#</th>
            </tr>`;
		let botHtml = '</table></fieldset>';
        let rows = '';

		let pivotBounds = noteJoiner.PivotBounds;
		let noteBounds = noteJoiner.NoteBounds;
		let isFirstNote = true;

        let noteTable = noteJoiner.getNoteTable();
        for (let pair of noteTable) {
            let pianoNote = pair.PivotNote;

			if(Options.ShrinkPiano && (pianoNote.MicroId < noteBounds.firstMicroId || pianoNote.MicroId > noteBounds.lastMicroId))
				continue;
            
            let blackPair = noteJoiner.getBlackKeys().getPreviousPair(pianoNote.MicroId);
            let blackKey = blackPair != null ? this.#getBlackKeyHTML(blackPair, isFirstNote) : '';
            let whiteKey = this.#getWhiteKeyHTML(pair);
            rows += this.#getRowHTML(pair, whiteKey, blackKey);
			isFirstNote = false;
        }

		return topHtml + rows + botHtml;
	}

    static #getRowHTML(pair, whiteKey, blackKey) {
        let pianoNote = pair.PivotNote;

        if (pianoNote.IsWhite || Options.PrintBlackKeys) {
            let whiteMicro = this.#getMicroLabel(pianoNote);
            let midiClass = pianoNote.MicroNum == 0 ? ' mn_' + pianoNote.MidiNote + '_' + pianoNote.MicroNum : '';
            //let htmlClass = 'm_' + pianoNote.MicroId + midiClass;
            let htmlClass = pianoNote.IsWhite ? 'wh' : 'br';
            let htmlStyle = '';

            let cell = { keyString:'', titleFrequency:'', frequencyString:'', titleCents:'', cents:'' };
            let note = pair.BestNote;
            if (note != null) {
                cell.keyString = '<div>' + note.Tone + '/' + note.Pitch + '</div>';
                cell.titleFrequency = note.Frequency + ' Hz';
                cell.frequencyString = '<div>' + Music.round(note.Frequency, Options.FreqPrecision) + ' Hz</div>';
    		    cell.titleCents = note.Cents;
                cell.cents = '<div>' + Music.round(note.Cents, Options.CentPrecision) + '</div>';

			    let color = KeyColor.getColor(pair);
			    htmlStyle = 'background-color:' + color.backgroundColor + ';color:' + color.color;
            }

		    return `<tr class="${htmlClass}" style="${htmlStyle}">
    	    <td>${blackKey}${whiteKey}</td>
    	    <td></td>
    	    <td title="${pianoNote.frequency} Hz"><div>${Music.round(pianoNote.frequency, Options.FreqPrecision)} Hz</div></td>
            <td>${cell.keyString}</td>
            <td title="${cell.titleFrequency}">${cell.frequencyString}</td>
            <td title="${cell.titleCents}">${cell.cents}</td>
		    <td><div>${pianoNote.keyNum}</div></td>
		    <td><div>${pianoNote.microId}</div></td>
		    </tr>`;
        }

        return '';
    }

    static #getBlackKeyHTML(pair, isFirstNote) {
        let pianoNote = pair.PivotNote;
		if (pianoNote.IsBlack) {
			let color = KeyColor.getColor(pair);
            let htmlId = 'm_' + pianoNote.MicroId + 'id';
            let htmlClass = 'bk m_' + pianoNote.MicroId + (pianoNote.MicroNum == 0 ? ' mn_' + pianoNote.MidiNote + '_' + pianoNote.MicroNum : '');
			let htmlStyle = 'color:' + color.color + '; background-color:' + color.backgroundColor;
			let sharp = Music.ToEntities(Music.NumToScaleLetter(pianoNote.KeyNum, true));
			let flat = Music.ToEntities(Music.NumToScaleLetter(pianoNote.KeyNum, false));
            let letter = sharp + '/' + flat + '<small>' + this.#getMicroLabel(pianoNote) + '</small>';

            /*
            if (Options.PrintBlackKeys)
                htmlClass = 'br ' + htmlClass;
            else
                htmlClass = 'bk ' + htmlClass;
                */

			if (!isFirstNote && !Options.PrintBlackKeys)
    	    	return '<div id="' + htmlId + '" class="' + htmlClass + '" style="' + htmlStyle + '">' + letter +'</div>';
        }

        return '';
    }

    static #getWhiteKeyHTML(pair) {
        let pianoNote = pair.PivotNote;
		let color = KeyColor.getColor(pair);
        let htmlId = 'm_' + pianoNote.MicroId + 'id';
        let htmlClass = 'm_' + pianoNote.MicroId + ' mn_' + pianoNote.MidiNote + '_' + pianoNote.MicroNum;
		let htmlStyle = 'color:' + color.color + '; background-color:' + color.backgroundColor;
        let letter = Music.ToEntities(pianoNote.Letter) + '<small>' + this.#getMicroLabel(pianoNote) + '</small>';

        if (pianoNote.IsWhite)
            htmlClass = 'wh ' + htmlClass;
        else
            htmlClass = 'br ' + htmlClass;

        return '<div id="' + htmlId + '" class="' + htmlClass + '" style="' + htmlStyle + '">' + letter + '</div>';
    }

    /*
    static getHTML(noteJoiner) {
        let label = Options.TuningMethod;
        let topHtml =
			`<fieldset><legend>${label.toUpperCase()}</legend>
			<table class="notes"><tbody>
        	<tr><th title="Piano notes relative to the A4 key frequency.">Piano</th>
            	<th></th>
            	<th title="Piano Frequency">Freq</th>
            	<th title="Atari pitch (AUDC)">Atari</th>
            	<th title="Atari Frequency">Freq</th>
            	<th title="Tuning difference between the piano reference note and the Atari note.">Cents</th>
            	<th title="Numeric key position on the piano">Key#</th>
            	<th title="Numeric position if the piano had micro tones.">Micro#</th>
            </tr>`;
		let botHtml = '</table></fieldset>';
		let html = '';

		let tableIdx = 0;
		let pivotBounds = noteJoiner.PivotBounds;
		let noteBounds = noteJoiner.NoteBounds;
		let isFirstNote = true;

        let noteTable = noteJoiner.getNoteTable();
        for (let pair of noteTable) {
			if(Options.ShrinkPiano && (pair.PivotNote.MicroId < noteBounds.firstMicroId || pair.PivotNote.MicroId > noteBounds.lastMicroId))
				continue;

            html += this.#buildTableRow(pair, isFirstNote, noteJoiner);
			isFirstNote = false;
        }

		return topHtml + html + botHtml;
	}

    static #buildTableRow(pair, isFirstNote, noteJoiner) {
        let pivot = pair.PivotNote;
        let whiteClass = `wh m_${pivot.microId}`;
        let midiClass = (pivot.microNum == 0) ? (' mn_' + pivot.midiNote) : '';
        let prevBlackElem = '';
		let style = '';
		let blackStyle = '';

        whiteClass += midiClass;

        let note = { keyString:'', titleFrequency:'', frequencyString:'', titleCents:'', cents:'' };
        if (pair.notes.length > 0) {
            let n = pair.notes[0];
            note.keyString = `${n.tone}/${n.pitch}`
            note.titleFrequency = `${n.frequency} Hz`;
            note.frequencyString = `${Music.round(n.frequency, Options.FreqPrecision)} Hz`;
    		note.titleCents = n.cents;
            note.cents = Music.round(n.cents, Options.CentPrecision);

			let color = KeyColor.getColor(pair);
			style = 'background-color:' + color.backgroundColor + ';color:' + color.color;
        }

        let blackPair = noteJoiner.getBlackKeys().getPreviousPair(pivot.microId);
		if (blackPair != null) {
            let blackMicro = this.#getMicroLabel(blackPair.pivot);
            let blackMidiClass = (blackPair.pivot.microNum == 0) ? ('mn_' + blackPair.pivot.midiNote) : '';

			let color = KeyColor.getColor(blackPair);
			blackStyle = 'background-color:' + color.backgroundColor + ';color:' + color.color;

			if (!isFirstNote && !Options.PrintBlackKeys)
    	    	prevBlackElem = `<div id="m_${blackPair.pivot.microId}id" class="bk m_${blackPair.pivot.microId} ${blackMidiClass}" style="${blackStyle}">${Music.ToEntities(blackPair.pivot.letter, true)}<small>${blackMicro}</small></div>`;
        }

        if (pivot.isWhite || Options.PrintBlackKeys) {
            let whiteMicro = this.#getMicroLabel(pivot);

            if (!pivot.isWhite)
                whiteClass = `br m_${pivot.microId} ${midiClass}`;

            let keyCell = note.keyString === '' ? '' : `<div>${note.keyString}</div>`;
            let freqCell = note.titleFrequency === '' ? '' : `<div>${note.frequencyString}</div>`;
            let centCell = note.cents === '' ? '' : `<div>${note.cents}</div>`;0

		    return `<tr class="${whiteClass}" style="${style}">
    	    <td>${prevBlackElem}<div id="m_${pivot.microId}id" class="${whiteClass}" style="${style}">${Music.ToEntities(pivot.letter)}<small>${whiteMicro}</small></div></td>
    	    <td></td>
    	    <td title="${pivot.frequency} Hz"><div>${Music.round(pivot.frequency, Options.FreqPrecision)} Hz</div></td>
            <td>${keyCell}</td>
            <td title="${note.titleFrequency}">${freqCell}</td>
            <td title="${note.titleCents}">${centCell}</td>
		    <td><div>${pivot.keyNum}</div></td>
		    <td><div>${pivot.microId}</div></td>
		    </tr>`;
        }

        return '';
    } */

	static #getMicroLabel(note) {
		if(Music.NumMicroTones > 1)
            return note.octave + ' [' + note.microNum + ']';

		return note.octave;
	}
}

class KeyColor {
    static getColor(pair) {
        let bgOnColor  = pair.pivot.isWhite ? Colors.white.backgroundOn : Colors.black.backgroundOn;
        let bgOffColor = pair.pivot.isWhite ? Colors.white.backgroundOff: Colors.black.backgroundOff;
        let txtOnColor  = pair.pivot.isWhite ? Colors.white.colorOn : Colors.black.colorOn;
        let txtOffColor = pair.pivot.isWhite ? Colors.white.colorOff: Colors.black.colorOff;
		let on = { backgroundColor:bgOnColor, color:txtOnColor };
		let off = { backgroundColor:bgOffColor, color:txtOffColor };

        if (pair.notes.length == 0)
            return off;

        let cents = Math.abs(pair.notes[0].cents);
        if (Options.TuningGradient && cents <= Options.TuningSensitivity) {
			let bg = '';
			let val = 0;
			let divisor = Options.TuningSensitivity > 0 ? Options.TuningSensitivity : 1;

			divisor = divisor <= 50 ? divisor : 50;

			// linear relative to tuning sensitivity
            val = 100 - Math.round(cents / divisor * 30.0);
			// linear
            //val = 100 - Math.round(cents/50.0*30);
			// sqrt curve
            //val = 100 - Math.round(Math.sqrt(cents/50) * 30);

			bg = 'hsl(220deg, 30%, ' + val + '%)';

			return { backgroundColor:bg, color:"black" };
        }

        if (cents <= Options.TuningSensitivity) {
            return on;
		}

        return off;
	}
}
