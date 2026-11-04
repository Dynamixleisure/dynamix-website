/* Shared behaviour for the About, Clients and projects and Blog pages */
(function () {
  document.querySelectorAll('.year').forEach(function (e) { e.textContent = new Date().getFullYear(); });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  var nav = document.getElementById('nav');
  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () { nav.classList.toggle('open'); });
  document.querySelectorAll('.nav ul a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });

  var topBtn = document.getElementById('totop'), progress = document.getElementById('progress');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) {
      nav.classList.toggle('scrolled', y > 40);
      nav.classList.toggle('hide', y > lastY && y > 260 && !nav.classList.contains('open'));
    }
    lastY = y;
    if (progress && max > 0) progress.style.width = (y / max * 100) + '%';
    if (topBtn) topBtn.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* if the animation libraries could not load, never leave content hidden */
  function showAll() {
    document.querySelectorAll('.r').forEach(function (e) { e.style.opacity = 1; e.style.transform = 'none'; });
    document.querySelectorAll('.logos').forEach(function (l) { l.classList.add('in'); });
    document.querySelectorAll('.member .photo, .venue .bg').forEach(function (e) { e.style.clipPath = 'none'; });
  }
  if (!window.gsap || !window.ScrollTrigger) {
    showAll();
    if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* smooth scroll (Lenis) */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToTarget(target, offset) {
    if (lenis) lenis.scrollTo(target, { offset: offset || 0, duration: 1.2 });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
  }
  document.querySelectorAll('[data-top]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); scrollToTarget(0); });
  });
  /* in-page links such as the article contents list */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    a.addEventListener('click', function (e) {
      var t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      scrollToTarget(t, -90);
      history.replaceState(null, '', '#' + id);
    });
  });

  if (reduce) { showAll(); return; }

  /* section reveals: wait for the font so split headlines are measured correctly */
  var fontsReady = (document.fonts && document.fonts.load)
    ? Promise.race([document.fonts.load('800 1em Montserrat'), new Promise(function (r) { setTimeout(r, 2500); })]).catch(function () {})
    : Promise.resolve();
  fontsReady.then(function () {
  document.querySelectorAll('section, .page-hero, .post-head, .post-hero').forEach(function (sec) {
    var items = sec.querySelectorAll('.r');
    if (sec.classList.contains('r')) items = [sec];
    if (!items.length) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 82%', once: true,
      onEnter: function () {
        items.forEach(function (el) {
          if (el.matches && el.matches('h1, h2') && window.SplitText && !el.dataset.split && el.offsetWidth > 0) {
            el.dataset.split = '1';
            try {
              var split = SplitText.create(el, { type: 'lines', mask: 'lines' });
              gsap.set(el, { opacity: 1, y: 0 });
              gsap.from(split.lines, { yPercent: 110, duration: 1.1, stagger: .1, ease: 'power4.out', onComplete: function () { split.revert(); } });
            } catch (err) {}
          }
        });
        gsap.to(items, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'power3.out' });
        var phs = sec.querySelectorAll('.member .photo, .venue .bg');
        if (phs.length) gsap.fromTo(phs, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, stagger: .09, ease: 'power4.out' });
      }
    });
  });

    ScrollTrigger.refresh();
  });

  /* client logo wall */
  var logos = document.querySelector('.logos');
  if (logos) ScrollTrigger.create({ trigger: logos, start: 'top 85%', once: true, onEnter: function () { logos.classList.add('in'); } });

  /* gentle photo parallax inside cards (desktop) */
  gsap.matchMedia().add('(min-width: 801px)', function () {
    gsap.utils.toArray('.member .photo img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* magnetic buttons (desktop, fine pointer only) */
  if (fine) {
    gsap.utils.toArray('.nav .cta, .btn, .totop-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) { var r = btn.getBoundingClientRect(); gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * .32, y: (e.clientY - r.top - r.height / 2) * .32, duration: .4, ease: 'power3.out' }); });
      btn.addEventListener('mouseleave', function () { gsap.to(btn, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1, .45)' }); });
    });
  }
})();
