import os
import unittest


def run_all_tests():
    current_directory = os.path.dirname(os.path.realpath(__file__))
    test_suite = unittest.TestSuite()

    for root, _, files in os.walk(current_directory):
        for file in files:
            if file.endswith("_test.py"):
                tests = unittest.defaultTestLoader.discover(root, pattern=file)
                test_suite.addTests(tests)

    runner = unittest.TextTestRunner()
    runner.run(test_suite)


if __name__ == "__main__":
    run_all_tests()
