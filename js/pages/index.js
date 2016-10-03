(function(exports) {
'use strict';

const chevron = document.querySelector('.chevron');

chevron.addEventListener('click', e => {
  smoothScroll(document.querySelector('#aboutus'), 600);
});

function onScroll(scrollTop) {
  if (scrollTop > 0) {
    chevron.classList.remove('bounce');
  } else {
    chevron.classList.add('bounce');
  }
}

function lazyLoadImagesWhenVisible() {
  const observer = new IntersectionObserver((records, observer) => {
    for (const record of records) {
      const img = record.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });

  const imgs = document.querySelectorAll('#adventures img[data-src]');
  Array.from(imgs).forEach(img => observer.observe(img));
}

function initGallery() {
  const container = document.querySelector('#adventures');
  const galleryImgs = Array.from(container.querySelectorAll('img'));

  const gallery = document.querySelector('#lightbox');
  const galleryImg = gallery.querySelector('.lightbox-img');
  const galleryCaption = gallery.querySelector('figcaption');

  const galleryOpen = function(e) {
    document.body.classList.add('noscroll');
    document.addEventListener('click', galleryClose);
    gallery.classList.add('open');
  };

  const galleryClose = function(e) {
    if (!e || e.target === gallery) {
      document.removeEventListener('click', galleryClose);
      gallery.classList.remove('open');
      document.body.classList.remove('noscroll');
    }
  };

  const gallerySelect = function(idx) {
    const img = galleryImgs[idx];
    gallery.setAttribute('selected', idx);
    // Image hasn't been scrolled into view yet and had its src set
    // by the IntersectionObserver. Do it manually.
    if (!img.src) {
      img.src = img.dataset.src;
    }
    galleryImg.src = img.src;
    galleryCaption.textContent = img.nextElementSibling.textContent;
  };

  const gallerySelectNext = function(reverse=false) {
    let idx = parseInt(gallery.getAttribute('selected')) || 0;
    if (reverse) {
      idx = idx === 0 ? galleryImgs.length - 1 : idx - 1;
    } else {
      idx = (idx + 1) % galleryImgs.length;
    }
    gallerySelect(idx);
  };

  const gallerySelectPrev = function() {
    let idx = parseInt(gallery.getAttribute('selected')) || 0;
    idx = (idx + 1) % galleryImgs.length;
    gallerySelect(idx);
  };

  gallery.querySelector('.close').addEventListener('click', e => {
    galleryClose();
  });

  const nextArrow = gallery.querySelector('.arrow.right');
  nextArrow.addEventListener('click', e => gallerySelectNext());

  const prevArrow = gallery.querySelector('.arrow.left');
  prevArrow.addEventListener('click', e => gallerySelectNext(true));

  document.addEventListener('keydown', e => {
    if (!gallery.classList.contains('open')) {
      return;
    }

    let flag = false;

    switch (e.code) {
      case 'Escape':
        galleryClose();
        flag = true;
        break;
      case 'ArrowLeft':
        flag = true;
        gallerySelectNext(true);
        break;
      case 'ArrowRight':
        flag = true;
        gallerySelectNext();
      case 'Space':
        flag = true;
        gallerySelectNext(e.shiftKey);
        break;
      default:
        break;
    }

    if (flag) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  container.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.localName === 'img') {
      let idx = galleryImgs.indexOf(e.target);
      gallerySelect(idx);
      galleryOpen();
    }
  });
}

lazyLoadImagesWhenVisible();
exports.swapBackgroundImagesWhenInView();
initGallery();

exports.onScroll = onScroll;

})(window);
