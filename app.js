'use strict';

/* =========================================================
   Monogatory ~愛着が育む、モノとの長いお付き合い~
   データは端末のブラウザ（localStorage）にのみ保存されます
   ========================================================= */

const CONFIG = Object.assign({ submitUrl: '', studyName: '' }, window.KASATOMO_CONFIG || {});
const STORE_KEY = 'kasatomo:v1';
const APP_VERSION = '1.0.0';
const MAX_LV = 30;

const COLORS = [
  { id: 'coral', name: 'コーラル', main: '#E8785D' },
  { id: 'navy', name: 'ネイビー', main: '#3F5E96' },
  { id: 'green', name: 'グリーン', main: '#5E9E73' },
  { id: 'yellow', name: 'イエロー', main: '#F2BE4A' },
  { id: 'pink', name: 'ピンク', main: '#E895B2' },
  { id: 'black', name: 'ブラック', main: '#3A3D44' },
  { id: 'clear', name: 'とうめい', main: '#D9EAF2' }
];
const TYPES = ['長傘', '折りたたみ傘', 'ビニール傘', '晴雨兼用・日傘', 'その他'];
const PRONOUNS = ['ぼく', 'わたし'];
const PRONOUN_CUSTOM = 'custom';

const SLOTS = [
  { id: 'head', name: 'あたま' },
  { id: 'neck', name: 'くび' },
  { id: 'charm', name: 'チャーム' },
  { id: 'bg', name: 'はいけい' }
];
const ITEMS = [
  { id: 'ribbon', slot: 'head', name: 'リボン', level: 2 },
  { id: 'flower', slot: 'head', name: 'おはな', level: 4 },
  { id: 'hat', slot: 'head', name: 'むぎわら帽子', level: 6 },
  { id: 'crown', slot: 'head', name: 'おうかん', level: 10 },
  { id: 'bowtie', slot: 'neck', name: 'ちょうネクタイ', level: 3 },
  { id: 'scarf', slot: 'neck', name: 'マフラー', level: 7 },
  { id: 'teru', slot: 'charm', name: 'てるてる坊主', level: 3 },
  { id: 'nametag', slot: 'charm', name: 'ネームタグ', level: 5, measure: 'tag' },
  { id: 'star', slot: 'charm', name: 'ほしのチャーム', level: 8 },
  { id: 'sunny', slot: 'bg', name: 'はれ', level: 1 },
  { id: 'rain', slot: 'bg', name: 'あめ', level: 1 },
  { id: 'night', slot: 'bg', name: 'よる', level: 5 },
  { id: 'rainbow', slot: 'bg', name: 'にじ', level: 9 }
];

const MEASURES = [
  { id: 'tag', label: '名前タグやシールなど、目印をつけた', hint: 'チェックすると「ネームタグ」のきせかえが解放されます' },
  { id: 'place', label: '家での置き場所を決めた' },
  { id: 'remind', label: 'お店や電車を出るとき「持った？」と確認するようにした' },
  { id: 'hold', label: '外出先では、なるべく手元に置くようにした' },
  { id: 'check', label: '骨や布に傷みがないか点検した' }
];

const XP = { login: 10, out: 20, home: 20, care: 15, chat: 5, memo: 30, measure: 50, anniv: 100 };
const DAILY_LIMIT = { chat: 10, memo: 3 };
const ACTIONS = {
  out: { label: 'いっしょにおでかけ', icon: 'out', lines: ['いってきます！ 帰りもいっしょだよ。', 'おでかけうれしいな。どこに置いても、ちゃんと連れて帰ってね。', '{user}といっしょなら、雨もへっちゃら！'] },
  home: { label: 'ぶじに帰ってきた', icon: 'home', lines: ['ただいま！ きょうもぶじに帰ってこられたね。', '連れて帰ってくれてありがとう。ほっとしたよ。', 'おかえり、{user}。{I}を忘れないでくれてうれしい！'] },
  care: { label: 'お手入れした', icon: 'drop', lines: ['ふう、さっぱり！ 乾かしてくれてありがとう。', 'お手入れしてもらうと、長生きできる気がする！', 'ぴかぴか！ {I}、また雨の日にがんばるね。'] }
};

const START_DAYS = [7, 30, 50, 100, 200, 300, 500, 1000, 1500, 2000, 3000];
const MEET_DAYS = [3, 7, 14, 21, 30, 50, 100, 200];

const MOOD_LABEL = { happy: 'ごきげん', normal: 'のんびり', lonely: 'さみしい' };

/* ---------- 会話データ ---------- */
const CHAT_RULES = [
  { k: ['おはよう'], r: ['おはよう、{user}！ きょうもいい一日になりますように。', 'おはよう！ {I}はもうばっちり目がさめてるよ。'] },
  { k: ['こんにちは', 'こんちは', 'やあ'], r: ['こんにちは！ 話しかけてくれてうれしいな。', 'やあ、{user}！ きょうはどんな日？'] },
  { k: ['こんばんは'], r: ['こんばんは。きょうもおつかれさま。', 'こんばんは！ 夜はしずかで落ち着くね。'] },
  { k: ['おやすみ'], r: ['おやすみ、{user}。また明日ね。', 'ゆっくり休んでね。{I}は玄関で待ってるよ。'] },
  { k: ['ただいま', '帰った', 'かえった', '帰宅'], r: ['おかえり！ ちゃんと連れて帰ってくれてありがとう。', 'おかえりなさい。きょうもおつかれさま！'] },
  { k: ['いってきます', '出かけ', 'でかけ', 'おでかけ', '行ってくる'], r: ['いってらっしゃい！ {I}も連れてってね。', 'おでかけ？ 帰りに{I}のこと、忘れないでね。'] },
  { k: ['雨', 'あめ'], r: ['雨の日は{I}の出番だね！ まかせて。', '雨の音、好きなんだ。{user}をぬらさないようにがんばるよ。'] },
  { k: ['晴れ', 'はれ', 'いい天気', '天気いい'], r: ['晴れの日はおうちでのんびり。でも急な雨には気をつけてね。', 'いい天気だね！ {I}はひなたぼっこ中〜。'] },
  { k: ['ありがとう', 'ありがと', '感謝'], r: ['こちらこそ、いつも大事にしてくれてありがとう。', 'えへへ、うれしいな。'] },
  { k: ['好き', 'すき'], r: ['{I}も{user}のこと、だいすき！', 'そう言ってもらえると、骨の先までぽかぽかするよ。'] },
  { k: ['かわいい', 'かっこいい', 'きれい', 'すてき'], r: ['ほんと！？ てれちゃうな。', 'ありがとう！ きせかえも見てね。'] },
  { k: ['忘れ', 'わすれ', 'なくし', '無くし', '失くし', '置き忘れ', '迷子'], r: ['えっ… {I}のこと忘れないでね。お店を出るとき「持った？」って思い出してくれるとうれしいな。', 'もしはぐれても見つけてもらえるように、目印をつけてくれると安心だな。'] },
  { k: ['疲れ', 'つかれ', 'しんどい', '眠い', 'ねむい'], r: ['きょうもがんばったね。ゆっくり休んでね。', 'むりしないでね。{I}はいつでもここにいるよ。'] },
  { k: ['濡れ', 'ぬれ', 'びしょ'], r: ['使ったあとは、開いて陰干ししてくれるとうれしいな。さびにくくなるんだ。', 'ぬれちゃった？ かぜひかないようにね。'] },
  { k: ['壊れ', 'こわれ', '折れ', '破れ'], r: ['いたた… 骨が折れても、修理できることがあるんだって。長くいっしょにいたいな。'] },
  { k: ['名前', 'なまえ'], r: ['{I}の名前は「{name}」。{user}がつけてくれた、たいせつな名前だよ。'] },
  { k: ['何日', 'なんにち', '記念日'], r: ['使いはじめて{days}日目だよ。次は「{nextAnniv}」まであと{nextIn}日！'] },
  { k: ['レベル', '愛着'], r: ['いまはLv.{level}。「{rank}」だね！'] }
];
const CHAT_FALLBACK = [
  'うんうん、それで？',
  'なるほど〜。{user}の話、もっと聞きたいな。',
  'そっか。{I}はいつでもここにいるよ。',
  'ふむふむ。きょうのことを日記に残しておくのもいいかも。'
];
const QUICK_REPLIES = ['おはよう', 'いってきます', 'ただいま', '今日は雨だよ', 'ありがとう', 'なにか話して'];
const TRIVIA = [
  '6月11日は、雨の日のおでかけを楽しむ日なんだって。{I}たちのお祭りだね！',
  '使ったあとは、開いて陰干ししてくれると長持ちするんだよ。',
  '忘れ物で多いもののひとつが雨具なんだって…。{I}は{user}のそばにいたいな。',
  '雨具のはじまりは、日差しをよける道具だったと言われているよ。',
  'ぬれたまま閉じっぱなしだと、骨がさびやすくなっちゃうんだ。',
  'ビニール製の雨具は日本で生まれたと言われているんだって。'
];
const HOME_LINES = [
  'くすぐったいよ〜！',
  'なあに？ {user}。',
  '{I}、{user}の相棒でよかった！',
  'きょうもいっしょにいてくれてありがとう。',
  '次の雨の日が楽しみだな。'
];

