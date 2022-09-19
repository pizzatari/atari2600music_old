//const SharpChar = "&#x266f;";
//const FlatChar  = "&#x266d;";
//const SharpChar = '#';
//const FlatChar  = 'b';
const SharpChar = '♯';
const FlatChar  = '♭';

export class Carousel {
	labels = Array(12).fill("Item");
    canvas = null;
    ctx = null;
    scale = 1.0;
    slot = [];
    lineWidth = 5.0;
	radialMargin = 0.40;
	nodeRadius = 35;

    constructor (canvas, labels, font) {
        this.canvas = canvas;
		this.labels = labels;

        this.ctx = canvas.getContext("2d");
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
        if (font != null && font != '')
            this.ctx.font = font;
        else
            this.ctx.font = '14pt serif';

        let item;
        let numSlots = 12;
        let tau = Math.PI * 2;
        let radsPerItem = tau / 12;

        for (let i = 0; i < numSlots; i++) {
            item = {};
            item.radius = Math.round(canvas.width * this.radialMargin);
            // (tau/4) to orient 3rd node to 12 o'clock position
            item.angleRads = radsPerItem * i - (tau / 4);
			item.angleDegs = (item.angleRads) * (180 / Math.PI);
            item.x = Math.cos(item.angleRads) * item.radius;
            item.y = Math.sin(item.angleRads) * item.radius;
            item.duration = 10000;
            item.rotSpeed = tau / item.duration;            // velocity rad/sec
            item.start = Date.now();
            this.slot.push(item);
        }

        this.draw();
    }

	set setLabels(ary) { this.labels = ary; }

    update() {
	    for(var i = 0; i < this.slot.length; i++){
             let delta = Date.now() - this.slot[i].start;
             this.slot.start = Date.now();
             let angleRads = (this.slot[i].angleRads + (this.slot[i].rotSpeed * delta));
             this.slot[i].x = this.slot[i].radius * Math.cos(angleRads);
             this.slot[i].y = this.slot[i].radius * Math.sin(angleRads);
	    }
    }

    draw() {
		let tau = Math.PI * 2;
        let that = this;
        let callback = function() {
            //that.update();        // animate carousel
            that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);
            that.ctx.save();

            that.ctx.translate(that.canvas.width/2, that.canvas.height/2);
            that.ctx.scale(that.scale, that.scale);

            // draw large circle
            that.ctx.beginPath();
		    that.ctx.arc(0, 0, that.slot[0].radius, 0, Math.PI*2);
		    that.ctx.lineWidth = that.lineWidth;
		    that.ctx.strokeStyle = "black";
		    that.ctx.stroke();
            that.ctx.fillStyle = "white";
		    that.ctx.fill();
            that.ctx.closePath();

            for(var i = 0; i < that.slot.length; i++){
				// (360/12*5) to orient yellow to the 12 o'clock position
                let hue = parseInt((360/12*5 + that.slot[i].angleDegs) % 360);
                let color = `hsl(${hue},100%,70%)`;

                // draw nodes at clock positions
                that.ctx.beginPath();
		        that.ctx.arc(that.slot[i].x, that.slot[i].y, that.nodeRadius, 0, Math.PI*2);
		        that.ctx.lineWidth = that.lineWidth;
		        that.ctx.strokeStyle = "black";
		        that.ctx.stroke();
                that.ctx.fillStyle = color;
		        that.ctx.fill();
                that.ctx.closePath();

                // draw labels over nodes
                that.ctx.beginPath();
                that.ctx.fillStyle = 'black';
				that.ctx.fillText(that.labels[i], that.slot[i].x, that.slot[i].y)
                that.ctx.closePath();
            }

            that.ctx.restore();
            //requestAnimationFrame(callback);
        }
        requestAnimationFrame(callback);
        //callback();
    }
}
