'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Save, Pencil } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { getAuth } from 'firebase/auth';
import { getSummaryDetail } from '@/lib/api';

export default function DetailsPage() {
  const searchParams = useSearchParams();
  const videoUrl = searchParams.get('video_url') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [summarySearch, setSummarySearch] = useState('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const videoId = extractYouTubeId(videoUrl);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getSummaryDetail(videoUrl);
        setData(result);
        setNotes(result?.notes || '');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (videoUrl) fetchData();
  }, [videoUrl]);

  const getSafeDocId = async (url: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(url);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSaveNotes = async () => {
    const docId = await getSafeDocId(videoUrl);
    const auth = getAuth();
    const uid = auth.currentUser?.uid;

    if (!uid || !docId) {
      alert('Missing user session or video ID');
      return;
    }

    try {
      const docRef = doc(firestore, 'users', uid, 'history', docId);
      await setDoc(docRef, { notes }, { merge: true });
      alert('Notes saved successfully!');
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes. See console.');
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 1500);
  };

  const seekToTime = (timestamp: string) => {
    const [min, sec] = timestamp.split(':').map(Number);
    const time = min * 60 + sec;
    if (iframeRef.current?.src.includes('youtube.com')) {
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [time, true],
        }),
        '*'
      );
    }
  };

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">{part}</mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const renderTranscriptPoints = () => {
    const blocks: { time: string; content: string }[] = [];
    let currentBlock: { time: string; content: string } | null = null;

    data.transcript.split('\n').forEach((line: String) => {
      const match = line.match(/^\[(\d{2}:\d{2})\](.*)/);
      if (match) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { time: match[1], content: match[2].trim() };
      } else if (currentBlock) {
        currentBlock.content += ' ' + line.trim();
      }
    });
    if (currentBlock) blocks.push(currentBlock);

    return blocks.map((block, i) => (
      <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
        <button
          onClick={() => seekToTime(block.time)}
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline mr-2"
        >
          [{block.time}]
        </button>
        <span>{highlightText(block.content, transcriptSearch)}</span>
      </li>
    ));
  };

  const renderSummaryPoints = () => {
    const blocks: { time: string; content: string }[] = [];

    data.summary.split('\n').forEach((line: String) => {
      const match = line.match(/^\- \*\*\[(\d{2}:\d{2})\]\*\* (.*)/);
      if (match) {
        blocks.push({ time: match[1], content: match[2].trim() });
      }
    });

    return blocks.map((block, i) => (
      <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
        <button
          onClick={() => seekToTime(block.time)}
          className="text-blue-600 dark:text-blue-400 font-medium hover:underline mr-2"
        >
          [{block.time}]
        </button>
        <span>{highlightText(block.content, summarySearch)}</span>
      </li>
    ));
  };

  if (loading) return <div className="p-8 text-gray-700 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="bg-gray-50 dark:bg-gray-900 py-12 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {videoUrl && (
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow">
            <iframe
              ref={iframeRef}
              className="w-full h-96"
              src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Transcript */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Transcript</h2>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleDownload(data.transcript, 'transcript.txt')} className="flex items-center bg-blue-600 text-white text-xs">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button onClick={() => handleCopy(data.transcript, 'transcript')} className="flex items-center bg-green-600 text-white text-xs">
                <Save className="mr-2 h-4 w-4" /> {copied === 'transcript' ? 'Copied' : 'Copy'}
              </Button>
              <div className="flex items-center bg-gray-700 px-2 py-1 rounded-md">
                <Pencil className="text-white h-4 w-4 mr-2" />
                <input
                  placeholder="Search"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-300 focus:outline-none text-sm w-32"
                />
              </div>
            </div>
          </div>
          <ul className={`list-disc pl-5 space-y-4 transition-all duration-300 ${showFullTranscript ? '' : 'max-h-60 overflow-hidden'}`}>
            {renderTranscriptPoints()}
          </ul>
          {data.transcript.length > 300 && (
            <button
              onClick={() => setShowFullTranscript(prev => !prev)}
              className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            >
              {showFullTranscript ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Lecture Summary</h2>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleDownload(data.summary, 'summary.txt')} className="flex items-center bg-blue-600 text-white text-xs">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button onClick={() => handleCopy(data.summary, 'summary')} className="flex items-center bg-green-600 text-white text-xs">
                <Save className="mr-2 h-4 w-4" /> {copied === 'summary' ? 'Copied' : 'Copy'}
              </Button>
              <div className="flex items-center bg-gray-700 px-2 py-1 rounded-md">
                <Pencil className="text-white h-4 w-4 mr-2" />
                <input
                  placeholder="Search"
                  value={summarySearch}
                  onChange={(e) => setSummarySearch(e.target.value)}
                  className="bg-gray-700 text-white placeholder-gray-300 focus:outline-none text-sm w-32"
                />
              </div>
            </div>
          </div>
          <ul className={`list-disc pl-5 space-y-4 transition-all duration-300 ${showFullSummary ? '' : 'max-h-48 overflow-hidden'}`}>
            {renderSummaryPoints()}
          </ul>
          {data.summary.length > 200 && (
            <button
              onClick={() => setShowFullSummary(prev => !prev)}
              className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            >
              {showFullSummary ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h2>
            <Button onClick={handleSaveNotes} className="flex items-center bg-blue-600 text-white text-xs">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[150px] bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded p-3 focus:outline-none resize-vertical"
            placeholder="Start typing your notes here..."
          />
        </div>
      </div>
    </main>
  );
}

function extractYouTubeId(url: string) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regex);
  return match ? match[1] : '';
}
