(function(exports) {

'use strict';

const scroller = document.scrollingElement || document.body;
const navbar = document.querySelector('.navbar');

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

window.addEventListener('scroll', function(e) {
  navbar.classList.toggle('colorize', scroller.scrollTop > 0);

  // Call page's scroll handler if it defines one.
  exports.onScroll && exports.onScroll(scroller.scrollTop);
});

const fab = document.querySelector('.fab');
fab.addEventListener('click', e => {
  smoothScroll(document.body, 1);
});

exports.smoothScroll = smoothScroll;

})(window);
