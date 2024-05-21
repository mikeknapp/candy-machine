import os
import unittest

from project import Project


class TestProject(unittest.TestCase):
    def setUp(self):
        self.project_name = "test_project"
        Project.create_new_project(self.project_name)
        self.project = Project(self.project_name)

    def tearDown(self):
        self.project.delete()

    def test_init(self):
        self.assertEqual(self.project.name, self.project_name)
        self.assertTrue(os.path.exists(self.project._base_path))
        self.assertTrue(os.path.exists(self.project._img_path))

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
        self.assertIn(self.project_name, Project.list_all_projects())


if __name__ == "__main__":
    unittest.main()
