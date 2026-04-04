from PIL import Image

img = Image.open('storefront/public/images/logo-dark.png').convert('RGBA')
width, height = img.size

# Let's count how many pixels are dark, how many are white, etc.
counts = {}
for x in range(width):
    for y in range(height):
        c = img.getpixel((x, y))
        if c[3] == 0:
            counts['transparent'] = counts.get('transparent', 0) + 1
        else:
            color = c[:3]
            counts[color] = counts.get(color, 0) + 1

# Print top 10 most common colors
sorted_colors = sorted(counts.items(), key=lambda item: item[1], reverse=True)
print(f"Total pixels: {width * height}")
for k, v in sorted_colors[:15]:
    print(f"Color {k}: {v} pixels")
