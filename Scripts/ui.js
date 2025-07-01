// Toggle menu on/off
function toggleMenu() {
  document.getElementById('side-menu').classList.toggle('open');
}

// Fading effect
document.addEventListener("DOMContentLoaded", () => {
  const fadeEls = document.querySelectorAll(".scroll-fade");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => observer.observe(el));
});
