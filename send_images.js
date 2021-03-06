var image_downloader = {
  image_regex: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpe?g|gif|png|pdf|doc))(?:\?([^#]*))?(?:#(.*))?/,
  map_element: function (element) {
    if (element.tagName.toLowerCase() == 'img') {
      var src = element.src;
      var hash_index = src.indexOf('#');
      if (hash_index >= 0) {
        src = src.substr(0, hash_index);
      }
      return src;
    }
    
    if (element.tagName.toLowerCase() == 'a') {
      var href = element.href;
      if (image_downloader.is_image_url(href)) {
        image_downloader.linked_images[href] = '0';
        return href;
      }
    }
    
    var background_image = element.style['background-image'];
    if (background_image) {
      var parsed_url = image_downloader.extract_url_from_style(background_image);
      if (image_downloader.is_image_url(parsed_url)) {
        return parsed_url;
      }
    }
    
    return '';
  },
  
  extract_url_from_style: function (url) {
    return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
  },
  
  is_image_url: function (url) {
    return url.substring(0, 10) == 'data:image' || image_downloader.image_regex.test(url);
  },
  
  remove_duplicate_or_empty: function (a) {
    var result = [],
        hash = {};
    
    for (var i in a) {
      hash[a[i]] = 0;
    }
    for (var key in hash) {
      if (key != '') {
        result.push(key);
      }
    }
    return result;
  },
  
  download_images: function (images) {
    var images_container = document.getElementById('image_downloader_images_container');
    if (!images_container) {
      images_container = document.createElement('div');
      images_container.id = 'image_downloader_images_container';
      images_container.style.display = 'none';
    }
    document.body.appendChild(images_container);
    
    while (images_container.children.length > 0) {
      images_container.removeChild(images_container.children[images_container.children.length - 1])
    }
    
    for (var i in images) {
      var anchor = document.createElement('a');
      anchor.href = images[i];
      anchor.download = '';
      images_container.appendChild(anchor);
      anchor.click();
    }
    
    document.body.removeChild(images_container);
  }
};

image_downloader.linked_images = {};
image_downloader.images = [].slice.apply(document.getElementsByTagName('*'));
image_downloader.images = image_downloader.images.map(image_downloader.map_element);

for (var i in document.styleSheets) { //Extract images from styles
  var cssRules = document.styleSheets[i].cssRules;
  if (cssRules) {
    for (var j in cssRules) {
      var style = cssRules[j].style;
      if (style && style['background-image']) {
        var url = image_downloader.extract_url_from_style(style['background-image']);
        if (image_downloader.is_image_url(url)) {
          image_downloader.images.push(url);
        }
      }
    }
  }
}

image_downloader.images = image_downloader.remove_duplicate_or_empty(image_downloader.images);
chrome.extension.sendRequest({ linked_images: image_downloader.linked_images, images: image_downloader.images });

image_downloader.linked_images = null;
image_downloader.images = null;
