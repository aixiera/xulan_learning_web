module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "只支持 POST 请求" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const message = body.message;

    if (!message) {
      return res.status(400).json({ error: "缺少用户问题" });
    }

    const response = await fetch("https://api.coze.cn/v3/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COZE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bot_id: process.env.COZE_BOT_ID,
        user_id: "website_user",
        stream: true,
        auto_save_history: false,
        additional_messages: [
          {
            role: "user",
            content: message,
            content_type: "text",
          },
        ],
      }),
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Coze API 调用失败",
        detail: raw,
      });
    }

    let answer = "";
    let currentEvent = "";

    raw.split("\n").forEach((line) => {
      if (line.startsWith("event:")) {
        currentEvent = line.replace("event:", "").trim();
      }

      if (line.startsWith("data:")) {
        const dataText = line.replace("data:", "").trim();

        if (!dataText || dataText === "[DONE]") return;

        try {
          const data = JSON.parse(dataText);

          if (
            currentEvent === "conversation.message.delta" &&
            data.content
          ) {
            answer += data.content;
          }
        } catch (e) {}
      }
    });

    return res.status(200).json({
      answer: answer || "暂时没有获取到回复，请检查 Bot ID 或 API Key。",
    });
  } catch (error) {
    return res.status(500).json({
      error: "服务器错误",
      detail: error.message,
    });
  }
};