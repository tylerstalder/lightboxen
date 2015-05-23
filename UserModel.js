var Model = function(options) {
  this.id = options.id;
  this.name = options.name;
  this.photos = new Store({
    id: this.id,
    url: 'https://api.instagram.com/v1/users/' + this.id + '/media/recent/?client_id=0ca7b58d476f4528999da71e66c78c78',
  });

  this.coverIndex = 0;
};

Model.prototype.fetch = function(options) {
  options = options || {}
  this.photos.fetch(options);
};

Model.prototype.current = function() {
  return this.photos.get(this.coverIndex);
};

Model.prototype.next = function() {
  this.coverIndex = (this.coverIndex < this.photos._models.length - 1) ? this.coverIndex + 1 : 0;
  return this.photos.get(this.coverIndex);
};

Model.prototype.previous = function() {
  this.coverIndex = (this.coverIndex === 0) ? this.photos._models.length - 1 : this.coverIndex - 1;
  return this.photos.get(this.coverIndex);
};

Model.prototype.serialize = function() {
  var output = {
    id: this.id,
    name: this.name,
    photos: [
      this.photos.get(0)
    ]
  };

  return output;
};
