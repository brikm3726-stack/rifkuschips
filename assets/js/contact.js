/* ═══════════════════════════════════════════════════════════════════════
   RIFKUS — contact
   Validation + envoi du formulaire.

   ► Renseignez WEB3FORMS_KEY avec votre clé d’accès (web3forms.com, gratuit)
     pour recevoir les messages par e-mail. Tant que la clé n’est pas remplie,
     le formulaire bascule automatiquement sur l’ouverture du logiciel de
     messagerie avec le message pré-rempli — rien n’est jamais perdu.
   ═══════════════════════════════════════════════════════════════════════ */

(function (R) {
  'use strict';

  var WEB3FORMS_KEY = '';                     // ← votre clé ici
  var FALLBACK_EMAIL = 'contact@rifkus.dz';   // ← et votre adresse ici
  var TIMEOUT = 9000;

  R.initContact = function () {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var status = document.getElementById('formStatus');
    var submit = document.getElementById('contactSubmit');

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = 'form__status' + (kind ? ' is-' + kind : '');
    }

    function markInvalid(input, invalid) {
      var field = input.closest('.field');
      if (field) field.classList.toggle('is-invalid', invalid);
      input.setAttribute('aria-invalid', String(invalid));
    }

    function validate(data) {
      var bad = [];

      if (!data.name.trim()) bad.push(form.cName);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) bad.push(form.cEmail);
      if (data.message.trim().length < 10) bad.push(form.cMessage);

      [form.cName, form.cEmail, form.cMessage].forEach(function (input) {
        markInvalid(input, bad.indexOf(input) !== -1);
      });

      return bad;
    }

    function mailtoLink(data) {
      var body = [
        'Nom : ' + data.name,
        'E-mail : ' + data.email,
        'Téléphone : ' + (data.phone || '—'),
        '',
        data.message
      ].join('\n');

      return 'mailto:' + FALLBACK_EMAIL +
        '?subject=' + encodeURIComponent('[Rifkus] ' + data.subject) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = {
        name: form.cName.value,
        email: form.cEmail.value,
        phone: form.cPhone.value,
        subject: form.cSubject.value,
        message: form.cMessage.value
      };

      var bad = validate(data);
      if (bad.length) {
        setStatus('Merci de vérifier les champs surlignés.', 'err');
        bad[0].focus();
        return;
      }

      // sans clé configurée : on passe la main au logiciel de messagerie
      if (!WEB3FORMS_KEY) {
        window.location.href = mailtoLink(data);
        setStatus('Votre logiciel de messagerie s’ouvre avec le message pré-rempli.', 'ok');
        return;
      }

      submit.disabled = true;
      setStatus('Envoi en cours…');

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, TIMEOUT);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: 'Site RIFKUS',
          subject: '[Rifkus] ' + data.subject,
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (res) {
          if (!res.success) throw new Error(res.message || 'refus du serveur');
          form.reset();
          setStatus('Message envoyé. Merci, on revient vers vous rapidement !', 'ok');
        })
        .catch(function () {
          setStatus('Envoi impossible pour le moment. Ouverture de votre messagerie…', 'err');
          setTimeout(function () { window.location.href = mailtoLink(data); }, 900);
        })
        .finally(function () {
          clearTimeout(timer);
          submit.disabled = false;
        });
    });

    // on retire le surlignage d’erreur dès que l’utilisateur corrige
    ['cName', 'cEmail', 'cMessage'].forEach(function (id) {
      form[id].addEventListener('input', function () { markInvalid(form[id], false); });
    });
  };

})(window.RIFKUS);
