/* Caricato senza defer nel <head>: decide prima del primo disegno se mostrare l'apertura,
   così la pagina non "lampeggia". L'apertura si vede una volta per sessione. */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  try {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !window.sessionStorage.getItem('sbl_intro')) {
      d.classList.add('intro-pending');
      window.sessionStorage.setItem('sbl_intro', '1');
    }
  } catch (e) { /* storage bloccato: niente apertura */ }
})();
