# nginx
for my multi node project, like a nginx ,with subdomain to redirect to diffrent subproject


蜂巢配置：
	使用镜像node_base:latest
	环境变量NODE_ENV=production

打开Console
	mkdir app && cd app
	git clone https://github.com/cheerful-li/nginx.git
	cd nginx 
	npm install
	apt-get install -y vim 
	vim config.json 添加配置信息
	nohup node nginx &
	