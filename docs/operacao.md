# Operação: implantar, fazer backup e restaurar

Manual de bolso da empresa. Cada cliente tem **uma instalação própria** (pasta, banco, fotos e chaves exclusivos), todas a partir do mesmo código.

## 1. Preparar o servidor (uma vez)

- VPS com Docker, Docker Compose e Caddy. `rclone` configurado para o armazenamento externo (ex.: Cloudflare R2): `rclone config`, remoto `r2`.
- Observação (19/11/2026): as imagens `up-merchant-site` e `up-merchant-painel` são do stack Astro guardado; o front do produto passa a ser os protótipos em modo real, e o `provision.js` ainda gera o compose com esses dois serviços até essa parte ser refeita.
- Construir as imagens na raiz do repositório: `docker build -f deploy/Dockerfile -t up-merchant-server:latest .` (API) e `docker build -f deploy/Dockerfile.site -t up-merchant-site:latest .` (site público) e `docker build -f deploy/Dockerfile.painel -t up-merchant-painel:latest .` (painel da loja).
- Pasta base dos clientes, por exemplo `/srv/clientes`. As pastas `data` e `backups` de cada cliente precisam pertencer ao usuário 1000 (`chown -R 1000:1000`), que é o usuário do contêiner.

## 2. Implantar um cliente novo

```
node server/src/cli/provision.js --client auto-silva --tier 2 \
  --name "Auto Silva" --cnpj 12.345.678/0001-90 --city Brasília --uf DF \
  --owner-name "João Silva" --owner-email joao@autosilva.com.br \
  --origin https://www.autosilva.com.br --port 3101 --out /srv/clientes \
  [--addons ai,fipe] [--quota ai_month=500] [--leads-email vendas@autosilva.com.br]
```

- `--tier`: 1 Basic, 2 Expert, 3 Premium. `--addons`: módulos avulsos contratados na OS. `--port`: uma porta local diferente por cliente.
- O comando mostra **uma única vez** a `DATA_ENCRYPTION_KEY`, a `ADMIN_API_KEY`, a `BACKUP_PASSPHRASE` e a senha provisória do proprietário. **Guarde as três chaves no cofre de senhas da empresa agora.** Sem a `DATA_ENCRYPTION_KEY`, CPF e dados bancários de um backup não abrem.
- Depois: editar `/srv/clientes/auto-silva/.env` e preencher `BACKUP_RCLONE_REMOTE` (ex.: `r2:bucket-da-empresa/auto-silva`), `RESEND_API_KEY`, `EMAIL_FROM` e `PROVIDER_EMAIL`; `docker compose up -d`; criar o bloco do cliente no Caddy (modelo em `deploy/Caddyfile.exemplo`); conferir `https://api.autosilva.com.br/api/health`.
- Importar o estoque: converter a planilha (`python server/tools/xlsx_para_csv.py Estoque.xlsx estoque.csv`) e conferir com `node server/src/cli/import-stock.js estoque.csv --dry-run`. Sem erros, repetir sem `--dry-run`. É tudo ou nada.
- Antes de entregar ao cliente: rodar um backup e um teste de restauração (seção 3).

### Primeiro acesso

O proprietário entra no painel com a senha provisória mostrada pelo `provision.js` e é obrigado a trocá-la. Toda pessoa que o proprietário adicionar na tela Equipe (ou cuja senha ele redefinir) também troca a senha provisória no primeiro acesso. Para importar o estoque, o proprietário ou gerente usa a tela Estoque > Importar planilha (CSV); o painel mostra o modelo.

## 3. Backup e restauração

- O contêiner `backup` roda sozinho todo dia às 03:00: banco consistente (`VACUUM INTO`) mais fotos, cifrado com a `BACKUP_PASSPHRASE`, copiado para fora do servidor por `rclone sync`. Retenção: **30 diários e 12 mensais**. Objetivo de ponto de recuperação: 24 h.
- Resultado: `backups/backup-status.json`. Código de saída 3 significa backup feito, mas **sem cópia externa**: não vale como proteção.
- Teste de restauração automático no dia 1 de cada mês nos 3 primeiros meses da instalação; depois, em janeiro, abril, julho e outubro. Resultado em `backups/restore-test-status.json`.
- Teste manual: `docker compose exec backup node server/src/cli/restore-test.js` (usa o backup mais recente). Para extrair os dados: `... restore-test.js arquivo.tar.enc --extract-to /tmp/restaurado`.
- **Restaurar de verdade (perda do servidor):** subir o servidor novo, baixar o backup do armazenamento externo, extrair com o comando acima, parar a instalação, copiar `merchant.db` para `data/` e as fotos para `data/media/`, subir de novo. Exige o `.env` original (as chaves estão no cofre).

## 4. Atualizar o sistema

Construir a imagem nova e, cliente por cliente: `docker compose pull && docker compose up -d`. As migrações do banco rodam sozinhas, com backup automático antes (`data/backups/pre-migracao-*.db`). Atualizar primeiro a demonstração e um cliente piloto.

## 5. Demonstração para vendas

Criar uma instalação com `SEED_DEMO=true` no `.env` (dados fictícios) e agendar `deploy/demo-reset.sh /srv/clientes/demo` todo dia às 04:00. O script recusa rodar em instalação sem `SEED_DEMO=true`.

## 6. Encerramento de cliente (contrato, item 13.9)

Pedido feito em até 30 dias: gerar a exportação (estoque pelo painel; contatos, clientes e configurações por consulta ao banco) e as fotos (`data/media`), entregar sem custo, uma vez. Depois do prazo: apagar a pasta do cliente e os backups no armazenamento externo (os mensais saem no ciclo de 12 meses).

## 7. Pendências conhecidas

Painel de acompanhamento de todas as instalações (disponibilidade, último backup, consumo de IA, número de veículos) ainda não existe: hoje o acompanhamento é pelos arquivos de status e pelo `/api/health` de cada cliente.
