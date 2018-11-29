import { Component, OnInit } from '@angular/core';
declare var PhotoSwipe: any;
declare var PhotoSwipeUI_Default: any;
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css', './photoswipe.css','./default-skin/default-skin.css']
})
export class GalleryComponent implements OnInit {
  loadAPI: Promise<any>;
  constructor() {
    this.loadAPI = new Promise(resolve => {
      this.loadScript();
      resolve(true);
    });
  }

  ngOnInit() {
    const pswpElement = document.querySelectorAll('.pswp')[0];

    // build items array
    const items = [
      {
        src: 'https://placekitten.com/600/400',
        w: 600,
        h: 400
      },
      {
        src: 'https://placekitten.com/1200/900',
        w: 1200,
        h: 900
      }
    ];
    // define options (if needed)
    const options = {
      // optionName: 'option value'
      // for example:
      index: 0 // start at first slide
    };
    // Initializes and opens PhotoSwipe
    const gallery = new PhotoSwipe(
      pswpElement,
      PhotoSwipeUI_Default,
      items,
      options
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
