/**
 * InsaneLink Tracking Script v1.0.0
 * Used to track landing page views for InsaneLink URL shortener
 * https://github.com/sharanvkt/insanelink-tracking
 */
(function () {
  const API_ENDPOINT = "https://linkmetrics-gamma.vercel.app/api/track";
  const PIXEL_ENDPOINT = "https://linkmetrics-gamma.vercel.app/api/track-pixel";

  const RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000;

  // Main tracking function
  function trackPageView() {
    try {
      // Get tracking parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const visitorId = urlParams.get("insanelink_visitor");
      const linkId = urlParams.get("insanelink_id");

      // Only proceed if we have tracking parameters
      if (!visitorId || !linkId) {
        console.log("InsaneLink: No tracking parameters found in URL");
        return;
      }

      console.log(`InsaneLink: Recording page view for link ${linkId}`);

      // Collect performance and environment data
      const data = {
        visitorId,
        linkId,
        type: "page",
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        // Add performance metrics
        performanceData: {
          pageLoadTime: performance.now(),
          connectionType: navigator.connection
            ? navigator.connection.effectiveType
            : null,
          deviceMemory: navigator.deviceMemory || null,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
        },
      };

      // Send tracking data
      sendData(data, 0);

      // Clean URL parameters after sending data
      cleanUrlParameters();
    } catch (error) {
      console.error("InsaneLink tracking error:", error);
    }
  }

  // Sending data with retry logic and fallbacks
  function sendData(data, attemptCount) {
    // Method 1: Use Navigator.sendBeacon (most reliable for page unloads)
    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });
        const success = navigator.sendBeacon(API_ENDPOINT, blob);

        if (success) {
          console.log(
            "InsaneLink: Successfully tracked page view using Beacon API"
          );
          return;
        }
      } catch (e) {
        console.warn("InsaneLink: Beacon API failed, falling back to fetch", e);
      }
    }

    // Method 2: Fallback to fetch with keepalive
    try {
      console.log(
        "InsaneLink: Attempting to track with fetch API",
        data.linkId
      );

      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true,
        mode: "cors",
        credentials: "omit", // Explicitly omit credentials
      })
        .then((response) => {
          console.log("InsaneLink: Fetch response status:", response.status);
          if (!response.ok) {
            return response.json().then((errData) => {
              throw new Error(
                `HTTP error! status: ${
                  response.status
                }, message: ${JSON.stringify(errData)}`
              );
            });
          }
          return response.json();
        })
        .then((responseData) => {
          console.log(
            "InsaneLink: Successfully tracked page view using fetch",
            responseData
          );
        })
        .catch((error) => {
          console.warn("InsaneLink: Fetch API failed", error);

          // Retry logic
          if (attemptCount < RETRY_ATTEMPTS) {
            setTimeout(() => {
              console.log(
                `InsaneLink: Retrying (${
                  attemptCount + 1
                }/${RETRY_ATTEMPTS})...`
              );
              sendData(data, attemptCount + 1);
            }, RETRY_DELAY * Math.pow(2, attemptCount)); // Exponential backoff
          } else {
            // Method 3: Last resort - image pixel fallback
            usePixelFallback(data);
          }
        });
    } catch (error) {
      console.error("InsaneLink: All tracking methods failed", error);
      usePixelFallback(data);
    }
  }

  // Last resort pixel tracking
  function usePixelFallback(data) {
    try {
      console.log("InsaneLink: Using pixel fallback method");
      // Create a minimal version of the data to fit in URL
      const minimalData = {
        v: data.visitorId,
        l: data.linkId,
        t: Date.now(),
        r: encodeURIComponent(document.referrer).substring(0, 100),
      };

      const pixelUrl = `${PIXEL_ENDPOINT}?d=${encodeURIComponent(
        JSON.stringify(minimalData)
      )}`;
      new Image().src = pixelUrl;
    } catch (e) {
      console.error("InsaneLink: Pixel tracking failed", e);
    }
  }

  // Remove tracking parameters from URL
  function cleanUrlParameters() {
    setTimeout(function () {
      try {
        if (window.history && window.history.replaceState) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("insanelink_visitor");
          cleanUrl.searchParams.delete("insanelink_id");
          // Keep other parameters intact
          window.history.replaceState({}, document.title, cleanUrl.toString());
          console.log("InsaneLink: Cleaned URL parameters");
        }
      } catch (e) {
        console.error("InsaneLink: URL cleaning error:", e);
      }
    }, 500); // Give tracking enough time to complete
  }

  // Run tracking as soon as reasonable
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackPageView);
  } else {
    // Page already loaded, run immediately
    trackPageView();
  }

  // Track if the page becomes visible after being hidden
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      trackPageView();
    }
  });
})();
