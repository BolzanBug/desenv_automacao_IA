# ==============================================================================
# Dockerfile — API Backend Pollen Parque Gestão de Afiliados
# Node.js 22 Alpine / Express / Sequelize
# ==============================================================================

FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# Instalação de dependências de compilação para pacotes nativos
RUN apk add --no-cache python3 make g++

# Copiar descritores de dependências
COPY package*.json ./

# Instalação limpa de dependências de produção
RUN npm install --omit=dev

# Copiar código-fonte da aplicação
COPY . .

# Criar diretório para persistência de uploads
RUN mkdir -p uploads

# Expor a porta da API
EXPOSE 3001

# Variáveis padrão de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicialização
CMD ["npm", "start"]

