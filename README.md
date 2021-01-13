# admin-template

## Environment

- Shell: `bash`
- Docker: `19.03.12`
    - docker-compose: `1.26.0`

### Setup
```bash
# Docker構成スクリプトに実行権限を付与
$ chmod +x ./n

# Docker構成テンプレートを展開
$ ./n init
```

#### Structure
```bash
./ # mount to => service://node:/work/
|_ .env # Dockerコンテナ実行ポート等の環境変数設定
|_ .gitignore
|_ Dockerfile # nodeサービスコンテナ（Nodejs同梱コンテナ）ビルド設定
|_ docker-compose.yml # Docker構成設定
|_ n # Docker環境構成・各種操作用スクリプト
```

#### Docker containers
- networks:
    - **appnet**: `bridge`
        - node service container 以外のコンテナが所属する仮想ネットワーク
- volumes:
    - **mongo-data**: `local`
        - mongo service container データ永続化用
- services:
    - **node**: `mcr.microsoft.com/playwright`
        - Node.js (ver.14.x) command line interface with Playwright
        - http://localhost => service://node
            - hostサーバで実行される
    - **mongo**: `mongo:4.4`
        - MongoDB Datbase Server
        - tcp://localhost:27017 => service://db:27017
            - MongoDB接続ポートは `MONGO_PORT` 環境変数で変更可能
        - Login:
            - User: `root`
            - Password: `root`
    - **admin**: `mongo-express:latest`
        - MongoDB Database Admin Server
        - http://localhost:8081 => service://admin:8081
            - 管理画面ポートは `MONGO_EXPRESS_PORT` 環境変数で変更可能
    - **restheart**: `softinstigate/restheart:5.1.1`
        - MongoDB REST API Server 
        - http://localhost:8080 => service://restheart:8080
            - APIポートは `RESTHEART_PORT` 環境変数で変更可能

### Usage
```bash
# Dockerコンテナ構築
## $ export USER_ID=$UID && docker-compose build
$ ./n build

# Dockerコンテナ起動
$ ./n up -d

# => Launch docker containers
## node service container: on host server
## mongo service container: http://localhost:27017
## admin service container: http://localhost:8081
## restheart service container: http://localhost:8080

# strapiプロジェクト作成
## $ export USER_ID=$UID && docker-compose exec node yarn create strapi-app app
$ ./n node yarn create strapi-app app

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
$ w=./app/ ./n node yarn develop
```
