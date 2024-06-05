import os

PROJECTS_DIR = os.path.join(os.path.dirname(__file__), "..", "projects")
IMGS_DIR = "imgs"
IMG_EXT = "png"
AUTO_TAGS = "auto_tags"
PROJECT_CATEGORY_FILE = "categories.json"
DEFAULT_CATEGORY_FILE = "default_categories.json"
PROJECT_CONFIG_FILE = "config.json"
SUPPORTED_IMG_EXTS = ["png", "jpg", "jpeg", "gif", "bmp", "webp"]
LOWERCASE_IS_TRUE = ["true", "1", "yes", "t", "y", True]
SUPPRESSED_AUTO_TAGS = [
    "realistic",
]
