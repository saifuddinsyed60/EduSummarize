import unittest
from pydantic import ValidationError
from app.schemas import ProcessRequest

class TestSchemas(unittest.TestCase):

    def test_valid_request(self):
        model = ProcessRequest(video_url="http://example.com")
        self.assertEqual(str(model.video_url), "http://example.com/")


    def test_invalid_request(self):
        with self.assertRaises(ValidationError):
            ProcessRequest(video_url="not_a_url")
