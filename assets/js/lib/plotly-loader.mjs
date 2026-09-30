let pending;

export function loadPlotly(url) {
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    const timeout = setTimeout(() => fail(new Error('Plot library timed out')), 20000);
    function fail(error) {
      clearTimeout(timeout);
      script.remove();
      reject(error);
    }
    script.onload = () => {
      clearTimeout(timeout);
      if (window.Plotly) resolve(window.Plotly);
      else fail(new Error('Plot library did not initialize'));
    };
    script.onerror = () => fail(new Error('Plot library could not load'));
    document.head.append(script);
  }).catch((error) => { pending = undefined; throw error; });
  return pending;
}
