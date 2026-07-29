/* reveal-fix.js
   Самостоятельный fix для блоков .w-reveal (scroll-reveal) и счётчиков [data-count-to].
   Не зависит от Next.js чанков — работает на голом HTML/CSS/JS.
   Подключать в конце <body>, ПОСЛЕ основной разметки:
   <script src="reveal-fix.js"></script>
*/
(function () {
  "use strict";

  // помечаем, что JS реально запустился — от этого зависит CSS-фолбэк
  document.documentElement.classList.add("js-reveal-ready");

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. scroll-reveal для .w-reveal ---------- */
  var revealEls = document.querySelectorAll(".w-reveal");

  function showAll() {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (!("IntersectionObserver" in window) || reduced) {
    showAll();
  } else {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      revealIO.observe(el);
    });
  }

  /* ---------- 2. счётчики [data-count-to] ---------- */
  function formatNumber(value, max) {
    max = max === undefined ? value : max;
    var unit = max >= 1e6 ? 1e6 : max >= 1e3 ? 1e3 : 1;
    var num = value / unit;
    var decimals = unit === 1 || num % 1 === 0 ? 0 : 1;
    return (
      num.toFixed(decimals) + (unit === 1e6 ? "M" : unit === 1e3 ? "K" : "")
    );
  }

  var counters = document.querySelectorAll("[data-count-to]");

  function renderCounter(el, value, target) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    el.textContent = prefix + formatNumber(value, target) + suffix;
  }

  if (!("IntersectionObserver" in window) || reduced) {
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      renderCounter(el, target, target);
    });
  } else {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          counterIO.unobserve(el);

          var target = parseFloat(el.getAttribute("data-count-to"));
          var duration =
            parseFloat(el.getAttribute("data-count-duration")) || 1600;
          var start = performance.now();

          function tick(now) {
            var p = Math.min(1, (now - start) / duration);
            var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            renderCounter(el, target * eased, target);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      counterIO.observe(el);
    });
  }
})();
