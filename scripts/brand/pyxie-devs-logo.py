"""
Marca da Pyxie Devs em pixel art (paleta da Pyxie).

Ícone: a Pyxie como gato-morcego-fada, com orelhas de gato, presas de morcego,
asas de fada e o lacinho dela. Logo: ícone + PYXIE DEVS em letras de pixel.

Uso: python scripts/brand/pyxie-devs-logo.py public/assets/brand
Gera pyxie-devs-icon.{svg,png}, pyxie-devs-logo{,-light}.{svg,png}.
"""
import math, sys, os
from PIL import Image

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
N = 64
PAL = {
    'P': '#8B5CF6', 'Q': '#6D28D9', 'H': '#C4B5FD', 'D': '#1A1A1A',
    'W': '#FFFFFF', 'L': '#E9D5FF', 'K': '#E60067',
}
g = [['.'] * N for _ in range(N)]


def rot_ellipse(cx, cy, rx, ry, ang):
    a = math.radians(ang)
    ca, sa = math.cos(a), math.sin(a)
    m = set()
    for y in range(N):
        for x in range(32):
            dx, dy = x + .5 - cx, y + .5 - cy
            u = dx * ca + dy * sa
            v = -dx * sa + dy * ca
            if (u / rx) ** 2 + (v / ry) ** 2 <= 1:
                m.add((x, y))
    return m


def polygon(pts):
    m = set()
    for y in range(N):
        for x in range(32):
            px, py = x + .5, y + .5
            inside = False
            j = len(pts) - 1
            for i in range(len(pts)):
                xi, yi = pts[i]; xj, yj = pts[j]
                if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi:
                    inside = not inside
                j = i
            if inside:
                m.add((x, y))
    return m


def put_layer(mask, color_fn, outline='D'):
    for (x, y) in mask:
        g[y][x] = color_fn(x, y)
    for (x, y) in mask:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            if (x + dx, y + dy) not in mask and not (x + dx == 32 and 0 <= y < N):
                g[y][x] = outline
                break


def line(x0, y0, x1, y1, c, mask=None):
    n = int(max(abs(x1 - x0), abs(y1 - y0))) * 2 + 1
    for i in range(n + 1):
        t = i / n
        x, y = round(x0 + (x1 - x0) * t), round(y0 + (y1 - y0) * t)
        if mask is None or ((x, y) in mask and g[y][x] != 'D'):
            g[y][x] = c


# --- Asas de fada (atrás): superior grande e inferior menor
root = (26, 37)
up = rot_ellipse(13, 23, 10.5, 16.5, -40)
low = rot_ellipse(15.5, 47, 7.5, 10.5, 42)


def wing_fill(mask):
    def fn(x, y):
        d = math.hypot(x - root[0], y - root[1])
        edge = any((x + dx, y + dy) not in mask for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)))
        if d < 10:
            return 'L'
        return 'L' if edge else 'W'
    return fn


put_layer(low, wing_fill(low))
for tip in ((9, 54), (6, 48)):
    line(root[0] - 5, root[1] + 7, tip[0], tip[1], 'H', low)
put_layer(up, wing_fill(up))
for tip in ((5, 11), (3, 21), (7, 29)):
    line(root[0] - 5, root[1] - 4, tip[0], tip[1], 'H', up)
for (x, y) in ((9, 13), (6, 18), (11, 20), (8, 25)):
    if (x, y) in up and g[y][x] == 'W':
        g[y][x] = 'H'

# --- Orelhas de gato-morcego: triângulo inclinado com recorte de morcego na borda de fora
ear = polygon([(17, 34), (12, 9), (14, 8.5), (23, 17), (29, 27)])
put_layer(ear, lambda x, y: 'P')
inner = polygon([(18.5, 29.5), (14.2, 13), (25, 25.5)])
for (x, y) in inner:
    if g[y][x] != 'D':
        g[y][x] = 'Q'
for (x, y) in inner:
    if g[y][x] == 'Q' and (x + 1, y) not in inner:
        g[y][x] = 'H'

# --- Cabeça
head = set()
for y in range(N):
    for x in range(32):
        dx, dy = x + .5 - 32, y + .5 - 39
        if (dx / 15.5) ** 2 + (dy / 12.5) ** 2 <= 1:
            head.add((x, y))
# tufos das bochechas
for (x, y) in ((16, 40), (15, 41), (16, 41), (16, 42), (15, 43), (16, 43), (16, 44)):
    head.add((x, y))


def head_color(x, y):
    if y >= 46 or (y >= 44 and x < 21):
        return 'Q'
    return 'P'


put_layer(head, head_color)
# brilho da testa
for (x, y) in ((22, 30), (23, 29), (24, 29), (25, 28), (20, 32)):
    if (x, y) in head and g[y][x] != 'D':
        g[y][x] = 'H'

# --- Rosto (metade esquerda; espelhado)
eye = [(21, 35), (22, 35), (21, 36), (22, 36), (23, 36), (24, 36), (22, 37), (23, 37), (24, 37), (25, 37), (26, 37),
       (23, 38), (24, 38), (25, 38), (26, 38), (27, 38), (25, 39), (26, 39), (27, 39)]
for (x, y) in eye:
    g[y][x] = 'D'
g[37][23] = 'W'  # brilho no olho
g[36][22] = 'D'
# bochecha corada
for (x, y) in ((21, 41), (22, 41), (23, 41), (22, 42)):
    g[y][x] = 'K'
