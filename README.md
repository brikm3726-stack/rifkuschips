# RIFKUS — site officiel

Site vitrine premium de la marque algérienne de chips et snacks **RIFKUS**.
HTML / CSS / JavaScript natifs : **aucune compilation, aucune dépendance**.
On ouvre `index.html` et le site fonctionne.

---

## Mise en ligne

Le site est entièrement statique. Trois options, de la plus simple à la plus pro :

| Hébergeur | Marche à suivre |
|---|---|
| **GitHub Pages** | Déposer le dossier dans un dépôt → *Settings → Pages* → branche `main`, dossier `/root` |
| **Netlify / Vercel** | Glisser-déposer le dossier sur la page « deploy » |
| **Hébergement classique** | Envoyer tout le dossier en FTP à la racine du domaine |

Aucun réglage serveur n'est nécessaire.

### Aperçu en local

Un double-clic sur `index.html` suffit. Pour un rendu strictement identique à la
production (chemins, cache) :

```bash
npx http-server -p 8000
```

---

## À personnaliser avant la mise en ligne

Tout est regroupé, rien n'est éparpillé dans le code.

**1. Le formulaire de contact** — `assets/js/contact.js`, tout en haut :

```js
var WEB3FORMS_KEY  = '';                     // ← clé gratuite sur web3forms.com
var FALLBACK_EMAIL = 'contact@rifkus.dz';    // ← votre adresse
```

Tant que `WEB3FORMS_KEY` est vide, le formulaire ouvre le logiciel de messagerie
du visiteur avec le message déjà rempli : **aucun message n'est perdu**. Une fois
la clé renseignée, les messages arrivent directement par e-mail.

> Web3Forms est utilisé plutôt que FormSubmit car ce dernier est mal joignable
> depuis l'Algérie. Si l'envoi échoue malgré tout, le site retombe
> automatiquement sur la messagerie.

**2. Les liens sociaux** — `index.html`, section `.contact__social` : remplacer
les `href="#"` par les vraies URL Facebook / Instagram / TikTok.

**3. L'adresse e-mail** — visible à deux endroits dans `index.html`
(carte « E-mail » et pied de page) : rechercher `contact@rifkus.dz`.

**4. Le domaine** — `index.html`, balise `<link rel="canonical">` et
`og:image` si le site est servi ailleurs qu'à la racine.

---

## Structure

```
rifkus-site 2/
├─ index.html                  toute la structure et le contenu éditorial
├─ assets/
│  ├─ css/
│  │  ├─ base.css              jetons de design, typographie, boutons, animations
│  │  ├─ layout.css            ouverture, navbar, bandeau, footer, fiche produit
│  │  └─ sections.css          hero, saveurs, promesse, mood, story, presse, contact
│  ├─ js/
│  │  ├─ ui.js                 socle : découpe des titres, apparitions, compteurs, focus
│  │  ├─ nav.js                navbar collante, menu mobile, lien actif
│  │  ├─ hero.js               particules canvas, parallaxe des sachets
│  │  ├─ flavors.js            filtres par gamme + fiche produit
│  │  ├─ mood.js               « Choisis ton mood »
│  │  ├─ contact.js            validation + envoi du formulaire
│  │  └─ main.js               orchestration
│  └─ img/
│     ├─ packs/                les 10 sachets, détourés sur fond transparent
│     ├─ kv/                   visuels de campagne et photos d'ambiance
│     ├─ logo-rifkus.webp
│     └─ favicon.svg
└─ README.md
```

### Ajouter ou modifier une saveur

Les cartes produits sont écrites **directement dans `index.html`** (et non
générées en JavaScript) : le contenu reste visible pour Google et s'affiche même
si le JavaScript échoue. La fiche produit lit les attributs de la carte, il n'y a
donc qu'un seul endroit à modifier.

```html
<article class="flavor-card anim" data-anim="card"
  data-range="chips"                       <!-- chips | rings | puffs | feu -->
  style="--f:#F2A900; --f-deep:#5E3800"    <!-- couleur vive + couleur sombre -->
  data-name="Trois Fromages"
  data-label="Potato Chips"
  data-img="assets/img/packs/chips-trois-fromages.webp"
  data-heat="1"                            <!-- intensité de 1 à 5 -->
  data-moment="La soirée film"
  data-kcal="160"                          <!-- facultatif : la ligne disparaît si absent -->
  data-long="Texte long affiché dans la fiche produit.">
```

`data-range` doit correspondre à un bouton de filtre (`data-filter`) de la
section. `--f` pilote la couleur de la carte, du halo, de la fiche produit et
des effets au survol.

### Modifier les recommandations « mood »

`assets/js/mood.js`, objet `MOODS` en haut du fichier. Le champ `flavor` doit
reprendre **exactement** un `data-name` de carte.

---

## Choix techniques

**Sachets détourés.** Les visuels d'origine sont sur fond blanc. Ils ont été
détourés (fond rendu transparent) pour pouvoir flotter en 3D dans le hero et sur
les cartes. Le sachet Pizza, qui n'existait qu'au sein d'une photo de groupe, a
été reconstitué par silhouette.

**Logo du sachet Pizza — retouché.** La seule photo disponible de ce sachet
montrait l'**ancien** personnage (moustache épaisse), alors que les neuf autres
portent le personnage actuel, plus jeune. Le bloc logo a donc été remplacé par
`logo-rifkus.webp` : le lettrage « RIFKUS » a servi d'ancre pour calculer
l'échelle et la position, et le logo posé reprend l'ombrage du sachet pour ne
pas faire autocollant. **Si un jour vous obtenez une vraie photo de ce sachet
avec le bon personnage, remplacez simplement le fichier** — c'est un montage,
pas une photo d'origine.

**Aucune dépendance.** Pas de framework, pas de bibliothèque d'animation. Les
apparitions au scroll utilisent `IntersectionObserver`, les particules un
`<canvas>` léger qui se met en pause dès que le hero sort de l'écran ou que
l'onglet passe en arrière-plan.

**Poids.** ~1,5 Mo d'images au total, toutes en WebP, tout ce qui est sous la
ligne de flottaison est en `loading="lazy"`.

**Polices.** Anton (titres) et Outfit (texte) via Google Fonts, avec une pile de
secours système : si Google Fonts est bloqué, le site reste lisible et bien
composé.

**Accessibilité.** Navigation complète au clavier, piège de focus dans la fiche
produit, lien d'évitement, libellés ARIA, et respect de `prefers-reduced-motion`
— toutes les animations se coupent pour les visiteurs qui le demandent.

**Compatibilité.** Chrome, Edge, Firefox, Safari (bureau et mobile), versions
récentes. Testé au rendu en 1440 px, 820 px et 390 px.

**Images inutilisées.** `assets/img/kv/` contient encore `harissa-trone.webp`,
`harissa-feu.webp` et `poulet.webp`, qui servaient à l'ancienne galerie. Plus
rien ne les référence (elles ne sont donc jamais téléchargées) : on peut les
supprimer, ou les garder sous la main pour une future section.
