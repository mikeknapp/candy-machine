import unittest

from tags import common_suffixes


class TestCommonSuffixes(unittest.TestCase):
    def test_common_suffixes(self):
        # Test with some sample data
        tags = {
            "red head scarf": 3,
            "blue head scarf": 2,
            "yellow head scarf": 2,
            "orange head scarf": 1,
            "green head scarf": 1,
            "polka dot head scarf": 1,
            "wide angle": 3,
            "big angle": 3,
            "wider angle": 3,
            "closeup angle": 2,
            "narrow angle": 1,
            "unique tag": 1,
            "another": 1,
            "one more": 1,
            "yet another": 1,
        }
        expected_suffixes = {"head scarf": 6, "angle": 5}
        self.assertEqual(common_suffixes(tags), expected_suffixes)

    def test_common_suffixes_single_word(self):
        # Test with single word tags
        tags = {"apple": 3, "banana": 2, "cherry": 2}
        expected_suffixes = {}
        self.assertEqual(common_suffixes(tags), expected_suffixes)

    def test_common_suffixes_empty(self):
        # Test with an empty dictionary
        tags = {}
        expected_suffixes = {}
        self.assertEqual(common_suffixes(tags), expected_suffixes)


if __name__ == "__main__":
    unittest.main()
