(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal = document.querySelectorAll('.motion-reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.16 });
    reveal.forEach(el => observer.observe(el));
  } else reveal.forEach(el => el.classList.add('is-visible'));
  const parallax = document.querySelector('.motion-parallax');
  if (parallax && !reduce) {
    let ticking = false;
    const update = () => {
      const rect = parallax.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height) - .5));
      const depth = Number(parallax.dataset.depth || .15);
      parallax.style.transform = 'translate3d(0,' + (progress * depth * 180) + 'px,0) rotate(' + (progress * 5) + 'deg)';
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }
})();