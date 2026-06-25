FROM node:20-alpine

# 工作目录
WORKDIR /app

# 先拷贝 package 文件并安装依赖
COPY package*.json ./
RUN npm install

# 再把后端代码全部拷进来
COPY . .

# 暴露后端端口（server.js 用的 3000）
EXPOSE 3000

# 启动命令（用你 package.json 里的 start）
CMD ["npm", "start"]