/* ---------- アイコン ---------- */
const ICONS = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
  out: '<path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  shirt: '<path d="M8 3L3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/>',
  camera: '<path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8C10 4 7 3 6.5 5S9 8 12 8zm0 0c2-4 5-5 5.5-3S15 8 12 8z"/>',
  heart: '<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  book: '<path d="M4 4h6a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h6z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 3 1.1-6.2L3 9.7l6.2-.9z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7v.5M12 17h.01"/>',
  swap: '<path d="M4 7h14M14 3l4 4-4 4"/><path d="M20 17H6M10 13l-4 4 4 4"/>',

};
const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------- ユーティリティ ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const diffDays = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const addYears = (s, n) => {
  const d = parseYmd(s); const m = d.getMonth();
  d.setFullYear(d.getFullYear() + n);
  if (d.getMonth() !== m) d.setDate(0);
  return ymd(d);
};
const fmtDate = (s) => { const d = parseYmd(s); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; };
const fmtShort = (ts) => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtTs = (ts) => { const d = new Date(ts); return `${ymd(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };

/* ---------- 状態管理 ---------- */
function defaultState() {
  return {
    version: 1,
    participantId: '',
    consentAt: null,
    userName: '',
    umbrella: null,
    xp: 0,
    equipped: { head: null, neck: null, charm: null, bg: 'sunny' },
    homeView: 'chara',
    daily: {},
    measures: {},
    memories: [],
    chats: [],
    seenAnniv: [],
    lastSeen: null,
    logs: []
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function save() {
  if (runtime.resetting) return false;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    toast('保存できませんでした。端末の空き容量を確認してください。');
    return false;
  }
}

function log(type, detail = '') {
  state.logs.push({ ts: Date.now(), type, detail: String(detail) });
  if (state.logs.length > 5000) state.logs.splice(0, state.logs.length - 5000);
}

let state = load();
const runtime = {
  bubble: '',
  recordTab: 'summary',
  calMonth: null,
  dressSlot: 'head',
  modalQueue: [],
  editing: false,
  photoDraft: undefined,
  chatBusy: false
};

const dayRec = (d = today()) => (state.daily[d] ||= {});

/* ---------- レベル・愛着度 ---------- */
function levelInfo(xp) {
  let lv = 1; let need = 60; let rest = xp;
  while (rest >= need && lv < MAX_LV) { rest -= need; lv += 1; need = 60 + 40 * (lv - 1); }
  return { lv, cur: rest, need, max: lv >= MAX_LV };
}
function rankOf(lv) {
  if (lv < 3) return 'はじめまして';
  if (lv < 5) return 'なかよし';
  if (lv < 8) return 'あいぼう';
  if (lv < 12) return 'たいせつな相棒';
  return 'かけがえのない存在';
}
function isUnlocked(item) {
  return levelInfo(state.xp).lv >= item.level || Boolean(item.measure && state.measures[item.measure]?.on);
}
function addXp(n, reason) {
  const before = levelInfo(state.xp).lv;
  state.xp += n;
  log('xp', `${reason}:+${n}`);
  const after = levelInfo(state.xp).lv;
  if (after > before) {
    const unlocked = ITEMS.filter((i) => i.level > before && i.level <= after);
    log('level_up', `Lv${after}`);
    runtime.modalQueue.push({ type: 'level', lv: after, unlocked });
  }
}
function interactedToday() {
  const d = dayRec();
  return Boolean(d.out || d.home || d.care || d.chat || d.memo);
}
function currentMood() {
  if (interactedToday()) return 'happy';
  return (dayRec().gap || 0) >= 3 ? 'lonely' : 'normal';
}

/* ---------- 記念日 ---------- */
function milestones() {
  const u = state.umbrella;
  if (!u) return [];
  const list = [];
  START_DAYS.forEach((n) => list.push({ id: `start-${n}`, kind: 'start', date: addDays(u.startDate, n - 1), label: `使い始めて${n}日目` }));
  for (let y = 1; y <= 20; y += 1) list.push({ id: `year-${y}`, kind: 'start', date: addYears(u.startDate, y), label: `使い始めて${y}年` });
  MEET_DAYS.forEach((n) => list.push({ id: `meet-${n}`, kind: 'meet', date: addDays(u.registeredDate, n - 1), label: `出会って${n}日目` }));
  return list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
function nextMilestone(includeToday = true) {
  const t = today();
  const m = milestones().find((x) => (includeToday ? x.date >= t : x.date > t));
  return m ? { ...m, inDays: diffDays(t, m.date) } : null;
}
function markPastSeen() {
  const t = today();
  milestones().forEach((m) => { if (m.date < t && !state.seenAnniv.includes(m.id)) state.seenAnniv.push(m.id); });
}
function checkAnniversaries() {
  const t = today();
  const due = milestones().filter((m) => m.date <= t && !state.seenAnniv.includes(m.id));
  if (!due.length) return;
  due.forEach((m) => { state.seenAnniv.push(m.id); log('anniversary', m.label); });
  runtime.modalQueue.push({ type: 'anniv', items: due });
  due.forEach((m) => addXp(XP.anniv, `anniv:${m.id}`));
}
const daysSinceStart = () => diffDays(state.umbrella.startDate, today()) + 1;
const daysSinceMeet = () => diffDays(state.umbrella.registeredDate, today()) + 1;

/* ---------- テキスト差し込み ---------- */
function fill(tpl) {
  const u = state.umbrella || {};
  const next = nextMilestone(false);
  const li = levelInfo(state.xp);
  const lastMemo = state.memories[state.memories.length - 1];
  const map = {
    user: state.userName || 'あなた',
    I: u.pronoun || 'ぼく',
    name: u.name || '',
    days: u.startDate ? daysSinceStart() : 0,
    level: li.lv,
    rank: rankOf(li.lv),
    nextAnniv: next ? next.label : '',
    nextIn: next ? next.inDays : 0,
    memo: lastMemo ? lastMemo.text.slice(0, 20) : ''
  };
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (k in map ? map[k] : ''));
}
function greetingLine() {
  const gap = dayRec().gap || 0;
  if (gap >= 3 && !interactedToday()) return `${gap}日ぶりだね…！ 会いたかったよ、{user}。`;
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'おはよう、{user}！ きょうは雨ふるかな？';
  if (h >= 11 && h < 17) return 'こんにちは！ {I}はきょうも元気だよ。';
  return 'こんばんは。きょうもおつかれさま。';
}
function topicLines() {
  const lines = [...TRIVIA, 'いっしょに過ごして{days}日目。これからもよろしくね。'];
  if (nextMilestone(false)) lines.push('次の記念日は「{nextAnniv}」。あと{nextIn}日だよ！');
  if (state.memories.length) lines.push('この前の「{memo}」の話、覚えてるよ。また聞かせてね。');
  if (!state.measures.tag?.on) lines.push('{I}ね、目印をつけてもらえたら、もっと安心しておでかけできるんだ。');
  if (!state.measures.place?.on) lines.push('おうちでの置き場所が決まってると、{I}も迷子にならないんだよ。');
  return lines;
}
function chatReply(text) {
  if (/なにか話して|何か話して|話して|ひま|暇/.test(text)) return fill(pick(topicLines()));
  const rule = CHAT_RULES.find((r) => r.k.some((k) => text.includes(k)));
  return fill(pick(rule ? rule.r : CHAT_FALLBACK));
}

/* ---------- キャラクター描画（SVG） ---------- */
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
function isDark(hex) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 110;
}
const FACES = {
  happy: '<path d="M74 88q7-9 14 0M112 88q7-9 14 0" class="f-line"/><path d="M88 98q12 14 24 0z" class="f-fill"/>',
  normal: '<g class="eyes"><ellipse cx="81" cy="87" rx="4" ry="5.5" class="f-fill"/><ellipse cx="119" cy="87" rx="4" ry="5.5" class="f-fill"/></g><path d="M92 99q8 7 16 0" class="f-line"/>',
  lonely: '<path d="M72 79l12 4M128 79l-12 4" class="f-line"/><g class="eyes"><ellipse cx="80" cy="89" rx="3.5" ry="4.5" class="f-fill"/><ellipse cx="120" cy="89" rx="3.5" ry="4.5" class="f-fill"/></g><path d="M92 104q8-6 16 0" class="f-line"/><path d="M126 95q-3 5 0 7q3-2 0-7z" fill="#7EC8E3"/>'
};
const CHEEKS = '<ellipse cx="66" cy="100" rx="7" ry="4" class="cheek"/><ellipse cx="134" cy="100" rx="7" ry="4" class="cheek"/>';
const flowerPetals = [0, 72, 144, 216, 288].map((a) => {
  const r = (a * Math.PI) / 180;
  return `<circle cx="${(8 * Math.cos(r)).toFixed(1)}" cy="${(8 * Math.sin(r)).toFixed(1)}" r="6" fill="#FFFFFF" stroke="#F2A7BC" stroke-width="1.5"/>`;
}).join('');
const ITEM_SVG = {
  ribbon: () => '<g transform="translate(134 52) rotate(28)"><path d="M0 0L-18-11-16 11Z M0 0L18-11 16 11Z" fill="#F07A9A" stroke="#C9506F" stroke-width="2" stroke-linejoin="round"/><circle r="5" fill="#D9557A"/></g>',
  flower: () => `<g transform="translate(66 56)">${flowerPetals}<circle r="5" fill="#F6C850"/></g>`,
  hat: () => '<g><ellipse cx="100" cy="42" rx="44" ry="9" fill="#E9C46A" stroke="#C9A04A" stroke-width="2"/><path d="M76 42Q77 14 100 14Q123 14 124 42Z" fill="#F2D488" stroke="#C9A04A" stroke-width="2"/><path d="M77 33Q100 38 123 33L124 39Q100 44 76 39Z" fill="#E36A5B"/></g>',
  crown: () => '<g transform="translate(100 30)"><path d="M-22 10V-10L-11 0 0-16 11 0 22-10V10Z" fill="#F5C542" stroke="#C99A1E" stroke-width="2" stroke-linejoin="round"/><circle cy="3" r="3" fill="#E8785D"/><circle cx="-13" cy="5" r="2.2" fill="#6FA8DC"/><circle cx="13" cy="5" r="2.2" fill="#6FA8DC"/></g>',
  bowtie: () => '<g transform="translate(100 134)"><path d="M0 0L-15-8V8Z M0 0L15-8V8Z" fill="#E0505F" stroke="#B23744" stroke-width="2" stroke-linejoin="round"/><circle r="4" fill="#B23744"/></g>',
  scarf: () => '<g><rect x="86" y="124" width="28" height="12" rx="6" fill="#5FA8D3"/><path d="M104 132l7 24 10-3-7-23z" fill="#5FA8D3"/><path d="M107 141l9-2M109 148l9-2" stroke="#fff" stroke-width="2"/></g>',
  teru: () => '<g><line x1="168" y1="116" x2="168" y2="136" stroke="#99A5AA" stroke-width="1.5"/><path d="M156 150q12 22 24 0z" fill="#FFFFFF" stroke="#C8D0D4" stroke-width="1.5"/><circle cx="168" cy="146" r="10" fill="#FFFFFF" stroke="#C8D0D4" stroke-width="1.5"/><circle cx="164.5" cy="145" r="1.4" fill="#2F3B3D"/><circle cx="171.5" cy="145" r="1.4" fill="#2F3B3D"/><path d="M165 149q3 2 6 0" fill="none" stroke="#2F3B3D" stroke-width="1.2" stroke-linecap="round"/></g>',
  nametag: (name) => `<g><path d="M130 213L146 204" stroke="#B08A5A" stroke-width="1.5"/><g transform="translate(142 190) rotate(-8)"><rect width="50" height="20" rx="4" fill="#FFF4D6" stroke="#C9A66B" stroke-width="2"/><circle cx="7" cy="10" r="2.2" fill="#C9A66B"/><text x="29" y="14" font-size="10" text-anchor="middle" fill="#7A5236" font-family="sans-serif">${esc(String(name).slice(0, 4))}</text></g></g>`,
  star: () => '<g><path d="M130 213L148 204" stroke="#B08A5A" stroke-width="1.5"/><path d="M152 186l3.5 7.2 8 1.1-5.8 5.6 1.4 7.9-7.1-3.8-7.1 3.8 1.4-7.9-5.8-5.6 8-1.1z" fill="#F6C850" stroke="#D4A017" stroke-width="1.5" stroke-linejoin="round"/></g>'
};

function kasaSvg(opt = {}) {
  const u = state.umbrella || {};
  const color = opt.color ?? u.color ?? 'coral';
  const mood = opt.mood ?? 'normal';
  const eq = opt.equip ?? state.equipped;
  const name = opt.name ?? u.name ?? '';
  const col = COLORS.find((c) => c.id === color) || COLORS[0];
  const clear = col.id === 'clear';
  const dark = clear ? '#8FA9B5' : shade(col.main, -0.22);
  const fillColor = clear ? 'rgba(225,238,244,.78)' : col.main;
  const face = isDark(col.main) ? '#FFFFFF' : '#2F3B3D';
  const handle = clear ? '#9FB3BD' : '#7A5236';
  const part = (slot) => (eq[slot] && ITEM_SVG[eq[slot]] ? ITEM_SVG[eq[slot]](name) : '');
  const a11y = opt.still ? 'aria-hidden="true"' : `role="img" aria-label="${esc(name || '相棒')}のキャラクター"`;
  return `<svg class="kasa ${opt.still ? '' : 'is-anim'}" viewBox="0 0 200 240" style="--face:${face}" ${a11y}>
    <g class="kasa-body">
      <line x1="100" y1="118" x2="100" y2="205" stroke="#8A6A52" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 202v8q0 18 15 18q15 0 15-15" fill="none" stroke="${handle}" stroke-width="9" stroke-linecap="round"/>
      <line x1="100" y1="40" x2="100" y2="22" stroke="#8A6A52" stroke-width="4" stroke-linecap="round"/>
      <circle cx="100" cy="20" r="4" fill="#8A6A52"/>
      <path d="M18 122C18 70 54 38 100 38C146 38 182 70 182 122Q161 106 141 122Q120 106 100 122Q80 106 59 122Q39 106 18 122Z" fill="${fillColor}" stroke="${dark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M100 40Q76 72 59 122M100 40Q124 72 141 122" fill="none" stroke="${dark}" stroke-width="2" opacity=".28"/>
      <path d="M36 98Q42 66 72 50" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <g class="face">${FACES[mood] || FACES.normal}${CHEEKS}</g>
      ${part('neck')}${part('head')}${part('charm')}
    </g>
  </svg>`;
}

/* ---------- 画面切り替え ---------- */
function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === `screen-${id}`));
  window.scrollTo(0, 0);
}
const VIEWS = ['home', 'chat', 'record', 'settings'];
function route() {
  if (!$('#screen-main').classList.contains('is-active')) return;
  let v = location.hash.slice(1);
  if (!VIEWS.includes(v)) v = 'home';
  $$('.view').forEach((el) => el.classList.toggle('is-active', el.id === `view-${v}`));
  $$('.tabbar a').forEach((a) => a.classList.toggle('is-active', a.dataset.tab === v));
  document.body.dataset.view = v;
  renderAppbar();
  ({ home: renderHome, chat: renderChat, record: renderRecord, settings: renderSettings })[v]();
  log('view', v);
  save();
  if (v !== 'chat') window.scrollTo(0, 0);
}
function goView(v) {
  showScreen('main');
  if (location.hash === `#${v}`) route();
  else location.hash = v;
}

