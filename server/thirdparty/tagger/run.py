MODEL = "wd14-convnextv2.v1"
THRESHOLD = 0.35
EXTENSION = ".txt"
USE_CPU = False

import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from lib.interrogator import Interrogator
from lib.interrogators import interrogators
from PIL import Image

interrogator = interrogators[MODEL]

if USE_CPU:
    interrogator.use_cpu()


def image_interrogate(image_path: Path):
    """
    Predictions from a image path
    """
    im = Image.open(image_path)
    result = interrogator.interrogate(im)  # type: ignore

    return Interrogator.postprocess_tags(
        result[1],
        threshold=THRESHOLD,
        escape_tag=True,
        replace_underscore=True,
    )


def interrogate_directory(img_dir, output_dir):
    d = Path(img_dir)
    os.makedirs(output_dir, exist_ok=True)

    for f in d.iterdir():
        if not f.is_file() or f.suffix not in [".png", ".jpg", ".jpeg", ".webp"]:
            continue

        image_path = Path(f)
        caption_path = os.path.join(output_dir, f"{f.stem}{EXTENSION}")

        print("processing:", image_path)
        tags = image_interrogate(image_path)

        tags_str = ", ".join(tags.keys())
        with open(caption_path, "w") as fp:
            fp.write(tags_str)
