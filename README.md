# admin-template

## Environment

- Shell: bash
- Node.js: `14.15.4`
    - Yarn package manager: `1.22.10`

### Docker containers
- networks:
    - **appnet**: `local`
        - All docker containers in this project will be belonged to this network
- volumes:
    - **mongodb-data**: `local`
        - Volume for mongodb service container
- services:
    - **node**: `mcr.microsoft.com/playwright` (Node.js 14.x)
        - Node.js service container
        - routes:
            - HTTP: http://localhost:{NODE_PORT:-5080} => http://node:5080
    - **mongodb**: `mongo:4.4`
        - MongoDB service container
        - routes:
            - TCP: `mongodb://root:root@mongodb:27017`
    - **express**: `mongo-express:latest`
        - MongoDB admin panel service container
        - routes:
            - http://localhost:{MONGODB_EXPRESS_PORT:-27080} => http://express:8081

### Setup
```bash
# Add execution permission to the CLI tool
$ chmod +x ./x

# Build the docker containers
$ ./x build

# Launch the docker containers
$ ./x up -d

# => http://localhost:5080
```

***

## Create strapi project

```bash
# strapiプロジェクト作成
## $ export USER_ID=$UID && docker-compose exec node yarn create strapi-app app
$ ./x node yarn create strapi-app app

# => strapi-app project settings: データベースに MongoDB を使うように設定する
## Choose your installation type: Custom (manual settings)
## Choose your default database nodeent (Use arrow keys): mongo
## Database name: app
## Host: 127.0.0.1
## +srv connection: false
## Port (It will be ignored if you enable +srv): 27017
## Username: root
## Password: root
## Authentication database (Maybe "admin" or blank): (blank)
## Enable SSL connection (y/N): n

# strapi開発サーバ起動
## $ export USER_ID=$UID && docker-compose exec -w /work/app/ node yarn develop
$ w=./app/ ./x node yarn develop
```

***

## Create react-admin project

```bash
# react-app プロジェクト作成 => ./admin/
$ ./x node yarn create react-app admin

# react-admin 関連パッケージインストール
$ w=admin ./x node yarn add react-admin ra-data-json-server prop-types

# start development server: => http://localhost:3000
$ w=admin ./x node yarn start
```

### 日本語翻訳
```bash
# react-admin 日本語翻訳プラグインインストール
$ w=admin ./x node yarn add @bicstone/ra-language-japanese ra-i18n-polyglot
```

```javascript
// src/App.js
import * as React from "react";
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

// 日本語翻訳プラグイン
import japaneseMessages from '@bicstone/ra-language-japanese';
import polyglotI18nProvider from 'ra-i18n-polyglot';

const i18nProvider = polyglotI18nProvider(() => japaneseMessages, 'ja');

// JsonServerから自動的にAdminパネル生成
const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
const App = () => (
  <Admin i18nProvider={i18nProvider} dataProvider={dataProvider}>
    <Resource name="users" list={ListGuesser} />
  </Admin>
);

export default App;
```

### Snowpack + React-Admin
**React-Admin is not available on Snowpack 3.1.x**

(`TypeError: callBind is not a function` will be occured)

![snowpack-3.1-error.png](./img/snowpack-3.1-error.png)

So, you must install **Snowpack 3.0.x**

```diff
- "snowpack": "^3.0.11"
+ "snowpack": "~3.0.11"
```
