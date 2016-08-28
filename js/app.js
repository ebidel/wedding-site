(function(exports) {

'use strict';

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function(e) {
  const scroller = document.scrollingElement || document.body;
  navbar.classList.toggle('colorize', scroller.scrollTop > 0);

  // Call page's scroll handler if it defines one.
  exports.onScroll && exports.onScroll(scroller.scrollTop);
});

})(window);
