/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — flavors
   Filtres par gamme + fiche produit en modale.
   Les cartes du DOM sont la source de vérité : la modale lit leurs
   attributs `data-*`, il n'y a donc qu'un seul endroit à mettre à jour.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  var cards = [];
  var modal, panel, releaseFocus = null, current = null;

  /* ──────────────────────────────── filtres ──────────────────────────────── */

  function applyFilter(range) {
    var shown = 0;

    cards.forEach(function (card) {
      var match = range === 'all' || card.getAttribute('data-range') === range;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        card.style.setProperty('--d', (shown * 45) + 'ms');
        shown++;
      }
    });

    R.$$('.filter').forEach(function (btn) {
      var on = btn.getAttribute('data-filter') === range;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-selected', String(on));
    });

    var empty = document.getElementById('flavorsEmpty');
    if (empty) empty.hidden = shown > 0;
  }

  /* ──────────────────────────────── modale ──────────────────────────────── */

  function visibleCards() {
    return cards.filter(function (c) { return !c.classList.contains('is-hidden'); });
  }

  function fill(card) {
    current = card;

    var accent = getComputedStyle(card).getPropertyValue('--f').trim() || '#FFD400';
    panel.style.setProperty('--f', accent);

    var img = document.getElementById('modalImg');
    img.src = card.getAttribute('data-img');
    img.alt = 'Sachet Rifkus ' + card.getAttribute('data-name');

    document.getElementById('modalRange').textContent = card.getAttribute('data-label');
    document.getElementById('modalName').textContent = card.getAttribute('data-name');
    document.getElementById('modalDesc').textContent = card.getAttribute('data-long');
    document.getElementById('modalMoment').textContent = card.getAttribute('data-moment');

    var heat = parseInt(card.getAttribute('data-heat') || '1', 10);
    var flames = '';
    for (var i = 1; i <= 5; i++) {
      flames += '<span class="' + (i <= heat ? 'on' : '') + '" aria-hidden="true">🌶️</span>';
    }
    var heatEl = document.getElementById('modalHeat');
    heatEl.innerHTML = flames;
    heatEl.setAttribute('aria-label', heat + ' sur 5');

    var kcal = card.getAttribute('data-kcal');
    var row = document.getElementById('modalKcalRow');
    row.hidden = !kcal;
    if (kcal) document.getElementById('modalKcal').textContent = kcal;

    // on relance l'apparition du sachet à chaque changement de fiche
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animation = '';
  }

  function open(card) {
    if (!card || !modal) return;
    fill(card);

    modal.hidden = false;
    void modal.offsetWidth;
    modal.classList.add('is-open');
    R.lockScroll(true);
    releaseFocus = R.trapFocus(modal);

    var close = R.$('.modal__close', modal);
    if (close) close.focus();
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    R.lockScroll(false);
    if (releaseFocus) { releaseFocus(); releaseFocus = null; }

    setTimeout(function () {
      if (!modal.classList.contains('is-open')) modal.hidden = true;
    }, 420);
  }

  function step(dir) {
    var list = visibleCards();
    if (list.length < 2) return;
    var i = list.indexOf(current);
    if (i < 0) i = 0;
    fill(list[(i + dir + list.length) % list.length]);
  }

  /* ──────────────────────────────── mise en place ─────────────────────────── */

  R.initFlavors = function () {
    cards = R.$$('.flavor-card');
    modal = document.getElementById('flavorModal');
    panel = document.getElementById('modalPanel');
    if (!cards.length) return;

    cards.forEach(function (card) {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Découvrir la saveur ' + card.getAttribute('data-name'));

      card.addEventListener('click', function () { open(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(card); }
      });
    });

    R.$$('.filter').forEach(function (btn) {
      btn.addEventListener('click', function () { applyFilter(btn.getAttribute('data-filter')); });
    });

    // raccourcis du pied de page vers une gamme précise
    R.$$('[data-jump]').forEach(function (link) {
      link.addEventListener('click', function () {
        applyFilter(link.getAttribute('data-jump'));
      });
    });

    if (!modal) return;

    R.$$('[data-close]', modal).forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.getElementById('modalPrev').addEventListener('click', function () { step(-1); });
    document.getElementById('modalNext').addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  };

  /* appelé par la section « mood » */
  R.openFlavorByName = function (name) {
    var card = cards.filter(function (c) { return c.getAttribute('data-name') === name; })[0];
    if (card) open(card);
  };

  R.getFlavorCard = function (name) {
    return cards.filter(function (c) { return c.getAttribute('data-name') === name; })[0] || null;
  };

})(window.RIFKUS);
