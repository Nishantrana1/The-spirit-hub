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
(async function initCounters() {
  const statEls = document.querySelectorAll(".stat-value[data-target]");
  if (!statEls.length) return;

  // Auto-sync member count from members page
  try {
    const membersEl = Array.from(statEls).find(
      el => el.nextElementSibling?.textContent.trim() === "Members"
    );
    if (membersEl) {
      const basePath = window.location.pathname.includes("/pages/")
        ? "members.html"
        : "pages/members.html";
      const res = await fetch(basePath);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const count = doc.querySelectorAll(".member-card").length;
      if (count > 0) membersEl.dataset.target = count;
    }
  } catch (e) { /* fallback to hardcoded value */ }

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


// ─── MEMBER SEARCH, FILTERS & PAGINATION ────────────────────────
(function initMemberDirectory() {
  const searchInput = document.getElementById("memberSearch");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const allCards = Array.from(document.querySelectorAll(".member-card"));
  const paginationEl = document.getElementById("membersPagination");
  if (!searchInput || !allCards.length) return;

  const PER_PAGE = 10;
  let activeFilter = "All";
  let currentPage = 1;

  const categoryMap = {
    "All": null,
    "Engineering": ["#rust", "#distributed", "#react", "#nodejs", "#node.js", "#kubernetes", "#aws", "#ci/cd", "#web3", "#docker", "#mern", "#typescript", "#flutter", "#dart", "#linux", "#networking", "#azure"],
    "Design": ["#designsystems", "#figma", "#accessibility", "#ui", "#ux", "#design", "#css"],
    "AI/ML": ["#machinelearning", "#pytorch", "#tensorflow", "#nlp", "#deeplearning", "#computervision", "#python", "#analytics", "#dataviz", "#sql"],
    "Open Source": ["#opensource", "#github"],
  };

  // Get cards that match current search + filter
  function getVisibleCards() {
    const query = searchInput.value.toLowerCase().trim();
    return allCards.filter((card) => {
      const name = (card.querySelector(".member-name")?.textContent || "").toLowerCase();
      const role = (card.querySelector(".member-role")?.textContent || "").toLowerCase();
      const tags = Array.from(card.querySelectorAll(".member-tags span")).map(t => t.textContent.toLowerCase());
      const bio = (card.querySelector(".member-bio")?.textContent || "").toLowerCase();
      const allText = name + " " + role + " " + tags.join(" ") + " " + bio;

      const matchesSearch = !query || allText.includes(query);

      let matchesFilter = true;
      if (activeFilter !== "All" && categoryMap[activeFilter]) {
        const filterTags = categoryMap[activeFilter];
        matchesFilter = tags.some(tag => filterTags.includes(tag)) ||
          filterTags.some(ft => role.includes(ft.replace("#", "")));
      }
      return matchesSearch && matchesFilter;
    });
  }

  function renderPage() {
    const visible = getVisibleCards();
    const totalPages = Math.ceil(visible.length / PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;
    const pageCards = visible.slice(start, end);

    // Hide all, then show only current page
    allCards.forEach(c => c.style.display = "none");
    pageCards.forEach(c => c.style.display = "");

    // Build pagination
    paginationEl.innerHTML = "";
    if (totalPages <= 1) return; // No pagination needed

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "page-btn" + (i === currentPage ? " active" : "");
      btn.textContent = i;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderPage();
        // Scroll to top of grid
        document.getElementById("membersGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      paginationEl.appendChild(btn);
    }

    if (currentPage < totalPages) {
      const next = document.createElement("button");
      next.className = "page-btn next";
      next.textContent = "Next →";
      next.addEventListener("click", () => {
        currentPage++;
        renderPage();
        document.getElementById("membersGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      paginationEl.appendChild(next);
    }
  }

  searchInput.addEventListener("input", () => { currentPage = 1; renderPage(); });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.textContent.trim();
      currentPage = 1;
      renderPage();
    });
  });

  // Initial render
  renderPage();
})();


// ─── PROFILE MODAL ─────────────────────────────────────────────
(function initProfileModal() {
  const overlay = document.getElementById("profileOverlay");
  const closeBtn = document.getElementById("profileClose");
  if (!overlay) return;

  function openModal(card) {
    const name = card.querySelector(".member-name")?.textContent || "";
    const role = card.querySelector(".member-role")?.textContent || "";
    const bio = card.querySelector(".member-bio")?.textContent || "";
    const avatar = card.querySelector(".member-avatar")?.textContent || "";
    const tags = Array.from(card.querySelectorAll(".member-tags span")).map(t => t.textContent);
    const cover = card.querySelector(".member-cover");
    const coverStyle = cover ? window.getComputedStyle(cover).background : "";

    document.getElementById("profileName").textContent = name;
    document.getElementById("profileRole").textContent = role;
    document.getElementById("profileBio").textContent = bio;
    document.getElementById("profileAvatar").textContent = avatar;

    // Copy cover gradient
    const profileCover = document.getElementById("profileCover");
    if (coverStyle) profileCover.style.background = coverStyle;

    // Build tags
    const tagsEl = document.getElementById("profileTags");
    tagsEl.innerHTML = "";
    tags.forEach(t => {
      const span = document.createElement("span");
      span.textContent = t;
      tagsEl.appendChild(span);
    });

    overlay.classList.add("open");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  // Delegate click on all "View Profile" links
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".member-link");
    if (link) {
      e.preventDefault();
      const card = link.closest(".member-card");
      if (card) openModal(card);
    }
  });

  closeBtn?.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
})();


