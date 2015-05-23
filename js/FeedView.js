var FeedView = function(options) {
  var options = options || {};
  var _this = this;

  this.el = options.el;
  this.collection = options.collection;

  this.collection.listenTo('add', function(e) {
    console.log('add event triggered render');
    _this.render();
  });

  //this.collection.listenTo('add', this.render.bind(this));

  this.lightbox = new LightboxView();

  this.mount();

  //this.render();
};

FeedView.prototype.mount = function() {
  this.bindExistingDOM();
};

FeedView.prototype.render = function() {
  var newView = document.createDocumentFragment();
  this.collection.forEach(function(user) {
    newView.appendChild(this.feedItem(user));
  }, this);
  this.el.appendChild(newView);

};

FeedView.prototype.feedItem = function(user, prerenderedEl) {
  var options = {
    model: user,
    onClick: this.lightbox.show.bind(this.lightbox)
  };

  if (prerenderedEl) options.el = prerenderedEl;

  var view =  new FeedItemView(options);

  return view.el;
};

FeedView.prototype.bindExistingDOM = function() {
  if (this.el.hasChildNodes()) {
    var prerenderedNodes = Array.prototype.slice.call(this.el.children);

    var byId = prerenderedNodes.map(function(el) {
      return parseInt(el.dataset["user"]);
    });

    this.collection.forEach(function(model) {
      var hasModel = byId.indexOf(model.id);
      if (hasModel !== -1) {
        var el = this.el.children[hasModel];
        var view = this.feedItem(model, el);
      }
    }, this);
  }
};
