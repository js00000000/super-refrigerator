import { messagingApi } from "@line/bot-sdk";
import { supabase } from "@/lib/supabase";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import crypto from "crypto";

const { MessagingApiClient } = messagingApi;

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const channelSecret = process.env.LINE_CHANNEL_SECRET!;
const client = new MessagingApiClient({ channelAccessToken });

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature");

  // Verify signature
  if (!signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");

  if (hash !== signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { events } = JSON.parse(body);

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      await handleTextMessage(event);
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function handleTextMessage(event: any) {
  const text = event.message.text.trim();
  const replyToken = event.replyToken;

  if (text === "清單" || text.toLowerCase() === "list") {
    await listItems(replyToken);
  } else if (text.startsWith("新增")) {
    await handleAddItem(replyToken, text);
  } else if (text === "建議食譜" || text.toLowerCase() === "recipe") {
    await suggestRecipe(replyToken);
  } else {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: "👋 你好！我是超級冰箱助理。\n\n你可以輸入：\n1. 「清單」：查看所有食材\n2. 「新增 [名稱] [數量] [過期日]」：例如「新增 牛肉 2塊 2026-03-10」\n3. 「建議食譜」：讓我推薦料理！",
        },
      ],
    });
  }
}

async function listItems(replyToken: string) {
  const { data: items, error } = await supabase
    .from("refrigerator_items")
    .select("*")
    .order("expire_date", { ascending: true });

  if (error || !items) {
    return client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "讀取庫存時發生錯誤。" }],
    });
  }

  if (items.length === 0) {
    return client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "目前冰箱是空的喔！" }],
    });
  }

  const itemListText = items
    .map((item) => `🧊 ${item.name}${item.amount ? ` (${item.amount})` : ""}\n📅 過期日：${item.expire_date}`)
    .join("\n\n");

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: `📍 目前冰箱庫存 (${items.length} 件)：\n\n${itemListText}`,
      },
    ],
  });
}

async function handleAddItem(replyToken: string, text: string) {
  const parts = text.split(/\s+/);
  if (parts.length < 3) {
    return client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "格式錯誤！請輸入：\n新增 [名稱] [過期日]\n或：新增 [名稱] [數量] [過期日]\n例如：新增 牛肉 2塊 2026-03-10" }],
    });
  }

  let name, amount, expireDate;

  if (parts.length === 3) {
    // 新增 [名稱] [日期]
    name = parts[1];
    amount = null;
    expireDate = parts[2];
  } else {
    // 新增 [名稱] [數量] [日期]
    name = parts[1];
    amount = parts[2];
    expireDate = parts[3];
  }

  const { error } = await supabase
    .from("refrigerator_items")
    .insert([{ name, amount, expire_date: expireDate }]);

  if (error) {
    return client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "新增失敗，請檢查日期格式 (YYYY-MM-DD)。" }],
    });
  }

  await client.replyMessage({
    replyToken,
    messages: [{ type: "text", text: `✅ 已成功加入：${name}${amount ? ` (${amount})` : ""}\n過期日期：${expireDate}` }],
  });
}

async function suggestRecipe(replyToken: string) {
  const { data: items } = await supabase
    .from("refrigerator_items")
    .select("*")
    .limit(10);

  if (!items || items.length === 0) {
    return client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "冰箱沒東西，沒辦法推薦食譜喔！" }],
    });
  }

  const apiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenAI({ apiKey });
  const prompt = `你是一位專業大廚。冰箱有：${items.map((i) => `${i.name}${i.amount ? `(${i.amount})` : ""}`).join(", ")}。請推薦 1 道簡單的料理，並列出簡短的 3-5 個步驟。請用繁體中文回答。`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const recipeText = result.candidates?.[0]?.content?.parts?.[0]?.text || "無法生成食譜。";

    await client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: `👨‍🍳 AI 廚師推薦：\n\n${recipeText}` }],
    });
  } catch (error) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: "text", text: "AI 思考時發生錯誤。" }],
    });
  }
}
