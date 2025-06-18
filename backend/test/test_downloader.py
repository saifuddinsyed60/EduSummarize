import unittest
from unittest.mock import patch, MagicMock
from app.services.downloader import download_audio
from yt_dlp.utils import DownloadError



class TestDownloader(unittest.TestCase):

    @patch("app.services.downloader.settings")
    @patch("app.services.downloader.YoutubeDL")
    def test_download_audio_success(self, mock_ytdl, mock_settings):
        mock_settings.download_dir = "test_dir"
        mock_settings.audio_format = "mp3"

        # Mock YoutubeDL context manager
        ydl_instance = MagicMock()
        ydl_instance.extract_info.return_value = {'id': 'abc123', 'ext': 'webm'}
        ydl_instance.prepare_filename.return_value = "test_dir/abc123.webm"
        mock_ytdl.return_value.__enter__.return_value = ydl_instance

        result = download_audio("http://example.com/video")
        self.assertEqual(result, "test_dir/abc123.mp3")

    @patch("app.services.downloader.YoutubeDL")
    def test_download_audio_failure(self, mock_ytdl):
        # Simulate DownloadError from YoutubeDL context manager
        mock_ytdl.return_value.__enter__.side_effect = DownloadError("Download failed")

        with self.assertRaises(RuntimeError) as context:
            download_audio("http://badurl.com")

        self.assertIn("Download failed", str(context.exception))
