import React from "react";

/**
 * Executes immediately in the `<head>` to tag the `<html>` root with `data-browser-engine`
 * before React hydration or CSS painting. Useful for applying targeted performance 
 * degradation (like dropping heavy blurs) on non-Chromium engines.
 */
export function BrowserEngineScript() {
  const codeToRunOnClient = `
    (function() {
      try {
        var isChromium = false;
        if (window.chrome && typeof window.chrome !== "undefined") {
          isChromium = true;
        } else {
          var ua = navigator.userAgent.toLowerCase();
          if (ua.indexOf("chrome/") > -1 || ua.indexOf("chromium/") > -1 || ua.indexOf("edg/") > -1) {
            isChromium = true;
          }
        }
        document.documentElement.setAttribute("data-browser-engine", isChromium ? "chromium" : "other");
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: codeToRunOnClient }}
    />
  );
}
