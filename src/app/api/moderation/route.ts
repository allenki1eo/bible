import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY;

  // No Groq key = auto-approve
  if (!groqKey) {
    return NextResponse.json({ status: "approved", reason: null });
  }

  try {
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ status: "flagged", reason: "Empty content" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are a content moderator for a Christian community app. Classify the following testimony. Return ONLY valid JSON: {"status":"approved"|"flagged","reason":"string"}. Flag: hate speech, explicit content, spam, personal attacks. Be lenient with personal struggles.`,
            },
            { role: "user", content },
          ],
          temperature: 0.1,
          max_tokens: 100,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ status: "approved", reason: null });
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ status: "approved", reason: null });
  }
}
