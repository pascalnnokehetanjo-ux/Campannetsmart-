import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Simple in-memory rate limiter store for production hardening
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(ip, record);
  } else {
    record.count++;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      console.warn(`[RATE_LIMIT_EXCEEDED] IP: ${ip} exceeded rate limit.`);
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
  }
  next();
});

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Secure Server-Side OCR Endpoint
app.post('/api/ocr-marksheet', async (req, res) => {
  const startTime = Date.now();
  const requestId = `OCR_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      console.warn(`[${requestId}] OCR Error: No image data provided`);
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!ai) {
      console.error(`[${requestId}] OCR Error: Gemini API key not configured on server`);
      return res.status(500).json({ 
        error: 'Gemini API key not configured on server. Please set GEMINI_API_KEY.' 
      });
    }

    console.log(`[${requestId}] Starting OCR processing. MIME: ${mimeType || 'image/jpeg'}`);

    const imagePart = {
      inlineData: {
        data: image,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const prompt = `You are an expert educational OCR engine for bilingual primary schools following the 2018 Official Curriculum (Cameroon / Bilingual Education).
Analyze this merged marksheet photo and extract structured student scores for the 6 official competences and 10 subjects/sub-competences:
- 1A (Communicate in English, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 1B (Communicate in French, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 1C (Communicate in National Language, maxOral:6, maxWritten:8, maxPractical:4, maxAttitude:2)
- 2A (Mathematics, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 2B (Science & Tech, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 3A (Social Values, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 3B (Citizenship Values, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 4A (Vocational Studies, maxOral:4, maxWritten:8, maxPractical:6, maxAttitude:2)
- 4B (Autonomy & Initiative, maxOral:5, maxWritten:8, maxPractical:5, maxAttitude:2)
- 5 (ICT, maxOral:5, maxWritten:10, maxPractical:3, maxAttitude:2)
- 6A1 (Physical & Sports Non-challenged, maxOral:4, maxWritten:4, maxPractical:10, maxAttitude:2)
- 6B (Artistic Activities, maxOral:4, maxWritten:6, maxPractical:8, maxAttitude:2)

For each student found in the marksheet, return a JSON object with studentName, studentId, confidence (0.0 to 1.0), and scores mapping each subject code to evaluation types (oral, written, practical, attitude). Each evaluation type must contain:
- value (number)
- max (number)
- confidence (number 0.0 to 1.0)
- rawOcrText (string)
- status ("pending")

Return ONLY valid JSON in this exact format:
{
  "className": "Primary 5 Bilingual",
  "term": "Term 1 / Trimestre 1",
  "month": "October / Octobre",
  "batchId": "BATCH_${Date.now()}",
  "students": [
    {
      "studentId": "ST_OCR_1",
      "studentName": "Amina Bello Njoya",
      "confidence": 0.95,
      "scores": {
        "1A": {
          "oral": { "value": 4, "max": 5, "confidence": 0.96, "rawOcrText": "4/5", "status": "pending" },
          "written": { "value": 9, "max": 10, "confidence": 0.94, "rawOcrText": "9/10", "status": "pending" },
          "practical": { "value": 2, "max": 3, "confidence": 0.92, "rawOcrText": "2/3", "status": "pending" },
          "attitude": { "value": 2, "max": 2, "confidence": 0.99, "rawOcrText": "2/2", "status": "pending" }
        }
      }
    }
  ]
}
Ensure valid JSON output without any markdown error.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, imagePart],
    });

    const text = response.text || '';
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsedData = JSON.parse(jsonStr);
    console.log(`[${requestId}] OCR Success in ${Date.now() - startTime}ms. Extracted ${parsedData.students?.length || 0} students.`);
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error(`[${requestId}] OCR Failure:`, error);
    res.status(500).json({ error: error.message || 'Failed to process marksheet photo' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campannetsmart production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
