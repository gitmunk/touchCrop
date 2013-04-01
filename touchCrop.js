/*!
 * touchCrop jQuery plugin version 0.2
 *
 * Copyright 2013 Creative Cells AD and other contributors
 * Released under the MIT license
 *
 * Date: 2013-4-01
 */

(function ($) {

	var Crop = function (el, url) {
	
		if(!el)
			return console.error('No element is defined.');
		
		if(!url)
			return console.error('No image URL is provided.');
	
		if((this instanceof Crop) === false)
			return new Crop(user);
			
		if(!el.is('canvas'))
			return console.error('The selected element should be type canvas.');
		
		var self = this
			, image = new Image();
				
		self.image = image;
		self.el = el;
		
		var containerWidth = parseInt(self.el.css('width'))
			, containerHeight = parseInt(self.el.css('height'));
			
		self.image.onload = function () {
			self.url = url;
			self.init();
		}
	
		self.image.onerror = function () {
			console.error("Couldn't load image: %s.", url);
		}
	
		self.image.src = url;
		self.url = '';
		
		return this;
	}
	
	Crop.prototype.getCropped = function () {
		var self = this
			, el = self.el
			, canvas = el[0];
		
		return canvas.toDataURL("image/jpeg").replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
	}
	
	Crop.prototype.init = function () {
		
		var self = this
			, el = self.el
			, canvas = el[0]
			, ctx = canvas.getContext('2d')
			, image = self.image
			, doc = $(document)
			, containerWidth = parseInt(el.css('width'))
			, containerHeight = parseInt(el.css('height'))
			, imageWidth = image.width
			, imageHeight = image.height
			, diffWidth = imageWidth - containerWidth
			, diffHeight = imageHeight - containerHeight
			, scaleFactor = 1.05
			, zoomFactor = 1
			, deltaX = (containerWidth-imageWidth)/2
			, deltaY = (containerHeight-imageHeight)/2
		
		CTX = ctx;
		IMG = image;

		canvas.width = containerWidth;
		canvas.height = containerHeight;

		var zoom = function (amount) {
			var factor = Math.pow(scaleFactor,amount);
			zoomFactor *= factor;
			ctx.scale(factor,factor);
			redraw();
		}
		
		var redraw = function () {
			
			ctx.save();
			ctx.setTransform(1,0,0,1,0,0);
			ctx.clearRect(0,0,canvas.width,canvas.height);
			ctx.restore();
			
			ctx.drawImage(image, deltaX, deltaY);
		}
		
		el.on('mousewheel', function (e) {
			var evt = e.originalEvent;
			
			var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
			if (delta) 
				zoom(delta);
			
			return e.preventDefault() && false;
		});

		
		el.on('touchstart mousedown', function (e) {
			e.preventDefault();
			
			var twoDown = false;
			
			var orgX = deltaX;
			var orgY = deltaY;
			var startX = e.pageX || e.originalEvent.touches[0].pageX;
			var startY = e.pageY || e.originalEvent.touches[0].pageY;
			
			if(e.type == 'touchstart' && e.originalEvent.targetTouches.length >= 2) {
				twoDown = true;
				var touches1 = e.originalEvent.targetTouches[0],
					touches2 = e.originalEvent.targetTouches[1],
					dist = Math.sqrt(
						(touches1.clientX-touches2.clientX) * (touches1.clientX-touches2.clientX) +
						(touches1.clientY-touches2.clientY) * (touches1.clientY-touches2.clientY));
			}
			
			var movePicture = function (e) {
				e.preventDefault();

				deltaX = orgX - (startX - (e.pageX || e.originalEvent.touches[0].pageX));
				deltaY = orgY - (startY - (e.pageY || e.originalEvent.touches[0].pageY));
				/*
				if(deltaX > 0)
					deltaX = 0;
					
				if(deltaY > 0)
					deltaY = 0;
				
				if(deltaX*zoomFactor < -diffWidth)
					deltaX = -diffWidth*zoomFactor;
					
				if(deltaY*zoomFactor < -diffHeight)
					deltaY = -diffHeight*zoomFactor;
				*/
				redraw();
			}
			
			var pinchPanZoom = function (e, start) {
				var xCoord1 = e.originalEvent.targetTouches[0].clientX
				var yCoord1 = e.originalEvent.targetTouches[0].clientY
				var xCoord2 = e.originalEvent.targetTouches[1].clientX
				var yCoord2 = e.originalEvent.targetTouches[1].clientY

				var xCoord = (xCoord1+xCoord2)/2;
				var yCoord = (yCoord1+yCoord2)/2;
				
				var now = xCoord / yCoord;
				
				var touches1 = e.originalEvent.touches[0],
					touches2 = e.originalEvent.touches[1],
					dist = Math.sqrt(
						(touches1.clientX-touches2.clientX) * (touches1.clientX-touches2.clientX) +
						(touches1.clientY-touches2.clientY) * (touches1.clientY-touches2.clientY));

				if(dist>start)
					zoom(dist/start)
				else
					zoom(-start/dist);
			}
			
			function onMouseMove (evt) {
				if(!twoDown)
					movePicture(evt);
				else {
					pinchPanZoom(evt, dist);
				}
			}

			var mouseUp = function () {
				
				if(twoDown) { 
					twoDown = false;
					return;
				}
				
				doc.off('touchmove mousemove', onMouseMove);
				doc.off('touchend mouseup', mouseUp);
			}
			
			doc.on('touchend mouseup', mouseUp);			
			doc.on('touchmove mousemove', onMouseMove);
		});
	
		redraw();
	}

	$.fn.touchCrop = function ( config, fn ) {
	
		return this.each(function () {
		
			var url = config.url;
		
			var $this = $(this);
			
			this.crop = new Crop($this, config.url);
			
			if(fn)
				fn(this.crop);
		
		});
	
	}
	
	$(document).ready(function () {
		var crops = $('[data-type=touchCrop]');

		crops.each(function (crop) {
			var $crop = $(this);
			
			if(this.crop)
				return;
						
			$crop.touchCrop({url:$crop.attr('data-url')});
		});
	});
	
})(jQuery);
