# Linha de Produção de Conteúdo com IA

Curso prático em missões para usar Grok, Prompt Cowboy, Claude e APIs juntos na produção de conteúdo para Instagram, TikTok e YouTube Shorts. Baseado no guia "Automação de marketing com IA" (novembro de 2026), que vai junto neste repositório.

O site tem três partes, todas com plano gratuito:

| Parte | Onde fica | Para que serve |
| --- | --- | --- |
| O site | GitHub Pages (este repositório) | As páginas do curso |
| Login e progresso | Supabase | Conta de cada aluno e progresso salvo na nuvem |
| IA | Render (repositório `linha-producao-api`) | Guarda a chave da Groq e responde aos botões de IA |

Sem o Supabase configurado, o site funciona sem login e salva o progresso só no aparelho.

## Regra de ouro: a chave da Groq

A chave da Groq (começa com `gsk_`) **nunca** vai neste repositório, porque ele é público e qualquer pessoa poderia usá-la por sua conta. Ela fica só no Render, como variável de ambiente.

## 1. Supabase (login e progresso)

1. Crie uma conta em supabase.com e um projeto novo. Guarde a senha do banco.
2. No menu lateral, abra **SQL Editor**, cole todo o conteúdo do arquivo `supabase.sql` e clique em **Run**.
3. Em **Authentication > URL Configuration**, coloque em **Site URL** o endereço do seu site no GitHub Pages, por exemplo `https://mgmf9.github.io/linha-de-producao/`, e adicione o mesmo endereço em **Redirect URLs**. É para lá que os links de confirmação e de nova senha levam.
4. Opcional: em **Authentication > Sign In / Providers > Email**, desligue **Confirm email** se quiser que a conta funcione sem confirmar o e-mail. O envio de e-mails do plano gratuito tem um limite baixo por hora.
5. Em **Project Settings > API Keys**, copie:
   - o **Project URL**;
   - a chave **publishable** (ou a **anon public**, nas chaves antigas).
   Nunca use a chave **secret** ou **service_role** no site: o próprio site se recusa a funcionar com ela.

No plano gratuito, um projeto com pouco uso por cerca de uma semana pode ser pausado. Para reativar, abra o projeto no painel e clique em **Resume project**; os dados continuam lá.

## 2. Render (servidor da IA)

1. Crie um repositório novo no GitHub chamado `linha-producao-api` e envie os arquivos do pacote `linha-producao-api.zip` (`server.js`, `package.json` e `README.md`).
2. No render.com, clique em **New > Web Service**, conecte esse repositório e use:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
3. Em **Environment**, adicione as variáveis:

   | Nome | Valor |
   | --- | --- |
   | `GROQ_API_KEY` | a sua chave da Groq |
   | `SUPABASE_URL` | o Project URL do Supabase |
   | `SUPABASE_ANON_KEY` | a chave publishable (ou anon) do Supabase |
   | `ORIGEM_PERMITIDA` | `https://mgmf9.github.io` (só o domínio, sem o nome do repositório) |

4. Depois do deploy, abra `https://SEU-SERVICO.onrender.com/saude`. Deve aparecer `"ok":true,"ia":true,"login":true`.

No plano gratuito, o servidor dorme depois de 15 minutos sem uso e leva cerca de um minuto para acordar. O site avisa quando isso acontece; o site em si e o login não dependem dele.

## 3. config.js

Abra `config.js` neste repositório (no GitHub: clique no arquivo e no lápis para editar) e preencha:

```js
window.CONFIG = {
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabaseAnonKey: 'sb_publishable_...',
  apiUrl: 'https://SEU-SERVICO.onrender.com'
};
```

A chave publishable do Supabase pode ficar aqui: ela é feita para sites, e o banco só deixa cada aluno ver o próprio progresso. A chave da Groq não.

## 4. GitHub Pages

1. Envie todos os arquivos deste pacote para a raiz do repositório do site ("Add file > Upload files", selecione todos com Ctrl+A). O upload substitui os arquivos de mesmo nome.
2. Em **Settings > Pages**: **Deploy from a branch**, branch **main**, pasta **/ (root)**, **Save**.
3. Em um ou dois minutos o site fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Trocar o logo

O logo do site, o ícone da aba do navegador e o ícone do app na tela do celular vêm todos do arquivo `logo.png`. Para trocar, crie a sua imagem, salve com o nome `logo.png` e envie para o repositório: o upload substitui o arquivo antigo.

- Formato quadrado, **512 x 512 pixels**, PNG.
- Um desenho simples, que dê para reconhecer bem pequeno (32 pixels). Evite foto e texto miúdo.
- Deixe uma margem de uns 10% em volta: o celular pode arredondar os cantos do ícone.
- Use só imagens que você pode usar comercialmente.

## Instalar no celular

O site pode ser instalado como app: no Android, pelo menu do Chrome ("Instalar app"); no iPhone, pelo Safari (Compartilhar > "Adicionar à Tela de Início"). O passo a passo também aparece na página Mais do site. Os arquivos `manifest.webmanifest` e `sw.js` cuidam disso; o `sw.js` também deixa o site abrir com internet fraca.

## O que tem no site

- **6 módulos**, cada um dividido em etapas curtas: leitura, acesso, missões e perguntas, com uma barra de progresso no estilo dos Stories.
- **14 missões** com passos marcáveis, prompts para copiar, entregável e critérios de conclusão.
- **31 perguntas de verificação**, uma por vez, com explicação.
- **Revisão da IA** em cada missão: compara o entregável com os critérios e sugere melhorias.
- **Caderno de prompts** do v0 ao v6, com comparação entre versões e **Testar com IA** (preenche as variáveis e roda o prompt).
- **Diário de bordo**, **Trilha de 30 dias** e **Recursos** (checklist, planilha .csv, glossário, lacunas do guia, fontes).
- **Conta:** login, troca de senha, tema claro ou escuro, cópia de segurança do progresso.
- Layout próprio para celular (barra de abas) e para computador (barra lateral).

## Segurança

- O site recusa salvar ou enviar textos que parecem chaves de API (Groq, Claude, OpenAI, Google, GitHub, Meta, Supabase secret).
- O servidor só responde a alunos logados no Supabase, só aceita o seu site (ORIGEM_PERMITIDA) e limita cada aluno a 30 pedidos de IA por hora (mude com a variável `LIMITE_POR_HORA`).
- Se uma chave vazar, revogue no painel de quem a emitiu e crie outra.

## Arquivos

```
index.html                        a página
style.css                         o visual
app.js                            login, progresso, páginas e IA
curso.js                          o conteúdo do curso (edite aqui)
config.js                         endereços do Supabase e do Render
supabase.sql                      a tabela e as regras de acesso do banco
archivo-latin*.woff2, OFL-Archivo.txt   fonte Archivo e a licença dela
logo.png                          logo e ícone do app (troque por um seu)
manifest.webmanifest, sw.js       instalação no celular e funcionamento offline
planilha-de-conteudo.csv, guia-automacao-marketing-ia.pdf
```

Recursos, limites e preços de Grok, Prompt Cowboy, Claude, Supabase, Render e das redes mudam com frequência: confirme nos sites oficiais. O conteúdo sobre divulgação de publicidade não é orientação jurídica.
