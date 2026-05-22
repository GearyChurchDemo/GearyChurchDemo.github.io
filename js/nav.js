function initNav() {
  const brand = document.querySelector('.nav-brand');
  const giveCta = document.querySelector('.nav-cta');

  if (brand) {
    brand.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  if (giveCta) {
    giveCta.addEventListener('click', () => {
      window.location.href = 'give.html';
    });
  }

  const page = window.location.pathname.includes('give') ? 'give' : 'home';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}
