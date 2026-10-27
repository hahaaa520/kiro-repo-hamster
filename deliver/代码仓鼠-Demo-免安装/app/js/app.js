/* ============================================================
   代码仓鼠 · 交互层
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var S = {
    profile: null,
    baseState: 'happy',
    typeToken: 0,
    eatTimer: null,
    shareVariant: 0,
    hook: false
  };

  var els = {};
  var SEV_LABEL = { mild: '小零食', medium: '有点噎人', hot: '辣嗓子' };

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n) { return Number(n || 0).toLocaleString('zh-CN'); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function raf(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }

  function typeText(el, text, speed) {
    if (!el._typeToken) el._typeToken = 0;
    var token = ++el._typeToken;
    el.textContent = '';
    var i = 0;
    return new Promise(function (resolve) {
      (function step() {
        if (token !== el._typeToken) return resolve(false);
        if (i >= text.length) return resolve(true);
        el.textContent = text.slice(0, ++i);
        setTimeout(step, speed || 18);
      })();
    });
  }

  var toastTimer;
  function toast(msg) {
    els.toastText.textContent = msg;
    els.toast.hidden = false;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove('show');
      setTimeout(function () { els.toast.hidden = true; }, 300);
    }, 2600);
  }

  function setLoading(on, text) {
    if (on) {
      els.loading.hidden = false;
      els.loadingText.textContent = text || '正在翻你的仓库…';
    } else {
      els.loading.hidden = true;
    }
  }

  function setHook(on) {
    S.hook = on;
    els.hookPill.classList.toggle('is-on', on);
    els.hookText.textContent = on ? 'Kiro Hook 已连接' : 'Kiro Hook 未连接';
  }

  /* ---------- 仓鼠舞台 ---------- */
  function setSceneState(state) {
    els.scene.classList.toggle('is-emo', state === 'emo');
    els.scene.classList.toggle('is-runaway', state === 'runaway');
    els.scene.classList.toggle('is-eating', state === 'eating');
    var art = state === 'runaway' ? 'happy' : state;
    els.hamsterHost.innerHTML = Hamster.svg(art);
  }

  function dropSeeds(count) {
    for (var i = 0; i < count; i++) {
      var b = document.createElement('span');
      b.className = 'seed-bit seed-fall';
      b.style.left = (30 + Math.random() * 40) + '%';
      b.style.top = (20 + Math.random() * 20) + '%';
      b.style.animationDelay = (Math.random() * 0.5) + 's';
      b.style.transform = 'rotate(' + (Math.random() * 180) + 'deg)';
      els.seedsFloat.appendChild(b);
      (function (node) { setTimeout(function () { node.remove(); }, 2000); })(b);
    }
  }

  /* ---------- GitHub ---------- */
  function gh(path, timeout) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, timeout || 9000);
    return fetch('https://api.github.com' + path, {
      headers: { 'Accept': 'application/vnd.github+json' },
      signal: ctrl.signal
    }).then(function (r) {
      clearTimeout(t);
      if (!r.ok) throw new Error('GitHub ' + r.status);
      return r.json();
    }, function (e) {
      clearTimeout(t);
      throw e;
    });
  }

  function pickRepo(repos) {
    var list = (repos || []).filter(function (r) { return !r.fork && !r.archived; });
    if (!list.length) list = repos || [];
    list.sort(function (a, b) { return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0); });
    return list[0];
  }

  function bugsFromCommit(detail, commits) {
    var found = [];
    var addedLines = 0;
    var hasTest = false;

    (detail.files || []).forEach(function (f) {
      if (/test|spec|__tests__/i.test(f.filename)) hasTest = true;
      addedLines += f.additions || 0;
      if (!f.patch) return;
      var newLine = 0;
      f.patch.split('\n').forEach(function (raw) {
        var hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
        if (hunk) { newLine = parseInt(hunk[1], 10); return; }
        if (raw.indexOf('+') === 0 && raw.indexOf('+++') !== 0) {
          var code = raw.slice(1);
          var loc = f.filename + (newLine ? ':' + newLine : '');
          if (/(password|secret|api[_-]?key|access[_-]?token)\s*[:=]\s*['"][^'"]{8,}/i.test(code)) {
            found.push({ severity: 'hot', title: '好像有一把钥匙被落在了代码里', file: loc, note: '仓鼠闻到危险的味道，建议立刻换成环境变量。' });
          } else if (/\bdebugger\b/.test(code)) {
            found.push({ severity: 'medium', title: '藏了一个 debugger，像一颗没剥壳的瓜子', file: loc, note: '上线前记得拿掉，不然它会卡在腮帮子里。' });
          } else if (/(console\.log|print\()/.test(code)) {
            found.push({ severity: 'mild', title: '把 console.log 当夜宵吃了', file: loc, note: '味道一般，但仓鼠不挑。' });
          } else if (/\b(TODO|FIXME|HACK)\b/i.test(code)) {
            found.push({ severity: 'mild', title: '咬到一颗 ' + code.match(/\b(TODO|FIXME|HACK)\b/i)[1] + ' 味的瓜子', file: loc, note: '这颗瓜子含在嘴里，还没舍得咽。' });
          } else if (/\bany\b/.test(code) && /\.(ts|tsx)$/.test(f.filename)) {
            found.push({ severity: 'mild', title: '代码里出现了一个 any，有点塞牙', file: loc, note: '仓鼠建议换成更明确一点的口味。' });
          } else if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(code)) {
            found.push({ severity: 'medium', title: '一个空的 catch，仓鼠连叹气都没听见', file: loc, note: '异常被悄悄咽下去了，建议至少说句话。' });
          }
          newLine++;
        } else if (raw.indexOf('-') !== 0) {
          newLine++;
        }
      });
    });

    if (addedLines > 150 && !hasTest) {
      found.push({ severity: 'medium', title: '这次改了 ' + fmt(addedLines) + ' 行，没带一个测试', file: '本次提交', note: '仓鼠有点噎得慌，建议下次配点测试一起咽。' });
    }

    var order = { hot: 0, medium: 1, mild: 2 };
    var seen = {};
    found = found.filter(function (b) {
      var k = b.severity + b.title;
      if (seen[k]) return false;
      seen[k] = 1; return true;
    }).sort(function (a, b) { return order[a.severity] - order[b.severity]; }).slice(0, 3);

    if (found.length < 2) {
      var fallback = [
        { severity: 'mild', title: 'commit message 里连一个 emoji 都没有', file: '—', note: '仓鼠觉得这缺乏一点情绪价值。' },
        { severity: 'mild', title: '它偷偷数了数，你的提交里有一条叫 "update"', file: '—', note: '味道很淡，但总比没有强。' }
      ];
      fallback.forEach(function (f) {
        if (found.length < 2) found.push(f);
      });
    }
    return found;
  }

  function fromGitHub(login) {
    var user;
    return gh('/users/' + encodeURIComponent(login))
      .then(function (u) {
        user = u;
        return gh('/users/' + encodeURIComponent(u.login) + '/repos?per_page=100&sort=pushed');
      })
      .then(function (repos) {
        var repo = pickRepo(repos);
        if (!repo) throw new Error('没有找到公开仓库');
        return gh('/repos/' + repo.full_name + '/commits?per_page=30').then(function (raw) {
          var commits = raw.map(function (c) {
            var commit = c.commit || {};
            var author = commit.author || {};
            return {
              sha: c.sha,
              message: String(commit.message || '').split('\n')[0],
              date: author.date || new Date().toISOString(),
              add: 0, del: 0, files: 0,
              url: c.html_url
            };
          });
          var detailPromise = commits.length
            ? gh('/repos/' + repo.full_name + '/commits/' + commits[0].sha).catch(function () { return null; })
            : Promise.resolve(null);
          return detailPromise.then(function (detail) {
            if (detail && detail.stats) {
              commits[0].add = detail.stats.additions || 0;
              commits[0].del = detail.stats.deletions || 0;
              commits[0].files = (detail.files || []).length;
            }
            var bugs = detail ? bugsFromCommit(detail, commits) : [
              { severity: 'mild', title: '这次提交没留下太多线索', file: '—', note: '仓鼠只闻到了一点瓜子的味道。' },
              { severity: 'mild', title: '它数了数，你的 commit message 有点短', file: '—', note: '也许下一次可以多写几个字，方便它下饭。' }
            ];
            return Engine.fromGitHub(user, repo, commits, bugs);
          });
        });
      });
  }

  /* ---------- 场景贡献图 ---------- */
  function buildContrib() {
    if (!els.contribGrid) return;
    var html = '';
    for (var i = 0; i < 28; i++) html += '<span class="contrib-cell"></span>';
    els.contribGrid.innerHTML = html;
  }

  function updateContrib(n) {
    if (!els.contribGrid) return;
    var cells = els.contribGrid.children;
    var count = n == null ? 11 : Math.min(28, Math.max(0, n));
    for (var i = 0; i < cells.length; i++) {
      cells[i].className = 'contrib-cell' + (i < count ? ' on' : '') + (i < Math.min(3, count) ? ' hot' : '');
    }
    if (els.contribCount) els.contribCount.textContent = n == null ? '— 颗瓜子' : n + ' 颗瓜子';
  }

  /* ---------- 渲染 ---------- */
  function renderHamster(state) {
    els.hamsterHost.innerHTML = Hamster.svg(state);
  }

  function renderStats(p) {
    var s = p.stats;
    var vals = {
      weight: [s.weight, '最近 30 天，它吃了 ' + fmt(s.commits30d * 3) + ' 颗瓜子'],
      mood: [s.mood, '最近一次提交：' + (p.commits[0] ? p.commits[0].ago : '很久以前')],
      hunger: [s.hunger, s.lastDays < 1 ? '刚刚吃饱，打了个嗝' : '已经 ' + Math.floor(s.lastDays) + ' 天没吃东西了'],
      bond: [s.bond, '它记住了你的 ' + fmt(p.user.followers || 0) + ' 个 follower']
    };
    raf(function () {
      $$('.stat', els.stats).forEach(function (row) {
        var key = row.getAttribute('data-stat');
        var data = vals[key];
        $('[data-val]', row).innerHTML = data[0] + '<small>%</small>';
        $('[data-bar]', row).style.width = data[0] + '%';
        $('[data-tip]', row).textContent = data[1];
      });
    });
  }

  function renderCommits(p) {
    els.commitList.innerHTML = p.commits.map(function (c) {
      var diff = '';
      if (c.add || c.del) {
        diff = '<div class="diff"><span class="add">+' + c.add + '</span><span class="del">-' + c.del + '</span></div>';
      }
      return '<li class="commit-item">' +
        '<span class="commit-seed">' + Hamster.icons.seed + '</span>' +
        '<div class="commit-main">' +
        '<div class="commit-msg">' + esc(c.message) + '</div>' +
        '<div class="commit-meta"><span class="repo">' + esc(p.repo.name || 'repo') + '</span><span>·</span><span>' + esc(c.ago) + '</span>' +
        (c.files ? '<span>·</span><span>' + c.files + ' 个文件</span>' : '') +
        '</div></div>' + diff + '</li>';
    }).join('');
  }

  function renderBugs(p) {    var bugs = p.bugs || [];
    els.bugCount.textContent = bugs.length;
    if (!bugs.length) {
      els.bugList.innerHTML = '<li class="bug-empty">腮帮子是空的。今天它没找到什么可疑的东西。</li>';
      return;
    }
    els.bugList.innerHTML = bugs.map(function (b) {
      return '<li class="bug-item">' +
        '<div class="bug-top"><span class="bug-sev ' + b.severity + '">' + (SEV_LABEL[b.severity] || '小零食') + '</span>' +
        '<span class="bug-loc">' + esc(b.file || '—') + '</span></div>' +
        '<div class="bug-title">' + esc(b.title) + '</div>' +
        '<div class="bug-note">' + esc(b.note || '') + '</div></li>';
    }).join('');
  }

  function renderWeek(p) {
    if (!els.weekDays) return;
    var now = new Date();
    var cells = [];
    for (var i = 6; i >= 0; i--) {
      var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var count = (p.commits || []).filter(function (c) {
        var d = new Date(c.date);
        return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
      }).length;
      cells.push('<span class="week-day' + (count ? ' on' : '') + '" title="' + count + ' 次提交">' +
        '日一二三四五六'[day.getDay()] + '</span>');
    }
    els.weekDays.innerHTML = cells.join('');
  }

  function statusClass(p) { return p.status.cls ? 'status-chip ' + p.status.cls : 'status-chip'; }

  function renderProfile(p) {
    S.profile = p;
    S.baseState = p.state;
    S.shareVariant = 0;

    els.landingPanel.hidden = true;
    els.reportPanel.hidden = false;
    els.dashboard.hidden = false;

    els.petName.textContent = p.hamsterName;
    els.petMeta.textContent = p.persona.title + ' · ' + p.age.badge;

    els.reportName.innerHTML = esc(p.hamsterName) + '<span class="age">' + esc(p.age.badge) + '</span>';
    els.reportRepo.textContent = (p.repo.full_name || ('github.com/' + p.user.login)) + ' · ' + (p.repo.language || '代码');
    els.stateChip.className = statusClass(p);
    els.stateChip.textContent = p.status.text;

    setSceneState(p.state);
    els.hamsterHost.classList.remove('landed');
    void els.hamsterHost.offsetWidth;
    els.hamsterHost.classList.add('landed');

    renderStats(p);
    renderCommits(p);
    renderBugs(p);
    renderWeek(p);
    updateContrib(p.stats.commits7d);

    typeText(els.bubbleText, p.lines.bubble, 22);
    typeText(els.speechText, p.lines.monologue, 20);

    els.stageHint.textContent = p.state === 'runaway'
      ? '它走了。窝里只剩一颗瓜子。'
      : '它已经吃了 ' + fmt(p.stats.commits30d * 3) + ' 颗瓜子';

    renderShareCard(p).catch(function () {});

    if (location.hash === '#dashboard') {
      els.dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if ((new URLSearchParams(location.search)).get('autofeed') === '1') {
      setTimeout(function () { feed('button'); }, 1400);
    }
  }

  function reset() {
    S.profile = null;
    S.baseState = 'happy';
    els.landingPanel.hidden = false;
    els.reportPanel.hidden = true;
    els.dashboard.hidden = true;
    els.petName.textContent = '等待领养';
    els.petMeta.textContent = '输入用户名，它就住进你的仓库';
    els.stageHint.textContent = '它的口粮，是你的提交记录';
    els.hamsterHost.classList.remove('landed', 'eating');
    setSceneState('happy');
    updateContrib(null);
    typeText(els.bubbleText, '你好呀，你终于来了。我有点饿，先给我一个 GitHub 用户名吧。', 20);
    els.login.value = '';
    els.login.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 领养 ---------- */
  function loadDemo(key) {
    var p = Engine.demo(key);
    setLoading(true, '正在打开档案…');
    sleep(520).then(function () {
      setLoading(false);
      renderProfile(p);
      toast('领养成功：' + p.hamsterName + ' 已住进你的仓库 🐹');
    });
  }

  function adopt(login, opts) {
    opts = opts || {};
    login = String(login || '').trim().replace(/^@/, '');
    if (!login) {
      els.loginField.classList.add('shake');
      setTimeout(function () { els.loginField.classList.remove('shake'); }, 500);
      toast('先给我一个 GitHub 用户名吧');
      return;
    }
    setLoading(true, '正在翻 ' + login + ' 的仓库…');
    var started = Date.now();

    fromGitHub(login).then(function (p) {
      return finish(p, false, started, opts);
    }).catch(function () {
      var p = Engine.local(login);
      return finish(p, true, started, opts);
    });
  }

  function finish(p, fallback, started, opts) {
    var wait = Math.max(0, (opts.fast ? 300 : 950) - (Date.now() - started));
    return sleep(wait).then(function () {
      setLoading(false);
      renderProfile(p);
      if (fallback) {
        toast('GitHub 在摸鱼，先给你一只模拟仓鼠 🐹');
      } else {
        toast('领养成功：' + p.hamsterName + ' 已住进你的仓库 🐹');
      }
    });
  }

  /* ---------- 投喂 ---------- */
  function feed(source) {
    var p = S.profile;
    if (!p) { toast('先领养一只仓鼠，再投喂呀'); return; }

    if (S.eatTimer) clearTimeout(S.eatTimer);
    S.baseState = p.state;
    setSceneState('eating');
    els.hamsterHost.classList.add('eating');
    dropSeeds(10);

    var s = p.stats;
    s.hunger = Math.max(8, s.hunger - 18);
    s.weight = Math.min(99, s.weight + 1);
    s.mood = Math.min(98, s.mood + 6);
    s.bond = Math.min(99, s.bond + 2);
    p.stats = s;

    if (p.state === 'runaway') {
      p.state = 'emo';
      p.status = { text: '被瓜子哄回来了一点', cls: 'emo' };
    } else if (s.hunger < 70 && s.mood >= 30) {
      p.state = 'happy';
      p.status = { text: '心情不错', cls: '' };
    } else if (s.hunger >= 70) {
      p.state = 'hungry';
      p.status = { text: '肚子饿了', cls: 'warn' };
    } else {
      p.state = 'emo';
      p.status = { text: 'emo 中', cls: 'emo' };
    }

    renderStats(p);
    els.stateChip.className = statusClass(p);
    els.stateChip.textContent = p.status.text;
    typeText(els.bubbleText, source === 'hook' ? '！Hook 又送饭来了，开动！' : '咔嚓咔嚓——别说话，我在吃饭。', 18);
    toast(source === 'hook' ? '来自 Kiro Hook 的投喂 +1 🌰' : Engine.feedLine(p));
    renderShareCard(p).catch(function () {});

    S.eatTimer = setTimeout(function () {
      setSceneState(p.state);
      els.hamsterHost.classList.remove('eating');
      typeText(els.speechText, p.lines.monologue, 18);
      renderShareCard(p).catch(function () {});
    }, 2600);
  }

  /* ---------- 周报 ---------- */
  function openWeekly() {
    var p = S.profile;
    if (!p) { toast('先领养一只仓鼠'); return; }
    els.modalTitle.textContent = '仓鼠周报 · ' + p.hamsterName;
    els.modalBody.textContent = Engine.weeklyReport(p);
    els.modal.hidden = false;
  }

  function copyReport() {
    var text = els.modalBody.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('周报已复制，去发群里吧'); });
    } else {
      toast('长按 / 选中文本复制即可');
    }
  }

  /* ---------- 分享卡 ---------- */
  function svgDataURI(state) {
    var svg = Hamster.svg(state).replace('<svg ', '<svg width="280" height="280" ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var line = '', lines = [];
    for (var i = 0; i < text.length; i++) {
      var test = line + text[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line); line = text[i];
        if (maxLines && lines.length >= maxLines - 1) { line = test; break; }
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) lines = lines.slice(0, maxLines);
    lines.forEach(function (l, idx) { ctx.fillText(l, x, y + idx * lineHeight); });
    return lines.length;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function renderShareCard(p) {
    p = p || S.profile;
    if (!p) return Promise.resolve();
    var cv = els.shareCanvas;
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;

    var quotes = [
      p.lines.shareQuote,
      '它靠你的 commit 吃饭。你卷，它就胖。',
      p.lines.monologue
    ];
    var quote = quotes[S.shareVariant % quotes.length];
    var data = Engine.shareData(p);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#FFF8EC';
    ctx.fillRect(0, 0, W, H);

    /* 背景点阵 */
    ctx.fillStyle = 'rgba(138,90,59,.16)';
    for (var y = 60; y < H; y += 34) {
      for (var x = 60; x < W; x += 34) {
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(255,210,122,.35)';
    ctx.beginPath(); ctx.arc(900, 120, 150, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(124,92,255,.10)';
    ctx.beginPath(); ctx.arc(140, 1150, 190, 0, Math.PI * 2); ctx.fill();

    /* 外框 */
    ctx.strokeStyle = '#EAD8BE';
    ctx.lineWidth = 3;
    roundRect(ctx, 40, 40, W - 80, H - 80, 44);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(138,90,59,.18)';
    ctx.lineWidth = 1;
    roundRect(ctx, 52, 52, W - 104, H - 104, 36);
    ctx.stroke();

    /* 顶部胶带 */
    ctx.save();
    ctx.translate(W / 2, 44);
    ctx.rotate(-.03);
    ctx.fillStyle = 'rgba(243,181,74,.55)';
    ctx.fillRect(-90, -13, 180, 28);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#7C5CFF';
    ctx.font = '800 22px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText('R E P O   H A M S T E R   C H E C K U P', W / 2, 128);

    ctx.fillStyle = '#2E2117';
    ctx.font = '900 62px "Microsoft YaHei", "PingFang SC", sans-serif';
    ctx.fillText('仓鼠体检报告', W / 2, 210);

    var img = new Image();
    Promise.resolve()
      .then(function () { return loadImage(svgDataURI(p.state === 'runaway' ? 'emo' : p.state)); })
      .then(function (image) {
        var size = 400;
        ctx.save();
        ctx.shadowColor = 'rgba(138,90,59,.18)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 16;
        ctx.drawImage(image, W / 2 - size / 2, 250, size, size);
        ctx.restore();

        /* 名字 */
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2E2117';
        ctx.font = '900 46px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillText(data.name, W / 2, 728);
        ctx.fillStyle = '#9A8672';
        ctx.font = '700 22px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillText(data.persona + ' · ' + data.age + ' · ' + data.repo, W / 2, 768);

        /* 状态点 */
        var stateText = { happy: '心情不错', hungry: '肚子饿了', emo: 'emo 中', runaway: '离家出走了' }[p.state] || '心情不错';
        ctx.fillStyle = '#FFF1D8';
        roundRect(ctx, W / 2 - 88, 792, 176, 40, 20);
        ctx.fill();
        ctx.strokeStyle = '#EAD8BE'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#8A5A3B';
        ctx.font = '800 20px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillText('●  ' + stateText, W / 2, 819);

        /* 四项状态 2x2 */
        var cards = [
          { x: 96, y: 860 }, { x: 552, y: 860 },
          { x: 96, y: 990 }, { x: 552, y: 990 }
        ];
        data.stats.forEach(function (s, i) {
          var c = cards[i];
          ctx.fillStyle = '#FFFDF7';
          roundRect(ctx, c.x, c.y, 432, 108, 24);
          ctx.fill();
          ctx.strokeStyle = '#F2E6D2'; ctx.lineWidth = 2; ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#6B5745';
          ctx.font = '800 22px "Microsoft YaHei", "PingFang SC", sans-serif';
          ctx.fillText(s.name, c.x + 28, c.y + 40);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#2E2117';
          ctx.font = '900 34px "Microsoft YaHei", "PingFang SC", sans-serif';
          ctx.fillText(s.value + '%', c.x + 408, c.y + 44);

          ctx.fillStyle = '#F2E6D2';
          roundRect(ctx, c.x + 28, c.y + 62, 376, 14, 7);
          ctx.fill();
          ctx.fillStyle = s.color;
          roundRect(ctx, c.x + 28, c.y + 62, Math.max(22, 376 * s.value / 100), 14, 7);
          ctx.fill();
        });

        /* 战绩 */
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFF1D8';
        roundRect(ctx, 96, 1128, 420, 52, 26); ctx.fill();
        roundRect(ctx, 564, 1128, 420, 52, 26); ctx.fill();
        ctx.fillStyle = '#F3B54A';
        ctx.beginPath(); ctx.arc(126, 1154, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7C5CFF';
        ctx.beginPath(); ctx.arc(594, 1154, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8A5A3B';
        ctx.font = '800 21px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillText('已吃掉 ' + fmt(data.seeds) + ' 颗瓜子', 142, 1162);
        ctx.fillText('腮帮子里藏了 ' + data.bugs + ' 个 bug', 610, 1162);

        /* 引用 */
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2E2117';
        ctx.font = '800 30px "Microsoft YaHei", "PingFang SC", sans-serif';
        wrapText(ctx, '“' + quote + '”', W / 2, 1224, 860, 44, 1);
        ctx.fillStyle = '#9A8672';
        ctx.font = '700 18px "Microsoft YaHei", "PingFang SC", sans-serif';
        ctx.fillText('代码仓鼠 · 你写代码，它吃饭 ｜ Kiro 鬼点子计划 · 无用之用 · ' + new Date().toISOString().slice(0, 10), W / 2, 1272);
      });
    return Promise.resolve();
  }

  function downloadCard() {
    var cv = els.shareCanvas;
    var name = S.profile ? S.profile.hamsterName : '仓鼠';
    cv.toBlob(function (blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '仓鼠体检报告-' + name + '.png';
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      toast('体检报告已保存，去发朋友圈吧 📮');
    }, 'image/png');
  }

  /* ---------- Kiro Hook ---------- */
  function connectHook() {
    if (typeof EventSource === 'undefined') return;
    if ((new URLSearchParams(location.search)).get('nohook') === '1') return;
    var src = location.protocol === 'file:' ? 'http://localhost:8787/events' : '/events';

    var es;
    try { es = new EventSource(src); } catch (e) { return; }
    es.onopen = function () { setHook(true); };
    es.onmessage = function (e) {
      setHook(true);
      if (e.data === 'feed' || e.data.indexOf('feed') === 0) feed('hook');
    };
    es.onerror = function () { setHook(false); };
  }

  /* ---------- 绑定 ---------- */
  function bind() {
    els.adoptForm.addEventListener('submit', function (e) {
      e.preventDefault();
      adopt(els.login.value);
    });

    $$('.chip[data-demo]').forEach(function (b) {
      b.addEventListener('click', function () { loadDemo(b.getAttribute('data-demo')); });
    });

    els.feedBtn.addEventListener('click', function () { feed('button'); });
    els.weeklyBtn.addEventListener('click', openWeekly);
    els.resetBtn.addEventListener('click', reset);
    els.downloadBtn.addEventListener('click', downloadCard);
    els.refreshCardBtn.addEventListener('click', function () {
      S.shareVariant = (S.shareVariant + 1) % 3;
      renderShareCard(S.profile).catch(function () {});
    });
    els.modal.addEventListener('click', function (e) {
      if (e.target === els.modal || e.target === els.closeModal) els.modal.hidden = true;
    });
    els.copyReport.addEventListener('click', copyReport);
    els.closeModal.addEventListener('click', function () { els.modal.hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') els.modal.hidden = true;
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    els = {
      landingPanel: $('#landingPanel'),
      reportPanel: $('#reportPanel'),
      dashboard: $('#dashboard'),
      petName: $('#petName'),
      petMeta: $('#petMeta'),
      bubbleText: $('#bubbleText'),
      speechText: $('#speechText'),
      reportName: $('#reportName'),
      reportRepo: $('#reportRepo'),
      stateChip: $('#stateChip'),
      stageHint: $('#stageHint'),
      hamsterHost: $('#hamsterHost'),
      scene: $('#scene'),
      seedsFloat: $('#seedsFloat'),
      login: $('#login'),
      loginField: $('.field'),
      adoptForm: $('#adoptForm'),
      feedBtn: $('#feedBtn'),
      weeklyBtn: $('#weeklyBtn'),
      resetBtn: $('#resetBtn'),
      commitList: $('#commitList'),
      bugList: $('#bugList'),
      bugCount: $('#bugCount'),
      stats: $('#stats'),
      shareCanvas: $('#shareCanvas'),
      downloadBtn: $('#downloadBtn'),
      refreshCardBtn: $('#refreshCardBtn'),
      loading: $('#loading'),
      loadingText: $('#loadingText'),
      toast: $('#toast'),
      toastText: $('#toastText'),
      modal: $('#modal'),
      modalTitle: $('#modalTitle'),
      modalBody: $('#modalBody'),
      copyReport: $('#copyReport'),
      closeModal: $('#closeModal'),
      hookPill: $('#hookPill'),
      hookText: $('#hookText'),
      contribGrid: $('#contribGrid'),
      contribCount: $('#contribCount'),
      weekDays: $('#weekDays')
    };

    $('[data-logo]').innerHTML = Hamster.logo();
    $$('[data-icon]').forEach(function (el) {
      var key = el.getAttribute('data-icon');
      if (key === 'github') key = 'branch';
      el.innerHTML = Hamster.icons[key] || '';
    });

    renderHamster('happy');
    buildContrib();
    updateContrib(null);
    bind();
    connectHook();

    var params = new URLSearchParams(location.search);
    if (params.get('cardonly') === '1') document.body.classList.add('card-only');
    if (params.get('hook') === 'on') setHook(true);
    if (params.get('demo')) {
      loadDemo(params.get('demo'));
    } else if (params.get('user')) {
      adopt(params.get('user'), { fast: true });
    }
    if (params.get('noloading') === '1') {
      setTimeout(function () { setLoading(false); }, 30);
    }
    if (params.get('debug') === '1') {
      setTimeout(function () {
        var w = document.documentElement.clientWidth;
        var sw = document.documentElement.scrollWidth;
        var wide = Array.prototype.slice.call(document.querySelectorAll('body *')).filter(function (el) {
          var r = el.getBoundingClientRect();
          return r.right > w + 1 && el.offsetParent !== null;
        }).slice(0, 10).map(function (el) {
          return el.tagName + '.' + String(el.className || '').split(' ')[0] + '@' + Math.round(el.getBoundingClientRect().right);
        });
        document.title = 'DBG ' + w + '/' + sw + ' :: ' + wide.join(' | ');
      }, 2200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
