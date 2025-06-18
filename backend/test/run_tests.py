import unittest

if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.discover('.', pattern="test_*.py")  # Discover tests in current dir

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if not result.wasSuccessful():
        exit(1)
