/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — page Rifka
   Pas d'écran d'ouverture ici : on découpe les titres, on démarre la navbar
   et on révèle le contenu immédiatement.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    R.splitTitles();
    R.initNav();
    R.initMagnetic();
    R.revealAll();
  });

})(window.RIFKUS);
