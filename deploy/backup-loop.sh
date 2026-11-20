#!/bin/sh
# Backup diário às 03:00 (horário do servidor) e teste de restauração:
# mensal (dia 1) nos 3 primeiros meses da instalação; depois, trimestral (dia 1 de jan, abr, jul, out).
# O resultado fica em /backups/backup-status.json e /backups/restore-test-status.json.

INSTALLED_FILE=/backups/.instalada-em

while true; do
  now_s=$(( $(date +%H) * 3600 + $(date +%M) * 60 + $(date +%S) ))
  wait_s=$(( (86400 + 3 * 3600 - now_s) % 86400 ))
  [ "$wait_s" -lt 60 ] && wait_s=60
  sleep "$wait_s"

  node /app/server/src/cli/backup.js || echo "ATENCAO: backup falhou ou sem copia externa (codigo $?)"

  if [ "$(date +%d)" = "01" ]; then
    installed=$(cat "$INSTALLED_FILE" 2>/dev/null || date +%s)
    age_days=$(( ( $(date +%s) - installed ) / 86400 ))
    month=$(date +%m)
    if [ "$age_days" -lt 100 ] || [ "$month" = "01" ] || [ "$month" = "04" ] || [ "$month" = "07" ] || [ "$month" = "10" ]; then
      node /app/server/src/cli/restore-test.js || echo "ATENCAO: teste de restauracao falhou"
    fi
  fi
done
