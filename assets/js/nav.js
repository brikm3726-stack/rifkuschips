/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — nav
   Navbar collante, menu mobile, lien actif suivant le scroll.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  R.initNav = function () {
    var nav = document.getElementById('nav');
    var burger = document.getElementById('navBurger');
    var links = document.getElementById('navLinks');
    if (!nav || !burger || !links) return;

    /* — état collant — */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle('is-stuck', window.scrollY > 24);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* — menu mobile — */
    R.$$('.nav__link', links).forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });

    function setMenu(open) {
      links.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      R.lockScroll(open);
    }

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    links.addEventListener('click', function (e) {
      if (e.target.closest('a') && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });

    // le menu mobile devient une barre au retour en grand écran
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    });

    /* — lien actif selon la section visible —
       Certaines sections (« pourquoi », « mood ») n'ont pas d'entrée propre
       dans le menu : `data-spy` les rattache au lien qui les représente,
       sinon le surlignage resterait bloqué sur la section précédente. */
    var navLinks = R.$$('.nav__link', links);
    var owner = {};   // id de section -> lien

    navLinks.forEach(function (a) {
      var ids = (a.getAttribute('data-spy') || a.getAttribute('href').slice(1)).split(/\s+/);
      ids.forEach(function (id) { if (id) owner[id] = a; });
    });

    var sections = Object.keys(owner)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (!('IntersectionObserver' in window) || !sections.length) return;

    var visible = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      var best = null;
      visible.forEach(function (ratio, id) {
        if (ratio > 0 && (!best || ratio > best.ratio)) best = { id: id, ratio: ratio };
      });
      if (!best) return;

      var active = owner[best.id];
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a === active); });
    }, { threshold: [0.15, 0.4, 0.7], rootMargin: '-88px 0px -40% 0px' });

    sections.forEach(function (s) { io.observe(s); });
  };

})(window.RIFKUS);
