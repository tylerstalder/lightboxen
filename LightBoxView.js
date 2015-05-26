var LightboxView = function(options) {
  var options = options || {};
  this.maxHeight = options.maxHeight || 640;
  this.fromHeight = options.fromHeight || 400;
  this.margin = options.margin || 40;

  this.container = document.getElementById('main');
  this.model = null;
  this.el = null;
  this.isActive = false;
  this._events = {};
  this._nodes = {};
};

LightboxView.prototype.show = function(element, model) {

  this.isActive = true;

  this.model = model;
  this.el = element;

  this.render();

  this._bindEvents(this._nodes);

  element.classList.add('focus');

  var transforms = this._calculateTransforms(element);
  this._moveTo(element, transforms);

  this.captionEl.style.top = transforms.end.y + 'px';
  this.captionEl.style.left = transforms.end.x + 'px';
  this.captionEl.style.height = transforms.end.height + 'px';
  this.captionEl.style.width = transforms.end.height + 'px';

  this.overlayEl.classList.add('active');
  this.captionEl.classList.add('active');
};

LightboxView.prototype.render = function() {
  var nodes = this._nodes;
  var photo = this.model.current();

  var overlay = document.createElement('div');
  overlay.classList.add('overlay');

  var captionContainer = document.createElement('div');
  captionContainer.classList.add('caption');

  var caption = document.createElement('div');
  caption.appendChild(this._renderCaptionText(photo));
  nodes.caption = caption;

  var navigation = document.createElement('span');
  navigation.classList.add('nav');

  nodes.forward = document.createElement('a')
  nodes.forward.textContent = ">";

  nodes.backward = document.createElement('a');
  nodes.backward.textContent = "<";

  navigation.appendChild(nodes.backward);
  navigation.appendChild(nodes.forward);

  captionContainer.appendChild(caption);
  captionContainer.appendChild(navigation);

  this.overlayEl = document.body.insertBefore(overlay, this.container);
  this.captionEl = document.body.insertBefore(captionContainer, this.container);
};

LightboxView.prototype.dismiss = function(e) {

  this._unbindEvents(this._nodes);

  this.el.parentNode.style.transform = '';
  this.el.parentNode.style['-webkit-transform'] = '';
  this.el.classList.remove('focus');

  this._events.destroy = this._destroy.bind(this);
  this.overlayEl.addEventListener('transitionend', this._events.destroy, true);

  this.isActive = false;

  this.overlayEl.classList.remove('active');
  this.captionEl.classList.remove('active');
};

LightboxView.prototype._forward = function(e) {
  if (e) e.stopPropagation();

  var photo = this.model.next();
  this.el.src = photo.url;

  this._nodes.caption.innerHTML = '';
  this._nodes.caption.appendChild(this._renderCaptionText(photo));
};

LightboxView.prototype._backward = function(e) {
  if (e) e.stopPropagation();

  var photo = this.model.previous();
  this.el.src = photo.url;

  this._nodes.caption.innerHTML = '';
  this._nodes.caption.appendChild(this._renderCaptionText(photo));
};

LightboxView.prototype._keyboardHandler = function(e) {
    var LEFT_ARROW = 37;
    var RIGHT_ARROW = 39;
    var ESCAPE = 27;

    if (e.keyCode === RIGHT_ARROW) {
      e.preventDefault();
      this._forward();
    }

    if (e.keyCode === LEFT_ARROW) {
      e.preventDefault();
      this._backward();
    }

    if (e.keyCode === ESCAPE) {
      this.dismiss();
    }
};

LightboxView.prototype._moveTo = function(image, transforms) {

  var translateX = transforms.end.x - transforms.start.x;
  var translateY = transforms.end.y - transforms.start.y;
  var scale = transforms.scale;

  image.parentNode.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ', ' + scale + ') translateZ(0)';
  image.parentNode.style['-webkit-transform'] = 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scale + ', ' + scale + ') translateZ(0)';
};

LightboxView.prototype._renderCaptionText = function(photo) {
  var captionText = document.createElement('span');
  captionText.classList.add('caption-text');

  var text = photo.caption || '';

  if (text.length < 140) {
    captionText.textContent = text;
  } else {
    captionText.textContent = text.substr(0, 140).split(' ').slice(0, -1).join(' ') + " ";

    var link = document.createElement('a');
    link.href = photo.link;
    link.target = "_blank";
    link.textContent = "...";
    captionText.appendChild(link);
  }

  return captionText;
};

LightboxView.prototype._calculateTransforms = function(el) {
  var maxHeight = this.maxHeight;
  var fromHeight = this.fromHeight;
  var margin = this.margin;

  var toHeight = document.documentElement.clientHeight - (margin * 2);
  var scaleRatio = (toHeight >= maxHeight) ? (maxHeight / fromHeight) : (toHeight / fromHeight);

  var initialX = el.offsetLeft - (fromHeight / 2) * (scaleRatio - 1);
  var initialY = el.offsetTop - (fromHeight / 2) * (scaleRatio - 1);

  var centerX = (document.documentElement.clientWidth / 2) - (maxHeight / 2);
  var centerY = document.documentElement.clientHeight > (maxHeight + (2 * margin)) ? window.pageYOffset + (document.documentElement.clientHeight / 2) - (maxHeight / 2) : window.pageYOffset + margin;

  return {
    start: { x: initialX, y: initialY },
    end: { x: centerX, y: centerY, height: toHeight },
    scale: scaleRatio
  };
};

LightboxView.prototype._bindEvents = function(nodes) {
  var events = this._events;

  events.dismiss = this.dismiss.bind(this);
  events.keypressHandler = this._keyboardHandler.bind(this);
  events.forward = this._forward.bind(this);
  events.backward = this._backward.bind(this);

  this.captionEl.addEventListener('click', events.dismiss, false);
  this.overlayEl.addEventListener('click', events.dismiss, false);

  document.addEventListener('scroll', events.dismiss, false);
  document.addEventListener('keydown', events.keypressHandler, false);

  nodes.forward.addEventListener('click', events.forward, false);
  nodes.backward.addEventListener('click', events.backward, false);
};

LightboxView.prototype._unbindEvents = function(nodes) {
  var events = this._events;

  this.container.removeEventListener('click', events.dismiss, false);
  this.overlayEl.removeEventListener('click', events.dismiss, false);

  document.removeEventListener('scroll', events.dismiss, false);
  document.removeEventListener('keydown', events.keypressHandler, false);

  nodes.forward.removeEventListener('click', events.forward, false);
  nodes.backward.removeEventListener('click', events.backward, false);
};

LightboxView.prototype._destroy = function() {
  if (!this.isActive) {
    this.overlayEl.removeEventListener('transitionend', this._events.destroy, true);

    document.body.removeChild(this.overlayEl);
    document.body.removeChild(this.captionEl);
  }
};
