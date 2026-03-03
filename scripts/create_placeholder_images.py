"""
create_placeholder_images.py
Creates simple branded placeholder WebP images for personality quiz results.
Run with: python scripts/create_placeholder_images.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')

# Each entry: (filename, bg_color_top, bg_color_bottom, emoji, label)
IMAGES = [
    # Travel personality quiz
    ('adventurer-personality.webp',    '#1a6b3c', '#25d366', '🧗', 'Adventurer'),
    ('culturalist-personality.webp',   '#7b4a0f', '#e8943a', '🏛️', 'Culturalist'),
    ('relaxer-personality.webp',       '#1a4a7a', '#4a9ed6', '🏖️', 'Relaxer'),
    ('socialiser-personality.webp',    '#6a1a7a', '#c94de0', '🎉', 'Socialiser'),
    ('travel-personality.webp',        '#0d4f30', '#25d366', '✈️', 'Travel Type'),
    # Love language quiz
    ('words-affirmation-personality.webp',  '#1a3a6a', '#4a7ad6', '💬', 'Words of\nAffirmation'),
    ('acts-service-personality.webp',       '#1a5a3a', '#25d366', '🤝', 'Acts of\nService'),
    ('receiving-gifts-personality.webp',    '#6a1a2a', '#d64a6a', '🎁', 'Receiving\nGifts'),
    ('quality-time-personality.webp',       '#3a1a6a', '#7a4ad6', '⏰', 'Quality\nTime'),
    ('physical-touch-personality.webp',     '#6a3a1a', '#d68a4a', '🤗', 'Physical\nTouch'),
    ('love-language.webp',                  '#5a1a3a', '#d64a8a', '❤️', 'Love\nLanguage'),
]

SIZE = (400, 400)

def lerp_color(c1_hex, c2_hex, t):
    """Linearly interpolate between two hex colours."""
    r1, g1, b1 = int(c1_hex[1:3],16), int(c1_hex[3:5],16), int(c1_hex[5:7],16)
    r2, g2, b2 = int(c2_hex[1:3],16), int(c2_hex[3:5],16), int(c2_hex[5:7],16)
    return (int(r1+(r2-r1)*t), int(g1+(g2-g1)*t), int(b1+(b2-b1)*t))

def make_gradient(img, color_top, color_bottom):
    draw = ImageDraw.Draw(img)
    w, h = img.size
    for y in range(h):
        color = lerp_color(color_top, color_bottom, y / (h - 1))
        draw.line([(0, y), (w, y)], fill=color)

def draw_centered_text(draw, text, y_center, width, font, fill='white'):
    """Draw text (possibly multiline) centred horizontally."""
    lines = text.split('\n')
    try:
        line_h = font.getbbox('A')[3] + 6
    except Exception:
        line_h = 30
    total_h = line_h * len(lines)
    y = y_center - total_h // 2
    for line in lines:
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            text_w = bbox[2] - bbox[0]
        except Exception:
            text_w = len(line) * 18
        x = (width - text_w) // 2
        draw.text((x, y), line, font=font, fill=fill)
        y += line_h

def create_image(filename, bg_top, bg_bottom, emoji, label):
    img = Image.new('RGB', SIZE)
    make_gradient(img, bg_top, bg_bottom)
    draw = ImageDraw.Draw(img)

    # White circle in center
    cx, cy = SIZE[0] // 2, SIZE[1] // 2
    r = 90
    draw.ellipse([cx - r, cy - 70 - r, cx + r, cy - 70 + r],
                 fill=(255, 255, 255, 180))

    # Try to load a font; fall back to default
    try:
        emoji_font = ImageFont.truetype('seguiemj.ttf', 72)
    except Exception:
        try:
            emoji_font = ImageFont.truetype('arial.ttf', 72)
        except Exception:
            emoji_font = ImageFont.load_default()

    try:
        label_font = ImageFont.truetype('arialbd.ttf', 32)
    except Exception:
        try:
            label_font = ImageFont.truetype('arial.ttf', 32)
        except Exception:
            label_font = ImageFont.load_default()

    try:
        small_font = ImageFont.truetype('arial.ttf', 18)
    except Exception:
        small_font = ImageFont.load_default()

    # Emoji in circle
    try:
        bbox = draw.textbbox((0, 0), emoji, font=emoji_font)
        ew = bbox[2] - bbox[0]
        eh = bbox[3] - bbox[1]
        draw.text((cx - ew // 2, cy - 70 - eh // 2 - 8), emoji,
                  font=emoji_font, fill=(50, 50, 50))
    except Exception:
        draw.text((cx - 36, cy - 110), emoji, font=emoji_font, fill=(50, 50, 50))

    # Label below circle
    draw_centered_text(draw, label, cy + 70, SIZE[0], label_font, fill='white')

    # "iQuizPros" watermark at bottom
    draw_centered_text(draw, 'iQuizPros', SIZE[1] - 30, SIZE[0], small_font,
                       fill=(255, 255, 255, 160))

    out_path = os.path.join(OUTPUT_DIR, filename)
    img.save(out_path, 'WEBP', quality=85)
    print(f'  Created: {filename}')

if __name__ == '__main__':
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f'Writing images to {os.path.abspath(OUTPUT_DIR)}')
    for args in IMAGES:
        try:
            create_image(*args)
        except Exception as e:
            print(f'  ERROR creating {args[0]}: {e}')
    print('Done.')
