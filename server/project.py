import os
import shutil
from typing import Tuple

import imagehash
from consts import IMG_EXT, IMGS_DIR, WORKING_DIR
from image import valid_images_for_import
from PIL import Image


class Project:
    def __init__(self, name: str):
        self.name = name  # Assumed to be a valid name
        self._base_dir = os.path.join(WORKING_DIR, name)
        self._img_dir = os.path.join(self._base_dir, IMGS_DIR)

    def make_dirs(self):
        os.makedirs(self._base_dir, exist_ok=True)
        os.makedirs(self._img_dir, exist_ok=True)

    def base_dir(self) -> str:
        return self._base_dir

    def img_dir(self) -> str:
        return self._img_dir

    def img_path(self, fname) -> str:
        return os.path.join(self._img_dir, fname)

    def delete(self):
        shutil.rmtree(self._base_dir)

    def import_unqiue_images(self, from_path):
        candidates = {}
        files = valid_images_for_import(from_path)

        # 1) Build a list of candidate images.
        for i, f in enumerate(files):
            img_path = os.path.join(from_path, f)

            # Gather information about the image.
            img = Image.open(img_path)
            hash = imagehash.average_hash(img)
            num_pixels = img.width * img.height

            # Ignore image if there's already a duplicate with the same or greater number of pixels.
            should_ignore = False
            for c in candidates.values():
                if c["hash"] == hash and c["num_pixels"] >= num_pixels:
                    should_ignore = True
                    break
            if not should_ignore:
                candidates[img_path] = {
                    "hash": hash,
                    "num_pixels": num_pixels,
                    "new_filename": f"{hash}_{img.width}x{img.height}.{IMG_EXT}",
                }
            yield {
                "percentComplete": round((i + 1) / len(files) * 50),
                "totalFiles": len(files),
            }

        num_candidates = len(candidates)
        if num_candidates == 0:
            yield {"percentComplete": 100}
            return

        # 2) Output the unique images, sorted by filename.
        candidates = dict(
            sorted(candidates.items(), key=lambda x: x[1]["new_filename"])
        )
        num_saved = 0
        for img_path, data in candidates.items():
            img = Image.open(img_path)
            img = img.convert("RGB")
            new_filename = data["new_filename"]
            if not os.path.exists(os.path.join(self._img_dir, new_filename)):
                img.save(os.path.join(self._img_dir, new_filename))
            num_saved += 1
            yield {
                "percentComplete": 50 + round(num_saved / num_candidates * 50),
                "totalFiles": len(files),
                "totalImages": num_candidates,
                "lastImg": new_filename,
            }

    def list_all_imgs(self) -> list[str]:
        if not os.path.exists(self._img_dir):
            return []
        return sorted([f for f in os.listdir(self._img_dir) if f.endswith(IMG_EXT)])

    @staticmethod
    def create_new_project(name: str) -> Tuple[bool, str]:
        project = Project(name)
        is_valid, msg = Project.is_valid_name(name)
        if not is_valid:
            return False, msg
        project.make_dirs()
        return True, ""

    @staticmethod
    def is_valid_name(name: str) -> Tuple[bool, str]:
        if not name.strip():
            return False, "A directory name is required"
        if not all(c.isalnum() or c in ("_", "-") for c in name):
            return (
                False,
                "Only alphanumeric characters, underscores, and hyphens allowed",
            )
        if os.path.exists(os.path.join(WORKING_DIR, name)):
            return False, "A project with this name already exists"
        return True, ""

    @staticmethod
    def list_all_projects() -> list:
        if not os.path.exists(WORKING_DIR):
            return []
        return os.listdir(WORKING_DIR)
