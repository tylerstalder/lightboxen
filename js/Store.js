var Store = function(options) {
  var options = options || {};

  var syncMethod = options.sync || 'jsonp';
  this.sync = this[syncMethod];

  this._models = [];
  this.url = options.url;
  this._debug = options.debug || false;

  this.el = document.createElement("div");
};

Store.prototype.forEach = function() {
  return Array.prototype.forEach.apply(this._models, arguments);
};

Store.prototype.parse = function(response) {
  response.data.forEach(function(model) {
    var photo = {
      url: model.images['standard_resolution'].url,
      user: model.user['full_name'],
      caption: model.caption.text
    };
    this._models.push(photo);
    this.trigger('add');
  }, this);
};

Store.prototype.jsonp = function(method, url, options) {
  var _this = this;

  this._callbackKey = 'evzfzd';
  this._callbackIndex = 0;

  var callbackId = this._callbackKey + this._callbackIndex;
  var override = window[callbackId];

  var callback = function(data) {
    window[callbackId] = override;

    _this.parse(data);
    _this.trigger('sync');

    if (_this._debug) console.log(data);

    if (options.success) {
      options.success(_this._models);
    }

  };

  var el = document.createElement('script');
  el.src = this.url + '&callback=' + callbackId;

  this._callbackIndex++;

  window[callbackId] = callback;

  document.body.appendChild(el);

};

Store.prototype.xhr = function(method, url, options) {
  var _this = this;

  var req = new XMLHttpRequest();

  var success = function(e) {
    _this.trigger('sync');
    if (options.success) {
      options.success(_this._models);
    }
  };

  var error = function(e) {
    _this.trigger('error');
    if (options.error) {
      options.error();
    }
  };

  req.addEventListener("load", success, false);
  req.addEventListener("error", error, false);

  req.open(method, url, true);

  this.trigger('request');
  req.send();

};

Store.prototype.get = function(index) {
  return this._models[index];
};

Store.prototype.fetch = function(options) {
  options = options || {};
  this.sync("GET", this.url, options);
};

Store.prototype.listenTo = function(name, callback) {
  this.el.addEventListener(name, callback, false);
};

Store.prototype.trigger = function(eventName) {
  if (this._debug) console.log(eventName);

  var event = new Event(eventName);
  this.el.dispatchEvent(event);
};


