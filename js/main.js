/* ============================================================
   Концепт 2 — Clinical Premium SPA
   Чистый JS: hash-роутер, прогресс, мобильное меню,
   появления при скролле, интерактивный слайдер до/после.
   ============================================================ */
(function () {
  "use strict";

  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[data-link]"));
  var header = document.getElementById("siteHeader");
  var progress = document.querySelector(".scroll-progress");

  function nameFromHash() {
    var h = window.location.hash || "#/";
    var name = h.replace(/^#\/?/, "").split("?")[0];
    if (!name) return "hero";
    return name;
  }

  function highlightNav(name) {
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-link") === name);
    });
  }

  function showView(name) {
    var target = null;
    views.forEach(function (v) {
      var match = v.getAttribute("data-view") === name;
      v.classList.toggle("is-active", match);
      if (match) target = v;
    });
    if (!target && views.length) {
      views[0].classList.add("is-active");
      name = views[0].getAttribute("data-view");
    }
    highlightNav(name);
    // прокрутка к началу экрана (если это не hero)
    window.scrollTo({ top: 0, behavior: "auto" });
    observeReveals();
  }

  function navigate() {
    showView(nameFromHash());
  }

  // Клики по внутренним ссылкам
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-link], a[href^='#/']");
    if (!link) return;
    var href = link.getAttribute("href") || "#/";
    if (href === "#/" + nameFromHash() && link.getAttribute("data-link") === nameFromHash()) {
      // уже на этом экране — просто наверх
      window.scrollTo({ top: 0, behavior: "smooth" });
      closeNav();
      e.preventDefault();
      return;
    }
    closeNav();
    // hash-change вызовет navigate()
  });

  window.addEventListener("popstate", navigate);
  window.addEventListener("hashchange", navigate);

  // Липкий хедер + прогресс скролла
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", y > 20);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = p + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // Мобильное меню
  var toggle = document.querySelector(".nav-toggle");
  function closeNav() {
    if (toggle) { toggle.classList.remove("active"); toggle.setAttribute("aria-expanded", "false"); }
    var nav = document.querySelector(".site-nav");
    if (nav) nav.classList.remove("open");
  }
  if (toggle) {
    toggle.addEventListener("click", function () {
      var nav = document.querySelector(".site-nav");
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Появления при скролле
  var io = null;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { io.observe(el); });
  }

  // Разметка .reveal на карточках текущего экрана
  function tagReveals() {
    var groups = [".service-card", ".tech-item", ".advantage-card", ".myth-card", ".rec-card", ".case-block", ".about-photo", ".contact-aside"];
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (!el.classList.contains("reveal")) {
          el.classList.add("reveal");
          el.style.transitionDelay = Math.min(i * 60, 360) + "ms";
        }
      });
    });
  }

  /* ===== Слайдер до/после ===== */
  function initBeforeAfter() {
    document.querySelectorAll(".ba-slider").forEach(function (slider) {
      if (slider.dataset.baInit) return;
      slider.dataset.baInit = "1";
      var wrap = slider.querySelector(".ba-before-wrap");
      var handle = slider.querySelector(".ba-handle");
      if (!wrap || !handle) return;
      var dragging = false;

      function setPos(clientX) {
        var rect = slider.getBoundingClientRect();
        var x = clientX - rect.left;
        var pct = (x / rect.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        wrap.style.width = pct + "%";
        handle.style.left = pct + "%";
      }
      function start(e) { dragging = true; move(e); }
      function move(e) {
        if (!dragging) return;
        var x = e.touches ? e.touches[0].clientX : e.clientX;
        setPos(x);
        if (e.cancelable) e.preventDefault();
      }
      function end() { dragging = false; }

      handle.addEventListener("mousedown", start);
      slider.addEventListener("mousedown", function (e) { if (e.target === handle) return; dragging = true; move(e); });
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", end);
      handle.addEventListener("touchstart", start, { passive: true });
      slider.addEventListener("touchstart", function (e) { if (e.target === handle) return; dragging = true; move(e); }, { passive: true });
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", end);
      // клик по слайдеру перемещает ползунок
      slider.addEventListener("click", function (e) { if (e.target === handle || handle.contains(e.target)) return; setPos(e.clientX); });
    });
  }

  function init() {
    tagReveals();
    initBeforeAfter();
    onScroll();
    navigate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
