# AGENTS.md

## 项目定位

`Amadeus System New Alpha` 是一个受《命运石之门 0》启发的实验性 Amadeus 语音交互系统。项目包含 Web 前端、Electron 桌面壳、Node.js 中转服务和 Python WebRTC 实时语音服务，目标是提供带 Live2D 虚拟形象、语音对话、文本输入、摄像头帧理解、语音克隆和多语言输出能力的个人 AI 助手体验。

README 已明确标注：上游项目当前不再维护和更新，后续内容迁移到 `https://cyberspirit.io`。维护本仓库时应优先尊重当前代码结构和本地定制，不要默认追随上游变更。

## 架构概览

- 前端：`src/` 使用 React 18、TypeScript、Vite、Tailwind CSS、shadcn/ui 风格组件、Less Modules、MobX、React Router 和 i18next。
- 桌面端：`electron/` 提供 Electron 主进程、预加载脚本、加载页、托盘、菜单、自动更新、静态资源服务和 Node 中转服务启动逻辑。
- Node 中转服务：`service/src/` 使用 Hono、Node HTTP Server 和 `http-proxy-middleware`，负责把 `/api` 代理到 Python WebRTC 服务，并提供 `/node/api/voice-clone` 语音克隆中转接口。
- Python WebRTC 服务：`service/webrtc/` 使用 FastAPI、fastrtc、humaware-vad、OpenAI 兼容接口、SiliconFlow TTS、Whisper 兼容 STT 和可选 Mem0 记忆服务，负责实时音频、转写、LLM 流式响应、TTS、情感动作和主动对话计划。
- 静态与第三方资源：`public/` 存放 Live2D、VAD、Crypto 等浏览器侧静态资源，其中 `public/utils/` 下包含压缩第三方库，通常不应人工改写。

## 核心运行链路

- Vite 前端开发服务默认监听 `http://localhost:1002`。
- Node 中转服务默认监听 `http://localhost:3002`，生产模式下也会代理本地 Vite preview 静态前端。
- Python WebRTC 服务默认监听 `http://localhost:8001`。
- 前端常量 `API_BASE_URL` 当前为 `/api`，由 Vite 或 Node 中转层转发到 WebRTC 服务。
- `/api/webrtc/ice-config` 返回 ICE/TURN 配置；`/api/webrtc/offer` 由 fastrtc 挂载的 WebRTC 流处理。
- `/api/events?webrtc_id=...` 是 SSE 事件流，向前端推送 `llm_stream`、`llm_response`、`transcript`、`emotion_response`、`next_action` 和错误事件。
- `/api/input_hook` 与 `/api/use_builtin_service` 接收用户 AI 配置；`/api/ai-trigger` 用于静音后的主动对话触发；`/api/text-input` 用于麦克风静音时的文本输入。
- `/api/camera-state` 与 `/api/video-frame` 同步摄像头状态和低频 JPEG 帧，供多模态模型分析。
- `/node/api/voice-clone/clone-from-url` 与 `/node/api/voice-clone/clone-from-base64` 通过 Node 服务调用 SiliconFlow 语音克隆接口，避免前端直接处理跨域与文件转换细节。

## 目录职责

- `src/main.tsx`：前端入口，挂载 `StoreProvider`、`ThemeProvider`、`RouterProvider` 和 i18n。
- `src/routes/index.tsx`：当前只有根路由 `/`，渲染 `Home` 页面。
- `src/pages/Home/`：主交互页面，组织登录、Live2D、WebRTC 连接、语音/文本对话、摄像头、历史记录、配置面板和开始对话流程。
- `src/components/Live2dModel/`：加载 `pixi-live2d-display` 模型，驱动头部、眼睛、眨眼、表情、动作和口型参数。
- `src/components/ConfigPanel/`：管理 Live2D 位置、内置/自定义 AI 服务、LLM、ASR、TTS、Mem0、语言、系统提示词和语音克隆配置。
- `src/components/VideoChat/`：获取摄像头流，支持前后摄像头切换和拖动窗口，每 3 秒发送一次压缩视频帧。
- `src/components/ChatHistory/`、`Toolbar/`、`LoginOverlay/`、`StartDialog/`：分别负责历史记录、工具栏、登录遮罩和开始对话提示。
- `src/hooks/useWebRTC.ts`：封装 WebRTC 客户端、麦克风控制、音频分析、SSE 连接、Live2D 口型和静音检测。
- `src/store/`：MobX 根 store，目前主要管理 Live2D 模型、情感和动作共享状态。
- `src/i18n/`：中文、英文、日文语言包；新增界面文案时应同步维护三个 locale 文件。
- `service/src/index.ts`：Node 服务入口，注册 Hono 路由、代理 `/api`、处理 `/node/api`，并在生产模式代理前端静态服务。
- `service/src/routes/voiceCloneRoutes.ts` 与 `service/src/services/voiceCloneService.ts`：SiliconFlow 语音克隆中转接口与服务封装。
- `service/webrtc/server.py`：Python 服务主入口，管理会话、OpenAI 客户端、WebRTC Stream、VAD、主动对话和 FastAPI 生命周期。
- `service/webrtc/routes.py`：WebRTC 服务 HTTP API，维护用户配置、SSE 输出、AI 触发、文本输入、摄像头状态和视频帧缓存。
- `service/webrtc/ai/`、`stt/`、`tts/`、`utils/`：分别放置 LLM 流、情感分析、行动计划、语音转文本、文本转语音、提示词和流处理工具。

