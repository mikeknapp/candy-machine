import os
import tempfile
import unittest

from PIL import Image
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


if __name__ == "__main__":
    unittest.main()

if __name__ == "__main__":
    unittest.main()
