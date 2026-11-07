# Política de Segurança da Informação e Conformidade LGPD

Este documento consolida as diretrizes e mecanismos técnicos implementados no Painel do Lojista para proteção de dados pessoais e segurança da informação, em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).

---

## 1. Segurança de Senhas e Autenticação (E1)

1. **Algoritmo de Hashing Criptográfico**:
   * As senhas de acesso de todos os operadores são processadas via **scrypt** (`node:crypto`), utilizando parâmetros calibrados para resistência contra ataques de dicionário e hardware especializado (ASICs/GPUs):
     * Custo de CPU/Memória ($N$): $16.384$
     * Tamanho de bloco ($r$): $8$
     * Paralelização ($p$): $1$
     * Chave derivada: $64$ bytes ($512$ bits) com salt criptográfico aleatório único por usuário.
2. **Comparação Timing-Safe**:
   * A verificação de hashes de senha utiliza `crypto.timingSafeEqual` para eliminar qualquer vulnerabilidade a ataques de canal lateral baseados em tempo (*timing attacks*).
3. **Gestão de Sessões Seguras**:
   * Sessões vinculadas a tokens aleatórios criptograficamente fortes de 256 bits (`randomBytes(32)`).
   * Armazenadas no navegador em cookies com flags `HttpOnly; SameSite=Strict; Secure; Max-Age=86400` (24 horas).
4. **Proteção Contra Força Bruta (Rate Limiting)**:
   * O endpoint `/api/auth/login` impõe um limite estrito de **5 tentativas falhas** por IP/e-mail a cada 15 minutos. Após exceder o limite, o servidor retorna status `429 Too Many Requests`.

---

## 2. Criptografia em Repouso e Proteção de Dados Sensíveis (LGPD)

1. **Cifragem Autenticada AES-256-GCM**:
   * Todos os dados pessoais sensíveis armazenados no banco de dados (CPF, dados bancários de consignantes e endereços de clientes) são cifrados antes da escrita utilizando o padrão **AES-256-GCM** (*Galois/Counter Mode*).
   * Cada registro possui seu próprio Vetor de Inicialização (IV de 12 bytes) e Tag de Autenticação (16 bytes), garantindo tanto o sigilo quanto a integridade contra adulteração em disco.
2. **Mascaramento em Tela**:
   * Na visualização do painel, os dados são exibidos de forma mascarada:
     * **CPF**: `***.456.789-**`
     * **Dados Bancários / PIX**: `****-5`
   * Apenas em rotinas de impressão formal de contrato pelo titular ou pelo proprietário os dados são decifrados pontualmente.
3. **Sanitização Estrita de Logs de Depuração**:
   * Nenhum dado de cartão, senha em texto plano, CPF ou chave privada é gravado nos arquivos de log da aplicação. O utilitário `sanitizeLogData()` higieniza preventivamente qualquer payload antes do registro.

---

## 3. Direitos do Titular de Dados (Artigos 18 e 19 da LGPD)

O sistema disponibiliza ferramentas operacionais no módulo de Governança para atendimento aos direitos dos clientes:
1. **Direito de Acesso e Exportação (Art. 18, II)**:
   * O proprietário da loja pode exportar um arquivo JSON/Dossiê consolidado de todos os dados mantidos sobre o titular (`GET /api/tier3/lgpd/export/:clientId`), incluindo histórico de interações e contratos emitidos.
2. **Direito ao Esquecimento / Anonimização (Art. 18, VI)**:
   * A pedido do titular, a rotina `POST /api/tier3/lgpd/anonymize/:clientId` substitui o nome pelo identificador anônimo *"Titular Anonimizado (LGPD)"*, substitui CPF e endereço por dados genéricos cifrados e expurga e-mail e telefone, preservando apenas os lançamentos fiscais e contábeis exigidos por lei para a concessionária.

---

## 4. Política de Backup e Retenção do Banco SQLite

1. **Isolamento por Instalação**:
   * Cada concessionária possui seu próprio arquivo de banco de dados SQLite (`server/data/merchant.db`), garantindo isolamento absoluto de dados entre clientes (sem multi-tenancy compartilhado).
2. **Rotina de Backup Recomendada**:
   * Executar backup diário do arquivo `.db` via comando nativo de snapshot do SQLite:
     ```bash
     sqlite3 server/data/merchant.db ".backup server/backups/merchant_$(date +%Y%m%d).db"
     ```
3. **Retenção de Auditoria**:
   * Os registros da tabela `audit_logs` são preservados pelo prazo mínimo de 6 meses (Marco Civil da Internet, Lei 12.965/2014) e até 5 anos para eventos de emissão contratual.

---

## 5. Aviso Legal Obrigatório sobre Contratos e Minutas

> [!WARNING]
> **REVISÃO JURÍDICA OBRIGATÓRIA**: As minutas de contratos, recibos de sinal, termos de vistoria e termos aditivos gerados pela plataforma são instrumentos referenciais padronizados. Antes de qualquer utilização comercial definitiva ou coleta de assinaturas, a loja deve submetê-las à análise, revisão e validação formal de um advogado ou departamento jurídico habilitado.
