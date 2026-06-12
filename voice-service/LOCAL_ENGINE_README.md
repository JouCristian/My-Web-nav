# JouJou Voice 本地 GPU 引擎

本地 GPU 引擎用于在用户电脑上运行 VoxCPM2。语音文本、参考音频和生成结果都留在本机，不上传到云端。

## 普通用户首次使用

1. 下载并解压 `joujou-voice-engine-windows.zip`。
2. 双击压缩包根目录的 `INSTALL.bat`。
3. 等待脚本创建 `.venv`、安装 CUDA 版 PyTorch 和 `requirements.txt` 中的依赖。
4. 安装脚本会注册 `joujou-voice://` 本地启动协议。
5. 回到网页，点击“检测连接”。

首次初始化会下载 PyTorch、VoxCPM2 和相关依赖，可能需要较长时间。建议使用 NVIDIA 显卡，显存 8GB 或以上。

## 以后如何启动

在网页里点击“启动本地引擎”。浏览器会打开：

`joujou-voice://start`

该协议会唤起 `start-local-engine.bat`，并启动：

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8866
```

如果网页按钮没有反应，请重新运行 `INSTALL.bat` 注册本地协议。也可以双击压缩包根目录的 `START.bat` 手动启动。

## 构建网站下载包

在项目根目录执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-voice-engine-package.ps1
```

脚本会生成：

```text
public/downloads/joujou-voice-engine-windows.zip
```

下载包会排除虚拟环境、用户音频、缓存、模型权重、wheel 和 `.env`，但保留 `.env.example`。

## 手动启动开发目录

可以直接双击：

`voice-service.bat`

或在当前目录运行：

```powershell
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 127.0.0.1 --port 8866
```

## 线上网页连接失败排查（CORS / 私有网络访问）

如果线上网页无法连接本地引擎，但本地引擎窗口显示 `/health`、`/engine/info` 返回 200，通常是 CORS / 浏览器私有网络访问（Private Network Access）限制。

本地引擎默认允许以下页面访问：

- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:3001
- http://127.0.0.1:3001
- https://www.zoujunyispace.cn

如果你部署到自己的域名，需要在 `VOICE_ALLOWED_ORIGINS` 中加入你的域名 Origin。
例如页面地址是：

```text
https://www.zoujunyispace.cn/joujou-tools/ai-voice-workshop
```

则需要加入的 Origin 是：

```text
https://www.zoujunyispace.cn
```

注意 CORS 判断只看 Origin（协议 + 域名 + 端口），不看完整路径。多个 Origin 用英文逗号分隔，并且会与内置默认白名单合并。

## 卸载本地协议

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\unregister-joujou-voice-protocol.ps1
```
