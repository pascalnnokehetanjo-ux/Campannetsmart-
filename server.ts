import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini API if key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// API Route for OCR Marksheet Photo processing
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

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        data: image,
        mimeType: mimeType || 'image/jpeg'
      }
    };

    const prompt = `You are an expert educational OCR engine for bilingual primary schools following the 2018 Official Curriculum (Cameroon / Bilingual Education).
Analyze this marksheet photo and extract structured student scores for the 6 official competences and 10 subjects/sub-competences:
- Competence 1: English (1A), French (1B), National Language (1C)
- Competence 2: Mathematics (2A), Science & Technology (2B)
- Competence 3: Social Values (3A), Citizenship Values (3B)
- Competence 4: Vocational Studies (4A), Entrepreneurship/Initiative (4B)
- Competence 5: ICT (5)
- Competence 6: Physical & Sports (6A1 or 6A2), Artistic Activities (6B)

For each student found in the marksheet, return a JSON object with:
- studentName (string)
- studentId (string)
- scores: an object mapping subject codes (e.g. "1A", "1B", "2A", "3A", "3B", "4A", "4B", "5", "6A1", "6B") to an object of evaluation types: { oral: number, written: number, practical: number, attitude: number }.

Return ONLY valid JSON in the following format:
{
  "className": "Primary 5 Bilingual",
  "term": "Term 1",
  "month": "October",
  "students": [
    {
      "studentName": "Amina Bello",
      "studentId": "ST001",
      "scores": {
        "1A": { "oral": 16, "written": 15, "practical": 17, "attitude": 18 },
        "1B": { "oral": 14, "written": 13, "practical": 15, "attitude": 16 },
        "2A": { "oral": 18, "written": 19, "practical": 17, "attitude": 18 },
        "2B": { "oral": 15, "written": 14, "practical": 16, "attitude": 17 },
        "3A": { "oral": 17, "written": 16, "practical": 18, "attitude": 19 },
        "3B": { "oral": 16, "written": 15, "practical": 17, "attitude": 18 },
        "4A": { "oral": 15, "written": 14, "practical": 16, "attitude": 17 },
        "4B": { "oral": 16, "written": 15, "practical": 17, "attitude": 18 },
        "5": { "oral": 18, "written": 17, "practical": 19, "attitude": 19 },
        "6A1": { "oral": 17, "written": 16, "practical": 18, "attitude": 18 },
        "6B": { "oral": 18, "written": 17, "practical": 19, "attitude": 19 }
      }
    }
  ]
}
If any score is missing, estimate a reasonable realistic sample score or 0. Ensure valid JSON output.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, imagePart],
    });

    const text = response.text || '';
    // Extract JSON from response if wrapped in markdown code blocks
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
