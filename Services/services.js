document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.service-card');
  const details = document.querySelectorAll('.service-detail');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-service');

      details.forEach(detail => {
        if (detail.id === targetId) {
          detail.classList.toggle('active');
        } else {
          detail.classList.remove('active');
        }
      });
    });
  });
});
