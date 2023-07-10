export class Chart {
    #canvas = null;
    #ctx = null;

    #absolute = false;

    #showHorizLabels = true;
    #reverseX = false;
    #textColor = 'black';
    #fillColor = 'white';
    #missingColor = '#e44';
    #labelHeight = 15;
    #labelMark = 1;
    #zeroLabel = true;
    #label = null;

    set Absolute(val) { this.#absolute = val };
    get Absolute() { return this.#absolute };

    set ShowHorizLabels(val) { this.#showHorizLabels = val };
    get ShowHorizLabels() { return this.#showHorizLabels };

    set ReverseX(val) { this.#reverseX = val }
    get ReverseX() { return this.#reverseX }

    set TextColor(val) { this.#textColor = val };
    get TextColor() { return this.#textColor };

    set FillColor(val) { this.#fillColor = val };
    get FillColor() { return this.#fillColor };

    set ZeroLabel(val) { this.#zeroLabel = val };
    get ZeroLabel() { return this.#zeroLabel };



    addLabelAt(x,y,txt) {
        this.#label = {'x':x, 'y':y, 'txt':txt, 'width':0, 'height':0}; //, 'metrics':null };
        let metrics = this.#ctx.measureText(txt);
        this.#label.width = metrics.width;
        this.#label.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    }

	constructor(canvasId) {
        this.#canvas = document.getElementById(canvasId);
        if (this.#canvas == null)
            throw "document.getElementById(" + canvasId + ") failed";

        this.#ctx = this.#canvas.getContext("2d");
        if (this.#canvas == null)
            throw "canvas.getContext(2d) failed";

        this.clear();
	}

    clear() {
        this.#ctx.lineWidth = "1px";
        this.#ctx.fillStyle = this.#fillColor;
        this.#ctx.strokeStyle = this.#textColor;
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    draw(dataAry) {
        if (dataAry.length == 0) return;

        let colorScale = 128 / dataAry.length;
        let maxVal = Math.max.apply(null, dataAry);
        let minVal = Math.min.apply(null, dataAry);

        maxVal = Math.max(maxVal, Math.abs(minVal));

        let labelMark = Math.floor(dataAry.length/16);  // label period
        let colWidth = Math.round(this.#canvas.width / dataAry.length);
        let chartHeight = this.#canvas.height - this.#labelHeight;
        let yScale = chartHeight/maxVal;
        let y = Math.round(chartHeight);
        let x = 0;

        if (!this.#absolute) {
            y = Math.round(y/2);
            yScale /= 2;
        }

        this.#ctx.strokeStyle = '#bbb';
        this.#ctx.strokeRect(0, 0, this.#canvas.width-0.5, chartHeight+1);
        this.#ctx.beginPath();

        if (!this.#reverseX) {
            for (let idx = 0; idx < dataAry.length; idx++) {
                if(dataAry[idx] !== null) {
            	    let color = 128 - (idx * colorScale);
                    let height = Math.round(dataAry[idx] * yScale);
                    height = (height == 0) ? 1 : height;
                    this.#ctx.fillStyle = `rgb(${color},${color},${color})`;
                    this.#ctx.fillRect(x, y, colWidth, -height) ;
                } else {
                    this.#ctx.fillStyle = this.#missingColor;
                    this.#ctx.fillRect(x, y+2.5, colWidth, -5.5) ;
                }

                this.#ctx.moveTo(x+0.5, 0);
                this.#ctx.lineTo(x+0.5, chartHeight);

                if (this.#showHorizLabels && idx % labelMark == 0) {
                    let i = this.#zeroLabel ? idx : idx + 1;
                    this.#ctx.fillStyle = this.#textColor;
                    this.#ctx.fillText(i.toString(), x, this.#canvas.height-2);
                }

                x += colWidth;
            }
        } else {
            for (let idx = dataAry.length-1; idx >= 0; idx--) {
                if(dataAry[idx] !== null) {
            	    let color = 128 - (idx * colorScale);
                    let height = Math.round(dataAry[idx] * yScale);
                    height = (height == 0) ? 1 : height;
                    this.#ctx.fillStyle = `rgb(${color},${color},${color})`;
                    this.#ctx.fillRect(x, y, colWidth, -height) ;
                } else {
                    this.#ctx.fillStyle = this.#missingColor;
                    this.#ctx.fillRect(x, y+2.5, colWidth, -5.5) ;
                }

                this.#ctx.moveTo(x+0.5, 0);
                this.#ctx.lineTo(x+0.5, chartHeight);

                if (this.#showHorizLabels && idx % labelMark == 0) {
                    let i = this.#zeroLabel ? idx : idx + 1;
                    this.#ctx.fillStyle = this.#textColor;
                    this.#ctx.fillText(i.toString(), x, this.#canvas.height-2);
                }

                x += colWidth;
            }
        }

        this.#ctx.moveTo(this.#canvas.width-0.5, 0);
        this.#ctx.lineTo(this.#canvas.width-0.5, chartHeight);
        this.#ctx.fill();
        this.#ctx.stroke();

        if (this.#label != null) {
            let label = this.#label;
            this.#ctx.fillStyle = "#fff";
            this.#ctx.fillRect(label.x-2, label.y-label.height-2, label.width+4, label.height+4);
            this.#ctx.fillStyle = this.#textColor;
            this.#ctx.fillText(label.txt, label.x, label.y);
        }
    }
}
