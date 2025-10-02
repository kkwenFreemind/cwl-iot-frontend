# IoT 水位監測系統 - 系統模組關係圖


## Community Water Level IoT Frontend - System Architecture Documentation

---

## 📋 系統總覽 (System Overview)


### 🌊 IoT 水位監測系統前端架構

- **專案類型**: Vue 3 + TypeScript + Element Plus
- **架構模式**: 前後端分離 + RESTful API
- **權限控制**: RBAC (Role-Based Access Control)
- **國際化支援**: 中文/英文雙語系統

---

## 🏗️ 系統模組分類 (Module Categories)


### 🔴 核心管理模組 (Core Management)

- **使用者管理** (User Management)

- **部門管理** (Department Management)

### 🔵 權限管理模組 (Permission Management)


- **角色管理** (Role Management)
- **選單管理** (Menu Management)

### 🟡 系統配置模組 (System Configuration)


- **字典管理** (Dictionary Management)
- **系統設定** (System Configuration)

### 🟣 稽核監控模組 (Audit & Monitoring)

- **公告管理** (Notice Management)
- **系統日誌** (System Log)


---

## 👥 使用者管理 (User Management)


### 📁 檔案位置

- **頁面組件**: `src/views/system/user/index.vue`
- **API 服務**: `src/api/system/user-api.ts`
- **共用組件**: `src/views/system/user/components/DeptTree.vue`

### 🎯 主要功能


- ✅ 使用者帳號 CRUD 操作
- ✅ 部門歸屬管理與樹狀選擇
- ✅ 角色分配與權限控制
- ✅ 使用者狀態管理（啟用/停用）
- ✅ 密碼重置功能
- ✅ 響應式表單設計

### 🔗 模組關聯


- **依賴部門管理**: 使用者必須歸屬於特定部門
- **依賴角色管理**: 使用者透過角色獲得系統權限
- **被日誌記錄**: 所有使用者操作都會被系統日誌記錄


---

## 🎭 角色管理 (Role Management)

### 📁 檔案位置

- **頁面組件**: `src/views/system/role/index.vue`

- **API 服務**: `src/api/system/role-api.ts`

### 🎯 主要功能

- ✅ 角色定義與層級管理
- ✅ 權限樹狀結構分配
- ✅ 資料範圍控制（全部/部門+子部門/僅部門/僅個人）
- ✅ 角色狀態與優先順序管理
- ✅ 批量角色操作


### 🔗 模組關聯

- **控制選單權限**: 決定使用者可見的系統功能

- **影響資料範圍**: 控制使用者可存取的資料範圍
- **關聯部門管理**: 資料範圍與部門結構密切相關

---

## 📋 選單管理 (Menu Management)


### 📁 檔案位置

- **頁面組件**: `src/views/system/menu/index.vue`
- **API 服務**: `src/api/system/menu-api.ts`

### 🎯 主要功能

- ✅ 階層式選單結構管理
- ✅ 選單類型支援（目錄/選單/按鈕/外部連結）

- ✅ 動態路由管理
- ✅ 權限控制與可見性設定
- ✅ 國際化選單標題


### 🔗 模組關聯

- **被角色管理控制**: 角色決定選單的可見性
- **影響使用者體驗**: 直接決定使用者介面呈現
- **整合路由系統**: 與 Vue Router 動態路由生成

---


## 🏢 部門管理 (Department Management)

### 📁 檔案位置

- **頁面組件**: `src/views/system/dept/index.vue`
- **API 服務**: `src/api/system/dept-api.ts`

### 🎯 主要功能


- ✅ 階層式組織架構管理
- ✅ 部門/社區結構維護
- ✅ 地理區域劃分支援
- ✅ 部門狀態管理

- ✅ 樹狀結構展示

### 🔗 模組關聯

- **支援使用者管理**: 提供使用者歸屬部門選擇
- **影響權限範圍**: 角色的資料範圍基於部門結構
- **支援 IoT 裝置管理**: 監測裝置按地理區域劃分


---

## 📚 字典管理 (Dictionary Management)

### 📁 檔案位置

- **頁面組件**: `src/views/system/dict/index.vue`
- **子組件**: `src/views/system/dict/dict-item.vue`

- **API 服務**: `src/api/system/dict-api.ts`

### 🎯 主要功能


- ✅ 系統基礎資料維護
- ✅ 下拉選項集中管理
- ✅ 字典項目詳細配置
- ✅ 多語言字典支援
- ✅ 字典快取管理

### 🔗 模組關聯


