/* AMIPARKN — site.js
   Kein Tracking, keine externen Anfragen. Nur Menü, Header-Effekt,
   Scroll-Story (Handy-Ansichten) und Einblend-Animationen. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: Hintergrund nach dem Scrollen ---------- */
  var header = document.querySelector('.site-header');
  function onHeaderScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  /* ---------- Mobiles Menü ---------- */
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!btn || !nav) return;
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  }
  if (btn && nav) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- Einblenden beim Scrollen ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Scroll-Story ---------- */
  function setupStory(section) {
    var steps = Array.prototype.slice.call(section.querySelectorAll('.step'));
    var imgs = Array.prototype.slice.call(section.querySelectorAll('.screen img'));
    var dots = Array.prototype.slice.call(section.querySelectorAll('.dots button'));
    var bar = section.querySelector('.progress i');
    var counter = section.querySelector('.counter b');
    var count = steps.length;
    var active = -1;
    var ticking = false;

    function show(i) {
      if (i === active) return;
      active = i;
      steps.forEach(function (s, n) {
        s.classList.toggle('on', n === i);
        s.setAttribute('aria-hidden', n === i ? 'false' : 'true');
      });
      imgs.forEach(function (im, n) {
        im.classList.toggle('on', n === i);
        im.setAttribute('aria-hidden', n === i ? 'false' : 'true');
      });
      dots.forEach(function (d, n) {
        d.classList.toggle('on', n === i);
        if (n === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
      });
      if (counter) counter.textContent = ('0' + (i + 1)).slice(-2);
    }

    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var range = section.offsetHeight - window.innerHeight;
      var p = range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 0;
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
      show(Math.min(count - 1, Math.floor(p * count)));
    }

    function request() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        var range = section.offsetHeight - window.innerHeight;
        var top = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + range * ((i + 0.5) / count), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });

    update();
  }

  document.querySelectorAll('.story').forEach(setupStory);
})();