/* ---------- 起動 ---------- */
function boot() {
  hydrateIcons(document);
  buildRegisterOptions();
  $('#welcome-chara').innerHTML = kasaSvg({ color: 'coral', mood: 'happy', equip: { bg: 'sunny' }, name: 'Monogatory' });

  if (!state.consentAt) showScreen('welcome');
  else if (!state.umbrella) showRegister(false);
  else enterMain();

  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

function enterMain() {
  showScreen('main');
  log('app_open', `v${APP_VERSION}`);
  dailyCheck();
  route();
  flushModals();
}

function dailyCheck() {
  const t = today();
  const d = dayRec(t);
  if (d.gap === undefined) d.gap = state.lastSeen ? diffDays(state.lastSeen, t) : 0;
  let bonus = false;
  if (!d.login) { d.login = Date.now(); addXp(XP.login, 'login'); bonus = true; }
  state.lastSeen = t;
  runtime.bubble = '';
  checkAnniversaries();
  save();
  if (bonus) toast(`きょうも会いに来てくれてありがとう！ 愛着度 +${XP.login}`);
}

/* ---------- S01 ようこそ ---------- */
function onWelcomeSubmit(e) {
  e.preventDefault();
  const err = $('#welcome-error');
  if (!$('#consent').checked) { err.textContent = '研究への同意にチェックしてください。'; return; }
  err.textContent = '';
  if (!state.participantId) state.participantId = generateId();
  if (!state.consentAt) state.consentAt = Date.now();
  log('consent', `pid=${state.participantId};ua=${navigator.userAgent}`);
  save();
  showRegister(false);
}
function generateId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);
  return `U${Array.from(buf, (n) => chars[n % chars.length]).join('')}`;
}

