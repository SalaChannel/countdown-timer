import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTimers, parseTimers, loadTimers, saveTimers, STORAGE_KEY } from '../storage.js';

const empty = () => Array.from({ length: 3 }, () => ({ label: '', target: null }));

test('壊れたJSONは未設定3枠', () => {
  assert.deepEqual(parseTimers('{broken'), empty());
  assert.deepEqual(parseTimers(null), empty());
});

test('配列でない/要素数不一致は未設定3枠', () => {
  assert.deepEqual(normalizeTimers({}), empty());
  assert.deepEqual(normalizeTimers([]), empty());
  assert.deepEqual(normalizeTimers([{ label: 'a', target: null }]), empty());
  assert.deepEqual(normalizeTimers([1, 2, 3, 4]), empty());
});

test('不正な日付は null に正規化', () => {
  const r = normalizeTimers([
    { label: 'a', target: 'not-a-date' },
    { label: 'b', target: 123 },
    { label: 'c', target: '2026-10-03T09:00:00.000Z' },
  ]);
  assert.equal(r[0].target, null);
  assert.equal(r[1].target, null);
  assert.equal(r[2].target, '2026-10-03T09:00:00.000Z');
});

test('名前は20文字に切り詰め、非文字列は空', () => {
  const r = normalizeTimers([{ label: 'あ'.repeat(30), target: null }, { label: 5 }, null]);
  assert.equal(r[0].label.length, 20);
  assert.equal(r[1].label, '');
  assert.deepEqual(r[2], { label: '', target: null });
});

test('保存→読込の往復', () => {
  const mem = new Map();
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const data = [
    { label: '旅行', target: '2026-10-03T09:00:00.000Z' },
    { label: '', target: null },
    { label: '締切', target: null },
  ];
  assert.equal(saveTimers(st, data), true);
  assert.ok(mem.has(STORAGE_KEY));
  assert.deepEqual(loadTimers(st), data);
});

test('storageが例外を投げても落ちない', () => {
  const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } };
  assert.deepEqual(loadTimers(bad), empty());
  assert.equal(saveTimers(bad, empty()), false);
});
