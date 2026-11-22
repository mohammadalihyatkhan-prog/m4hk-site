// Archive controls: All / Available, and Register / Pictures.
// Without this script the page shows the whole register, which is the right fallback.
(function () {
  var root = document.querySelector('[data-archive]');
  if (!root) return;
  var tools = root.querySelector('.tools');
  var register = root.querySelector('[data-register]');
  var pictures = root.querySelector('[data-pictures]');
  var state = { only: 'false', view: 'register' };
  var q = new URLSearchParams(location.search);
  if (q.get('show') === 'available') state.only = 'true';
  if (q.get('view') === 'pictures') state.view = 'pictures';

  function apply() {
    var only = state.only === 'true';
    document.body.classList.toggle('only-avail', only);
    register.hidden = state.view !== 'register';
    pictures.hidden = state.view !== 'pictures';
    root.querySelectorAll('[data-set]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(state[b.getAttribute('data-set')] === b.getAttribute('data-val')));
    });
    root.querySelectorAll('[data-group]').forEach(function (g) {
      var n = Number(g.getAttribute(only ? 'data-n-avail' : 'data-n-all'));
      g.hidden = n === 0;
      var s = g.querySelector('small');
      if (s) s.textContent = n + (n === 1 ? ' entry' : ' entries');
    });
    var parts = [];
    if (only) parts.push('show=available');
    if (state.view === 'pictures') parts.push('view=pictures');
    if (!root.hasAttribute('data-nostate')) try { history.replaceState(null, '', location.pathname + (parts.length ? '?' + parts.join('&') : '')); } catch (e) {}
  }

  tools.addEventListener('click', function (e) {
    var b = e.target.closest('[data-set]');
    if (!b) return;
    state[b.getAttribute('data-set')] = b.getAttribute('data-val');
    apply();
  });
  tools.hidden = false;
  apply();
})();
