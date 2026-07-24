/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — mood
   « Choisis ton mood » : un clic teinte la section et recommande une saveur.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  var MOODS = {
    epice: {
      flavor: 'Harissa',
      accent: '#FF3B1F',
      verdict: 'Ton mood aujourd’hui : 100 % FEU.',
      line: 'Tu ne cherches pas le confort, tu cherches la sensation. Harissa ne négocie pas.'
    },
    fromage: {
      flavor: 'Boules Fromage',
      accent: '#F07C1E',
      verdict: 'Ton mood aujourd’hui : 100 % FROMAGE.',
      line: 'Fondant, réconfortant, généreux. Le sachet ne survit jamais à la soirée.'
    },
    gourmand: {
      flavor: 'Boules Beef & Cheddar',
      accent: '#8B47B4',
      verdict: 'Ton mood aujourd’hui : 100 % GOURMAND.',
      line: 'Bœuf grillé et cheddar coulant : tu joues clairement dans la catégorie lourde.'
    },
    fun: {
      flavor: 'Anneaux Pizza',
      accent: '#1E9BD7',
      verdict: 'Ton mood aujourd’hui : 100 % FUN.',
      line: 'Léger, joueur, partageable. La saveur qui met tout le monde de bonne humeur.'
    }
  };

  R.initMood = function () {
    var section = document.getElementById('mood');
    if (!section) return;

    var buttons = R.$$('.mood__btn', section);
    var placeholder = document.getElementById('moodPlaceholder');
    var card = document.getElementById('moodCard');
    var img = document.getElementById('moodImg');
    var verdict = document.getElementById('moodVerdict');
    var flavorEl = document.getElementById('moodFlavor');
    var desc = document.getElementById('moodDesc');
    var openBtn = document.getElementById('moodOpen');
    var chosen = null;

    function select(key, btn) {
      var mood = MOODS[key];
      if (!mood) return;

      chosen = mood.flavor;

      section.setAttribute('data-mood', key);
      section.style.setProperty('--accent', mood.accent);
      section.style.setProperty('--accent-btn', mood.accent);

      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      var source = R.getFlavorCard(mood.flavor);
      img.src = source ? source.getAttribute('data-img') : '';
      img.alt = 'Sachet Rifkus ' + mood.flavor;

      verdict.textContent = mood.verdict;
      flavorEl.textContent = mood.flavor;
      desc.textContent = mood.line;

      if (placeholder) placeholder.hidden = true;
      card.hidden = false;

      // relance l’animation d’entrée à chaque nouveau choix
      if (!R.reduced()) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        select(btn.getAttribute('data-mood'), btn);
      });
    });

    if (openBtn) {
      openBtn.addEventListener('click', function () {
        if (chosen) R.openFlavorByName(chosen);
      });
    }
  };

})(window.RIFKUS);
