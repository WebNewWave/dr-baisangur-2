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

  /* ===== Слайдер до/после (clip-path) ===== */
  function initBeforeAfter() {
    document.querySelectorAll(".ba-slider").forEach(function (slider) {
      if (slider.dataset.baInit) return;
      slider.dataset.baInit = "1";
      var handle = slider.querySelector(".ba-handle");
      if (!handle) return;
      var dragging = false;
      var activePointerId = null;

      function setPos(pct) {
        pct = Math.max(0, Math.min(100, pct));
        var v = pct + "%";
        slider.style.setProperty("--ba-pct", v);
        handle.style.left = v;
      }

      function pctFromClientX(clientX) {
        var rect = slider.getBoundingClientRect();
        if (rect.width <= 0) return 50;
        var x = clientX - rect.left;
        return Math.max(0, Math.min(100, (x / rect.width) * 100));
      }

      function onDown(e) {
        dragging = true;
        activePointerId = e.pointerId;
        setPos(pctFromClientX(e.clientX));
        try { slider.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
      }
      function onMove(e) {
        if (!dragging) return;
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        setPos(pctFromClientX(e.clientX));
        if (e.cancelable) e.preventDefault();
      }
      function onUp(e) {
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        dragging = false;
        activePointerId = null;
        try { slider.releasePointerCapture(e.pointerId); } catch (_) {}
      }

      slider.addEventListener("pointerdown", onDown);
      slider.addEventListener("pointermove", onMove);
      slider.addEventListener("pointerup", onUp);
      slider.addEventListener("pointercancel", onUp);

      setPos(50);
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
