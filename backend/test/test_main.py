import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestMainEndpoint(unittest.TestCase):

    @patch("app.main.download_audio", return_value="test.mp3")
    @patch("app.main.transcribe_with_markers", return_value="Transcript here")
    @patch("app.main.summarize", return_value="Summary here")
    def test_process_video_success(self, mock_sum, mock_trans, mock_dl):
        response = client.post("/process", json={"video_url": "http://example.com/video"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "transcript": "Transcript here",
            "summary": "Summary here"
        })

    def test_process_video_invalid_url(self):
        response = client.post("/process", json={"video_url": "not_a_url"})
        self.assertEqual(response.status_code, 422)

    @patch("app.main.download_audio")
    def test_process_video_download_error(self, mock_download):
        mock_download.side_effect = Exception("Download failed")
        response = client.post("/process", json={"video_url": "http://example.com/video"})
        self.assertEqual(response.status_code, 500)
        self.assertIn("Download failed", response.json()["detail"])

    @patch("app.main.download_audio", return_value="test.mp3")
    @patch("app.main.transcribe_with_markers")
    def test_process_video_transcribe_error(self, mock_transcribe, mock_download):
        mock_transcribe.side_effect = Exception("Transcription failed")
        response = client.post("/process", json={"video_url": "http://example.com/video"})
        self.assertEqual(response.status_code, 500)
        self.assertIn("Transcription failed", response.json()["detail"])

    @patch("app.main.download_audio", return_value="test.mp3")
    @patch("app.main.transcribe_with_markers", return_value="Transcript here")
    @patch("app.main.summarize")
    def test_process_video_summarize_error(self, mock_summarize, mock_transcribe, mock_download):
        mock_summarize.side_effect = Exception("Summarization failed")
        response = client.post("/process", json={"video_url": "http://example.com/video"})
        self.assertEqual(response.status_code, 500)
        self.assertIn("Summarization failed", response.json()["detail"])
