/* ============================================================
   THE SPIRIT HUB — script.js
   Handles: cursor, particles, nav scroll, reveal animations,
            stat counters, topic selection, form submission,
            mobile menu
   ============================================================ */

"use strict";

// ─── CUSTOM CURSOR ─────────────────────────────────────────────
(function initCursor() {
  const dot = document.getElementById("cursorDot");
  const aura = document.getElementById("cursorAura");
  if (!dot || !aura) return;

  let mouseX = 0, mouseY = 0;
  let auraX = 0, auraY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  // Laggy aura for smooth trailing effect
  function animateAura() {
    auraX += (mouseX - auraX) * 0.1;
    auraY += (mouseY - auraY) * 0.1;
    aura.style.left = auraX + "px";
    aura.style.top = auraY + "px";
    requestAnimationFrame(animateAura);
  }
  animateAura();

  // Grow on interactive elements
  const interactables = "a, button, .topic-card, .feature-card, .event-row, .testimonial";
  document.querySelectorAll(interactables).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dot.style.transform = "translate(-50%, -50%) scale(2.5)";
      dot.style.background = "var(--gold-light)";
      aura.style.width = "64px";
      aura.style.height = "64px";
      aura.style.borderColor = "var(--gold)";
    });
    el.addEventListener("mouseleave", () => {
      dot.style.transform = "translate(-50%, -50%) scale(1)";
      dot.style.background = "var(--gold)";
      aura.style.width = "40px";
      aura.style.height = "40px";
      aura.style.borderColor = "var(--gold-dim)";
    });
  });
})();


// ─── AMBIENT PARTICLES ─────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  // Create particles
  function createParticles() {
    const count = Math.floor((W * H) / 18000); // density based on screen
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.2 - 0.05,  // drift upward slowly
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p) => {
      // pulsing alpha
      p.pulse += 0.012;
      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
      ctx.fill();

      // move
      p.x += p.vx;
      p.y += p.vy;

      // wrap
      if (p.y < -4) p.y = H + 4;
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();
})();


// ─── STICKY NAV SCROLL ─────────────────────────────────────────
(function initNav() {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  });
})();


// ─── JOIN DROPDOWN ─────────────────────────────────────────────
(function initJoinDropdown() {
  const joinBtn = document.getElementById("joinBtn");
  const dropdown = document.getElementById("joinDropdown");
  if (!joinBtn || !dropdown) return;

  joinBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== joinBtn) {
      dropdown.classList.remove("open");
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dropdown.classList.remove("open");
  });
})();


// ─── MOBILE MENU ───────────────────────────────────────────────
(function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  // Close on link click
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => menu.classList.remove("open"));
  });
})();


// ─── SCROLL REVEAL ─────────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll(
    ".reveal-fade, .reveal-up, .reveal-left, .reveal-right"
  );

  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => observer.observe(el));
})();


// ─── ANIMATED STAT COUNTERS ────────────────────────────────────
(function initCounters() {
  const statEls = document.querySelectorAll(".stat-value[data-target]");
  if (!statEls.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);

      // Format with + if >= 1000
      el.textContent = target >= 1000
        ? value.toLocaleString() + "+"
        : value + (el.dataset.suffix || "");

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statEls.forEach((el) => {
    el.textContent = "0";
    observer.observe(el);
  });
})();


// ─── TOPIC CARDS ───────────────────────────────────────────────
(function initTopics() {
  const cards = document.querySelectorAll(".topic-card");
  const previewName = document.getElementById("topicName");
  if (!cards.length || !previewName) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // Remove active from all
      cards.forEach((c) => c.classList.remove("active"));
      // Activate clicked
      card.classList.add("active");
      // Update preview label with transition
      const topic = card.dataset.topic;
      previewName.style.opacity = "0";
      previewName.style.transform = "translateY(6px)";
      setTimeout(() => {
        previewName.textContent = topic;
        previewName.style.transition = "opacity 0.3s, transform 0.3s";
        previewName.style.opacity = "1";
        previewName.style.transform = "translateY(0)";
      }, 200);
    });
  });
})();


