import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitRemaining, remainingMs, formatRemaining, formatTarget, toInputValue, fromInputValue,
} from '../countdown.js';

test('0秒ちょうどは終了', () => {
  assert.deepEqual(splitRemaining(0), { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
});

test('過去(負数)は終了で全て0', () => {
  assert.deepEqual(splitRemaining(-5000), { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true });
});

test('24時間ちょうどは1日0:00:00', () => {
  assert.deepEqual(splitRemaining(86400000), { days: 1, hours: 0, minutes: 0, seconds: 0, finished: false });
});

test('日・時・分・秒に分解', () => {
  const ms = ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000 + 999;
  assert.deepEqual(splitRemaining(ms), { days: 2, hours: 3, minutes: 4, seconds: 5, finished: false });
});

test('1秒未満は0秒で未終了', () => {
  assert.deepEqual(splitRemaining(500), { days: 0, hours: 0, minutes: 0, seconds: 0, finished: false });
});

test('null / undefined / NaN は null', () => {
  assert.equal(splitRemaining(null), null);
  assert.equal(splitRemaining(undefined), null);
  assert.equal(splitRemaining(NaN), null);
});

test('remainingMs: 未設定・不正はnull、通常は差分', () => {
  const now = Date.parse('2026-01-01T00:00:00Z');
  assert.equal(remainingMs(null, now), null);
  assert.equal(remainingMs('bad', now), null);
  assert.equal(remainingMs('2026-01-01T00:00:10Z', now), 10000);
});

test('formatRemaining はゼロ埋め', () => {
  assert.equal(formatRemaining({ days: 3, hours: 4, minutes: 5, seconds: 6 }), '3日 04:05:06');
});

test('formatTarget は M/D(曜) HH:mm', () => {
  const iso = new Date(2026, 9, 3, 18, 0).toISOString(); // 2026/10/3 土曜(ローカル)
  assert.equal(formatTarget(iso), '10/3(土) 18:00');
  assert.equal(formatTarget('bad'), '');
});

test('入力値変換の往復', () => {
  const iso = fromInputValue('2026-10-03T18:00');
  assert.equal(toInputValue(iso), '2026-10-03T18:00');
  assert.equal(fromInputValue(''), null);
  assert.equal(fromInputValue('xxx'), null);
});
