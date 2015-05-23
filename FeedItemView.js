var FeedItemView = function(options) {
  var options = options || {};

  this.model = options.model;
  this.isRendered = false;
  this.isLoaded = false;
  this.clickCallback = options.onClick;

  if (options.el) {
    this.isRendered = true;
    this.el = options.el;
  }

  this.mount();
};

FeedItemView.prototype.mount = function() {
  this.model.photos.listenTo('sync', this.handleSync.bind(this));
  this.el.addEventListener('click', this.handleClick.bind(this));

  this.model.fetch();
};

FeedItemView.prototype.handleClick = function(e) {
  if (this.isRendered && this.isLoaded) {
    this.clickCallback(e.target, this.model);
  }
};

FeedItemView.prototype.handleSync = function(e) {
  this.isLoaded = true;

  if (this.isRendered) {
    this.update();
  }
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
  if (this.isRendered) {
    this.el.firstChild.firstChild.classList.remove('prerender');
  }
};
