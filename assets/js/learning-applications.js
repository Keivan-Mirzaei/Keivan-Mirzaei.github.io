(async () => {
  const root = document.querySelector('[data-applications]');
  if (!root) return;
  try {
    const [{ typesetMath }, { initializeApplications }] = await Promise.all([
      import('./lib/math-typesetting.mjs'), import('./lib/learning-applications.mjs'),
    ]);
    await typesetMath(root);
    initializeApplications(document, globalThis.MathJax);
  } catch {
    // The typeset static figure remains available if mathematics cannot load.
  }
})();
