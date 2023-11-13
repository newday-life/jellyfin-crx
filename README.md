## 适配Jellyfin
- 感谢Nolovenodie的项目,项目地址：https://github.com/Nolovenodie/emby-crx
- 再此基础上添加无缝轮播，手动点击左右按钮及触控左右滑动切换上下一个。

## 无需使用插件, 直接部署至服务端, 用户无缝使用

```
# Docker版 (如遇脚本更新, 重新执行即可)
# 注意: 需要能访问的上Github的环境
# 执行后需要输入容器名!
wget -O script.sh --no-check-certificate https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/script.sh && bash script.sh
```
### 国内加速使用这个
```
# 国内访问加速
wget -O script.sh --no-check-certificate https://gh-proxy.com/https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/script.sh && bash script.sh
```

---

### 参考教程1(非官方): https://cangshui.net/5167.html
### 参考教程2(非官方): https://mj.tk/2023/07/Emby
