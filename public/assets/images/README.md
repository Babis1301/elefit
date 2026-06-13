# Εικόνες — τι να αντικαταστήσεις

Οι εικόνες εδώ είναι **placeholder** (αυτόματα παραγόμενα gradients). Αντικατέστησέ τες με
πραγματικές φωτογραφίες, κρατώντας τα **ίδια ονόματα αρχείων** (ή ενημέρωσε τα paths στο
`index.html`).

## Λίστα εικόνων

| Αρχείο | Χρήση | Προτεινόμενες διαστάσεις | Λόγος πλευρών |
| --- | --- | --- | --- |
| `transformation-1.png` … `transformation-4.png` | Gallery «Αποτελέσματα» (WebGL hover effect) | 900 × 1200 px | 3:4 (portrait) |
| `../../og-image.png` (στο `public/`) | Open Graph / social share | 1200 × 630 px | 1.91:1 |
| `../../apple-touch-icon.png` (στο `public/`) | Εικονίδιο iOS | 180 × 180 px | 1:1 |

## Συμβουλές για performance & Awwwards

- Προτίμησε **WebP** ή **AVIF** αντί για PNG/JPG (μικρότερο μέγεθος, ίδια ποιότητα).
  Αν αλλάξεις επέκταση, ενημέρωσε το `src` **και** το `data-gl-image` στο `index.html`.
- Συμπίεσε τις εικόνες (π.χ. [squoosh.app](https://squoosh.app)) — στόχευσε < 200 KB ανά εικόνα.
- Κράτα τον ίδιο λόγο πλευρών (3:4) για να μην «κόβονται» άσχημα στο gallery.
- Για το gallery, φωτογραφίες με καθαρό θέμα και καλό κοντράστ αποδίδουν καλύτερα στο WebGL
  RGB-shift effect.

## Αναπαραγωγή των placeholders

```bash
node scripts/gen-placeholders.mjs
```
