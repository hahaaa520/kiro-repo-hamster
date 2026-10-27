# -*- coding: utf-8 -*-
"""生成《代码仓鼠-Demo成果说明.pdf》：截图 + 字幕说明 + 运行方式"""
import os
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(BASE, "shots")
OUT_PDF = os.path.join(BASE, "..", "deliver", "代码仓鼠-Demo成果说明.pdf")
OUT_DIR = os.path.join(BASE, "..", "deliver")

W, H = 1920, 1080
CREAM = (255, 248, 236)
CREAM2 = (255, 241, 216)
INK = (46, 33, 23)
INK2 = (107, 87, 69)
MUTED = (154, 134, 114)
BROWN = (138, 90, 59)
GOLD = (243, 181, 74)
PURPLE = (124, 92, 255)
PURPLE_D = (91, 59, 224)
LINE = (234, 216, 190)
PINK = (255, 183, 197)
GREEN = (111, 197, 138)

FONT_DIR = os.path.join(os.environ.get("WINDIR", r"C:\Windows"), "Fonts")
def font(name, size, bold=False):
    for f in ([ "msyhbd.ttc" ] if bold else []) + [name, "msyh.ttc", "simhei.ttf", "simsun.ttc"]:
        p = os.path.join(FONT_DIR, f)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

F_TITLE = font("msyhbd.ttc", 62, bold=True)
F_H2 = font("msyhbd.ttc", 44, bold=True)
F_KICK = font("msyhbd.ttc", 20, bold=True)
F_BODY = font("msyh.ttc", 26)
F_SMALL = font("msyh.ttc", 19)
F_TINY = font("msyhbd.ttc", 15, bold=True)
F_NUM = font("msyhbd.ttc", 22, bold=True)
F_BIG = font("msyhbd.ttc", 118, bold=True)
F_BANNER = font("msyhbd.ttc", 34, bold=True)
F_CARD_T = font("msyhbd.ttc", 30, bold=True)
F_CARD_B = font("msyh.ttc", 20)


def new_page(bg=CREAM):
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img, "RGBA")
    # 点阵
    for y in range(24, H, 38):
        for x in range(24, W, 38):
            d.ellipse((x, y, x + 2, y + 2), fill=(138, 90, 59, 26))
    # 角落色块
    d.ellipse((-260, -320, 520, 460), fill=(255, 227, 172, 120))
    d.ellipse((W - 340, H - 340, W + 260, H + 260), fill=(230, 222, 255, 110))
    return img


def chrome(img, d, idx, total):
    d.text((90, 52), "代码仓鼠 · Demo 成果说明", font=F_KICK, fill=INK2)
    d.text((W - 90, 52), f"{idx:02d} / {total:02d}", font=F_KICK, fill=MUTED, anchor="ra")
    d.line((90, H - 74, W - 90, H - 74), fill=LINE, width=2)
    d.text((90, H - 56), "Kiro 鬼点子计划 · 无用之用", font=F_TINY, fill=MUTED)
    d.text((W - 90, H - 56), "你写代码，它吃饭。", font=F_TINY, fill=MUTED, anchor="ra")


def kicker(d, x, y, text):
    d.line((x, y + 12, x + 34, y + 12), fill=PURPLE, width=4)
    d.text((x + 48, y), text, font=F_KICK, fill=PURPLE_D)


def bullet(d, x, y, text, color=PURPLE_D):
    d.ellipse((x, y + 9, x + 10, y + 19), fill=color)
    d.text((x + 26, y), text, font=F_BODY, fill=INK2)


def wrap_lines(d, text, f, maxw):
    lines, cur = [], ""
    for ch in text:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        t = cur + ch
        if d.textlength(t, font=f) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = ch
    if cur:
        lines.append(cur)
    return lines


def para(d, x, y, text, f, fill, maxw, lh=None):
    lh = lh or int(f.size * 1.75)
    for i, line in enumerate(wrap_lines(d, text, f, maxw)):
        d.text((x, y + i * lh), line, font=f, fill=fill)
    return y + len(wrap_lines(d, text, f, maxw)) * lh


def pill(d, x, y, text, f=F_SMALL, bg=(255, 255, 255, 220), fg=INK2, border=LINE):
    tw = d.textlength(text, font=f)
    w = int(tw + 44); h = 52
    d.rounded_rectangle((x, y, x + w, y + h), radius=26, fill=bg, outline=border, width=2)
    d.text((x + 22, y + 12), text, font=f, fill=fg)
    return x + w + 12


