import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Thiếu OPENAI_API_KEY trong Vercel." });
  }

  try {
    const { text, userRole } = req.body ?? {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Thiếu nội dung tin nhắn." });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                `Bạn là EduHealth AI, trợ lý tư vấn sức khỏe học đường bằng tiếng Việt.
- Trả lời ngắn gọn, dễ hiểu, thân thiện.
- Không khẳng định chẩn đoán chắc chắn.
- Nếu có dấu hiệu nặng thì khuyên đi cơ sở y tế.
- Vai trò người dùng hiện tại: ${userRole || "Chưa xác định"}.`
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: String(text)
            }
          ]
        }
      ]
    });

    const reply = response.output_text?.trim() || "Mình chưa có thông tin phù hợp.";

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("CHAT API ERROR:", error);
    return res.status(500).json({
      error: error?.message || "Lỗi máy chủ khi gọi OpenAI."
    });
  }
}
