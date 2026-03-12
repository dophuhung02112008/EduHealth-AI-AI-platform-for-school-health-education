import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: any, res: any) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { inputText } = req.body;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `Phân tích triệu chứng sau theo ngữ cảnh y tế học đường: ${inputText}`
    });

    return res.status(200).json({
      title: "Kết quả sàng lọc AI",
      category: "Phân tích triệu chứng",
      analysis: [
        response.output_text
      ],
      urgency: "Nên tham vấn Y tế học đường",
      dangerSigns: [
        "Sốt cao",
        "Đau nhiều",
        "Khó thở"
      ],
      safetyAdvice: [
        "Theo dõi thêm triệu chứng",
        "Giữ vệ sinh cá nhân",
        "Nếu nặng hơn hãy đi khám"
      ]
    });

  } catch (err:any) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });

  }
}
