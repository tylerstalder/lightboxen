var FeedView = function(options) {
  var options = options || {};
  var _this = this;

  this.el = options.el;
  this.collection = options.collection;

  this.activeIndex = 0;

  this.collection.listenTo('sync', function(e) {
    _this.render();
  });
};

FeedView.prototype.render = function() {

  var _this = this;
  var lightbox = new LightboxView();

  this.collection.forEach(function(photo) {
    var model = photo;
    var index = 0;

    var el = document.createElement('img');
    el.src = model.url;
    el["data-index"] = index;
    el.classList.add('zoomable');

    _this.el.appendChild(el);
  });

  this.el.addEventListener('click', function(e) {

    var isZoomable = (e.target.classList.contains('zoomable'));
    var isLightboxed = (lightbox.isActive);

    if (isZoomable && !isLightboxed) {
      var index = e.target["data-index"];
      lightbox.show(e.target, _this.collection);
    }

  }, false);

};
