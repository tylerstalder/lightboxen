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

  this.container = document.getElementById('main');
  this.model = null;
  this.events = {};
  this.nodes = {};
};

LightboxView.prototype.forward = function(e) {
  if (e) e.stopPropagation();

  var photo = this.model.next();
  this.image.el.src = photo.url;
  this.nodes.caption.innerHTML = '<span class="caption-text">' + this.formatCaption(photo.caption, photo.link) + '</span>';
};

LightboxView.prototype.backward = function(e) {
  if (e) e.stopPropagation();

  var photo = this.model.previous();
  this.image.el.src = photo.url;
  this.nodes.caption.innerHTML = '<span class="caption-text">' + this.formatCaption(photo.caption, photo.link) + '</span>';
};

LightboxView.prototype._keyboardHandler = function(e) {
    var LEFT_ARROW = 37;
    var RIGHT_ARROW = 39;
    var ESCAPE = 27;

    if (e.keyCode === RIGHT_ARROW) {
      e.preventDefault();
      this.forward();
    }

    if (e.keyCode === LEFT_ARROW) {
      e.preventDefault();
      this.backward();
    }

    if (e.keyCode === ESCAPE) {
      this.dismiss();
    }
};

LightboxView.prototype.formatCaption = function(input, link) {
  if (!input) return '';
  if (input && input.length > 140) {
    return input.substr(0, 140).split(' ').slice(0, -1).join(' ') + " <a href='" + link  + "' target='_blank'>...</a>";
  } else {
    return input;
  }
};

LightboxView.prototype.moveTo = function(image, coords, scale) {

  var translateX = coords.x - image.initialX;
  var translateY = coords.y - image.initialY;

  image.el.parentNode.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ', ' + scale + ') translateZ(0)';
  image.el.parentNode.style['-webkit-transform'] = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ', ' + scale + ') translateZ(0)';
};

LightboxView.prototype.show = function(element, photo, model) {

  this.model = model;

  var nodes = this.nodes;

  var overlay = document.createElement('div');
  overlay.classList.add('overlay');

  var captionContainer = document.createElement('div');
  captionContainer.classList.add('caption');
  var caption = document.createElement('div');
  var navigation = document.createElement('span');
  navigation.classList.add('nav');

  caption.innerHTML = '<span class="caption-text">' + this.formatCaption(photo.caption, photo.link) + '</span>';

  nodes.caption = caption;

  nodes.forward = document.createElement('a')
  nodes.forward.textContent = ">";

  nodes.backward = document.createElement('a');
  nodes.backward.textContent = "<";

  navigation.appendChild(nodes.backward);
  navigation.appendChild(nodes.forward);

  captionContainer.appendChild(caption);
  captionContainer.appendChild(navigation);

  this.image = new Image({
    el: element
  });

  this.overlayEl = document.body.insertBefore(overlay, this.container);
  this.captionEl = document.body.insertBefore(captionContainer, this.container);

  this.bindEvents(nodes);

  var maxHeight = this.maxHeight;
  var fromHeight = this.fromHeight;
  var margin = this.margin;

  var toHeight = document.documentElement.clientHeight - (margin * 2);
  this.toHeight = toHeight;

  var scaleRatio = (toHeight >= maxHeight) ? (maxHeight / fromHeight) : (toHeight / fromHeight);

  this.scale = scaleRatio;

  this.image.initialX = this.image.el.offsetLeft - (this.fromHeight / 2) * (this.scale - 1);
  this.image.initialY = this.image.el.offsetTop - (this.fromHeight / 2) * (this.scale - 1);

  var centerX = (document.documentElement.clientWidth / 2) - (this.maxHeight / 2) + this.margin;
  var centerY = document.documentElement.clientHeight > (this.maxHeight + (2 * this.margin)) ? window.pageYOffset + (document.documentElement.clientHeight / 2) - (this.maxHeight / 2) : window.pageYOffset + this.margin;

  this.centerPosition = { x: centerX, y: centerY };
  this.image.el.classList.add('focus');
  this.moveTo(this.image, this.centerPosition, this.scale);
  this.image.initialY = centerY;

  this.captionEl.style.top = centerY + 'px';
  this.captionEl.style.left = centerX + 'px';

  this.overlayEl.classList.add('active');
  this.captionEl.classList.add('active');
};

LightboxView.prototype.bindEvents = function(nodes) {
  this.events.dismiss = this.dismiss.bind(this);
  this.events.keypressHandler = this._keyboardHandler.bind(this);
  this.events.forward = this.forward.bind(this);
  this.events.backward = this.backward.bind(this);

  this.captionEl.addEventListener('click', this.events.dismiss, false);
  this.overlayEl.addEventListener('click', this.events.dismiss, false);

  document.addEventListener('scroll', this.events.dismiss, false);
  document.addEventListener('keydown', this.events.keypressHandler, false);

  nodes.forward.addEventListener('click', this.events.forward, false);
  nodes.backward.addEventListener('click', this.events.backward, false);
};

LightboxView.prototype.unbindEvents = function(nodes) {
  this.container.removeEventListener('click', this.events.dismiss, false);
  this.overlayEl.removeEventListener('click', this.events.dismiss, false);

  document.removeEventListener('scroll', this.events.dismiss, false);
  document.removeEventListener('keydown', this.events.keypressHandler, false);

  nodes.forward.removeEventListener('click', this.events.forward, false);
  nodes.backward.removeEventListener('click', this.events.backward, false);
};

LightboxView.prototype.dismiss = function(e) {

  this.unbindEvents(this.nodes);

  this.image.el.parentNode.style.transform = '';
  this.image.el.parentNode.style['-webkit-transform'] = '';
  this.image.el.classList.remove('focus');

  var _this = this;

  this.overlayEl.addEventListener('transitionend', function(e) {
    document.body.removeChild(_this.overlayEl);
    document.body.removeChild(_this.captionEl);
  }, true);

  this.overlayEl.classList.remove('active');
  this.captionEl.classList.remove('active');
};
