echo "           ###                 ##                                   ### ";
echo "            ##                                                       ## ";
echo "   #####    ##      ######    ###     ##  ##   ######                ##    ####    ##  ## ";
echo "  ##        #####    ##  ##    ##     #######   ##  ##            #####   ##  ##   ##  ## ";
echo "   #####    ##  ##   ##        ##     ## # ##   ##  ##           ##  ##   ######   ##  ## ";
echo "       ##   ##  ##   ##        ##     ##   ##   #####            ##  ##   ##        #### ";
echo "  ######   ###  ##  ####      ####    ##   ##   ##                ######   #####     ## ";
echo "                                               #### ";
echo "Fazendo as comfigurações inicias do projeto..."
echo "Iniciando as configurações do typescript..."
npm init -y
npm install typescript --save-dev
npm install @types/node --save-dev
echo "Iniciando as configurações do compilador de typescript TSC..."
npx tsc --init --rootDir src --outDir build \
--esModuleInterop --resolveJsonModule --lib es6 \
--module commonjs --allowJs true --noImplicitAny true
echo "Criando a pagina SRC do projeto e o index.ts.."
mkdir src
touch src/index.ts
echo "Instalando o nodemon..."
npm install --save-dev ts-node nodemon
echo "dando os toques finais..."
echo '{
  "watch": ["src"],
  "ext": ".ts,.js",
  "ignore": [],
  "exec": "npx ts-node ./src/index.ts"
}' > nodemon.json
echo '{
  "name": "project-amn",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "npx tsc",
    "dev":"npx nodemon",
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/node": "^20.8.8",
    "typescript": "^5.2.2"
  }
}' > package.json
echo "Criando o .env"
echo "" > .env
echo "" > example.env
echo ".env" > .gitignore
echo "Projeto configurado, até a proxima"