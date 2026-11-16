// Alter Ego: a personal routine game. All data stays in this browser (localStorage).
(function () {
  "use strict";
  var D = window.AE_DATA, CH = D.CHARS;
  var app = document.getElementById("app");
  var LS = "ae-state-v1", LSART = "ae-art-v1";
  var PER_LV = 150;

  // ---------- state ----------
  var DEF = {
    name: "Sphinx",
    settings: { mode: "one", main: { s: "09:00", e: "17:00", days: [1, 2, 3, 4, 5] }, contract: { name: "Contract job", s: "19:00", e: "21:00", days: [1, 3, 5] }, voice: "ja" },
    days: {}, sur: { used: [], wk: "", idx: -1, swapped: false }
  };
  var S = load(LS) || JSON.parse(JSON.stringify(DEF));
  S.settings = Object.assign({}, DEF.settings, S.settings || {});
  S.sur = S.sur || JSON.parse(JSON.stringify(DEF.sur));
  S.days = S.days || {};
  var ART = load(LSART) || {};
  var LSVOX = "ae-vox-v1", VOX = load(LSVOX) || {};
  function saveVox() { try { localStorage.setItem(LSVOX, JSON.stringify(VOX)); return true; } catch (e) { toast("That clip is too big to store. Try a shorter one."); return false; } }
  function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { toast("Couldn't save. Storage is full."); } }
  function saveArt() { try { localStorage.setItem(LSART, JSON.stringify(ART)); return true; } catch (e) { toast("That image is too big to store. Try a smaller one."); return false; } }

  // ---------- dates (a new day starts at 4 am) ----------
  function base() { var n = new Date(Date.now() - 4 * 3600e3); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12); }
  function key(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function weekKey(d) { return key(addDays(d, -((d.getDay() + 6) % 7))); }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function today() { return S.days[key(base())]; }
  function charOf(id) { return CH.filter(function (c) { return c.id === id; })[0]; }
  var DAYN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  // ---------- plan ----------
  function hm(s) { var p = String(s || "0:0").split(":"); return (+p[0] || 0) + (+p[1] || 0) / 60; }
  function fmt(h) { var H = Math.floor(h + 1e-6), M = Math.round((h - H) * 60); if (M === 60) { H++; M = 0; } var h12 = H % 12 || 12, ap = (H % 24) >= 12 ? "pm" : "am"; return h12 + (M ? ":" + String(M).padStart(2, "0") : "") + " " + ap; }
  function okJob(j) { return j && hm(j.e) > hm(j.s); }
  function jobsFor(d) {
    var T = S.settings, w = d.getDay(), out = [];
    if (T.main.days.indexOf(w) >= 0 && okJob(T.main)) out.push({ n: "Main job", k: "work", s: hm(T.main.s), e: hm(T.main.e) });
    if (T.mode === "two" && T.contract.days.indexOf(w) >= 0 && okJob(T.contract)) out.push({ n: T.contract.name || "Contract job", k: "contract", s: hm(T.contract.s), e: hm(T.contract.e) });
    return out.sort(function (a, b) { return a.s - b.s; });
  }
  function planFor(d) {
    var jobs = jobsFor(d), w = d.getDay(), segs = [], WAKE = 6.25, END = 23.5, mv = D.MOVETXT[D.MOVE[w]];
    var P = { jobs: jobs, segs: segs, load: "normal", short: false, lite: false, learnTiny: false };
    function add(s, e, label, k) { if (e - s >= 0.15) segs.push({ s: s, e: e, label: label, k: k }); }
    if (!jobs.length) {
      P.load = "free";
      if (w === 6) add(8, 23.5, "Rest day. Sleep in, no quests needed", "sleep");
      else if (w === 0) { add(8, 9, mv + ", slow start", "leaf"); add(10, 11, "Plan the week", "buffer"); add(11, 17.5, "Batch create: blogs and videos", "chill"); add(21, 21.5, "Tiny walk", "walk"); add(21.5, 22, "Sunday recap", "teal"); }
      else { add(WAKE, 7.5, "Coffee + " + mv.toLowerCase(), "leaf"); add(7.5, 8.75, "Bath + breakfast", "buffer"); add(18, 20.5, "Chill + dinner", "chill"); add(21, 21.5, "Tiny walk", "walk"); add(22, END, "Focus quest", "teal"); }
      return P;
    }
    var first = jobs[0].s, mEnd = first - 0.25, last = 0, hours = 0;
    jobs.forEach(function (j) { last = Math.max(last, j.e); hours += j.e - j.s; });
    if (mEnd - WAKE >= 2.25) { add(WAKE, WAKE + 1.25, "Coffee + " + mv.toLowerCase(), "leaf"); add(WAKE + 1.25, mEnd, "Bath + breakfast", "buffer"); }
    else if (mEnd - WAKE >= 1) { P.short = true; add(WAKE, WAKE + 0.5, "Coffee + quick " + mv.toLowerCase(), "leaf"); add(WAKE + 0.5, mEnd, "Bath + breakfast", "buffer"); }
    else { P.short = true; add(WAKE, Math.max(WAKE + 0.25, mEnd), "Coffee, out the door", "buffer"); }
    var gapFocus = 0;
    jobs.forEach(function (j, i) {
      add(j.s, j.e, j.n, j.k);
      var nx = jobs[i + 1];
      if (nx && nx.s - j.e >= 1) { var g = nx.s - j.e; add(j.e, j.e + Math.min(1, g - 0.25), "Gap: eat + reset", "chill"); if (g >= 1.75) { add(j.e + 1, nx.s - 0.25, "Gap focus round", "teal"); gapFocus += nx.s - 0.25 - (j.e + 1); } }
    });
    var es = last + 0.5, E = END - es;
    var walk = E >= 2.5 ? 0.5 : 0, focus = Math.max(0, Math.min(1.5, E - walk - 1)), chill = Math.max(0, E - walk - focus);
    add(es, es + chill, chill >= 1.5 ? "Chill + dinner" : E < 1.5 ? "Light dinner + wind down" : "Quick dinner", "chill");
    add(es + chill, es + chill + walk, "Tiny walk", "walk");
    add(es + chill + walk, END, focus >= 1 ? "Focus quest" : "Mini focus", "teal");
    var totalFocus = focus + gapFocus;
    P.load = (hours >= 10 || totalFocus < 1) ? "heavy" : hours > 8.5 ? "busy" : "normal";
    P.lite = P.load === "heavy";
    P.learnTiny = totalFocus < 0.4;
    return P;
  }
  var LOADTXT = { free: "Free day", normal: "Normal day", busy: "Busy day", heavy: "Heavy day" };
  var SEGC = { leaf: "#3F8F5A", buffer: "#B9A27A", work: "#14161C", contract: "#6B2E8F", chill: "#E0A040", walk: "#4AA3A0", teal: "#0F766E", sleep: "#8B93A5" };
  function questsFor(c, P, d) {
    var mv = D.MOVE[d.getDay()];
    return { mv: mv, am: P.short ? D.MOVELITE[mv] : c.am[mv], pm: P.lite ? c.pmLite : c.pm, learn: P.learnTiny ? "10 minutes of learning (packed day)" : "One 25-minute focus round" };
  }

  // ---------- scoring ----------
  function floorDone(r) { var c = (r && r.ck) || {}; return !!(c.f1 && c.f2 && c.f3); }
  function allDone(r) { var c = (r && r.ck) || {}; return floorDone(r) && c.am && c.pm && c.vow && c.tw; }
  function dayXP(r) {
    if (!r || !r.ck) return 0; var c = r.ck;
    var x = ((c.f1 ? 1 : 0) + (c.f2 ? 1 : 0) + (c.f3 ? 1 : 0)) * 5 + (floorDone(r) ? 10 : 0) + (c.am ? 20 : 0) + (c.pm ? 20 : 0) + (c.vow ? 15 : 0) + (c.tw ? 10 : 0) + (c.sx ? 300 : 0);
    return r.lucky ? x * 2 : x;
  }
  function totals() {
    var xp = 0, bonds = {};
    CH.forEach(function (c) { bonds[c.id] = 0; });
    Object.keys(S.days).forEach(function (k) { var r = S.days[k], x = dayXP(r); xp += x; if (r.c in bonds) bonds[r.c] += x; });
    return { xp: xp, bonds: bonds };
  }
  function lvOf(xp) { return Math.floor(xp / PER_LV) + 1; }
  function rankOf(lv) { var r = D.RANKS[0][1]; D.RANKS.forEach(function (x) { if (lv >= x[0]) r = x[1]; }); return r; }
  function heartsOf(b) { var h = 0; D.HEARTS.forEach(function (t, i) { if (b >= t) h = i + 1; }); return h; }
  function kept(r) { return r && (r.pass || floorDone(r)); }
  function passesUsed(d) {
    var mon = addDays(d, -((d.getDay() + 6) % 7)), n = 0;
    for (var i = 0; i < 7; i++) { var r = S.days[key(addDays(mon, i))]; if (r && r.pass === 1) n++; }
    return n;
  }
  function streak() {
    var keys = Object.keys(S.days).sort(); if (!keys.length) return 0;
    var first = keys[0], d = base(), s = 0, auto = {};
    for (var i = 0; i < 1000; i++) {
      var k = key(d); if (k < first) break;
      var r = S.days[k];
      if (kept(r)) { if (r.pass !== "sat") s++; }
      else if (i === 0 || d.getDay() === 6) { /* today is still open; Saturday never breaks */ }
      else { var w = weekKey(d); var used = (auto[w] || 0) + passesUsed(d); if (used < 2) auto[w] = (auto[w] || 0) + 1; else break; }
      d = addDays(d, -1);
    }
    return s;
  }
  function rankFor(r) {
    var c = (r && r.ck) || {};
    if (allDone(r)) return "S";
    if (floorDone(r)) return ((c.am ? 1 : 0) + (c.pm ? 1 : 0) + (c.vow ? 1 : 0)) >= 2 ? "A" : "B";
    return Object.keys(c).some(function (k) { return c[k]; }) ? "C" : "D";
  }
  function dailyQuote(c) {
    var pool = c.quotes.concat(c.daily || []), n = Math.round(base().getTime() / 864e5);
    return pool[n % pool.length];
  }
  function chapterNo(r) { return r.ch || 1; }
  function chapterTitle(c, r) { return c.chapters[(r.cn || 0) % c.chapters.length]; }

  // ---------- weekend surprise box (opens Saturday, clear it Saturday or Sunday) ----------
  function weekend() { var w = base().getDay(); return w === 6 || w === 0; }
  function boxOpened() { surpriseIdx(); return !!S.sur.opened; }
  function surpriseIdx() {
    var wk = weekKey(base());
    if (S.sur.wk !== wk) {
      var free = []; for (var i = 0; i < D.SURPRISES.length; i++) if (S.sur.used.indexOf(i) < 0) free.push(i);
      if (!free.length) { S.sur.used = []; free = D.SURPRISES.map(function (_, i) { return i; }); }
      S.sur = { used: S.sur.used, wk: wk, idx: free[hash(wk) % free.length], swapped: false, opened: false, done: "" };
      S.sur.used.push(S.sur.idx); save();
    }
    return S.sur.idx;
  }
  function swapSurprise() {
    if (S.sur.swapped) return;
    var free = []; for (var i = 0; i < D.SURPRISES.length; i++) if (S.sur.used.indexOf(i) < 0) free.push(i);
    if (!free.length) return;
    S.sur.idx = free[Math.floor(Math.random() * free.length)]; S.sur.used.push(S.sur.idx); S.sur.swapped = true;
    save();
  }

  // ---------- sound effects (synthesised, no files) ----------
  var AC = null;
  function actx() {
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
    if (AC.state === "suspended") AC.resume();
    return AC;
  }
  function tone(f, t0, dur, type, vol, f2) {
    var a = actx(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t0, dur, vol, from, to) {
    var a = actx(); if (!a) return;
    var n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + t0;
    src.buffer = b; f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(a.destination); src.start(t);
  }
  var SFX = {
    boom: function () { tone(110, 0, 0.6, "sine", 0.5, 40); noise(0, 0.18, 0.3, 800, 120); },
    whoosh: function () { noise(0, 0.45, 0.25, 300, 3000); },
    clear: function () { [784, 988, 1319].forEach(function (f, i) { tone(f, i * 0.07, 0.25, "triangle", 0.15); }); },
    gong: function () { tone(196, 0, 1.6, "sine", 0.3, 180); tone(392, 0, 1.2, "sine", 0.12, 370); },
    stamp: function () { tone(90, 0, 0.3, "square", 0.2, 50); noise(0, 0.12, 0.35, 1200, 200); },
    drum: function () { for (var i = 0; i < 10; i++) tone(140, i * 0.06, 0.08, "sine", 0.18, 90); },
    reveal: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone(f, i * 0.08, 0.5, "triangle", 0.14); }); }
  };
  function sfx(n) { if (S.settings.sfx === false) return; try { SFX[n](); } catch (e) {} }
  function splash(kj, title, sub) {
    var el = document.createElement("div"); el.className = "splash"; el.setAttribute("role", "status");
    el.innerHTML = '<div class="splash-lines" aria-hidden="true"></div><b aria-hidden="true">' + kj + "</b><strong>" + esc(title) + "</strong><span>" + esc(sub) + "</span>";
    document.body.appendChild(el); sfx("boom"); setTimeout(function () { sfx("reveal"); }, 120);
    var gone = false, rm = function () { if (gone) return; gone = true; el.classList.add("out"); setTimeout(function () { el.remove(); }, 300); };
    el.addEventListener("click", rm); setTimeout(rm, 1500);
  }
  function burst(el) {
    var r = el.getBoundingClientRect(), b = document.createElement("span");
    b.className = "burst"; b.textContent = "完"; b.style.left = (r.left + 26) + "px"; b.style.top = (r.top + r.height / 2) + "px";
    document.body.appendChild(b); setTimeout(function () { b.remove(); }, 800);
  }
  function playVox(id) { if (!VOX[id]) return false; try { var a = new Audio(VOX[id]); a.play().catch(function () {}); } catch (e) {} return true; }
  var voxFor = null, voxInput = document.createElement("input");
  voxInput.type = "file"; voxInput.accept = "audio/*"; voxInput.hidden = true; document.body.appendChild(voxInput);
  voxInput.addEventListener("change", function () {
    var f = voxInput.files && voxInput.files[0], id = voxFor; voxInput.value = "";
    if (!f || !id) return;
    if (f.size > 1500000) { toast("Keep clips under 1.5 MB (a few seconds)."); return; }
    var fr = new FileReader();
    fr.onload = function () { var prev = VOX[id]; VOX[id] = fr.result; if (saveVox()) { toast("Voice clip saved for " + charOf(id).short); playVox(id); } else { if (prev) VOX[id] = prev; else delete VOX[id]; } render(); };
    fr.readAsDataURL(f);
  });

  // ---------- background music: original synth loops, one per character ----------
  function nf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  var M = { on: null, timer: null, step: 0, next: 0, master: null, el: null, duck: false };
  function mOut() { var a = actx(); if (!a) return null; if (!M.master) { M.master = a.createGain(); M.master.gain.value = 0; M.master.connect(a.destination); } return a; }
  function mNote(f, t, dur, type, vol, opt) {
    var a = AC; opt = opt || {};
    var o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (opt.bend) o.frequency.exponentialRampToValueAtTime(f * opt.bend, t + Math.min(dur, 0.25));
    if (opt.lp) { var fl = a.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = opt.lp; g.connect(fl); fl.connect(M.master); } else g.connect(M.master);
    var at = opt.at || 0.005;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, at + 0.02));
    o.connect(g); o.start(t); o.stop(t + Math.max(dur, at + 0.02) + 0.05);
  }
  function mNoise(t, dur, vol, type, freq) {
    var a = AC, n = Math.max(1, Math.floor(a.sampleRate * dur)), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = b; f.type = type; f.frequency.value = freq; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(M.master); src.start(t);
  }
  function kick(t, v, hi) { mNote(hi || 110, t, 0.35, "sine", v, { bend: 0.4 }); }
  var THEMES = {
    gojo: { name: "Six Eyes Groove", bpm: 92, play: function (s, t, L) {
      var bar = Math.floor(s / 16) % 4, k = s % 16, ch = [[50, 53, 57, 60], [46, 50, 53, 57], [43, 46, 50, 53], [45, 49, 52, 55]][bar];
      if (k === 0) ch.forEach(function (m) { mNote(nf(m + 12), t, L * 16, "sawtooth", 0.018, { lp: 900, at: 0.4 }); });
      if ([0, 6, 8, 14].indexOf(k) >= 0) mNote(nf(ch[0] - 12), t, L * 2, "triangle", 0.12);
      if (k % 4 === 0) kick(t, 0.22);
      if (k % 2 === 1) mNoise(t, 0.04, 0.05, "highpass", 7000);
      if (k === 4 || k === 12) mNoise(t, 0.12, 0.07, "bandpass", 2000);
      var mel = [74, -1, -1, 77, -1, 79, -1, -1, 81, -1, 79, -1, 77, -1, 74, -1];
      if (bar % 2 === 1 && mel[k] > 0) mNote(nf(mel[k]), t, 0.6, "sine", 0.05);
    } },
    naruto: { name: "Ninja Way Taiko", bpm: 132, play: function (s, t, L) {
      var k = s % 16, bar = Math.floor(s / 16) % 4;
      if ([0, 3, 8, 11].indexOf(k) >= 0) kick(t, 0.3, 95);
      if (k === 12 || k === 14) kick(t, 0.16, 180);
      if (k % 2 === 0) mNoise(t, 0.03, 0.03, "highpass", 6000);
      if (k === 0) mNote(nf(38), t, L * 16, "triangle", 0.06, { at: 0.05 });
      var ph = [[62, -1, 64, -1, 67, -1, 69, 67, -1, 64, -1, 62, 64, -1, -1, -1], [62, -1, 64, -1, 67, -1, 69, -1, 71, -1, 69, 67, 69, -1, -1, -1], [74, -1, 71, -1, 69, -1, 67, 69, -1, 67, -1, 64, 62, -1, 64, -1], [67, -1, 69, -1, 71, 69, 67, -1, 64, -1, 62, -1, 62, -1, -1, -1]][bar];
      if (ph[k] > 0) mNote(nf(ph[k]), t, 0.28, "triangle", 0.07, { bend: 0.985 });
    } },
    kakashi: { name: "Copy Ninja Lo-fi", bpm: 78, swing: 0.33, play: function (s, t, L) {
      var k = s % 16, bar = Math.floor(s / 16) % 4, ch = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]][bar];
      if (k === 0 || k === 10) ch.forEach(function (m, i) { mNote(nf(m), t + i * 0.012, L * 6, "sine", 0.03, { at: 0.01 }); mNote(nf(m + 12), t, L * 3, "triangle", 0.008); });
      if (k === 0 || k === 7 || k === 10) kick(t, 0.2, 90);
      if (k === 4 || k === 12) mNoise(t, 0.16, 0.06, "bandpass", 1600);
      if (k % 2 === 0) mNoise(t, 0.03, 0.02, "highpass", 8000);
      if (k === 0) mNote(nf(ch[0] - 12), t, L * 8, "sine", 0.1);
      if (k === 8) mNote(nf(ch[0] - 5), t, L * 6, "sine", 0.08);
      if (Math.random() < 0.25) mNoise(t + Math.random() * L, 0.006, 0.02, "highpass", 3000);
    } },
    nezuko: { name: "Bamboo Lullaby", bpm: 66, play: function (s, t, L) {
      var k = s % 16, bar = Math.floor(s / 16) % 4;
      if (k === 0) { mNote(nf(40), t, L * 16, "sine", 0.06, { at: 1 }); mNote(nf(52), t, L * 16, "sine", 0.02, { at: 1.2 }); mNoise(t, L * 16, 0.012, "bandpass", 500); }
      var ph = [[64, -1, -1, -1, 69, -1, 71, -1, 72, -1, -1, -1, 71, -1, 69, -1], [64, -1, 65, -1, 69, -1, -1, -1, 71, -1, 69, -1, 65, -1, 64, -1], [76, -1, -1, -1, 72, -1, 71, -1, 69, -1, -1, -1, 71, -1, 72, -1], [71, -1, 69, -1, 65, -1, 64, -1, -1, -1, -1, -1, -1, -1, -1, -1]][bar];
      if (ph[k] > 0) { mNote(nf(ph[k]), t, 1.4, "triangle", 0.07); mNote(nf(ph[k] + 12), t, 0.5, "sine", 0.015); }
    } }
  };
  function mTick() {
    var a = AC, th = THEMES[M.on]; if (!a || !th || !M.timer) return;
    var L = 60 / th.bpm / 4;
    while (M.next < a.currentTime + 0.3) {
      try { th.play(M.step, M.next + (M.step % 2 && th.swing ? th.swing * L : 0), L); } catch (e) {}
      M.next += L; M.step++;
    }
  }
  function mLevel() { return M.duck ? 0.2 : 0.6; }
  function musicStop() {
    clearInterval(M.timer); M.timer = null;
    if (M.master && AC) { var t = AC.currentTime; M.master.gain.cancelScheduledValues(t); M.master.gain.setTargetAtTime(0, t, 0.15); }
    if (M.el) { M.el.pause(); URL.revokeObjectURL(M.el.src); M.el = null; }
    M.on = null;
  }
  function musicPlay(id) {
    if (M.on === id) { if (AC && AC.state === "suspended") AC.resume(); if (M.el && M.el.paused) M.el.play().catch(function () {}); return; }
    musicStop(); M.on = id;
    bgmGet(id).then(function (blob) {
      if (M.on !== id) return;
      if (blob) { M.el = new Audio(URL.createObjectURL(blob)); M.el.loop = true; M.el.volume = 0.6 * mLevel(); M.el.play().catch(function () {}); return; }
      var a = mOut(); if (!a) return;
      var t = a.currentTime; M.master.gain.cancelScheduledValues(t); M.master.gain.setTargetAtTime(mLevel(), t + 0.05, 0.4);
      M.step = 0; M.next = t + 0.1; M.timer = setInterval(mTick, 60); mTick();
    });
  }
  function duck(on) {
    M.duck = on;
    if (M.master && AC && M.timer) { M.master.gain.cancelScheduledValues(AC.currentTime); M.master.gain.setTargetAtTime(mLevel(), AC.currentTime, 0.2); }
    if (M.el) M.el.volume = 0.6 * mLevel();
  }
  var MUSVIEWS = ["pick", "cut", "brief", "today", "checkin", "verdict"];
  function musicSync() {
    var r = today(), id = view === "pick" ? tmp.pick : (r && r.c && !r.pass ? r.c : null);
    if (S.settings.bgm === false || MUSVIEWS.indexOf(view) < 0 || document.visibilityState === "hidden") id = null;
    if (tmp.preview && view === "bonds") return;
    tmp.preview = null;
    if (id) musicPlay(id); else if (M.on) musicStop();
  }
  document.addEventListener("pointerdown", function () {
    if (AC && AC.state === "suspended") AC.resume();
    if (M.el && M.el.paused) M.el.play().catch(function () {});
    if (!M.on) musicSync();
  }, true);

  // your own BGM files live in IndexedDB (too big for localStorage)
  var idbP = null;
  function idb() {
    if (!idbP) idbP = new Promise(function (res) {
      try { var q = indexedDB.open("alter-ego", 1); q.onupgradeneeded = function () { q.result.createObjectStore("bgm"); }; q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(null); }; } catch (e) { res(null); }
    });
    return idbP;
  }
  function bgmGet(id) {
    return idb().then(function (db) {
      if (!db) return null;
      return new Promise(function (res) { try { var q = db.transaction("bgm").objectStore("bgm").get(id); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); }; } catch (e) { res(null); } });
    });
  }
  function bgmSet(id, blob) {
    return idb().then(function (db) {
      if (!db) throw new Error("no db");
      return new Promise(function (res, rej) { var tx = db.transaction("bgm", "readwrite"); if (blob) tx.objectStore("bgm").put(blob, id); else tx.objectStore("bgm").delete(id); tx.oncomplete = function () { res(); }; tx.onerror = function () { rej(tx.error); }; });
    });
  }
  var BGMHAS = {};
  CH.forEach(function (c) { bgmGet(c.id).then(function (b) { if (b) { BGMHAS[c.id] = 1; if (view === "bonds") render(); } }); });
  var bgmFor = null, bgmInput = document.createElement("input");
  bgmInput.type = "file"; bgmInput.accept = "audio/*"; bgmInput.hidden = true; document.body.appendChild(bgmInput);
  bgmInput.addEventListener("change", function () {
    var f = bgmInput.files && bgmInput.files[0], id = bgmFor; bgmInput.value = "";
    if (!f || !id) return;
    if (f.size > 25e6) { toast("Keep the track under 25 MB."); return; }
    bgmSet(id, f).then(function () { BGMHAS[id] = 1; if (M.on === id) musicStop(); toast("Your BGM is set for " + charOf(id).short); render(); })
      .catch(function () { toast("Couldn't store that track on this phone."); });
  });

  // ---------- voice ----------
  var synth = window.speechSynthesis, voices = [];
  function loadVoices() { if (synth) voices = synth.getVoices() || []; }
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function voiceFor(lang) {
    var want = lang === "ja" ? /^ja/i : /^en/i;
    var list = voices.filter(function (v) { return want.test(v.lang); });
    return list.filter(function (v) { return /google|kyoko|otoya|natural|premium|enhanced/i.test(v.name); })[0] || list[0] || null;
  }
  var speakToken = 0;
  function stopVoice() { speakToken++; if (synth) synth.cancel(); duck(false); }
  // pairs: [[ja, en], ...]. onLine(i) fires as each line starts, onEnd when finished or stopped.
  function speak(c, pairs, onLine, onEnd) {
    stopVoice();
    var mode = S.settings.voice, tok = speakToken, i = 0;
    if (!synth || mode === "off") { if (onEnd) onEnd(); return false; }
    duck(true);
    var lang = mode === "en" ? "en" : "ja", v = voiceFor(lang);
    function next() {
      if (tok !== speakToken) return;
      if (i >= pairs.length) { duck(false); if (onEnd) onEnd(); return; }
      var p = pairs[i], text = lang === "ja" ? p[0] : p[1];
      if (onLine) onLine(i);
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "ja" ? "ja-JP" : "en-US"; if (v) u.voice = v;
      u.pitch = c.voice.pitch; u.rate = c.voice.rate;
      var done = false, fin = function () { if (done) return; done = true; i++; setTimeout(next, 220); };
      u.onend = fin; u.onerror = fin;
      // Safety net: some phones never fire onend.
      setTimeout(fin, 2500 + text.length * (lang === "ja" ? 260 : 90));
      synth.speak(u);
    }
    next();
    return true;
  }

  // ---------- art ----------
  function avaHTML(c, size, rad) {
    var inner = ART[c.id] ? '<img src="' + ART[c.id] + '" alt="">' : (c.avatar || emblem(c));
    return '<div class="ava" style="--c:' + c.c + ';width:' + size + 'px;height:' + size + 'px;border-radius:' + (rad || 16) + 'px" aria-hidden="true">' + inner + "</div>";
  }
  function emblem(c) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + c.emblem + "</svg>"; }
  var artFor = null;
  var artInput = document.getElementById("artInput");
  artInput.addEventListener("change", function () {
    var f = artInput.files && artInput.files[0], id = artFor; artInput.value = "";
    if (!f || !id) return;
    var url = URL.createObjectURL(f), img = new Image();
    img.onload = function () {
      var m = 512, s = Math.min(1, m / Math.max(img.width, img.height)), cv = document.createElement("canvas");
      cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      var prev = ART[id]; ART[id] = cv.toDataURL("image/jpeg", 0.84);
      if (saveArt()) toast("Art saved for " + charOf(id).short); else { if (prev) ART[id] = prev; else delete ART[id]; }
      render();
    };
    img.onerror = function () { toast("Couldn't read that image."); };
    img.src = url;
  });

  // ---------- small UI helpers ----------
  var toastT;
  function toast(t) { var el = document.getElementById("toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove("show"); }, 2400); }
  function buzz(n) { try { if (navigator.vibrate) navigator.vibrate(n || 12); } catch (e) {} }
  function confetti(n) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var cols = ["#C8322B", "#2A6FDB", "#D9620F", "#C93C72", "#14161C", "#E0A040"];
    for (var i = 0; i < n; i++) {
      var p = document.createElement("i"); p.className = "cf";
      p.style.left = Math.random() * 100 + "vw"; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * 0.6 + "s";
      document.body.appendChild(p); setTimeout(function (el) { el.remove(); }.bind(null, p), 2600);
    }
  }
  function floatXP(el, txt) {
    var r = el.getBoundingClientRect(), f = document.createElement("span");
    f.className = "floatxp"; f.textContent = txt; f.style.left = (r.right - 60) + "px"; f.style.top = (r.top + 6) + "px";
    document.body.appendChild(f); setTimeout(function () { f.remove(); }, 950);
  }
  var ICON = {
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    gear: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
    stop: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    today: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v15H4z"/><path d="M4 9h16M9 3v4M15 3v4"/></svg>',
    week: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 20V11M10 20V6M15 20v-7M20 20V9"/></svg>',
    bonds: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'
  };
  function tabs(cur) {
    function b(id, label) { return '<button type="button" data-act="tab" data-arg="' + id + '"' + (cur === id ? ' aria-current="page"' : "") + ">" + ICON[id] + label + "</button>"; }
    return '<nav class="tabs" aria-label="Main">' + b("today", "Today") + b("week", "Week") + b("bonds", "Bonds") + "</nav>";
  }
  function hdr(back, title, right) {
    return '<div class="between"><div class="row">' + (back ? '<button type="button" class="iconbtn" data-act="go" data-arg="' + back + '" aria-label="Back">' + ICON.back + "</button>" : "") + '<h2>' + esc(title) + "</h2></div>" + (right || "") + "</div>";
  }

  // ---------- router ----------
  var view = "", tmp = {};
  function initialView() {
    var r = today();
    if (!r) return "morning";
    if (r.pass || r.c) return "today";
    if (weekend() && !boxOpened()) return "box";
    return "pass";
  }
  function go(v) { stopVoice(); clearTimeout(tmp.wrT); app.classList.remove("still"); view = v; render(); window.scrollTo(0, 0); }
  function setTheme() {
    var r = today(), id = (view === "pick" && tmp.pick) ? tmp.pick : (r && r.c);
    if (id) document.body.setAttribute("data-char", id); else document.body.removeAttribute("data-char");
  }
  function render() {
    if (!view) view = initialView();
    if (["today", "checkin", "verdict", "brief", "cut"].indexOf(view) >= 0 && !today()) view = "morning";
    if (["checkin", "verdict", "brief", "cut"].indexOf(view) >= 0 && !(today() || {}).c) view = initialView();
    setTheme();
    var fn = V[view] || V.today;
    app.innerHTML = fn();
    var auto = app.querySelector("[data-autofocus]"); if (auto) auto.focus();
    if (V[view].after) V[view].after();
    musicSync();
  }

  // ---------- views ----------
  var V = {};

  V.morning = function () {
    var t = base(), h = new Date().getHours(), greet = h < 4 ? "Still up" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    var sun = t.getDay() === 0, sat = t.getDay() === 6, dayN = Object.keys(S.days).length + (today() ? 0 : 1);
    surpriseIdx();
    var sub = sat ? "Saturday. No work today, and a surprise box has arrived for you." : sun ? (S.sur.done ? "Sunday. Batch day, at your own pace." : "Sunday. Your surprise quest is still open until tonight.") : "A new chapter is ready when you are.";
    return '<section class="screen speed morning" aria-labelledby="mh"><span class="kanji" aria-hidden="true">朝</span>' +
      '<div class="stack"><span class="eyebrow">' + DAYN[t.getDay()] + " · " + t.getDate() + " " + MON[t.getMonth()] + " · Day " + dayN + " of your story</span>" +
      '<h1 id="mh">' + greet + ", " + esc(S.name) + ".</h1><p class=\"muted\">" + sub + "</p></div>" +
      '<div class="grow" style="display:grid;place-items:center"><div class="seal" aria-hidden="true">起</div></div>' +
      '<div class="stack"><p class="small muted" style="text-align:center">Up before 7:00 checks your first floor quest.</p>' +
      '<button type="button" class="btn acc" data-act="wake" data-autofocus>I\'m up</button></div></section>';
  };

  V.box = function () {
    var s = D.SURPRISES[surpriseIdx()];
    if (!tmp.boxOpen) {
      return '<section class="screen dark boxscr" aria-labelledby="bxh"><span class="kanji" aria-hidden="true">宝</span>' +
        '<div class="stack"><span class="eyebrow">Weekend · surprise box</span><h1 id="bxh">Something arrived for you.</h1>' +
        '<p class="muted">One unique side quest, never repeated. Clear it on Saturday or Sunday for +300 XP.</p></div>' +
        '<div class="grow" style="display:grid;place-items:center"><button type="button" class="giftbox" data-act="boxOpen" aria-label="Open the surprise box" data-autofocus><span class="crate"></span><span class="lid"></span><span class="ribbon"></span></button></div>' +
        '<p class="small muted" style="text-align:center">Tap the box to open it</p></section>';
    }
    return '<section class="screen dark boxscr opened" aria-labelledby="sh"><div class="rays" aria-hidden="true"></div><span class="kanji" aria-hidden="true">宝</span>' +
      '<div class="stack"><span class="eyebrow">Surprise box · +300 XP · Saturday or Sunday</span><h1 id="sh" class="slamin">' + esc(s[0]) + "</h1></div>" +
      '<div class="ink card popin" style="font-size:18px;line-height:1.5;font-weight:600">' + esc(s[1]) + "</div>" +
      '<p class="muted small">It waits in your quests all weekend. Take a lazy Saturday and do it Sunday, or the other way round.</p>' +
      '<div class="grow"></div><div class="stack">' +
      '<button type="button" class="btn light" data-act="surOk" data-autofocus>Accept the mission</button>' +
      (S.sur.swapped ? '<p class="muted small" style="text-align:center">Swap used this week.</p>' : '<button type="button" class="btn outline-light" data-act="surSwap">Swap it (once a week)</button>') +
      "</div></section>";
  };
  function surpriseHTML(r) {
    var s = D.SURPRISES[surpriseIdx()], k = key(base());
    if (S.sur.done && S.sur.done !== k) {
      return '<div class="qgroup"><span class="eyebrow">Weekend surprise box</span><div class="q sxq"><span class="box" style="background:var(--acc);border-color:var(--acc)">' + ICON.check + '</span><span class="lbl"><b>' + esc(s[0]) + " · cleared yesterday</b>" + esc(s[1]) + '</span><span class="xp">+300</span></div></div>';
    }
    var on = !!(r.ck && r.ck.sx);
    return '<div class="qgroup"><span class="eyebrow">Weekend surprise box · ' + (base().getDay() === 6 ? "today or tomorrow" : "last day: today") + '</span><button type="button" class="q sxq" data-act="ck" data-arg="sx" aria-pressed="' + on + '"><span class="box">' + (on ? ICON.check : "") + '</span><span class="lbl"><b>' + esc(s[0]) + "</b>" + esc(s[1]) + '</span><span class="xp">+' + (r.lucky ? 600 : 300) + "</span></button></div>";
  }

  V.pass = function () {
    var d = base(), sat = d.getDay() === 6, left = 2 - passesUsed(d);
    return '<section class="screen" aria-labelledby="ph"><span class="kanji" aria-hidden="true">道</span>' +
      '<div class="stack"><span class="eyebrow">Before we start</span><h1 id="ph">Play today, or take a pass?</h1>' +
      '<p class="muted">' + (sat ? "Saturday is your rest day. Your streak is safe either way." : "A pass keeps your streak safe. You get 2 lazy passes a week.") + "</p></div>" +
      '<div class="grow"></div><div class="stack">' +
      '<button type="button" class="btn acc" data-act="cont" data-autofocus>Continue the story</button>' +
      (sat ? '<button type="button" class="btn ghost" data-act="pass" data-arg="sat">Rest day, no quests</button>'
        : left > 0 ? '<button type="button" class="btn ghost" data-act="pass" data-arg="1">Use a lazy pass (' + left + " left)</button>"
        : '<p class="small muted" style="text-align:center">No passes left this week. Even 10 minutes keeps the floor.</p>') +
      "</div></section>";
  };

  function portrait(c) { return ART[c.id] ? '<img src="' + ART[c.id] + '" alt="">' : c.avatar; }
  V.pick = function () {
    var T = totals(), sel = tmp.pick, c = sel ? charOf(sel) : null, d = base();
    var stage;
    if (c) {
      var h = heartsOf(T.bonds[c.id]), pips = "";
      for (var i = 1; i <= 5; i++) pips += '<i class="' + (i <= h ? "on" : "") + '"></i>';
      var stat = function (lab, v) { var b = ""; for (var k = 1; k <= 5; k++) b += '<i class="' + (k <= v ? "on" : "") + '"></i>'; return '<div class="stat"><span>' + lab + '</span><span class="sb" role="img" aria-label="' + lab + " " + v + ' of 5">' + b + "</span></div>"; };
      var mv = D.MOVE[d.getDay()];
      stage = '<div class="stage" style="--c:' + c.c + '"><div class="speedlines" aria-hidden="true"></div><div class="fig" aria-hidden="true">' + portrait(c) + "</div>" +
        '<div class="sinfo"><span class="ser">' + esc(c.series) + '</span><p class="nmL">' + esc(c.short) + '</p><span class="vibe">' + esc(c.vibe) + "</span>" +
        stat("Energy", c.stats[0]) + stat("Focus", c.stats[1]) + stat("Rest", c.stats[2]) +
        '<div class="stat"><span>Bond</span><span class="pips" style="--c:#FFFFFF">' + pips + "</span></div></div>" +
        '<div class="move"><b>Opening move</b> ' + esc(c.am[mv]) + "</div><div class=\"flash\" aria-hidden=\"true\"></div></div>";
    } else {
      stage = '<div class="stage empty"><p class="qm">?</p><p class="small" style="opacity:.8">Tap a fighter below</p></div>';
    }
    var tiles = CH.map(function (x) {
      return '<button type="button" class="tile" style="--c:' + x.c + '" data-act="pick" data-arg="' + x.id + '" aria-pressed="' + (sel === x.id) + '" aria-label="' + esc(x.name) + '">' + portrait(x) + "<span>" + esc(x.short) + "</span></button>";
    }).join("");
    return '<section class="screen dark sel" aria-labelledby="pkh"><span class="kanji" aria-hidden="true">選</span>' +
      '<div class="between"><div class="stack" style="gap:2px"><span class="eyebrow">Player 1 · ' + esc(S.name) + '</span><h2 id="pkh">Select your alter ego</h2></div>' +
      '<button type="button" class="btn outline-light sm" data-act="fate">Random</button></div>' +
      stage + '<div class="tiles">' + tiles + "</div>" +
      '<div class="grow"></div><button type="button" class="btn ' + (c ? "acc" : "light") + '" data-act="start"' + (c ? "" : " disabled") + ">" + (c ? "Select " + esc(c.short) : "Choose a fighter") + "</button></section>";
  };

  V.cut = function () {
    var r = today(), c = charOf(r.c);
    var panel = ART[c.id] ? '<img src="' + ART[c.id] + '" alt="">' : (c.avatar || emblem(c));
    return '<section class="screen cut" style="--c:' + c.c + '" data-act="toBrief" role="button" tabindex="0" aria-label="Tap to start the briefing" data-autofocus>' +
      '<div class="cold" aria-hidden="true"><b>第' + chapterNo(r) + '話</b><small>EPISODE ' + chapterNo(r) + "</small></div><div class=\"bang\" aria-hidden=\"true\"></div>" +
      '<div class="speedlines" aria-hidden="true"></div>' +
      '<span class="ctag">Chapter ' + chapterNo(r) + "</span>" +
      '<div class="panel" aria-hidden="true">' + panel + "</div>" +
      '<h1 class="chap">' + esc(chapterTitle(c, r)) + "</h1>" +
      '<span class="ctag">' + esc(c.name) + " · tap to begin</span></section>";
  };

  function briefLines(c, r) {
    var d = base(), P = planFor(d), Q = questsFor(c, P, d), q = dailyQuote(c), L = [];
    L.push(c.intro);
    L.push([q[2], "Today's quote, from " + q[1] + ": " + q[0]]);
    L.push([D.MOVEJA[Q.mv], "Morning: " + Q.am]);
    if (P.load !== "free" || d.getDay() !== 6) L.push([P.lite ? "夜は短く一回だけ集中。" : "夜は集中タイム。", "Tonight: " + Q.pm]);
    L.push(["今日の誓いも忘れずに。", "Your vow: " + c.vow]);
    L.push(["今日のひねりもあるよ。", "Daily twist: " + D.TWISTS[r.t % D.TWISTS.length]]);
    if (weekend() && !S.sur.done) L.push(["それと、週末のサプライズ任務を忘れるな。", "And this weekend's surprise quest: " + D.SURPRISES[surpriseIdx()][0] + "."]);
    if (r.lucky) L.push(["しかも今日はラッキー巻物、経験値二倍だ！", "And it's a lucky scroll today. Every XP counts double!"]);
    L.push(c.outro);
    return L;
  }
  V.brief = function () {
    var r = today(), c = charOf(r.c), L = briefLines(c, r);
    var bars = ""; for (var i = 0; i < 22; i++) bars += "<i></i>";
    var vm = S.settings.voice, chip = vm === "ja" ? "Japanese voice" : vm === "en" ? "English voice" : "Voice off";
    return '<section class="screen dark" aria-labelledby="bh"><span class="kanji" aria-hidden="true">' + c.kanji + "</span>" +
      '<div class="row">' + avaHTML(c, 52, 14) + '<div class="stack" style="gap:2px"><span class="eyebrow">Briefing</span><h2 id="bh">' + esc(c.short) + "</h2></div></div>" +
      '<div class="voicechips"><span>' + chip + "</span><span>English text</span>" + (r.lucky ? "<span>Lucky scroll · 2× XP</span>" : "") + "</div>" +
      '<div class="row"><button type="button" class="iconbtn" data-act="briefPlay" aria-label="Play or stop the briefing" id="bp">' + ICON.play + '</button><div class="wave" id="wave" aria-hidden="true">' + bars + "</div></div>" +
      '<div class="subs" id="subs">' + L.map(function (p, i) { return '<p data-i="' + i + '">' + esc(p[1]) + "</p>"; }).join("") + "</div>" +
      '<div class="grow"></div><button type="button" class="btn light" data-act="tab" data-arg="today">Start my day</button></section>';
  };
  function playBrief() {
    var r = today(), c = charOf(r.c), L = briefLines(c, r);
    var subs = document.getElementById("subs"), wave = document.getElementById("wave"), bp = document.getElementById("bp");
    if (!subs) return;
    var ps = subs.querySelectorAll("p");
    function mark(i) { ps.forEach(function (p, k) { p.className = k < i ? "done" : k === i ? "now" : ""; }); }
    tmp.playing = true; wave.classList.add("on"); bp.innerHTML = ICON.stop;
    var ok = speak(c, L, mark, function () { tmp.playing = false; if (document.getElementById("wave")) { wave.classList.remove("on"); bp.innerHTML = ICON.play; mark(L.length); } });
    if (!ok) { mark(L.length); if (S.settings.voice !== "off") toast("No speech voice on this device. Text only."); }
  }

  V.today = function () {
    var r = today(); if (!r) return V.morning();
    var d = base(), T = totals(), lv = lvOf(T.xp), into = T.xp % PER_LV, si = streak();
    var top = '<div class="between"><div class="stack" style="gap:2px"><span class="eyebrow">' + DAYN[d.getDay()] + " · " + d.getDate() + " " + MON[d.getMonth()] + '</span></div><span class="chip">🔥 ' + si + " day" + (si === 1 ? "" : "s") + "</span></div>";
    var xpbar = '<div class="stack" style="gap:6px"><div class="between small"><b>Lv ' + lv + " · " + rankOf(lv) + '</b><span class="muted">' + into + " / " + PER_LV + ' XP</span></div><div class="bar" role="progressbar" aria-label="Level progress" aria-valuemin="0" aria-valuemax="' + PER_LV + '" aria-valuenow="' + into + '"><i style="width:' + (into / PER_LV * 100) + '%"></i></div></div>';
    if (r.pass) {
      return '<section class="screen has-tabs"><span class="kanji" aria-hidden="true">休</span>' + top +
        '<div class="stack"><h1>' + (r.pass === "sat" ? "Rest day." : "Pass day.") + '</h1><p class="muted">' + (r.pass === "sat" ? "Saturday is off. Sleep in, eat well, watch something good." : "Streak is safe. Rest properly, and come back tomorrow for a new chapter.") + "</p></div>" + xpbar +
        (weekend() ? surpriseHTML(r) : "") +
        '<button type="button" class="btn ghost" data-act="unpass">Changed my mind, play today</button></section>' + tabs("today");
    }
    var c = charOf(r.c), P = planFor(d), Q = questsFor(c, P, d), q = dailyQuote(c), ck = r.ck || {};
    function qb(id, tag, txt, xp) {
      var on = !!ck[id];
      return '<button type="button" class="q" data-act="ck" data-arg="' + id + '" aria-pressed="' + on + '"><span class="box">' + (on ? ICON.check : "") + '</span><span class="lbl"><b>' + tag + "</b>" + esc(txt) + '</span><span class="xp">+' + (r.lucky ? xp * 2 : xp) + "</span></button>";
    }
    var map = P.segs.map(function (s) { return '<div class="mapline"><span class="t">' + fmt(s.s) + '</span><span class="dot" style="background:' + SEGC[s.k] + '"></span><span>' + esc(s.label) + "</span></div>"; }).join("");
    var h = '<section class="screen has-tabs"><span class="kanji" aria-hidden="true">' + c.kanji + "</span>" + top +
      '<div class="row">' + avaHTML(c, 64, 16) + '<div class="stack" style="gap:2px;min-width:0"><span class="eyebrow">Chapter ' + chapterNo(r) + " · " + esc(c.short) + '</span><h2>' + esc(chapterTitle(c, r)) + "</h2></div></div>" + xpbar;
    if (r.lucky) h += '<div class="lucky">Lucky scroll: every quest gives double XP today.</div>';
    h += '<button type="button" class="quote" data-act="hearQuote" style="all:unset;cursor:pointer;display:block;border-left:4px solid var(--acc);padding:4px 0 4px 12px"><q>' + esc(q[0]) + "</q><span>" + esc(q[1]) + " · tap to hear it in Japanese</span></button>";
    if (weekend()) h += surpriseHTML(r);
    h += '<div class="qgroup"><span class="eyebrow">Floor · keeps the streak</span>' +
      qb("f1", "Wake", "Up before 7:00", 5) + qb("f2", "Move", "10 minutes of movement, or the full " + D.MOVETXT[Q.mv].toLowerCase(), 5) + qb("f3", "Learn", Q.learn, 5) + "</div>";
    h += '<div class="qgroup"><span class="eyebrow">' + esc(c.short) + "'s quests</span>" +
      qb("am", "Morning · " + D.MOVETXT[Q.mv], Q.am, 20) + qb("pm", P.lite ? "Night · lite (heavy day)" : "Night", Q.pm, 20) + qb("vow", "Vow", c.vow, 15) + "</div>";
    h += '<div class="qgroup"><span class="eyebrow">Daily twist</span>' + qb("tw", "Twist", D.TWISTS[r.t % D.TWISTS.length], 10) + "</div>";
    h += '<details class="ink card"><summary style="cursor:pointer;font-weight:800">Day map · ' + LOADTXT[P.load] + '</summary><div class="stack" style="gap:6px;margin-top:10px">' + map + "</div></details>";
    h += '<div class="stack"><button type="button" class="btn ghost" data-act="go" data-arg="brief">Replay briefing</button>' +
      '<div class="two"><button type="button" class="btn ghost" data-act="go" data-arg="checkin">Check-in</button><button type="button" class="btn acc" data-act="verdict">End my day</button></div></div>';
    return h + "</section>" + tabs("today");
  };

  V.checkin = function () {
    var r = today(), c = charOf(r.c), msgs = r.msgs || [];
    var h = '<section class="screen night" aria-labelledby="chh"><span class="kanji" aria-hidden="true">夜</span>' +
      '<div class="row"><button type="button" class="iconbtn" data-act="tab" data-arg="today" aria-label="Back">' + ICON.back + "</button>" + avaHTML(c, 44, 22) + '<div class="stack" style="gap:0"><h3 id="chh">' + esc(c.short) + '</h3><span class="small muted">Evening check-in</span></div></div>' +
      '<div class="chat" role="log">' + '<div class="msg c" style="color:var(--ink)">' + esc(c.ask[1]) + "</div>" +
      msgs.map(function (m) { return '<div class="msg ' + m.w + '"' + (m.w === "c" ? ' style="color:var(--ink)"' : ' style="border-color:#FFFFFF"') + ">" + esc(m.t) + "</div>"; }).join("") + "</div>";
    if (!r.mood) {
      h += '<div class="moods">' + [["great", "Great"], ["okay", "Okay"], ["tired", "Tired"], ["rough", "Rough"], ["stressed", "Stressed"]].map(function (m) { return '<button type="button" data-act="mood" data-arg="' + m[0] + '" style="color:var(--ink)">' + m[1] + "</button>"; }).join("") + "</div>";
    } else if (!r.win) {
      h += '<form class="composer" data-form="win"><label class="sr" for="winIn">Your win today</label><input id="winIn" autocomplete="off" maxlength="200" placeholder="One win from today" style="color:var(--ink)" data-autofocus><button type="submit" class="iconbtn" aria-label="Send">' + ICON.send + "</button></form>";
    } else {
      h += '<button type="button" class="btn light" data-act="verdict">See today\'s verdict</button>';
    }
    return h + "</section>";
  };
  V.checkin.after = function () { var log = app.querySelector(".chat"); if (log) log.lastElementChild && log.lastElementChild.scrollIntoView({ block: "end" }); };

  V.verdict = function () {
    var r = today(), c = charOf(r.c), rk = r.v || rankFor(r), si = streak();
    var n = Object.keys(r.ck || {}).filter(function (k) { return r.ck[k]; }).length;
    var tm = addDays(base(), 1);
    return '<section class="screen speed verdictscr" aria-labelledby="vh"><span class="kanji" aria-hidden="true">判</span>' +
      hdr("today", "Chapter " + chapterNo(r) + " ends") +
      '<div style="display:grid;place-items:center;padding:16px 0"><div class="rank" role="img" aria-label="' + rk + ' rank">' + rk + "</div></div>" +
      '<h1 id="vh" style="text-align:center">' + { S: "S-rank. Perfect day.", A: "A-rank. Strong day.", B: "B-rank. Floor kept.", C: "C-rank. Halfway.", D: "D-rank. Rest and reset." }[rk] + "</h1>" +
      '<div class="ink card row">' + avaHTML(c, 44, 22) + '<p style="font-weight:600">"' + esc(c.verdict[rk][1]) + '"</p></div>' +
      '<div class="stats3"><div class="ink"><b>' + dayXP(r) + "</b><span>XP today</span></div><div class=\"ink\"><b>" + n + "</b><span>quests done</span></div><div class=\"ink\"><b>" + si + "</b><span>day streak</span></div></div>" +
      '<p class="muted small" style="text-align:center">Tomorrow is a ' + D.MOVETXT[D.MOVE[tm.getDay()]].toLowerCase() + " day" + (tm.getDay() === 6 ? ", and Saturday brings a surprise box." : ".") + "</p>" +
      '<div class="grow"></div><div class="two"><button type="button" class="btn ghost" data-act="hearVerdict">Hear it again</button><button type="button" class="btn acc" data-act="tab" data-arg="today">Done</button></div></section>';
  };

  function weekData(off) {
    var t = base(), mon = addDays(t, -((t.getDay() + 6) % 7) - 7 * off), upto = (t.getDay() + 6) % 7, out = { xp: 0, upto: 0, days: [], quests: 0 };
    for (var i = 0; i < 7; i++) {
      var d = addDays(mon, i), r = S.days[key(d)], x = dayXP(r);
      out.days.push({ d: d, r: r, xp: x });
      out.xp += x; if (i <= upto) out.upto += x;
      if (r && r.ck) out.quests += Object.keys(r.ck).filter(function (k) { return r.ck[k]; }).length;
    }
    return out;
  }
  V.week = function () {
    var W = weekData(0), L = weekData(1), t = base(), tk = key(t);
    var strip = W.days.map(function (o) {
      var r = o.r, cl = !r ? "" : r.pass ? "ps" : allDone(r) ? "s2" : floorDone(r) ? "s1" : "";
      if (key(o.d) === tk) cl += " now";
      var st = !r ? "no record" : r.pass ? "pass" : allDone(r) ? "all quests" : floorDone(r) ? "floor kept" : "started";
      return '<div class="' + cl + '" aria-label="' + DAYN[o.d.getDay()] + ": " + st + '">' + "MTWTFSS"[(o.d.getDay() + 6) % 7] + "</div>";
    }).join("");
    var mx = Math.max(W.upto, L.upto, 1);
    var rival = '<div class="ink card stack"><span class="eyebrow">Rival: last week\'s you</span>' +
      '<div class="rv"><b>You</b><div class="bar"><i style="width:' + (W.upto / mx * 100) + '%"></i></div><span>' + W.upto + " XP</span></div>" +
      '<div class="rv"><span class="muted">Ghost</span><div class="bar"><i class="ghost" style="width:' + (L.upto / mx * 100) + '%"></i></div><span class="muted">' + L.upto + " XP</span></div>" +
      '<p class="small muted">' + (W.upto > L.upto ? "You're ahead of last week at this point." : W.upto === L.upto ? "Neck and neck with last week." : "Ghost is ahead by " + (L.upto - W.upto) + " XP. One quest closes the gap.") + "</p></div>";
    var plan = W.days.map(function (o) {
      var P = planFor(o.d), jobs = P.jobs.map(function (j) { return j.n + " " + fmt(j.s) + "–" + fmt(j.e); }).join(", ");
      var ct = P.jobs.some(function (j) { return j.k === "contract"; });
      return '<div class="setrow"><span><b>' + DAYN[o.d.getDay()].slice(0, 3) + "</b> · " + esc(jobs || (o.d.getDay() === 6 ? "Rest" : o.d.getDay() === 0 ? "Batch blogs + videos" : "Free")) + "</span>" +
        '<span class="small" style="font-weight:700;color:' + (ct ? "var(--contract)" : "var(--muted)") + '">' + LOADTXT[P.load] + "</span></div>";
    }).join("");
    return '<section class="screen has-tabs"><span class="kanji" aria-hidden="true">週</span>' + hdr("", "This week") +
      '<div class="strip">' + strip + "</div>" + rival +
      '<div class="ink card"><span class="eyebrow">Week map</span>' + plan + "</div>" +
      '<button type="button" class="btn acc" data-act="wrapped">Play this week\'s Wrapped</button></section>' + tabs("week");
  };

  V.bonds = function () {
    var T = totals();
    var list = CH.map(function (c) {
      var b = T.bonds[c.id], h = heartsOf(b), nxt = D.HEARTS[h], pips = "";
      for (var i = 1; i <= 5; i++) pips += '<i class="' + (i <= h ? "on" : "") + '"></i>';
      return '<div class="ink bond" style="--c:' + c.c + '">' + avaHTML(c, 60, 16) +
        '<div class="info"><div class="between"><b>' + esc(c.short) + '</b><span class="pips" role="img" aria-label="Bond ' + h + ' of 5">' + pips + "</span></div>" +
        '<span class="small muted">' + b + " bond XP" + (nxt ? " · next at " + nxt : " · max bond") + "</span>" +
        '<div class="row" style="gap:6px;flex-wrap:wrap">' +
        '<button type="button" class="btn ghost sm" data-act="art" data-arg="' + c.id + '">' + (ART[c.id] ? "Change art" : "Add art") + "</button>" +
        (ART[c.id] ? '<button type="button" class="btn ghost sm" data-act="artDel" data-arg="' + c.id + '">Remove</button>' : "") +
        '<button type="button" class="btn ghost sm" data-act="line" data-arg="' + c.id + '">Hear a line</button>' +
        '<button type="button" class="btn ghost sm" data-act="bgmPrev" data-arg="' + c.id + '">♪ ' + (BGMHAS[c.id] ? "Play my BGM" : esc(THEMES[c.id].name)) + "</button>" +
        '<button type="button" class="btn ghost sm" data-act="bgm" data-arg="' + c.id + '">' + (BGMHAS[c.id] ? "Change my BGM" : "Use my own BGM") + "</button>" +
        (BGMHAS[c.id] ? '<button type="button" class="btn ghost sm" data-act="bgmDel" data-arg="' + c.id + '">Back to theme</button>' : "") +
        '<button type="button" class="btn ghost sm" data-act="vox" data-arg="' + c.id + '">' + (VOX[c.id] ? "Change voice clip" : "Add voice clip") + "</button>" +
        (VOX[c.id] ? '<button type="button" class="btn ghost sm" data-act="voxPlay" data-arg="' + c.id + '">Play clip</button><button type="button" class="btn ghost sm" data-act="voxDel" data-arg="' + c.id + '">Remove clip</button>' : "") + "</div></div></div>";
    }).join("");
    return '<section class="screen has-tabs"><span class="kanji" aria-hidden="true">絆</span>' +
      hdr("", "Bonds", '<button type="button" class="iconbtn" data-act="go" data-arg="settings" aria-label="Settings">' + ICON.gear + "</button>") +
      '<p class="small muted">Play a character to grow your bond. Each level unlocks a new line. Art and voice clips you add stay on this phone only, and a clip plays when that character\'s episode opens.</p>' +
      list + "</section>" + tabs("bonds");
  };

  function effectText() {
    var T = S.settings, two = T.mode === "two";
    if (!two) return "One job: evenings stay free for dinner, a walk and a 90-minute focus quest.";
    var heavy = [], names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], t = base();
    for (var i = 0; i < 7; i++) { var d = addDays(t, i); if (planFor(d).lite) heavy.push(d.getDay()); }
    heavy.sort(function (a, b) { return ((a + 6) % 7) - ((b + 6) % 7); });
    return heavy.length ? heavy.map(function (w) { return names[w]; }).join(", ") + " become heavy days: lite quests for the same XP, and focus moves into any gap between jobs."
      : "The contract job fits around your evenings, so your quests stay as they are.";
  }
  function daysRow(job, cls) {
    var j = S.settings[job], ORDER = [1, 2, 3, 4, 5, 6, 0];
    return '<div class="days' + (cls ? " " + cls : "") + '" role="group" aria-label="' + (job === "main" ? "Main job days" : "Contract job days") + '">' +
      ORDER.map(function (w) { return '<button type="button" data-act="day" data-job="' + job + '" data-arg="' + w + '" aria-pressed="' + (j.days.indexOf(w) >= 0) + '" aria-label="' + DAYN[w] + '">' + "SMTWTFS"[w] + "</button>"; }).join("") + "</div>";
  }
  V.settings = function () {
    var T = S.settings, two = T.mode === "two", jv = voiceFor("ja");
    var h = '<section class="screen"><span class="kanji" aria-hidden="true">仕</span>' + hdr("bonds", "Settings") +
      '<label class="field">Your name<input data-set="name" value="' + esc(S.name) + '" maxlength="24" autocomplete="off"></label>' +
      '<div class="stack" style="gap:6px"><span class="eyebrow">Work mode</span><div class="seg ink" role="group" aria-label="Work mode">' +
      '<button type="button" data-act="mode" data-arg="one" aria-pressed="' + !two + '">One job</button><button type="button" data-act="mode" data-arg="two" aria-pressed="' + two + '">Two jobs</button></div></div>' +
      '<div class="ink card stack"><b>Main job</b><div class="two"><label class="field">Start<input type="time" data-set="main.s" value="' + T.main.s + '"></label><label class="field">End<input type="time" data-set="main.e" value="' + T.main.e + '"></label></div>' + daysRow("main") + "</div>";
    if (two) h += '<div class="ink card stack"><div class="between"><b>Contract job</b><span class="chip" style="border-color:var(--contract);color:var(--contract)">Purple on your map</span></div>' +
      '<label class="field">Name<input data-set="contract.name" value="' + esc(T.contract.name) + '" maxlength="30"></label>' +
      '<div class="two"><label class="field">Start<input type="time" data-set="contract.s" value="' + T.contract.s + '"></label><label class="field">End<input type="time" data-set="contract.e" value="' + T.contract.e + '"></label></div>' + daysRow("contract", "c") + "</div>";
    h += '<div class="effect" id="effect">' + esc(effectText()) + "</div>" +
      '<div class="ink card"><div class="setrow"><label for="vsel">Briefing voice</label><select id="vsel" data-set="voice" style="font-weight:700;border:2px solid var(--line);border-radius:10px;height:40px;background:var(--ground)">' +
      [["ja", "Japanese"], ["en", "English"], ["off", "Off"]].map(function (o) { return '<option value="' + o[0] + '"' + (T.voice === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div>" +
      '<div class="setrow"><label for="bgsel">Background music</label><select id="bgsel" data-set="bgm" style="font-weight:700;border:2px solid var(--line);border-radius:10px;height:40px;background:var(--ground)"><option value="on"' + (T.bgm !== false ? " selected" : "") + '>On</option><option value="off"' + (T.bgm === false ? " selected" : "") + ">Off</option></select></div>" +
      '<div class="setrow"><label for="fxsel">Sound effects</label><select id="fxsel" data-set="sfx" style="font-weight:700;border:2px solid var(--line);border-radius:10px;height:40px;background:var(--ground)"><option value="on"' + (T.sfx !== false ? " selected" : "") + '>On</option><option value="off"' + (T.sfx === false ? " selected" : "") + ">Off</option></select></div>" +
      '<div class="setrow"><span>Text</span><b>English</b></div><div class="setrow"><span>New day starts</span><b>4:00 am</b></div>' +
      '<p class="small muted" style="padding:8px 0">' + (!synth ? "This browser has no speech voices, so briefings show text only." : jv ? "Japanese voice found: " + esc(jv.name) + "." : "No Japanese voice found yet. On Android: Settings › Text-to-speech › install Japanese. On iPhone: Settings › Accessibility › Spoken Content › Voices › Japanese.") + "</p>" +
      '<button type="button" class="btn ghost sm" data-act="testVoice">Test voice</button></div>' +
      '<div class="ink card stack"><b>Backup</b><p class="small muted">Everything lives on this phone. Export a backup now and then, and import it on a new phone.</p>' +
      '<div class="row" style="flex-wrap:wrap"><button type="button" class="btn ghost sm" data-act="export">Export backup</button><button type="button" class="btn ghost sm" data-act="import">Import backup</button><button type="button" class="btn ghost sm" data-act="reset" style="color:var(--bad)">' + (tmp.resetArm ? "Tap again to erase" : "Reset all") + "</button></div></div></section>";
    return h;
  };

  // Wrapped: the volume recap.
  function wrappedSlides() {
    var W = weekData(0), first = Object.keys(S.days).sort()[0], vol = first ? Math.floor((base() - new Date(first + "T12:00:00")) / (7 * 864e5)) + 1 : 1;
    var cnt = {}, played = 0, best = null, wins = [];
    W.days.forEach(function (o) {
      var r = o.r; if (!r || !r.c) return; played++;
      cnt[r.c] = (cnt[r.c] || 0) + 1;
      if (!best || o.xp > best.xp) best = o;
      if (r.win) wins.push(r.win);
    });
    var topId = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0], top = topId ? charOf(topId) : CH[0];
    var tm = addDays(base(), 7 - ((base().getDay() + 6) % 7)), nextSur = "A new surprise box";
    return [
      { c: "#14161C", big: "Volume " + vol, sub: "Your week, as a story. Tap to turn the page." },
      { c: top.c, big: played + " chapter" + (played === 1 ? "" : "s"), sub: topId ? "Most played: " + top.short + ", " + cnt[topId] + " time" + (cnt[topId] === 1 ? "" : "s") + "." : "No chapters yet. Next week is wide open." },
      { c: "#0F766E", big: W.xp + " XP", sub: W.quests + " quests done" + (best ? ". Best day: " + DAYN[best.d.getDay()] + " with " + best.xp + " XP." : ".") },
      { c: "#C8322B", big: streak() + " day streak", sub: wins.length ? "A win you wrote down: \"" + wins[wins.length - 1] + "\"" : "Saturday never breaks it, and you get 2 lazy passes a week." },
      { c: "#6B2E8F", big: "Next volume", sub: "Starts " + DAYN[tm.getDay()] + " " + tm.getDate() + " " + MON[tm.getMonth()] + ". " + nextSur + " is already sealed." }
    ];
  }
  V.wrapped = function () {
    var sl = wrappedSlides(), i = Math.min(tmp.wr || 0, sl.length - 1), s = sl[i];
    var bars = sl.map(function (_, k) { return '<i class="' + (k < i ? "done" : k === i ? "now" : "") + '"></i>'; }).join("");
    return '<section class="screen wr" style="--c:' + s.c + '" data-act="wrNext" role="button" tabindex="0" aria-label="Next page" data-autofocus>' +
      '<div class="wrbars" aria-hidden="true">' + bars + '</div><button type="button" class="iconbtn wrx" data-act="tab" data-arg="week" aria-label="Close" style="border-color:rgba(255,255,255,.6);background:rgba(255,255,255,.1);color:#fff;box-shadow:none">' + ICON.close + "</button>" +
      '<span class="kanji" aria-hidden="true" style="opacity:.12;color:#fff">巻</span><p class="big">' + esc(s.big) + '</p><p class="sub">' + esc(s.sub) + "</p></section>";
  };
  V.wrapped.after = function () { clearTimeout(tmp.wrT); tmp.wrT = setTimeout(nextWr, 5000); };
  function nextWr() { if (view !== "wrapped") return; var n = wrappedSlides().length; tmp.wr = (tmp.wr || 0) + 1; if (tmp.wr >= n) { tmp.wr = 0; go("week"); } else render(); }

  // ---------- actions ----------
  function newRec() {
    var d = base(), k = key(d), h = new Date().getHours() + new Date().getMinutes() / 60;
    var r = { wake: Date.now(), ck: {}, t: hash(k + "tw") % D.TWISTS.length, lucky: hash(k + "lk") % 7 === 0 ? 1 : 0 };
    if (h >= 4 && h < 7) r.ck.f1 = 1;
    S.days[k] = r; save(); return r;
  }
  var A = {
    wake: function () { today() || newRec(); buzz(20); sfx("gong"); go(weekend() && !boxOpened() ? "box" : "pass"); },
    boxOpen: function (a, el) {
      if (tmp.boxBusy) return; tmp.boxBusy = true;
      el.classList.add("opening"); sfx("drum"); buzz([20, 40, 20, 40, 60]);
      setTimeout(function () { tmp.boxBusy = false; tmp.boxOpen = true; render(); sfx("boom"); sfx("reveal"); confetti(110); }, 900);
    },
    surOk: function () { S.sur.opened = true; tmp.boxOpen = false; save(); go(today().c || today().pass ? "today" : "pass"); },
    surSwap: function () { swapSurprise(); sfx("whoosh"); render(); toast("Swapped. This one is final for the week."); },
    vox: function (a) { voxFor = a; voxInput.click(); },
    bgm: function (a) { bgmFor = a; bgmInput.click(); },
    bgmDel: function (a) { bgmSet(a, null).then(function () { delete BGMHAS[a]; if (M.on === a) musicStop(); render(); toast("Back to " + THEMES[a].name); }); },
    bgmPrev: function (a) { if (M.on === a) { musicStop(); tmp.preview = null; return; } tmp.preview = a; musicPlay(a); toast("Playing " + (BGMHAS[a] ? "your BGM" : THEMES[a].name) + ". Tap again to stop."); },
    voxPlay: function (a) { playVox(a); },
    voxDel: function (a) { delete VOX[a]; saveVox(); render(); toast("Voice clip removed"); },
    cont: function () { tmp.pick = null; go("pick"); },
    pass: function (a) { var r = today(); r.pass = a === "sat" ? "sat" : 1; save(); go("today"); },
    unpass: function () { var r = today(); delete r.pass; save(); go("pick"); },
    pick: function (a) { tmp.pick = a; buzz(); render(); },
    fate: function () {
      var i = 0, n = 10, iv = setInterval(function () {
        tmp.pick = CH[Math.floor(Math.random() * CH.length)].id; render(); buzz(6);
        if (++i >= n) { clearInterval(iv); buzz(30); toast("Fate picked " + charOf(tmp.pick).short); }
      }, 110);
    },
    start: function () {
      if (!tmp.pick) return;
      var r = today(), prev = 0, cn = 0;
      Object.keys(S.days).forEach(function (k) { var x = S.days[k]; if (x !== r && x.c) { prev++; if (x.c === tmp.pick) cn++; } });
      r.c = tmp.pick; r.ch = prev + 1; r.cn = cn; save(); go("cut");
      var id = r.c; sfx("boom");
      setTimeout(function () { if (view === "cut") sfx("whoosh"); }, 1350);
      setTimeout(function () { if (view === "cut") { sfx("boom"); sfx("gong"); playVox(id); } }, 2050);
    },
    toBrief: function () { go("brief"); playBrief(); },
    briefPlay: function () { if (tmp.playing) { stopVoice(); tmp.playing = false; var w = document.getElementById("wave"); if (w) w.classList.remove("on"); document.getElementById("bp").innerHTML = ICON.play; } else playBrief(); },
    tab: function (a) { go(a); },
    go: function (a) { go(a); if (a === "brief") playBrief(); },
    ck: function (a, el) {
      var r = today(), before = lvOf(totals().xp); r.ck = r.ck || {};
      var was = !!r.ck[a]; if (was) delete r.ck[a]; else r.ck[a] = 1;
      if (a === "sx") S.sur.done = was ? "" : key(base());
      save(); var after = lvOf(totals().xp);
      var y = window.scrollY; app.classList.add("still"); render(); window.scrollTo(0, y);
      if (!was) {
        buzz(); var nb = app.querySelector('[data-arg="' + a + '"]'); if (nb) { floatXP(nb, nb.querySelector(".xp").textContent + " XP"); burst(nb); nb.focus({ preventScroll: true }); }
        if (a === "sx") { confetti(140); splash("宝", "Surprise cleared", "+300 XP. A legendary weekend."); }
        else if (after > before) { confetti(70); splash("昇", "Level up", "Lv " + after + " · " + rankOf(after)); }
        else if (allDone(r)) { confetti(90); splash("極", "All quests clear", "S-rank is yours today"); }
        else if (floorDone(r) && ["f1", "f2", "f3"].indexOf(a) >= 0) splash("守", "Floor kept", "Your streak is safe");
        else sfx("clear");
      } else { var nb2 = app.querySelector('[data-arg="' + a + '"]'); if (nb2) nb2.focus({ preventScroll: true }); }
    },
    hearQuote: function () { var r = today(), c = charOf(r.c), q = dailyQuote(c); if (!speak(c, [[q[2], q[0]]])) toast(S.settings.voice === "off" ? "Voice is off in Settings." : "No speech voice on this device."); },
    mood: function (a) {
      var r = today(), c = charOf(r.c), lab = { great: "Great", okay: "Okay", tired: "Tired", rough: "Rough", stressed: "Stressed" }[a];
      r.mood = a; r.msgs = (r.msgs || []).concat([{ w: "u", t: lab }, { w: "c", t: c.mood[a][1] + " " + c.winq[1] }]);
      save(); render(); speak(c, [c.mood[a], c.winq]);
    },
    verdict: function () {
      var r = today(), c = charOf(r.c), rk = rankFor(r); r.v = rk; save(); go("verdict"); sfx("drum");
      setTimeout(function () { sfx("stamp"); sfx("boom"); buzz([30, 40, 30]); if (rk === "S" || rk === "A") confetti(rk === "S" ? 110 : 50); }, 620);
      setTimeout(function () { if (view === "verdict") speak(c, [c.verdict[rk]]); }, 1100);
    },
    hearVerdict: function () { var r = today(), c = charOf(r.c); speak(c, [c.verdict[r.v || rankFor(r)]]); },
    wrapped: function () { tmp.wr = 0; go("wrapped"); },
    wrNext: function () { clearTimeout(tmp.wrT); nextWr(); },
    art: function (a) { artFor = a; artInput.click(); },
    artDel: function (a) { delete ART[a]; saveArt(); render(); toast("Art removed"); },
    line: function (a) {
      var c = charOf(a), h = heartsOf(totals().bonds[a]), ln = c.lines[Math.max(0, h - 1)];
      toast(ln[1]); if (!speak(c, [ln]) && S.settings.voice !== "off") { /* text shown in toast */ }
    },
    mode: function (a) { S.settings.mode = a; save(); render(); },
    day: function (a, el) {
      var j = S.settings[el.getAttribute("data-job")], w = +a, i = j.days.indexOf(w);
      if (i >= 0) j.days.splice(i, 1); else j.days.push(w);
      save(); render(); var nb = app.querySelector('[data-job="' + el.getAttribute("data-job") + '"][data-arg="' + a + '"]'); if (nb) nb.focus();
    },
    testVoice: function () { var r = today(), c = charOf((r && r.c) || "gojo"); if (!speak(c, [c.intro])) toast(S.settings.voice === "off" ? "Voice is off." : "No speech voice on this device."); },
    export: function () {
      var blob = new Blob([JSON.stringify({ app: "alter-ego", v: 1, state: S, art: ART, vox: VOX })], { type: "application/json" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "alter-ego-backup-" + key(base()) + ".json";
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast("Backup saved to your downloads");
    },
    import: function () { document.getElementById("importInput").click(); },
    reset: function () {
      if (!tmp.resetArm) { tmp.resetArm = true; render(); setTimeout(function () { tmp.resetArm = false; if (view === "settings") render(); }, 4000); return; }
      tmp.resetArm = false; S = JSON.parse(JSON.stringify(DEF)); ART = {}; VOX = {}; save(); saveArt(); saveVox(); CH.forEach(function (c) { bgmSet(c.id, null).catch(function () {}); }); BGMHAS = {}; toast("Everything erased"); go("morning");
    }
  };
  document.getElementById("importInput").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    f.text().then(function (t) {
      var o = JSON.parse(t); if (!o || o.app !== "alter-ego" || !o.state || !o.state.days) throw new Error("bad");
      S = o.state; S.settings = Object.assign({}, DEF.settings, S.settings || {}); S.sur = S.sur || JSON.parse(JSON.stringify(DEF.sur));
      ART = o.art || {}; VOX = o.vox || {}; save(); saveArt(); saveVox(); toast("Backup restored"); view = ""; render();
    }).catch(function () { toast("That file isn't an Alter Ego backup."); });
  });

  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]"); if (!el || !app.contains(el)) return;
    if (el.disabled) return;
    var fn = A[el.getAttribute("data-act")]; if (fn) { e.preventDefault(); fn(el.getAttribute("data-arg"), el); }
  });
  app.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
  });
  app.addEventListener("submit", function (e) {
    var f = e.target; if (f.getAttribute("data-form") !== "win") return;
    e.preventDefault();
    var inp = f.querySelector("input"), v = inp.value.trim(); if (!v) { inp.focus(); return; }
    var r = today(), c = charOf(r.c);
    r.win = v; r.msgs = (r.msgs || []).concat([{ w: "u", t: v }, { w: "c", t: c.ack[1] }]); save(); render(); speak(c, [c.ack]);
  });
  app.addEventListener("change", function (e) {
    var t = e.target, p = t.getAttribute("data-set"); if (!p) return;
    var T = S.settings, v = t.value;
    if (p === "name") S.name = v.trim() || "Sphinx";
    else if (p === "voice") T.voice = v;
    else if (p === "sfx") { T.sfx = v === "on"; if (T.sfx) sfx("clear"); }
    else if (p === "bgm") { T.bgm = v === "on"; musicSync(); }
    else { var bits = p.split("."); if (bits[1] !== "name" && !v) return; T[bits[0]][bits[1]] = v; }
    save();
    var ef = document.getElementById("effect"); if (ef) ef.textContent = effectText();
    if (p === "voice") render();
  });

  // Day rolls over at 4 am while the app sits open.
  var lastKey = key(base());
  setInterval(function () { var k = key(base()); if (k !== lastKey) { lastKey = k; view = ""; render(); } }, 60000);
  document.addEventListener("visibilitychange", function () { musicSync(); if (document.visibilityState === "visible") { var k = key(base()); if (k !== lastKey) { lastKey = k; view = ""; render(); } } });

  render();
})();
