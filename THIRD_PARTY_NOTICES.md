# LineLoop 第三方组件

正式安装包内包含以下工具，供视频导入与本机语音识别使用。它们的许可证文本随应用放在 `Contents/Resources/licenses/` 中。

| 组件 | 版本 | 许可证 | 项目与源码 |
| --- | --- | --- | --- |
| FFmpeg / ffprobe | 8.1.2 | LGPL 2.1 或更新版本；发布构建禁用 GPL 与 nonfree 组件 | [FFmpeg](https://ffmpeg.org/download.html) |
| whisper.cpp | 1.9.4 | MIT | [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp) |
| Whisper base 模型 | base | MIT | [ggerganov/whisper.cpp 模型](https://huggingface.co/ggerganov/whisper.cpp) |
| yt-dlp | 2026.08.19 | Unlicense | [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) |
| Deno | 2.9.7 | MIT | [denoland/deno](https://github.com/denoland/deno) |

FFmpeg 与 whisper.cpp 由本仓库的 `scripts/build-ffmpeg.sh`、`scripts/build-whisper.sh` 从已校验的官方源码构建。发布时同时提供所用源码归档，方便核对与重新构建。yt-dlp 使用官方 macOS 发布文件。以上工具仅用于用户主动导入的视频；视频内容及学习记录保存在本机。
