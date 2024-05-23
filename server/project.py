import os
import shutil
from typing import Tuple

import imagehash
from consts import IMG_EXT, IMGS_DIR, WORKING_DIR
from image import Crop, choose_image_filename, valid_images_for_import
from PIL import Image


class Project:
    def __init__(self, name: str, working_dir: str | None = None):
        self.name = name

        # Allow overrides for testing.
        working_dir = working_dir if working_dir else WORKING_DIR

        # Our base project directory.
        self._base_dir = os.path.join(working_dir, name)

        # The images subdirectory.
        self._img_dir = os.path.join(self._base_dir, IMGS_DIR)

    @staticmethod
    def create_new_project(
        name: str, working_dir: str | None = None
    ) -> Tuple["Project | None", str]:
        project = Project(name, working_dir)
        is_valid, msg = Project.is_valid_name(name)
        if not is_valid:
            return None, msg
        project.make_dirs()
        return project, ""

    def make_dirs(self):
        os.makedirs(self._base_dir, exist_ok=True)
        os.makedirs(self._img_dir, exist_ok=True)

    def base_dir(self) -> str:
        return self._base_dir

    def img_dir(self) -> str:
        return self._img_dir

    def img_path(self, fname: str) -> str:
        return os.path.join(self._img_dir, fname)

    def delete(self):
        shutil.rmtree(self._base_dir)

    def delete_image(self, fname):
        img_path = self.img_path(fname)
        if os.path.exists(img_path):
            os.remove(img_path)

    def edit_image(self, fname: str, left_rotate: int, flip: bool, crop: Crop) -> str:
        """Edit Image.

        Rotates, flips and crops an image and saves the result.
        Deletes the old file and returns the new filename.
        """
        img_path = self.img_path(fname)
        old_image_hash = fname.split("_")[0]
        img = Image.open(img_path)

        # Perform the edits.
        if left_rotate:
            img = img.rotate(-left_rotate, expand=True)

        if flip:
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

        if crop:
            img = img.crop((crop.x, crop.y, crop.x + crop.width, crop.y + crop.height))

        # Choose a new filename. Keep the old image hash because it's still the same image (!) and
        # we want to keep a consistent order in the thumbnails side panel.
        new_fname_prefix = f"{old_image_hash}_{img.width}x{img.height}"
        new_fname = choose_image_filename(
            self._img_dir, new_fname_prefix, remove_duplicates=True
        )

        # Save new image and delete the old one.
        img.save(self.img_path(new_fname))
        self.delete_image(fname)
        return new_fname

    def import_images(self, from_path, remove_duplicates=False):
        candidates = {}
        files = valid_images_for_import(from_path)

        # 1) Build a list of candidate images.
        for i, f in enumerate(files):
            img_path = os.path.join(from_path, f)

            # Gather information about the image.
            img = Image.open(img_path)
            hash = imagehash.average_hash(img)
            num_pixels = img.width * img.height

            num_duplicates = 0
            for c in candidates.values():
                if c["hash"] == hash and c["num_pixels"] >= num_pixels:
                    num_duplicates += 1

            ignore_image = remove_duplicates and num_duplicates > 0
            if not ignore_image:
                candidates[img_path] = {
                    "hash": hash,
                    "num_pixels": num_pixels,
                    "num_duplicates": num_duplicates,
                    "new_filename_prefix": f"{hash}_{img.width}x{img.height}",
                }
            yield {
                "percentComplete": round((i + 1) / len(files) * 50),
                "totalFiles": len(files),
            }

        num_candidates = len(candidates)
        if num_candidates == 0:
            yield {"percentComplete": 100}
            return

        # 2) Output the unique images, sorted by new_filename_prefix.
        candidates = dict(
            sorted(candidates.items(), key=lambda x: x[1]["new_filename_prefix"])
        )
        num_saved = 0
        for img_path, data in candidates.items():
            img = Image.open(img_path)
            img = img.convert("RGB")
            new_filename = choose_image_filename(
                self._img_dir,
                data["new_filename_prefix"],
                data["num_duplicates"],
                remove_duplicates,
            )
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
    def list_all_projects(working_dir_override: str | None = None) -> list:
        working_dir = working_dir_override if working_dir_override else WORKING_DIR
        if not os.path.exists(working_dir):
            return []
        return os.listdir(working_dir)
