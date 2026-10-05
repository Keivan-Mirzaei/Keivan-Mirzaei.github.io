// Native details handle independent opening, closing, and accessibility.
// Escape closes the article row containing focus and returns to its summary.
document.querySelectorAll('.problem-disclosures').forEach(group => {
  group.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const row = event.target.closest('details[open]');
    if (!row || row.parentElement !== group) return;
    row.open = false;
    row.querySelector('summary').focus();
    event.preventDefault();
    event.stopPropagation();
  });
});
