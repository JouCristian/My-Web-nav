# JouJou Voice Engine Windows 本地引擎

这是 AI 声音创作工坊的本地 GPU 引擎。
它会在你的电脑上运行 VoxCPM2，使用本机 GPU 生成语音。
参考音频和生成过程默认都在本地完成。

## 第一次使用

1. 解压这个压缩包。
2. 双击 `INSTALL.bat`。
3. 等待安装完成，安装窗口会保留结果信息。
4. 回到网页，点击“检测本地引擎”。
5. 如果显示已连接，就可以生成语音。
6. 以后再次使用时，直接在网页点击“启动本地引擎”。

也可以随时双击 `START.bat` 手动启动引擎。

## 需要的环境

- Windows 10 / Windows 11
- Python 3.10 / 3.11 / 3.12，推荐 Python 3.11
- NVIDIA 显卡，推荐显存 8GB 或以上
- 较新的 NVIDIA 驱动
- 首次初始化需要联网下载依赖和模型

## 常见问题

### 双击 INSTALL.bat 没反应怎么办？

请右键选择“在终端中打开”，或打开 PowerShell 后进入该目录执行 `INSTALL.bat`。

### 提示找不到 Python 怎么办？

请先安装 Python 3.11，并在安装时勾选 `Add Python to PATH`。

### 点击网页“启动本地引擎”没有反应怎么办？

请重新双击 `INSTALL.bat`，它会注册 `joujou-voice://` 本地启动协议。

### 第一次为什么很慢？

第一次会下载 PyTorch、VoxCPM2 和相关依赖，可能需要较长时间，请保持网络稳定。

### 线上网页连接失败，但本地引擎窗口显示 200 怎么办？

如果线上网页无法连接本地引擎，但本地引擎窗口显示 `/health`、`/engine/info` 返回 200，通常是 CORS / 浏览器私有网络访问（Private Network Access）限制。

本地引擎默认允许以下页面访问：

- http://localhost:3000
- http://127.0.0.1:3000
- https://www.zoujunyispace.cn

如果你部署到自己的域名，需要在 `voice-service\.env` 的 `VOICE_ALLOWED_ORIGINS` 中加入你的域名 Origin。
例如页面地址是：

```text
https://www.zoujunyispace.cn/joujou-tools/ai-voice-workshop
```

则需要加入的 Origin 是：

```text
https://www.zoujunyispace.cn
```

注意 CORS 只看 Origin（协议 + 域名 + 端口），不看完整路径。修改后请重启本地引擎。

### 是否会上传我的参考音频？

本地 GPU 引擎模式下，参考音频默认只在你的电脑本地处理，不上传云端。
