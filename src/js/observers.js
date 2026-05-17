// Observer API: IntersectionObserver for lazy image loading + infinite scroll (Technical req 2J)

// Lazy-load images: swap data-src -> src when the image enters the viewport
export const setupLazyImages = () => {
  const observer = new IntersectionObserver(
    // Callback function (req 2G) — called when observed elements change visibility
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '100px' }
  );

  // Observe every image that has data-src (not yet loaded)
  document.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img));
};

// Infinite scroll: call onIntersect when the sentinel div enters the viewport
export const setupInfiniteScroll = (sentinel, onIntersect) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Arrow function + ternary (req 2E, 2F)
        if (entry.isIntersecting) onIntersect();
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(sentinel);
  return observer; // returned so caller can disconnect() when needed
};
