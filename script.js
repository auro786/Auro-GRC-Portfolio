// ═══════════════════════════════════════════
// NAVBAR — scroll shadow + active section
// ═══════════════════════════════════════════
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 10);

  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 90) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ═══════════════════════════════════════════
// MOBILE MENU
// ═══════════════════════════════════════════
const navToggle  = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => navLinksEl.classList.toggle('open'));
navLinksEl.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

// ═══════════════════════════════════════════
// HEADSHOT FALLBACK
// ═══════════════════════════════════════════
const headshot    = document.getElementById('headshot');
const placeholder = document.getElementById('photoPlaceholder');

if (headshot) {
  headshot.addEventListener('error', () => {
    headshot.style.display = 'none';
    placeholder.style.display = 'flex';
  });
}

// ═══════════════════════════════════════════
// FADE-IN ON SCROLL
// ═══════════════════════════════════════════
const fadeEls = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;

    // For cards inside a grid, stagger only if multiple siblings
    // enter the viewport in the same observer batch (same frame)
    // Otherwise just trigger immediately — no artificial delay
    const parent = el.parentElement;
    const gridChildren = Array.from(parent.children).filter(
      c => c.classList.contains('fade-in')
    );
    const index = gridChildren.indexOf(el);

    // Only stagger within a 2-card row (index 0 and 1).
    // Wide single cards and solo cards get no delay.
    const isSingleRow = el.classList.contains('beyond-card--wide');
    const delay = isSingleRow ? 0 : index * 80;

    setTimeout(() => el.classList.add('visible'), delay);
    fadeObserver.unobserve(el);
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -24px 0px'
});

fadeEls.forEach(el => fadeObserver.observe(el));

// ═══════════════════════════════════════════
// HELPERS — lock/unlock body scroll
// ═══════════════════════════════════════════
function lockScroll()   { document.body.style.overflow = 'hidden'; }
function unlockScroll() { document.body.style.overflow = ''; }

// ═══════════════════════════════════════════
// PHOTO LIGHTBOX
// ═══════════════════════════════════════════
const lightbox        = document.getElementById('lightbox');
const lightboxBackdrop= document.getElementById('lightboxBackdrop');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');

let photoSet   = [];   // all photo srcs in current group
let photoIndex = 0;    // current index within set

function openLightbox(srcs, startIndex, altText) {
  photoSet   = srcs;
  photoIndex = startIndex;
  showPhoto(altText);
  lightbox.classList.add('open');
  lightboxBackdrop.classList.add('open');
  lockScroll();
}

function showPhoto(alt) {
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src         = photoSet[photoIndex];
    lightboxImg.alt         = alt || '';
    lightboxImg.style.opacity = '1';
  }, 120);

  // Show/hide arrows
  lightboxPrev.style.display = photoSet.length > 1 ? 'flex' : 'none';
  lightboxNext.style.display = photoSet.length > 1 ? 'flex' : 'none';
  lightboxCounter.textContent = photoSet.length > 1
    ? `${photoIndex + 1} / ${photoSet.length}`
    : '';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxBackdrop.classList.remove('open');
  unlockScroll();
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxBackdrop.addEventListener('click', closeLightbox);

lightboxPrev.addEventListener('click', () => {
  photoIndex = (photoIndex - 1 + photoSet.length) % photoSet.length;
  showPhoto();
});

lightboxNext.addEventListener('click', () => {
  photoIndex = (photoIndex + 1) % photoSet.length;
  showPhoto();
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   { photoIndex = (photoIndex - 1 + photoSet.length) % photoSet.length; showPhoto(); }
  if (e.key === 'ArrowRight')  { photoIndex = (photoIndex + 1) % photoSet.length; showPhoto(); }
});

// Touch/swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) photoIndex = (photoIndex + 1) % photoSet.length;
    else        photoIndex = (photoIndex - 1 + photoSet.length) % photoSet.length;
    showPhoto();
  }
});

// Wire up all photo triggers — group by parent .beyond-card
document.querySelectorAll('.beyond-card').forEach(card => {
  const photos = Array.from(card.querySelectorAll('.photo-trigger'));
  const srcs   = photos.map(img => img.dataset.src || img.src);

  photos.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => {
      openLightbox(srcs, i, img.alt);
    });
  });
});

// ═══════════════════════════════════════════
// PDF MODAL
// ═══════════════════════════════════════════
const pdfModal      = document.getElementById('pdfModal');
const pdfBackdrop   = document.getElementById('pdfBackdrop');
const pdfModalClose = document.getElementById('pdfModalClose');
const pdfModalTitle = document.getElementById('pdfModalTitle');
const pdfViewBtn    = document.getElementById('pdfViewBtn');
const pdfDownloadBtn= document.getElementById('pdfDownloadBtn');

function openPdfModal(pdfPath, title) {
  pdfModalTitle.textContent  = title;
  pdfViewBtn.href            = pdfPath;
  pdfDownloadBtn.href        = pdfPath;
  pdfDownloadBtn.setAttribute('download', title + '.pdf');
  pdfModal.classList.add('open');
  pdfBackdrop.classList.add('open');
  lockScroll();
}

function closePdfModal() {
  pdfModal.classList.remove('open');
  pdfBackdrop.classList.remove('open');
  unlockScroll();
}

pdfModalClose.addEventListener('click', closePdfModal);
pdfBackdrop.addEventListener('click', closePdfModal);

document.addEventListener('keydown', e => {
  if (pdfModal.classList.contains('open') && e.key === 'Escape') closePdfModal();
});

// Wire up all pdf-trigger links
document.querySelectorAll('.pdf-trigger').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    openPdfModal(link.dataset.pdf, link.dataset.title);
  });
});