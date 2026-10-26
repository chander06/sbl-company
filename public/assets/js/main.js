/* SBL™ Company — main.js (nessuna dipendenza) */
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ---------- Divide un testo in parole (.w) mantenendo i tag interni (es. <em>) ---------- */
  function splitWords(el, startIndex) {
    var i = startIndex || 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = doc.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var s = doc.createElement('span');
            s.className = 'w';
            s.style.setProperty('--i', i++);
            s.textContent = p;
            frag.appendChild(s);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    }
    walk(el);
    return i;
  }

  /* ---------- Titolo hero: da sfocato a nitido ---------- */
  var blurTitle = doc.querySelector('[data-blur-title]');
  if (blurTitle) splitWords(blurTitle, 0);

  function loaded() { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); }
  if (doc.readyState === 'complete') loaded(); else window.addEventListener('load', loaded);
  setTimeout(loaded, 2500); // se qualche risorsa tarda, il titolo compare comunque

  /* ---------- Reveal allo scroll ---------- */
  var revealEls = doc.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contatori ---------- */
  var counters = doc.querySelectorAll('[data-count]');
  function runCounter(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from') || '0');
    var suffix = el.getAttribute('data-suffix') || '';
    var t0 = null, dur = 1600;
    function frame(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(from + (to - from) * e) + suffix;
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Frase che si "accende" parola per parola ---------- */
  var lightEl = doc.querySelector('[data-light-words]');
  var lightWords = [];
  if (lightEl && !reduce) {
    splitWords(lightEl, 0);
    lightWords = Array.prototype.slice.call(lightEl.querySelectorAll('.w'));
  }
  function updateLight() {
    if (!lightWords.length) return;
    var r = lightEl.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    var lit = Math.round(p * lightWords.length);
    for (var i = 0; i < lightWords.length; i++) lightWords[i].classList.toggle('is-lit', i < lit);
  }

  /* ---------- Isola di navigazione ---------- */
  var island = doc.querySelector('[data-island]');
  var toggle = island && island.querySelector('.island__toggle');
  function setMenu(open) {
    if (!island) return;
    island.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    doc.body.classList.toggle('menu-open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!island.classList.contains('is-open')); });
    island.querySelectorAll('.island__links a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); });
  }
  if (island && finePointer) {
    island.addEventListener('pointermove', function (e) {
      var r = island.getBoundingClientRect();
      island.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    });
  }

  /* ---------- Progetti: iPhone che cambia schermata ---------- */
  var work = doc.querySelector('.work');
  var scroller = doc.querySelector('[data-work]');
  var shots = [], items = [], dots = [], current = -1;
  if (work && scroller && !reduce) {
    work.classList.add('is-animated');
    shots = Array.prototype.slice.call(work.querySelectorAll('.work__shot'));
    items = Array.prototype.slice.call(work.querySelectorAll('.work__item'));
    dots = Array.prototype.slice.call(work.querySelectorAll('.work__progress i'));
    work.style.setProperty('--n', items.length);
    // carica subito le schermate, così il cambio è istantaneo
    shots.forEach(function (img) { img.loading = 'eager'; });
  }
  function setWork(i) {
    if (i === current) return;
    current = i;
    [shots, items, dots].forEach(function (list) {
      list.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
    });
  }
  function updateWork() {
    if (!items.length) return;
    var r = scroller.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
    scroller.style.setProperty('--p', p.toFixed(3));
    setWork(Math.min(items.length - 1, Math.floor(p * items.length)));
  }
  if (items.length) setWork(0);

  /* ---------- Pulsante WhatsApp fisso ---------- */
  var fab = doc.querySelector('.fab');
  var hero = doc.querySelector('.hero');
  var contact = doc.querySelector('#contatti');
  var footer = doc.querySelector('.footer');

  /* ---------- Un solo ciclo di scroll ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (island) island.classList.toggle('is-compact', y > 80);
    updateLight();
    updateWork();
    if (fab && hero) {
      var vh = window.innerHeight;
      var pastHero = hero.getBoundingClientRect().bottom < vh * 0.4;
      var nearEnd = (contact && contact.getBoundingClientRect().top < vh * 0.9) || (footer && footer.getBoundingClientRect().top < vh);
      fab.classList.toggle('is-shown', pastHero && !nearEnd);
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();
