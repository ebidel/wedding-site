var dexecure = {
  "server": "https://d29oziz0kcx73u.cloudfront.net/",
  "firstPartyDomain": [
    "jackieeric.com"
  ],
  "optimisationsEnabled": true,
  "debugMode": false,
  "imageMatchRegex": "\\.jpe?g|\\.png"
};"use strict";function isFirstPartyDomain(e){for(var t=new URL(e),r=dexecure.firstPartyDomain,s=r.length-1;s>=0;s--)if(r[s].toLowerCase()==t.host.toLowerCase())return!0;return!1}dexecure.optimisationsEnabled&&(self.addEventListener("install",function(e){e.waitUntil(self.skipWaiting())}),self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())}),self.addEventListener("fetch",function(e){var t={};e.request.headers.has("Accept")&&(t.Accept=e.request.headers.get("Accept")),e.request.headers.has("Viewport-Width")&&(t["Dex-Viewport-Width"]=parseInt(e.request.headers.get("Viewport-Width"),10)>1300?"l":"s"),e.request.headers.has("ETag")&&(t.ETag=e.request.headers.get("ETag"));var r=new Headers(t),s=new RegExp(dexecure.imageMatchRegex,"i");if(s.test(e.request.url.toLowerCase())&&isFirstPartyDomain(e.request.url)){var i=dexecure.server+e.request.url.replace(/^https?\:\/\//i,"");i=decodeURIComponent(i),e.respondWith(fetch(i,{mode:"cors",headers:r}).then(function(t){if(t.ok)return t;throw dexecure.debugMode&&console.log("Responding with original image as optimiser was not reachable ",e.request.url),new Error("Unable to fetch optimised image")})["catch"](function(t){return dexecure.debugMode&&(console.log("Sending original image as an error occured when trying to optimise ",e.request.url),console.log("The error was ",t)),fetch(e.request)}))}}));
