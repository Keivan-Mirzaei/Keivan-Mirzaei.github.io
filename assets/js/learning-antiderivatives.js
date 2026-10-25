(async () => {
  const root = document.querySelector('[data-antiderivatives]');
  if (!root) return;
  try {
    const [{ typesetMath }, { initializeAntiderivatives }] = await Promise.all([
      import('./lib/math-typesetting.mjs'), import('./lib/learning-antiderivatives.mjs'),
    ]);
    await typesetMath(root);
    if (root.isConnected) initializeAntiderivatives(root, globalThis.MathJax);
  } catch {
    // The complete static pair of graphs remains readable without interaction.
  }
})();
