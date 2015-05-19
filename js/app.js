var app = {

  init: function() {

    var store = new Store({
      url: 'https://api.instagram.com/v1/users/787132/media/recent/?client_id=0ca7b58d476f4528999da71e66c78c78',
      debug: true
    });

    var feed = new FeedView({
      el: document.getElementById('main'),
      collection: store
    });

    store.fetch();

    document.addEventListener('scroll', function(e) {
      console.log(e);
      console.log('rollin');
    }, false);


  }

};
