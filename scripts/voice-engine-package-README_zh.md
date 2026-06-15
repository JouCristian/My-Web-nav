# JouJou AI 声音创作工坊 Windows 本地引擎

本地引擎会在你的电脑上运行 VoxCPM2，文本、参考音频和生成结果默认留在本机。

## 首次使用

1. 解压整个压缩包。
2. 双击 `INSTALL.bat`。
3. 安装程序会自动选择 Hugging Face 官方源或 `hf-mirror.com`，然后安装依赖并预下载 VoxCPM2。
4. 安装完成后回到网页，点击“检测连接”。
5. 以后可以从网页启动引擎，也可以双击 `START.bat`。

请勿直接在压缩包内运行脚本，必须先完整解压。

## 下载源选择

默认模式为 `auto`：

- 同时测试 `https://huggingface.co` 和 `https://hf-mirror.com`。
- 官方源可用且更快时使用官方源，不设置 `HF_ENDPOINT`。
- 镜像更快或官方源超时时，当前安装和启动进程使用 `HF_ENDPOINT=https://hf-mirror.com`。
- 选择结果保存在 `voice-service\.download-source.json`。
- 不会修改 Windows 系统永久环境变量。

Python 普通依赖优先使用清华 PyPI 镜像，失败后自动回退官方 PyPI。CUDA PyTorch 仍从 PyTorch 官方 CUDA 源安装。

## 手动指定下载源

在命令提示符中进入解压目录后，可以执行：

```bat
set JOUJOU_DOWNLOAD_SOURCE=official
INSTALL.bat
```

强制使用镜像：

```bat
set JOUJOU_DOWNLOAD_SOURCE=hf-mirror
INSTALL.bat
```

恢复自动选择：

```bat
set JOUJOU_DOWNLOAD_SOURCE=auto
INSTALL.bat
```

同样可以在运行 `START.bat` 前设置该变量。变量只对当前终端窗口有效。

## 环境要求

- Windows 10 或 Windows 11
- Python 3.10、3.11 或 3.12，推荐 Python 3.11
- NVIDIA 显卡，推荐显存 8GB 或以上
- 较新的 NVIDIA 驱动
- 首次安装需要联网

## 常见问题

### 如何确认当前模型下载源？

查看 `voice-service\.download-source.json`：

- `"source": "official"` 表示 Hugging Face 官方源。
- `"source": "hf-mirror"` 表示国内镜像。

启动窗口也会输出：

```text
[JouJou Voice Engine] Hugging Face endpoint: official
```

或：

```text
[JouJou Voice Engine] Hugging Face endpoint: https://hf-mirror.com
```

### 模型预下载失败怎么办？

安装程序会继续完成剩余步骤。之后运行 `START.bat` 时，VoxCPM2 会使用同一个下载源继续下载缓存。

### 提示找不到 Python 怎么办？

安装 Python 3.11，并在安装界面勾选 `Add Python to PATH`，然后重新运行 `INSTALL.bat`。

### 网页无法启动引擎怎么办？

重新运行 `INSTALL.bat` 注册 `joujou-voice://` 本地协议，或者直接双击 `START.bat`。

### 是否会上传参考音频？

本地 GPU 引擎模式下，参考音频默认只在本机处理，不上传到云端。
