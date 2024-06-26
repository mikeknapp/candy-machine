import json
import os
import shutil
import threading
import time
from pathlib import Path
from typing import Tuple

project_save_lock = threading.Lock()

import imagehash
from consts import (
    AUTO_TAGS,
    DEFAULT_CATEGORY_FILE,
    IMG_EXT,
    IMGS_DIR,
    PROJECT_CATEGORY_FILE,
    PROJECT_CONFIG_FILE,
    PROJECTS_DIR,
)
from image import Crop, choose_image_filename, get_image_i, valid_images_for_import
from PIL import Image
from tags import common_suffixes
from thirdparty.tagger.run import interrogate_directory


class TagInfo:
    def __init__(self, tag, count, examples):
        self.tag = tag
        self.count = count
        self.examples = examples

    def to_dict(self):
        return {
            "tag": self.tag,
            "count": self.count,
            "examples": self.examples,
        }


class TagCategory:
    def __init__(self, title: str, tags: list[str], color: str):
        self.title = title
        self.tags = tags
        self.color = color

    def to_dict(self):
        return {
            "title": self.title,
            "tags": self.tags,
            "color": self.color,
        }


class Project:
    def __init__(self, name: str, projects_dir: str | None = None):
        self.name = name

        # Allow overrides for testing.
        projects_dir = projects_dir if projects_dir else PROJECTS_DIR

        # Our base project directory.
        self._base_dir = Path(os.path.join(projects_dir, name))

        # The images subdirectory.
        self._img_dir = Path(os.path.join(self._base_dir, IMGS_DIR))

        # The auto tags subdirectory.
        self._auto_tags_dir = Path(os.path.join(self._base_dir, AUTO_TAGS))

        self._load()

    @staticmethod
    def create_new_project(
        name: str, trigger_word: str = "", projects_dir: str | None = None
    ) -> Tuple["Project | None", str]:
        project = Project(name, projects_dir)
        is_valid, msg = Project.is_valid_name(name)
        if not is_valid:
            return None, msg
        project._make_dirs()
        if trigger_word:
            project.trigger_word = trigger_word
            project.save()
        return project, ""

    def _make_dirs(self):
        os.makedirs(self._base_dir, exist_ok=True)
        os.makedirs(self._img_dir, exist_ok=True)
        os.makedirs(self._auto_tags_dir, exist_ok=True)

    def base_dir(self) -> Path:
        return self._base_dir

    def img_dir(self) -> Path:
        return self._img_dir

    def auto_tags_dir(self) -> Path:
        return self._auto_tags_dir

    def img_path(self, fname: str) -> Path:
        return Path(os.path.join(self._img_dir, fname))

    def selected_image_path(self) -> Path:
        return Path(self.img_path(self.selected_image))

    def selected_image_txt_path(self) -> Path:
        return self.selected_image_path().with_suffix(".txt")

    def selected_image_auto_txt_path(self) -> Path:
        return self.auto_tags_dir().joinpath(
            Path(self.selected_image).with_suffix(".txt")
        )

    def set_selected_image(self, image_name: str):
        if image_name.strip() not in self.imgs:
            raise ValueError(f"Invalid image name: {image_name}")
        self.selected_image = image_name

    def _load(self):
        self.project_layout = self._project_tag_categories()
        self.imgs, self.completed = self._list_all_imgs()
        self.trigger_word = ""
        self.trigger_synonyms = []
        self.selected_image = ""
        self.auto_tags = []
        self.hidden_tags = []
        self.requires_setup = False

        # Load config file.
        self._load_config()

        # Load the auto tags.
        if len(self.project_layout) == 0:
            self.project_layout = self._default_tag_categories()
            self.auto_tags = self._get_filtered_auto_tags(self.project_layout)
            self.requires_setup = len(self.auto_tags) > 0
        else:
            # Don't filter, because we want all examples now the project is setup.
            self.auto_tags = self._get_filtered_auto_tags([])

    def _load_config(self):
        file_path = os.path.join(self._base_dir, PROJECT_CONFIG_FILE)
        if not os.path.exists(file_path):
            return
        # TODO: If contention proves to still be an issue, cache the project config instead of reading it off disk.
        retries = 3
        delay = 1
        for i in range(retries):
            try:
                with open(file_path, "r") as fp:
                    data = json.load(fp)
                    if "selectedImage" in data:
                        self.selected_image = data["selectedImage"]
                    if "triggerWord" in data:
                        self.trigger_word = data["triggerWord"]
                    if "triggerSynonyms" in data:
                        self.trigger_synonyms = data["triggerSynonyms"]
                    if "hiddenTags" in data:
                        self.hidden_tags = data["hiddenTags"]
                break
            except IOError:
                if i < retries - 1:
                    time.sleep(delay)
                else:
                    raise IOError(f"Failed to read {file_path}, too much contention")

    def save(self, data: dict = {}):
        # Save the tag layout.
        if "tagLayout" in data:
            file_path = os.path.join(self._base_dir, PROJECT_CATEGORY_FILE)
            with open(file_path, "w") as fp:
                json.dump(data["tagLayout"], fp)

        # Save the config file.
        if "selectedImage" in data:
            self.selected_image = data["selectedImage"].get("filename", "")

        if "triggerWord" in data:
            self.trigger_word = data["triggerWord"]

        if "triggerSynonyms" in data:
            self.trigger_synonyms = data["triggerSynonyms"]

        if "hiddenTags" in data:
            self.hidden_tags = data["hiddenTags"]

        file_path = os.path.join(self._base_dir, PROJECT_CONFIG_FILE)
        with project_save_lock:
            with open(file_path, "w") as fp:
                json.dump(
                    {
                        "selectedImage": self.selected_image,
                        "triggerWord": self.trigger_word,
                        "triggerSynonyms": self.trigger_synonyms,
                        "hiddenTags": self.hidden_tags,
                    },
                    fp,
                )

    def save_txt_file(self, txtFileContents: str):
        if txtFileContents.strip() == "":
            if os.path.exists(self.selected_image_txt_path()):
                os.remove(self.selected_image_txt_path())
            return
        with open(self.selected_image_txt_path(), "w") as fp:
            fp.write(txtFileContents)

    def get_selected_image_tags(self):
        return self._load_tags_from_file(self.selected_image_txt_path())

    def get_selected_auto_image_tags(self):
        return self._load_tags_from_file(self.selected_image_auto_txt_path())

    def delete(self):
        shutil.rmtree(self._base_dir)

    def to_dict(self):
        self.selected_image = self.selected_image or self.imgs[0] if self.imgs else ""
        return {
            "name": self.name,
            "triggerWord": self.trigger_word,
            "triggerSynonyms": self.trigger_synonyms,
            "images": self.imgs,
            "completed": self.completed,
            "autoTags": self.auto_tags,
            "hiddenTags": self.hidden_tags,
            "tagLayout": [c.to_dict() for c in self.project_layout],
            "requiresSetup": self.requires_setup,
            "selectedImage": self.selected_image_to_dict(),
        }

    def selected_image_to_dict(self):
        if not self.selected_image:
            return {}
        return {
            "projectName": self.name,
            "filename": self.selected_image,
            "tags": self.get_selected_image_tags(),
            "autoTags": self.get_selected_auto_image_tags(),
        }

    def _read_tag_category_file(self, file_path: str) -> list[TagCategory]:
        if not os.path.exists(file_path):
            return []
        with open(file_path, "r") as fp:
            data = json.load(fp)
            results = []
            for category in data:
                results.append(
                    TagCategory(
                        title=category["title"],
                        tags=category["tags"],
                        color=category["color"],
                    )
                )
            return results

    def _default_tag_categories(self) -> list[TagCategory]:
        file_path = os.path.join(os.path.dirname(__file__), DEFAULT_CATEGORY_FILE)
        return self._read_tag_category_file(file_path)

    def _project_tag_categories(self) -> list[TagCategory]:
        file_path = os.path.join(self._base_dir, PROJECT_CATEGORY_FILE)
        return self._read_tag_category_file(file_path)

    def delete_image(self, fname):
        img_path = self.img_path(fname)
        if os.path.exists(img_path):
            os.remove(img_path)

    def edit_image(
        self, fname: str, left_rotate: int, flip: bool, crop: Crop | None
    ) -> str:
        """Edit Image.

        Rotates, flips and crops an image and saves the result.
        Deletes the old file and returns the new filename.
        """
        old_img_path = self.img_path(fname)
        old_image_hash = fname.split("_")[0]
        old_i = get_image_i(fname)
        img = Image.open(old_img_path)

        # Perform the edits.
        if left_rotate:
            img = img.rotate(-left_rotate, expand=True)

        if flip:
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

        if crop:
            img = img.crop((crop.x, crop.y, crop.x + crop.width, crop.y + crop.height))

        # Choose a new filename. Keep the old image hash because it's still the same image (!) and
        # we want to keep a consistent order in the thumbnails side panel (even if the image is now
        # quite different.)
        new_fname_prefix = f"{old_image_hash}_{img.width}x{img.height}"
        new_fname = choose_image_filename(
            self._img_dir,
            new_fname_prefix,
            remove_duplicates=False,
            i=old_i + 1,
        )

        # Save new image and delete the old one.
        new_img_path = self.img_path(new_fname)
        img.save(new_img_path)

        # Copy over any .txt file associated with the image.
        old_txt_path = old_img_path.with_suffix(".txt")
        if os.path.exists(old_txt_path):
            shutil.move(old_txt_path, new_img_path.with_suffix(".txt"))

        # Move any auto tags file.
        old_auto_txt_path = self.auto_tags_dir().joinpath(old_img_path.stem + ".txt")
        if os.path.exists(old_auto_txt_path):
            new_auto_txt_path = self.auto_tags_dir().joinpath(
                new_img_path.stem + ".txt"
            )
            shutil.move(old_auto_txt_path, new_auto_txt_path)

        self.delete_image(fname)
        return new_fname

    def duplicate_image(self, filename) -> Tuple[str, bool]:
        img_path = self.img_path(filename)
        if not os.path.exists(img_path):
            return "", False

        new_filename = choose_image_filename(
            self._img_dir,
            Path(filename).stem.rsplit("_", 1)[0],
            remove_duplicates=False,
        )
        img = Image.open(img_path)
        img.save(self.img_path(new_filename))

        # Copy across the .txt file if it exists.
        has_txt_file = False
        txt_path = img_path.with_suffix(".txt")
        if os.path.exists(txt_path):
            has_txt_file = True
            shutil.copy(txt_path, self.img_path(new_filename).with_suffix(".txt"))

        # Copy across the auto tags, if any.
        auto_txt_path = self.auto_tags_dir().joinpath(Path(filename).stem + ".txt")
        if os.path.exists(auto_txt_path):
            shutil.copy(
                auto_txt_path,
                self.auto_tags_dir().joinpath(new_filename).with_suffix(".txt"),
            )

        return new_filename, has_txt_file

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
                "percentComplete": round((i + 1) / len(files) * 33),
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
                "percentComplete": 33 + round(num_saved / num_candidates * 33),
                "totalFiles": len(files),
                "totalImages": num_candidates,
                "lastImg": new_filename,
            }

        # 3. Analyze the images and build the auto tags.
        for i, _ in enumerate(
            interrogate_directory(self._img_dir, self._auto_tags_dir)
        ):
            yield {
                "percentComplete": 66 + round(i / num_candidates * 33),
                "totalFiles": len(files),
                "totalImages": num_candidates,
            }
        yield {"percentComplete": 100}

        self._load()

    def _list_all_imgs(self) -> Tuple[list[str], list[str]]:
        # Return a tuple of (images, completed).

        imgs = []
        completed = []

        if not os.path.exists(self._img_dir):
            return [], []
        for f in os.listdir(self._img_dir):
            if f.endswith(IMG_EXT):
                imgs.append(f)
            elif (
                f.endswith(".txt")
                and os.path.getsize(os.path.join(self._img_dir, f)) > 0
            ):
                completed.append(f"{Path(f).stem}.{IMG_EXT}")
        return sorted(imgs), sorted(completed)

    def _load_tags_from_file(self, path: Path) -> list[str]:
        tags = []
        if os.path.exists(path):
            with open(path, "r") as fp:
                file_contents = fp.read()
                if not file_contents.strip():
                    return []
                tags = [tag.strip() for tag in file_contents.split(",")]
        return tags

    def _get_filtered_auto_tags(
        self, project_layout: list[TagCategory]
    ) -> list[TagInfo]:
        results = []
        auto_tag_candidates = [
            tag_info.to_dict() for tag_info in self._analyze_auto_tags()
        ]
        # Filter any auto tags that are already included in any category's list of tags.
        for tag_info in auto_tag_candidates:
            tag = tag_info["tag"]
            if not any(tag in category.tags for category in project_layout):
                results.append(tag_info)
        return results

    def _get_all_auto_tags(self) -> dict[str, int]:
        tags: dict[str, int] = {}

        if not os.path.exists(self._auto_tags_dir):
            return tags

        for f in os.listdir(self._auto_tags_dir):
            if not f.endswith(".txt"):
                continue
            with open(os.path.join(self._auto_tags_dir, f), "r") as fp:
                for tag in fp.read().split(","):
                    tag = tag.strip()
                    if not tag:
                        continue
                    tags[tag] = tags.get(tag, 0) + 1
        return tags

    def _analyze_auto_tags(self) -> list[TagInfo]:
        tags = self._get_all_auto_tags()
        if not tags:
            return []

        # Remove any tags with ( or ) in them.
        tags = {k: v for k, v in tags.items() if "(" not in k and ")" not in k}

        # Compress common suffixes to fill in tags, i.e. red head scarf -> {type} head scarf
        suffixes = common_suffixes(tags)
        tags_copy = tags.copy()
        fill_in_examples = {}
        for tag, count in tags_copy.items():
            for ngram in suffixes.keys():
                # Here's a tag we can compress...
                if tag.endswith(f" {ngram}"):
                    fill_in = "{type} " + ngram
                    tags[fill_in] = tags.get(fill_in, 0) + count
                    fill_in_examples[fill_in] = fill_in_examples.get(fill_in, []) + [
                        tag
                    ]
                    if tag in tags:
                        del tags[tag]
                # Remove the extact match too, because it's covered by the fill in.
                if tag == ngram and tag in tags:
                    del tags[tag]

        # Remove any with 1 count.
        tags = {k: v for k, v in tags.items() if v > 1}

        # Find the median count.
        counts = list(tags.values())
        median = sorted(counts)[len(counts) // 2]

        # Remove any tags with count < median.
        tags = {k: v for k, v in tags.items() if v >= median}

        # Sort by count.
        results = sorted(tags.items(), key=lambda x: x[1], reverse=True)

        # Add in the examples.
        results_with_examples: list[TagInfo] = []
        for tag, count in results:
            examples = fill_in_examples.get(tag, [])
            results_with_examples.append(
                TagInfo(tag=tag, count=count, examples=examples)
            )
        return results_with_examples

    @staticmethod
    def is_valid_name(name: str) -> Tuple[bool, str]:
        if not name.strip():
            return False, "A directory name is required"
        if not all(c.isalnum() or c in (".", "_", "-") for c in name):
            return (
                False,
                "Only alphanumeric characters, underscores, and hyphens allowed",
            )
        if os.path.exists(os.path.join(PROJECTS_DIR, name)):
            return False, "A project with this name already exists"
        return True, ""

    @staticmethod
    def list_all_projects(projects_dir_override: str | None = None) -> list[str]:
        projects_dir = projects_dir_override if projects_dir_override else PROJECTS_DIR
        if not os.path.exists(projects_dir):
            return []
        # Order by most recently modified config.json file.
        return sorted(
            os.listdir(projects_dir),
            key=lambda x: (
                os.path.getmtime(os.path.join(projects_dir, x, PROJECT_CONFIG_FILE))
                if os.path.exists(os.path.join(projects_dir, x, PROJECT_CONFIG_FILE))
                else 0
            ),
            reverse=True,
        )