// ─── CTA FORM ──────────────────────────────────────────────────
(function initForm() {
  const form = document.getElementById("ctaForm");
  const submitBtn = document.getElementById("submitBtn");
  const successMsg = document.getElementById("successMsg");
  const nameInput = document.getElementById("nameInput");
  const emailInput = document.getElementById("emailInput");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
      shakeBtnError(submitBtn);
      return;
    }

    if (!isValidEmail(email)) {
      shakeBtnError(submitBtn);
      emailInput.style.borderColor = "var(--ember)";
      setTimeout(() => (emailInput.style.borderColor = ""), 1200);
      return;
    }

    // Simulate async submit
    const btnText = submitBtn.querySelector(".btn-text");
    btnText.textContent = "Joining...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";

    setTimeout(() => {
      form.style.display = "none";
      successMsg.classList.add("visible");
      // Confetti-like sparkle
      sparkle(successMsg);
    }, 1200);
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeBtnError(btn) {
    btn.style.animation = "none";
    btn.offsetHeight; // reflow
    btn.style.animation = "shake 0.4s ease";
    setTimeout(() => (btn.style.animation = ""), 500);
  }

  // Inject shake keyframe if not present
  if (!document.querySelector("#shakeStyle")) {
    const style = document.createElement("style");
    style.id = "shakeStyle";
    style.textContent = `
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }

  function sparkle(container) {
    const colors = ["#60a5fa", "#93c5fd", "#8b5cf6", "#f8fafc"];
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement("span");
      dot.style.cssText = `
        position: absolute;
        width: ${Math.random() * 6 + 3}px;
        height: ${Math.random() * 6 + 3}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        top: 50%; left: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
        animation: sparkle-fly ${Math.random() * 0.6 + 0.5}s ease-out forwards;
        --dx: ${(Math.random() - 0.5) * 140}px;
        --dy: ${(Math.random() - 0.5) * 100}px;
      `;
      container.appendChild(dot);
      setTimeout(() => dot.remove(), 1200);
    }

    if (!document.querySelector("#sparkleStyle")) {
      const style = document.createElement("style");
      style.id = "sparkleStyle";
      style.textContent = `
        @keyframes sparkle-fly {
          to {
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy)));
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
})();


// ─── SMOOTH ANCHOR SCROLL ──────────────────────────────────────
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // header height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();


// ─── PARALLAX HERO BG TEXT ─────────────────────────────────────
(function initParallax() {
  const bgText = document.querySelector(".hero-bg-text");
  if (!bgText) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    bgText.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.25}px))`;
  }, { passive: true });
})();


// ─── FEATURE CARD TILT ─────────────────────────────────────────
(function initTilt() {
  const cards = document.querySelectorAll(".feature-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * 4;  // degrees
      const tiltY = -dx * 4;

      card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(600px) rotateX(0) rotateY(0)";
    });
  });
})();


// ─── MEMBER SEARCH & FILTERS ───────────────────────────────────
(function initMemberDirectory() {
  const searchInput = document.getElementById("memberSearch");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const memberCards = document.querySelectorAll(".member-card");
  if (!searchInput || !memberCards.length) return;

  // Category mapping for filter buttons
  const categoryMap = {
    "All": null,
    "Engineering": ["#Rust", "#Distributed", "#React", "#NodeJS", "#Kubernetes", "#AWS", "#CI/CD", "#Web3"],
    "Design": ["#DesignSystems", "#Figma", "#Accessibility", "#UI", "#UX"],
    "AI/ML": ["#MachineLearning", "#PyTorch", "#Ethics", "#Python", "#Analytics", "#Dataviz"],
    "Open Source": ["#OpenSource"],
  };

  let activeFilter = "All";

  function filterCards() {
    const query = searchInput.value.toLowerCase().trim();

    memberCards.forEach((card) => {
      const name = card.querySelector(".member-name")?.textContent.toLowerCase() || "";
      const role = card.querySelector(".member-role")?.textContent.toLowerCase() || "";
      const tags = Array.from(card.querySelectorAll(".member-tags span")).map(t => t.textContent.toLowerCase());
      const bio = card.querySelector(".member-bio")?.textContent.toLowerCase() || "";
      const allText = name + " " + role + " " + tags.join(" ") + " " + bio;

      // Search match
      const matchesSearch = !query || allText.includes(query);

      // Filter match
      let matchesFilter = true;
      if (activeFilter !== "All" && categoryMap[activeFilter]) {
        const filterTags = categoryMap[activeFilter].map(t => t.toLowerCase());
        matchesFilter = tags.some(tag => filterTags.includes(tag)) ||
          filterTags.some(ft => role.includes(ft.replace("#", "").toLowerCase()));
      }

      card.style.display = matchesSearch && matchesFilter ? "" : "none";
    });
  }

  searchInput.addEventListener("input", filterCards);

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.textContent.trim();
      filterCards();
    });
  });

  // Pagination active state
  const pageBtns = document.querySelectorAll(".page-btn:not(.next)");
  pageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pageBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
})();


// ─── CONSOLE EASTER EGG ────────────────────────────────────────
console.log(
  "%c✦ The Spirit Hub",
  "font-size:22px; font-family: Georgia, serif; color: #60a5fa;"
);
console.log(
  "%cBuilt for the curious minds of the world.\nWant to join our team? hello@spirithub.dev",
  "color: #7a7060; font-size: 12px;"
);
