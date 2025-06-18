import axios from 'axios';

export const processVideo = async (videoUrl: string) => {
  const token = localStorage.getItem('edusummarize_token');

  const response = await axios.post('/api/process', {
    video_url: videoUrl,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const { transcript, summary } = response.data;

  // ✅ Store in localStorage
  localStorage.setItem('video_url', videoUrl);
  localStorage.setItem('transcript', transcript);
  localStorage.setItem('summary', summary);

  return response.data;
};



export const getUserHistory = async () => {
  const token = localStorage.getItem('edusummarize_token');
  const response = await fetch('/api/history', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
};



export const getSummaryDetail = async (videoUrl: string) => {
  const token = localStorage.getItem('edusummarize_token');
  const res = await fetch(`/api/history/detail?video_url=${encodeURIComponent(videoUrl)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch video summary');

  return await res.json();
};
