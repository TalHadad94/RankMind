// Toggle menu on/off
function toggleMenu() {
  const menu = document.getElementById('main-nav');
  const burger = document.querySelector('.burger-icon');
  menu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
  burger.classList.toggle('open');
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

// Floating buttons
const fabToggle = document.getElementById("fabToggle");
const fabOptions = document.getElementById("fabOptions");

fabToggle.addEventListener("click", () => {
  fabOptions.classList.toggle("show");
});