def rounded_image(page, path, x, y, w, h, radius=26, border=True):
    im = Image.open(path).convert("RGB")
    sw, sh = im.size
    target = w / h
    if sw / sh > target:
        nw = int(sh * target); left = (sw - nw) // 2
        im = im.crop((left, 0, left + nw, sh))
    else:
        nh = int(sw / target); top = 0
        im = im.crop((0, top, sw, top + nh))
    im = im.resize((w, h), Image.LANCZOS)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    page.paste(im, (x, y), mask)
    if border:
        d = ImageDraw.Draw(page, "RGBA")
        d.rounded_rectangle((x, y, x + w, y + h), radius=radius, outline=(234, 216, 190, 255), width=2)


def circle_number(page, d, x, y, n, r=26, fill=GOLD):
    d.ellipse((x, y, x + 2 * r, y + 2 * r), fill=fill)
    d.text((x + r, y + r - 2), str(n), font=F_NUM, fill=(122, 74, 18), anchor="mm")


def save_pages(pages):
    os.makedirs(OUT_DIR, exist_ok=True)
    first, rest = pages[0], pages[1:]
    first.save(OUT_PDF, "PDF", resolution=150.0, save_all=True, append_images=rest)
    print("saved", OUT_PDF, os.path.getsize(OUT_PDF), "bytes", len(pages), "pages")
    for i, p in enumerate(pages, 1):
        p.save(os.path.join(SHOTS, "demo-page-%02d.png" % i))


def page_cover(idx=1, total=10):
    img = new_page()
    d = ImageDraw.Draw(img, "RGBA")
    kicker(d, 120, 170, "KIRO 鬼点子计划 · 无用之用 / DEMO 成果说明")
    d.text((118, 236), "代码仓鼠", font=F_BIG, fill=INK)
    d.text((122, 372), "你写代码，它吃饭。", font=font("msyhbd.ttc", 52, bold=True), fill=INK)
    d.text((122, 452), "一个住在 GitHub 仓库里的电子宠物", font=F_BODY, fill=INK2)
    para(d, 122, 520, "输入用户名 3 秒领养；提交决定胖瘦与心情；7 天不写会 emo，14 天离家出走；它还会把 diff 里漏掉的 bug 藏进腮帮子，生成一张可分享的体检报告。", F_BODY, INK2, 780, 50)
    x = 122
    x = pill(d, x, 736, "3 秒领养")
    x = pill(d, x, 736, "commit = 瓜子")
    x = pill(d, x, 736, "7 天 emo / 14 天出走")
    d.text((122, 858), "Demo 成果说明 · 2026.10", font=F_KICK, fill=MUTED)
    rounded_image(img, os.path.join(SHOTS, "app-desktop-1600.png"), 960, 190, 840, 525, radius=30)
    d.text((960, 748), "产品首屏：输入 GitHub 用户名即可领养", font=F_SMALL, fill=MUTED)
    chrome(img, d, idx, total)
    return img


def page_features(idx, total):
    img = new_page()
    d = ImageDraw.Draw(img, "RGBA")
    chrome(img, d, idx, total)
    kicker(d, 90, 150, "01 / 核心功能一览")
    d.text((88, 196), "一页看完它能做什么", font=F_TITLE, fill=INK)
    items = [
        ("01", "3 秒领养", "输入 GitHub 用户名，只读公开仓库，不用登录；没有网络就切演示档案。"),
        ("02", "四个状态", "体重 / 心情 / 饥饿 / 亲密度，全部由提交频率、message 与 diff 算出。"),
        ("03", "投喂瓜子", "咀嚼动画 + 瓜子粒子；饥饿 −18、体重 +1、心情 +6、亲密度 +2。"),
        ("04", "emo 与出走", "7 天不提交会 emo（乌云/眼泪）；14 天空笼子 + 爪印 + 留言。"),
        ("05", "腮帮子 bug", "读最新 diff，输出最多 3 条轻量提示，按 hot/medium/mild 排序。"),
        ("06", "体检报告", "Canvas 生成 1080×1350 分享卡，含状态、瓜子数、问题数与一句吐槽。"),
    ]
    x0, y0, cw, ch, gap = 90, 330, 560, 236, 26
    for i, (no, t, b) in enumerate(items):
        c, r = i % 3, i // 3
        x, y = x0 + c * (cw + gap), y0 + r * (ch + gap)
        d.rounded_rectangle((x, y, x + cw, y + ch), radius=24, fill=(255, 253, 247, 245), outline=LINE, width=2)
        circle_number(img, d, x + 26, y + 24, no)
        d.text((x + 26, y + 84), t, font=F_CARD_T, fill=INK)
        para(d, x + 26, y + 132, b, F_CARD_B, INK2, cw - 52, 36)
    d.rounded_rectangle((90, 862, 1830, 952), radius=22, fill=(240, 235, 255, 255), outline=(217, 207, 255), width=2)
    d.text((120, 880), "Kiro Hook 已连接：保存代码 → 自动测试 → 投喂仓鼠", font=F_BANNER, fill=PURPLE_D)
    d.text((120, 926), "Kiro Hook 就是它的消化系统。", font=F_SMALL, fill=INK2)
    return img


