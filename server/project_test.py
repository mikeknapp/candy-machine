import os
import tempfile
import unittest

import imagehash
from image import Crop
from PIL import Image, ImageDraw
from project import Project


class TestProject(unittest.TestCase):
    def setUp(self):
        # Temp working directory.
        self.temp_project_dir = tempfile.TemporaryDirectory()
        self.temp_project_dir_path = self.temp_project_dir.name

        self.project_name = "test_project"
        p, _ = Project.create_new_project(
            self.project_name,
            working_dir=self.temp_project_dir_path,
        )
        assert p is not None
        self.project: Project = p

    def tearDown(self):
        self.temp_project_dir.cleanup()

    def test_init(self):
        self.assertEqual(self.project.name, self.project_name)
        self.assertTrue(os.path.exists(self.project._base_dir))
        self.assertTrue(os.path.exists(self.project._img_dir))

    def test_is_valid_name(self):
        self.assertEqual(
            self.project.is_valid_name(""), (False, "A directory name is required")
        )
        self.assertEqual(self.project.is_valid_name("test_project2"), (True, ""))
        self.assertEqual(
            self.project.is_valid_name("test/project"),
            (False, "Only alphanumeric characters, underscores, and hyphens allowed"),
        )

    def test_list_all(self):
        self.assertIn(
            self.project_name, Project.list_all_projects(self.temp_project_dir_path)
        )


class TestImportImages(unittest.TestCase):
    def setUp(self):
        # Temp import directory.
        self.temp_dir = tempfile.TemporaryDirectory()
        self.temp_dir_path = self.temp_dir.name

        # Temp project directory.
        self.temp_project_dir = tempfile.TemporaryDirectory()
        self.temp_project_dir_path = self.temp_project_dir.name

        self.image_file1 = os.path.join(self.temp_dir_path, "test1.jpg")
        self.image_file2 = os.path.join(self.temp_dir_path, "test2.jpg")
        img = Image.new("RGB", (60, 30), color=(73, 109, 137))
        img.save(self.image_file1)
        img.save(self.image_file2)

        self.maxDiff = None

    def tearDown(self):
        self.temp_dir.cleanup()
        self.temp_project_dir.cleanup()

    def test_import_images(self):
        project, _ = Project.create_new_project(
            "import_test",
            working_dir=self.temp_project_dir_path,
        )
        assert project != None

        # Test importing images without removing duplicates
        import_gen = project.import_images(self.temp_dir_path, remove_duplicates=False)
        import_status = list(import_gen)

        # Check that the import status is as expected
        self.assertEqual(
            import_status,
            [
                {"percentComplete": 25, "totalFiles": 2},
                {"percentComplete": 50, "totalFiles": 2},
                {
                    "percentComplete": 75,
                    "totalFiles": 2,
                    "totalImages": 2,
                    "lastImg": "0000000000000000_60x30_0.png",
                },
                {
                    "percentComplete": 100,
                    "totalFiles": 2,
                    "totalImages": 2,
                    "lastImg": "0000000000000000_60x30_1.png",
                },
            ],
        )

        # Test importing images with removing duplicates
        import_gen = project.import_images(self.temp_dir_path, remove_duplicates=True)
        import_status = list(import_gen)

        # Check that the import status is as expected
        self.assertEqual(
            import_status,
            [
                {"percentComplete": 25, "totalFiles": 2},
                {"percentComplete": 50, "totalFiles": 2},
                {
                    "percentComplete": 100,
                    "totalFiles": 2,
                    "totalImages": 1,
                    "lastImg": "0000000000000000_60x30_0.png",
                },
            ],
        )


class TestEditImage(unittest.TestCase):
    def setUp(self):
        # Temp working directory.
        self.temp_project_dir = tempfile.TemporaryDirectory()
        self.temp_project_dir_path = self.temp_project_dir.name

        self.project_name = "edit_image"
        p, _ = Project.create_new_project(
            self.project_name,
            working_dir=self.temp_project_dir_path,
        )
        assert p is not None
        self.project: Project = p

        # Create a test image with a red rectangle in the top left corner.
        self.img = Image.new("RGB", (100, 100), color="white")
        draw = ImageDraw.Draw(self.img)
        draw.rectangle((0, 0, 50, 50), fill="red")

        self.hash = imagehash.average_hash(self.img)
        self.fname_prefix = f"{self.hash}_100x100"
        self.fname = self.fname_prefix + "_0.png"
        self.img.save(self.project.img_path(self.fname))

        # Create a fake keywords file.
        self.old_kws_file = self.project.img_path(self.fname_prefix + "_0.txt")
        with open(self.old_kws_file, "w") as f:
            f.write("test, image")

        self.new_kw_fname = self.project.img_path(self.fname_prefix + "_1.txt")

    def tearDown(self):
        # Check that the old keywords file has gone, and the new one is present.
        self.assertFalse(os.path.exists(self.old_kws_file))
        self.assertTrue(os.path.exists(self.new_kw_fname))

        # Check the file is the same
        with open(self.new_kw_fname, "r") as f:
            self.assertEqual(f.read(), "test, image")

        self.temp_project_dir.cleanup()

    def test_rotate(self):
        # Test rotation.
        output_img_name = self.project.edit_image(self.fname, 90, False, None)
        self.assertEqual(output_img_name, f"{self.fname_prefix}_1.png")

        # Check that the top right corner is red (indicating a 90 degree rotation).
        output_img = Image.open(self.project.img_path(output_img_name))
        self.assertEqual(output_img.getpixel((99, 0)), (255, 0, 0))
        output_img.close()

    def test_flip(self):
        # Test flipping.
        output_img_name = self.project.edit_image(self.fname, 90, False, None)
        self.assertEqual(output_img_name, f"{self.fname_prefix}_1.png")

        # Check that the top right corner is red (indicating a flip).
        output_img = Image.open(self.project.img_path(output_img_name))
        self.assertEqual(output_img.getpixel((99, 0)), (255, 0, 0))
        output_img.close()

    def test_crop(self):
        # Test cropping.
        expected_prefix = f"{self.hash}_50x50"
        output_img_name = self.project.edit_image(
            self.fname, 0, False, Crop(0, 0, 50, 50)
        )
        self.assertEqual(output_img_name, f"{expected_prefix}_0.png")

        # Check that the image size is as expected.
        output_img = Image.open(self.project.img_path(output_img_name))
        self.assertEqual(output_img.size, (50, 50))
        output_img.close()

        self.new_kw_fname = self.project.img_path(f"{self.hash}_50x50_0.txt")


if __name__ == "__main__":
    unittest.main()
