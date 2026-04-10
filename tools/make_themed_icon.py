from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "app/src/main/assets/widget/image/logo.png"
OUT_DIRS = {
    72: ROOT / "app/src/main/res/drawable-mdpi/uz_icon.png",
    96: ROOT / "app/src/main/res/drawable-hdpi/uz_icon.png",
    114: ROOT / "app/src/main/res/drawable-xhdpi/uz_icon.png",
    144: ROOT / "app/src/main/res/drawable-xxhdpi/uz_icon.png",
}


def extract_mark() -> Image.Image:
    src = Image.open(LOGO).convert("RGBA")
    # Crop the left brand mark from the long logo.
    mark = src.crop((0, 0, 1083, 1083))
    # Remove white background by turning near-white pixels transparent.
    pixels = mark.load()
    for y in range(mark.height):
        for x in range(mark.width):
            r, g, b, a = pixels[x, y]
            if r > 245 and g > 245 and b > 245:
                pixels[x, y] = (255, 255, 255, 0)
    return mark


def render_icon(size: int, mark: Image.Image) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(bg)
    radius = int(size * 0.22)
    draw.rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=radius,
        fill=(247, 251, 239, 255),
    )

    # Soft agriculture-themed green center.
    inner_margin = int(size * 0.08)
    inner = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    inner_draw = ImageDraw.Draw(inner)
    inner_draw.rounded_rectangle(
        (inner_margin, inner_margin, size - inner_margin - 1, size - inner_margin - 1),
        radius=int(size * 0.18),
        fill=(234, 246, 218, 255),
    )
    bg.alpha_composite(inner)

    accent = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    accent_draw = ImageDraw.Draw(accent)
    accent_draw.ellipse(
        (
            int(size * 0.08),
            int(size * 0.56),
            int(size * 0.92),
            int(size * 1.18),
        ),
        fill=(80, 173, 49, 52),
    )
    accent = accent.filter(ImageFilter.GaussianBlur(radius=max(1, size // 24)))
    bg.alpha_composite(accent)

    target = int(size * 0.82)
    icon = mark.resize((target, target), Image.LANCZOS)
    x = (size - target) // 2
    y = (size - target) // 2 - int(size * 0.015)
    bg.alpha_composite(icon, (x, y))

    canvas.alpha_composite(bg)
    return canvas


def main() -> None:
    mark = extract_mark()
    for size, out_path in OUT_DIRS.items():
        icon = render_icon(size, mark)
        icon.save(out_path)
        print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
