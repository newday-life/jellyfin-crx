#!/bin/bash

read -p  "请输入 Jellyfin 容器名称:" name"请输入 Jellyfin 容器名称:" name

# 在容器内创建文件夹
docker exec -it  $名称 rm -rf /jellyfin/jellyfin-web/jellyfin-crx/-it      $名称rm -rf /jellyfin/jellyfin-web/jellyfin-crx/
docker exec -it      $name mkdir -p /jellyfin/jellyfin-web/jellyfin-crx/-it        $name mkdir -p /jellyfin/jellyfin-web/jellyfin-crx/

# 下载所需文件到系统
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/css/style.css -O style.css        -O style.css  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/common-utils.js -O common-utils.js       -O common-utils.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/jquery-3.6.0.min.js -O jquery-3.6.0.min.js      -O jquery-3.6 .0.min.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/static/js/md5.min.js -O md5.min.js      -O md5.min.js  
wget https://raw.githubusercontent.com/newday-life/jellyfin-crx/master/content/main.js -O main.js -O main.js

# 从系统复制文件到容器内部
docker cp style.css $名称：/jellyfin/jellyfin-web/jellyfin-crx/ $名称：/jellyfin/jellyfin-web/jellyfin-crx/
docker cp common-utils.js $名称：/jellyfin/jellyfin-web/jellyfin-crx/ $名称：/jellyfin/jellyfin-web/jellyfin-crx/
docker cp jquery-3.6.0.min.js $名称：/jellyfin/jellyfin-web/jellyfin-crx/ $名称：/jellyfin/jellyfin-web/jellyfin-crx/
docker cp md5.min.js $名称：/jellyfin/jellyfin-web/jellyfin-crx/ $名称：/jellyfin/jellyfin-web/jellyfin-crx/
docker cp main.js $名称：/jellyfin/jellyfin-web/jellyfin-crx/ $名称：/jellyfin/jellyfin-web/jellyfin-crx/

# 定义安装程序
function函数安装() {
	# 读取index.html文件内容# 读取index.html文件内容
	内容=$(猫索引.html)内容=$(猫索引.html)

	#定义要插入的代码#定义要插入的代码
	代码= '<link rel="stylesheet" id="theme-css" href="./jellyfin-crx/style.css" type="text/css" media="all" />\n<script src= "./jellyfin-crx/common-utils.js"></script>\n<script src="./jellyfin-crx/jquery-3.6.0.min.js"></script>\n<script src="./jellyfin-crx/md5.min.js"></script>\n<script src="./jellyfin-crx/main.js"></script>'代码= '<link rel= “样式表” id="主题-css" href="./jellyfin-crx/style.css" type="text/css" media="all" />\n<script src="./jellyfin-crx /common-utils.js"></script>\n<script src="./jellyfin-crx/jquery-3.6.0.min.js"></script>\n<script src="./jellyfin-crx/md5.min.js"></script>\n<script src="./jellyfin-crx/main.js"></script>'

	# 在</head>之前插入代码# 在</head>之前插入代码
	new_content =$(echo -e " ${content/<\/head>/ $code <\/head>} " ) new_content =$(echo -e " ${content/<\/head>/ $code <\ /头>} “）

	# 将新内容写入index.html文件# 将新内容写入index.html文件
	echo -e“ $new_content ”>index.html -e“ $new_content ”>index.html
	# 覆盖容器内取index.html文件
	docker cp ./index.html :/jellyfin/jellyfin-web/ $name
}

# 先复制一份到系统内
docker cp :/jellyfin/jellyfin-web/index.html ./ $name

# 检查index.html是否包含jellyfin-crx
if grep -q " jellyfin-crx“index.html；然后
    docker cp :/jellyfin/jellyfin-web/bak/index.html ./ $name
    安装中
    echo "成功！Index.html已重新修改！"
除此之外
    echo "成功！Index.html首次安装！》
	docker cp $name:/jellyfin/jellyfin-web/index.html ./
	# 备份
	docker exec -it  $name mkdir -p /jellyfin/jellyfin-web/bak/
	docker cp ./index.html $name:/jellyfin/jellyfin-web/bak/
	Installing
fi
