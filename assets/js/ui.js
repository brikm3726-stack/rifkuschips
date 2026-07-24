/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — ui
   Socle partagé : découpe des titres, apparitions au scroll, compteurs,
   boutons magnétiques, barre de progression, gestion des couches modales.
   ═══════════════════════════════════════════════════════════════════════ */

window.RIFKUS = window.RIFKUS || {};

(function (R) {
  'use strict';

  var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  R.reduced = function () { return reducedQuery.matches; };

  R.$  = function (sel, root) { return (root || document).querySelector(sel); };
  R.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ─────────────────── découpe des titres en mots / lettres ─────────────────── */

  /*
   * Un `.split` = un MOT, jamais une lettre isolée : sinon chaque lettre
   * devient un inline-block et le navigateur coupe les mots n'importe où
   * (« LE CROU / STILLANT »). En mode `chars`, le mot contient plusieurs
   * <i> pour décaler l'apparition lettre à lettre.
   */
  function splitNode(node, mode) {
    var frag = document.createDocumentFragment();

    Array.prototype.forEach.call(node.childNodes, function (child) {
      if (child.nodeType === 3) {
        // on garde les espaces tels quels pour ne pas casser le retour à la ligne
        child.textContent.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) {
            frag.appendChild(document.createTextNode(chunk));
            return;
          }
          var word = document.createElement('span');
          word.className = 'split';

          (mode === 'chars' ? Array.from(chunk) : [chunk]).forEach(function (unit) {
            var inner = document.createElement('i');
            inner.textContent = unit;
            word.appendChild(inner);
          });

          frag.appendChild(word);
        });
      } else if (child.nodeType === 1) {
        var clone = child.cloneNode(false);
        if (child.childNodes.length) clone.appendChild(splitNode(child, mode));
        frag.appendChild(clone);
      }
    });

    return frag;
  }

  R.splitTitles = function () {
    if (R.reduced()) return;

    R.$$('[data-anim="words"], [data-anim="chars"]').forEach(function (el) {
      var mode = el.getAttribute('data-anim');
      var base = parseInt(el.getAttribute('data-delay') || '0', 10);
      var step = mode === 'chars' ? 28 : 60;

      var frag = splitNode(el, mode);
      el.textContent = '';
      el.appendChild(frag);

      R.$$('.split > i', el).forEach(function (inner, i) {
        inner.style.setProperty('--d', (base + i * step) + 'ms');
      });
    });
  };

  /* ────────────────────────── apparitions au scroll ────────────────────────── */

  R.revealAll = function () {
    var items = R.$$('.anim');

    function show(el) {
      var delay = el.getAttribute('data-delay');
      if (delay) el.style.setProperty('--d', delay + 'ms');
      el.classList.add('is-in');
    }

    if (R.reduced() || !('IntersectionObserver' in window)) {
      items.forEach(show);
      return;
    }

    // le hero se joue à l'ouverture : il ne doit pas attendre un scroll,
    // sinon les boutons restent invisibles sur les écrans courts
    items = items.filter(function (el) {
      if (!el.closest('.hero')) return true;
      show(el);
      return false;
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

    items.forEach(function (el) { io.observe(el); });
  };

  /* ──────────────────────────────── compteurs ──────────────────────────────── */

  R.initCounters = function () {
    var counters = R.$$('.count[data-count]');
    if (!counters.length) return;

    if (R.reduced() || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { el.textContent = '0'; io.observe(el); });

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var start = performance.now();
      var dur = 1300;

      (function tick(now) {
        var t = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }
  };

  /* ───────────────────────────── boutons magnétiques ───────────────────────── */

  R.initMagnetic = function () {
    if (R.reduced() || !window.matchMedia('(hover: hover)').matches) return;

    R.$$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.32;
        el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      });
      el.addEventListener('pointerleave', function () { el.style.translate = ''; });
    });
  };

  /* ─────────────────────── couches modales : verrou + focus ─────────────────── */

  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var openLayers = 0;
  var lastFocused = null;

  R.lockScroll = function (on) {
    openLayers = Math.max(0, openLayers + (on ? 1 : -1));
    document.body.classList.toggle('is-locked', openLayers > 0);
  };

  R.trapFocus = function (container) {
    lastFocused = document.activeElement;

    function onKey(e) {
      if (e.key !== 'Tab') return;
      var items = R.$$(FOCUSABLE, container).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (!items.length) return;

      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    container.addEventListener('keydown', onKey);

    return function release() {
      container.removeEventListener('keydown', onKey);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };
  };

})(window.RIFKUS);