## 开发命令

根目录前端：

```bash
npm install
npm run dev
npm run lint
npm run build
```

Node 中转服务：

```bash
cd service
pnpm install
pnpm dev
pnpm lint
pnpm build
```

Python WebRTC 服务：

```bash
cd service/webrtc
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

Electron：

```bash
npm run build:electron
npm run start:electron
```

Windows 辅助脚本：

```bat
start.bat
stop.bat
```

`start.bat` 会分别启动 Node 服务、Python WebRTC 服务和 Vite 前端。`stop.bat` 会强制终止所有 `node.exe` 和 `python.exe` 进程，可能影响本机其他项目，使用前必须确认风险。

Docker：

```bash
docker-compose up -d
docker-compose logs -f
```

WebRTC 单独镜像：

```bash
cd service/webrtc
docker build -t amadeus-webrtc-service .
docker run -p 8001:8001 amadeus-webrtc-service
```

## 环境变量与密钥

不要提交 `.env`、`.env.development`、`.env.production` 或任何真实密钥；这些文件已被 `.gitignore` 与 `.dockerignore` 忽略。

前端常用变量：

- `VITE_APP_API_BASE_URL`：Vite 开发代理目标，通常指向 Node 中转服务或部署后的 API 地址。
- `VITE_APP_DEFAULT_USERNAME`：登录框默认用户名。

Node 服务常用变量：

- `PORT`：Node 中转服务端口，默认 `3002`。
- `WEBRTC_API_URL`：Python WebRTC 服务地址，Node 层把 `/api` 请求代理到该地址。

WebRTC 服务常用变量：

- `LLM_API_KEY`、`LLM_BASE_URL`、`AI_MODEL`：OpenAI 兼容 LLM 服务配置。
- `WHISPER_API_KEY`、`WHISPER_BASE_URL`、`WHISPER_MODEL`：OpenAI 兼容语音识别配置。
- `SILICONFLOW_API_KEY`、`SILICONFLOW_VOICE`：SiliconFlow 语音合成和克隆配置。
- `MEM0_API_KEY`：可选记忆服务配置；当前部分记忆写入逻辑处于注释状态。
- `TIME_LIMIT`：WebRTC 流最大时长，默认 `600` 秒。
- `CONCURRENCY_LIMIT`：最大并发连接数，默认 `10`。

Electron 打包后会从 `resources/service/.env` 加载服务配置。桌面端内置 Node 服务依赖 `service/build` 产物，构建 Electron 前应先完成前端和服务构建。

## 代码规范与协作约定

- 所有新文本文件优先使用 UTF-8；本仓库含大量中文文案和提示词，避免以错误编码读写导致乱码。
- 前端优先使用 TypeScript、函数组件、React hooks、Tailwind/shadcn 组件和现有 Less Modules 样式。
- `@/*` alias 指向 `src/*`；前端共享工具优先放在 `src/lib/` 或既有邻近目录。
- MobX 当前只承担 Live2D 模型、情感和动作共享状态；普通页面交互状态通常保持在组件内。
- UI 文案应通过 `src/i18n/locales/*.json` 管理；新增用户可见文案时同步更新 `zh`、`en`、`ja`。
- 新增配置项时需同时考虑 `ConfigPanel`、`useConfigPanel`、localStorage 持久化、发送给 WebRTC 服务的 payload、Python `InputData` 模型和默认环境变量。
- 不要手工修改 `public/utils/live2d/`、`public/utils/crypto/` 等压缩第三方库；如需升级，应记录来源和替换方式。
- 避免把 API Key、用户个人配置、构建产物、依赖目录、日志和本地虚拟环境加入版本控制。
- 当前仓库检查时未发现 `node_modules`、`service/node_modules`、`service/webrtc/venv`，新环境运行前需要按上方命令安装依赖。

## 验证建议

文档类改动：

- 确认 Markdown 标题层级清晰、中文可读、无乱码。
- 确认没有泄露真实密钥、令牌、个人路径中的敏感内容。
- 确认没有把 `node_modules`、`dist`、`service/build`、`.env`、虚拟环境等忽略内容写成需要提交的文件。

前端或 Electron 改动：

```bash
npm run lint
npm run build
```

Node 服务改动：

```bash
cd service
pnpm lint
pnpm build
```

Python WebRTC 改动：

```bash
cd service/webrtc
python server.py
```

本项目未提供统一测试套件；涉及实时语音、摄像头、SSE、TTS 或 Electron 启动链路的改动，应补充手工验证记录，至少覆盖连接建立、文本/语音输入、LLM 流式输出、音频播放、历史记录和配置保存。
