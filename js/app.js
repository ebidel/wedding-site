(function(exports) {

'use strict';

const scroller = document.scrollingElement || document.body;
const navbar = document.querySelector('.navbar');

let _disableElementScrollTimeout = null;

// From http://en.wikipedia.org/wiki/Smoothstep
function smoothStep(start, end, point) {
  if (point <= start) {
    return 0;
  }
  if (point >= end) {
    return 1;
  }
  var x = (point - start) / (end - start); // interpolation
  return x * x * (3 - 2 * x);
}

/**
 * Smooth scrolls to the top of an element.
 *
 * @param {Element} el Element to scroll to.
 * @param {number=} duration Optional duration for the animation to
 *     take. If not specified, the element is immediately scrolled to.
 * @param {function()=} callback Callback to execute at the end of the scroll.
 * @param {number=} offset Offset from the top to stop at.
 */
function smoothScroll(el, duration = 1, callback = null, offset = 0) {
  const startTime = performance.now();
  const endTime = startTime + duration;
  const startTop = scroller.scrollTop;
  const destY = el.getBoundingClientRect().top;

  if (destY === 0) {
    callback && callback();
    return; // already at top of element.
  }

  const cb = function(timestamp) {
    if (timestamp < endTime) {
      requestAnimationFrame(cb);
    }

    var point = smoothStep(startTime, endTime, timestamp);
    var scrollTop = Math.round(startTop + (destY * point)) - offset;

    scroller.scrollTop = scrollTop;

    // All done scrolling.
    if (point === 1 && callback) {
      callback();
    }
  };

  cb(startTime);
}

/**
 * Disables a container from user interaction (using pointer-events: none)
 * when the page is scrolling. Enables it again
 *
 * @param {HTMLElement} container The container to
 * @param {Function} callback Optional callback, invoked when the user
 *     has stopped scrolling after opt_enableAfter ms (or default 250ms).
 * @param {boolean} enableAfter Optional number of ms to enable
 *     interaction on the container after the user has stopped scrolling.
 */
function disableElementOnScroll(container, callback=null, enableAfter=250) {
  if (!_disableElementScrollTimeout) {
    container.style.pointerEvents = 'none';
  }

  clearTimeout(_disableElementScrollTimeout);

  _disableElementScrollTimeout = setTimeout(function() {
    container.style.pointerEvents = 'auto';
    callback && callback();
    _disableElementScrollTimeout = null;
  }, enableAfter);
}

function swapBackgroundImagesWhenInView() {
  const imgs = Array.from(document.querySelectorAll('.parallax-img'));

  const observer = new IntersectionObserver((records, observer) => {
    for (const record of records) {
      record.target.classList.toggle('show', record.intersectionRatio);
    }
    // Ensure the top image is showing when scrolling back to the top.
    if (scroller.scrollTop < window.innerHeight / 2) {
      imgs[0].classList.add('show');
    }
  });

  imgs.forEach(img => observer.observe(img));
}

window.addEventListener('scroll', function(e) {
  navbar.classList.toggle('colorize', scroller.scrollTop > 0);

  // Call page's scroll handler if it defines one.
  exports.onScroll && exports.onScroll(scroller.scrollTop);
});

const fab = document.querySelector('.fab');
fab.addEventListener('click', e => {
  smoothScroll(document.body, 1);
});

navbar.addEventListener('click', e => {
  if (window.matchMedia('(max-width: 767px)').matches) {
    navbar.classList.toggle('open');
  }
});

// function hasWebPSupport() {
//   return new Promise((resolve, reject) => {
//     const img = document.createElement('img');
//     img.onload = e => {
//       // The image has these dimensions.
//       if (e.target.width === 2 && e.target.height === 1) {
//         resolve();
//       } else {
//         reject();
//       }
//     };
//     img.onerror = reject;
//     img.src = 'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
//   });
// }

// hasWebPSupport().then(_ => {
//   const imgs = document.querySelectorAll('img');
//   Array.from(imgs).forEach(img => {
//     if ('src' in img.dataset) {
//       img.dataset.src = img.dataset.src.replace(/\.jpg|png$/, '.webp');
//     } else {
//       img.src = img.src.replace(/\.jpg|png$/, '.webp');
//     }
//   });
// }, function() {
//   // .webp not supported.
// });

const mediaQueryList = window.matchMedia('(orientation: portrait)');

function setMaxHeight(mediaQueryList) {
  const vh = window.innerHeight;
  let vw = window.innerWidth;

  vw = Math.max(vh, vw);

  document.documentElement.style.setProperty('--viewport-height', vh + 'px');
  document.documentElement.style.setProperty('--viewport-width', vw + 'px');

  // const imgs = document.querySelectorAll('.parallax-img');
  // Array.from(imgs).forEach(img => {
  //   if (mediaQueryList.matches) {
  //     img.style.height = `${Math.max(vh, vw)}px`;
  //   } else {
  //     img.style.height = `${Math.min(vh, vw)}px`;
  //   }
  // });
}

setMaxHeight(mediaQueryList);
// mediaQueryList.addListener(setMaxHeight);
// window.addEventListener('resize', e => {
//   // setMaxHeight(mediaQueryList);
// });

exports.smoothScroll = smoothScroll;
exports.disableElementOnScroll = disableElementOnScroll;
exports.swapBackgroundImagesWhenInView = swapBackgroundImagesWhenInView;

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-84287775-1', 'auto');
  ga('send', 'pageview');

})(window);
