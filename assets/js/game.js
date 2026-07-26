/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — hide-game
   Jeu du bonneteau : mémorise le sachet indiqué, les caisses se referment
   puis s'échangent réellement de place pendant 7 s, et on clique pour
   retrouver le bon sachet.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  var ITEMS = [
    { name: 'Cheese',         img: 'assets/img/packs/pnj-1.png' },
    { name: 'Beef & Cheddar', img: 'assets/img/packs/pnj-2.png' },
    { name: 'Ketchup',        img: 'assets/img/packs/pnj-3.png' }
  ];

  var SHUFFLE_MS = 7000;   // durée totale du brassage
  var PAIRS = [[0, 1], [1, 2], [0, 2]];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function reducedMotion() {
    return !!(window.matchMedia &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  R.initHideGame = function () {
    var board = document.getElementById('gameBoard');
    if (!board) return;

    var slots = R.$$('.hide-game__slot', board);
    var statusEl = document.getElementById('gameStatus');
    var replayBtn = document.getElementById('gameReplay');

    var assignment = [0, 1, 2];   // contenu de chaque caisse (il suit la caisse)
    var targetItem = 0;
    var slotPos = [0, 1, 2];      // emplacement visuel courant de chaque caisse
    var anchors = [];             // abscisses des 3 emplacements
    var timers = [];
    var flightSeq = 0;            // numéro du dernier vol lancé
    var flightOf = [0, 0, 0];     // dernier vol en cours pour chaque caisse

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }
    function later(fn, ms) {
      timers.push(setTimeout(fn, ms));
    }

    function paint(slot, itemIndex) {
      var item = ITEMS[itemIndex];
      var img = slot.querySelector('.hide-game__face--pack img');
      var em = slot.querySelector('.hide-game__face--pack em');
      img.src = item.img;
      img.alt = 'Sachet Rifkus ' + item.name;
      em.textContent = item.name;
    }

    function setOpen(slot, isOpen) {
      slot.querySelector('.hide-game__crate').classList.toggle('is-open', isOpen);
    }

    function reveal(slot, isWin) {
      setOpen(slot, true);
      slot.classList.add(isWin ? 'is-correct' : 'is-wrong');
    }

    /* remet les caisses à leur emplacement d'origine, sans animation */
    function resetPositions() {
      slots.forEach(function (slot) {
        slot.style.transitionDuration = '0ms';
        slot.style.setProperty('--x', '0px');
        slot.style.setProperty('--lift', '0px');
        slot.style.setProperty('--sc', '1');
        slot.classList.remove('is-flying');
        slot.style.zIndex = '';
        var crate = slot.querySelector('.hide-game__crate');
        crate.classList.remove('is-tilt-l', 'is-tilt-r');
      });
      // force la prise en compte immédiate de la remise à zéro
      void board.offsetWidth;
      slots.forEach(function (slot) {
        slot.style.transitionDuration = '';
        slot.style.transitionTimingFunction = '';
      });
      slotPos = [0, 1, 2];
    }

    /* mesure les 3 emplacements — refait à chaque partie (responsive).
       Appelé après resetPositions(), donc les caisses sont bien à leur place. */
    function measure() {
      anchors = slots.map(function (slot) {
        return slot.getBoundingClientRect().left;
      });
    }

    /* envoie une caisse vers un emplacement, en arc, en `dur` ms */
    function fly(slotIndex, toPos, lift, dur) {
      var slot = slots[slotIndex];
      var crate = slot.querySelector('.hide-game__crate');
      var fromX = anchors[slotPos[slotIndex]] - anchors[slotIndex];
      var toX = anchors[toPos] - anchors[slotIndex];

      // les vols s'enchaînent sans pause : on numérote pour que le nettoyage
      // d'un vol ne coupe pas celui qui vient de démarrer sur la même caisse
      var id = ++flightSeq;
      flightOf[slotIndex] = id;

      slot.classList.add('is-flying');
      // celle qui passe par-dessus doit rester au premier plan
      slot.style.zIndex = lift < 0 ? '3' : '2';
      crate.classList.toggle('is-tilt-l', toX < fromX);
      crate.classList.toggle('is-tilt-r', toX > fromX);

      // 1re moitié : jusqu'à mi-chemin, en passant au-dessus (ou en dessous)
      slot.style.transitionTimingFunction = 'ease-out';
      slot.style.transitionDuration = Math.round(dur / 2) + 'ms';
      slot.style.setProperty('--x', ((fromX + toX) / 2) + 'px');
      slot.style.setProperty('--lift', lift + 'px');
      slot.style.setProperty('--sc', lift < 0 ? '1.08' : '.94');

      slotPos[slotIndex] = toPos;

      later(function () {
        // 2de moitié : retour sur la ligne, à l'emplacement d'arrivée
        slot.style.transitionTimingFunction = 'ease-in';
        slot.style.transitionDuration = Math.round(dur / 2) + 'ms';
        slot.style.setProperty('--x', toX + 'px');
        slot.style.setProperty('--lift', '0px');
        slot.style.setProperty('--sc', '1');
        crate.classList.remove('is-tilt-l', 'is-tilt-r');
      }, Math.round(dur / 2));

      later(function () {
        if (flightOf[slotIndex] !== id) return;   // un nouveau vol a pris le relais
        slot.classList.remove('is-flying');
        slot.style.zIndex = '';
      }, dur + 20);
    }

    /* enchaîne les échanges pendant SHUFFLE_MS, puis rappelle `done` */
    function runShuffle(done) {
      var slow = reducedMotion();
      var total = slow ? 1200 : SHUFFLE_MS;
      var elapsed = 0;
      var lastPair = -1;

      while (elapsed < total) {
        // rythme : posé au début et à la fin, plus nerveux au milieu
        var dur = slow ? 300
                       : Math.round(600 - 260 * Math.sin(Math.PI * elapsed / total));
        if (elapsed + dur > total) dur = total - elapsed;
        if (dur < 180) break;

        var p = Math.floor(Math.random() * PAIRS.length);
        if (p === lastPair) p = (p + 1 + Math.floor(Math.random() * 2)) % PAIRS.length;
        lastPair = p;

        (function (pair, delay, d) {
          later(function () {
            // quelles caisses occupent actuellement ces deux emplacements ?
            var a = slotPos.indexOf(pair[0]);
            var b = slotPos.indexOf(pair[1]);
            var lift = Math.random() < .5 ? 1 : -1;
            fly(a, pair[1], lift * -44, d);
            fly(b, pair[0], lift * 44, d);
          }, delay);
        })(PAIRS[p], elapsed, dur);

        elapsed += dur;
      }

      later(done, elapsed + 80);
    }

    function onPick(e) {
      if (board.classList.contains('is-locked')) return;
      board.classList.add('is-locked');

      var slot = e.currentTarget;
      var picked = slots.indexOf(slot);
      var win = assignment[picked] === targetItem;

      reveal(slot, win);

      later(function () {
        slots.forEach(function (s, i) {
          if (i !== picked) reveal(s, assignment[i] === targetItem);
        });
        statusEl.textContent = win
          ? 'Gagné ! Le sachet ' + ITEMS[targetItem].name + ' était bien là.'
          : 'Raté ! Le sachet ' + ITEMS[targetItem].name + ' se cachait ailleurs.';
        replayBtn.hidden = false;
      }, 450);

      slots.forEach(function (s) { s.disabled = true; });
    }

    function start() {
      clearTimers();
      board.classList.add('is-locked');
      replayBtn.hidden = true;
      resetPositions();

      assignment = shuffle([0, 1, 2]);
      targetItem = assignment[Math.floor(Math.random() * 3)];

      slots.forEach(function (slot, i) {
        slot.disabled = true;
        slot.classList.remove('is-correct', 'is-wrong');
        paint(slot, assignment[i]);
        setOpen(slot, true);
      });

      statusEl.innerHTML = 'Mémorise la place du sachet <strong>' + ITEMS[targetItem].name + '</strong>…';

      later(function () {
        slots.forEach(function (slot) { setOpen(slot, false); });
        statusEl.textContent = 'Ne les quitte pas des yeux…';

        // on laisse les couvercles se rabattre avant de brasser
        later(function () {
          measure();
          runShuffle(function () {
            slots.forEach(function (slot) { slot.disabled = false; });
            board.classList.remove('is-locked');
            statusEl.textContent = 'À toi de jouer : clique sur la caisse qui cache ce sachet.';
          });
        }, 700);
      }, 2200);
    }

    slots.forEach(function (slot) { slot.addEventListener('click', onPick); });
    replayBtn.addEventListener('click', start);

    // ne démarre qu'à l'arrivée dans l'écran : sinon la phase « mémorise »
    // se joue hors champ pendant que le visiteur scrolle encore
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        start();
      }, { threshold: 0.4 });
      io.observe(board);
    } else {
      start();
    }
  };

})(window.RIFKUS);
