# C Drive Cleaner

Windows C 盘清理工具，扫描可删除文件并提供交互式选择删除。

## 功能

- 扫描临时文件（.tmp, .log, .old, .bak）
- 扫描安装包（.exe, .msi, .apk, .zip 等）
- 扫描视频文件（.mp4, .avi, .mkv）
- 扫描录屏文件（bandicam）
- 分页显示扫描结果
- 支持多选删除

## 使用方法

### 直接运行

双击 `clean_c.bat` 或在命令行执行：

```cmd
clean_c.bat
```

### 复制到其他位置

将 `clean_c.bat` 复制到任意目录即可使用。

## 界面说明

扫描完成后会显示可清理项目列表，支持以下操作：

| 按键 | 功能 |
|------|------|
| 数字 | 选择对应项目 |
| 空格分隔多个数字 | 多选删除 |
| `a` | 全选当前页 |
| `p` | 上一页 |
| `n` | 下一页 |
| `q` | 退出 |

## 技术细节

- 纯 BAT 脚本，无需安装任何依赖
- 支持 Windows 7+
- 自动处理中文路径和文件名

## 赞助

如果这个项目对你有帮助，欢迎扫码赞助支持！

<img src="sponsor.png" alt="赞助二维码" width="200">

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！