// ─── NEWS SEARCH, FILTER & PAGINATION ──────────────────────────
(function initNewsPage() {
  const searchInput = document.getElementById("newsSearch");
  const filterBtns = document.querySelectorAll(".news-hero .filter-btn");
  const allCards = Array.from(document.querySelectorAll(".news-card"));
  const paginationEl = document.getElementById("newsPagination");
  if (!searchInput || !allCards.length) return;

  const PER_PAGE = 6;
  let activeCategory = "All";
  let currentPage = 1;

  function getVisibleCards() {
    const query = searchInput.value.toLowerCase().trim();
    return allCards.filter((card) => {
      const title = (card.querySelector(".news-title")?.textContent || "").toLowerCase();
      const summary = (card.querySelector(".news-summary")?.textContent || "").toLowerCase();
      const badge = (card.querySelector(".news-badge")?.textContent || "").toLowerCase();
      const category = card.dataset.category || "";
      const allText = title + " " + summary + " " + badge;

      const matchesSearch = !query || allText.includes(query);
      const matchesFilter = activeCategory === "All" || category === activeCategory;
      return matchesSearch && matchesFilter;
    });
  }

  function renderPage() {
    const visible = getVisibleCards();
    const totalPages = Math.ceil(visible.length / PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * PER_PAGE;
    const pageCards = visible.slice(start, start + PER_PAGE);

    allCards.forEach(c => c.style.display = "none");
    pageCards.forEach(c => c.style.display = "");

    paginationEl.innerHTML = "";
    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.className = "page-btn" + (i === currentPage ? " active" : "");
      btn.textContent = i;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderPage();
        document.getElementById("newsGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      paginationEl.appendChild(btn);
    }

    if (currentPage < totalPages) {
      const next = document.createElement("button");
      next.className = "page-btn next";
      next.textContent = "Next →";
      next.addEventListener("click", () => {
        currentPage++;
        renderPage();
        document.getElementById("newsGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      paginationEl.appendChild(next);
    }
  }

  searchInput.addEventListener("input", () => { currentPage = 1; renderPage(); });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category || btn.textContent.trim();
      currentPage = 1;
      renderPage();
    });
  });

  renderPage();
})();


