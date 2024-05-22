import os

from consts import SUPPORTED_IMG_EXTS


def is_supported_image(file_path: str):
    if "." not in file_path:
        return False
    ext = file_path.lower().split(".")[-1]
    return ext in SUPPORTED_IMG_EXTS


def valid_images_for_import(from_path) -> list[str]:
    return [f for f in os.listdir(from_path) if is_supported_image(f)]


def valid_import_directory(from_path):
    if not os.path.exists(from_path):
        return False

    if not os.path.isdir(from_path):
        return False

    if not valid_images_for_import(from_path):
        return False

    return True
