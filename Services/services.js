document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.service-card');
  const details = document.querySelectorAll('.service-detail');

  // Toggle cards
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-service');

      details.forEach(detail => {
        const relatedCard = document.querySelector(`.service-card[data-service="${detail.id}"]`);
        if (detail.id === targetId) {
          detail.classList.toggle('active');
          relatedCard?.classList.toggle('active');
        } else {
          detail.classList.remove('active');
          relatedCard?.classList.remove('active');
        }
      });
    });
  });

  // Toggle bullets
  const bullets = document.querySelectorAll('[data-bullet]');
  bullets.forEach(bullet => {
    const header = bullet.querySelector('.bullet-header');
    header.addEventListener('click', () => {
      bullet.classList.toggle('active');
    });
  });
});