def step_page(idx, total, kick, title, bullets, img_path, img_box, note, img_label=None):
    img = new_page()
    d = ImageDraw.Draw(img, "RGBA")
    chrome(img, d, idx, total)
    kicker(d, 90, 150, kick)
    d.text((88, 196), title, font=F_H2, fill=INK)
    y = 300
    for b in bullets:
        bullet(d, 92, y, b)
        y += 56
    if note:
        d.rounded_rectangle((90, y + 26, 800, y + 26 + 120), radius=20, fill=(255, 241, 216, 230), outline=(240, 216, 168), width=2)
        para(d, 116, y + 48, note, F_SMALL, INK2, 650, 32)
    x, y2, w, h = img_box
    rounded_image(img, img_path, x, y2, w, h, radius=28)
    if img_label:
        d.text((x, y2 + h + 18), img_label, font=F_SMALL, fill=MUTED)
    return img


def page_bugs(idx, total):
    img = new_page()
    d = ImageDraw.Draw(img, "RGBA")
    chrome(img, d, idx, total)
    kicker(d, 90, 150, "06 / 腮帮子与体检报告")
    d.text((88, 196), "它把漏掉的 bug 藏进腮帮子", font=F_H2, fill=INK)
    cards = [
        ("有点噎人", "src/feed/parse.ts:42", "JSON.parse 没包 try / catch，仓鼠被崩了一下牙", (255, 241, 216), (138, 90, 31)),
        ("小零食", "src/index.ts:88", "新增了一颗 console.log(\"seed!\")", (231, 247, 236), (63, 124, 82)),
        ("小零食", "src/types.ts:12", "any 出现了 3 次", (231, 247, 236), (63, 124, 82)),
    ]
    y = 300
    for sev, loc, title, bg, fg in cards:
        d.rounded_rectangle((90, y, 1010, y + 142), radius=20, fill=(255, 253, 247, 245), outline=LINE, width=2)
        d.rounded_rectangle((112, y + 20, 112 + 108, y + 54), radius=17, fill=bg)
        d.text((166, y + 37), sev, font=F_TINY, fill=fg, anchor="mm")
        d.text((234, y + 26), loc, font=F_SMALL, fill=MUTED)
        d.text((112, y + 70), title, font=F_CARD_T, fill=INK)
        y += 162
    d.text((90, 808), "轻量提示，不是正式 code review —— 但它会让你想点开看一眼。", font=F_SMALL, fill=MUTED)
    rounded_image(img, os.path.join(SHOTS, "card-pure.png"), 1130, 220, 460, 575, radius=24)
    d.text((1130, 812), "1080×1350 体检报告，可保存/分享", font=F_SMALL, fill=MUTED)
    d.text((1130, 846), "（截图来自真实 Demo 输出）", font=F_SMALL, fill=MUTED)
    return img


def page_kiro(idx, total):
    img = new_page()
    im = Image.open(os.path.join(SHOTS, "slide-06.png")).convert("RGB").resize((W, H), Image.LANCZOS)
    img.paste(im, (0, 0))
    return img


