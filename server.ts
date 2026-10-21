import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// API Route for OCR Marksheet Photo processing with confidence and review cells
app.post('/api/ocr-marksheet', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!ai) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY in secrets.' 
      });
    }

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
    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('OCR Error:', error);
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
    console.log(`Campannetsmart server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
