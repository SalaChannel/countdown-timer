import {
  splitRemaining, remainingMs, formatRemaining, formatTarget, toInputValue, fromInputValue,
} from './countdown.js';
import { loadTimers, saveTimers, MAX_LABEL } from './storage.js';

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const labelEl = $('label');
const targetEl = $('target');
const messageEl = $('message');
const tabEls = [...document.querySelectorAll('#tabs button')];

let timers = loadTimers(window.localStorage);
let selected = 0;

// カード生成
const cardEls = timers.map((_, i) => {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.slot = String(i);
  el.innerHTML =
    '<div class="card-head"><span class="card-name"></span><span class="card-target"></span></div>' +
    '<div class="card-remain"></div>';
  el.addEventListener('click', () => select(i));
  cardsEl.appendChild(el);
  return el;
});

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.classList.toggle('error', isError);
}

function fillInputs() {
  const t = timers[selected];
  labelEl.value = t.label;
  targetEl.value = t.target ? toInputValue(t.target) : '';
}

function select(i) {
  selected = i;
  fillInputs();
  showMessage('');
  render();
}

function render() {
  const now = Date.now();
  timers.forEach((t, i) => {
    const el = cardEls[i];
    const r = splitRemaining(remainingMs(t.target, now));
    const remainEl = el.querySelector('.card-remain');
    el.querySelector('.card-name').textContent = t.label || `タイマー${i + 1}`;
    el.classList.toggle('selected', i === selected);
    el.classList.toggle('empty', !r);
    el.classList.toggle('finished', !!r && r.finished);
    if (!r) {
      el.querySelector('.card-target').textContent = '';
      remainEl.textContent = '未設定　タップして設定';
    } else {
      el.querySelector('.card-target').textContent = formatTarget(t.target);
      remainEl.textContent = r.finished ? '終了' : formatRemaining(r);
    }
  });
  tabEls.forEach((b, i) => b.setAttribute('aria-selected', String(i === selected)));
}

tabEls.forEach((b, i) => b.addEventListener('click', () => select(i)));

$('save').addEventListener('click', () => {
  if (!targetEl.value) {
    showMessage('日時を入力してください', true);
    return;
  }
  const target = fromInputValue(targetEl.value);
  if (!target) {
    showMessage('日時を入力してください', true);
    return;
  }
  timers = timers.map((t, i) =>
    i === selected ? { label: labelEl.value.trim().slice(0, MAX_LABEL), target } : t);
  const ok = saveTimers(window.localStorage, timers);
  if (ok) showMessage(`タイマー${selected + 1}を保存しました`);
  else showMessage('保存できませんでした（プライベートブラウズでは保存されません）', true);
  render();
});

$('clear').addEventListener('click', () => {
  timers = timers.map((t, i) => (i === selected ? { label: '', target: null } : t));
  const ok = saveTimers(window.localStorage, timers);
  fillInputs();
  if (ok) showMessage(`タイマー${selected + 1}をクリアしました`);
  else showMessage('保存できませんでした（プライベートブラウズでは保存されません）', true);
  render();
});

// ダブルタップ拡大・ピンチを抑制（iOS Safari）
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const n = Date.now();
  if (n - lastTouchEnd < 350) e.preventDefault();
  lastTouchEnd = n;
}, { passive: false });
['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) =>
  document.addEventListener(ev, (e) => e.preventDefault()));

document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
window.addEventListener('pageshow', render);

fillInputs();
render();
setInterval(render, 1000);
