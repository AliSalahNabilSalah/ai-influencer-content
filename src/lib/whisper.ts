import OpenAI from 'openai';
import https from 'https';
import http from 'http';
import { Readable } from 'stream';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeVideoUrl(videoUrl: string): Promise<string> {
  if (!videoUrl) return '';

  try {
    // Download video stream and pass to Whisper
    const audioStream = await downloadStream(videoUrl);

    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      response_format: 'text',
    });

    return typeof transcription === 'string' ? transcription : '';
  } catch (err) {
    console.error('Whisper transcription error:', err);
    return '';
  }
}

function downloadStream(url: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const blob = new Blob([buffer], { type: 'audio/mp4' });
        const file = new File([blob], 'video.mp4', { type: 'audio/mp4' });
        resolve(file);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

export async function transcribePosts(
  posts: { videoUrl?: string; caption?: string; type: string }[]
): Promise<string[]> {
  const results: string[] = [];

  for (const post of posts) {
    if (post.type === 'video' && post.videoUrl) {
      const transcript = await transcribeVideoUrl(post.videoUrl);
      results.push(transcript || post.caption || '');
    } else {
      results.push(post.caption || '');
    }
  }

  return results;
}
