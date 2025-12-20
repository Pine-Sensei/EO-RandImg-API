# EO-RandImg-API

这是一个基于腾讯云 EdgeOne Pages Function 构建的随机图片 API。

## ✨ 功能特性

* **多图库支持**：通过 URL 路径区分不同的图片集合。
* **动态配置**：通过生成 `posts-meta.json` 自动读取各分类下的图片数量。
* **智能适配** (`?img=auto`)：自动识别移动端或桌面端 User-Agent，返回合适的竖屏或横屏图片。
* **访问统计**：利用 EdgeOne KV 存储记录 API 调用次数。

## 🚀 使用方法

### 请求 URL 格式

```text
https://example.com/api/{id}?img={type}
```

* **{id}**: 图库分类 ID (对应 `pictures/` 下的文件夹名)。
* **{type}**: 图片类型模式。

### 参数说明

| 参数 (`img`) | 说明 |
| --- | --- |
| `h` | **横屏模式**：返回横屏文件夹 (`/h/`) 中的随机图片。 |
| `v` | **竖屏模式**：返回竖屏文件夹 (`/v/`) 中的随机图片。 |
| `auto` | **自动模式**：检测 User-Agent，手机返回竖屏图，电脑返回横屏图。 |

### 示例

假设你部署在 `example.com`，且配置了一个名为 `wallpaper` 的图库 ID：

* **获取横屏壁纸：**
`https://example.com/api/wallpaper?img=h`
* **获取竖屏壁纸：**
`https://example.com/api/wallpaper?img=v`
* **自动适配设备：**
`https://example.com/api/wallpaper?img=auto`

## 🛠 部署步骤

### 1. 准备代码与资源

1. Fork 本仓库或下载代码。
2. 在项目根目录创建 `pictures` 文件夹。
3. 在 `pictures` 下创建你的分类文件夹（例如 `default`），并在其中创建 `h`（横屏）和 `v`（竖屏）文件夹。
4. 将图片重命名为数字序列（`1.webp`, `2.webp`...）并放入对应文件夹。

### 2. 配置 EdgeOne Pages

1. 登录腾讯云 EdgeOne 控制台，进入 Pages 服务。
2. 创建一个新的 Pages 项目并关联你的仓库。
3. 在 EdgeOne 控制台创建一个 KV 命名空间。并在 Pages 项目中绑定，变量名为 `my_kv` 。
4. 进入 KV 新建键为 `visitCount` 值为 `0` 的记录。

## 🤝 贡献

欢迎提交 Pull Requests 来改进代码或增加新功能。

## 🎁 鸣谢

感谢各位提供的支持：

* **[afoim/EdgeOne_Function_PicAPI](https://github.com/afoim/EdgeOne_Function_PicAPI)**：部分参考借鉴了该项目的思路和代码结构。
* **[ZXBHELLO](https://www.zakozako.cc/)**：提供心情保障。（给我发屎）
* **[Nana Sakura](https://osu.ppy.sh/users/32452774)**：协助优化代码，提出宝贵意见。


## 📄 License

本项目采用 [GNU Affero General Public License v3.0](LICENSE)，详情请查阅许可文件。