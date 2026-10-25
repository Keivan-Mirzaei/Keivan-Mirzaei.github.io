(async () => {
  const root = document.querySelector('[data-riemann]');
  if (!root) return;
  try {
    const [{ typesetMath }, { initializeRiemann }] = await Promise.all([
      import('./lib/math-typesetting.mjs'), import('./lib/learning-riemann.mjs'),
    ]);
    await typesetMath(root);
    if (root.isConnected) initializeRiemann(root, globalThis.MathJax);
  } catch {
    // The initial rectangles, labels and values remain available without interaction.
  }
})();
