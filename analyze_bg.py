from PIL import Image

def get_corner_colors(path):
    print(f"--- {path} ---")
    img = Image.open(path).convert('RGBA')
    width, height = img.size
    print(f"Size: {width}x{height}")
    
    # Let's get a list of colors in the first 20x20 block
    colors = set()
    for x in range(min(20, width)):
        for y in range(min(20, height)):
            colors.add(img.getpixel((x, y)))
            
    print("Background colors in top-left 20x20:")
    for c in sorted(list(colors)):
        print(c)

get_corner_colors('storefront/public/images/logo.png')
get_corner_colors('storefront/public/images/logo-dark.png')
