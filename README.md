## Project setup

```bash
npm install
```

### Compiles and hot-reloads for development

```bash
npm run dev
```

### Compiles and minifies for production

```bash
npm run build
```

## Usage

```bash
git clone https://github.com/zjavax/cardano-wallet-connector-vue.git
cd cardano-wallet-connector-vue
npm i
npm run dev
```

### Custom theme

See `src/styles/element/index.scss`.

# 国内

```
npm config set registry http://registry.npm.taobao.org
```

# 本项目UI模板

https://vite-starter.element-plus.org/

# 备注

部署到云上，需要在config文件里配置host: '0.0.0.0'

```
export default defineConfig({
  server: { host: '0.0.0.0', port: 4001 },
```
