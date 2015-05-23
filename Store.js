var Store = function(options) {
  var options = options || {};

  var syncMethod = options.sync || 'jsonp';
  this.sync = this[syncMethod];

  this.id = options.id;
  this.url = options.url;
  this.eventEmitter = document.createElement("div");

  this._debug = options.debug || false;
  this._models = [];
  this._callbackIndex = this.id
  this._byId = [];

  if (options.models) {
    options.models.forEach(function(newModel) {
      var model = new Model(newModel);
      this.add(model);
      model.photos.add(newModel.photos[0]);
    }, this);
  }
};

Store.prototype.forEach = function() {
  return Array.prototype.forEach.apply(this._models, arguments);
};

Store.prototype.parse = function(response) {
  response.data.forEach(function(model) {
    if (this._byId.indexOf(model.id) === -1) {
      var photo = {
        id: model.id,
        url: model.images['standard_resolution'].url,
        user: model.user['full_name'],
        caption: model.caption && model.caption.text,
        link: model.link
      };
      this.add(photo);
    }
  }, this);
};

Store.prototype.add = function(model) {
  this._models.push(model);
  this._byId.push(model.id);
  this.trigger('add');
};

Store.prototype.jsonp = function(method, options) {
  var _this = this;

  this._callbackKey = 'evzfzd';

  var callbackId = this._callbackKey + this._callbackIndex;

  this._callbackIndex += 1;

  var override = window[callbackId];

  var callback = function(data) {
    window[callbackId] = override;

    _this.parse(data);
    _this.trigger('sync');

    if (_this._debug) console.log(data);

    if (options.success) {
      options.success(_this._models);
    }

    delete window[callbackId];
    document.body.removeChild(document.getElementById(callbackId));
  };

  var el = document.createElement('script');
  el.id = callbackId;
  el.src = this.url + '&callback=' + callbackId;

  window[callbackId] = callback;

  document.body.appendChild(el);
};

Store.prototype.get = function(index) {
  return this._models[index];
};

Store.prototype.fetch = function(options) {
  options = options || {};
  this.sync("GET", options);
};

Store.prototype.listenTo = function(name, callback) {
  this.eventEmitter.addEventListener(name, callback, false);
};

Store.prototype.trigger = function(eventName) {
  if (this._debug) console.log(eventName);

  var event = new Event(eventName);
  this.eventEmitter.dispatchEvent(event);
};


