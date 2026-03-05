# 🧊 超級冰箱 (Super Refrigerator)

這是一個現代化的食物追蹤與料理建議應用程式，幫助您輕鬆管理冰箱庫存、追蹤保存期限，並利用 AI 推薦最適合的食譜。

## 🌟 核心功能

- **庫存管理：** 輕鬆新增、編輯與刪除冰箱物品，支援「放入日期」與「有效日期」追蹤。
- **數量管理：** 支援可選的食材數量記錄（如：2 瓶、500g），並可隨時在清單中直接修改。
- **過期提醒：** 自動計算剩餘天數，並以顏色標示食材狀態（已過期、即將過期、新鮮）。
- **🍳 烹飪環節 (Cooking Session)：**
  - 從庫存中選擇多樣食材加入烹飪清單。
  - 支援修改剩餘數量或標記為「全部用完」。
  - 完成烹飪後自動更新資料庫。
- **✨ AI 食譜生成：** 整合 **Gemini 2.5 Flash**，根據您選中的食材自動生成逐步烹飪教學。
- **🤖 LINE Bot 整合：** 透過 LINE 訊息即可隨時查詢庫存、新增食材或獲取 AI 料理建議。

## 🛠 關鍵技術

- **前端：** Next.js (App Router), TypeScript, Tailwind CSS
- **資料庫：** Supabase (PostgreSQL)
- **AI 模型：** Google Gemini 2.5 Flash API
- **通訊：** LINE Messaging API SDK
- **部署：** Netlify

## 🚀 快速開始

### 1. 複製專案與安裝依賴
```bash
git clone <repository-url>
cd super-refrigerator
npm install
```

### 2. 環境變數設定
複製 `.env.example` 並更名為 `.env.local`，填入您的 API 憑證：
- **Gemini API Key:** 前往 [Google AI Studio](https://aistudio.google.com/) 取得。
- **Supabase:** 建立一個 Supabase 專案並取得 URL 與 Anon Key。
- **LINE:** 在 [LINE Developers Console](https://developers.line.biz/) 建立 Channel。

### 3. 本地開發
```bash
npm run dev
```
打開 [http://localhost:3000](http://localhost:3000) 即可瀏覽。

## 📱 LINE Bot 指令
- `清單` 或 `list`: 查看目前冰箱所有食材。
- `新增 [名稱] [數量(選填)] [日期]`: 例如 `新增 牛奶 1瓶 2026-03-10`。
- `建議食譜` 或 `recipe`: 讓 AI 根據冰箱食材推薦料理。

## 📄 資料庫結構 (Supabase)
請在 Supabase 執行以下 SQL 建立資料表：
```sql
create table public.refrigerator_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  amount text,
  added_date date not null default current_date,
  expire_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```
