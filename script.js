/* =========================================================================
   On the Edge — scroll choreography
   ========================================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

  // ----------------------------------------------------------------------
  // Top progress bar + hero parallax
  // ----------------------------------------------------------------------
  var heroEl = document.getElementById('hero');
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function onScroll() {
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
    var p = clamp(scrollTop / scrollable, 0, 1);
    doc.style.setProperty('--progress', p.toFixed(5));

    if (heroEl) {
      var hp = clamp(scrollTop / window.innerHeight, 0, 1);
      heroEl.style.setProperty('--hero-p', hp.toFixed(5));
    }

    // reveal parallax
    reveals.forEach(function (r) {
      var rect = r.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var n = clamp((center - window.innerHeight / 2) / window.innerHeight, -1.2, 1.2);
      r.style.setProperty('--reveal-p', (0.5 - n * 0.5).toFixed(4));
    });
  }

  if (!reduceMotion) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  } else {
    onScroll();
  }

  // ----------------------------------------------------------------------
  // Fade-in reveal
  // ----------------------------------------------------------------------
  var fadeItems = Array.prototype.slice.call(document.querySelectorAll('.fade-in'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    var fadeObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    fadeItems.forEach(function (el) { fadeObs.observe(el); });
  } else {
    fadeItems.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ----------------------------------------------------------------------
  // Scrollmation sections — sticky bg + steps with image swap
  // ----------------------------------------------------------------------
  var scrollySections = Array.prototype.slice.call(document.querySelectorAll('.scrolly'));
  scrollySections.forEach(function (section) {
    var stage = section.querySelector('[data-scrolly-media]');
    var steps = Array.prototype.slice.call(section.querySelectorAll('[data-scrolly-steps] .scrolly__step'));
    var layers = Array.prototype.slice.call(stage.querySelectorAll('.scrolly__media-layer'));
    if (!stage || !steps.length) return;

    function activate(stepIdx) {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === stepIdx); });
      layers.forEach(function (l) {
        var idx = parseInt(l.getAttribute('data-step'), 10);
        l.classList.toggle('is-active', idx === stepIdx);
      });
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        // find the most "in view" step
        var best = null, bestRatio = 0;
        entries.forEach(function (e) {
          if (e.intersectionRatio > bestRatio) {
            best = e.target;
            bestRatio = e.intersectionRatio;
          }
        });
        if (best) {
          var idx = parseInt(best.getAttribute('data-step'), 10);
          activate(idx);
        }
      }, {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      });
      steps.forEach(function (s) { obs.observe(s); });
    } else {
      activate(0);
    }
  });

  // ----------------------------------------------------------------------
  // Timeline — sticky year + active event
  // ----------------------------------------------------------------------
  var tlSection = document.getElementById('timeline');
  if (tlSection) {
    var yearEl = tlSection.querySelector('[data-tl-year]');
    var bar = tlSection.querySelector('.timeline-sticky__bar');
    var events = Array.prototype.slice.call(tlSection.querySelectorAll('.tl-event'));

    function setActiveEvent(idx) {
      events.forEach(function (e, i) { e.classList.toggle('is-active', i === idx); });
      if (yearEl && events[idx]) yearEl.textContent = events[idx].getAttribute('data-year');
      if (bar) bar.style.setProperty('--tl-progress', ((idx + 1) / events.length).toFixed(3));
    }

    if ('IntersectionObserver' in window) {
      var tlObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = events.indexOf(entry.target);
            if (idx > -1) setActiveEvent(idx);
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 });
      events.forEach(function (e) { tlObs.observe(e); });
    } else {
      setActiveEvent(0);
    }
  }

  // ----------------------------------------------------------------------
  // Chapter rail
  // ----------------------------------------------------------------------
  var rail = document.createElement('nav');
  rail.className = 'chapter-rail';
  rail.setAttribute('aria-label', 'Chapters');

  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
  sections.forEach(function (s, i) {
    var btn = document.createElement('button');
    btn.className = 'chapter-rail__btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Jump to section ' + (i + 1));
    btn.addEventListener('click', function () {
      s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    rail.appendChild(btn);
  });
  body.appendChild(rail);

  var railBtns = Array.prototype.slice.call(rail.querySelectorAll('.chapter-rail__btn'));
  if ('IntersectionObserver' in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = sections.indexOf(entry.target);
          railBtns.forEach(function (b, i) { b.classList.toggle('is-active', i === idx); });
          var theme = entry.target.getAttribute('data-rail-theme');
          rail.classList.toggle('chapter-rail--on-dark', theme === 'dark');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.01 });
    sections.forEach(function (s) { sectionObs.observe(s); });
  }

})();