// ─── SPIRIT EYE TRACKING ───────────────────────────────────────
(function initSpiritEyes() {
  const leftEye = document.getElementById("spiritLeftEye");
  const rightEye = document.getElementById("spiritRightEye");
  const spiritContainer = document.getElementById("spiritContainer");
  const spiritSvg = document.getElementById("spiritSvg");
  if (!leftEye || !rightEye || !spiritContainer || !spiritSvg) return;

  // Eye center positions in SVG coordinates
  const LEFT_EYE_CX = 120, LEFT_EYE_CY = 155;
  const RIGHT_EYE_CX = 180, RIGHT_EYE_CY = 155;
  const MAX_OFFSET = 8; // max pixels the pupil can move within socket

  let cursorX = 0, cursorY = 0;
  let isHeroVisible = true;
  let currentLeftX = 0, currentLeftY = 0;
  let currentRightX = 0, currentRightY = 0;

  document.addEventListener("mousemove", (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
  });

  // Only track when hero is in view for performance
  const heroSection = document.getElementById("home");
  if (heroSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(heroSection);
  }

  function getEyeScreenPos(svgCx, svgCy) {
    // Convert SVG coordinates to screen coordinates
    const svgRect = spiritSvg.getBoundingClientRect();
    const viewBox = spiritSvg.viewBox.baseVal;
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;
    return {
      x: svgRect.left + svgCx * scaleX,
      y: svgRect.top + svgCy * scaleY
    };
  }

  function calcOffset(eyeScreenX, eyeScreenY) {
    const dx = cursorX - eyeScreenX;
    const dy = cursorY - eyeScreenY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: 0, y: 0 };
    // Scale offset proportionally but cap at MAX_OFFSET
    const clampedDist = Math.min(dist, 300); // beyond 300px => full offset
    const ratio = (clampedDist / 300) * MAX_OFFSET;
    return {
      x: (dx / dist) * ratio,
      y: (dy / dist) * ratio
    };
  }

  function animate() {
    if (isHeroVisible) {
      const leftScreen = getEyeScreenPos(LEFT_EYE_CX, LEFT_EYE_CY);
      const rightScreen = getEyeScreenPos(RIGHT_EYE_CX, RIGHT_EYE_CY);

      const leftOffset = calcOffset(leftScreen.x, leftScreen.y);
      const rightOffset = calcOffset(rightScreen.x, rightScreen.y);

      // Smooth lerp for buttery movement
      currentLeftX += (leftOffset.x - currentLeftX) * 0.12;
      currentLeftY += (leftOffset.y - currentLeftY) * 0.12;
      currentRightX += (rightOffset.x - currentRightX) * 0.12;
      currentRightY += (rightOffset.y - currentRightY) * 0.12;

      leftEye.setAttribute("transform",
        `translate(${currentLeftX.toFixed(2)}, ${currentLeftY.toFixed(2)})`);
      rightEye.setAttribute("transform",
        `translate(${currentRightX.toFixed(2)}, ${currentRightY.toFixed(2)})`);
    }
    requestAnimationFrame(animate);
  }

  animate();
})();


// ─── SPIRIT HEAD-RUB BLUSH ─────────────────────────────────────
(function initSpiritBlush() {
  const spiritContainer = document.getElementById("spiritContainer");
  const headZone = document.getElementById("spiritHeadZone");
  const hearts = [
    document.getElementById("spiritHeart1"),
    document.getElementById("spiritHeart2"),
    document.getElementById("spiritHeart3"),
  ];
  if (!spiritContainer || !headZone) return;

  let rubCount = 0;
  let lastX = 0;
  let lastY = 0;
  let lastDir = 0; // track direction changes for "rubbing" detection
  let isBlushing = false;
  let blushTimeout = null;
  let heartInterval = null;

  // Detect rubbing = rapid back-and-forth movement over head
  headZone.addEventListener("mousemove", (e) => {
    const dx = e.movementX || (e.clientX - lastX);
    const dy = e.movementY || (e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;

    // Detect direction change (rubbing = changing horizontal direction)
    const currentDir = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    if (currentDir !== 0 && currentDir !== lastDir) {
      rubCount += 2; // direction change = rubbing motion
      lastDir = currentDir;
    } else {
      rubCount += 0.3;
    }

    // Threshold to start blushing
    if (rubCount >= 8 && !isBlushing) {
      startBlush();
    }

    // Reset fade timer on continued rubbing
    if (isBlushing) {
      clearTimeout(blushTimeout);
      blushTimeout = setTimeout(stopBlush, 1500);
    }
  });

  headZone.addEventListener("mouseleave", () => {
    rubCount = 0;
    lastDir = 0;
    if (isBlushing) {
      clearTimeout(blushTimeout);
      blushTimeout = setTimeout(stopBlush, 1500);
    }
  });

  function startBlush() {
    isBlushing = true;
    spiritContainer.classList.add("spirit-blushing");

    // Spawn hearts periodically
    spawnHearts();
    heartInterval = setInterval(spawnHearts, 800);

    // Set timeout to stop
    blushTimeout = setTimeout(stopBlush, 1500);
  }

  function stopBlush() {
    isBlushing = false;
    rubCount = 0;
    spiritContainer.classList.remove("spirit-blushing");
    clearInterval(heartInterval);
    heartInterval = null;

    // Reset hearts
    hearts.forEach((h) => {
      if (h) {
        h.classList.remove("spirit-heart-float");
        h.style.fill = "rgba(255,120,150,0)";
      }
    });
  }

  function spawnHearts() {
    hearts.forEach((h, i) => {
      if (!h) return;
      // Stagger each heart
      setTimeout(() => {
        h.classList.remove("spirit-heart-float");
        h.style.fill = "rgba(255,120,150,0)";
        // force reflow
        void h.offsetWidth;
        h.style.fill = "rgba(255,120,150,0.7)";
        h.classList.add("spirit-heart-float");

        // Clean up after animation
        setTimeout(() => {
          h.classList.remove("spirit-heart-float");
          h.style.fill = "rgba(255,120,150,0)";
        }, 1500);
      }, i * 200);
    });
  }
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
