var FeedView = function(options) {
  var options = options || {};
  var _this = this;

  this.el = options.el;
  this.collection = options.collection;

  this.collection.listenTo('add', function(e) {
    _this.render();
  });

  this.lightbox = new LightboxView();

  this.mount();
  //this.render();
};

FeedView.prototype.render = function() {
  var newView = document.createDocumentFragment();
  this.collection.forEach(function(user) {
    newView.appendChild(this.feedItem(user));
  }, this);
  this.el.appendChild(newView);

};

FeedView.prototype.feedItem = function(user) {
  var view =  new FeedItemView({
    model: user,
    onClick: this.lightbox.show.bind(this.lightbox)
  });

  return view.el;
};

FeedView.prototype.mount = function() {
  if (this.el.hasChildNodes()) {
    var prerendered = Array.prototype.slice.call(this.el.children);

    var byId = prerendered.map(function(el) {
      return parseInt(el.dataset["user"]);
    });

    this.collection.forEach(function(model) {
      var hasModel = byId.indexOf(model.id);
      if (hasModel !== -1) {
        var el = this.el.children[hasModel];
        var view = new FeedItemView({
          model: model,
          el: el,
          onClick: this.lightbox.show.bind(this.lightbox)
        });
      }
    }, this);
  }
};
