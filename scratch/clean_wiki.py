import re

with open('public/wiki.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if 'badge badge-t' in line:
        if i + 1 < len(lines) and 'badge badge-t' in lines[i+1]:
            continue
    new_lines.append(line)

content = ''.join(new_lines)
content = re.sub(r'src="/assets/spirits/([a-z_]+)\.gif(\?v=\d+)?"', r'src="/assets/spirits/\1.gif?v=3"', content)

with open('public/wiki.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated wiki.html successfully!")

