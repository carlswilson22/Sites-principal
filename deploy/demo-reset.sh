#!/bin/sh
# Reinicia a instalação de DEMONSTRAÇÃO com dados fictícios novos. Rodar todo dia (cron), ex.: 0 4 * * *
# Só use em uma instalação criada para demonstração (SEED_DEMO=true no .env). NUNCA em cliente real.
# Uso: demo-reset.sh /srv/clientes/demo
set -eu
DIR="${1:?Informe a pasta da instalação de demonstração}"
grep -q '^SEED_DEMO=true' "$DIR/.env" || { echo "Recusado: $DIR não é uma instalação de demonstração (SEED_DEMO=true ausente)."; exit 1; }
cd "$DIR"
docker compose stop api
rm -rf data/merchant.db data/merchant.db-wal data/merchant.db-shm data/media
mkdir -p data/media
docker compose up -d api
echo "Demonstração reiniciada em $(date)"
