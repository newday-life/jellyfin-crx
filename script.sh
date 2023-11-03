#!/bin/bash

read -p "请输入 Jellyfin 容器名称:" name

docker exec -it  $name rm -rf /jellyfin/jellyfin-web/jellyfin-crx/
docker exec -it  $name mkdir -p /jellyfin/jellyfin-web/jellyfin-crx/

# 下载所需文件
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/css/style.css -O style.css  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/common-utils.js -O common-utils.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/jquery-3.6.0.min.js -O jquery-3.6.0.min.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/md5.min.js -O md5.min.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/content/content/main.js -O main.js

# 安置
docker cp style.css $name:/jellyfin/jellyfin-web/jellyfin-crx/
docker cp common-utils.js $name:/jellyfin/jellyfin-web/jellyfin-crx/
docker cp jquery-3.6.0.min.js $name:/jellyfin/jellyfin-web/jellyfin-crx/
docker cp md5.min.js $name:/jellyfin/jellyfin-web/jellyfin-crx/
docker cp main.js $name:/jellyfin/jellyfin-web/jellyfin-crx/

# 定义安装程序
function Installing() {
	# 读取index.html文件内容
	content=$(cat index.html)

	# 定义要插入的代码
	code='<link rel="stylesheet" id="theme-css" href="./jellyfin-crx/style.css" type="text/css" media="all" />\n<script src="./jellyfin-crx/common-utils.js"></script>\n<script src="./jellyfin-crx/jquery-3.6.0.min.js"></script>\n<script src="./jellyfin-crx/md5.min.js"></script>\n<script src="./jellyfin-crx/main.js"></script>'

	# 在</head>之前插入代码
	new_content=$(echo -e "${content/<\/head>/$code<\/head>}")

	# 将新内容写入index.html文件
	echo -e "$new_content" > index.html
	# 覆盖容器内取index.html文件
	docker cp ./index.html $name:/jellyfin/jellyfin-web/
}

# 检查index.html是否包含jellyfin-crx
if grep -q "jellyfin-crx" index.html; then
    echo "Index.html 已经修改过！"
    docker cp $name:/jellyfin/jellyfin-web/bak/index.html ./
    Installing
else
    echo "Index.html 首次安装！"
	docker cp $name:/jellyfin/jellyfin-web/index.html ./
	# 备份
	docker exec -it  $name mkdir -p /jellyfin/jellyfin-web/bak/
	docker cp ./index.html $name:/jellyfin/jellyfin-web/bak/
	Installing
fi
