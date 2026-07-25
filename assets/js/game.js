/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — hide-game
   Jeu du bonneteau : mémorise le sachet indiqué, les caisses se referment
   et échangent leur contenu, puis on clique pour retrouver le bon sachet.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  var ITEMS = [
    { name: 'Cheese',         img: 'assets/img/packs/pnj-1.png' },
    { name: 'Beef & Cheddar', img: 'assets/img/packs/pnj-2.png' },
    { name: 'Ketchup',        img: 'assets/img/packs/pnj-3.png' }
  ];

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  R.initHideGame = function () {
    var board = document.getElementById('gameBoard');
    if (!board) return;

    var slots = R.$$('.hide-game__slot', board);
    var statusEl = document.getElementById('gameStatus');
    var replayBtn = document.getElementById('gameReplay');

    var assignment = [0, 1, 2];
    var targetItem = 0;

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

    function reveal(slot, i, isWin) {
      setOpen(slot, true);
      slot.classList.add(isWin ? 'is-correct' : 'is-wrong');
    }

    function onPick(e) {
      if (board.classList.contains('is-locked')) return;
      board.classList.add('is-locked');

      var slot = e.currentTarget;
      var picked = slots.indexOf(slot);
      var win = assignment[picked] === targetItem;

      reveal(slot, picked, win);

      setTimeout(function () {
        slots.forEach(function (s, i) {
          if (i !== picked) reveal(s, i, assignment[i] === targetItem);
        });
        statusEl.textContent = win
          ? 'Gagné ! Le sachet ' + ITEMS[targetItem].name + ' était bien là.'
          : 'Raté ! Le sachet ' + ITEMS[targetItem].name + ' se cachait ailleurs.';
        replayBtn.hidden = false;
      }, 450);

      slots.forEach(function (s) { s.disabled = true; });
    }

    function start() {
      board.classList.add('is-locked');
      replayBtn.hidden = true;

      assignment = shuffle([0, 1, 2]);
      targetItem = assignment[Math.floor(Math.random() * 3)];

      slots.forEach(function (slot, i) {
        slot.disabled = true;
        slot.classList.remove('is-correct', 'is-wrong');
        paint(slot, assignment[i]);
        setOpen(slot, true);
      });

      statusEl.innerHTML = 'Mémorise la place du sachet <strong>' + ITEMS[targetItem].name + '</strong>…';

      setTimeout(function () {
        slots.forEach(function (slot) { setOpen(slot, false); });

        setTimeout(function () {
          slots.forEach(function (slot) { slot.classList.add('is-shuffling'); });
          assignment = shuffle(assignment);
          slots.forEach(function (slot, i) { paint(slot, assignment[i]); });

          setTimeout(function () {
            slots.forEach(function (slot) {
              slot.classList.remove('is-shuffling');
              slot.disabled = false;
            });
            board.classList.remove('is-locked');
            statusEl.textContent = 'À toi de jouer : clique sur la caisse qui cache ce sachet.';
          }, 650);
        }, 1500);
      }, 1800);
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
