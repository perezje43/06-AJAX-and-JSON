function Article (opts) {
  for (keys in opts) {
    this[keys] = opts[keys];
  }
}

/* DONE: Instead of a global `articles = []` array, let's track this list of all
 articles directly on the constructor function. Note: it is NOT on the prototype.
 In JavaScript, functions are themselves objects, which means we can add
 properties/values to them at any time. In this case, we have a key:value pair
 to track, that relates to ALL of the Article objects, so it does not belong on
 the prototype, as that would only be relevant to a single instantiated Article.
 */
Article.all = [];

Article.prototype.toHtml = function(scriptTemplateId) {
  var template = Handlebars.compile((scriptTemplateId).html());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

/* NOTE: There are some other functions that also relate to articles across the
 board, rather than just single instances. Object-oriented programming would
 call these "class-level" functions, that are relevant to the entire "class"
 of objects that are Articles. */

/* DONE: This function will take our data, however it is provided,
 and use it to instantiate all the articles. This code is moved from elsewhere,
 and encapsulated in a simply-named function for clarity. */
Article.loadAll = function(dataWePassIn) {
  dataWePassIn.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });
  dataWePassIn.forEach(function(ele) {
    Article.all.push(new Article(ele));
  });
};

/* This function below will retrieve the data from either a local or remote
 source, process it, then hand off control to the View. */

Article.fetchAll = function() {
  if (localStorage.hackerIpsum) {
    $.ajax({
      type: 'HEAD',
      url: 'data/hackerIpsum.json',
      success: function (data, message, xhr) {
        var currentTag = xhr.getResponseHeader('eTag');
        if (currentTag === JSON.parse(localStorage.eTag)) {
          console.log('the same');
          parsedLocal = JSON.parse(localStorage.hackerIpsum);
          Article.loadAll(parsedLocal);
          articleView.initIndexPage();
        } else {
          renderFromJSON();
        }
      }
    });
  } else {
    renderFromJSON();
  }
};

var renderFromJSON = function() {
  $.getJSON('data/hackerIpsum.json', function(data) {
    Article.loadAll(data);
    localStorage.hackerIpsum = JSON.stringify(data);
    articleView.initIndexPage();
    $.ajax({
      type: 'GET',
      url: 'data/hackerIpsum.json',
      success: function (data, message, xhr) {
        var eTag = xhr.getResponseHeader('eTag');
        localStorage.eTag = JSON.stringify(eTag);
      }
    });
  });
};
/* Great work so far! STRETCH GOAL TIME! Refactor your fetchAll above, or
   get some additional typing practice here. Our main goal in this part of the
   lab will be saving the eTag located in Headers, to see if it's been updated!
  Article.fetchAll = function() {
    if (localStorage.hackerIpsum) {
      // Let's make a request to get the eTag (hint: you may need to use a different
      // jQuery method for this more explicit request).
  } else {}
}
*/
