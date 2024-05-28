import os
import unittest

from .run import interrogate_directory

EXPECTED_TAGS = {
    "apple.txt": "fruit, food, apple, food focus, no humans, realistic, still life, blurry, simple background, close-up",
    "teeth.txt": "solo, open mouth, teeth, close-up, tongue, realistic, lips, nose, male focus",
}


class TestInterrogateDirectory(unittest.TestCase):

    def setUp(self):
        self.img_path = os.path.join(os.path.dirname(__file__), "images")
        self.clean_txt_files()

    def tearDown(self):
        self.clean_txt_files()

    def clean_txt_files(self):
        # Remove all the .txt files in the directory
        for f in os.listdir(self.img_path):
            if f.endswith(".txt"):
                os.remove(os.path.join(self.img_path, f))

    def test_interrogate_directory(self):
        interrogate_directory(self.img_path, self.img_path)

        # Check if the correct .txt files were created.
        for f, tags in EXPECTED_TAGS.items():
            with open(os.path.join(self.img_path, f), "r") as filen:
                self.assertEqual(filen.read(), tags)


if __name__ == "__main__":
    unittest.main()
