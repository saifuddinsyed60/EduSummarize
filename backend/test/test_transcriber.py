import unittest
from unittest.mock import patch
from app.services.transcriber import transcribe_with_markers

class TestTranscriber(unittest.TestCase):

    @patch("app.services.transcriber._whisper_model")
    def test_transcription_with_markers(self, mock_model):
        mock_model.transcribe.return_value = {
            "segments": [
                {"start": 0, "text": "Hello"},
                {"start": 65, "text": "World"},
                {"start": 130, "text": "Again"},
            ]
        }
        result = transcribe_with_markers("audio.mp3")
        expected = "[00:00]\nHello\n[01:00]\nWorld\n[02:00]\nAgain"
        self.assertEqual(result, expected)
