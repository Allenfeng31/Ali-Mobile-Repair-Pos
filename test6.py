import sys
from PIL import Image

def analyze_img(path):
    print(f"--- {path} ---")
    img = Image.open(path).convert('RGBA')
    width, height = img.size
    counts = {}
    for x in range(width):
        for y in range(height):
            c = img.getpixel((x, y))
            if c[3] == 0:
                counts['transparent'] = counts.get('transparent', 0) + 1
            else:
                color = c[:3]
                counts[color] = counts.get(color, 0) + 1
    sorted_colors = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    print(f"Total pixels: {width * height}")
    for k, v in sorted_colors[:5]:
        print(f"Color {k}: {v} pixels")

analyze_img('logo-dark.png')
