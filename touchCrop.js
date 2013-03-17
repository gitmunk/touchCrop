/*!
 * touchCrop jQuery plugin version 0.1
 *
 * Copyright 2013 Creative Cells AD and other contributors
 * Released under the MIT license
 *
 * Date: 2013-3-17
 */

(function ($) {

	var Crop = function (el, url) {
	
		if(!el)
			return console.error('No element is defined.');
		
		if(!url)
			return console.error('No image URL is provided.');
	
		if((this instanceof Crop) === false)
			return new Crop(user);
		
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
			, image = self.image
			, containerWidth = parseInt(el.css('width'))
			, containerHeight = parseInt(el.css('height'))
			, startX = -parseInt(el.css('background-position-x'))
			, startY = -parseInt(el.css('background-position-y'))
			, canvas = document.createElement('canvas')
			, ctx = canvas.getContext('2d');
			
		canvas.width = containerWidth;
		canvas.height = containerHeight;
		ctx.drawImage(image, startX, startY, containerWidth, containerHeight, 0, 0, containerWidth, containerHeight);
		
		return canvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "");
	}
	
	Crop.prototype.init = function () {
		
		var self = this
			, el = self.el
			, doc = $(document)
			, containerWidth = parseInt(el.css('width'))
			, containerHeight = parseInt(el.css('height'))
			, imageWidth = self.image.width
			, imageHeight = self.image.height
			, diffWidth = imageWidth - containerWidth
			, diffHeight = imageHeight - containerHeight
	
		self.el.css({
		
			'background-repeat': 'no-repeat',
			'background-image': 'url("' + self.url + '")',
			'background-position-x':-imageWidth/2+containerWidth/2,
			'background-position-y':-imageHeight/2+containerHeight/2
		});
		
		self.el.on('touchstart mousedown', function (e) {
		
			var startX = e.pageX || e.originalEvent.touches[0].pageX;
			var startY = e.pageY || e.originalEvent.touches[0].pageY;

			var mouseMove = function (e) {
				e.preventDefault()
				var pageX = e.pageX || e.originalEvent.touches[0].pageX;
				var pageY = e.pageY || e.originalEvent.touches[0].pageY;
				var oldX = parseInt(el.css('background-position-x'));
				var oldY = parseInt(el.css('background-position-y'));
				
				var newX = (oldX-(startX-pageX));
				var newY = (oldY-(startY-pageY));
				
				startX = pageX;
				startY = pageY;
				
				if(newX > 0)
					newX = 0;
					
				if(newY > 0)
					newY = 0;
				
				if(newX < -diffWidth)
					newX = -diffWidth;
					
				if(newY < -diffHeight)
					newY = -diffHeight;
				
				self.el.css('background-position', newX + 'px ' + newY + 'px');
			};
			
			var mouseUp = function () {
				doc.off('touchmove mousemove', mouseMove);
				doc.off('touchend mouseup', mouseUp);
			};
			
			doc.on('touchend mouseup', mouseUp);
			doc.on('touchmove mousemove', mouseMove);
		});
	
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
				return console.log('aaa');
						
			$crop.touchCrop({url:$crop.attr('data-url')});
		});
	});
	
})(jQuery);