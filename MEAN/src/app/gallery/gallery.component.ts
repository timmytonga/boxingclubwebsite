import { Component, OnInit } from '@angular/core';
declare var PhotoSwipe: any;
declare var PhotoSwipeUI_Default: any;
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: [
    './gallery.component.css',
    './photoswipe.css',
    './default-skin/default-skin.css'
  ]
})
export class GalleryComponent implements OnInit {
  loadAPI: Promise<any>;
  items: any;
  options: any;
  constructor() {
    this.loadAPI = new Promise(resolve => {
      this.loadScript();
      resolve(true);
    });
  }

  ngOnInit() {
    this.initPhotoSwipeFromDOM('.my-gallery');
    // this.showGallery();
    // build items array
    this.items = [
      {
        // src: 'https://placekitten.com/600/400',
        src: 'https://farm2.staticflickr.com/1043/5186867718_06b2e9e551_b.jpg',
        w: 964,
        h: 1024,
        size: '964x1024',
        title: 'Image Caption',
        content: 'hello'
      },
      {
        src: 'https://farm7.staticflickr.com/6175/6176698785_7dee72237e_b.jpg',
        w: 1024,
        h: 683,
        size: '1025x683',
        title: 'Image Caption',
        content: 'hello'
      }
    ];
    // define options (if needed)
    this.options = {
      history: false,
      focus: false,

      showAnimationDuration: 0,
      hideAnimationDuration: 0
    };
  }

  public initPhotoSwipeFromDOM = function(gallerySelector) {
    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)
    const parseThumbnailElements = function(el) {
      const thumbElements = el.childNodes,
        numNodes = thumbElements.length,
        items = [];
      let figureEl, linkEl, size, item;

      for (let i = 0; i < numNodes; i++) {
        figureEl = thumbElements[i]; // <figure> element

        // include only element nodes
        if (figureEl.nodeType !== 1) {
          continue;
        }

        linkEl = figureEl.children[0]; // <a> element

        size = linkEl.getAttribute('data-size').split('x');

        // create slide object
        item = {
          src: linkEl.getAttribute('href'),
          w: parseInt(size[0], 10),
          h: parseInt(size[1], 10)
        };

        if (figureEl.children.length > 1) {
          // <figcaption> content
          item.title = figureEl.children[1].innerHTML;
        }

        if (linkEl.children.length > 0) {
          // <img> thumbnail element, retrieving thumbnail url
          item.msrc = linkEl.children[0].getAttribute('src');
        }

        item.el = figureEl; // save link to element for getThumbBoundsFn
        items.push(item);
      }

      return items;
    };

    // find nearest parent element
    const closest = function(el, fn) {
      return el && (fn(el) ? el : closest(el.parentNode, fn));
    };

    // triggers when user clicks on thumbnail
    const onThumbnailsClick = function(e) {
      e = e || window.event;
      e.preventDefault ? e.preventDefault() : (e.returnValue = false);

      const eTarget = e.target || e.srcElement;

      // find root element of slide
      const clickedListItem = closest(eTarget, function(el) {
        return el.tagName && el.tagName.toUpperCase() === 'FIGURE';
      });

      if (!clickedListItem) {
        return;
      }

      // find index of clicked item by looping through all child nodes
      // alternatively, you may define index via data- attribute
      const clickedGallery = clickedListItem.parentNode,
        childNodes = clickedListItem.parentNode.childNodes,
        numChildNodes = childNodes.length;

      let index,
        nodeIndex = 0;

      for (let i = 0; i < numChildNodes; i++) {
        if (childNodes[i].nodeType !== 1) {
          continue;
        }

        if (childNodes[i] === clickedListItem) {
          index = nodeIndex;
          break;
        }
        nodeIndex++;
      }

      if (index >= 0) {
        // open PhotoSwipe if valid index found
        openPhotoSwipe(index, clickedGallery, null, null);
      }
      return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    const photoswipeParseHash = function() {
      const hash = window.location.hash.substring(1),
        params: any = {};

      if (hash.length < 5) {
        return params;
      }

      const vars = hash.split('&');
      for (let i = 0; i < vars.length; i++) {
        if (!vars[i]) {
          continue;
        }
        const pair = vars[i].split('=');
        if (pair.length < 2) {
          continue;
        }
        params[pair[0]] = pair[1];
      }

      if (params.gid) {
        params.gid = parseInt(params.gid, 10);
      }

      return params;
    };

    const openPhotoSwipe = function(
      index,
      galleryElement,
      disableAnimation,
      fromURL
    ) {
      const pswpElement = document.querySelectorAll('.pswp')[0];
      let gallery, options, items;

      items = parseThumbnailElements(galleryElement);

      // define options (if needed)
      options = {
        // define gallery index (for URL)
        galleryUID: galleryElement.getAttribute('data-pswp-uid'),

        getThumbBoundsFn: function(i) {
          // See Options -> getThumbBoundsFn section of documentation for more info
          const thumbnail = items[i].el.getElementsByTagName('img')[0], // find thumbnail
            pageYScroll =
              window.pageYOffset || document.documentElement.scrollTop,
            rect = thumbnail.getBoundingClientRect();

          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
        }
      };

      // PhotoSwipe opened from URL
      if (fromURL) {
        if (options.galleryPIDs) {
          // parse real index when custom PIDs are used
          // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
          for (let j = 0; j < items.length; j++) {
            if (items[j].pid === index) {
              options.index = j;
              break;
            }
          }
        } else {
          // in URL indexes start from 1
          options.index = parseInt(index, 10) - 1;
        }
      } else {
        options.index = parseInt(index, 10);
      }

      // exit if index not found
      if (isNaN(options.index)) {
        return;
      }

      if (disableAnimation) {
        options.showAnimationDuration = 0;
      }

      // Pass data to PhotoSwipe and initialize it
      gallery = new PhotoSwipe(
        pswpElement,
        PhotoSwipeUI_Default,
        items,
        options
      );
      gallery.init();
    };

    // loop through all gallery elements and bind events
    const galleryElements = document.querySelectorAll(gallerySelector);

    for (let i = 0, l = galleryElements.length; i < l; i++) {
      galleryElements[i].setAttribute('data-pswp-uid', i + 1);
      galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    const hashData = photoswipeParseHash();
    if (hashData.pid && hashData.gid) {
      openPhotoSwipe(
        hashData.pid,
        galleryElements[hashData.gid - 1],
        true,
        true
      );
    }
  };

  public showGallery() {
    const pswpElement = document.querySelectorAll('.pswp')[0];

    // Initializes and opens PhotoSwipe
    const gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      this.items,
      this.options
    );
    gallery.init();
  }

  public loadScript() {
    let isFound = false;
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; ++i) {
      if (
        scripts[i].getAttribute('src') != null &&
        scripts[i].getAttribute('src').includes('loader')
      ) {
        isFound = true;
      }
    }

    if (!isFound) {
      const dynamicScripts = [
        'assets/js/photoswipe-ui-default.min.js',
        'assets/js/photoswipe.min.js'
      ];

      for (let i = 0; i < dynamicScripts.length; i++) {
        const node = document.createElement('script');
        node.src = dynamicScripts[i];
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node);
      }
    }
  }
}
