/* ============================================================
   代码仓鼠 · 人格引擎
   - 数据 -> 状态 -> 文案（离线可用，不依赖任何模型 API）
   - 内置三只演示仓鼠，保证现场不翻车
   ============================================================ */
(function () {
  'use strict';

  var DAY = 86400000;
  var HOUR = 3600000;
  var HAMSTER_NAMES = ['瓜子', '麻团', '栗子', '花生', '豆豆', '芝麻', '年糕', '小仓', '汤圆', '饭团'];
  var GENERIC_RE = /^(fix|fix bug|update|upd|test|commit|wip|debug|modify|change|修改|更新|提交|修复|提交代码|代码更新|\.)$/i;

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function hash(str) {
    var h = 2166136261;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }
  function pick(arr, seed) { return arr[hash(String(seed)) % arr.length]; }
  function daysAgoISO(days) { return new Date(Date.now() - days * DAY).toISOString(); }

  function timeAgo(iso) {
    if (!iso) return '刚刚';
    var ms = Date.now() - new Date(iso).getTime();
    if (ms < 60000) return '刚刚';
    if (ms < HOUR) return Math.max(1, Math.round(ms / 60000)) + ' 分钟前';
    if (ms < DAY) return Math.round(ms / HOUR) + ' 小时前';
    var d = ms / DAY;
    if (d < 30) return Math.round(d) + ' 天前';
    if (d < 365) return Math.round(d / 30) + ' 个月前';
    return Math.round(d / 365) + ' 年前';
  }

  function ageText(createdAt) {
    if (!createdAt) return { badge: '? 岁', text: '从很久以前开始陪你' };
    var d = new Date(createdAt);
    var months = Math.max(1, Math.round((Date.now() - d.getTime()) / (30.4 * DAY)));
    var y = Math.floor(months / 12), m = months % 12;
    var badge = months < 12 ? months + ' 个月' : '陪你 ' + y + ' 年';
    var text = '从 ' + d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + ' 开始陪你 · ' +
      (y > 0 ? y + ' 年 ' : '') + (m > 0 ? m + ' 个月' : '');
    return { badge: badge, text: text };
  }

  function messageQuality(messages) {
    var generic = 0, total = 0;
    (messages || []).forEach(function (m) {
      var t = String(m || '').trim();
      if (!t) return;
      total++;
      if (GENERIC_RE.test(t) || t.length <= 6) generic++;
    });
    return {
      genericRatio: total ? generic / total : 0,
      avgLen: total ? (messages.join('').length / total) : 0,
      genericCount: generic
    };
  }

  /* ---------- 状态计算 ---------- */
  function computeStats(base) {
    var commits = base.commits || [];
    var now = Date.now();
    var last = commits.length ? new Date(commits[0].date).getTime() : now - 30 * DAY;
    var lastDays = Math.max(0, (now - last) / DAY);
    var c7 = commits.filter(function (c) { return now - new Date(c.date).getTime() < 7 * DAY; }).length;
    var c30 = commits.filter(function (c) { return now - new Date(c.date).getTime() < 30 * DAY; }).length;
    var q = messageQuality(commits.map(function (c) { return c.message; }));

    var weight = clamp(34 + c7 * 5 + c30 * 0.9, 26, 97);
    var hunger = clamp(18 + lastDays * 9 - c7 * 1.6, 8, 99);
    var mood = clamp(92 - lastDays * 6.2 + Math.min(c7, 10) * 1.4 - q.genericRatio * 26, 6, 98);
    var bond = clamp(30 + (base.repo && base.repo.stars ? base.repo.stars * 0.18 : 0) +
      (base.user && base.user.followers ? base.user.followers * 0.12 : 0) + c30 * 0.8, 14, 99);

    var state = 'happy';
    if (lastDays >= 14) state = 'runaway';
    else if (lastDays >= 7 || mood < 30) state = 'emo';
    else if (hunger >= 70) state = 'hungry';

    return {
      weight: Math.round(weight), mood: Math.round(mood), hunger: Math.round(hunger), bond: Math.round(bond),
      commits7d: c7, commits30d: c30, lastDays: lastDays, genericRatio: q.genericRatio,
      genericCount: q.genericCount, avgLen: Math.round(q.avgLen), state: state
    };
  }

  function personaFor(stats, base) {
    if (stats.state === 'runaway') return { title: '出走的仓鼠', emoji: '🐾' };
    if (stats.state === 'emo') return { title: 'emo 仓鼠', emoji: '🌧️' };
    if (stats.commits7d >= 8) return { title: '卷王仓鼠', emoji: '🐹' };
    if (stats.commits7d >= 4) return { title: '普通仓鼠', emoji: '🌰' };
    if (stats.commits7d >= 1) return { title: '摸鱼仓鼠', emoji: '🐟' };
    return { title: '摆烂仓鼠', emoji: '😴' };
  }

  function statusFor(state) {
    return {
      happy: { text: '心情不错', cls: '' },
      hungry: { text: '肚子饿了', cls: 'warn' },
      emo: { text: 'emo 中', cls: 'emo' },
      runaway: { text: '离家出走了', cls: 'gone' }
    }[state] || { text: '心情不错', cls: '' };
  }

  /* ---------- 文案 ---------- */
  function linesFor(p) {
    var s = p.stats, n = p.hamsterName, repo = p.repo.name;
    var lines = {
      happy: [
        '今天仓库很热闹，我吃了 ' + s.commits7d + ' 颗瓜子，腮帮子鼓鼓的。',
        '你最近很勤快嘛。作为奖励，我把 bug 都藏好了——大部分。',
        '我在 ' + repo + ' 里晒到了太阳。你代码写得好，瓜子就是甜的。',
        '刚才有人 star 了你的仓库，我替你在门口鞠了一躬。'
      ],
      hungry: [
        '肚子在叫。你上一次 commit，是什么时候来着……',
        '瓜子的味道，我已经快忘了。',
        '我不挑食的，随便来一个 commit 就好。'
      ],
      emo: [
        '你已经 ' + Math.floor(s.lastDays) + ' 天没 commit 了。我数到第 ' + Math.floor(s.lastDays) + ' 天，决定开始 emo。',
        '仓库好安静。安静到我能听见自己肚子叫。',
        '再这样下去，我就要收拾包袱，搬去隔壁仓库了。'
      ],
      runaway: [
        '……',
        '（窝是空的，桌上留了一颗瓜子。）',
        '（它走了。你上一次 commit 是 ' + Math.floor(s.lastDays) + ' 天前。）'
      ],
      eating: [
        '咔嚓。好吃！这条 commit 有坚果味。',
        '谢谢！我感觉腮帮子又大了一圈。',
        '嗝——饱了。下一顿，等你下次 push。'
      ]
    };
    var key = p.state === 'eating' ? 'eating' : (p.stats.state);
    return pick(lines[key] || lines.happy, p.user.login + p.stats.commits7d + Date.now());
  }

  function bubbleFor(p) {
    var s = p.stats;
    if (p.state === 'runaway') return '（这里已经 ' + Math.floor(s.lastDays) + ' 天没有声音了。）';
    if (p.state === 'eating') return '咔嚓咔嚓——别说话，我在吃饭。';
    if (s.state === 'emo') return '……你终于想起我了。';
    if (s.state === 'hungry') return '先给我一个 commit，再说话。';
    return '你回来啦！我在 ' + p.repo.name + ' 里给你留了位置。';
  }

  function reportFor(p) {
    var s = p.stats;
    var goal = {
      happy: '本周再写 ' + Math.max(3, Math.round(s.commits7d * 1.2)) + ' 个 commit，把它喂到更圆。',
      hungry: '先来一个 commit，救救它的肚子。',
      emo: '今晚 commit 一次，把它从乌云里捞出来。',
      runaway: '如果还想它，就去提交一次代码，它可能会回来。'
    }[s.state] || '多陪它写点代码。';
    var hotBug = (p.bugs || []).filter(function (b) { return b.severity === 'hot'; })[0] ||
      (p.bugs || [])[0] || { title: '暂时没有，它把 bug 都消化了。' };
    var arr = [
      '🐹 仓鼠周报 · ' + p.hamsterName,
      '——————————————',
      '本周提交：' + s.commits7d + ' 次',
      '最近一次：' + (p.commits[0] ? p.commits[0].ago : '很久以前'),
      '体重 ' + s.weight + ' / 心情 ' + s.mood + ' / 饥饿 ' + s.hunger + ' / 亲密度 ' + s.bond,
      '它在腮帮子里藏了 ' + (p.bugs || []).length + ' 个 bug，最辣嗓子的一条：',
      '「' + hotBug.title + '」',
      '',
      '下周目标：' + goal,
      '—— 来自你的仓库仓鼠'
    ];
    return arr.join('\n');
  }

  function shareQuote(p) {
    var s = p.stats;
    if (s.state === 'runaway') return '它走了。你上一次 commit，是 ' + Math.floor(s.lastDays) + ' 天前。';
    if (s.state === 'emo') return '仓库太安静了。安静到它能听见自己肚子叫。';
    if (s.state === 'hungry') return '瓜子的味道，它已经快忘了。';
    if (s.commits7d >= 10) return '你卷，它就胖。这周它吃了 ' + s.commits7d + ' 颗瓜子。';
    return '你写代码，它吃饭。今天也别忘了 commit。';
  }

  function feedLine(p) {
    return pick([
      '咔嚓！+1 颗瓜子，饥饿 -18，体重 +1。',
      '它把瓜子塞进腮帮子，心满意足地打了个嗝。',
      '收到投喂！亲密度 +2，心情 +6。',
      '它嚼得很大声，像是在给你鼓掌。'
    ], Date.now());
  }

  /* ---------- 拼装 profile ---------- */
  function buildProfile(base) {
    var stats = computeStats(base);
    var persona = personaFor(stats, base);
    var age = ageText(base.user && base.user.created_at);
    var hamsterName = base.hamsterName || pick(HAMSTER_NAMES, (base.user && base.user.login) || 'hamster');
    var p = {
      source: base.source || 'demo',
      user: base.user || {},
      repo: base.repo || {},
      commits: (base.commits || []).slice(0, 12).map(function (c) {
        return {
          sha: c.sha || 'demo', short: String(c.sha || 'demo').slice(0, 7),
          message: c.message || 'update', date: c.date, ago: timeAgo(c.date),
          add: c.add || 0, del: c.del || 0, files: c.files || 0, url: c.url || '#'
        };
      }),
      bugs: base.bugs || [],
      stats: stats,
      state: stats.state,
      persona: persona,
      title: persona.title,
      status: statusFor(stats.state),
      hamsterName: hamsterName,
      age: age
    };
    p.lines = {
      monologue: linesFor(p),
      bubble: bubbleFor(p),
      report: reportFor(p),
      shareQuote: shareQuote(p)
    };
    return p;
  }

  /* ---------- 演示仓鼠 ---------- */
  var DEMO_BASE = {
    champion: {
      source: 'demo',
      hamsterName: '阿仓',
      user: { login: 'seedlord', name: '阿仓', created_at: '2021-03-14T08:00:00Z', followers: 328, public_repos: 47, url: 'https://github.com' },
      repo: { name: 'seed-garden', full_name: 'seedlord/seed-garden', stars: 128, language: 'TypeScript', url: '#' },
      commits: [
        { d: 0.03, message: 'feat(seed): 给仓鼠加了一个会数瓜子的计数器', add: 128, del: 12, files: 6 },
        { d: 0.9, message: 'fix: 修复腮帮子内存泄漏，现在最多藏 3 个 bug', add: 34, del: 8, files: 3 },
        { d: 1.8, message: 'docs: 补充仓鼠睡眠时间说明', add: 46, del: 2, files: 2 },
        { d: 2.7, message: 'refactor: 把叹气逻辑抽成可复用的 hook', add: 87, del: 64, files: 5 },
        { d: 3.5, message: 'test: 给投喂接口补了 12 个用例', add: 190, del: 3, files: 4 },
        { d: 4.2, message: 'feat: 仓鼠 emo 时头顶会出现乌云', add: 73, del: 9, files: 4 },
        { d: 5.1, message: 'chore: 升级 Kiro 到最新版', add: 4, del: 4, files: 2 },
        { d: 6.3, message: 'fix: 修复周日不吃饭的问题', add: 22, del: 11, files: 2 },
        { d: 9.4, message: 'feat: 瓜子计数器支持连击', add: 96, del: 7, files: 3 },
        { d: 12.6, message: 'refactor: 把仓库监听换成事件驱动', add: 210, del: 180, files: 9 }
      ],
      bugs: [
        { severity: 'medium', title: 'JSON.parse 没有包 try / catch，仓鼠被崩了一下牙', file: 'src/feed/parse.ts:42', note: '建议加个兜底，不然它会吐出来。' },
        { severity: 'mild', title: '新增了一颗 console.log("seed!")', file: 'src/index.ts:88', note: '仓鼠把它当瓜子壳一起吞了。' },
        { severity: 'mild', title: 'any 出现了 3 次', file: 'src/types.ts:12', note: '腮帮子里有点塞牙。' }
      ]
    },
    lazy: {
      source: 'demo',
      hamsterName: '小睡',
      user: { login: 'sleepy-dev', name: '小睡', created_at: '2019-01-09T08:00:00Z', followers: 12, public_repos: 6, url: 'https://github.com' },
      repo: { name: 'winter-is-coming', full_name: 'sleepy-dev/winter-is-coming', stars: 3, language: 'JavaScript', url: '#' },
      commits: [
        { d: 9.5, message: 'update', add: 2, del: 2, files: 1 },
        { d: 12.8, message: 'fix', add: 1, del: 1, files: 1 },
        { d: 16.2, message: 'update README', add: 2, del: 0, files: 1 },
        { d: 21.7, message: 'test', add: 5, del: 1, files: 1 },
        { d: 28.4, message: 'fix bug', add: 3, del: 3, files: 2 },
        { d: 35.1, message: 'update', add: 1, del: 1, files: 1 }
      ],
      bugs: [
        { severity: 'medium', title: '一个空的 catch 块，仓鼠连叹气都没听见', file: 'src/index.js:17', note: '它把这里的异常也一起咽下去了。' },
        { severity: 'medium', title: '6 条 commit message 里有 4 条叫 update', file: '—', note: '仓鼠分不清哪颗瓜子是哪颗。' },
        { severity: 'mild', title: 'README 比代码还新', file: 'README.md', note: '它怀疑你在写小说。' }
      ]
    },
    normal: {
      source: 'demo',
      hamsterName: '瓜子',
      user: { login: 'guazi-dev', name: '瓜子', created_at: '2022-11-02T08:00:00Z', followers: 30, public_repos: 11, url: 'https://github.com' },
      repo: { name: 'daily-notes', full_name: 'guazi-dev/daily-notes', stars: 12, language: 'Python', url: '#' },
      commits: [
        { d: 1.4, message: 'feat: 增加每日打卡提醒', add: 56, del: 4, files: 3 },
        { d: 2.3, message: 'fix: 修复时区错乱导致的打卡失败', add: 18, del: 7, files: 2 },
        { d: 3.6, message: 'style: 调整按钮圆角', add: 6, del: 6, files: 1 },
        { d: 4.9, message: 'update', add: 3, del: 2, files: 1 },
        { d: 6.1, message: 'docs: 补充部署说明', add: 24, del: 1, files: 1 },
        { d: 8.2, message: 'feat: 支持导出周报', add: 88, del: 12, files: 4 },
        { d: 11.5, message: 'test: 补了两个提醒相关用例', add: 40, del: 2, files: 2 }
      ],
      bugs: [
        { severity: 'mild', title: '新增了一个 console.log，忘了删', file: 'app/main.py:31', note: '仓鼠把它当夜宵吃了。' },
        { severity: 'medium', title: '这次改了 4 个文件，没带一个测试', file: 'app/', note: '它有点噎得慌。' }
      ]
    }
  };

  function demoProfile(key) {
    var base = DEMO_BASE[key] || DEMO_BASE.champion;
    var copy = JSON.parse(JSON.stringify(base));
    copy.commits = copy.commits.map(function (c, i) {
      return {
        sha: 'demo' + key + i,
        message: c.message,
        date: daysAgoISO(c.d),
        add: c.add, del: c.del, files: c.files, url: '#'
      };
    });
    return buildProfile(copy);
  }

  /* ---------- 本地兜底（没网也能玩） ---------- */
  function localProfile(login) {
    login = String(login || 'hamster').replace(/[^a-zA-Z0-9-_]/g, '') || 'hamster';
    var h = hash(login);
    var c7 = h % 12;
    var commits = [];
    var msgs = ['feat: 给仓鼠加了一个小功能', 'fix: 修了一个只有周五才出现的 bug', 'docs: 更新 README',
      'refactor: 清理三年前的祖传代码', 'test: 补了两个用例', 'update', 'fix', 'chore: 升级依赖'];
    for (var i = 0; i < Math.max(3, c7); i++) {
      commits.push({
        sha: 'local' + i, message: msgs[(h + i) % msgs.length],
        date: daysAgoISO(i === 0 ? (h % 5) * 0.4 : i * 1.3 + (h % 7) * 0.2),
        add: (h + i * 37) % 200, del: (h + i * 13) % 40, files: 1 + ((h + i) % 5), url: '#'
      });
    }
    return buildProfile({
      source: 'local',
      user: { login: login, name: login, created_at: '2020-06-01T00:00:00Z', followers: 18 + h % 120, public_repos: 5 + h % 30, url: 'https://github.com/' + login },
      repo: { name: 'open-source-garden', full_name: login + '/open-source-garden', stars: 3 + h % 90, language: 'TypeScript', url: '#' },
      commits: commits,
      bugs: [
        { severity: 'medium', title: '有一条 commit message 只写了 "update"', file: '—', note: '仓鼠嚼了半天，没尝出味道。' },
        { severity: 'mild', title: '代码里出现了 console.log 当夜宵', file: 'src/main.ts:24', note: '它已经吃习惯了。' }
      ]
    });
  }

  /* ---------- 真实 GitHub 数据 ---------- */
  function githubProfile(user, repo, commits, bugs) {
    return buildProfile({
      source: 'github',
      user: { login: user.login, name: user.name || user.login, created_at: user.created_at, followers: user.followers, public_repos: user.public_repos, url: user.html_url, avatar: user.avatar_url },
      repo: { name: repo.name, full_name: repo.full_name, stars: repo.stargazers_count, language: repo.language, url: repo.html_url, pushed_at: repo.pushed_at },
      commits: commits,
      bugs: bugs && bugs.length ? bugs : null
    });
  }

  /* ---------- 分享卡数据 ---------- */
  function shareData(p) {
    var s = p.stats;
    return {
      title: '仓鼠体检报告',
      subtitle: 'REPO HAMSTER CHECKUP',
      name: p.hamsterName,
      persona: p.persona.title,
      age: p.age.badge,
      repo: p.repo.full_name || ('github.com/' + p.user.login),
      stats: [
        { name: '体重', value: s.weight, color: '#F3B54A' },
        { name: '心情', value: s.mood, color: '#7C5CFF' },
        { name: '饥饿', value: s.hunger, color: '#F58BA0' },
        { name: '亲密度', value: s.bond, color: '#6FC58A' }
      ],
      seeds: s.commits30d * 3 + Math.max(0, 30 - Math.round(s.lastDays)),
      bugs: (p.bugs || []).length,
      quote: p.lines.shareQuote,
      state: p.state,
      date: new Date().toISOString()
    };
  }

  window.Engine = {
    demo: demoProfile,
    local: localProfile,
    fromGitHub: githubProfile,
    weeklyReport: function (p) { return p.lines.report; },
    feedLine: feedLine,
    shareData: shareData,
    timeAgo: timeAgo,
    clamp: clamp,
    hash: hash,
    DEMO_KEYS: ['champion', 'lazy', 'normal']
  };
})();
