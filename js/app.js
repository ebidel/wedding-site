(function(exports) {

'use strict';

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function(e) {
  const scroller = document.scrollingElement || document.body;
  if (scroller.scrollTop > 0) {
    navbar.classList.add('colorize');
  } else {
    navbar.classList.remove('colorize');
  }

  // Call page's scroll handler if it defines one.
  exports.onScroll && exports.onScroll(scroller.scrollTop);
});

})(window);
