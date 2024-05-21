import os
import shutil
from typing import Tuple

from consts import IMG_EXT, IMGS_DIR, WORKING_DIR


class Project:
    def __init__(self, name: str):
        self.name = name  # Assumed to be a valid name
        self._base_path = os.path.join(WORKING_DIR, name)
        self._img_path = os.path.join(self._base_path, IMGS_DIR)

    def make_dirs(self):
        os.makedirs(self._base_path, exist_ok=True)
        os.makedirs(self._img_path, exist_ok=True)

    def delete(self):
        shutil.rmtree(self._base_path)

    def list_all_imgs(self) -> list[str]:
        if not os.path.exists(self._img_path):
            return []
        return [f for f in os.listdir(self._img_path) if f.endswith(IMG_EXT)]

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
