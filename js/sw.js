self.addEventListener('install', function(e) {
  // console.log("SW install");
  self.skipWaiting();
});

// self.addEventListener('activate', function(event) {
//   console.log("SW activated");
// });

self.addEventListener('fetch', function(e) {
  const requestURL = new URL(e.request.url);

  // Check that the browser supports .webp images.
  const acceptHeader = e.request.headers.get('Accept');
  if (!acceptHeader.match(/image\/webp/)) {
    return;
  }

  // Only replace png and jpg images with webp.
  const regex = /.(jpg|png)$/;
  if (regex.test(requestURL.href)) {
    const newURL = requestURL.href.replace(regex, '.webp');
    e.respondWith(
      fetch(newURL).then(resp => {
        return resp.status === 200 ? resp : fetch(requestURL);
      })
    );
  }
});