/* ---------- S02 登録・編集 ---------- */
function buildRegisterOptions() {
  $('#reg-type').innerHTML = TYPES.map((t) => `<option>${esc(t)}</option>`).join('');
  $('#reg-colors').innerHTML = COLORS.map((c) => `<label class="swatch" title="${esc(c.name)}"><input type="radio" name="color" value="${c.id}"><span style="--c:${c.main}"></span><small>${esc(c.name)}</small></label>`).join('');
  $('#reg-pronoun').innerHTML = PRONOUNS.map((p) => `<label><input type="radio" name="pronoun" value="${esc(p)}"><span>${esc(p)}</span></label>`).join('') + `<label><input type="radio" name="pronoun" value="${PRONOUN_CUSTOM}"><span>じゆう入力</span></label>`;
}
function showRegister(edit) {
  runtime.editing = edit;
  runtime.photoDraft = undefined;
  const f = $('#register-form');
  const u = edit ? state.umbrella : null;
  f.elements.name.value = u?.name || '';
  f.elements.start.value = u?.startDate || today();
  f.elements.start.max = today();
  f.elements.type.value = u?.type || TYPES[0];
  f.elements.color.value = u?.color || 'coral';
  f.elements.pronoun.value = PRONOUNS.includes(u?.pronoun) ? u.pronoun : (u?.pronoun ? PRONOUN_CUSTOM : PRONOUNS[0]);
  $('#reg-pronoun-custom').value = u?.pronoun && !PRONOUNS.includes(u.pronoun) ? u.pronoun : '';
  $('#reg-pronoun-custom').hidden = f.elements.pronoun.value !== PRONOUN_CUSTOM;
  f.elements.user.value = edit ? state.userName : '';
  $('#register-title').textContent = edit ? '登録内容を編集' : '相棒を登録しよう';
  $('#register-submit').textContent = edit ? '保存する' : 'この子をむかえる';
  $('#register-error').textContent = '';
  updatePhotoFrame(u?.photo || '');
  updateRegisterPreview();
  showScreen('register');
  log(edit ? 'profile_edit_open' : 'register_open');
  save();
}
function updatePhotoFrame(src) {
  const frame = $('#photo-frame');
  frame.innerHTML = '';
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '登録写真';
    frame.appendChild(img);
  } else {
    frame.innerHTML = `${icon('camera')}<span>写真をえらぶ</span>`;
  }
}
function updateRegisterPreview() {
  const f = $('#register-form');
  $('#reg-chara').innerHTML = kasaSvg({ color: f.elements.color.value || 'coral', mood: 'happy', equip: runtime.editing ? state.equipped : {}, name: f.elements.name.value });
}
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject(new Error('not image')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 640;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')); };
    img.src = url;
  });
}
async function onPhotoChange(e) {
  try {
    runtime.photoDraft = await readPhoto(e.target.files[0]);
    updatePhotoFrame(runtime.photoDraft);
  } catch {
    toast('写真を読み込めませんでした。別の写真をお試しください。');
  }
  e.target.value = '';
}
function onRegisterSubmit(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.elements.name.value.trim();
  const start = f.elements.start.value;
  const errors = [];
  if (!name) errors.push('名前を入力してください。');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) errors.push('使い始めた日を入力してください。');
  else if (start > today()) errors.push('使い始めた日は今日以前の日付にしてください。');
  if (errors.length) { $('#register-error').textContent = errors.join(' '); return; }

  const prev = state.umbrella;
  state.umbrella = {
    name,
    startDate: start,
    type: TYPES.includes(f.elements.type.value) ? f.elements.type.value : TYPES[0],
    color: COLORS.some((c) => c.id === f.elements.color.value) ? f.elements.color.value : 'coral',
    pronoun: f.elements.pronoun.value === PRONOUN_CUSTOM ? ($('#reg-pronoun-custom').value.trim().slice(0, 10) || PRONOUNS[0]) : (PRONOUNS.includes(f.elements.pronoun.value) ? f.elements.pronoun.value : PRONOUNS[0]),
    photo: runtime.photoDraft !== undefined ? runtime.photoDraft : (prev?.photo || ''),
    registeredDate: prev?.registeredDate || today(),
    registeredAt: prev?.registeredAt || Date.now()
  };
  state.userName = f.elements.user.value.trim().slice(0, 12);
  markPastSeen();
  const u = state.umbrella;
  log(prev ? 'profile_edit' : 'register', `name=${u.name};start=${u.startDate};type=${u.type};color=${u.color};pronoun=${u.pronoun};photo=${u.photo ? 'yes' : 'no'};user=${state.userName}`);
  if (!save()) return;
  if (prev) {
    toast('保存しました');
    goView('settings');
  } else {
    runtime.modalQueue.push({ type: 'welcome' });
    enterMain();
  }
}

/* ---------- 共通ヘッダー ---------- */
function renderAppbar() {
  const u = state.umbrella;
  const ph = $('#appbar-photo');
  if (u.photo) {
    ph.innerHTML = '';
    const img = document.createElement('img');
    img.src = u.photo;
    img.alt = '';
    ph.appendChild(img);
  } else {
    ph.innerHTML = kasaSvg({ mood: 'normal', still: true });
  }
  $('#appbar-name').textContent = u.name;
  $('#appbar-days').textContent = `使い始めて ${daysSinceStart()}日目`;
}

