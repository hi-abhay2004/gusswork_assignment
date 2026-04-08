/* Interactions */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  heroCarousel();
  zoomPreview();
  faqAccordion();
  industriesCarousel();
  testimonialsCarousel();
  processStepTabs();
  mobileNav();
  contactForm();
});

/* ─────────────────────────────────────────────
   1. HERO IMAGE CAROUSEL
   ───────────────────────────────────────────── */
function heroCarousel() {
  const mainImg = document.getElementById("heroMainImg");
  const thumbBtns = document.querySelectorAll("#heroThumbs .thumb");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  if (!mainImg || !thumbBtns.length) return;

  let current = 0;
  const srcs = Array.from(thumbBtns).map((t) => t.querySelector("img").src);

  function goTo(index) {
    current = (index + srcs.length) % srcs.length;
    mainImg.style.opacity = "0";
    setTimeout(() => {
      mainImg.src = srcs[current];
      mainImg.style.opacity = "1";
    }, 150);
    thumbBtns.forEach((b, i) => b.classList.toggle("active", i === current));
  }

  thumbBtns.forEach((btn, i) => btn.addEventListener("click", () => goTo(i)));
  prevBtn?.addEventListener("click", () => goTo(current - 1));
  nextBtn?.addEventListener("click", () => goTo(current + 1));

  document.addEventListener("keydown", (e) => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
}

/* ─────────────────────────────────────────────
   2. HOVER ZOOM
   ───────────────────────────────────────────── */
function zoomPreview() {
  const wrap = document.getElementById("heroMainWrap");
  const img = document.getElementById("heroMainImg");
  const lens = document.getElementById("zoomLens");
  const preview = document.getElementById("zoomPreview");
  if (!wrap || !img || !lens || !preview) return;

  const ZOOM = 2.5;
  const LSIZE = 150;

  function onMove(e) {
    const rect = wrap.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const half = LSIZE / 2;
    x = Math.max(half, Math.min(x, rect.width - half));
    y = Math.max(half, Math.min(y, rect.height - half));

    lens.style.left = x - half + "px";
    lens.style.top = y - half + "px";

    const bw = rect.width * ZOOM;
    const bh = rect.height * ZOOM;
    const bx = (x / rect.width) * 100;
    const by = (y / rect.height) * 100;
    preview.style.backgroundImage = `url('${img.src}')`;
    preview.style.backgroundSize = `${bw}px ${bh}px`;
    preview.style.backgroundPosition = `${bx}% ${by}%`;
  }

  wrap.addEventListener("mouseenter", () => {
    lens.style.opacity = "1";
    preview.classList.add("visible");
  });
  wrap.addEventListener("mouseleave", () => {
    lens.style.opacity = "0";
    preview.classList.remove("visible");
  });
  wrap.addEventListener("mousemove", onMove);
}

/* ─────────────────────────────────────────────
   3. FAQ ACCORDION
   ───────────────────────────────────────────── */
function faqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const q = item.querySelector(".faq-item__q");
    if (!q) return;
    q.addEventListener("click", () => {
      const open = item.classList.contains("active");
      // close all
      items.forEach((i) => {
        i.classList.remove("active");
        i.querySelector(".faq-item__q")?.setAttribute("aria-expanded", "false");
      });
      // open clicked if it was closed
      if (!open) {
        item.classList.add("active");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ─────────────────────────────────────────────
   4. INDUSTRIES CAROUSEL  (JS transform-based)
   card width = 420, gap = 16  → step = 436
   ───────────────────────────────────────────── */
function industriesCarousel() {
  const track = document.getElementById("industriesTrack");
  const prevBtn = document.getElementById("industryPrev");
  const nextBtn = document.getElementById("industryNext");
  if (!track) return;

  const CARD_W = 420;
  const GAP = 16;
  const STEP = CARD_W + GAP;
  const cards = track.querySelectorAll(".ind-card");
  const visible = Math.floor(1240 / STEP); // ~2 visible at a time
  const maxIdx = Math.max(0, cards.length - visible);
  let idx = 0;

  function update() {
    track.style.transform = `translateX(-${idx * STEP}px)`;
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx >= maxIdx;
  }

  prevBtn?.addEventListener("click", () => {
    idx = Math.max(0, idx - 1);
    update();
  });
  nextBtn?.addEventListener("click", () => {
    idx = Math.min(maxIdx, idx + 1);
    update();
  });

  // Touch / drag
  let startX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? nextBtn?.click() : prevBtn?.click();
    },
    { passive: true },
  );

  update();
}

/* ─────────────────────────────────────────────
   5. TESTIMONIALS CAROUSEL  (draggable + auto)
   ───────────────────────────────────────────── */
function testimonialsCarousel() {
  const track = document.getElementById("testimonialsTrack");
  if (!track) return;

  const STEP = 420 + 24; // card + gap
  const cards = track.querySelectorAll(".testi-card");
  const max = Math.max(0, cards.length - 2);
  let idx = 0;
  let timer;

  function goTo(i) {
    idx = Math.max(0, Math.min(i, max));
    track.style.transform = `translateX(-${idx * STEP}px)`;
  }

  function autoPlay() {
    timer = setInterval(() => {
      goTo(idx < max ? idx + 1 : 0);
    }, 5000);
  }

  function stopAuto() {
    clearInterval(timer);
  }

  // Touch
  let startX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      stopAuto();
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? idx + 1 : idx - 1);
      autoPlay();
    },
    { passive: true },
  );

  autoPlay();
}

