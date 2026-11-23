// m4hk.com: the small behaviours. Every page works without this file.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Portfolio: All / Selected / Available, and Register / Pictures
  var root = document.querySelector('[data-portfolio]');
  if (root) {
    var tools = root.querySelector('.tools');
    var register = root.querySelector('[data-register]');
    var pictures = root.querySelector('[data-pictures]');
    var state = { show: 'all', view: 'register' };
    var q = new URLSearchParams(location.search);
    if (q.get('show') === 'selected' || q.get('show') === 'available') state.show = q.get('show');
    if (q.get('view') === 'pictures') state.view = 'pictures';
    var apply = function () {
      document.body.classList.remove('f-selected', 'f-available');
      if (state.show !== 'all') document.body.classList.add('f-' + state.show);
      register.hidden = state.view !== 'register';
      pictures.hidden = state.view !== 'pictures';
      root.querySelectorAll('[data-set]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(state[b.getAttribute('data-set')] === b.getAttribute('data-val')));
      });
      root.querySelectorAll('[data-group]').forEach(function (g) {
        var n = Number(g.getAttribute('data-n-' + state.show));
        g.hidden = n === 0;
        var s = g.querySelector('small');
        if (s) s.textContent = n + (n === 1 ? ' entry' : ' entries');
      });
      var parts = [];
      if (state.show !== 'all') parts.push('show=' + state.show);
      if (state.view === 'pictures') parts.push('view=pictures');
      try { history.replaceState(null, '', location.pathname + (parts.length ? '?' + parts.join('&') : '')); } catch (e) {}
    };
    tools.addEventListener('click', function (e) {
      var b = e.target.closest('[data-set]');
      if (!b) return;
      state[b.getAttribute('data-set')] = b.getAttribute('data-val');
      apply();
    });
    tools.hidden = false;
    apply();
  }

  // Home 1, the wall: move along it with the wheel, by dragging, or with the two buttons
  var wall = document.querySelector('div.wall');
  if (wall) {
    var nav = document.querySelector('.wallnav');
    var prev = document.querySelector('[data-wall="prev"]'), next = document.querySelector('[data-wall="next"]');
    var ends = function () {
      var max = wall.scrollWidth - wall.clientWidth;
      prev.disabled = wall.scrollLeft <= 2;
      next.disabled = wall.scrollLeft >= max - 2;
    };
    wall.classList.add('js');
    nav.hidden = false;
    wall.addEventListener('wheel', function (e) {
      if (e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var step = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? wall.clientWidth : 1);
      var max = wall.scrollWidth - wall.clientWidth;
      var to = Math.max(0, Math.min(max, wall.scrollLeft + step));
      if (to !== wall.scrollLeft) { wall.scrollLeft = to; e.preventDefault(); }
    }, { passive: false });
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        var d = (b === next ? 1 : -1) * wall.clientWidth * 0.7;
        wall.scrollBy({ left: d, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
    var tick = false;
    wall.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; ends(); }); }
    }, { passive: true });
    window.addEventListener('resize', ends);
    ends();
    var down = false, moved = false, sx = 0, sl = 0;
    wall.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = wall.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5 && !moved) { moved = true; wall.classList.add('drag'); }
      if (moved) wall.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; wall.classList.remove('drag'); });
    wall.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    wall.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  // Home 2, the titles: the picture follows the title under the pointer, or the one being read
  var pic = document.querySelector('.tl-pic');
  if (pic) {
    var img = pic.querySelector('img'), link = pic.querySelector('a'), no = pic.querySelector('.no'), em = pic.querySelector('em');
    var links = [].slice.call(document.querySelectorAll('.tl-run a'));
    var cur = document.querySelector('.tl-run a.on');
    var show = function (a) {
      if (a === cur) return;
      if (cur) cur.classList.remove('on');
      cur = a;
      a.classList.add('on');
      img.src = a.getAttribute('data-pic');
      img.alt = a.textContent;
      link.href = a.href;
      no.textContent = a.getAttribute('data-no');
      em.textContent = a.textContent;
    };
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { show(a); });
      a.addEventListener('focus', function () { show(a); });
    });
    if (window.matchMedia('(hover: none), (max-width: 900px)').matches) {
      var waiting = false;
      var near = function () {
        waiting = false;
        var y = window.innerHeight * 0.62, best = null, bd = 1e9;
        links.forEach(function (a) {
          var r = a.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - y);
          if (d < bd) { bd = d; best = a; }
        });
        if (best) show(best);
      };
      window.addEventListener('scroll', function () { if (!waiting) { waiting = true; requestAnimationFrame(near); } }, { passive: true });
    }
  }

  // Home 3, one picture: a different one of the selection on each visit
  var ones = [].slice.call(document.querySelectorAll('[data-one]'));
  if (ones.length > 1) {
    var pick = Math.floor(Math.random() * ones.length);
    ones.forEach(function (el, i) { el.hidden = i !== pick; });
  }
})();