- **提供選項資料**: 為其他模組提供下拉選項
- **支援公告管理**: 提供公告等級、類型選項
- **支援使用者管理**: 提供狀態、類型等選項

---

## ⚙️ 系統設定 (System Configuration)


### 📁 檔案位置

- **頁面組件**: `src/views/system/config/index.vue`
- **API 服務**: `src/api/system/config-api.ts`


### 🎯 主要功能

- ✅ 系統參數集中配置
- ✅ 功能開關控制
- ✅ 預設值設定管理
- ✅ 配置快取重新整理
- ✅ 參數搜尋與篩選


### 🔗 模組關聯

- **影響所有模組**: 提供系統行為控制參數
- **支援功能配置**: 控制各模組功能的啟用狀態
- **效能調校**: 提供系統效能相關參數設定

---


## 📢 公告管理 (Notice Management)

### 📁 檔案位置


- **頁面組件**: `src/views/system/notice/index.vue`
- **個人通知**: `src/views/system/notice/components/MyNotice.vue`
- **API 服務**: `src/api/system/notice-api.ts`

### 🎯 主要功能

- ✅ 富文本公告編輯

- ✅ 發布狀態控制
- ✅ 目標使用者設定
- ✅ 公告等級分類
- ✅ 個人通知中心

### 🔗 模組關聯

- **使用字典資料**: 公告等級、類型來自字典管理
- **關聯使用者管理**: 支援特定使用者公告推送

- **被日誌記錄**: 公告操作會被系統日誌記錄

---

## 📊 系統日誌 (System Log)


### 📁 檔案位置

- **頁面組件**: `src/views/system/log/index.vue`
- **API 服務**: `src/api/system/log-api.ts`


### 🎯 主要功能

- ✅ 使用者操作追蹤
- ✅ 系統稽核軌跡
- ✅ 效能監控記錄
- ✅ 網路資訊追蹤
- ✅ 進階搜尋篩選

### 🔗 模組關聯


- **記錄所有模組**: 追蹤所有系統模組的操作
- **安全監控**: 提供系統安全性監控功能
- **效能分析**: 協助系統效能問題分析

---


## 🔄 資料流程圖 (Data Flow)

### 1️⃣ 使用者登入流程

```
使用者 → Frontend → API Layer → Backend → Database
     ← JWT Token ←         ←        ←
```

### 2️⃣ 權限驗證流程


```
頁面存取 → 角色檢查 → 選單權限 → 資料範圍 → 部門限制
```

### 3️⃣ 操作稽核流程


```
使用者操作 → API 呼叫 → 業務邏輯 → 資料更新 → 日誌記錄
```

---


## 🏗️ 技術架構 (Technical Architecture)

### 前端技術棧

- **Vue 3**: Composition API + TypeScript
- **Element Plus**: 企業級 UI 組件庫
- **Vue Router**: 單頁應用路由管理
- **Pinia**: 狀態管理
- **vue-i18n**: 國際化支援


### API 設計模式

- **RESTful API**: 標準化 API 設計
- **統一回應格式**: 標準化資料格式
- **JWT 認證**: 無狀態身分驗證

- **權限攔截**: API 層級權限控制

---

## 📈 系統優勢 (System Advantages)

### 🚀 效能優勢

- ✅ 組件懶載入
- ✅ API 回應快取
- ✅ 虛擬滾動支援
- ✅ 樹狀結構最佳化

### 🔒 安全性

- ✅ JWT 身分驗證
- ✅ RBAC 權限控制
- ✅ API 權限攔截
- ✅ 操作日誌稽核

### 🌐 國際化

- ✅ 中英文雙語支援
- ✅ 動態語言切換
- ✅ 響應式設計
- ✅ 移動裝置支援

---

## 🔮 未來擴展 (Future Expansion)

### 預計整合模組

- **IoT 裝置管理**: 水位感測器管理
- **地理資訊系統**: Leaflet 地圖整合
- **即時監控**: WebSocket 資料推送
- **告警系統**: 自動告警規則管理

### 技術升級計畫

- **微前端架構**: 模組化部署
- **PWA 支援**: 漸進式 Web 應用
- **GraphQL**: 彈性資料查詢
- **Docker 容器化**: 容器化部署

---

## 📞 聯繫資訊 (Contact Information)

**專案負責人**: Chang Xiu-Wen (AI-Enhanced Development)
**更新日期**: 2025/10/01
**版本**: v2.1.0
**技術支援**: GitHub Repository - cwl-iot-frontend
