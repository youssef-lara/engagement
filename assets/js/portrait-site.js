(() => {
  document.documentElement.classList.add('motion');
  const scenes = [...document.querySelectorAll('[data-scene]')];
  // Each embedded map costs about 430kB of Google's own scripts and tiles, and
  // the browser was fetching all three before the guest had scrolled at all.
  // Hand them their address as their own page comes into view instead.
  const loadMaps = scene => {
    scene.querySelectorAll('iframe[data-src]').forEach(frame => {
      frame.src = frame.dataset.src;
      frame.removeAttribute('data-src');
    });
  };

  const playScene = async scene => {
    loadMaps(scene);
    // Decode each scene's local layers before starting its entrance sequence.
    await Promise.allSettled([...scene.querySelectorAll('img')].map(image => {
      image.loading = 'eager';
      return image.decode();
    }));
    await document.fonts.ready;
    scene.classList.add('play');
    // Marks the end of the entrance, so a replay control can wait for its turn.
    clearTimeout(scene.settleTimer);
    scene.settleTimer = setTimeout(() => scene.classList.add('settled'), 4600);
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        playScene(entry.target);
        observer.unobserve(entry.target);
      }
    }, { threshold: .18, rootMargin: '8% 0px -8% 0px' });
    scenes.forEach(scene => observer.observe(scene));
  } else scenes.forEach(playScene);
  if (scenes[0]) playScene(scenes[0]);

  // Let the envelope be opened again: drop the class, force a reflow so the
  // animations are rewound rather than continued, and start the sequence over.
  document.querySelectorAll('[data-replay]').forEach(button => {
    button.addEventListener('click', () => {
      const scene = button.closest('[data-scene]');
      if (!scene) return;
      scene.classList.remove('play', 'settled');
      void scene.offsetWidth;
      requestAnimationFrame(() => playScene(scene));
    });
  });

  const target = new Date('2026-10-01T19:00:00+03:00').getTime();
  // The Arabic edition writes its figures in Arabic-Indic numerals, so the two
  // digits come from Intl rather than from padding an ASCII string. English is
  // unchanged: the Latin formatter pads to the same two places.
  const digits = new Intl.NumberFormat(
    document.body.dataset.language === 'ar' ? 'ar-EG-u-nu-arab' : 'en',
    { minimumIntegerDigits: 2, useGrouping: false }
  );
  function tick() {
    const remaining = Math.max(0, target - Date.now());
    const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
    ['cdD','cdH','cdM','cdS'].forEach((id, i) => { const cell = document.getElementById(id); if (cell) cell.textContent = digits.format(values[i]); });
  }
  tick();
  setInterval(tick, 1000);

})();
