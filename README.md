# kurohelper-nuxt4

Galgame 資料整理與個人遊玩紀錄助手。提供遊戲資訊查詢、品牌資訊瀏覽、個人遊玩狀態追蹤與統計圖表展示等功能。

---

## 🛠 技術棧 (Tech Stack)

- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue 3 + TypeScript)
- **UI 框架**: [Vuetify](https://vuetifyjs.com/) (`vuetify-nuxt-module`) + [Geist](https://vercel.com/font)
- **圖表庫**: [ECharts](https://echarts.apache.org/) (`vue-echarts`)
- **圖示庫**: Material Design Icons (`@mdi/font`)
- **程式碼規範**: ESLint + Prettier

---

## 🚀 快速開始 (Getting Started)

### 1. 安裝依賴

```bash
# Install dependencies
yarn install
```

### 2. 環境變數設定

本專案使用 Nuxt dotenv 載入環境變數。請參考範本檔建立環境變數設定檔：

- 開發模式：複製 `.env.test.example` 為 `.env.test`
- 生產環境：複製 `.env.example` 為 `.env`

```bash
# Copy environment configuration template
cp .env.test.example .env.test
```

主要環境變數說明：

- `NUXT_API_BASE_URL`: 後端 API 服務位址
- `NUXT_API_TOKEN`: 後端 API 認證金鑰
- `NUXT_GAME_EROGS_AUTOCOMPLETE_FILE`: 自動補全資料檔案路徑（選填）

### 3. 啟動開發伺服器

```bash
# Start development server with .env.test
yarn dev
```

啟動後請以瀏覽器打開 [http://localhost:3000](http://localhost:3000)。

---

## 📦 建置與生產環境 (Build & Preview)

### 建置生產環境版本

```bash
# Build for production with .env
yarn build
```

### 本地預覽建置成果

```bash
# Preview production build locally
yarn preview
```
