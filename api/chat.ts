import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, userRole } = req.body ?? {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'Thiếu nội dung tin nhắn.' });
    }

    const response = await client.responses.create({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'system',
          content: `
Bạn là EduHealth AI, trợ lý tư vấn sức khỏe học đường bằng tiếng Việt.
Nguyên tắc:
- Trả lời dễ hiểu, ngắn gọn, thân thiện.
- Không khẳng định chẩn đoán chắc chắn.
- Nếu có dấu hiệu nặng thì khuyên đi cơ sở y tế.
- Vai trò người dùng hiện tại: ${userRole || 'Chưa xác định'}.
          `.trim(),
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const reply =
      response.output_text?.trim() ||
      'Mình chưa có đủ thông tin để trả lời chính xác.';

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('CHAT API ERROR:', error);
    return res.status(500).json({
      error: error?.message || 'Lỗi máy chủ khi gọi AI.',
    });
  }
}