/* ---------- ホーム ---------- */
function renderHome() {
  const u = state.umbrella;
  const li = levelInfo(state.xp);
  const d = dayRec();
  const mood = currentMood();
  const next = nextMilestone();
  const todo = MEASURES.find((m) => !state.measures[m.id]?.on);
  const pct = li.max ? 100 : Math.round((li.cur / li.need) * 100);
  const actBtn = (kind) => {
    const a = ACTIONS[kind];
    const done = Boolean(d[kind]);
    return `<button class="act ${done ? 'is-done' : ''}" type="button" data-action="act" data-kind="${kind}" ${done ? 'aria-pressed="true"' : ''}>
      <span class="act-ic">${icon(done ? 'check' : a.icon)}</span><span>${a.label}</span><small>${done ? 'きょうは記録ずみ' : `愛着度 +${XP[kind]}`}</small></button>`;
  };
  const unlockedCount = ITEMS.filter(isUnlocked).length;
  const hasPhoto = Boolean(u.photo);
  const showPhoto = hasPhoto && state.homeView === 'photo';
  const stageVisual = showPhoto
    ? `<button class="stage-chara is-photo" type="button" data-action="poke" aria-label="${esc(u.name)}にさわる"><img src="${esc(u.photo)}" alt="${esc(u.name)}の写真"></button>`
    : `<button class="stage-chara" type="button" data-action="poke" aria-label="${esc(u.name)}にさわる">${kasaSvg({ mood })}</button>`;

  $('#view-home').innerHTML = `
    <div class="stage bg-${esc(state.equipped.bg || 'sunny')}">
      <p class="bubble" id="bubble">${esc(fill(runtime.bubble || greetingLine()))}</p>
      ${stageVisual}
      ${hasPhoto ? `<button class="stage-toggle" type="button" data-action="toggle-home-view" aria-label="表示を切り替える">${icon('swap')}<span>${showPhoto ? 'キャラで見る' : '写真で見る'}</span></button>` : ''}
      <span class="mood-tag mood-${mood}">${MOOD_LABEL[mood]}</span>
    </div>

    <div class="card status">
      <div class="status-top">
        <div><p class="kicker">愛着度</p><h2>${esc(u.name)}<small>${esc(rankOf(li.lv))}</small></h2></div>
        <div class="lv">Lv.<b>${li.lv}</b></div>
      </div>
      <div class="xp" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div>
      <p class="xp-note">${li.max ? 'さいこうレベル！' : `次のレベルまで あと ${li.need - li.cur}`}<span>累計 ${state.xp}</span></p>
    </div>

    <h3 class="sec-title">きょうのふれあい</h3>
    <div class="actions">
      ${actBtn('out')}${actBtn('home')}${actBtn('care')}
      <button class="act" type="button" data-action="dress"><span class="act-ic">${icon('shirt')}</span><span>きせかえ</span><small>${unlockedCount} / ${ITEMS.length} 解放</small></button>
    </div>

    ${next ? `<div class="card anniv-next">
      <span class="anniv-ic">${icon('gift')}</span>
      <div><p class="kicker">つぎの記念日</p><strong>${esc(next.label)}</strong><small>${fmtDate(next.date)}</small></div>
      <div class="countdown">${next.inDays === 0 ? '<b>きょう!</b>' : `あと<b>${next.inDays}</b>日`}</div>
    </div>` : ''}

    ${todo ? `<button class="card nudge" type="button" data-action="go-measure">
      <span class="anniv-ic green">${icon('shield')}</span>
      <div><p class="kicker">たいせつ対策</p><strong>${esc(todo.label)}</strong><small>やってみたら「きろく」でチェック！ 愛着度 +${XP.measure}</small></div>
      ${icon('right')}
    </button>` : ''}
  `;
}
function doAction(kind) {
  if (!ACTIONS[kind]) return;
  const d = dayRec();
  if (d[kind]) { toast('きょうはもう記録ずみだよ'); return; }
  d[kind] = Date.now();
  addXp(XP[kind], kind);
  log('action', kind);
  runtime.bubble = pick(ACTIONS[kind].lines);
  save();
  renderHome();
  toast(`${ACTIONS[kind].label}！ 愛着度 +${XP[kind]}`);
  flushModals();
}
function poke() {
  const btn = $('.stage-chara');
  if (btn) { btn.classList.remove('is-jump'); void btn.offsetWidth; btn.classList.add('is-jump'); }
  runtime.bubble = pick(HOME_LINES.concat(topicLines()));
  const b = $('#bubble');
  if (b) b.textContent = fill(runtime.bubble);
  log('poke');
  save();
}

/* ---------- きせかえ ---------- */
function openDress() {
  runtime.dressSlot = 'head';
  renderDress();
  $('#dress').showModal();
  log('dress_open');
  save();
}
function renderDress() {
  $('#dress-preview').innerHTML = `<div class="stage mini bg-${esc(state.equipped.bg || 'sunny')}">${kasaSvg({ mood: 'happy' })}</div>`;
  $('#dress-tabs').innerHTML = SLOTS.map((s) => `<button type="button" class="${s.id === runtime.dressSlot ? 'is-active' : ''}" data-action="dress-tab" data-slot="${s.id}">${esc(s.name)}</button>`).join('');
  const items = ITEMS.filter((i) => i.slot === runtime.dressSlot);
  const none = runtime.dressSlot === 'bg' ? '' : `<button type="button" class="item ${state.equipped[runtime.dressSlot] ? '' : 'is-on'}" data-action="equip" data-id="" data-slot="${runtime.dressSlot}"><span class="item-thumb none">なし</span><span>はずす</span></button>`;
  $('#dress-items').innerHTML = none + items.map((i) => {
    const ok = isUnlocked(i);
    const on = state.equipped[i.slot] === i.id;
    const preview = i.slot === 'bg'
      ? `<span class="item-thumb bg-${i.id}"></span>`
      : `<span class="item-thumb">${kasaSvg({ mood: 'normal', still: true, equip: { [i.slot]: i.id } })}</span>`;
    const lockText = i.measure ? `Lv.${i.level} か 目印をつける` : `Lv.${i.level} で解放`;
    return `<button type="button" class="item ${on ? 'is-on' : ''} ${ok ? '' : 'is-locked'}" data-action="equip" data-id="${i.id}" data-slot="${i.slot}" ${ok ? '' : 'aria-disabled="true"'}>
      ${preview}${ok ? '' : `<span class="lock">${icon('lock')}</span>`}
      <span>${esc(i.name)}</span>${ok ? '' : `<small>${lockText}</small>`}</button>`;
  }).join('');
}
function equip(id, slot) {
  if (!SLOTS.some((s) => s.id === slot)) return;
  if (id) {
    const item = ITEMS.find((i) => i.id === id && i.slot === slot);
    if (!item) return;
    if (!isUnlocked(item)) { toast(item.measure ? `Lv.${item.level}になるか、目印をつけると解放されるよ` : `Lv.${item.level}になると解放されるよ`); return; }
  }
  state.equipped[slot] = id || null;
  log('equip', `${slot}:${id || 'none'}`);
  save();
  renderDress();
  renderHome();
}

/* ---------- おしゃべり ---------- */
function renderChat() {
  const t = today();
  const lastKasa = [...state.chats].reverse().find((c) => c.from === 'kasa');
  if (!lastKasa || ymd(new Date(lastKasa.ts)) !== t) {
    pushChat('kasa', fill(greetingLine()));
    save();
  }
  $('#chat-chips').innerHTML = QUICK_REPLIES.map((q) => `<button type="button" class="chip" data-action="chip" data-text="${esc(q)}">${esc(q)}</button>`).join('');
  renderChatList();
}
function pushChat(from, text) {
  state.chats.push({ ts: Date.now(), from, text });
  if (state.chats.length > 300) state.chats.splice(0, state.chats.length - 300);
}
function renderChatList(typing = false) {
  const avatar = `<span class="msg-avatar">${kasaSvg({ mood: 'happy', still: true })}</span>`;
  let lastDate = '';
  const html = state.chats.map((c) => {
    const d = ymd(new Date(c.ts));
    const sep = d !== lastDate ? `<p class="chat-date">${fmtDate(d)}</p>` : '';
    lastDate = d;
    const time = `${pad(new Date(c.ts).getHours())}:${pad(new Date(c.ts).getMinutes())}`;
    return `${sep}<div class="msg ${c.from === 'me' ? 'me' : 'kasa'}">${c.from === 'me' ? '' : avatar}<p>${esc(c.text)}</p><time>${time}</time></div>`;
  }).join('');
  $('#chat-list').innerHTML = html + (typing ? `<div class="msg kasa typing">${avatar}<p><i></i><i></i><i></i></p></div>` : '');
  requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
}
function sendChat(raw) {
  const text = String(raw || '').trim().slice(0, 200);
  if (!text || runtime.chatBusy) return;
  runtime.chatBusy = true;
  pushChat('me', text);
  log('chat_me', text);
  const d = dayRec();
  d.chat = (d.chat || 0) + 1;
  if (d.chat <= DAILY_LIMIT.chat) addXp(XP.chat, 'chat');
  save();
  renderChatList(true);
  window.setTimeout(() => {
    const r = chatReply(text);
    pushChat('kasa', r);
    log('chat_kasa', r);
    save();
    runtime.chatBusy = false;
    renderChatList();
    flushModals();
  }, 700 + Math.random() * 600);
}

