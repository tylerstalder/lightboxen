var FeedItemView = function(options) {
  var options = options || {};
  var _this = this;

  this.model = options.model;
  this.isRendered = false;
  this.isLoaded = false;
  this.handleClick = options.onClick;

  if (options.el) {
    this.isRendered = true;
    this.el = options.el;
  }

  //this.render();

  this.model.photos.listenTo('sync', function(e) {
    _this.isLoaded = true;
    if (_this.isRendered) {
      _this.update();
    }
  });

  this.mount();
};

FeedItemView.prototype.mount = function() {
  this.model.fetch();

  var _this = this;
  this.el.addEventListener('click', function(e) {
    if (_this.isRendered && _this.isLoaded) {
      _this.handleClick(e.target, _this.model.photos.get(_this.model.coverIndex), _this.model);
    }
  }, false);
};

FeedItemView.prototype.render = function() {
  var user = this.model;

  var placeholder = document.createElement('div');
  placeholder.classList.add('placeholder');
  placeholder.dataset["user"] = user.id;

  var userFeed = document.createElement('div');
  userFeed.classList.add('user-feed');

  placeholder.appendChild(userFeed);

  this.isRendered = true;
  this.el = placeholder;
  this.inner = userFeed;

  return placeholder;
};

FeedItemView.prototype.update = function() {

  /*
  if (this.model.photos.get(0)) {
    var cover = this.model.photos.get(0);
    var coverPhoto = document.createElement('img');
    coverPhoto.src = cover.url;
    coverPhoto.classList.add('zoomable');
    coverPhoto.classList.add('prerender');

    this.inner.appendChild(coverPhoto);
  }
 */

  if (this.isRendered) {
    this.el.firstChild.firstChild.classList.remove('prerender');
  }
};
