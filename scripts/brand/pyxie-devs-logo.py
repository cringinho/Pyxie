"""Gera a logo da Pyxie Devs em pixel art (SVG + PNG) a partir de mapas de pixels."""
import sys, os
from PIL import Image

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

PAL = {
    'P': '#8B5CF6',  # violeta Pyxie
    'Q': '#6D28D9',  # violeta sombra
    'H': '#C4B5FD',  # brilho
    'D': '#1A1A1A',  # olhos
    'W': '#FFFFFF',  # asa
    'L': '#E9D5FF',  # asa lilás
    'K': '#E60067',  # rosa Pyxie (detalhe)
}
OUTLINE = '#1A1A1A'

# Máscara de gatinho com asas (o emblema do gorro da Pyxie): metade esquerda espelhada
HALF = [
    "..........P....",
    "..........PP...",
    "WW........PPP..",
    ".WWW......PPPPP",
    "..WWWW...PPHPPP",
    "...WWWWW.PPPPPP",
    "....LWWWPPDDPPP",
    ".....LLWPPPDDDP",
    "......LLPPPPDDP",
    ".......LQPPPPPP",
    "........QPPPPPK",
    ".........QPPPPP",
    "..........QQQQQ",
]
MARK = [h + h[::-1] for h in HALF]
FONT = {
    'P': ["11111.", "11..11", "11..11", "11111.", "11....", "11....", "11...."],
    'Y': ["11..11", "11..11", ".1111.", "..11..", "..11..", "..11..", "..11.."],
    'X': ["11..11", "11..11", ".1111.", "..11..", ".1111.", "11..11", "11..11"],
    'I': ["1111", ".11.", ".11.", ".11.", ".11.", ".11.", "1111"],
    'E': ["111111", "11....", "11....", "11111.", "11....", "11....", "111111"],
    'D': ["11111.", "11..11", "11..11", "11..11", "11..11", "11..11", "11111."],
    'V': ["11..11", "11..11", "11..11", "11..11", ".1111.", ".1111.", "..11.."],
    'S': [".11111", "11....", "11....", ".1111.", "....11", "....11", "11111."],
}


def word(text, color):
    rows = [''] * 7
    for i, ch in enumerate(text):
        g = FONT[ch]
        for y in range(7):
            rows[y] += g[y].replace('1', color) + ('.' if i < len(text) - 1 else '')
    return rows


def with_outline(grid):
    h, w = len(grid), len(grid[0])
    g = [['.'] * (w + 2) for _ in range(h + 2)]
    for y, r in enumerate(grid):
        for x, c in enumerate(r):
            g[y + 1][x + 1] = c
    out = [row[:] for row in g]
    for y in range(h + 2):
        for x in range(w + 2):
            if g[y][x] != '.':
                continue
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < h + 2 and 0 <= xx < w + 2 and g[yy][xx] not in '.O':
                    out[y][x] = 'O'
                    break
    return [''.join(r) for r in out]


def to_svg(grid, title, pad=1):
    h, w = len(grid), len(grid[0])
    rects = []
    for y, r in enumerate(grid):
        x = 0
        while x < len(r):
            c = r[x]
            if c == '.':
                x += 1
                continue
            run = 1
            while x + run < len(r) and r[x + run] == c:
                run += 1
            fill = OUTLINE if c == 'O' else PAL[c]
            rects.append(f'<rect x="{x + pad}" y="{y + pad}" width="{run}" height="1" fill="{fill}"/>')
            x += run
    W, H = w + pad * 2, h + pad * 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W * 16}" height="{H * 16}" '
            f'shape-rendering="crispEdges" role="img" aria-labelledby="t"><title id="t">{title}</title>'
            + ''.join(rects) + '</svg>\n'), (W, H)


def to_png(grid, scale, path, pad=1, square=False):
    h, w = len(grid), len(grid[0])
    W, H = w + pad * 2, h + pad * 2
    if square:
        S = max(W, H)
        ox, oy = (S - W) // 2 + pad, (S - H) // 2 + pad
        W = H = S
    else:
        ox, oy = pad, pad
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for y, r in enumerate(grid):
        for x, c in enumerate(r):
            if c == '.':
                continue
            hexc = OUTLINE if c == 'O' else PAL[c]
            im.putpixel((x + ox, y + oy), tuple(int(hexc[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    im = im.resize((W * scale, H * scale), Image.NEAREST)
    im.save(path)


mark = with_outline(MARK)

PAL['T'] = '#1A1A1A'


def build(top_color):
    top = word('PYXIE', top_color)
    bot = word('DEVS', 'P')
    text_w = max(len(top[0]), len(bot[0]))
    text = ['.' * text_w] + [r.ljust(text_w, '.') for r in top] + ['.' * text_w] * 2 + [r.ljust(text_w, '.') for r in bot] + ['.' * text_w]
    mh, th = len(mark), len(text)
    H = max(mh, th)
    rows = []
    for y in range(H):
        my = y - (H - mh) // 2
        ty = y - (H - th) // 2
        mrow = mark[my] if 0 <= my < mh else '.' * len(mark[0])
        trow = text[ty] if 0 <= ty < th else '.' * len(text[0])
        rows.append(mrow + '..' + trow)
    return rows


svg, _ = to_svg(mark, 'Pyxie Devs')
open(os.path.join(OUT, 'pyxie-devs-mark.svg'), 'w', encoding='utf-8').write(svg)
for name, col in (('pyxie-devs-logo', 'W'), ('pyxie-devs-logo-light', 'T')):
    rows = build(col)
    svg, _ = to_svg(rows, 'Pyxie Devs')
    open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8').write(svg)
    to_png(rows, 12, os.path.join(OUT, name + '.png'), pad=2)
to_png(mark, 16, os.path.join(OUT, 'pyxie-devs-icon.png'), pad=4, square=True)
print('ok')
