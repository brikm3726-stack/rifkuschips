/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — main
   Orchestration : écran d'ouverture puis démarrage des modules.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  var MIN_INTRO = 1250;   // durée mini de l'écran d'ouverture
  var MAX_INTRO = 2600;   // filet de sécurité si une image traîne
  var started = Date.now();

  /* — préparations qui ne dépendent pas du chargement des images — */
  document.addEventListener('DOMContentLoaded', function () {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    R.$$('.preloader__word span').forEach(function (el, i) {
      el.style.setProperty('--i', i);
    });

    R.splitTitles();
    R.initNav();
    R.initFlavors();
    R.initMood();
    R.initContact();
    R.initMagnetic();
  });

  /* — bascule vers le site une fois l'ouverture jouée — */
  function reveal() {
    if (document.body.classList.contains('is-ready')) return;

    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');

    R.revealAll();
    R.initCounters();
    R.initParticles();
    R.initHeroParallax();

    var pre = document.getElementById('preloader');
    if (pre) setTimeout(function () { pre.remove(); }, 800);
  }

  function scheduleReveal() {
    var waited = Date.now() - started;
    setTimeout(reveal, Math.max(MIN_INTRO - waited, 0));
  }

  if (R.reduced()) {
    document.addEventListener('DOMContentLoaded', reveal);
  } else {
    window.addEventListener('load', scheduleReveal);
    setTimeout(reveal, MAX_INTRO);
  }

})(window.RIFKUS);
