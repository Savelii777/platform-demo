"use client";

import { useState, useEffect, useRef } from "react";

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    const startFadeOut = () => {
      setTimeout(() => setFadeOut(true), 200);
      setTimeout(() => setVisible(false), 900);
    };

    // Fade out when video ends
    const onVideoEnd = () => startFadeOut();

    if (video) {
      video.addEventListener("ended", onVideoEnd);
    }

    // Fallback: also check page load for slow connections
    const onPageLoad = () => {
      // If video already ended, skip. Otherwise wait for it.
      if (video && video.ended) {
        startFadeOut();
      }
    };

    if (document.readyState === "complete") {
      // Page already loaded — video will handle fade out
    } else {
      window.addEventListener("load", onPageLoad);
    }

    // Hard fallback: hide after 6s no matter what
    const fallback = setTimeout(startFadeOut, 6000);

    return () => {
      if (video) video.removeEventListener("ended", onVideoEnd);
      window.removeEventListener("load", onPageLoad);
      clearTimeout(fallback);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-700 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <video
        ref={videoRef}
        src="/preloader.mp4"
        autoPlay
        muted
        playsInline
        className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
      />
    </div>
  );
}
