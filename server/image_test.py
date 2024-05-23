import os
import tempfile
import unittest

from image import (
    choose_image_filename,
    is_supported_image,
    valid_images_for_import,
    valid_import_directory,
)


class TestImageFunctions(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_dir_path = self.temp_dir.name
        self.supported_file = os.path.join(self.temp_dir_path, "test.jpg")
        self.unsupported_file = os.path.join(self.temp_dir_path, "test.txt")
        with open(self.supported_file, "w") as f:
            f.write("test")
        with open(self.unsupported_file, "w") as f:
            f.write("test")

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_is_supported_image(self):
        self.assertTrue(is_supported_image(self.supported_file))
        self.assertFalse(is_supported_image(self.unsupported_file))

    def test_valid_images_for_import(self):
        self.assertEqual(valid_images_for_import(self.temp_dir_path), ["test.jpg"])

    def test_valid_import_directory(self):
        # Valid directory.
        self.assertTrue(valid_import_directory(self.temp_dir_path))

        # No images.
        os.remove(self.supported_file)
        self.assertFalse(valid_import_directory(self.temp_dir_path))

        # Invalid path.
        self.assertFalse(valid_images_for_import("fake/path"))

    def test_choose_image_filename(self):
        # Remove duplicates.
        filename = choose_image_filename(self.temp_dir_path, "prefix", 0, True)
        self.assertEqual(filename, "prefix_0.png")

        # Test with a real duplicate file.
        open(os.path.join(self.temp_dir_path, filename), "w").close()
        filename = choose_image_filename(self.temp_dir_path, "prefix", 0, True)
        self.assertEqual(filename, "prefix_0.png")

        # Test the i get incremented if remove_duplicates is False.
        filename = choose_image_filename(self.temp_dir_path, "prefix", 0, False)
        self.assertEqual(filename, "prefix_1.png")


if __name__ == "__main__":
    unittest.main()
