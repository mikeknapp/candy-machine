import os
from pathlib import Path

from consts import IMG_EXT, SUPPORTED_IMG_EXTS


class Crop:
    def __init__(self, x: int, y: int, width: int, height: int):
        self.x = x
        self.y = y
        self.width = width
        self.height = height


def is_supported_image(file_path: str) -> bool:
    if "." not in file_path:
        return False
    ext = file_path.lower().split(".")[-1]
    return ext in SUPPORTED_IMG_EXTS


def valid_images_for_import(from_path: str) -> list[str]:
    if not os.path.isdir(from_path):
        return []

    return [f for f in os.listdir(from_path) if is_supported_image(f)]


def valid_import_directory(from_path: str) -> bool:
    if not os.path.exists(from_path):
        return False

    if not os.path.isdir(from_path):
        return False

    if not valid_images_for_import(from_path):
        return False

    return True


def choose_image_filename(
    img_dir_path: Path, file_prefix: str, i=0, remove_duplicates=True
) -> str:
    def make_fname(file_prefix, i):
        return f"{file_prefix}_{i}.{IMG_EXT}"

    fname = make_fname(file_prefix, i)
    if remove_duplicates:
        return fname

    while os.path.exists(os.path.join(img_dir_path, fname)):
        i += 1
        fname = make_fname(file_prefix, i)

    return fname


def get_image_i(filename: str) -> int:
    # Extract i from
    # {hash}_{w}x{h}_{i}.{ext}
    try:
        return int(Path(filename).stem.split("_")[-1])
    except ValueError:
        return 0
