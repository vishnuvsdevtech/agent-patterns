/* Replays the recorded traces. The data is the product: nothing here invents a
   step, it only decides what to show and in what order. */
(() => {
  const $ = (s) => document.querySelector(s);
  const T = window.TRACES || [];
  let cur = 0, replayTimers = [];

  const PRETTY = {
    route: 'route', plan: 'plan', tool_call: 'call', tool_result: 'result',
    tool_error: 'error', retry: 'retry', judge: 'judge', revise: 'revise',
    answer: 'answer', refuse: 'refuse', fail: 'fail', request: 'request',
  };

  const CLAIMS = {
    'order-status': ['Routing with a reason', 'The route is chosen from weighted patterns and every weight is in the trace, so a wrong route can be argued with rather than guessed at.'],
    'shipping-retry': ['Retry with backoff', 'A tool returns 503 twice. The harness retries with 50 ms then 100 ms backoff and succeeds on the third try — the attempt number is on every call.'],
    'draft-reply': ['Chaining after a routing fix', 'Asking for a draft used to route to order status because the word "parcel" came first. The trace is what exposed it; scoring the verb fixed it.'],
    'judge-revise': ['A judge that disagrees', 'The first draft promises a delivery date it cannot know. The judge catches the promise, the revision drops that sentence, and a second judge pass confirms.'],
    'out-of-scope': ['Refusing beats guessing', 'No tool covers the weather, so it says so. This is the run that makes the other four believable.'],
  };

  function esc(s) {
    return String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  }

  function pretty(detail) {
    return esc(JSON.stringify(detail, null, 2));
  }

  function drawRuns() {
    $('#runs').innerHTML = T.map((t, i) => `
      <button class="run ${i === cur ? 'on' : ''} ${t.ok ? '' : 'failed'}" data-i="${i}">
        <b>${esc(t.title)}</b>
        <span class="meta">${t.steps.length} steps · ${Math.round(t.total_ms)} ms · ${esc(t.route || 'no route')}</span><br>
        <span class="tag">${t.ok ? 'completed' : 'refused'}</span>
      </button>`).join('');
    $('#runs').querySelectorAll('.run').forEach((b) => b.onclick = () => { cur = +b.dataset.i; render(); });
  }

  function drawClaims() {
    $('#claims').innerHTML = T.map((t) => {
      const c = CLAIMS[t.id] || ['', ''];
      return `<div class="claim"><b>${esc(c[0])}</b><p>${esc(c[1])}</p>
        <p style="margin-top:6px"><code>${esc(t.id)}</code></p></div>`;
    }).join('');
  }

  function render() {
    clearTimers();
    const t = T[cur];
    if (!t) return;
    drawRuns();

    const calls = t.steps.filter((s) => s.kind === 'tool_call').length;
    const retries = t.steps.filter((s) => s.kind === 'retry').length;
    const judged = t.steps.filter((s) => s.kind === 'judge').length;

    $('#runMeta').textContent = `${t.id} · ${t.steps.length} steps · ${Math.round(t.total_ms)} ms`;
    $('#runTitle').textContent = t.title;
    $('#ask').innerHTML = `<span>request</span>${esc(t.request)}`;
    $('#verdict').innerHTML = `
      <span>route <b>${esc(t.route || '—')}</b></span>
      <span>tool calls <b>${calls}</b></span>
      <span>retries <b>${retries}</b></span>
      <span>judge passes <b>${judged}</b></span>
      <span>outcome <b style="color:${t.ok ? 'var(--acc)' : 'var(--red)'}">${t.ok ? 'answered' : 'refused'}</b></span>`;

    $('#steps').innerHTML = t.steps.map((s, i) => {
      const name = s.name || '';
      const sub = s.detail && s.detail.attempt ? `<em> attempt ${s.detail.attempt}</em>` : '';
      return `<li class="step" data-i="${i}" data-kind="${s.kind}">
        <div class="step-row">
          <span class="i">${String(s.i).padStart(2, '0')}</span>
          <span class="kind ${s.kind}">${PRETTY[s.kind] || s.kind}</span>
          <span class="name">${esc(name)}${sub}</span>
          <span class="ms">${s.ms < 1 ? '&lt;1' : Math.round(s.ms)} ms</span>
        </div>
        <div class="detail"><pre>${pretty(s.detail)}</pre></div>
      </li>`;
    }).join('');

    $('#steps').querySelectorAll('.step').forEach((li) => {
      li.querySelector('.step-row').onclick = () => li.classList.toggle('open');
      li.classList.add('seen');
    });

    $('#answer').innerHTML = `<span>delivered</span>${esc(t.answer)}`;
    $('#replay').onclick = () => replay(t);
  }

  function clearTimers() { replayTimers.forEach(clearTimeout); replayTimers = []; }

  function replay(t) {
    clearTimers();
    const items = [...$('#steps').querySelectorAll('.step')];
    items.forEach((li) => li.classList.remove('seen'));
    items.forEach((li, i) => {
      replayTimers.push(setTimeout(() => li.classList.add('seen'), 130 * i));
    });
    // leave the failing step open, since it is the reason to watch
    const bad = items.findIndex((li) => ['tool_error', 'revise', 'refuse', 'fail'].includes(li.dataset.kind));
    if (bad >= 0) replayTimers.push(setTimeout(() => items[bad].classList.add('open'), 130 * bad + 260));
  }

  const savedTheme = localStorage.getItem('ap.theme');
  document.documentElement.dataset.theme = savedTheme || 'dark';
  $('#theme').onclick = () => {
    const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = n;
    localStorage.setItem('ap.theme', n);
  };

  drawClaims();
  render();
  document.documentElement.dataset.ready = '1';
})();