/* ---------- きろく ---------- */
function renderRecord() {
  const tabs = [['summary', 'きろく'], ['diary', '日記'], ['measure', 'たいせつ対策']];
  const body = { summary: recordSummary, diary: recordDiary, measure: recordMeasure }[runtime.recordTab]();
  $('#view-record').innerHTML = `<div class="seg page-seg">${tabs.map(([id, label]) => `<button type="button" class="${runtime.recordTab === id ? 'is-active' : ''}" data-action="rec-tab" data-tab="${id}">${label}</button>`).join('')}</div>${body}`;
}
function recordSummary() {
  const u = state.umbrella;
  const days = Object.values(state.daily);
  const count = (k) => days.filter((d) => d[k]).length;
  const chatCount = state.logs.filter((l) => l.type === 'chat_me').length;
  const t = today();
  const all = milestones();
  const done = all.filter((m) => m.date <= t).reverse();
  const upcoming = all.filter((m) => m.date > t).slice(0, 3);
  return `
    <div class="card days-card">
      <p class="kicker">いっしょに過ごした時間</p>
      <p class="days-big">使い始めて<b>${daysSinceStart()}</b>日目</p>
      <p class="days-sub">${fmtDate(u.startDate)} から ／ 出会って ${daysSinceMeet()}日目</p>
    </div>
    <div class="stats">
      <div><b>${count('out')}</b><span>おでかけ</span></div>
      <div><b>${count('home')}</b><span>ぶじに帰宅</span></div>
      <div><b>${count('care')}</b><span>お手入れ</span></div>
      <div><b>${chatCount}</b><span>おしゃべり</span></div>
    </div>

    <h3 class="sec-title">記念日</h3>
    <div class="card list-card">
      ${upcoming.map((m) => `<div class="anniv-row"><span class="dot up">${icon('gift')}</span><div><strong>${esc(m.label)}</strong><small>${fmtDate(m.date)}</small></div><em>あと${diffDays(t, m.date)}日</em></div>`).join('')}
      ${done.slice(0, 6).map((m) => `<div class="anniv-row is-done"><span class="dot">${icon('star')}</span><div><strong>${esc(m.label)}</strong><small>${fmtDate(m.date)}</small></div><em>達成</em></div>`).join('')}
      ${!upcoming.length && !done.length ? '<p class="empty">記念日はまだありません</p>' : ''}
    </div>

    <h3 class="sec-title">カレンダー</h3>
    ${calendarHtml()}

    <h3 class="sec-title">ふれあいの記録</h3>
    <div class="card list-card">${timelineHtml()}</div>`;
}
function calendarHtml() {
  const base = runtime.calMonth || today().slice(0, 7);
  const [y, m] = base.split('-').map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const last = new Date(y, m, 0).getDate();
  const t = today();
  const ms = new Map(milestones().map((x) => [x.date, x]));
  const cells = [];
  for (let i = 0; i < first; i += 1) cells.push('<span></span>');
  for (let d = 1; d <= last; d += 1) {
    const key = `${y}-${pad(m)}-${pad(d)}`;
    const rec = state.daily[key];
    const act = rec && (rec.out || rec.home || rec.care || rec.chat || rec.memo);
    const cls = [act ? 'is-act' : rec?.login ? 'is-login' : '', key === t ? 'is-today' : '', key === state.umbrella.startDate ? 'is-start' : '', ms.has(key) ? 'is-anniv' : ''].join(' ');
    cells.push(`<span class="${cls}" title="${ms.has(key) ? esc(ms.get(key).label) : ''}">${d}</span>`);
  }
  return `<div class="card calendar">
    <div class="cal-head"><button class="icon-btn" type="button" data-action="cal" data-dir="-1" aria-label="前の月">${icon('left')}</button><strong>${y}年${m}月</strong><button class="icon-btn" type="button" data-action="cal" data-dir="1" aria-label="次の月">${icon('right')}</button></div>
    <div class="cal-grid cal-week">${['日', '月', '火', '水', '木', '金', '土'].map((w) => `<span>${w}</span>`).join('')}</div>
    <div class="cal-grid">${cells.join('')}</div>
    <div class="cal-legend"><span><i class="lg lg-act"></i>ふれあった日</span><span><i class="lg lg-login"></i>会いに来た日</span><span><i class="lg lg-anniv"></i>記念日</span></div>
  </div>`;
}
function shiftMonth(dir) {
  const base = runtime.calMonth || today().slice(0, 7);
  const [y, m] = base.split('-').map(Number);
  const d = new Date(y, m - 1 + dir, 1);
  runtime.calMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  renderRecord();
}
function timelineHtml() {
  const label = (l) => {
    switch (l.type) {
      case 'action': return ACTIONS[l.detail]?.label;
      case 'memo_add': return '日記を書いた';
      case 'measure': {
        const [id, on] = l.detail.split(':');
        return on === 'on' ? `対策「${MEASURES.find((m) => m.id === id)?.label || id}」` : null;
      }
      case 'level_up': return `${l.detail.replace('Lv', 'Lv.')} にレベルアップ`;
      case 'anniversary': return `記念日：${l.detail}`;
      case 'register': return '相棒を登録した';
      default: return null;
    }
  };
  const rows = [];
  for (let i = state.logs.length - 1; i >= 0 && rows.length < 15; i -= 1) {
    const text = label(state.logs[i]);
    if (text) rows.push(`<div class="tl-row"><time>${fmtShort(state.logs[i].ts)}</time><span>${esc(text)}</span></div>`);
  }
  return rows.join('') || '<p class="empty">まだ記録がありません</p>';
}
function recordDiary() {
  const list = [...state.memories].reverse();
  return `
    <form class="card form diary-form" id="diary-form">
      <label class="field"><span>${esc(state.umbrella.name)}との思い出</span>
        <textarea name="text" maxlength="200" rows="3" placeholder="例: 急な夕立でも、ぬれずに帰れた"></textarea></label>
      <button class="btn primary block" type="submit">${icon('plus')}日記を残す</button>
      <p class="note">1日${DAILY_LIMIT.memo}回まで 愛着度 +${XP.memo}</p>
    </form>
    <div class="diary-list">
      ${list.map((m) => `<article class="card diary"><time>${fmtShort(m.ts)}</time><p>${esc(m.text)}</p><button class="icon-btn" type="button" data-action="del-memo" data-id="${esc(m.id)}" aria-label="削除">${icon('trash')}</button></article>`).join('') || '<p class="empty">まだ日記はありません</p>'}
    </div>`;
}
function addMemo(form) {
  const text = form.elements.text.value.trim().slice(0, 200);
  if (!text) { toast('思い出を入力してね'); return; }
  state.memories.push({ id: `m${Date.now()}`, ts: Date.now(), text });
  const d = dayRec();
  d.memo = (d.memo || 0) + 1;
  log('memo_add', text);
  if (d.memo <= DAILY_LIMIT.memo) { addXp(XP.memo, 'memo'); toast(`日記を残しました。愛着度 +${XP.memo}`); } else { toast('日記を残しました'); }
  save();
  renderRecord();
  flushModals();
}
function deleteMemo(id) {
  if (!window.confirm('この日記を削除しますか？')) return;
  state.memories = state.memories.filter((m) => m.id !== id);
  log('memo_delete', id);
  save();
  renderRecord();
}
function recordMeasure() {
  return `
    <div class="card intro-card">
      <span class="anniv-ic green">${icon('shield')}</span>
      <p>なくさないための工夫をしたら、チェックしましょう。はじめてチェックすると<b>愛着度 +${XP.measure}</b>。</p>
    </div>
    <div class="card list-card">
      ${MEASURES.map((m) => {
        const rec = state.measures[m.id];
        return `<label class="measure ${rec?.on ? 'is-on' : ''}">
          <input type="checkbox" data-measure="${m.id}" ${rec?.on ? 'checked' : ''}>
          <span class="box">${icon('check')}</span>
          <span class="m-text">${esc(m.label)}${m.hint ? `<small>${esc(m.hint)}</small>` : ''}${rec?.on ? `<small class="m-date">${fmtShort(rec.ts)} にチェック</small>` : ''}</span>
        </label>`;
      }).join('')}
    </div>`;
}
function toggleMeasure(id, on) {
  if (!MEASURES.some((m) => m.id === id)) return;
  const rec = state.measures[id] || {};
  const first = on && !rec.firstTs;
  state.measures[id] = { on, ts: Date.now(), firstTs: rec.firstTs || (on ? Date.now() : null) };
  log('measure', `${id}:${on ? 'on' : 'off'}`);
  if (first) {
    addXp(XP.measure, `measure:${id}`);
    toast(id === 'tag' ? 'ネームタグのきせかえが解放されたよ！' : `すてき！ 愛着度 +${XP.measure}`);
  }
  save();
  renderRecord();
  flushModals();
}

