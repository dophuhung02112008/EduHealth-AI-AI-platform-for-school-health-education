import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

function extractBase64Data(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Thiếu GOOGLE_API_KEY trên Vercel.' });
  }

  try {
    const { inputText, imageBase64 } = req.body ?? {};

    if (!inputText && !imageBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu mô tả hoặc ảnh.' });
    }

    const parts: any[] = [];

    const instruction = `
Bạn là AI hỗ trợ sàng lọc sức khỏe học đường bằng tiếng Việt.
Nhiệm vụ:
- Không chẩn đoán chắc chắn.
- Chỉ đưa ra đánh giá sàng lọc ban đầu.
- Nếu có dấu hiệu nguy hiểm, ưu tiên mức URGENT_DOCTOR.
- Trả về JSON hợp lệ, không markdown, không giải thích ngoài JSON.

Schema JSON bắt buộc:
{
  "title": "string",
  "category": "string",
  "analysis": ["string", "string", "string"],
  "urgency": "HOME_MONITOR | SEE_SCHOOL_HEALTH | URGENT_DOCTOR",
  "dangerSigns": ["string", "string"],
  "safetyAdvice": ["string", "string", "string"]
}

Quy ước urgency:
- HOME_MONITOR
- SEE_SCHOOL_HEALTH
- URGENT_DOCTOR
`.trim();

    parts.push({ text: instruction });

    if (inputText) {
      parts.push({
        text: `Mô tả người dùng: ${inputText}`,
      });
    }

    if (imageBase64) {
      const parsed = extractBase64Data(imageBase64);
      if (parsed) {
        parts.push({
          inlineData: {
            mimeType: parsed.mimeType,
            data: parsed.data,
          },
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts }],
    });

    const raw = response.text?.trim() || '';

    let cleaned = raw;
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('ANALYZE SKIN API ERROR:', error);
    return res.status(500).json({
      error: error?.message || 'Lỗi server analyze-skin.',
    });
  }
}
