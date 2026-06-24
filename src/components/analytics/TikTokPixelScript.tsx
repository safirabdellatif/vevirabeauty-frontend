import Script from "next/script";
import { TIKTOK_PIXEL_ID, TIKTOK_PIXEL_ID_OLD } from "@/config/pixels";

export function TikTokPixelScript() {
  if (!TIKTOK_PIXEL_ID) return null;

  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {`
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${TIKTOK_PIXEL_ID}');
  ttq.load('${TIKTOK_PIXEL_ID_OLD}');
  ttq.page();
}(window, document, 'ttq');

// Patch ttq.track to fix Event Builder Purchase events missing required parameters
(function patchTTQ() {
  var attempts = 0;
  var interval = setInterval(function() {
    attempts++;
    if (window.ttq && typeof window.ttq.track === 'function' && !window.ttq._sanadPatched) {
      var orig = window.ttq.track.bind(window.ttq);
      window.ttq.track = function(event, data, opts) {
        if (event === 'Purchase') {
          data = data || {};
          if (!data.currency) data.currency = 'SAR';
          if (!data.value || data.value === 0) {
            var stored = window._sanadLastPurchaseValue;
            if (stored) data.value = stored;
          }
          if (!data.contents || !data.contents.length) {
            var storedContents = window._sanadLastPurchaseContents;
            if (storedContents) data.contents = storedContents;
          }
        }
        return orig(event, data, opts);
      };
      window.ttq._sanadPatched = true;
      clearInterval(interval);
    }
    if (attempts > 50) clearInterval(interval);
  }, 200);
})();
      `}
    </Script>
  );
}


// Patch ttq.track to fix Event Builder Purchase events missing required parameters
(function patchTTQ() {
  var attempts = 0;
  var interval = setInterval(function() {
    attempts++;
    if (window.ttq && typeof window.ttq.track === 'function' && !window.ttq._sanadPatched) {
      var orig = window.ttq.track.bind(window.ttq);
      window.ttq.track = function(event, data, opts) {
        if (event === 'Purchase') {
          data = data || {};
          if (!data.currency) data.currency = 'SAR';
          if (!data.value || data.value === 0) {
            var stored = window._sanadLastPurchaseValue;
            if (stored) data.value = stored;
          }
          if (!data.contents || !data.contents.length) {
            var storedContents = window._sanadLastPurchaseContents;
            if (storedContents) data.contents = storedContents;
          }
        }
        return orig(event, data, opts);
      };
      window.ttq._sanadPatched = true;
      clearInterval(interval);
    }
    if (attempts > 50) clearInterval(interval);
  }, 200);
})();
      `}
    </Script>
  );
}