/* ---------- せってい ---------- */
function renderSettings() {
  const u = state.umbrella;
  const photo = u.photo ? `<img src="${esc(u.photo)}" alt="登録写真">` : `<span class="photo-none">${kasaSvg({ still: true })}</span>`;
  $('#view-settings').innerHTML = `
    <div class="card umbrella-card">
      <div class="uc-photo">${photo}</div>
      <dl>
        <dt>名前</dt><dd>${esc(u.name)}</dd>
        <dt>種類</dt><dd>${esc(u.type)}</dd>
        <dt>使い始めた日</dt><dd>${fmtDate(u.startDate)}</dd>
        <dt>呼ばれ方</dt><dd>${esc(state.userName || 'あなた')}</dd>
      </dl>
      <button class="btn ghost block" type="button" data-action="edit-umbrella">${icon('edit')}登録内容を編集</button>
    </div>

    <h3 class="sec-title">記録データ</h3>
    <div class="card">
      <p class="note">データはこの端末のブラウザ内だけに保存されています。研究者の案内に従って書き出してください。</p>
      <div class="btn-row">
        <button class="btn ghost" type="button" data-action="export">${icon('download')}CSVを保存</button>
        <button class="btn ghost" type="button" data-action="share">${icon('share')}共有して送る</button>
      </div>
      ${/^https:\/\//.test(CONFIG.submitUrl) ? `<button class="btn primary block" type="button" data-action="submit">${icon('upload')}研究者へ送信</button>` : ''}
    </div>

    <h3 class="sec-title">その他</h3>
    <div class="card menu">
      <button type="button" data-action="howto">${icon('help')}<span>使い方</span>${icon('right')}</button>
      <button type="button" class="danger" data-action="reset">${icon('trash')}<span>データをすべて消す</span>${icon('right')}</button>
    </div>
    <p class="foot">データID：${esc(state.participantId)}<br>Monogatory ~愛着が育む、モノとの長いお付き合い~ v${APP_VERSION}${CONFIG.studyName ? `<br>${esc(CONFIG.studyName)}` : ''}</p>`;
}

/* ---------- データ書き出し ---------- */
function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
function describeLog(entry) {
  const detail = entry.detail || '';
  const action = (kind) => ACTIONS[kind]?.label || kind;
  const view = { home: 'ホーム', chat: 'おしゃべり', record: 'きろく', settings: 'せってい' };
  const tab = { summary: 'きろく', diary: '日記', measure: 'たいせつ対策' };
  const slot = { head: 'あたま', neck: 'くび', charm: 'チャーム', bg: 'はいけい' };

  switch (entry.type) {
    case 'consent': return { operation: '研究同意', description: '研究利用への同意' };
    case 'register': return { operation: '相棒を登録', description: '登録内容を保存' };
    case 'profile_edit': return { operation: '登録内容を編集', description: '登録内容を保存' };
    case 'register_open': return { operation: '登録画面を開く', description: '' };
    case 'profile_edit_open': return { operation: '登録内容の編集画面を開く', description: '' };
    case 'app_open': return { operation: 'アプリを開く', description: '通常起動' };
    case 'app_resume': return { operation: 'アプリを再開', description: '' };
    case 'view': return { operation: '画面を開く', description: view[detail] || detail };
    case 'xp': {
      const index = detail.lastIndexOf(':+');
      const reason = index >= 0 ? detail.slice(0, index) : detail;
      const amount = index >= 0 ? detail.slice(index + 1) : '';
      const reasonLabel = reason.startsWith('anniv') ? '記念日' : action(reason);
      return { operation: '愛着度を獲得', description: `${reasonLabel}${amount ? ` ${amount}` : ''}` };
    }
    case 'level_up': return { operation: 'レベルアップ', description: detail };
    case 'action': return { operation: action(detail), description: 'きょうのふれあいを記録' };
    case 'poke': return { operation: 'キャラクターをタップ', description: '' };
    case 'dress_open': return { operation: 'きせかえを開く', description: '' };
    case 'equip': {
      const [slotId, itemId] = detail.split(':');
      const item = ITEMS.find((entryItem) => entryItem.id === itemId)?.name || (itemId === 'none' ? 'はずす' : itemId);
      return { operation: 'きせかえを変更', description: `${slot[slotId] || slotId}：${item}` };
    }
    case 'chat_me': return { operation: 'メッセージを送信', description: 'おしゃべり' };
    case 'chat_kasa': return { operation: 'メッセージを受信', description: 'キャラクターからの返答' };
    case 'memo_add': return { operation: '日記を追加', description: '' };
    case 'memo_delete': return { operation: '日記を削除', description: '' };
    case 'measure': {
      const [measureId, status] = detail.split(':');
      const measure = MEASURES.find((entryMeasure) => entryMeasure.id === measureId)?.label || measureId;
      return { operation: status === 'on' ? 'たいせつ対策を記録' : 'たいせつ対策を解除', description: measure };
    }
    case 'anniversary': return { operation: '記念日', description: detail };
    case 'home_view': return { operation: '表示を切替', description: detail === 'photo' ? '登録写真を表示' : 'キャラクターを表示' };
    case 'record_tab': return { operation: 'きろく内のページを開く', description: tab[detail] || detail };
    case 'howto_open': return { operation: '使い方を開く', description: '' };
    case 'export': return { operation: detail === 'share' ? 'CSVを共有' : 'CSVを保存', description: '' };
    case 'submit': return { operation: '研究者へ送信', description: detail === 'sent' ? '送信を開始' : '送信エラー' };
    default: return { operation: entry.type, description: detail };
  }
}
function buildCsv(withBom = true) {
  const pid = state.participantId;
  const rows = [['participant_id', 'timestamp', 'type', 'detail', 'operation', 'description']];
  state.logs.forEach((entry) => {
    const summary = describeLog(entry);
    rows.push([pid, fmtTs(entry.ts), entry.type, entry.detail, summary.operation, summary.description]);
  });
  const u = state.umbrella;
  const li = levelInfo(state.xp);
  const now = fmtTs(Date.now());
  const snap = {
    app_version: APP_VERSION,
    level: li.lv,
    xp: state.xp,
    umbrella_name: u?.name,
    umbrella_type: u?.type,
    color: u?.color,
    start_date: u?.startDate,
    registered_date: u?.registeredDate,
    days_since_start: u ? daysSinceStart() : '',
    days_since_register: u ? daysSinceMeet() : '',
    active_days: Object.values(state.daily).filter((d) => d.out || d.home || d.care || d.chat || d.memo).length,
    login_days: Object.values(state.daily).filter((d) => d.login).length,
    measures: MEASURES.filter((m) => state.measures[m.id]?.on).map((m) => m.id).join('|'),
    memories: state.memories.length,
    equipped: Object.entries(state.equipped).map(([k, v]) => `${k}:${v || '-'}`).join('|')
  };
  Object.entries(snap).forEach(([k, v]) => rows.push([pid, now, 'snapshot', `${k}=${v ?? ''}`, '記録時点の集計', `${k}：${v ?? ''}`]));
  return (withBom ? '\uFEFF' : '') + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}
