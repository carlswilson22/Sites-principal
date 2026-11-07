# Manuais de Integração e Configuração de Ambiente

Este guia detalha o processo de parametrização de serviços externos, chaves de API e variáveis de ambiente no Painel do Lojista.

---

## 1. Variáveis de Ambiente Essenciais (`.env`)

Crie um arquivo `.env` na raiz do diretório `server/` ou defina as variáveis no serviço de hospedagem (ex: Railway, Render, Docker):

```env
# ==========================================
# CONFIGURAÇÕES NUCLEARES DA INSTALAÇÃO
# ==========================================
PORT=3001
NODE_ENV=production
MERCHANT_TIER=3 # 1 = AutoElite (Básico), 2 = DriveNow (Pro), 3 = Apex Luxury (Enterprise)
DEMO_MODE=0     # 1 = Ativa dados fictícios automáticos | 0 = Produção limpa
DATABASE_PATH=./data/merchant.db

# ==========================================
# SEGURANÇA E CRIPTOGRAFIA EM REPOUSO (LGPD)
# ==========================================
# Chave mestra de 32 bytes em formato hexadecimal para cifragem AES-256-GCM de CPF e dados bancários
CRYPTO_SECRET_KEY=9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0

# ==========================================
# IA GENERATIVA (DESCRIÇÕES E CUSTOS - I1)
# ==========================================
# Chave da API oficial do Google Gemini (Interactions / AI Studio)
GEMINI_API_KEY=AIzaSy...

# ==========================================
# METE GRAPH API (INSTAGRAM STORIES - A7)
# ==========================================
# Token de usuário do sistema Meta com permissão 'instagram_content_publish'
INSTAGRAM_ACCESS_TOKEN=EAAG...
# ID da Conta Profissional do Instagram vinculada à Página do Facebook
INSTAGRAM_ACCOUNT_ID=178414...

# ==========================================
# NOTIFICAÇÕES WEB PUSH (PWA - I3)
# ==========================================
VAPID_PUBLIC_KEY=BEl62iUYg...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:suporte@sualoja.com.br
```

---

## 2. Manual de Integração: Instagram Graph API (Meta)

### Pré-requisitos Obrigatórios da Meta:
1. Conta no Instagram configurada como **Profissional / Comercial** (Business ou Creator).
2. Página Comercial do Facebook vinculada diretamente ao perfil do Instagram.
3. Aplicativo registrado no portal [Meta for Developers](https://developers.facebook.com/).
4. Permissões concedidas no App: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.

### Fluxo de Publicação de Stories:
* **Passo 1 (Criação do Container)**:
  `POST https://graph.facebook.com/v19.0/{INSTAGRAM_ACCOUNT_ID}/media?media_type=STORIES&image_url={URL_PUBLICA_DA_IMAGEM}&access_token={INSTAGRAM_ACCESS_TOKEN}`
* **Passo 2 (Publicação Efetiva)**:
  `POST https://graph.facebook.com/v19.0/{INSTAGRAM_ACCOUNT_ID}/media_publish?creation_id={CONTAINER_ID}&access_token={INSTAGRAM_ACCESS_TOKEN}`

> [!IMPORTANT]
> **Regra de Transparência do Sistema**: Se `INSTAGRAM_ACCESS_TOKEN` ou `INSTAGRAM_ACCOUNT_ID` não forem definidos, o sistema reporta o status transparente `nao_configurado`. Em nenhuma hipótese o sistema simula publicações falsas. O lojista pode clicar no botão **"Baixar Story (1080x1920)"** e efetuar a postagem diretamente pelo aplicativo móvel.

---

## 3. Manual de Notificações Web Push (PWA) e Limitações iOS

O painel utiliza a API padrão de Service Workers (`PushManager` e `showNotification`).

### Limitação Específica do Apple iOS (Safari):
* O suporte a Web Push no ecossistema iOS (iPhone/iPad) está disponível a partir do **iOS 16.4**.
* **Condição Obrigatória**: O lojista **deve** abrir o site no Safari, tocar no botão de compartilhamento e selecionar **"Adicionar à Tela de Início"** (PWA instalado).
* As notificações só poderão ser recebidas após o aplicativo ser executado como PWA na tela inicial e a permissão for explicitamente aceita.
* No Google Chrome e navegadores Android/Desktop, as notificações operam diretamente no navegador sem a necessidade de instalação prévia na tela inicial.

---

## 4. Manual de Exportação e Integração de Portais (OLX, WebMotors, Mercado Livre)

Conforme a especificação do projeto, a publicação direta automatizada em portais requer acordos comerciais individuais de revenda (contratos B2B de integradores). 

O sistema disponibiliza o adaptador padronizado que gera os dados em dois formatos universais:
1. **Endpoint CSV**: `GET /api/tier3/portals/export?format=csv`
   * Exporta arquivo `.csv` codificado em UTF-8 com separador `;` pronto para upload em planilhas de carga de portais.
2. **Endpoint JSON Estruturado**: `GET /api/tier3/portals/export?format=json`
   * Exporta a carga completa com metadados, links de fotos, quilometragem, histórico FIPE e atributos técnicos.
