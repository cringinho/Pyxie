(function() {
  const containers = document.querySelectorAll('[data-pyxie-widget]');
  containers.forEach(function(el) {
    const lang = el.getAttribute('data-lang') || 'pt';
    const iframe = document.createElement('iframe');
    iframe.src = `https://pyxie.com.br/widget/card?lang=${lang}`;
    iframe.width = '340';
    iframe.height = '120';
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.borderRadius = '16px';
    iframe.title = 'Pyxie Discord Bot Widget';
    el.appendChild(iframe);
  });
})();