function csvFileName() {
  const d = new Date();
  return `kasatomo_${state.participantId}_${ymd(d).replace(/-/g, '')}_${pad(d.getHours())}${pad(d.getMinutes())}.csv`;
}
async function exportCsv(share) {
  log('export', share ? 'share' : 'download');
  save();
  const csv = buildCsv();
  const name = csvFileName();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  if (share) {
    const file = new File([blob], name, { type: 'text/csv' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); return; } catch (err) { if (err?.name === 'AbortError') return; }
    }
    toast('共有に対応していないため、保存に切り替えます');
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function submitToResearcher() {
  if (!/^https:\/\//.test(CONFIG.submitUrl)) return;
  if (!window.confirm('記録データを研究者へ送信します。よろしいですか？')) return;
  try {
    await fetch(CONFIG.submitUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ participantId: state.participantId, sentAt: new Date().toISOString(), csv: buildCsv(false) })
    });
    log('submit', 'sent');
    toast('送信しました。ご協力ありがとうございます！');
  } catch {
    log('submit', 'error');
    toast('送信できませんでした。通信環境を確認してください。');
  }
  save();
}
function resetAll() {
  if (!window.confirm('すべてのデータ（登録内容・記録）を削除します。よろしいですか？')) return;
  if (!window.confirm('削除したデータは元に戻せません。本当に削除しますか？\n（研究参加中の方は、先にCSVを保存してください）')) return;
  localStorage.removeItem(STORE_KEY);
  runtime.resetting = true;
  location.replace(location.pathname + location.search);
}

/* ---------- モーダル ---------- */
function flushModals() {
  const dlg = $('#modal');
  if (dlg.open || $('#dress').open || !runtime.modalQueue.length) return;
  const m = runtime.modalQueue.shift();
  const u = state.umbrella;
  let html = '';
  if (m.type === 'level') {
    html = `<div class="modal-hero">${kasaSvg({ mood: 'happy' })}</div>
      <p class="kicker">LEVEL UP</p><h3>Lv.${m.lv} になったよ！</h3>
      <p>愛着ランク「${esc(rankOf(m.lv))}」</p>
      ${m.unlocked.length ? `<div class="unlock"><p>あたらしいきせかえ</p><ul>${m.unlocked.map((i) => `<li>${esc(i.name)}</li>`).join('')}</ul></div>` : ''}`;
  } else if (m.type === 'anniv') {
    html = `<div class="modal-hero">${kasaSvg({ mood: 'happy' })}</div>
      <p class="kicker">ANNIVERSARY</p><h3>きょうは記念日！</h3>
      <ul class="anniv-list">${m.items.map((i) => `<li>${icon('gift')}<span>${esc(i.label)}<small>${fmtDate(i.date)}</small></span></li>`).join('')}</ul>
      <p>${esc(u.name)}「${esc(fill('{user}、これからもよろしくね！'))}」</p>
      <p class="bonus">愛着度 +${XP.anniv * m.items.length}</p>`;
  } else if (m.type === 'welcome') {
    html = `<div class="modal-hero">${kasaSvg({ mood: 'happy' })}</div>
      <p class="kicker">WELCOME</p><h3>${esc(u.name)}が なかまになったよ！</h3>
      <p>${esc(fill('よろしくね、{user}！ 毎日いっしょに過ごそうね。'))}</p>
      <p class="note">使い方は右上の「？」からいつでも見られます。</p>`;
  } else if (m.type === 'howto') {
    html = howtoHtml();
  }
  $('#modal-body').innerHTML = html;
  dlg.showModal();
}
function howtoHtml() {
  return `<p class="kicker">HOW TO</p><h3>Monogatoryのつかいかた</h3>
    <ol class="howto">
      <li><b>ホーム</b>：相棒のキャラクターがいます。タップすると話してくれます。</li>
      <li><b>きょうのふれあい</b>：持って出かけたら「いっしょにおでかけ」、持ち帰ったら「ぶじに帰ってきた」、乾かす・点検などをしたら「お手入れした」を押します（各1日1回）。</li>
      <li><b>おしゃべり</b>：話しかけると返事をしてくれます。下のボタンからも話しかけられます。</li>
      <li><b>きろく</b>：使い始めてからの日数・記念日・カレンダー・日記・たいせつ対策を確認できます。</li>
      <li><b>きせかえ</b>：愛着度（レベル）が上がると、アイテムが増えていきます。</li>
      <li><b>せってい</b>：登録内容の編集や、記録データの書き出しができます。</li>
    </ol>`;
}
function openHowto() {
  runtime.modalQueue.push({ type: 'howto' });
  log('howto_open');
  save();
  flushModals();
}

/* ---------- トースト ---------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => t.classList.remove('show'), 2400);
}

function hydrateIcons(root) {
  $$('i[data-ic]', root).forEach((el) => { el.outerHTML = icon(el.dataset.ic); });
}

/* ---------- イベント ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action } = el.dataset;
  switch (action) {
    case 'act': doAction(el.dataset.kind); break;
    case 'poke': poke(); break;
    case 'dress': openDress(); break;
    case 'toggle-home-view': state.homeView = state.homeView === 'photo' ? 'chara' : 'photo'; log('home_view', state.homeView); save(); renderHome(); break;
    case 'close-dress': $('#dress').close(); break;
    case 'dress-tab': runtime.dressSlot = el.dataset.slot; renderDress(); break;
    case 'equip': equip(el.dataset.id, el.dataset.slot); break;
    case 'go': goView(el.dataset.to); break;
    case 'go-measure': runtime.recordTab = 'measure'; goView('record'); break;
    case 'rec-tab': runtime.recordTab = el.dataset.tab; log('record_tab', el.dataset.tab); save(); renderRecord(); break;
    case 'cal': shiftMonth(Number(el.dataset.dir)); break;
    case 'chip': sendChat(el.dataset.text); break;
    case 'del-memo': deleteMemo(el.dataset.id); break;
    case 'edit-umbrella': showRegister(true); break;
    case 'register-back': runtime.editing ? goView('settings') : showScreen('welcome'); break;
    case 'export': exportCsv(false); break;
    case 'share': exportCsv(true); break;
    case 'submit': submitToResearcher(); break;
    case 'howto': openHowto(); break;
    case 'reset': resetAll(); break;
    case 'close-modal': $('#modal').close(); break;
    default: break;
  }
});
document.addEventListener('submit', (e) => {
  const f = e.target;
  if (f.id === 'diary-form') { e.preventDefault(); addMemo(f); }
});
document.addEventListener('change', (e) => {
  const m = e.target.dataset?.measure;
  if (m) toggleMeasure(m, e.target.checked);
});

$('#welcome-form').addEventListener('submit', onWelcomeSubmit);
$('#register-form').addEventListener('submit', onRegisterSubmit);
$('#register-form').addEventListener('input', updateRegisterPreview);
$('#register-form').addEventListener('change', (e) => {
  if (e.target.name !== 'pronoun') return;
  const custom = $('#reg-pronoun-custom');
  custom.hidden = e.target.value !== PRONOUN_CUSTOM;
  if (!custom.hidden) custom.focus();
});
$('#photo-input').addEventListener('change', onPhotoChange);
$('#chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#chat-input');
  sendChat(input.value);
  input.value = '';
});
['#dress', '#modal'].forEach((sel) => {
  $(sel).addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
});
$('#modal').addEventListener('close', () => window.setTimeout(flushModals, 250));
$('#dress').addEventListener('close', () => window.setTimeout(flushModals, 250));
window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !$('#screen-main').classList.contains('is-active')) return;
  log('app_resume');
  if (state.lastSeen !== today()) { dailyCheck(); route(); flushModals(); } else { save(); }
});

boot();
