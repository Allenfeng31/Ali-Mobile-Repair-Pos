from PIL import Image

def find_checkerboard(path):
    img = Image.open(path).convert('RGBA')
    width, height = img.size
    colors = set()
    for x in range(width):
        for y in range(height):
            c = img.getpixel((x, y))
            # Ignore fully transparent pixels
            if c[3] > 0:
                colors.add(c)
    print(f"Non-transparent colors in {path}: {len(colors)}")
    # Count how many are gray-ish
    grays = [c for c in colors if c[0] == c[1] == c[2] and 150 <= c[0] <= 220]
    print(f"Gray colors: {len(grays)}")
    if len(grays) > 0:
        print("Sample grays:", grays[:5])

find_checkerboard('storefront/public/images/logo-dark.png')