def page_run(idx, total):
    img = new_page()
    d = ImageDraw.Draw(img, "RGBA")
    chrome(img, d, idx, total)
    kicker(d, 90, 150, "08 / 运行方式与评审兜底")
    d.text((88, 196), "怎么运行 / 评审怎么看", font=F_H2, fill=INK)
    d.text((92, 300), "本地启动（评审现场）", font=F_CARD_T, fill=INK)
    lines = [
        "1. 解压 代码仓鼠-现场参赛包.zip",
        "2. 双击 01-产品/打开成品.bat",
        "3. 浏览器打开 localhost:5173/?demo=champion&noloading=1",
        "4. 没装 Node：双击 打开成品-免安装.bat",
    ]
    y = 356
    for line in lines:
        d.text((112, y), line, font=F_BODY, fill=INK2)
        y += 48
    d.text((92, 580), "演示兜底", font=F_CARD_T, fill=INK)
    paras = [
        "网络不稳 → 用内置三只演示档案（卷王/摆烂/普通）。",
        "Kiro Hook 不触发 → 先点「投喂」按钮，再展示 Hook 配置。",
        "投影很糊 → 浏览器 110% 缩放，只演示首屏。",
    ]
    y = 636
    for p in paras:
        bullet(d, 96, y, p, color=GOLD)
        y += 54
    # 右侧附件卡
    d.rounded_rectangle((1080, 300, 1830, 900), radius=30, fill=(255, 253, 247, 245), outline=LINE, width=2)
    d.text((1120, 336), "本次提交附件", font=F_CARD_T, fill=INK)
    files = [
        "代码仓鼠-Demo成果说明.pdf（本文件）",
        "代码仓鼠-路演.pptx（8 页路演稿）",
        "代码仓鼠-现场参赛包.zip（可运行 Demo + Kiro 工程）",
    ]
    y = 400
    for f in files:
        d.ellipse((1126, y + 7, 1138, y + 19), fill=PURPLE)
        para(d, 1152, y, f, F_SMALL, INK2, 620, 32)
        y += 72
    d.line((1120, 610, 1790, 610), fill=LINE, width=2)
    d.text((1120, 636), "Kiro 使用", font=F_CARD_T, fill=INK)
    para(d, 1120, 690, "现场用主办方 Kiro 账号登录；工程 .kiro 已包含 Spec、Hooks、Steering，可直接继续开发。", F_SMALL, INK2, 660, 34)
    d.text((1120, 804), "现场演示：输入评委 GitHub 用户名，30 秒看到属于他的仓鼠。", font=F_SMALL, fill=MUTED)
    return img


def page_end(idx, total):
    img = new_page()
    im = Image.open(os.path.join(SHOTS, "slide-08.png")).convert("RGB").resize((W, H), Image.LANCZOS)
    img.paste(im, (0, 0))
    return img


def main():
    pages = [
        page_cover(1, 10),
        page_features(2, 10),
        step_page(3, 10, "02 / 使用流程 · 第 1 步", "打开就领养，3 秒出结果",
                  ["输入 GitHub 用户名，只读公开仓库", "不用登录 / 不用授权", "真实账号 + 三只演示档案（卷王 / 摆烂 / 普通）", "断网也能完整演示"],
                  os.path.join(SHOTS, "app-desktop-1600.png"), (980, 300, 820, 512),
                  "Demo 现场：让评委报用户名，30 秒看到他自己的仓鼠。",
                  "首屏：领养入口 + 仓鼠舞台"),
        step_page(4, 10, "03 / 使用流程 · 第 2 步", "它会把你的提交，变成四个状态",
                  ["数据：提交频率、commit message 质量、最近 diff", "状态：体重 / 心情 / 饥饿 / 亲密度", "7 天不提交 → emo；14 天 → 离家出走", "所有数值都可解释，不是随机"],
                  os.path.join(SHOTS, "app-champion.png"), (980, 300, 820, 620),
                  "卷王仓鼠：8 次提交/7 天，体重 83、心情 98、饥饿 8——数据都来自真实计算。",
                  "状态面板：四状态 + 本周投喂日历"),
        step_page(5, 10, "04 / 使用流程 · 第 3 步", "投喂一颗瓜子，它会当场吃东西",
                  ["点击「投喂一颗瓜子」", "咀嚼动画 + 瓜子掉落粒子", "饥饿 −18 / 体重 +1 / 心情 +6 / 亲密度 +2", "Kiro Hook 投喂会标注来源"],
                  os.path.join(SHOTS, "app-eating.png"), (980, 300, 820, 615),
                  "全场最高光的 15 秒：Kiro 保存代码 → Hook 触发 → 仓鼠进食。",
                  "投喂状态：闭眼、咀嚼、腮帮子鼓起"),
        step_page(6, 10, "05 / 使用流程 · 第 4 步", "你摆烂，它 emo，再摆烂它就走了",
                  ["连续 7 天不提交 → 乌云、眼泪、垂眼", "饥饿 99% → 台词变丧、肚子叫", "14 天 → 空笼子 + 爪印 + 留言", "投喂一颗瓜子，可以把它哄回来"],
                  os.path.join(SHOTS, "app-lazy.png"), (980, 300, 820, 620),
                  "情绪价值来自「愧疚感」：用户会因为它 emo 而想 commit 一次。",
                  "emo 状态：乌云、眼泪、饥饿 99%"),
        page_bugs(7, 10),
        page_kiro(8, 10),
        page_run(9, 10),
        page_end(10, 10),
    ]
    save_pages(pages)


if __name__ == "__main__":
    main()
