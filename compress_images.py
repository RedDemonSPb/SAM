"""Compress tent1/2/3.webp images using Pillow.
Run: python compress_images.py
"""
from PIL import Image
import os

IMG_DIR = r'c:\Users\dmitr\Desktop\SAM\img'
TARGET_MAX_KB = 300
QUALITY_START = 75

files = ['tent1.webp', 'tent2.webp', 'tent3.webp']

for fname in files:
    path = os.path.join(IMG_DIR, fname)
    if not os.path.exists(path):
        print(f"  ! {fname} not found, skipping")
        continue

    orig_size = os.path.getsize(path) / 1024
    print(f"\n{fname}: {orig_size:.0f} KB")

    img = Image.open(path)
    w, h = img.size
    print(f"  Original: {w}x{h}")

    # Resize if wider than 1600px
    max_w = 1600
    if w > max_w:
        ratio = max_w / w
        new_w = max_w
        new_h = int(h * ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
        print(f"  Resized:  {new_w}x{new_h}")

    # Save with quality optimization
    quality = QUALITY_START
    img.save(path, 'WEBP', quality=quality, method=6)
    new_size = os.path.getsize(path) / 1024

    # If still too large, reduce quality
    while new_size > TARGET_MAX_KB and quality > 40:
        quality -= 5
        img.save(path, 'WEBP', quality=quality, method=6)
        new_size = os.path.getsize(path) / 1024

    reduction = (1 - new_size / orig_size) * 100
    print(f"  Result:   {new_size:.0f} KB (quality={quality}, -{reduction:.0f}%)")

print("\nDone!")
