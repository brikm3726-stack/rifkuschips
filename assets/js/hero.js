/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — hero
   Particules « miettes » sur canvas + parallaxe des sachets.
   Le flottement des sachets vient d'animations CSS sur `transform` ;
   la parallaxe utilise la propriété `translate`, qui s'y compose sans
   entrer en conflit.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  /* ────────────────────────────── particules ────────────────────────────── */

  R.initParticles = function () {
    var canvas = document.getElementById('heroParticles');
    if (!canvas || R.reduced()) return;

    var ctx = canvas.getContext('2d');
    var dots = [];
    var raf = null;
    var w = 0, h = 0, dpr = 1;
    var running = false;

    var TINTS = ['255,212,0', '255,232,107', '228,3,46', '255,255,255'];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var count = Math.round(Math.min(Math.max(w / 22, 16), 54));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.8 + Math.random() * 2.4,
          vy: -(0.12 + Math.random() * 0.42),
          sway: 0.3 + Math.random() * 0.9,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.16 + Math.random() * 0.42,
          tint: TINTS[(Math.random() * TINTS.length) | 0]
        });
      }
    }

    function frame(now) {
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.y += d.vy;
        d.phase += 0.008;
        var x = d.x + Math.sin(d.phase) * d.sway * 8;

        if (d.y < -12) { d.y = h + 12; d.x = Math.random() * w; }

        ctx.beginPath();
        ctx.arc(x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + d.tint + ',' + d.alpha + ')';
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop()  { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    resize();
    start();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    // on coupe l'animation dès que le hero sort de l'écran
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    }

    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  };

  /* ─────────────────────── parallaxe pointeur + scroll ─────────────────────── */

  R.initHeroParallax = function () {
    var stage = document.getElementById('heroStage');
    var hero = document.querySelector('.hero');
    if (!stage || !hero || R.reduced()) return;

    var packs = R.$$('.hero__pack', stage);
    var targetX = 0, targetY = 0;
    var curX = 0, curY = 0;
    var scrollY = 0;
    var raf = null;

    function loop() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;

      packs.forEach(function (pack) {
        var depth = parseFloat(pack.getAttribute('data-depth') || '20') / 100;
        var tx = curX * depth * 100;
        var ty = curY * depth * 100 + scrollY * depth * 0.55;
        pack.style.translate = tx.toFixed(1) + 'px ' + ty.toFixed(1) + 'px';
      });

      raf = requestAnimationFrame(loop);
    }

    if (window.matchMedia('(hover: hover) and (min-width: 981px)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        targetX = (e.clientX - r.left) / r.width - 0.5;
        targetY = (e.clientY - r.top) / r.height - 0.5;
      });
      hero.addEventListener('pointerleave', function () { targetX = 0; targetY = 0; });
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        scrollY = Math.min(window.scrollY, window.innerHeight);
        ticking = false;
      });
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!raf) raf = requestAnimationFrame(loop);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }, { threshold: 0 }).observe(hero);
    } else {
      raf = requestAnimationFrame(loop);
    }
  };

})(window.RIFKUS);