# nariz
g[41][31] = 'K'
g[40][31] = 'K'
# boca em "w"
for (x, y) in ((27, 43), (28, 43), (29, 44), (30, 44), (31, 43)):
    g[y][x] = 'D'

# presinhas de morcego
for (x, y, c) in ((27, 44, 'D'), (28, 44, 'W'), (28, 45, 'W'), (27, 45, 'D'), (29, 45, 'D'), (28, 46, 'D')):
    g[y][x] = c
# bigodes
line(15, 40, 9, 38, 'D')
line(15, 43, 9, 44, 'D')

# --- Espelha
for y in range(N):
    for x in range(32):
        g[y][63 - x] = g[y][x]

# --- Detalhes assimétricos: lacinho da Pyxie na orelha direita, presa de morcego e brilhos
BOW = ["DD.....DD", "DLDD.DDLD", "DLLWDLLLD", "DLLDKDLLD", "DHLLDLLHD", "DHHD.DHHD", "DD.....DD"]
for j, row in enumerate(BOW):
    for i, c in enumerate(row):
        if c != '.':
            g[23 + j][40 + i] = c

for (cx, cy) in ((57, 8), (4, 58)):
    for (dx, dy) in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
        if g[cy + dy][cx + dx] == '.':
            g[cy + dy][cx + dx] = 'W' if (dx, dy) == (0, 0) else 'H'




# ---------------------------------------------------------------- logo
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
TS = 3  # cada pixel da letra vira 3x3 pixels do ícone


def word(text, color, shadow):
    rows = [''] * 7
    for i, ch in enumerate(text):
        for y in range(7):
            rows[y] += FONT[ch][y] + ('.' if i < len(text) - 1 else '')
    w, h = len(rows[0]) * TS, 7 * TS
    out = [['.'] * (w + 1) for _ in range(h + 1)]
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c == '1':
                for yy in range(TS):
                    for xx in range(TS):
                        out[y * TS + yy][x * TS + xx] = color
    # sombra de 1 pixel para baixo e para a direita
    for y in range(h):
        for x in range(w):
            if out[y][x] == color and out[y + 1][x + 1] == '.':
                out[y + 1][x + 1] = shadow
    return out


def icon_grid():
    rows = [r[:] for r in g]
    ys = [y for y in range(N) if any(c != '.' for c in rows[y])]
    return rows[ys[0]:ys[-1] + 1]


def logo_grid(top_color, top_shadow):
    icon = icon_grid()
    top, bot = word('PYXIE', top_color, top_shadow), word('DEVS', 'P', 'Q')
    tw = max(len(top[0]), len(bot[0]))
    text = [r + ['.'] * (tw - len(r)) for r in top] + [['.'] * tw for _ in range(5)] + [r + ['.'] * (tw - len(r)) for r in bot]
    H = max(len(icon), len(text))
    gap = 6
    rows = []
    for y in range(H):
        iy, ty = y - (H - len(icon)) // 2, y - (H - len(text)) // 2
        irow = icon[iy] if 0 <= iy < len(icon) else ['.'] * N
        trow = text[ty] if 0 <= ty < len(text) else ['.'] * tw
        rows.append(list(irow) + ['.'] * gap + list(trow))
    return rows


def grid_svg(rows, title, pad=2, px=4):
    """Um <path> por cor (trechos horizontais), bem mais leve que um <rect> por trecho."""
    h, w = len(rows), len(rows[0])
    paths = {}
    for y, r in enumerate(rows):
        x = 0
        while x < w:
            c = r[x]
            if c == '.':
                x += 1
                continue
            run = 1
            while x + run < w and r[x + run] == c:
                run += 1
            paths.setdefault(PAL[c], []).append(f'M{x + pad} {y + pad}h{run}v1h-{run}z')
            x += run
    W, Hh = w + pad * 2, h + pad * 2
    body = ''.join(f'<path fill="{color}" d="{"".join(d)}"/>' for color, d in paths.items())
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {Hh}" width="{W * px}" height="{Hh * px}" '
            f'shape-rendering="crispEdges" role="img" aria-labelledby="t"><title id="t">{title}</title>'
            + body + '</svg>\n'), (W, Hh)


def grid_png(rows, scale, path, pad=2, square=False):
    h, w = len(rows), len(rows[0])
    W, Hh = w + pad * 2, h + pad * 2
    ox, oy = pad, pad
    if square:
        S = max(W, Hh)
        ox, oy = (S - w) // 2, (S - h) // 2
        W = Hh = S
    im = Image.new('RGBA', (W, Hh), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.':
                hx = PAL[c]
                im.putpixel((x + ox, y + oy), tuple(int(hx[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    im.resize((W * scale, Hh * scale), Image.NEAREST).save(path, optimize=True)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    PAL['T'] = '#1A1A1A'
    full = [r[:] for r in g]
    svg, _ = grid_svg(full, 'Pyxie Devs', pad=0, px=8)
    open(os.path.join(OUT, 'pyxie-devs-icon.svg'), 'w', encoding='utf-8').write(svg)
    grid_png(full, 16, os.path.join(OUT, 'pyxie-devs-icon.png'), pad=0, square=True)
    for name, top, shadow in (('pyxie-devs-logo', 'W', 'Q'), ('pyxie-devs-logo-light', 'T', 'H')):
        rows = logo_grid(top, shadow)
        svg, size = grid_svg(rows, 'Pyxie Devs')
        open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8').write(svg)
        grid_png(rows, 8, os.path.join(OUT, name + '.png'))
        print(name, size)
