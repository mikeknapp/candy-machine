from consts import SUPPORTED_IMG_EXTS


def is_supported_image(file_path: str):
    if "." not in file_path:
        return False
    ext = file_path.lower().split(".")[-1]
    return ext in SUPPORTED_IMG_EXTS
