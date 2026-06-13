/* ============================================================
   Contact form — submits to Web3Forms via fetch (no page reload),
   with inline Greek status messaging and basic guards.
   Replace the access_key in index.html (see README).
   ============================================================ */
export function initForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'contact__status';
    status.textContent = 'Αποστολή…';

    const data = new FormData(form);

    // Guard against the unconfigured placeholder key.
    if (data.get('access_key') === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      status.classList.add('is-error');
      status.textContent =
        'Η φόρμα δεν έχει ρυθμιστεί ακόμη. Πρόσθεσε το Web3Forms access key (δες το README).';
      return;
    }

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const json = (await res.json()) as { success: boolean };
      if (json.success) {
        status.classList.add('is-ok');
        status.textContent = 'Ευχαριστώ! Το μήνυμά σου στάλθηκε — θα επικοινωνήσω σύντομα.';
        form.reset();
      } else {
        throw new Error('failed');
      }
    } catch {
      status.classList.add('is-error');
      status.textContent = 'Κάτι πήγε στραβά. Δοκίμασε ξανά ή στείλε email στο hello@elefit.gr.';
    }
  });
}
