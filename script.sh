#!/bin/bash

read -p "请输入 Jellyfin 容器名称:" name

# 下载所需文件
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/css/style.css -O style.css  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/common-utils.js -O common-utils.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/jquery-3.6.0.min.js -O jquery-3.6.0.min.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/md5.min.js -O md5.min.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/content/content/main.js -O main.js

# 安置
docker cp ./style.css $name:/jellyfin/jellyfin-web/
docker cp ./common-utils.js $name:/jellyfin/jellyfin-web/
docker cp ./jquery-3.6.0.min.js  $name:/jellyfin/jellyfin-web/
docker cp ./md5.min.js   $name:/jellyfin/jellyfin-web/
docker cp ./main.js $name:/jellyfin/jellyfin-web/

# 提取文件
docker cp $name:/jellyfin/jellyfin-web/index.html ./

# 读取index.html文件内容
content=$(cat index.html)

# 定义要插入的代码
code='<link rel="stylesheet" id="theme-css" href="emby-crx/style.css" type="text/css" media="all" />\n<script src="emby-crx/common-utils.js"></script>\n<script src="emby-crx/jquery-3.6.0.min.js"></script>\n<script src="emby-crx/md5.min.js"></script>\n<script src="emby-crx/main.js"></script>'

# 在</head>之前插入代码
new_content=$(echo -e "${content/<\/head>/$code<\/head>}")

# 将新内容写入index.html文件
echo -e "$new_content" > index.html

docker cp ./index.html $name:/jellyfin/jellyfin-web/