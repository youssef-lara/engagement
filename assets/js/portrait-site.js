(() => {
  document.documentElement.classList.add('motion');
  const scenes = [...document.querySelectorAll('[data-scene]')];
  const playScene = async scene => {
    // Decode each scene's local layers before starting its entrance sequence.
    await Promise.allSettled([...scene.querySelectorAll('img')].map(image => {
      image.loading = 'eager';
      return image.decode();
    }));
    await document.fonts.ready;
    scene.classList.add('play');
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

  const target = new Date('2026-10-01T19:00:00+03:00').getTime();
  function tick() {
    const remaining = Math.max(0, target - Date.now());
    const values = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
    ['cdD','cdH','cdM','cdS'].forEach((id, i) => { document.getElementById(id).textContent = String(values[i]).padStart(2,'0'); });
  }
  tick();
  setInterval(tick, 1000);

  const dialog = document.querySelector('.rsvp-dialog');
  const trigger = document.querySelector('[data-open-rsvp]');
  trigger.addEventListener('click', () => dialog.showModal());
  document.querySelector('[data-close-rsvp]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => trigger.focus({ preventScroll: true }));
})();
