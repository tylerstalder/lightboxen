// show event
// dismiss event
// rewind partial transitions

var Image = function(options) {
  this.el = options.el;

  this.x = 0;
  this.y = 0;

  this.initialX = 0;
  this.initialY = 0;
};

var LightboxView = function(options) {
  var options = options || {};
  this.maxHeight = options.maxHeight || 640;
  this.fromHeight = options.fromHeight || 400;
  this.margin = options.margin || 40;

  this.isActive = false;
  this.activeSet = [];
  this.activeIndex = 0;
  this.events = {};
};

LightboxView.prototype.advance = function() {
  this.activeIndex = this.activeIndex + 1;

  var leftOffset = ((this.fromHeight * this.scale) / 4);

  var previous = -(document.documentElement.clientWidth / 2) + ((this.fromHeight * this.scale) / 2) - leftOffset;
  var centerY = document.documentElement.clientHeight > (this.maxHeight + (2 * this.margin)) ? window.pageYOffset + (document.documentElement.clientHeight / 2) - (this.maxHeight / 2) : window.pageYOffset + this.margin;

  console.log('check', centerY, this.image.initialY);

  this.leftPosition = { x: previous, y: this.image.initialY };
  this.moveTo(this.image, this.leftPosition, this.scale);

  this.image.el.classList.add('blur');
  this.image.el.classList.remove('focus');

  this.next.el.classList.remove('blur');
  this.next.el.classList.add('focus');

  this.moveTo(this.next, this.centerPosition, this.scale);

  this.image = this.next;
};

LightboxView.prototype.mount = function() {
  this.isActive = true;

  this.container = document.getElementById('main');
};

LightboxView.prototype.bindEvents = function() {
  this.events.dismiss = this.dismiss.bind(this);
  this.container.addEventListener('click', this.events.dismiss, false);
};

LightboxView.prototype.moveTo = function(image, coords, scale) {

  var translateX = coords.x - image.initialX;
  var translateY = coords.y - image.initialY;

  console.log(coords.x, image.initialX);
  console.log(translateX, translateY, scale);

  image.el.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ', ' + scale + ') translateZ(0)';
};

LightboxView.prototype.show = function(targetImage, photoSet) {

  if (!this.isActive) this.mount();

  this.collection = photoSet;

  var overlay = document.createElement('div');
  overlay.classList.add('overlay');

  this.image = new Image({
    el: targetImage
  });

  this.overlayEl = this.image.el.parentNode.parentNode.insertBefore(overlay, this.image.el.parentNode);

  this.bindEvents();

  var maxHeight = this.maxHeight;
  var fromHeight = this.fromHeight;
  var margin = this.margin;

  var toHeight = document.documentElement.clientHeight - (margin * 2);
  this.toHeight = toHeight;

  var scaleRatio = (toHeight >= maxHeight) ? (maxHeight / fromHeight) : (toHeight / fromHeight);

  this.scale = scaleRatio;

  var model = this.collection.get(this.activeIndex+1);

  var el = document.createElement('img');
  el.classList.add('blur');
  el.src = model.url;

  var nextImage = this.overlayEl.appendChild(el);

  this.next = new Image({
    el: nextImage
  });

  var _this = this;

  this.next.el.addEventListener('click', function(e) {

    _this.advance();
    e.stopPropagation();

  }, false);

  this.image.initialX = this.image.el.offsetLeft - (this.fromHeight / 2) * (this.scale - 1);
  this.image.initialY = this.image.el.offsetTop - (this.fromHeight / 2) * (this.scale - 1);

  var centerX = (document.documentElement.clientWidth / 2) - (this.maxHeight / 2);
  var centerY = document.documentElement.clientHeight > (this.maxHeight + (2 * this.margin)) ? window.pageYOffset + (document.documentElement.clientHeight / 2) - (this.maxHeight / 2) : window.pageYOffset + this.margin;

  this.centerPosition = { x: centerX, y: centerY };
  this.moveTo(this.image, this.centerPosition, scaleRatio);
  this.image.initialY = centerY;

  this.overlayEl.classList.add('active');

  var next = document.documentElement.clientWidth + 260;

  this.next.initialX = (document.documentElement.clientWidth / 2) - ((this.fromHeight * this.scale) / 2);
  this.next.initialY = this.next.el.offsetTop - (this.fromHeight / 2) * (this.scale - 1);

  var rightPosition = { x: next, y: centerY };

  this.moveTo(this.next, rightPosition, scaleRatio);
};

LightboxView.prototype.onMount = function() {

};

LightboxView.prototype.onUnmount = function() {

};

LightboxView.prototype.dismiss = function(e) {

  this.isActive = false;
  this.container.removeEventListener('click', this.events.dismiss, false);

  this.image.el.style.transform = '';
  this.image.el.classList.remove('focus');

  var _this = this;
  this.overlayEl.addEventListener('transitionend', function(e) {
    console.log('transition done');
    _this.container.removeChild(_this.overlayEl);
  }, true);

  this.overlayEl.classList.remove('active');
};
