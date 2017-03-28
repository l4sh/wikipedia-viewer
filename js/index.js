/**
 * Wikipedia viewer project for freeCodeCamp
 */

var apiUrl = 'https://en.wikipedia.org/w/api.php?callback=?';
var contentEl = '#content';
var titleEl = '#page-title';

/**
 * Get a wikipedia page by specifying the page id
 * @param  {Number}  pageId  ID of the page to be requested
 */
function getPage(pageId) {
  UIkit.notify({
    message: 'Loading...',
    status: 'info',
    timeout: 1000,
    pos: 'bottom-right'
  });

  $.getJSON(apiUrl, {
      action: 'parse',
      format: 'json',
      mobileformat: 1,
      pageid: pageId
    })
    .done(function(jqXHR, responseText) {
      var pageTitle = jqXHR.parse.title;
      var pageContent = jqXHR.parse.text['*'];
      var reformattedContent = $('<div>' + pageContent + '</div>');

      // Remove styles
      reformattedContent.find('*').removeAttr('style');

      // Add ui-kit styles to tables
      reformattedContent
        .find('table')
        .addClass('uk-table uk-table-hover uk-table-striped uk-table-condensed');

      // Remove content
      reformattedContent.find('.hlist').remove();

      // Replace links to wikipedia links
      reformattedContent.find('a[href^="/"]').each(function() {
        this.href = this.href.replace(location.host, 'en.wikipedia.org');
      });

      $(contentEl).html(reformattedContent.html());
      $(titleEl).html('<a href="https://en.wikipedia.org/?curid=' +
        pageId + '" title="View in wikipedia">' +
        pageTitle + '</a>');

    })
    .fail(function(jqXHR, responseText) {

      UIkit.notify({
        message: 'Could not get page',
        status: 'danger',
        timeout: 3000,
        pos: 'bottom-right'
      });
    });
}

/**
 * Search the specified page title
 * @param  {String}  queryString  String to search
 */
function searchPage(queryString) {

  UIkit.notify({
    message: 'Searching...',
    status: 'info',
    timeout: 300,
    pos: 'bottom-right'
  });

  $.getJSON(apiUrl, {
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: queryString
    })
    .done(function(jqXHR, responseText) {
      var pages = jqXHR.query.pages;
      var pageId;
      var pageTitle;

      var pageList = '<ul class="uk-list uk-list-line">';

      for (var i in pages) {
        pageId = pages[i].pageid;
        pageTitle = pages[i].title
        pageList += '<li><a href="#" onclick="getPage(' + pageId + ')">' +
          pageTitle + '</a></li>';

      }

      pageList += '</ul>';

      $(titleEl).html('Search results');
      $(contentEl).html(pageList);

    })
    .fail(function(jqXHR, responseText) {

      UIkit.notify({
        message: 'Could not return search results',
        status: 'danger',
        timeout: 3000,
        pos: 'bottom-right'
      });

    });

}

/**
 * Get a random wikipedia page
 */
function getRandomPage() {
  $.getJSON(apiUrl, {
      action: 'query',
      format: 'json',
      generator: 'random',
      grnnamespace: 0,
      grnlimit: 1
    })
    .done(function(jqXHR, responseText) {

      var pages = jqXHR.query.pages;
      var pageId = pages[Object.keys(pages)[0]].pageid;

      getPage(pageId);
    })
    .fail(function(jqXHR, responseText) {

      UIkit.notify({
        message: 'Could not get page...',
        status: 'danger',
        timeout: 3000,
        pos: 'bottom-right'
      });

    });
}

/**
 * Handle search
 */
$(function() {
  $('.uk-search').submit(function(e) {
    e.preventDefault();

    var queryString = $(e.target).children('input').val();

    searchPage(queryString);

    return false;
  });
});