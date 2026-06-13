# elefit.gr — WebGL Personal Training Website

Premium, single-page WebGL ιστότοπος για την personal trainer **Ελευθερία Αναγνωστοπούλου**.
Φτιαγμένος με Vite + TypeScript + Three.js + GSAP + Lenis, με custom GLSL shaders, smooth
scroll, scroll-driven animations και πλήρη σεβασμό σε accessibility, SEO και performance.

> Όλο το ορατό περιεχόμενο είναι στα **Ελληνικά**. Ο κώδικας (μεταβλητές, σχόλια) στα Αγγλικά.

---

## ✨ Χαρακτηριστικά

- **WebGL hero** με custom, mouse-reactive, domain-warped simplex-noise shader.
- **WebGL gallery transitions** — RGB-shift + ripple distortion στο hover (DOM-synced planes).
- **Smooth scroll** (Lenis) συγχρονισμένο με **GSAP ScrollTrigger** και το Three.js render loop
  σε έναν ενιαίο clock (χωρίς jank / διπλό RAF).
- **Custom cursor**, **preloader** με progress, kinetic typography, split-text reveals.
- **Pinned horizontal scroll** στη μεθοδολογία, infinite marquee στις μαρτυρίες.
- **Web3Forms** φόρμα επικοινωνίας (AJAX, χωρίς reload).
- **Performance**: capped `devicePixelRatio` (≤2), pause render σε ανενεργό tab, lazy textures,
  code-splitting (three/gsap σε ξεχωριστά chunks).
- **Accessibility**: semantic HTML, landmarks, skip link, focus states, keyboard nav, ελληνικά
  alt texts, πλήρης σεβασμός `prefers-reduced-motion` (απενεργοποίηση βαριών animations).
- **SEO**: meta + Open Graph + Twitter cards στα ελληνικά, `lang="el"`, JSON-LD
  (LocalBusiness + Person), sitemap, robots.txt, favicon, web manifest.
- **WebGL fallback**: αν δεν υποστηρίζεται WebGL, εμφανίζονται κανονικά οι DOM εικόνες.

---

## 🚀 Τοπική εκτέλεση

Προαπαιτούμενα: **Node.js ≥ 18**.

```bash
npm install        # εγκατάσταση εξαρτήσεων
npm run dev        # development server (http://localhost:5173)
npm run build      # production build -> dist/
npm run preview    # τοπική προεπισκόπηση του build
npm run lint       # ESLint
npm run format     # Prettier
```

---

## 🧩 Τι πρέπει να αντικαταστήσεις (placeholders)

| # | Τι | Πού |
| --- | --- | --- |
| 1 | **Φωτογραφίες** μεταμορφώσεων | `public/assets/images/transformation-1…4.png` (δες το `README.md` εκεί) |
| 2 | **Web3Forms access key** | `index.html` → `<input name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY">` |
| 3 | **Social links** (Instagram κ.λπ.) | `index.html` (header, contact, footer, JSON-LD `sameAs`) |
| 4 | **Email / τηλέφωνο** | `index.html` (section Επικοινωνία & footer) |
| 5 | **Κείμενα / copy** | `index.html` (όλα τα sections — ρεαλιστικά ελληνικά placeholders) |
| 6 | **og-image / apple-touch-icon** | `public/og-image.png`, `public/apple-touch-icon.png` |
| 7 | **Domain στα meta/JSON-LD** | `index.html` (αν δεν είναι `elefit.gr`) + `public/sitemap.xml`, `public/robots.txt` |