/* ─────────────────────────────────────────────
   6. MANUFACTURING PROCESS TABS
   ───────────────────────────────────────────── */
function processStepTabs() {
  const steps = document.querySelectorAll(".process-step");
  const text = document.getElementById("processText");
  const checks = document.getElementById("processChecks");
  if (!steps.length || !text) return;

  const DATA = [
    {
      title: "High-Grade Raw Material Selection",
      desc: "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.",
      checks: ["PE100 grade material", "Optimal molecular weight distribution"],
    },
    {
      title: "Precision Extrusion Process",
      desc: "Advanced single-screw and twin-screw extruders melt and homogenize the HDPE compound, pushing it through an annular die to form the pipe shape.",
      checks: ["Temperature-controlled zones", "Consistent melt flow rate"],
    },
    {
      title: "Controlled Cooling System",
      desc: "Graduated cooling in water baths prevents residual stress and ensures dimensional stability throughout the pipe wall.",
      checks: ["Spray cooling technology", "Immersion bath cooling"],
    },
    {
      title: "Vacuum Sizing & Calibration",
      desc: "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.",
      checks: ["Precise dimensional control", "Wall thickness uniformity"],
    },
    {
      title: "Quality Control & Testing",
      desc: "Every pipe undergoes rigorous testing including hydrostatic pressure, impact resistance, and dimensional verification per IS/ISO standards.",
      checks: [
        "Hydrostatic pressure testing",
        "Impact resistance verification",
      ],
    },
    {
      title: "Marking & Identification",
      desc: "Continuous inkjet marking applies manufacturer details, pipe size, pressure rating, and batch traceability information.",
      checks: ["Batch traceability", "Standard compliance marking"],
    },
    {
      title: "Precision Cutting",
      desc: "Automatic cutting systems cut pipes to specified lengths with clean, square ends ready for fusion welding.",
      checks: ["Auto-length measurement", "Clean square cuts"],
    },
    {
      title: "Packaging & Dispatch",
      desc: "Pipes are bundled, strapped, and prepared for safe transportation to job sites across the country.",
      checks: ["Protected bundling", "Safe transportation ready"],
    },
  ];

  const ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function render(d) {
    text.querySelector("h3").textContent = d.title;
    text.querySelector("p").textContent = d.desc;
    if (checks) {
      checks.innerHTML = d.checks
        .map((c) => `<li>${ICON_SVG}${c}</li>`)
        .join("");
    }
  }

  steps.forEach((step, i) => {
    step.addEventListener("click", () => {
      steps.forEach((s) => {
        s.classList.remove("active");
        s.setAttribute("aria-selected", "false");
      });
      step.classList.add("active");
      step.setAttribute("aria-selected", "true");
      render(DATA[i]);
    });
  });
}

/* ─────────────────────────────────────────────
   7. MOBILE NAV
   ───────────────────────────────────────────── */
function mobileNav() {
  const toggle = document.getElementById("mobileToggle");
  const navbar = document.querySelector(".navbar");
  if (!toggle || !navbar) return;

  toggle.addEventListener("click", () => {
    navbar.classList.toggle("mobile-open");
    const open = navbar.classList.contains("mobile-open");
    toggle.setAttribute("aria-pressed", open);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!navbar.contains(e.target)) {
      navbar.classList.remove("mobile-open");
    }
  });
}

/* ─────────────────────────────────────────────
   8. CONTACT FORM  (basic validation)
   ───────────────────────────────────────────── */
function contactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = "✓ Request Sent!";
    btn.style.background = "#16a34a";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
      form.reset();
    }, 3000);
  });
}
