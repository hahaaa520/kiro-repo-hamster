/* ============================================================
   代码仓鼠 · 仓鼠本体与图标（纯手写 SVG）
   window.Hamster.svg(state) -> string
   state: happy | hungry | emo | eating
   ============================================================ */
(function () {
  'use strict';

  var STATE_DISPLAY = {
    happy:  { eyes: 'normal', mouth: 'normal' },
    hungry: { eyes: 'normal', mouth: 'normal' },
    emo:    { eyes: 'sad',    mouth: 'emo' },
    eating: { eyes: 'happy',  mouth: 'happy' }
  };

  function d(cond) { return cond ? 'block' : 'none'; }

  function hamsterSVG(state) {
    state = STATE_DISPLAY[state] ? state : 'happy';
    var s = STATE_DISPLAY[state];
    var isEmo = state === 'emo';
    var isHungry = state === 'hungry';
    var isEating = state === 'eating';

    return [
      '<svg class="hamster-svg" data-state="' + state + '" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="一只住在代码仓库里的仓鼠">',
      '<defs>',
      '<linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="#FFE0AC"/><stop offset=".52" stop-color="#F8CB7C"/><stop offset="1" stop-color="#EDB25F"/>',
      '</linearGradient>',
      '<linearGradient id="gBelly" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="#FFFAEE"/><stop offset="1" stop-color="#FFEFD2"/>',
      '</linearGradient>',
      '<linearGradient id="gPaw" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="#FBCD86"/><stop offset="1" stop-color="#EDB25F"/>',
      '</linearGradient>',
      '</defs>',

      '<g class="hm-all">',
      '<ellipse cx="140" cy="252" rx="86" ry="12" fill="#8A5A3B" opacity=".13"/>',

      /* 尾巴 */
      '<circle cx="221" cy="190" r="10.5" fill="#EFB66D" stroke="#DDA056" stroke-width="1.5"/>',

      /* 脚 */
      '<g>',
      '<ellipse cx="106" cy="242" rx="22" ry="12" fill="url(#gPaw)" stroke="#E0A75A" stroke-width="1.2"/>',
      '<ellipse cx="174" cy="242" rx="22" ry="12" fill="url(#gPaw)" stroke="#E0A75A" stroke-width="1.2"/>',
      '<path d="M98 237v8M106 236v9M114 237v8" stroke="#D89A4C" stroke-width="1.5" stroke-linecap="round" opacity=".5" fill="none"/>',
      '<path d="M166 237v8M174 236v9M182 237v8" stroke="#D89A4C" stroke-width="1.5" stroke-linecap="round" opacity=".5" fill="none"/>',
      '</g>',

      /* 耳朵（在头后面） */
      '<g transform="rotate(-17 94 86)">',
      '<ellipse cx="94" cy="86" rx="22" ry="20" fill="#EFB66D" stroke="#DFA254" stroke-width="1.5"/>',
      '<ellipse cx="95" cy="88" rx="12.5" ry="10.5" fill="#F8BFA8"/>',
      '</g>',
      '<g transform="rotate(17 186 86)">',
      '<ellipse cx="186" cy="86" rx="22" ry="20" fill="#EFB66D" stroke="#DFA254" stroke-width="1.5"/>',
      '<ellipse cx="185" cy="88" rx="12.5" ry="10.5" fill="#F8BFA8"/>',
      '</g>',

      /* 身体 */
      '<ellipse cx="140" cy="176" rx="79" ry="71" fill="url(#gBody)" stroke="#DFA254" stroke-width="1.5"/>',
      '<ellipse cx="140" cy="194" rx="50" ry="43" fill="url(#gBelly)" opacity=".96"/>',

      /* 头 */
      '<g class="hm-head">',
      '<path d="M125.5 70c-1.5-7 3.5-11 7-17 3 6.5 3.5 12.5.5 17Z" fill="#F3BE76" stroke="#DFA254" stroke-width="1.3" stroke-linejoin="round"/>',
      '<path d="M141 68c0-7 5.5-10 9.5-15 1 6.5-1 12-4.5 16Z" fill="#F3BE76" stroke="#DFA254" stroke-width="1.3" stroke-linejoin="round"/>',
      '<ellipse cx="140" cy="122" rx="68" ry="58" fill="url(#gBody)" stroke="#DFA254" stroke-width="1.5"/>',
      '<ellipse cx="140" cy="137" rx="46" ry="34" fill="#FFF4DA" opacity=".94"/>',

      /* 腮帮子 */
      '<g class="hm-cheek-pouch">',
      '<ellipse cx="94" cy="150" rx="29" ry="22" fill="#F3BE76" opacity=".92"/>',
      '<ellipse cx="186" cy="150" rx="29" ry="22" fill="#F3BE76" opacity=".92"/>',
      '<ellipse cx="94" cy="145" rx="16" ry="9.5" fill="#FFD79A" opacity=".9"/>',
      '<ellipse cx="186" cy="145" rx="16" ry="9.5" fill="#FFD79A" opacity=".9"/>',
      '</g>',
      '<ellipse cx="85" cy="161" rx="12" ry="7" fill="#FF9FB4" opacity=".45"/>',
      '<ellipse cx="195" cy="161" rx="12" ry="7" fill="#FF9FB4" opacity=".45"/>',

      /* 眼睛 · 正常 */
      '<g class="eyes-normal" opacity="' + (isEmo ? '.55' : '1') + '">',
      '<ellipse cx="113" cy="123" rx="8.6" ry="10.2" fill="#3B2A22"/>',
      '<circle cx="110.4" cy="119.3" r="3.1" fill="#FFFFFF"/>',
      '<circle cx="116.2" cy="127.2" r="1.5" fill="#FFFFFF" opacity=".7"/>',
      '<ellipse cx="167" cy="123" rx="8.6" ry="10.2" fill="#3B2A22"/>',
      '<circle cx="164.4" cy="119.3" r="3.1" fill="#FFFFFF"/>',
      '<circle cx="170.2" cy="127.2" r="1.5" fill="#FFFFFF" opacity=".7"/>',
      '</g>',

      /* 眼睛 · 笑（吃东西） */
      '<g class="eyes-happy" display="' + d(s.eyes === 'happy') + '">',
      '<path d="M104 124q9-12 18 0" stroke="#3B2A22" stroke-width="4.4" fill="none" stroke-linecap="round"/>',
      '<path d="M158 124q9-12 18 0" stroke="#3B2A22" stroke-width="4.4" fill="none" stroke-linecap="round"/>',
      '</g>',

      /* 眼睛 · 难过（微垂） */
      '<g class="eyes-sad" display="' + d(s.eyes === 'sad') + '">',
      '<path d="M104 121q9 6 18 0" stroke="#7A4A32" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>',
      '<path d="M158 121q9 6 18 0" stroke="#7A4A32" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>',
      '</g>',

      /* 鼻子 */
      '<path d="M133.6 138.5Q140 133 146.4 138.5Q140 146.5 133.6 138.5Z" fill="#D97A7A"/>',
      '<ellipse cx="137.8" cy="137.6" rx="2.1" ry="1.4" fill="#FFFFFF" opacity=".65"/>',

      /* 嘴巴 · 普通 */
      '<path class="hm-mouth" display="' + d(s.mouth === 'normal') + '" d="M129 148Q140 158 151 148" stroke="#7A4A32" stroke-width="3" fill="none" stroke-linecap="round"/>',
      '<g class="hm-teeth" display="' + d(s.mouth === 'normal') + '">',
      '<rect x="133.4" y="151" width="6" height="8.2" rx="2.8" fill="#FFFDF7" stroke="#E3D2BC" stroke-width=".8"/>',
      '<rect x="140.6" y="151" width="6" height="8.2" rx="2.8" fill="#FFFDF7" stroke="#E3D2BC" stroke-width=".8"/>',
      '</g>',

      /* 嘴巴 · emo */
      '<path class="hm-mouth-emo" display="' + d(s.mouth === 'emo') + '" d="M127.5 153q6.2-6 12.5 0t12.5 0" stroke="#7A4A32" stroke-width="2.9" fill="none" stroke-linecap="round"/>',

      /* 嘴巴 · 开心（吃东西） */
      '<g class="hm-mouth-happy" display="' + d(s.mouth === 'happy') + '">',
      '<path d="M131 149Q140 162 149 149Z" fill="#B4553F"/>',
      '<ellipse cx="140" cy="157.5" rx="4.4" ry="2.8" fill="#FF9C9C"/>',
      '</g>',

      /* 胡须 */
      '<g stroke="#C98F5A" stroke-width="1.8" stroke-linecap="round" opacity=".48" fill="none">',
      '<path d="M82 147L53 141"/><path d="M81 154L49 155"/><path d="M84 162L57 170"/>',
      '<path d="M198 147L227 141"/><path d="M199 154L231 155"/><path d="M196 162L223 170"/>',
      '</g>',

      /* 头顶高光 */
      '<ellipse cx="112" cy="93" rx="20" ry="10.5" fill="#FFFFFF" opacity=".22" transform="rotate(-18 112 93)"/>',
      '</g>',

      /* 前爪 */
      '<ellipse class="hm-paw-l" cx="107" cy="212" rx="18" ry="12.5" fill="url(#gPaw)" stroke="#E0A75A" stroke-width="1.2"/>',
      '<ellipse class="hm-paw-r" cx="173" cy="212" rx="18" ry="12.5" fill="url(#gPaw)" stroke="#E0A75A" stroke-width="1.2"/>',
      '<path d="M101 208v6M108 207v7M115 208v6" stroke="#D89A4C" stroke-width="1.4" stroke-linecap="round" opacity=".45" fill="none"/>',
      '<path d="M165 208v6M172 207v7M179 208v6" stroke="#D89A4C" stroke-width="1.4" stroke-linecap="round" opacity=".45" fill="none"/>',

      /* 瓜子（吃东西时出现） */
      '<g class="hm-seed" display="' + d(isEating) + '">',
      '<path d="M140 196C151 202 151 218 140 225C129 218 129 202 140 196Z" fill="#5C4633"/>',
      '<path d="M140 201C146 206 146 215 140 220C134 215 134 206 140 201Z" fill="#F7E9D2"/>',
      '</g>',

      /* 眼泪（emo） */
      '<g transform="translate(167 133)"><g class="hm-tear" display="' + d(isEmo) + '">',
      '<path d="M0 0C-5 7-5 14 0 16C5 14 5 7 0 0Z" fill="#9BD1FF" stroke="#7FB8F0" stroke-width="1"/>',
      '</g></g>',

      /* 汗珠（饿） */
      '<g transform="translate(88 80)"><g class="hm-sweat" display="' + d(isHungry) + '">',
      '<path d="M0 0C-4 6-4 11 0 13C4 11 4 6 0 0Z" fill="#A9D8FF" stroke="#86BFF0" stroke-width="1"/>',
      '</g></g>',
      '</g>',

      /* 乌云（emo，不跟着降饱和） */
      '<g transform="translate(198 44)"><g class="hm-cloud" display="' + d(isEmo) + '">',
      '<ellipse cx="0" cy="15" rx="30" ry="12" fill="#C9D4E8" opacity=".92"/>',
      '<circle cx="-12" cy="7" r="12" fill="#D9E2F2"/>',
      '<circle cx="6" cy="3" r="15" fill="#D9E2F2"/>',
      '<path d="M-18 33l-2 9M0 35l-2 9M18 33l-2 9" stroke="#9FB6E6" stroke-width="2.4" stroke-linecap="round" opacity=".85" fill="none"/>',
      '</g></g>',

      '</svg>'
    ].join('');
  }

  /* ---------- 小图标 ---------- */
  var icons = {
    branch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5.5" r="2.3"/><circle cx="6" cy="18.5" r="2.3"/><circle cx="18" cy="18.5" r="2.3"/><path d="M6 7.8v8.4M8.3 5.5H14a4 4 0 0 1 4 4v6.7"/></svg>',
    rice: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A5A3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0Z" fill="#FFE6B2"/><path d="M8.5 8.2c0-2 1.8-2 1.8-4M13.7 8.2c0-2 1.8-2 1.8-4"/></svg>',
    tooth: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A5A3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7.2 3.8c1.6-.9 2.6.4 4.8.4s3.2-1.3 4.8-.4c2.6 1.4 2.2 6.1-.7 9-1 1-1.2 2.7-1.6 4.7-.3 1.4-2 1.5-2.4.1-.5-1.8-.6-3.3-1.8-3.3s-1.3 1.5-1.8 3.3c-.4 1.4-2.1 1.3-2.4-.1-.4-2-.6-3.7-1.6-4.7-2.9-2.9-3.3-7.6-.7-9Z" fill="#FFF6E4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A5A3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="3" fill="#FFF6E4"/><path d="m4.5 7.5 7.5 5.5 7.5-5.5"/></svg>',
    mug: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A5A3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9h10v6.5A4.5 4.5 0 0 1 10.5 20h-1A4.5 4.5 0 0 1 5 15.5V9Z" fill="#FFF6E4"/><path d="M15 10.5h1.8a2.7 2.7 0 0 1 0 5.4H15"/><path d="M8 5.5c0-1.4 1.5-1.4 1.5-2.8M11.8 5.5c0-1.4 1.5-1.4 1.5-2.8"/></svg>',
    seed: '<svg viewBox="0 0 20 26" fill="none"><path d="M10 1C17 6 18 17 10 25C2 17 3 6 10 1Z" fill="#EBA83C"/><path d="M10 4.5C14.5 8 15 16 10 21.5C5 16 5.5 8 10 4.5Z" fill="#FFD98B" opacity=".75"/><path d="M10 8v10" stroke="#D9963A" stroke-width="1.2" stroke-linecap="round" opacity=".6"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.6c.5 4.7 2.7 6.9 7.4 7.4-4.7.5-6.9 2.7-7.4 7.4-.5-4.7-2.7-6.9-7.4-7.4 4.7-.5 6.9-2.7 7.4-7.4Z"/></svg>',
    githubLogo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .8a11.2 11.2 0 0 0-3.5 21.8c.6.1.8-.2.8-.5v-2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.1-1.2-5.1-5.5 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-3 0 0 1-.3 3.1 1.1a10.7 10.7 0 0 1 5.6 0c2.1-1.4 3.1-1.1 3.1-1.1.6 1.6.2 2.7.1 3 .7.8 1.1 1.8 1.1 3 0 4.3-2.6 5.2-5.1 5.5.4.3.7 1 .7 2v2.9c0 .3.2.6.8.5A11.2 11.2 0 0 0 12 .8Z"/></svg>'
  };

  /* ---------- 品牌 Logo：仓鼠头 ---------- */
  function logoMark() {
    return [
      '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
      '<circle cx="18" cy="19" r="9" fill="#EFB66D" stroke="#DDA056" stroke-width="1.4"/>',
      '<circle cx="46" cy="19" r="9" fill="#EFB66D" stroke="#DDA056" stroke-width="1.4"/>',
      '<circle cx="18.5" cy="20" r="4.6" fill="#F8BFA8"/>',
      '<circle cx="45.5" cy="20" r="4.6" fill="#F8BFA8"/>',
      '<ellipse cx="32" cy="37" rx="22" ry="20" fill="url(#logoBody)" stroke="#DFA254" stroke-width="1.4"/>',
      '<defs><linearGradient id="logoBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE0AC"/><stop offset="1" stop-color="#EDB25F"/></linearGradient></defs>',
      '<ellipse cx="32" cy="42" rx="13" ry="11" fill="#FFF4DA" opacity=".7"/>',
      '<circle cx="24" cy="35" r="3.4" fill="#3B2A22"/><circle cx="40" cy="35" r="3.4" fill="#3B2A22"/>',
      '<circle cx="22.9" cy="33.8" r="1.2" fill="#fff"/><circle cx="38.9" cy="33.8" r="1.2" fill="#fff"/>',
      '<ellipse cx="17" cy="42" rx="5" ry="3.2" fill="#FF9FB4" opacity=".5"/>',
      '<ellipse cx="47" cy="42" rx="5" ry="3.2" fill="#FF9FB4" opacity=".5"/>',
      '<path d="M29 41.5q3 2.6 6 0" stroke="#7A4A32" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
      '</svg>'
    ].join('');
  }

  window.Hamster = {
    svg: hamsterSVG,
    logo: logoMark,
    icons: icons,
    seedSVG: function () { return icons.seed.replace('<svg ', '<svg width="12" height="16" '); }
  };
})();
