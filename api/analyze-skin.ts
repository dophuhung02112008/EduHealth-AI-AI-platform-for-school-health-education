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
    const { inputText, imageBase64 } = req.body ?? {};

    if (!inputText && !imageBase64) {
      return res.status(400).json({ error: "Thiếu dữ liệu đầu vào." });
    }

    const content: any[] = [
      {
        type: "input_text",
        text:
          `Bạn là AI hỗ trợ sàng lọc sức khỏe học đường.
Hãy trả về DUY NHẤT JSON hợp lệ, không có markdown, không có giải thích ngoài JSON.

Schema bắt buộc:
{
  "title": "string",
  "category": "string",
  "analysis": ["string", "string"],
  "urgency": "Theo dõi & Vệ sinh tại nhà" | "Nên tham vấn Y tế học đường" | "Cần đi khám chuyên khoa ngay",
  "dangerSigns": ["string"],
  "safetyAdvice": ["string"]
}

Nguyên tắc:
- Không chẩn đoán chắc chắn.
- Nếu thông tin không đủ, vẫn đưa ra nhận định thận trọng.
- Nếu nghi ngờ nặng, chọn mức: "Cần đi khám chuyên khoa ngay".
- Viết bằng tiếng Việt, dễ hiểu cho học sinh/phụ huynh.`
      }
    ];

    if (inputText) {
      content.push({
        type: "input_text",
        text: `Mô tả triệu chứng: ${String(inputText)}`
      });
    }

    if (imageBase64 && typeof imageBase64 === "string") {
      content.push({
        type: "input_image",
        image_url: imageBase64
      });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content
        }
      ]
    });

    const raw = response.output_text?.trim() || "";

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("RAW ANALYZE RESPONSE:", raw);
      return res.status(500).json({
        error: "AI không trả về JSON hợp lệ."
      });
    }

    return res.status(200).json({
      title: parsed.title || "Kết quả sàng lọc sơ bộ",
      category: parsed.category || "Chưa xác định",
      analysis: Array.isArray(parsed.analysis) ? parsed.analysis : ["Chưa đủ dữ liệu để phân tích sâu."],
      urgency: parsed.urgency || "Nên tham vấn Y tế học đường",
      dangerSigns: Array.isArray(parsed.dangerSigns) ? parsed.dangerSigns : ["Nếu triệu chứng tăng nặng, hãy đi khám."],
      safetyAdvice: Array.isArray(parsed.safetyAdvice) ? parsed.safetyAdvice : ["Theo dõi thêm và tham khảo nhân viên y tế."]
    });
  } catch (error: any) {
    console.error("ANALYZE API ERROR:", error);
    return res.status(500).json({
      error: error?.message || "Lỗi máy chủ khi phân tích ảnh."
    });
  }
}
