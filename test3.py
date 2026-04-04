from PIL import Image

def process_image(path):
    print(f"Processing: {path}")
    try:
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check for grid colors (grays and whites)
            # If r,g,b are close to each other, it's gray scale
            # We want to remove the checkerboard without removing the white text of the logo.
            # But wait, if the text is white, removing white pixels will remove the text.
            pass
    except Exception as e:
        print(f"Error: {e}")

process_image('storefront/public/images/logo-dark.png')
