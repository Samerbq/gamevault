
// lazy load image algorithm ( ts so peak )

export const setupLazyImages = () => {
  const observer = new IntersectionObserver(
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

  document.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img));
};

export const setupInfiniteScroll = (sentinel, onIntersect) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onIntersect();
      });
    },
    { rootMargin: '200px' }
  );

  observer.observe(sentinel);
  return observer;
};
