FROM mcr.microsoft.com/playwright

# Docker実行ユーザIDを環境変数から取得
ARG UID

RUN : '日本語対応' && \
    apt-get update && \
    apt-get -y install locales fonts-ipafont fonts-ipaexfont && \
    echo "ja_JP UTF-8" > /etc/locale.gen && locale-gen && \
    : 'Add user $UID (if $UID already exists, then change user id)' && \
    if [ "$(getent passwd $UID)" != "" ]; then usermod -u $((UID + 100)) "$(getent passwd $UID | cut -f 1 -d ':')"; fi && \
    useradd -m -s /bin/bash -u $UID user && \
    apt-get install -y sudo && \
    echo 'user ALL=NOPASSWD: ALL' >> '/etc/sudoers' && \
    : 'install playwright' && \
    yarn global add playwright && \
    : 'fix permission' && \
    mkdir -p /usr/local/share/.config/ && \
    chown -R user /usr/local/share/.config/ && \
    : 'cleanup apt-get caches' && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ: ./ => service://node:/work/
WORKDIR /work/

# 作業ユーザ: user (UserID: $UID)
USER user
