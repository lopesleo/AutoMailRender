================================================================================
AutoU Email Analyzer - Guia Técnico
Produção (Frontend): https://automailrenderfront.onrender.com/
================================================================================

ÍNDICE

1. Visão Geral
2. Arquitetura
3. Stack Tecnológica
4. Estrutura de Diretórios
5. Requisitos
6. Configuração do Backend (FastAPI)
7. Variáveis de Ambiente (.env)
8. Execução do Backend
9. Configuração do Frontend (Vite + React 19 + Tailwind v4)
10. Variáveis de Ambiente do Frontend
11. Execução do Frontend
12. Fluxo de Análise (Pipeline)
13. Endpoints da API (com exemplos curl)
14. Exemplo de Resposta
15. Tratamento de Erros
16. Build de Produção
17. Deploy (Notas)
18. Estilos e UI
19. Referências Internas de Código
20. Melhorias Futuras

---

1. VISÃO GERAL

---

Aplicação que:

- Recebe texto ou arquivo (.txt / .pdf)
- Classifica em categoria estratégica (PRODUTIVO | IMPRODUTIVO)
- Gera justificativa curta (reason)
- Retorna resposta de e-mail pronta (response)

Backend: FastAPI integra Google Gemini via SDK.  
Frontend: SPA em React 19 consumindo API REST.

---

2. ARQUITETURA

---

Frontend (Vite) -> Chamada POST -> Backend FastAPI -> Função
[`services.email_service.analyze_email_content`](backend/services/email_service.py) ->
Modelo Gemini -> Parser tipado -> Retorna JSON validado por
[`models.response.EmailAnalysisResponse`](backend/models/response.py) -> Renderização em
[frontend/src/App.tsx](frontend/src/App.tsx)

Prompt completo está centralizado em [backend/core/prompts.py](backend/core/prompts.py).

---

3. STACK TECNOLÓGICA

---

Backend:

- FastAPI
- pydantic
- google-genai (Gemini 2.5 Flash Lite)
- pypdf (extração de texto de PDF)
- uvicorn
  Frontend:
- React 19 / ReactDOM
- Vite
- Tailwind CSS v4 (@tailwindcss/vite)
- Radix UI (Tabs, etc.)
- class-variance-authority / tailwind-merge
- Lucide Icons

---

4. ESTRUTURA (simplificada)

---

backend/
main.py
core/prompts.py
services/email_service.py
models/response.py
requirements.txt
frontend/
src/App.tsx
src/lib/utils.ts
src/index.css
package.json
tsconfig\*.json

---

5. REQUISITOS

---

Backend:

- Python 3.11+ (recomendado)
  Frontend:
- Node.js 20 LTS (compatível com dependências)
- pnpm (ou npm/yarn, mas lockfile é pnpm)

---

6. CONFIGURAÇÃO DO BACKEND

---

Criar e ativar ambiente virtual:
Windows:
python -m venv .venv
.venv\Scripts\activate
Linux/macOS:
python -m venv .venv
source .venv/bin/activate

Instalar dependências:
pip install -r backend/requirements.txt

---

7. VARIÁVEIS DE AMBIENTE (.env na pasta backend)

---

Exemplo:
GEMINI_API_KEY=xxxxx_sua_chave_google_xxxxx
FRONTEND_URL=http://localhost:5173

A variável FRONTEND_URL é utilizada na configuração de CORS em [backend/main.py](backend/main.py).

---

8. EXECUÇÃO DO BACKEND

---

Dentro da pasta backend (ou root ajustando PYTHONPATH):
uvicorn main:app --reload --port 8000

Teste rápido:
curl http://localhost:8000/health

Retorno esperado:
{"status":"healthy","service":"email-analysis"}

---

9. CONFIGURAÇÃO DO FRONTEND

---

Instalação (na pasta frontend):
pnpm install

