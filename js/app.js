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

// function highlightSelectPageInNav() {
//   Array.from(navbar.querySelectorAll('a')).forEach(function(a) {
//     const href = a.getAttribute('href'); // use unresolved URL as authored.
//     if (href === location.pathname) {
//       a.classList.add('selected');
//     }
//   });
// }

window.addEventListener('scroll', function(e) {
  navbar.classList.toggle('colorize', scroller.scrollTop > 0);

  // Call page's scroll handler if it defines one.
  exports.onScroll && exports.onScroll(scroller.scrollTop);
});

const fab = document.querySelector('.fab');
fab.addEventListener('click', e => {
  smoothScroll(document.body, 1);
});

// highlightSelectPageInNav();

exports.smoothScroll = smoothScroll;
exports.disableElementOnScroll = disableElementOnScroll;

})(window);
