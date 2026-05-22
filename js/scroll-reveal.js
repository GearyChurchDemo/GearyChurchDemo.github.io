function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]:not(.is-visible)');
  if (!els.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  );

  els.forEach(el => obs.observe(el));
}

function initWordStagger() {
  const h2 = document.querySelector('.creator-banner h2');
  if (!h2) return;

  const accentWords = ['House', 'of', 'Prayer'];
  const text = h2.textContent;
  const tokens = text.split(/(\s+)/);
  let i = 0;

  h2.innerHTML = tokens.map(token => {
    if (/^\s+$/.test(token)) return token;
    const isAccent = accentWords.some(a => token.toLowerCase().includes(a.toLowerCase()));
    const cls = isAccent ? 'w accent' : 'w';
    return `<span class="${cls}" style="--i:${i++}">${token}</span>`;
  }).join('');

  if (typeof IntersectionObserver === 'undefined') {
    h2.classList.add('is-visible');
    return;
  }

  const obs = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  );

  obs.observe(h2);
}