Scripts (ver [frontend/package.json](frontend/package.json)):
pnpm dev (modo desenvolvimento)
pnpm build (gerar build de produção)
pnpm preview (servir build gerado)

---

10. VARIÁVEIS DE AMBIENTE DO FRONTEND

---

Criar arquivo frontend/.env (ou .env.local) com:
VITE_API_BASE_URL=http://localhost:8000

O código em [frontend/src/App.tsx](frontend/src/App.tsx) lê:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

---

11. EXECUÇÃO DO FRONTEND

---

Iniciar (porta padrão Vite: 5173):
pnpm dev

Acessar:
http://localhost:5173/

---

12. FLUXO DE ANÁLISE (PIPELINE)

---

1. Usuário insere texto ou arquivo
2. Frontend monta FormData (campo "content" ou "file")
3. POST /api/email/analyze
4. Backend valida extensão (.txt ou .pdf)
5. PDF -> extrai texto (pypdf)
6. Trunca entrada (limite definido em [`services.email_service.analyze_email_content`](backend/services/email_service.py))
7. Constrói prompt -> envia para Gemini (schema tipado)
8. Resposta validada por [`models.response.EmailAnalysisResponse`](backend/models/response.py)
9. Frontend exibe categoria, reason, response

---

13. ENDPOINTS DA API

---

Base: http://localhost:8000

GET / -> Status simples
GET /health -> Healthcheck
POST /api/email/analyze
Form fields: - content (string) opcional - file (UploadFile) opcional
Regra: deve enviar um dos dois.

Exemplos curl:

a) Texto puro:
curl -X POST http://localhost:8000/api/email/analyze \
 -F "content=Gostaria de saber o status da minha solicitação de crédito."

b) Arquivo .txt:
curl -X POST http://localhost:8000/api/email/analyze \
 -F "file=@exemplo.txt"

c) Arquivo .pdf:
curl -X POST http://localhost:8000/api/email/analyze \
 -F "file=@documento.pdf"

---

14. EXEMPLO DE RESPOSTA

---

{
"category": "PRODUTIVO",
"reason": "Cliente solicita status de processo.",
"response": "Olá,\nSua solicitação foi recebida ...\nAtenciosamente,\nEquipe AURABank"
}

---

15. TRATAMENTO DE ERROS (principais)

---

400: Formato inválido, ausência de conteúdo, PDF ilegível  
500: Falha interna (ex: exceção genérica ou SDK)  
Mensagens detalhadas definidas em [backend/main.py](backend/main.py)

---

16. BUILD DE PRODUÇÃO (FRONTEND)

---

Na pasta frontend:
pnpm build
Saída gerada em: frontend/dist/
Servir conteúdo estático (ex: Nginx, Render, Vercel).  
Configurar VITE_API_BASE_URL apontando para URL pública do backend.

---

17. DEPLOY (NOTAS)

---

Frontend já em produção: https://automailrenderfront.onrender.com/  
Backend deve expor CORS incluindo a origem de produção (ajuste FRONTEND_URL em .env).  
Recomendações:

- Ativar log estruturado no backend
- Monitorar latência do endpoint /api/email/analyze
- Rotacionar GEMINI_API_KEY periodicamente

---

18. ESTILOS E UI

---

Tailwind v4 configurado em [frontend/src/index.css](frontend/src/index.css); utilitário de merge em
[frontend/src/lib/utils.ts](frontend/src/lib/utils.ts). Componentes principais (Cards, Inputs, etc.)
estão em /frontend/src/components/ui/.

---

19. REFERÊNCIAS INTERNAS

---

Prompt: [backend/core/prompts.py](backend/core/prompts.py)  
Função principal de análise: [`services.email_service.analyze_email_content`](backend/services/email_service.py)  
Modelo de resposta: [`models.response.EmailAnalysisResponse`](backend/models/response.py)  
Rota FastAPI: [backend/main.py](backend/main.py)  
Interface e chamadas: [frontend/src/App.tsx](frontend/src/App.tsx)

---
