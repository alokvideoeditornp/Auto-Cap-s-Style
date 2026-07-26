import re

with open('src/remotion/CaptionLine.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("styleConfig.animationType === '3-way-slide' || styleConfig.animationType === '3-line-focus'", "styleConfig.animationType === '3-line-focus'")

with open('src/remotion/CaptionLine.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
