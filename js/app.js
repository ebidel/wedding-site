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

function lazyLoadImagesWhenVisible(container) {
  const adventures = document.querySelector('#adventures');
  let observer = new IntersectionObserver((records, observer) => {
    observer.unobserve(adventures);

    // TODO: lazy load images.
  });
  observer.observe(adventures);
}

exports.lazyLoadImagesWhenVisible = lazyLoadImagesWhenVisible;

})(window);
