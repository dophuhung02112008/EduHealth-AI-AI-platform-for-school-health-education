import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Thiếu GOOGLE_API_KEY trên Vercel.' });
  }

  try {
    const { text, userRole } = req.body ?? {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Thiếu nội dung tin nhắn.' });
    }

    const prompt = `
Bạn là EduHealth AI, trợ lý hỗ trợ giáo dục sức khỏe học đường bằng tiếng Việt.

Vai trò người dùng hiện tại: ${userRole || 'Chưa xác định'}.

Nguyên tắc:
- Trả lời ngắn gọn, rõ ràng, thân thiện.
- Không khẳng định chẩn đoán chắc chắn.
- Nếu có dấu hiệu nặng, khuyên đi cơ sở y tế.
- Không bịa thông tin.
- Tập trung vào sức khỏe học đường, phụ huynh, học sinh.

Tin nhắn người dùng:
${text}
`.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply =
      response.text?.trim() ||
      'Mình chưa có thông tin phù hợp. Bạn có thể mô tả rõ hơn triệu chứng hoặc tình huống nhé.';

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('CHAT API ERROR:', error);
    return res.status(500).json({
      error: error?.message || 'Lỗi server chatbot.',
    });
  }
}
