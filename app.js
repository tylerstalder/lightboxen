var app = {

  init: function() {

    var store = new Store({
      models: CONFIG.popularAccounts
    });

    var feed = new FeedView({
      el: document.getElementById('main'),
      collection: store
    });
  }
};
