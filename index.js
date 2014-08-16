var WAVEFORM = function(options) {

	// unique ID
	this.id = Math.floor((Math.random() * 10000) + 1);

	this.canvas = document.createElement('canvas')

	this.container = options.container
	this.height = options.height || 100
	this.width = options.width || 300
	this.waveform = options.waveform
	this.reflection = options.reflection || null

	this.colors = {}

	this.gutter = options.gutter || 1
	this.barWidth = options.barWidth || 3

	// active = highlighted secion of track
	this.active = 80

	//
	this.selected = 20

	// mouse dragging
	this.isDragging = false

	// 0 = out of focus // 1 = onfocus and playing // 2 = onfocus and paused
	this.state = 0

}

WAVEFORM.prototype.init = function() {

	console.log('init')

	// set ID
	this.canvas.setAttribute('data-w', this.id)
	
	// set canvas height and width
	this.canvas.width = this.width
	this.canvas.height = this.height

	// get canvas context
	this.ctx = this.canvas.getContext('2d')

	// append canvas
	this.container.appendChild(this.canvas)

	//default colors
	this.color('bar', ['#666666', 0, '#868686', 1])
	this.color('bar-active', ['#FF3300', 0, '#FF5100', 1])
	this.color('bar-selected', ['#993016', 0, '#973C15', 1])
	this.color('gutter', ['#6B6B6B', 0, '#c9c9c9', 1])
	this.color('gutter-active', ['#FF3704', 0, '#FF8F63', 1])
	this.color('gutter-selected', ['#9A371E', 0, '#CE9E8A', 1])

	//bind event handlers
	this.bindEventHandlers()

	//parse waveform
	this.genWaves()

	//render
	this.draw()

}

WAVEFORM.prototype.destroy = function() {
	//todo
}

WAVEFORM.prototype.bindEventHandlers = function() {

	this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
	this.canvas.addEventListener('mousemove', this.onMouseOver.bind(this))
	this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this))
}

WAVEFORM.prototype.onMouseOut = function(e) {
	this.selected = 0	
	this.draw()
}

WAVEFORM.prototype.onMouseOver = function(e) {

	var x = e.x - this.canvas.offsetLeft
	var y = e.y - this.canvas.offsetTop

	// it's a bit off
	var barClicked = Math.round( x / (this.barWidth + this.gutter) )

	this.selected = barClicked

	this.draw()

}

WAVEFORM.prototype.onMouseDown = function(e) {

	var x = e.x - this.canvas.offsetLeft
	var y = e.y - this.canvas.offsetTop

	// it's a bit off
	var barClicked = Math.round( x / (this.barWidth + this.gutter) )

	this.active = barClicked

	this.draw()
}

WAVEFORM.prototype.update = function(options) {

	console.log('update')

	if(options) {

		if(options.gutter) {
			this.gutter = options.gutter
			this.genWaves()
		}

		if(options.barWidth) {
			this.barWidth = options.barWidth
			this.genWaves()
		}

		if(options.gradient) console.log('awdwd')

		if(options.width) {
			this.width = options.width
			this.canvas.width = this.width
			this.genWaves()
		}

		if(options.height) {
			this.height = options.height
			this.canvas.height = this.height
			this.genWaves()
		}

		if(options.reflection === false || options.reflection === true) {
			this.reflection = options.reflection
		}

	}

	//render
	this.draw()
}

// 'experimental'
WAVEFORM.prototype.color = function(name, colors) {

	var gradient = this.ctx.createLinearGradient(0,100,0,0)

	for(var i=0; i<colors.length; i+=2) {
		gradient.addColorStop(colors[i+1], colors[i])
	}

	this.colors[name] = gradient
}

WAVEFORM.prototype.draw = function() {

	console.log('draw')

	var my = this

	var xPos = 0
	var yPos = 100

	// clear canvas for redraw
	my.ctx.clearRect ( 0 , 0 , my.width , my.height );
	
	// itterate waves
	for(var i=0; i<my.waves.length; i+=1) {

		// main bar
		my.ctx.fillStyle = my.colors['bar']
		if(this.active > i) my.ctx.fillStyle = my.colors['bar-active']

		if(this.selected !== 0 && (this.selected < i && i < this.active) || (this.selected > i && i > this.active)) {
			my.ctx.fillStyle = my.colors['bar-selected']
		}

		my.ctx.fillRect(xPos, yPos, my.barWidth, my.waves[i])

		// gutter
		my.ctx.fillStyle = my.colors['gutter']
		if(this.active > i) my.ctx.fillStyle = my.colors['gutter-active']

		if(this.selected !== 0 && (this.selected < i && i < this.active) || (this.selected > i && i > this.active)) {
			my.ctx.fillStyle = my.colors['gutter-selected']
		}

		var smallerBar = Math.max(my.waves[i],my.waves[i+1])
		my.ctx.fillRect(xPos + my.barWidth, yPos, my.gutter, smallerBar)

		// bar reflection
		if(my.reflection === true) {
			my.ctx.fillStyle = '#999999'
			my.ctx.fillRect(xPos, yPos, my.barWidth, Math.abs(my.waves[i])*0.4)
		}

		xPos += my.barWidth + my.gutter
	}

}

// need more accurate algo
WAVEFORM.prototype.genWaves = function() {

	console.log('genWaves')

	var result, waves, wave, i

	var lines = (this.width / (this.gutter + this.barWidth) )

	result = Math.round(this.waveform.length / lines)

	waves = []
	wave = 0

	for(i=0; i<this.waveform.length; i+=1) {

		wave += this.waveform[i]

		if(i%result === 0 && i !== 0) {

			wave = (wave/result)

			wave = Math.floor(-Math.abs(wave*100))

			waves.push(wave)
			wave = 0

		}

	}
	return this.waves = waves
}

var example = require('./example')(WAVEFORM)