### Web3Forms σε 2 βήματα
1. Πήγαινε στο [web3forms.com](https://web3forms.com), δώσε το email σου και πάρε ένα δωρεάν
   **Access Key**.
2. Αντικατέστησε το `YOUR_WEB3FORMS_ACCESS_KEY` στο `index.html`.

---

## 🎨 Design system

- **Χρώματα** (CSS custom properties στο `src/styles/tokens.css`):
  `--ink #0A0A0C` · `--bone #ECE8DF` · `--volt #D7FF3E` · `--ember #FF5A2C` · `--mist #6F6F78`.
- **Typography**: `Montserrat` (display) + `Inter` (UI/body) — variable fonts με ελληνικό subset,
  φορτωμένα από Google Fonts.
- **Motion**: custom cubic-bezier easings, staggered reveals, masked line animations.

---

## 📁 Δομή project

```
.
├─ index.html                 # markup + SEO + JSON-LD (ελληνικό περιεχόμενο)
├─ public/                    # static assets (served at site root)
│  ├─ favicon.svg, site.webmanifest, robots.txt, sitemap.xml
│  ├─ og-image.png, apple-touch-icon.png
│  └─ assets/images/          # φωτογραφίες gallery (placeholders)
├─ scripts/gen-placeholders.mjs   # παραγωγή placeholder εικόνων
└─ src/
   ├─ main.ts                 # entry — orchestration
   ├─ core/
   │  ├─ scroll.ts            # Lenis + GSAP ScrollTrigger sync
   │  └─ utils.ts             # helpers (reduced-motion, WebGL detect, lerp/damp…)
   ├─ gl/
   │  ├─ Stage.ts             # WebGLRenderer + render loop (resize, DPR cap, pause)
   │  ├─ Hero.ts              # hero shader pass (mouse-reactive)
   │  └─ Gallery.ts           # DOM-synced image planes + hover transition
   ├─ shaders/                # custom GLSL (.vert / .frag)
   │  ├─ hero.vert, hero.frag
   │  └─ gallery.vert, gallery.frag
   ├─ modules/                # preloader, cursor, header, reveals, method, marquee, form
   └─ styles/                 # tokens, base, components, sections, motion
```

---

## 🌐 Deployment

Το build βγαίνει στον φάκελο `dist/`. Το κρίσιμο σημείο είναι το **Vite `base`** (στο
`vite.config.ts`), που ορίζει το prefix των asset URLs.

### A) GitHub Pages — **project page** (`https://<user>.github.io/<repo>/`)
Το included GitHub Actions workflow (`.github/workflows/deploy.yml`) το κάνει αυτόματα: σε κάθε
push στο `main`, κάνει build με `BASE_PATH=/<repo>/` και deploy στο GitHub Pages.

Μία φορά, στο GitHub repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### B) Custom domain (elefit.gr), Netlify, Vercel, ή `<user>.github.io` repo
Εδώ το base πρέπει να είναι `'/'`:
- Το `vite.config.ts` ήδη κάνει default σε `'/'` όταν δεν υπάρχει `BASE_PATH`.
- Για **GitHub Pages με custom domain**: στο workflow άλλαξε το `BASE_PATH` σε `/`
  (ή σβήσε τη γραμμή `env: BASE_PATH`), και πρόσθεσε ένα αρχείο `public/CNAME` με περιεχόμενο
  `elefit.gr`. Στο GitHub: Settings → Pages → Custom domain.
- Για **Netlify**: build command `npm run build`, publish directory `dist`. Τίποτα άλλο.
- Για **Vercel**: framework «Vite», αυτόματα.

---

## 🛠️ Git — αρχικό setup & push

```bash
# μέσα στον φάκελο του project
git init
git add -A
git commit -m "Initial commit: elefit.gr WebGL site"
git branch -M main

# σύνδεση με το δικό σου remote (αντικατέστησε το URL)
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

Μετά το push, ενεργοποίησε **Settings → Pages → Source: GitHub Actions** και το site θα χτιστεί
και θα ανέβει αυτόματα.

---

## ♿ Accessibility & reduced motion

Με ενεργό `prefers-reduced-motion: reduce`: απενεργοποιούνται custom cursor, split-text, marquee,
horizontal pin και το hero shader «παγώνει» (στατικό), ενώ το site παραμένει **πλήρως
λειτουργικό** και αναγνώσιμο.

---

## 📊 Performance tips

- Συμπίεσε τις φωτογραφίες σε WebP/AVIF (< 200 KB) — δες `public/assets/images/README.md`.
- Το `devicePixelRatio` είναι capped στο 2· το render σταματά όταν το tab είναι ανενεργό.
- Για ακόμη χαμηλότερο GPU cost σε mobile, μπορείς να μειώσεις τα fbm octaves στο
  `src/shaders/hero.frag`.

---

© elefit.gr — Ελευθερία Αναγνωστοπούλου
