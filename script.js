// ═══════════════════════════════════════════
// NAVBAR — scroll shadow + active section
// ═══════════════════════════════════════════
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  // Add shadow when scrolled
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Highlight active nav link
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 90;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load

// ═══════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});

// Close menu when a link is clicked
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
  });
});

// ═══════════════════════════════════════════
// HEADSHOT — hide img if not found, show placeholder
// ═══════════════════════════════════════════
const headshot = document.getElementById('headshot');
const placeholder = document.getElementById('photoPlaceholder');

if (headshot) {
  headshot.addEventListener('error', () => {
    headshot.style.display = 'none';
    placeholder.style.display = 'flex';
  });
}

// ═══════════════════════════════════════════
// FADE-IN ON SCROLL (Intersection Observer)
// ═══════════════════════════════════════════
const fadeEls = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings slightly
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.fade-in'));
      const index = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 60);
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

fadeEls.forEach(el => observer.observe(el));
