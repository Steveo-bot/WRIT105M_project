/* ==========================================================================
   On the Edge — Cinematic Documentary Experience
   script.js
   Adds scroll choreography, chapter focus, parallax depth, progressive reveals,
   and a pinned horizontal timeline driven by vertical scrolling.
   ========================================================================== */

(function () {
  'use strict';

  var doc = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pad(number) {
    return String(number).padStart(2, '0');
  }

  function getChapterTitle(section) {
    var preferred = section.querySelector('h1, h2, h3');
    var label = section.querySelector('.section-label');

    if (section.id === 'intro') return 'A Community on Borrowed Ground';
    if (section.id === 'collapses') return 'The Collapse Events';
    if (section.id === 'transition') return 'Inside the Cliffs';

    if (preferred && preferred.textContent.trim()) return preferred.textContent.trim();
    if (label && label.textContent.trim()) return label.textContent.trim();

    return section.id ? section.id.replace(/-/g, ' ') : 'Chapter';
  }

  function addCinematicChrome() {
    var progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    body.prepend(progress);

    var grain = document.createElement('div');
    grain.className = 'film-grain';
    grain.setAttribute('aria-hidden', 'true');
    body.appendChild(grain);

    var vignette = document.createElement('div');
    vignette.className = 'ambient-vignette';
    vignette.setAttribute('aria-hidden', 'true');
    body.appendChild(vignette);
  }

  addCinematicChrome();

  var sections = Array.prototype.slice.call(
    document.querySelectorAll('.hero, .article-section, .transition-section')
  );

  var storySections = sections.filter(function (section) {
    return !section.classList.contains('hero') && !section.classList.contains('transition-section');
  });

  storySections.forEach(function (section, index) {
    var chapterNumber = pad(index + 1);
    var chapterTitle = getChapterTitle(section);

    section.dataset.chapterNumber = chapterNumber;
    section.dataset.chapterTitle = chapterTitle;
    section.style.setProperty('--scene-x', index % 2 === 0 ? '16%' : '84%');

  });

  // Right-side chapter rail: derived from existing headings/labels.
  if (storySections.length) {
    var rail = document.createElement('nav');
    rail.className = 'chapter-rail';
    rail.setAttribute('aria-label', 'Article chapters');

    storySections.forEach(function (section, index) {
      var button = document.createElement('button');
      button.className = 'chapter-rail__button';
      button.type = 'button';
      button.textContent = section.dataset.chapterTitle;
      button.setAttribute('aria-label', 'Jump to chapter ' + pad(index + 1) + ': ' + section.dataset.chapterTitle);
      button.addEventListener('click', function () {
        section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
      rail.appendChild(button);
    });

    body.appendChild(rail);

    var current = document.createElement('div');
    current.className = 'current-chapter';
    current.setAttribute('aria-live', 'polite');

    var currentNum = document.createElement('span');
    currentNum.className = 'current-chapter__number';
    currentNum.textContent = '01';

    var currentLabel = document.createElement('span');
    currentLabel.className = 'current-chapter__title';
    currentLabel.textContent = storySections[0].dataset.chapterTitle;

    current.appendChild(currentNum);
    current.appendChild(currentLabel);
    body.appendChild(current);
  }

  // Reveal choreography: headings, media, quotes, cards, and timeline items.
  document.querySelectorAll(
    'h2, h3, .article-image, .pull-quote, .timeline, .transition-section__text, .case-study, .event-card, .data-callout, .mitigation-grid, .erosion-chain'
  ).forEach(function (el) {
    el.classList.add('scroll-pop');
    if (!el.classList.contains('fade-in')) {
      el.classList.add('fade-in');
    }
  });

  document.querySelectorAll('.image-gallery, .mitigation-grid, .timeline').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, index) {
      child.style.setProperty('--reveal-delay', Math.min(index * 75, 420) + 'ms');
    });
  });

  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.fade-in'));

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.12
    });

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  var activeButtons = Array.prototype.slice.call(document.querySelectorAll('.chapter-rail__button'));
  var currentChapter = document.querySelector('.current-chapter');
  var currentNumber = currentChapter ? currentChapter.querySelector('.current-chapter__number') : null;
  var currentTitle = currentChapter ? currentChapter.querySelector('.current-chapter__title') : null;

  if ('IntersectionObserver' in window && !reduceMotion) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-section-active', entry.isIntersecting);
      });
    }, {
      rootMargin: '-26% 0px -26% 0px',
      threshold: 0.01
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    var timelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-lit', entry.isIntersecting);
      });
    }, {
      rootMargin: '-38% 0px -38% 0px',
      threshold: 0.01
    });

    document.querySelectorAll('.timeline__item').forEach(function (item) {
      timelineObserver.observe(item);
    });
  } else {
    sections.forEach(function (section) {
      section.classList.add('is-section-active');
    });
    document.querySelectorAll('.timeline__item').forEach(function (item) {
      item.classList.add('is-lit');
    });
  }

  var mediaItems = Array.prototype.slice.call(document.querySelectorAll('.article-image'));
  var cinematicTimelines = Array.prototype.slice.call(document.querySelectorAll('.timeline--cinematic'));

  function setupCinematicTimelines() {
    cinematicTimelines.forEach(function (timeline) {
      var sticky = timeline.querySelector('.timeline__sticky');
      var track = timeline.querySelector('.timeline__track');
      if (!sticky || !track) return;

      if (window.innerWidth < 860 || reduceMotion) {
        timeline.style.removeProperty('--timeline-height');
        timeline.style.setProperty('--timeline-shift', '0px');
        timeline.style.setProperty('--timeline-progress', '0');
        return;
      }

      timeline.style.setProperty('--timeline-shift', '0px');
      var distance = Math.max(0, track.scrollWidth - sticky.clientWidth + window.innerWidth * 0.18);
      var height = window.innerHeight + distance * 1.05 + window.innerHeight * 0.35;
      timeline.dataset.timelineDistance = String(distance);
      timeline.style.setProperty('--timeline-height', Math.ceil(height) + 'px');
    });
  }

  setupCinematicTimelines();

  var ticking = false;

  function setActiveChapter(activeIndex) {
    activeButtons.forEach(function (button, index) {
      button.classList.toggle('is-active', index === activeIndex);
    });

    if (currentNumber && currentTitle && storySections[activeIndex]) {
      currentNumber.textContent = storySections[activeIndex].dataset.chapterNumber;
      currentTitle.textContent = storySections[activeIndex].dataset.chapterTitle;
    }
  }

  function updateScrollEffects() {
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var viewportHeight = window.innerHeight || 1;
    var scrollable = Math.max(1, doc.scrollHeight - viewportHeight);
    var progressValue = clamp(scrollTop / scrollable, 0, 1);

    doc.style.setProperty('--progress', progressValue.toFixed(5));
    doc.style.setProperty('--hero-progress', clamp(scrollTop / viewportHeight, 0, 1).toFixed(5));

    if (reduceMotion) return;

    var bestIndex = 0;
    var bestFocus = -1;

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var sectionCenter = rect.top + rect.height / 2;
      var viewportCenter = viewportHeight / 2;
      var distance = Math.abs(viewportCenter - sectionCenter);
      var range = Math.max(viewportHeight * 0.92, rect.height * 0.55);
      var focus = clamp(1 - distance / range, 0, 1);
      var sectionProgress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height), 0, 1);

      section.style.setProperty('--section-focus', focus.toFixed(5));
      section.style.setProperty('--section-progress', sectionProgress.toFixed(5));

      if (!section.classList.contains('hero')) {
        section.style.setProperty('--section-scale', (0.965 + focus * 0.035).toFixed(5));
        section.style.setProperty('--section-opacity', (0.70 + focus * 0.30).toFixed(5));
      }
    });

    storySections.forEach(function (section, index) {
      var rect = section.getBoundingClientRect();
      var midpointDistance = Math.abs((rect.top + rect.height / 2) - viewportHeight / 2);
      var focus = 1 - clamp(midpointDistance / Math.max(viewportHeight, rect.height), 0, 1);
      if (focus > bestFocus) {
        bestFocus = focus;
        bestIndex = index;
      }
    });

    setActiveChapter(bestIndex);

    cinematicTimelines.forEach(function (timeline) {
      var sticky = timeline.querySelector('.timeline__sticky');
      var track = timeline.querySelector('.timeline__track');
      if (!sticky || !track) return;

      if (window.innerWidth < 860 || reduceMotion) {
        timeline.style.setProperty('--timeline-shift', '0px');
        timeline.style.setProperty('--timeline-progress', '0');
        return;
      }

      var rect = timeline.getBoundingClientRect();
      var scrollRange = Math.max(1, timeline.offsetHeight - viewportHeight);
      var progress = clamp(-rect.top / scrollRange, 0, 1);
      var distance = parseFloat(timeline.dataset.timelineDistance || '0') || 0;

      timeline.style.setProperty('--timeline-progress', progress.toFixed(5));
      timeline.style.setProperty('--timeline-shift', (-progress * distance).toFixed(2) + 'px');

      Array.prototype.forEach.call(track.querySelectorAll('.timeline__item'), function (item) {
        var itemRect = item.getBoundingClientRect();
        var itemCenter = itemRect.left + itemRect.width / 2;
        var focus = 1 - clamp(Math.abs(itemCenter - window.innerWidth / 2) / (window.innerWidth * 0.48), 0, 1);
        item.classList.toggle('is-lit', focus > 0.28);
      });
    });

    mediaItems.forEach(function (media) {
      var rect = media.getBoundingClientRect();
      var center = rect.top + rect.height / 2;
      var normalized = clamp((center - viewportHeight / 2) / viewportHeight, -1, 1);
      var shift = -normalized;
      var focus = 1 - Math.abs(normalized);

      media.style.setProperty('--media-shift', shift.toFixed(5));
      media.style.setProperty('--media-scale', (0.985 + clamp(focus, 0, 1) * 0.025).toFixed(5));
    });
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateScrollEffects();
        ticking = false;
      });
      ticking = true;
    }
  }

  updateScrollEffects();
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () {
    setupCinematicTimelines();
    requestTick();
  });
  window.addEventListener('orientationchange', function () {
    setupCinematicTimelines();
    requestTick();
  });
  window.addEventListener('load', function () {
    setupCinematicTimelines();
    requestTick();
  });
})();
