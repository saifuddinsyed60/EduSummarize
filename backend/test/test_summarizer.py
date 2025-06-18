import unittest
from unittest.mock import patch, MagicMock
from app.services.summarizer import summarize

class TestSummarizer(unittest.TestCase):

    @patch("app.services.summarizer._client")
    def test_summarize_text(self, mock_client):
        mock_response = MagicMock()
        mock_response.text = "- [00:00] Hello\n- [01:00] Summary"
        mock_client.models.generate_content.return_value = mock_response

        transcript = "[00:00] Hello\n[01:00] This is content"
        result = summarize(transcript)
        self.assertIn("[00:00]", result)
        self.assertIn("[01:00]", result)
