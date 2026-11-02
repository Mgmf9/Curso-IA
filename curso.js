/*
  Conteúdo do curso "Linha de Produção de Conteúdo com IA".
  Fonte principal: guia "Automação de marketing com IA" (novembro de 2026), neste mesmo repositório.
  Para editar o curso, altere este arquivo. O site monta as páginas a partir destes dados.
  Textos em HTML simples: use <strong>, <code>, <a>, listas e tabelas. Não use crases (`) nem a sequência "${".
*/
window.CURSO = {
  meta: {
    titulo: 'Linha de Produção de Conteúdo com IA',
    curto: 'Linha de Produção',
    descricao: 'Curso prático em missões: Grok, Prompt Cowboy, Claude e APIs trabalhando juntos para produzir conteúdo para Instagram, TikTok e YouTube Shorts.',
    guia: {
      titulo: 'Automação de marketing com IA',
      data: 'novembro de 2026',
      arquivo: 'guia-automacao-marketing-ia.pdf'
    }
  },

  /* As seis etapas do fluxo do guia (seção 3) */
  estacoes: [
    { n: 1, nome: 'Pesquisa', quem: 'Grok', modulo: 2, texto: 'Busca assuntos em alta no seu nicho e lista ideias de pauta.' },
    { n: 2, nome: 'Instrução', quem: 'Prompt Cowboy', modulo: 3, texto: 'Você cria e refina os prompts-modelo uma vez.' },
    { n: 3, nome: 'Produção', quem: 'Claude', modulo: 4, texto: 'Gera legenda, roteiro, hashtags e chamada para ação.' },
    { n: 4, nome: 'Revisão', quem: 'Você', modulo: 4, humano: true, texto: 'Lê, ajusta, confere fatos e aprova. Não deve ser pulada.' },
    { n: 5, nome: 'Agendamento', quem: 'API ou script', modulo: 6, texto: 'Envia o conteúdo aprovado para a fila ou para o Instagram.' },
    { n: 6, nome: 'Medição', quem: 'API e Claude', modulo: 6, texto: 'Puxa as métricas, resume o que funcionou e sugere a próxima semana.' }
  ],

  /* Blocos que fazem o prompt evoluir. Os botões "Criar vX" do site acrescentam estes blocos. */
  blocos: {
    contexto: [
      '[CONTEXTO]',
      'Linha: {LINHA} (própria ou afiliado)',
      'Nicho próprio: Eu ajudo ... com ...',
      'Nicho de afiliados: Eu ajudo ... com ... | Programa: ...',
      'Público: {PUBLICO}',
      'Tom de voz: 3 adjetivos | o que eu nunca faço'
    ].join('\n'),
    pauta: [
      '[PAUTA]',
      'Pauta: {PAUTA}',
      'Evidência: {EVIDENCIA}',
      'Fonte conferida: {FONTE}',
      'Status: {STATUS}',
      'Regra: só afirme como fato o que estiver com status "verificada".',
      'Se não estiver, não use o dado.'
    ].join('\n'),
    estrutura: [
      '[ESTRUTURA]',
      'Tarefa: criar {FORMATO} para {REDE}.',
      '(Cole aqui a versão organizada pelo Prompt Cowboy. Depois, restaure o que',
      'sumiu: o tom de voz, a intenção do seu v0 e a regra do status da pauta.)'
    ].join('\n'),
    regraLinha: [
      '[REGRA DE LINHA]',
      'Se {LINHA} = afiliado:',
      '- use formato de review ou comparativo;',
      '- use dados do produto só da fonte conferida ({FONTE});',
      '- não prometa resultado;',
      '- deixe espaço para a divulgação (completa no Módulo 5).'
    ].join('\n'),
    verificacao: [
      '[VERIFICAÇÃO]',
      'Entregue os campos sempre na mesma ordem e com os mesmos nomes.',
      'No fim, liste "Pontos a verificar": todo fato, número, preço ou afirmação',
      'de saúde, finanças ou resultado que precise de checagem humana.',
      'Se não houver, escreva "nenhum".'
    ].join('\n'),
    oferta: [
      '[OFERTA E CONFORMIDADE]',
      'CTA: {CTA} | Link: {LINK}',
      'Se {LINHA} = afiliado ou parceria: inclua {DIVULGACAO} no começo da',
      'legenda e no vídeo (fala ou texto na tela).',
      'Nunca prometa resultado. Saúde, finanças e resultados vão sempre',
      'para "Pontos a verificar".',
      'Se usar imagem, voz ou pessoa gerada ou alterada por IA, avise no post.'
    ].join('\n'),
    automacao: [
      '[MODO AUTOMAÇÃO]',
      'Responda só com um objeto JSON, sem nenhum texto antes ou depois.',
      'Use como chaves os campos do formato de saída (minúsculas, sem acento,',
      'com _ no lugar de espaço) e inclua também "divulgacao" e',
      '"pontos_a_verificar". Use "nenhum" quando um campo não se aplicar.',
      'As variáveis entre chaves já chegam preenchidas pelo script.'
    ].join('\n')
  },

  /* Os quatro prompts-modelo do guia (seção 2, Prompt Cowboy) */
  modelos: [
    {
      nome: 'M-legenda',
      tarefa: 'Escrever a legenda de um post de feed ou Reels sobre a pauta.',
      saida: 'gancho:\ntexto:\nhashtags:\nCTA:',
      resumo: 'Legenda para feed e Reels',
      formato: 'Gancho, texto, hashtags e CTA'
    },
    {
      nome: 'M-roteiro',
      tarefa: 'Escrever o roteiro de um vídeo vertical curto (Reels, TikTok e YouTube Shorts) sobre a pauta.',
      saida: 'gancho falado:\ncenas:\ntexto na tela:\nfala final com CTA:\nlegenda curta:',
      resumo: 'Roteiro de vídeo vertical curto (Reels, TikTok, Shorts)',
      formato: 'Gancho falado, cenas, texto na tela, fala final com CTA'
    },
    {
      nome: 'M-carrossel',
      tarefa: 'Escrever um carrossel para o feed sobre a pauta.',
      saida: 'capa (gancho):\nslides (um por ideia):\nslide final com CTA:\nlegenda:',
      resumo: 'Carrossel do feed',
      formato: 'Capa, um slide por ideia, slide final com CTA, legenda'
    },
    {
      nome: 'M-resposta',
      tarefa: 'Sugerir respostas para este comentário: {COMENTARIO}.',
      saida: 'opção 1:\nopção 2:',
      extra: 'Você sugere; quem publica é o humano.',
      resumo: 'Resposta sugerida a comentário',
      formato: '2 opções de resposta para você escolher'
    }
  ],

  promptBase: {
    v0Minimo: 'Crie um post para o Instagram sobre {TEMA}, com legenda, hashtags e uma chamada para ação.',
    versoes: [
      { v: 'v0', modulo: '', acrescenta: 'Seu prompt original, sem alterações', ferramenta: 'Você' },
      { v: 'v1', modulo: '1', acrescenta: 'Contexto: linha (própria ou afiliado), nicho, público e tom de voz', ferramenta: 'Você' },
      { v: 'v2', modulo: '2', acrescenta: 'Pauta verificada: pauta, evidência, fonte e status', ferramenta: 'Grok' },
      { v: 'v3', modulo: '3', acrescenta: 'Estrutura de prompt-modelo com variáveis e os quatro modelos derivados', ferramenta: 'Prompt Cowboy' },
      { v: 'v4', modulo: '4', acrescenta: 'Saída sempre igual e a lista "Pontos a verificar"', ferramenta: 'Claude' },
      { v: 'v5', modulo: '5', acrescenta: 'Oferta, chamada para ação, divulgação obrigatória e regras de conformidade', ferramenta: 'Claude' },
      { v: 'v6', modulo: '6', acrescenta: 'Modo automação: resposta em JSON, com variáveis preenchidas pelo script', ferramenta: 'API do Claude e script' }
    ],
    esqueleto: [
      '[INTENÇÃO]  o objetivo do seu v0',
      '[CONTEXTO]  linha: {LINHA} | nicho | público: {PUBLICO} | tom de voz',
      '[PAUTA]     {PAUTA} | evidência: {EVIDENCIA} | fonte: {FONTE} | status: {STATUS}',
      '[TAREFA]    criar {FORMATO} para {REDE}',
      '[REGRAS]    só afirme como fato o que tiver status "verificada"',
      '            nunca prometa resultado',
      '            saúde, finanças e resultados vão para "Pontos a verificar"',
      '            se {LINHA} = afiliado: dados do produto só da fonte conferida',
      '[OFERTA]    CTA: {CTA} | link: {LINK} | divulgação: {DIVULGACAO}',
      '[SAÍDA]     os campos do modelo + "Pontos a verificar"',
      '            (no modo automação, só um JSON, sem texto extra)'
    ].join('\n')
  },

  comece: {
    lead: 'Ao final dos seis módulos, você terá uma linha de produção de conteúdo funcionando: pesquisa, escrita, revisão, agendamento e medição de posts para Instagram (feed e Reels), TikTok e YouTube Shorts.',
    html: `
<h2>De onde vem este curso</h2>
<p>O conteúdo vem do guia <a href="guia-automacao-marketing-ia.pdf" target="_blank" rel="noopener">"Automação de marketing com IA" (novembro de 2026)</a>. Cada ferramenta faz uma parte do trabalho: o Grok descobre o que está em alta, o Prompt Cowboy transforma ideias em instruções, o Claude escreve e organiza, e as APIs ligam tudo para rodar quase sozinho.</p>
<p>Os módulos seguem o fluxo do guia: 1 fundação, 2 Grok, 3 Prompt Cowboy, 4 Claude, 5 renda e cuidados (que o guia pede para resolver antes de automatizar) e 6 automação. No fim, a Trilha de 30 dias organiza tudo em semanas.</p>

<h2>Como cada módulo funciona</h2>
<ol>
  <li><strong>Leitura:</strong> o conceito do guia, explicado do zero.</li>
  <li><strong>Acesso:</strong> o que criar antes das missões (contas, chaves, arquivos).</li>
  <li><strong>Missões:</strong> o que fazer, o que entregar e como saber que concluiu.</li>
  <li><strong>Perguntas:</strong> situações práticas, com explicação logo depois da resposta.</li>
  <li><strong>Ponto de retomada:</strong> onde você está e qual é o próximo passo.</li>
</ol>

<h2>Blocos curtos, sem perder o fio</h2>
<p>Cada missão leva de 20 a 60 minutos e termina com algo salvo. Você pode parar ao fim de qualquer missão e voltar semanas depois, porque tudo fica em três lugares:</p>
<table>
  <thead><tr><th scope="col">Onde</th><th scope="col">O que guarda</th></tr></thead>
  <tbody>
    <tr><td><a href="#/caderno">Caderno de prompts</a> (neste site)</td><td>Todas as versões do seu prompt, do v0 ao v6, cada uma com uma nota: o que mudou e por quê.</td></tr>
    <tr><td>Planilha de conteúdo (Google Planilhas ou Excel)</td><td>Cada pauta e cada post, do status "ideia" ao "publicado", com as métricas. O modelo está em <a href="#/recursos/planilha">Recursos</a>.</td></tr>
    <tr><td><a href="#/diario">Diário de bordo</a> (neste site)</td><td>Uma anotação por sessão: o que você fez e qual é o próximo passo.</td></tr>
  </tbody>
</table>

<h2>Três regras do guia que valem para o curso inteiro</h2>
<ol>
  <li>A revisão humana nunca é pulada: nada é publicado sem passar por você.</li>
  <li>Saúde, finanças e promessas de resultado sempre passam por verificação humana, com fonte confiável.</li>
  <li>Automatize só depois de gostar do resultado feito à mão.</li>
</ol>

<h2>Aviso honesto</h2>
<p>A automação acelera a produção, mas não garante audiência nem renda. Quem vive de redes ganha por ter público, nicho claro e ofertas que as pessoas compram. A IA reduz o tempo e o custo para chegar lá.</p>

<h2>Lacunas sinalizadas</h2>
<p>Quando uma missão precisa de algo que o guia não cobre, como o passo a passo de uma API específica, o curso marca com <span class="selo selo-lacuna">Lacuna do guia</span> e diz onde confirmar, em vez de inventar um procedimento. O resumo de todas as lacunas está em <a href="#/recursos/lacunas">Recursos</a>.</p>

<h2>Seu progresso</h2>
<p>Tudo fica salvo na sua conta: missões, respostas, Caderno, Diário e Trilha. Entre com o mesmo e-mail no celular ou no computador e continue de onde parou. Se a internet cair, o site guarda neste aparelho e envia quando a conexão voltar.</p>
<h2>IA no curso</h2>
<p>Em cada missão, o botão "Pedir revisão da IA" compara o seu entregável com os critérios e sugere melhorias. No Caderno, "Testar com IA" roda o seu prompt na hora. A IA sugere; quem decide se a missão está concluída é você. Ela não acessa a internet, então tudo o que for fato, número ou tendência continua precisando de verificação.</p>
`
  },

  modulos: [
    /* ------------------------------------------------------------------ */
    {
      n: 1,
      cor: '#FFC83D',
      corTexto: '#1A1530',
      titulo: 'Fundação',
      subtitulo: 'A linha de produção e os seus dois nichos',
      objetivo: 'Entender o sistema inteiro, definir seus dois nichos e deixar contas e arquivos prontos.',
      tempo: 'Cerca de 1h20, em 2 missões',
      versao: 'v0 → v1',
      estacoes: [],
      leitura: `
<h3>A ideia em uma frase</h3>
<p>Cada ferramenta resolve uma parte do trabalho e, juntas, formam uma linha de produção. Em vez de fazer cada post à mão, você monta um fluxo que pesquisa, escreve, revisa, agenda e mede.</p>

<h3>As quatro peças</h3>
<ul>
  <li><strong>Grok (xAI), o radar de tendências:</strong> busca posts do X e informações recentes da web.</li>
  <li><strong>Prompt Cowboy, o tradutor:</strong> transforma uma ideia curta em um prompt completo e bem estruturado.</li>
  <li><strong>Claude (Anthropic), o redator e cérebro:</strong> escreve legendas e roteiros, adapta para cada rede, analisa métricas e escreve os scripts da automação.</li>
  <li><strong>APIs, a cola:</strong> deixam um programa conversar com outro e tiram você do copiar e colar.</li>
</ul>

<h3>Três palavras que você vai usar o tempo todo</h3>
<dl>
  <dt>Prompt</dt><dd>A instrução que você dá para uma IA. Quanto mais claro o contexto, melhor a resposta.</dd>
  <dt>Nicho</dt><dd>Quem você ajuda e com quê. O guia pede que caiba em uma frase: "Eu ajudo [quem] com [o quê]".</dd>
  <dt>API</dt><dd>A porta que deixa um programa conversar com outro. É o que permite, no Módulo 6, que um script peça posts ao Claude sem você copiar e colar.</dd>
</dl>

<h3>O fluxo de seis etapas</h3>
<p>Cada etapa do guia tem um responsável e um módulo do curso. Clique numa etapa para ir ao módulo.</p>
{{ESTEIRA}}
<p>Os Módulos 1 e 5 preparam a linha: a fundação e a renda com os cuidados, que o guia pede para resolver antes de automatizar.</p>

<h3>Dois nichos, um sistema</h3>
<p>Você vai trabalhar com duas linhas de conteúdo. A <strong>linha própria</strong> é o conteúdo da sua marca. A <strong>linha de afiliados</strong> promove produtos de terceiros com link de comissão. As duas usam o mesmo prompt-base; o que muda é a variável {LINHA}.</p>
<p>Uma decisão importa logo de início. Se o nicho de afiliados atende o mesmo público do nicho próprio, use os mesmos perfis e trate as duas como linhas editoriais. Se os públicos forem diferentes, perfis separados evitam confundir quem segue você. O guia lembra que nicho claro e voz própria são o diferencial.</p>

<h3>Aviso honesto</h3>
<p>A automação acelera a produção, mas não garante audiência nem renda. Quem vive de redes ganha por ter público, nicho claro e ofertas que as pessoas compram.</p>
`,
      acesso: {
        lacuna: true,
        nota: 'O guia pede contas Business/Creator, mas não detalha o cadastro. Use o caminho oficial de cada rede.',
        itens: [
          { id: 'ig', texto: '<strong>Instagram:</strong> crie a conta e mude para conta profissional (Criador de conteúdo ou Empresa).' },
          { id: 'tt', texto: '<strong>TikTok:</strong> crie a conta e veja, nas configurações, os tipos de conta disponíveis.' },
          { id: 'yt', texto: '<strong>YouTube:</strong> crie um canal na sua conta Google. Os Shorts saem desse mesmo canal.' },
          { id: 'af', texto: '<strong>Programa de afiliados:</strong> escolha um ligado ao seu nicho de afiliados, cadastre-se e leia as regras (comissão, como divulgar, o que é proibido). O guia não explica como entrar em programas de afiliados.' },
          { id: 'pl', texto: '<strong>Planilha de conteúdo:</strong> crie uma planilha no Google Planilhas ou no Excel. O modelo está em <a href="#/recursos/planilha">Recursos</a>.' },
          { id: 'sg', texto: '<strong>Segurança:</strong> senha forte e verificação em duas etapas em todas as contas.' }
        ]
      },
      missoes: [
        {
          id: '1.1',
          titulo: 'Seus dois nichos em uma frase',
          minutos: 40,
          objetivo: 'Sair com uma frase de nicho para cada linha de conteúdo e os perfis criados.',
          passos: [
            'Escreva uma frase para cada nicho no formato do guia: "Eu ajudo [quem] com [o quê]."',
            'Para cada nicho, anote o público (quem é, o que quer, o que trava essa pessoa) e 3 temas que você conseguiria tratar toda semana.',
            'No nicho de afiliados, anote também a categoria de produto e o programa de afiliados escolhido.',
            'Defina o seu tom de voz: 3 adjetivos e 1 coisa que você nunca faz nos posts (por exemplo, "nunca prometo resultado").',
            'Decida se as duas linhas vão usar os mesmos perfis ou perfis separados (veja a leitura do módulo).',
            'Crie as contas do checklist de acesso.'
          ],
          prompts: [
            {
              titulo: 'Modelo da ficha do projeto',
              texto: [
                'FICHA DO PROJETO',
                'Nicho próprio: Eu ajudo ... com ...',
                '  Público: quem é / o que quer / o que trava',
                '  3 temas semanais: ...',
                'Nicho de afiliados: Eu ajudo ... com ...',
                '  Público: ...',
                '  Categoria de produto: ... | Programa: ...',
                'Tom de voz: adjetivo, adjetivo, adjetivo | Nunca: ...',
                'Perfis: os mesmos para as duas linhas / separados (por quê: ...)',
                'Links: Instagram ... | TikTok ... | YouTube ...'
              ].join('\n')
            }
          ],
          entregavel: 'A ficha do projeto preenchida: as 2 frases de nicho, os públicos, os temas, o programa de afiliados, o tom de voz, a decisão sobre os perfis e os links dos perfis criados.',
          criterios: [
            'Cada frase de nicho cabe em uma linha e responde "quem" e "com quê".',
            'Alguém de fora entende sobre o que é o perfil lendo só a frase.',
            'Os perfis existem e o Instagram está como conta profissional.'
          ]
        },
        {
          id: '1.2',
          titulo: 'Do v0 à v1, com a planilha montada',
          minutos: 40,
          objetivo: 'Registrar o seu primeiro prompt e dar a ele o contexto dos seus nichos.',
          widget: 'registrar-v0',
          passos: [
            'Cole o seu primeiro prompt no campo "Registrar o v0", logo abaixo, e salve. Não edite nada: o v0 é o ponto de partida.',
            'Use o botão "Criar v1 a partir do v0". Ele copia o v0 para o Caderno e acrescenta o bloco de contexto.',
            'No Caderno, preencha o bloco de contexto com os dados da sua ficha e escreva a nota: "v1: acrescentei o contexto porque...".',
            'Monte a Planilha de conteúdo com as colunas do modelo (em Recursos) e confira os valores de status.',
            'Lance uma ideia sua na primeira linha da planilha.',
            'Faça a primeira anotação no Diário de bordo, com o próximo passo.'
          ],
          prompts: [
            {
              titulo: 'Bloco de contexto (v1)',
              bloco: 'contexto',
              acao: { tipo: 'evoluir', de: 'v0', para: 'v1', bloco: 'contexto', rotulo: 'Criar v1 a partir do v0' }
            }
          ],
          entregavel: 'O link da sua planilha (com o cabeçalho e 1 ideia sua) e uma frase dizendo o que a v1 acrescentou ao v0.',
          criterios: [
            'A v1 contém o v0 sem alterações e o bloco de contexto sem campos vagos ("todo mundo", "pessoas em geral").',
            'A planilha tem todas as colunas e os valores de status definidos.',
            'O Diário de bordo tem a primeira anotação, com o próximo passo.'
          ]
        }
      ],
      perguntas: [
        {
          id: '1a',
          enunciado: 'Você tem só 2 horas nesta semana. O que rende mais?',
          opcoes: [
            'Configurar o agendamento automático, para ganhar tempo depois.',
            'Fazer o teste manual: pesquisar, montar o prompt e escrever 3 posts.',
            'Criar contas em mais redes, para aparecer em mais lugares.'
          ],
          correta: 1,
          explicacao: 'O guia manda automatizar só depois de gostar do resultado feito à mão. Automatizar algo que ainda não funciona só acelera o erro.'
        },
        {
          id: '1b',
          enunciado: 'Nicho próprio: rotina de treino para iniciantes. Nicho de afiliados: acessórios para quem está começando a treinar. Como organizar os perfis?',
          opcoes: [
            'Os mesmos perfis, com duas linhas editoriais separadas pela variável {LINHA}.',
            'Perfis separados, porque afiliado sempre precisa de outro perfil.',
            'Só a linha de afiliados, porque é a que gera comissão.'
          ],
          correta: 0,
          explicacao: 'O público é o mesmo, então as duas linhas convivem no mesmo perfil. Se o afiliado fosse de outro público (por exemplo, utensílios de cozinha), perfis separados evitariam confundir quem segue você.'
        },
        {
          id: '1c',
          enunciado: 'Um amigo diz que, com IA postando sozinha, em um mês você vai viver de conteúdo. O que o guia responde?',
          opcoes: [
            'Que é possível, desde que você poste em todas as redes ao mesmo tempo.',
            'Que a automação acelera a produção, mas não garante audiência nem renda.',
            'Que a renda vem automaticamente depois dos primeiros 30 posts.'
          ],
          correta: 1,
          explicacao: 'Quem vive de redes ganha por ter público, nicho claro e ofertas que as pessoas compram. A IA reduz o tempo e o custo para chegar lá.'
        },
        {
          id: '1d',
          enunciado: 'Por que definir o nicho em uma frase, com "quem" e "com quê", antes de pesquisar no Grok?',
          opcoes: [
            'Porque o Grok só aceita perguntas curtas.',
            'Porque, sem isso, a pesquisa fica ampla demais e o conteúdo sai genérico.',
            'Porque as redes exigem a frase de nicho na bio.'
          ],
          correta: 1,
          explicacao: 'Nicho vago gera pauta vaga. O guia avisa que conteúdo genérico em massa perde alcance: sua voz e seu nicho são o diferencial.'
        },
        {
          id: '1e',
          enunciado: 'Em qual etapa do fluxo você entra pessoalmente, sem exceção?',
          opcoes: [
            'Na pesquisa, porque o Grok não sabe o que está em alta.',
            'No agendamento, porque o script não sabe a hora certa.',
            'Na revisão, porque a IA pode errar fatos e números.'
          ],
          correta: 2,
          explicacao: 'A revisão (etapa 4) não deve ser pulada: você lê, ajusta, confere fatos e aprova. É você quem responde pelo que é publicado.'
        }
      ],
      retomada: 'Ficha do projeto, v1 e planilha salvas. O próximo passo é a Missão 2.1, que transforma o seu contexto em um prompt de pesquisa para o Grok.'
    },

    /* ------------------------------------------------------------------ */
    {
      n: 2,
      cor: '#3B5BFF',
      corTexto: '#FFFFFF',
      titulo: 'Grok',
      subtitulo: 'Radar de pautas e verificação',
      objetivo: 'Gerar ideias de pauta para as duas linhas e só deixar seguir o que foi verificado.',
      tempo: 'Cerca de 1h15, em 2 missões',
      versao: 'v1 → v2',
      estacoes: [1],
      leitura: `
<h3>O que é o Grok</h3>
<p>É o assistente de IA da xAI. Ele busca posts do X e informações recentes da web, e pode ser chamado por API em bots seus. A API é opcional e fica para o Módulo 6.</p>

<h3>Para que usar</h3>
<p>Para descobrir assuntos em alta no seu nicho, as reações do público e ideias de pauta. Pauta é um assunto específico que vira post ("os 3 erros de quem começa a treinar em casa"), não um tema amplo ("treino").</p>

<h3>O cuidado principal</h3>
<p>Posts do X podem ser boato ou ironia, e a IA pode errar fatos e números. "Está em alta" não quer dizer "é verdade". O Grok mostra do que as pessoas estão falando; quem decide o que é fato é você, usando a <strong>fonte primária</strong>: quem originou a informação (comunicado oficial, página do fabricante, documento, órgão responsável), e não quem repostou.</p>

<h3>As duas linhas pedem pesquisas diferentes</h3>
<table>
  <thead><tr><th scope="col"></th><th scope="col">Linha própria</th><th scope="col">Linha de afiliados</th></tr></thead>
  <tbody>
    <tr><th scope="row">O que procurar</th><td>Dúvidas e debates do público, erros comuns, novidades do tema</td><td>Produtos em alta, reclamações frequentes, comparações que o público pede</td></tr>
    <tr><th scope="row">Vira</th><td>Post educativo, opinião, passo a passo</td><td>Review e comparativo, os formatos que o guia cita para afiliados</td></tr>
    <tr><th scope="row">O que verificar</th><td>Fatos e números do tema</td><td>Preço, especificação e disponibilidade na página oficial do produto ou do programa</td></tr>
  </tbody>
</table>
`,
      acesso: {
        lacuna: true,
        nota: 'O guia não detalha cadastro, planos e limites do Grok. Confirme no site oficial.',
        itens: [
          { id: 'grok', texto: '<strong>Grok:</strong> crie sua conta e acesse pelo site oficial (grok.com) ou pelo X.' },
          { id: 'x', texto: '<strong>Opcional:</strong> uma conta no X, para abrir os posts que o Grok citar como evidência.' }
        ]
      },
      missoes: [
        {
          id: '2.1',
          titulo: 'O prompt de pesquisa',
          minutos: 35,
          objetivo: 'Transformar o contexto da v1 em um prompt de pesquisa e sair com 15 ideias de pauta.',
          linhas: {
            propria: 'Peça dúvidas, debates, erros comuns e novidades de um dos seus 3 temas semanais.',
            afiliado: 'Troque {TEMA} pela categoria de produto e peça produtos em alta, reclamações frequentes e comparações que o público pede, com o link da página oficial.'
          },
          passos: [
            'Salve o "Prompt de pesquisa" no Caderno (botão abaixo) e cole nele o bloco CONTEXTO da sua v1.',
            'Rode no Grok com Linha = própria e {TEMA} = um dos seus 3 temas semanais.',
            'Rode de novo com Linha = afiliado, usando a variação para afiliados.',
            'Fique com 15 ideias no total, o número do exemplo semanal do guia (por exemplo, 10 da linha própria e 5 da de afiliados).',
            'Lance as 15 na planilha com status da pauta = ideia e o link de evidência de cada uma.'
          ],
          prompts: [
            {
              titulo: 'Prompt de pesquisa',
              texto: [
                '[cole aqui o bloco CONTEXTO da sua v1]',
                '',
                'Pesquise no X e na web o que está em alta nos últimos 7 dias sobre {TEMA}.',
                'Liste {N} ideias de pauta. Para cada uma, traga:',
                '- título da pauta;',
                '- por que está em alta, com o link do post ou da página;',
                '- se parece fato, opinião, possível boato ou ironia;',
                '- qual fonte primária confirmaria a informação;',
                '- um gancho para {PUBLICO}.'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Prompt de pesquisa', categoria: 'pesquisa', rotulo: 'Salvar no Caderno' }
            },
            {
              titulo: 'Variação para a linha de afiliados',
              texto: [
                'Linha: afiliado. Categoria: {CATEGORIA}.',
                'Liste {N} ideias de pauta sobre produtos em alta, reclamações frequentes',
                'e comparações que o público pede. Para cada produto citado, traga o link',
                'da página oficial ou da loja do programa, e não só o post.'
              ].join('\n')
            }
          ],
          entregavel: 'O link da planilha com as 15 ideias (status "ideia", cada uma com link de evidência).',
          criterios: [
            'As 15 ideias estão na planilha, cada uma com pelo menos um link de evidência.',
            'Ideias sem link estão marcadas como "sem evidência".',
            'Há ideias das duas linhas.'
          ]
        },
        {
          id: '2.2',
          titulo: 'Verificar antes de virar pauta, e a v2',
          minutos: 40,
          objetivo: 'Separar fato de boato e criar a v2, que só trata como fato o que foi verificado.',
          linhas: {
            propria: 'Confirme fatos e números do tema na fonte primária.',
            afiliado: 'Confirme preço, especificação e disponibilidade na página oficial do produto ou do programa, perto da data de publicação.'
          },
          passos: [
            'Escolha as 5 ideias mais promissoras, com pelo menos 1 de cada linha.',
            'Para cada uma, peça ao Grok a checagem de tendência (prompt abaixo).',
            'Agora confira você: abra os links e procure a fonte primária.',
            'Marque o status na planilha: verificada (a fonte primária confirma), em verificação ou descartada (boato, ironia, sem fonte). Saúde, finanças e resultados sem fonte confiável são descartados.',
            'Crie a v2 com o botão "Criar v2 a partir da v1". Ele acrescenta o bloco de pauta com a regra do status.'
          ],
          prompts: [
            {
              titulo: 'Checagem de tendência (Grok)',
              texto: [
                'Esta pauta está realmente em alta ou foi um pico isolado?',
                'Pauta: {PAUTA}',
                'Mostre posts de dias e contas diferentes e aponte se há desmentido,',
                'ironia ou fonte oficial sobre o assunto. Traga os links.'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Checagem de tendência', categoria: 'apoio', rotulo: 'Salvar no Caderno' }
            },
            {
              titulo: 'Bloco de pauta (v2)',
              bloco: 'pauta',
              acao: { tipo: 'evoluir', de: 'v1', para: 'v2', bloco: 'pauta', rotulo: 'Criar v2 a partir da v1' }
            }
          ],
          entregavel: 'As 5 pautas com status preenchido (pelo menos 3 verificadas, com ao menos 1 de cada linha) e o link da fonte primária de cada verificada.',
          criterios: [
            'Toda pauta "verificada" tem link de fonte primária, e não só um post do X.',
            'Pautas de saúde, finanças ou resultados sem fonte confiável foram descartadas.',
            'A v2 está no Caderno, com o bloco de pauta e a regra do status.'
          ]
        }
      ],
      perguntas: [
        {
          id: '2a',
          enunciado: 'Um post viral no X diz que uma rede vai remover as curtidas de todos os perfis na semana que vem. O que você faz antes de gravar um vídeo sobre isso?',
          opcoes: [
            'Grava logo, porque assunto viral perde força rápido.',
            'Procura a fonte primária, como um comunicado oficial da rede; sem ela, descarta.',
            'Grava, mas avisa na legenda que pode ser boato.'
          ],
          correta: 1,
          explicacao: 'Posts do X podem ser boato ou ironia. Só a fonte primária confirma; sem ela, a pauta não segue. Publicar "pode ser boato" ainda espalha o boato.'
        },
        {
          id: '2b',
          enunciado: 'O Grok trouxe como tendência do seu nicho de afiliados um suplemento que "dobra a queima de gordura". Pode virar pauta?',
          opcoes: [
            'Sim, porque está em alta e tem link de afiliado.',
            'Sim, desde que o post diga "resultados podem variar".',
            'Só com verificação rigorosa em fonte confiável e, mesmo assim, sem prometer resultado.'
          ],
          correta: 2,
          explicacao: 'É saúde e promessa de resultado ao mesmo tempo, os casos em que o guia exige verificação humana. Sem fonte confiável, a pauta é descartada.'
        },
        {
          id: '2c',
          enunciado: 'Por que pedir ao Grok o link de cada evidência, em vez de só um resumo?',
          opcoes: [
            'Porque o link permite você conferir; um resumo pode distorcer, e a IA pode errar.',
            'Porque o algoritmo das redes favorece posts com links.',
            'Porque o Grok não consegue resumir posts do X.'
          ],
          correta: 0,
          explicacao: 'Verificar é olhar a fonte com os próprios olhos. Sem o link, você estaria confiando na IA justamente onde ela pode errar.'
        },
        {
          id: '2d',
          enunciado: 'Você tem 20 minutos para verificar pautas. O que fazer?',
          opcoes: [
            'Verificar 5 pautas pela metade, para ter mais opções.',
            'Verificar 2 pautas por completo.',
            'Pular a verificação e deixar tudo para a revisão.'
          ],
          correta: 1,
          explicacao: 'Meia verificação não é verificação. Só pauta verificada segue para produção, e duas pautas sólidas valem mais que cinco duvidosas.'
        },
        {
          id: '2e',
          enunciado: 'Uma pauta de afiliado está verificada, mas o preço que o Grok trouxe é de três semanas atrás. E agora?',
          opcoes: [
            'Usa o preço do Grok, porque a pauta já foi verificada.',
            'Confere o preço na página oficial perto da publicação, ou não cita preço.',
            'Arredonda o preço para cima, por segurança.'
          ],
          correta: 1,
          explicacao: 'Dados de produto mudam. Preço, especificação e disponibilidade se conferem na fonte oficial, perto da data de publicação.'
        }
      ],
      retomada: 'Pautas verificadas na planilha e v2 salva. O próximo passo é a Missão 3.1, que transforma a v2 em um prompt-modelo reutilizável.'
    },

    /* ------------------------------------------------------------------ */
    {
      n: 3,
      cor: '#FF8A3D',
      corTexto: '#1A1530',
      titulo: 'Prompt Cowboy',
      subtitulo: 'Prompts-modelo reutilizáveis',
      objetivo: 'Transformar a v2 em prompts-modelo que você cria uma vez e reutiliza toda semana.',
      tempo: 'Cerca de 1h15, em 2 missões',
      versao: 'v2 → v3',
      estacoes: [2],
      leitura: `
<h3>O que é</h3>
<p>O Prompt Cowboy (promptcowboy.ai) é uma ferramenta que transforma uma ideia curta em um prompt completo e bem estruturado.</p>

<h3>Para que usar</h3>
<p>Para criar prompts-modelo reutilizáveis para as tarefas que se repetem: legenda, roteiro de Reels, carrossel e resposta a comentário. A dica do guia: teste, refine, salve os melhores e, depois, use-os no seu código.</p>

<h3>O que é um prompt-modelo</h3>
<p>É um prompt com espaços que você preenche a cada uso: as variáveis, escritas entre chaves, como {PAUTA}, {REDE} e {LINHA}. Você escreve uma vez e usa centenas de vezes. No Módulo 6, quem preenche as variáveis é o script, por isso elas precisam ter nomes fixos.</p>

<h3>A ferramenta estrutura, você decide</h3>
<p>O Prompt Cowboy organiza o texto, mas pode cortar o que importa para você, como o seu tom de voz ou a regra de pauta verificada. Sempre compare o resultado com a versão anterior e restaure o que sumiu.</p>

<h3>Uma base, duas linhas</h3>
<p>Não crie um prompt separado para afiliados. Use a mesma base e deixe a variável {LINHA} ligar as regras extras: dados do produto só da fonte conferida, formato de review ou comparativo, nenhuma promessa de resultado e espaço para a divulgação.</p>
`,
      acesso: {
        lacuna: true,
        nota: 'O guia não detalha cadastro, planos e limites do Prompt Cowboy. Confirme no site.',
        itens: [
          { id: 'pc', texto: '<strong>Prompt Cowboy:</strong> acesse promptcowboy.ai e crie seu acesso, se o site pedir.' }
        ]
      },
      missoes: [
        {
          id: '3.1',
          titulo: 'O prompt-mãe, v3',
          minutos: 30,
          objetivo: 'Ter um prompt-base estruturado, com variáveis de nome fixo, que ainda guarda a intenção do seu v0.',
          passos: [
            'Crie a v3 com o botão "Criar v3 a partir da v2". Ela começa como cópia da v2 com o bloco de estrutura.',
            'No Prompt Cowboy, escreva a ideia curta abaixo e cole junto o contexto e as regras da sua v2.',
            'Cole a resposta do Cowboy na v3 e compare com a v2 em "Comparar duas versões", no Caderno: o que ele acrescentou, o que sumiu, o que ficou confuso.',
            'Restaure o que sumiu, principalmente o tom de voz, a intenção do seu v0 e a regra de status da pauta.',
            'Escreva a nota da v3: o que foi acrescentado, restaurado e cortado.'
          ],
          prompts: [
            {
              titulo: 'Ideia curta para o Prompt Cowboy',
              texto: [
                'Prompt-modelo reutilizável para criar posts de redes sociais a partir de',
                'uma pauta verificada. Variáveis fixas: {LINHA}, {NICHO}, {PUBLICO}, {TOM},',
                '{PAUTA}, {EVIDENCIA}, {FONTE}, {STATUS}, {REDE}, {FORMATO}.',
                'Manter: tom de voz, regra de pauta verificada, nenhuma promessa de resultado.'
              ].join('\n')
            },
            {
              titulo: 'Bloco de estrutura (v3)',
              bloco: 'estrutura',
              acao: { tipo: 'evoluir', de: 'v2', para: 'v3', bloco: 'estrutura', rotulo: 'Criar v3 a partir da v2' }
            }
          ],
          entregavel: 'Uma frase com o que o Prompt Cowboy acrescentou, o que você restaurou e o que cortou. A v3 fica salva no Caderno.',
          criterios: [
            'A v3 tem todas as variáveis entre chaves, com nomes fixos.',
            'Nenhuma regra da v2 sumiu.',
            'Dá para reconhecer a intenção do seu v0 no objetivo do prompt.'
          ]
        },
        {
          id: '3.2',
          titulo: 'Os quatro modelos derivados',
          minutos: 45,
          objetivo: 'Ter um prompt-modelo para cada tarefa que se repete, todos com a mesma base.',
          linhas: {
            propria: 'Com {LINHA} = própria, os modelos fazem post educativo, opinião e passo a passo.',
            afiliado: 'Os mesmos modelos com {LINHA} = afiliado: review ou comparativo, dados só da fonte conferida e espaço para a divulgação.'
          },
          tabela: 'modelos',
          passos: [
            'Use o botão "Criar os 4 modelos a partir da v3". Cada modelo recebe o mesmo contexto, pauta e regras; mudam só a tarefa e o formato de saída (tabela abaixo).',
            'Revise cada modelo no Caderno. Se quiser, passe cada um pelo Prompt Cowboy para melhorar a tarefa.',
            'Confira se a regra de linha está em todos (bloco abaixo). A divulgação completa entra no Módulo 5.',
            'No M-resposta, mantenha a frase "Você sugere; quem publica é o humano." O guia prevê respostas sugeridas com a sua aprovação, e robôs que comentam em massa quebram as regras das plataformas.'
          ],
          prompts: [
            {
              titulo: 'Regra de linha (vai em todos os modelos)',
              bloco: 'regraLinha',
              acao: { tipo: 'modelos', rotulo: 'Criar os 4 modelos a partir da v3' }
            }
          ],
          entregavel: 'Os nomes dos 4 modelos salvos no Caderno e, para cada um, uma linha sobre o que você mudou em relação ao que o botão criou.',
          criterios: [
            'Os 4 modelos têm o mesmo bloco de contexto da v3 e variáveis com os mesmos nomes.',
            'Cada modelo tem um formato de saída definido.',
            'Todos têm a regra de {LINHA} = afiliado, e o M-resposta diz que quem publica é você.'
          ]
        }
      ],
      perguntas: [
        {
          id: '3a',
          enunciado: 'Um prompt seu funcionou muito bem uma vez. Por que transformá-lo em prompt-modelo com variáveis?',
          opcoes: [
            'Para reutilizar com a mesma qualidade e a mesma voz em qualquer pauta, e para o script preencher as variáveis.',
            'Porque prompts com chaves custam menos na API.',
            'Porque o Prompt Cowboy só aceita prompts com variáveis.'
          ],
          correta: 0,
          explicacao: 'O prompt-modelo é a peça da linha de produção que você cria uma vez. Com nomes fixos, o script do Módulo 6 consegue preencher cada variável sozinho.'
        },
        {
          id: '3b',
          enunciado: 'O Prompt Cowboy devolveu um prompt bem organizado, mas sem o seu tom de voz e sem a regra de pauta verificada. O que fazer?',
          opcoes: [
            'Usar como está, porque a ferramenta sabe estruturar melhor.',
            'Restaurar o tom de voz e a regra antes de salvar.',
            'Descartar o Prompt Cowboy e voltar para a v2.'
          ],
          correta: 1,
          explicacao: 'A ferramenta estrutura; quem decide o conteúdo é você. A regra de verificação nunca sai do prompt.'
        },
        {
          id: '3c',
          enunciado: 'Você precisa de um modelo para a linha de afiliados. Qual é o melhor caminho?',
          opcoes: [
            'Um prompt novo, do zero, só para afiliados.',
            'A mesma base, com {LINHA} = afiliado ligando as regras extras.',
            'O prompt da linha própria, sem nenhuma mudança.'
          ],
          correta: 1,
          explicacao: 'Com a mesma base, a voz e as regras ficam iguais nas duas linhas, e você mantém um prompt só em vez de dois.'
        },
        {
          id: '3d',
          enunciado: 'Dá para ligar o M-resposta a um robô que responde todos os comentários sozinho?',
          opcoes: [
            'Sim, se as respostas forem educadas.',
            'Sim, desde que seja só no TikTok.',
            'Não: o guia prevê respostas sugeridas com a sua aprovação, e robôs que comentam em massa levam a bloqueio.'
          ],
          correta: 2,
          explicacao: 'Robôs que curtem, seguem ou comentam em massa quebram as regras das plataformas. A IA sugere, você publica.'
        },
        {
          id: '3e',
          enunciado: 'Qual parte do prompt ajuda a impedir que um boato vire post?',
          opcoes: [
            'A variável {REDE}.',
            'A variável {STATUS} com a regra "só afirme como fato o que estiver verificado".',
            'As hashtags.'
          ],
          correta: 1,
          explicacao: 'A regra impede a IA de tratar como fato o que não foi conferido. Ela ajuda, mas não substitui a sua revisão.'
        }
      ],
      retomada: 'Prompt-mãe v3 e 4 modelos salvos. O próximo passo é a Missão 4.1, o teste manual no Claude.'
    },

    /* ------------------------------------------------------------------ */
    {
      n: 4,
      cor: '#F25C9B',
      corTexto: '#1A1530',
      titulo: 'Claude',
      subtitulo: 'Produção, adaptação entre redes e revisão humana',
      objetivo: 'Testar os modelos, escrever os 3 primeiros posts, adaptar um roteiro para quatro formatos e aprender a barrar o que não pode sair.',
      tempo: 'Cerca de 2h, em 3 missões',
      versao: 'v3 → v4',
      estacoes: [3, 4],
      leitura: `
<h3>O que é</h3>
<p>O Claude é a IA da Anthropic, forte em escrita, raciocínio, análise e programação. Funciona no app e por API; a API fica para o Módulo 6.</p>

<h3>Para que usar</h3>
<p>Para escrever legendas e roteiros, adaptar para cada rede, manter o tom de voz e revisar rascunhos. Ele também escreve os scripts da automação e analisa prints de métricas.</p>

<h3>Etapa 3: produção</h3>
<p>O Claude recebe a pauta e o prompt-modelo e devolve legenda, roteiro, hashtags e chamada para ação. A chamada para ação, ou CTA, é o que você pede para a pessoa fazer: salvar, comentar ou clicar no link.</p>

<h3>Etapa 4: revisão</h3>
<p>Você lê, ajusta, confere fatos e aprova. O guia é direto: essa etapa não deve ser pulada.</p>

<h3>Um roteiro, quatro formatos</h3>
<p>O núcleo (gancho, mensagem e CTA) fica igual; muda a embalagem.</p>
<table>
  <thead><tr><th scope="col">Formato</th><th scope="col">O núcleo vira</th><th scope="col">Adaptações comuns</th></tr></thead>
  <tbody>
    <tr><th scope="row">Reels (Instagram)</th><td>Vídeo vertical curto</td><td>A legenda complementa o vídeo; hashtags; o CTA que o Instagram permite</td></tr>
    <tr><th scope="row">TikTok</th><td>O mesmo vídeo vertical</td><td>Texto na tela e linguagem do TikTok; legenda curta</td></tr>
    <tr><th scope="row">YouTube Shorts</th><td>O mesmo vídeo vertical</td><td>Título descritivo; CTA para o canal</td></tr>
    <tr><th scope="row">Feed (carrossel)</th><td>Slides</td><td>Capa = gancho; um slide por ideia; último slide = CTA</td></tr>
  </tbody>
</table>
<p class="lacuna"><span class="selo selo-lacuna">Lacuna do guia</span> O guia não traz as especificações de cada formato (duração máxima, tamanho de legenda, links clicáveis, requisitos para link na bio) nem ensina gravação e edição de vídeo. Confira na própria rede antes de produzir: isso muda o CTA, principalmente na linha de afiliados.</p>

<h3>Checklist de revisão</h3>
<p>Use em todo post, antes de aprovar.</p>
{{CHECKLIST}}
`,
      acesso: {
        nota: 'A API do Claude é outro cadastro, cobrado por uso, e fica para o Módulo 6.',
        itens: [
          { id: 'claude', texto: '<strong>Claude:</strong> crie sua conta em claude.ai. Há opção gratuita para começar; confira os planos no site.' }
        ]
      },
      missoes: [
        {
          id: '4.1',
          titulo: 'Teste manual: 3 posts e a v4',
          minutos: 50,
          objetivo: 'Fazer o teste manual que o guia pede antes de qualquer automação e chegar à v4.',
          widget: 'comparar-saidas',
          linhas: {
            propria: '2 posts: M-roteiro e M-legenda com pautas verificadas do seu tema.',
            afiliado: '1 post: review ou comparativo de um produto que você realmente indicaria. Preço só se conferido perto da publicação.'
          },
          passos: [
            'Pegue 3 pautas verificadas: 2 da linha própria e 1 de afiliados.',
            'No Claude, preencha as variáveis do M-roteiro e do M-legenda e gere os 3 posts (gancho, roteiro, legenda, hashtags, CTA).',
            'Rode também o seu v0 original com a pauta 1. Cole as duas respostas no campo "Comparar saídas", abaixo, e anote pelo menos 3 diferenças concretas.',
            'Onde a saída falhou, refine o modelo (no próprio Claude ou voltando ao Prompt Cowboy) e rode de novo.',
            'Crie a v4 de todos os prompts v3 com o botão abaixo. Ele acrescenta o bloco de verificação.',
            'No Caderno, marque com a estrela os seus 3 a 5 prompts bons: os que geram algo que você publicaria com poucas mudanças.'
          ],
          prompts: [
            {
              titulo: 'Bloco de verificação (v4)',
              bloco: 'verificacao',
              acao: { tipo: 'evoluir', de: 'v3', para: 'v4', bloco: 'verificacao', rotulo: 'Criar v4 de todos os prompts v3' }
            }
          ],
          entregavel: 'As 3 diferenças entre a saída do v0 e a da v4 e o link da planilha com os 3 posts (status "rascunho").',
          criterios: [
            'Os 3 posts têm todas as colunas de conteúdo preenchidas na planilha.',
            'Cada post tem a lista "Pontos a verificar".',
            'De 3 a 5 prompts estão marcados como bons no Caderno.'
          ]
        },
        {
          id: '4.2',
          titulo: 'Um roteiro, quatro formatos',
          minutos: 35,
          objetivo: 'Ver na prática como o mesmo núcleo vira Reels, TikTok, Shorts e carrossel.',
          linhas: {
            propria: 'O CTA pode pedir para salvar, comentar ou seguir.',
            afiliado: 'O CTA leva ao link: confira se a rede permite link clicável e mantenha a divulgação nas quatro versões.'
          },
          passos: [
            'Pegue o melhor roteiro da Missão 4.1 e use o prompt de adaptação abaixo.',
            'Faça uma versão para Reels, uma para TikTok, uma para YouTube Shorts e uma para carrossel do feed.',
            'Antes de aceitar o CTA de cada versão, confira na própria rede se ele é possível ali (por exemplo, se há link clicável).',
            'Se der tempo, repita com o post de afiliados: a divulgação precisa aparecer nas quatro versões.',
            'Lance as 4 versões na planilha com o mesmo "id do roteiro".'
          ],
          prompts: [
            {
              titulo: 'Adaptação entre redes',
              texto: [
                'Adapte este roteiro para {REDE} no formato {FORMATO}, mantendo o gancho,',
                'a mensagem e o CTA. Diga o que mudou e por quê.',
                'Se {LINHA} = afiliado, mantenha a divulgação visível nesta versão.',
                '',
                '[cole o roteiro]'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Adaptação entre redes', categoria: 'apoio', rotulo: 'Salvar no Caderno' }
            }
          ],
          entregavel: 'O "id do roteiro" e o link da planilha com as 4 versões (uma por formato).',
          criterios: [
            'A mensagem central é a mesma nas quatro versões.',
            'O CTA de cada versão é possível naquela rede (você conferiu).',
            'A versão de afiliados, se houver, tem divulgação em todas as redes.'
          ]
        },
        {
          id: '4.3',
          titulo: 'Revisão humana: aprovar, ajustar ou barrar',
          minutos: 30,
          objetivo: 'Treinar o olho de revisor antes de publicar qualquer coisa.',
          widget: 'checklist-revisao',
          passos: [
            'Aplique o checklist de revisão (abaixo) a todos os posts das Missões 4.1 e 4.2.',
            'Para cada um, marque o status na planilha: aprovado, ou barrado com o motivo em "observações". Post ajustado volta para a revisão antes de ser aprovado.',
            'Confira cada item de "Pontos a verificar" na fonte. O que não der para confirmar sai do post.',
            'Cronometre: o guia estima cerca de 30 minutos para revisar uma semana de posts. Anote quanto você levou.'
          ],
          prompts: [],
          entregavel: 'Quantos posts você aprovou, ajustou e barrou, o motivo de cada barramento e quanto tempo levou.',
          criterios: [
            'Nenhum post ficou aprovado com item de "Pontos a verificar" sem conferir.',
            'Para cada post aprovado, você sabe dizer qual fonte confirma cada fato citado.',
            'Todo post barrado tem o motivo anotado.'
          ]
        }
      ],
      perguntas: [
        {
          id: '4a',
          enunciado: 'O roteiro diz "90% das pessoas erram isso no treino", sem fonte, e o Claude não colocou isso em "Pontos a verificar". O que fazer?',
          opcoes: [
            'Aprovar, porque o Claude não apontou problema.',
            'Barrar ou ajustar: achar a fonte ou tirar o número.',
            'Trocar para "80%", que soa mais realista.'
          ],
          correta: 1,
          explicacao: 'A lista ajuda, mas a revisão é sua: a IA pode errar fatos e números, inclusive ao listar o que conferir.'
        },
        {
          id: '4b',
          enunciado: 'Quando o revisor deve barrar, e não só ajustar?',
          opcoes: [
            'Quando o gancho está fraco.',
            'Quando há fato sem fonte, saúde, finanças ou resultado sem verificação, promessa de resultado, afiliado sem divulgação ou mídia sem direito de uso comercial.',
            'Quando a legenda passa de cinco linhas.'
          ],
          correta: 1,
          explicacao: 'Barrar é para o que não se resolve trocando palavras. Gancho fraco e legenda longa se ajustam.'
        },
        {
          id: '4c',
          enunciado: 'O post está correto, mas genérico: poderia ser de qualquer perfil. O que fazer?',
          opcoes: [
            'Aprovar, porque não tem erro.',
            'Ajustar para a sua voz e o seu nicho antes de aprovar.',
            'Barrar para sempre.'
          ],
          correta: 1,
          explicacao: 'O guia avisa que conteúdo genérico em massa perde alcance: sua voz e seu nicho são o diferencial.'
        },
        {
          id: '4d',
          enunciado: 'Você vai usar o mesmo vídeo no Reels, no TikTok e no Shorts. O que deve ficar igual?',
          opcoes: [
            'Tudo, inclusive legenda e CTA.',
            'O núcleo (gancho, mensagem e CTA); mudam legenda, texto na tela, título e o tipo de CTA possível em cada rede.',
            'Nada: cada rede pede um roteiro novo.'
          ],
          correta: 1,
          explicacao: 'Um roteiro, várias embalagens. O núcleo garante a mensagem; a adaptação respeita o que cada rede permite.'
        },
        {
          id: '4e',
          enunciado: 'No dia de revisar, você está sem tempo. Pode aprovar tudo e revisar depois de publicar?',
          opcoes: [
            'Sim, se os posts vieram do prompt v4.',
            'Sim, mas só os da linha própria.',
            'Não: a revisão vem antes de publicar; se faltar tempo, publique menos.'
          ],
          correta: 2,
          explicacao: 'A etapa de revisão não deve ser pulada. Publicar menos é melhor que publicar um erro.'
        }
      ],
      retomada: 'Posts revisados na planilha e prompts na v4. O próximo passo é a Missão 5.1: ligar o conteúdo à renda antes de automatizar.'
    },

    /* ------------------------------------------------------------------ */
    {
      n: 5,
      cor: '#2FBF8A',
      corTexto: '#1A1530',
      titulo: 'Renda e conformidade',
      subtitulo: 'O que resolver antes de automatizar',
      objetivo: 'Ligar o conteúdo às suas formas de renda e montar as regras que vão proteger você quando a produção ganhar volume.',
      tempo: 'Cerca de 1h30, em 2 missões',
      versao: 'v4 → v5',
      estacoes: [],
      leitura: `
<h3>O começo é lento</h3>
<p>O guia avisa: o conteúdo raramente paga sozinho no começo. Por isso, a renda precisa estar planejada desde já, e não "quando o perfil crescer".</p>

<h3>As quatro rotas do guia</h3>
<table>
  <thead><tr><th scope="col">Rota</th><th scope="col">Como funciona</th><th scope="col">Como a IA ajuda</th></tr></thead>
  <tbody>
    <tr><th scope="row">Afiliados</th><td>Você indica produtos e ganha comissão por venda</td><td>Volume de posts, roteiros de review e comparativos</td></tr>
    <tr><th scope="row">Social media para negócios</th><td>Cuida das redes de clientes (clínicas, lojas) por mensalidade</td><td>Atender mais clientes: calendário, legendas e relatórios</td></tr>
    <tr><th scope="row">Produto próprio</th><td>E-book, mentoria, curso ou serviço</td><td>Aquecer a audiência, tirar dúvidas e montar a oferta</td></tr>
    <tr><th scope="row">Conteúdo para marcas</th><td>Marcas pagam por vídeos e posts (UGC e publis)</td><td>Roteiros e variações rápidas para propostas</td></tr>
  </tbody>
</table>

<h3>O seu caso: duas frentes e um atalho</h3>
<ul>
  <li><strong>Conteúdo para a sua marca:</strong> constrói público e confiança. É a base de tudo, mas não costuma pagar sozinho no início.</li>
  <li><strong>Venda de produtos com o conteúdo:</strong> começa pela linha de afiliados (produtos de terceiros, comissão por venda) e, mais adiante, pode virar produto próprio, como um infoproduto, quando as dúvidas do seu público se repetirem e houver audiência para aquecer.</li>
  <li><strong>O atalho que o guia sugere:</strong> vender a automação como serviço costuma render mais rápido do que esperar o perfil crescer, porque pequenos negócios pagam para não precisar pensar em conteúdo todo dia. O sistema que você monta neste curso vira o seu portfólio.</li>
</ul>

<h3>Divulgação obrigatória de afiliados</h3>
<p>O guia pede que parcerias e links de afiliado sejam indicados de forma clara. O motivo é simples: quem vê o post tem o direito de saber que você ganha se ela comprar.</p>
<p>No Brasil, isso também tem base fora do guia. O Código de Defesa do Consumidor (art. 36) pede que a publicidade seja identificada como tal de forma fácil e imediata. E a edição de maio de 2026 do Guia de Marketing e Publicidade por Influenciadores Digitais do CONAR, em vigor desde 1º de junho de 2026, trata como publicidade os posts com link de afiliado, cupom ou outra remuneração por desempenho. A identificação deve ser ostensiva, imediata e fácil de entender, sem ficar escondida entre hashtags ou no fim da legenda (<a href="https://www.uai.com.br/networking-e-negocios/2026/09/23/ganha-comissao-com-link-de-afiliado-para-o-conar-isso-ja-e-publicidade/" target="_blank" rel="noopener">uai.com.br</a>, <a href="https://mundodomarketing.com.br/marketing-de-influencia-entra-na-era-do-compliance-apos-novo-guia-do-conar" target="_blank" rel="noopener">Mundo do Marketing</a>).</p>
<p>Na prática:</p>
<ul>
  <li>a divulgação aparece no próprio post, em lugar visível: no começo da legenda e, no vídeo, na fala ou no texto na tela;</li>
  <li>use palavras claras, como "publicidade" ou "link de afiliado: ganho comissão se você comprar";</li>
  <li>não esconda no meio das hashtags, no fim da legenda nem só na bio;</li>
  <li>confira também as regras do seu programa de afiliados e as ferramentas de conteúdo de marca de cada rede.</li>
</ul>
<p>O mesmo guia do CONAR pede transparência quando um conteúdo é gerado ou alterado por IA, inclusive avatares e influenciadores virtuais, para não induzir o consumidor ao erro. Se a IA criar ou mudar imagem, voz ou pessoa no seu post, avise.</p>
<p class="nota">Isto não é orientação jurídica. O CONAR é autorregulamentação e não substitui a lei. Em caso de dúvida, consulte as regras do programa e um profissional.</p>

<h3>Os cuidados do guia</h3>
<table>
  <thead><tr><th scope="col">Cuidado</th><th scope="col">Na prática</th></tr></thead>
  <tbody>
    <tr><th scope="row">Regras das plataformas</th><td>Use a API oficial do Instagram. Nada de robô que curte, segue ou comenta em massa: isso quebra as regras e leva a bloqueio.</td></tr>
    <tr><th scope="row">Qualidade</th><td>Conteúdo genérico em massa perde alcance. Sua voz e seu nicho são o diferencial.</td></tr>
    <tr><th scope="row">Verificação</th><td>A IA pode errar fatos e números. Confira, principalmente em saúde, finanças e promessas de resultado.</td></tr>
    <tr><th scope="row">Publicidade</th><td>Indique parcerias e links de afiliado de forma clara.</td></tr>
    <tr><th scope="row">Imagens e músicas</th><td>Use só o que você pode usar comercialmente.</td></tr>
    <tr><th scope="row">Custos e segurança</th><td>Defina limite de gasto nas APIs e proteja as chaves. Se vazarem, outra pessoa gasta no seu nome.</td></tr>
  </tbody>
</table>
`,
      acesso: {
        lacuna: true,
        nota: 'O guia não detalha as regras de cada rede para conteúdo de marca. Consulte as páginas de ajuda oficiais.',
        itens: [
          { id: 'link', texto: '<strong>Seu link de afiliado</strong>, do programa escolhido no Módulo 1, e as regras de divulgação do programa.' },
          { id: 'regras', texto: '<strong>As regras de conteúdo de marca</strong> de cada rede onde você publica (páginas de ajuda oficiais).' }
        ]
      },
      missoes: [
        {
          id: '5.1',
          titulo: 'Mapa de renda',
          minutos: 40,
          objetivo: 'Saber, para cada frente, o que você oferece, para quem, onde está o link e como medir.',
          linhas: {
            propria: 'Diga o que a marca constrói agora e qual produto ou infoproduto pode nascer dela depois, sem data prometida.',
            afiliado: 'Escolha 3 produtos que você realmente indicaria, o formato (review ou comparativo) e onde fica o link.'
          },
          passos: [
            'Copie o modelo do mapa de renda (abaixo) para um documento seu.',
            'Preencha a linha da marca própria.',
            'Preencha a linha de afiliados.',
            'Opcional, do guia: preencha o acelerador, uma oferta simples de produção de conteúdo com IA para um pequeno negócio.',
            'Peça ao Claude a crítica do mapa (prompt abaixo) e ajuste o que fizer sentido.'
          ],
          prompts: [
            {
              titulo: 'Modelo do mapa de renda',
              texto: [
                'MAPA DE RENDA',
                'Frente          | O que ofereço | Para quem | Onde fica o link | Métrica',
                'Marca própria   |               |           |                  |',
                'Afiliados       |               |           |                  | cliques',
                'Acelerador (op.)|               |           |                  |'
              ].join('\n')
            },
            {
              titulo: 'Crítica do mapa (Claude)',
              texto: [
                'Aponte o que está vago neste mapa de renda, os riscos e o que eu',
                'consigo testar nos próximos 30 dias. Não prometa resultados.',
                '',
                '[cole o mapa]'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Crítica do mapa de renda', categoria: 'apoio', rotulo: 'Salvar no Caderno' }
            }
          ],
          entregavel: 'O mapa de renda preenchido (cole aqui ou o link do documento).',
          criterios: [
            'Cada linha tem oferta, público, local do link e métrica (para afiliados: cliques).',
            'Existe pelo menos uma ação de renda testável nos próximos 30 dias.',
            'Nenhuma linha depende de "ficar famoso primeiro".'
          ]
        },
        {
          id: '5.2',
          titulo: 'Kit de conformidade e a v5',
          minutos: 45,
          objetivo: 'Colocar as regras dentro do prompt antes de a produção ganhar volume.',
          linhas: {
            propria: 'A v5 usa o CTA e o link da sua oferta própria, quando houver.',
            afiliado: 'A v5 obriga a divulgação no começo da legenda e no vídeo.'
          },
          passos: [
            'Escreva o seu texto padrão de divulgação de afiliado e onde ele entra em cada formato (legenda, fala ou texto na tela do vídeo, descrição).',
            'Escreva a sua lista "barrar sempre", a partir dos cuidados do guia, e cole no topo da planilha.',
            'Defina de onde vêm as suas imagens e músicas (bancos e bibliotecas com uso comercial permitido) e anote a regra: sem origem conhecida, não usa.',
            'Crie a v5 de todos os prompts v4 (botão abaixo) e preencha {DIVULGACAO}, {CTA} e {LINK}.',
            'Teste: peça ao Claude um post de afiliado com a v5, sem mencionar divulgação no pedido, e confira se ela aparece.'
          ],
          prompts: [
            {
              titulo: 'Bloco de oferta e conformidade (v5)',
              bloco: 'oferta',
              acao: { tipo: 'evoluir', de: 'v4', para: 'v5', bloco: 'oferta', rotulo: 'Criar v5 de todos os prompts v4' }
            },
            {
              titulo: 'Modelo do kit de conformidade',
              texto: [
                'KIT DE CONFORMIDADE',
                'Divulgação padrão: "..."',
                '  Na legenda: ...',
                '  No vídeo: ...',
                '  Na descrição: ...',
                'Barrar sempre: ...',
                'Imagens e músicas: só de ... (uso comercial permitido)',
                'Conteúdo com IA: avisar quando imagem, voz ou pessoa for gerada ou alterada',
                'Chaves de API: nunca em prints, prompts, planilhas ou repositórios'
              ].join('\n')
            }
          ],
          entregavel: 'O seu kit de conformidade (cole aqui) e a divulgação que apareceu no post de teste.',
          criterios: [
            'O post de teste sai com divulgação clara sem você pedir.',
            'A lista "barrar sempre" está no topo da planilha.',
            'Você sabe de onde vem cada imagem e música que pretende usar.'
          ]
        }
      ],
      perguntas: [
        {
          id: '5a',
          enunciado: 'Depois de 3 semanas, poucos seguidores e nenhuma venda. O que o guia diria?',
          opcoes: [
            'Que o plano falhou e é hora de trocar de nicho.',
            'Que o conteúdo raramente paga sozinho no começo: olhe cliques e salvamentos e considere vender automação como serviço.',
            'Que basta dobrar o número de posts por dia.'
          ],
          correta: 1,
          explicacao: 'Renda de conteúdo leva tempo. O guia sugere vender a automação como serviço, a rota que costuma trazer retorno mais cedo.'
        },
        {
          id: '5b',
          enunciado: 'Num Reels de afiliado, a divulgação está só como a vigésima hashtag da legenda. Está ok?',
          opcoes: [
            'Sim, porque está escrita.',
            'Não: tem de ser clara e visível, no começo da legenda e no próprio vídeo.',
            'Sim, se o link estiver na bio.'
          ],
          correta: 1,
          explicacao: 'Divulgação escondida não avisa quem assiste. O guia pede clareza, e o CONAR pede identificação ostensiva e imediata.'
        },
        {
          id: '5c',
          enunciado: 'Um review diz "com este produto você vai economizar R$ 500 por mês". Aprovar?',
          opcoes: [
            'Sim, se o produto for bom.',
            'Sim, com "resultados podem variar" no fim.',
            'Não: é finanças e promessa de resultado; barre ou reescreva sem promessa.'
          ],
          correta: 2,
          explicacao: 'Promessa de resultado em finanças é um dos casos em que o guia exige verificação, e a sua v5 proíbe promessa de resultado.'
        },
        {
          id: '5d',
          enunciado: 'Uma música em alta combina com o vídeo de afiliado. Pode usar?',
          opcoes: [
            'Sim, porque está em alta na própria rede.',
            'Só se você tiver direito de uso comercial dela.',
            'Sim, se durar menos de 10 segundos.'
          ],
          correta: 1,
          explicacao: 'Post de afiliado é conteúdo comercial. O guia pede usar só imagens e músicas que você pode usar comercialmente.'
        },
        {
          id: '5e',
          enunciado: 'Por que as regras de conformidade entram no prompt, se você já revisa tudo?',
          opcoes: [
            'Porque, com a regra no prompt, a revisão deixa de ser necessária.',
            'Porque no Módulo 6 o script vai gerar em volume, e a regra evita o erro na origem; a revisão continua obrigatória.',
            'Porque as redes leem o prompt antes de publicar.'
          ],
          correta: 1,
          explicacao: 'Prevenção na origem e revisão no fim se somam: uma não substitui a outra.'
        }
      ],
      retomada: 'Mapa de renda, kit de conformidade e v5 salvos. O próximo passo é a Missão 6.1: criar e proteger as chaves de API.'
    },

    /* ------------------------------------------------------------------ */
    {
      n: 6,
      cor: '#8B6CFF',
      corTexto: '#1A1530',
      titulo: 'Automação',
      subtitulo: 'Chaves, script, agenda e relatório',
      objetivo: 'Fazer o fluxo rodar quase sozinho: o script gera a semana na planilha, monta a fila do que foi aprovado e escreve o relatório.',
      tempo: 'Cerca de 3h, em 3 missões (cada uma pode levar mais de um bloco)',
      versao: 'v5 → v6',
      estacoes: [5, 6],
      leitura: `
<h3>A API, agora na prática</h3>
<p>API é a porta que deixa um programa conversar com outro. Com ela, um script seu manda a pauta e o prompt-modelo para o Claude e recebe o post pronto, sem você copiar e colar. O guia lista o que ela liga: Grok, Claude, Instagram Graph API, planilhas e agenda.</p>

<h3>Chave de API</h3>
<p>É a senha que identifica você na API, e a API cobra por uso. Se a chave vazar, outra pessoa gasta no seu nome. Por isso:</p>
<ul>
  <li>defina um limite de gasto antes do primeiro teste;</li>
  <li>nunca cole a chave em prompts, prints, planilhas, grupos, sites ou repositórios públicos, nem neste site;</li>
  <li>guarde a chave fora do código, num lugar do seu computador que o script lê mas que não vai junto com o código (uma variável de ambiente, por exemplo);</li>
  <li>se suspeitar de vazamento, revogue a chave e crie outra.</li>
</ul>

<h3>Script</h3>
<p>É um programa pequeno que executa os passos por você. O guia lembra que o próprio Claude escreve os scripts da automação; o seu papel é dizer exatamente o que o script deve fazer e conferir se ele fez.</p>

<h3>As etapas 5 e 6</h3>
<ul>
  <li><strong>Agendamento:</strong> envia o conteúdo aprovado para a fila ou para o Instagram, usando a API oficial. Robôs que curtem, seguem ou comentam em massa quebram as regras.</li>
  <li><strong>Medição:</strong> puxa as métricas, resume o que funcionou e sugere a próxima semana.</li>
</ul>

<h3>A semana automatizada do guia</h3>
{{ROTINA}}
<p>No seu sistema, as ideias do domingo entram com status "ideia". Se a revisão de segunda passar muito de 30 minutos, verifique as pautas no domingo, antes de rodar a produção.</p>

<p class="lacuna"><span class="selo selo-lacuna">Lacuna do guia</span> O guia não detalha a configuração da API oficial do Instagram (app de desenvolvedor, permissões, tokens), a publicação por API no TikTok e no YouTube Shorts, nem como puxar métricas por API. Siga a documentação oficial de cada plataforma. Enquanto isso, publique a partir da fila, à mão ou pelo agendador da própria rede, e registre as métricas na planilha.</p>
`,
      acesso: {
        nota: 'Preços, limites e telas mudam com frequência. Confirme nos sites oficiais.',
        itens: [
          { id: 'console', texto: '<strong>Claude Console</strong> (platform.claude.com): crie a conta de desenvolvedor. A API é cobrada por uso, à parte do app.' },
          { id: 'workspace', texto: '<strong>Limite de gasto:</strong> no Console, crie um workspace para este projeto e defina nele o limite mensal. A documentação avisa que o workspace padrão não aceita limite de gasto (<a href="https://platform.claude.com/docs/en/manage-claude/workspaces" target="_blank" rel="noopener">Workspaces, docs do Claude</a>).' },
          { id: 'grokapi', texto: '<strong>Opcional:</strong> chave da API do Grok, pelo console de desenvolvedor da xAI (documentação em docs.x.ai).' },
          { id: 'pc', texto: '<strong>Onde rodar o script:</strong> o seu computador. Peça ao Claude, no app, para guiar a instalação do que for necessário.' }
        ]
      },
      missoes: [
        {
          id: '6.1',
          titulo: 'Chaves com cadeado',
          minutos: 30,
          objetivo: 'Ter a chave funcionando, protegida e com limite de gasto.',
          passos: [
            'No workspace do projeto, gere a chave da API do Claude (e, se quiser, a do Grok no console da xAI).',
            'Defina um limite de gasto mensal baixo: o valor que você aceita perder num teste que dê errado. Onde não houver limite, use só créditos baixos, sem recarga automática.',
            'Guarde a chave fora do código, como o Claude orientar para o seu computador.',
            'Peça ao Claude, no app, o script de teste (prompt abaixo) e rode.',
            'Anote no Diário onde se revoga a chave, caso ela vaze.'
          ],
          prompts: [
            {
              titulo: 'Pedido do script de teste (Claude, no app)',
              texto: [
                'Sou iniciante. Quero testar a API do Claude no meu computador ({SISTEMA}).',
                'Escreva um script mínimo que envia "olá" e mostra a resposta.',
                'Regras: a chave fica numa variável de ambiente, nunca no código.',
                'Explique passo a passo como instalar o necessário, como guardar a chave',
                'e como rodar. Diga também onde eu revogo a chave se ela vazar.'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Pedido do script de teste', categoria: 'apoio', rotulo: 'Salvar no Caderno' }
            }
          ],
          entregavel: 'Descreva: qual limite de gasto você definiu e o que o script de teste respondeu. Não cole a chave aqui.',
          criterios: [
            'O script funciona e a chave não aparece no código.',
            'O limite de gasto (ou o crédito baixo, sem recarga) está configurado.',
            'Você sabe onde revogar a chave.'
          ]
        },
        {
          id: '6.2',
          titulo: 'Script: uma semana de posts na planilha',
          minutos: 90,
          objetivo: 'Cumprir o marco da semana 2 do guia: um script que gera uma semana de posts em uma planilha.',
          linhas: {
            propria: 'Ponto de partida sugerido: 5 dos 7 posts da semana.',
            afiliado: 'Ponto de partida sugerido: 2 dos 7, sempre com divulgação e dados conferidos. Ajuste a proporção com as métricas.'
          },
          passos: [
            'Crie a v6 de todos os prompts v5 (botão abaixo). O modo automação pede só um JSON, sem texto extra, para o script ler cada campo.',
            'Peça ao Claude a forma mais simples de o script ler e gravar a sua planilha (por exemplo, exportando como CSV).',
            'Peça ao Claude o script com os requisitos abaixo. Copie a lista inteira no pedido.',
            'Opcional: um passo anterior que chama a API do Grok com o seu prompt de pesquisa e grava 15 ideias com status "ideia". A verificação continua sendo sua.',
            'Rode, confira a planilha e revise os 7 posts com o checklist do Módulo 4.'
          ],
          prompts: [
            {
              titulo: 'Bloco de modo automação (v6)',
              bloco: 'automacao',
              acao: { tipo: 'evoluir', de: 'v5', para: 'v6', bloco: 'automacao', rotulo: 'Criar v6 de todos os prompts v5' }
            },
            {
              titulo: 'Requisitos do script (cole no pedido ao Claude)',
              texto: [
                'Escreva um script que:',
                '1. lê da planilha as 7 pautas marcadas para a semana (status da pauta = verificada);',
                '2. pula pautas que já têm post na planilha;',
                '3. escolhe o prompt-modelo certo para cada uma (rede, formato e linha);',
                '4. preenche as variáveis e chama a API do Claude;',
                '5. lê o JSON da resposta e grava cada campo na coluna certa,',
                '   como nova linha, com status do post = rascunho;',
                '6. nunca publica nada e nunca apaga linhas;',
                '7. lê a chave de uma variável de ambiente;',
                '8. para e avisa se der erro, em vez de tentar sem parar;',
                '9. mostra no fim quantas chamadas fez.',
                'Explique como rodar, passo a passo, para um iniciante.'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Requisitos do script da semana', categoria: 'apoio', rotulo: 'Salvar no Caderno' }
            }
          ],
          entregavel: 'Onde o script está guardado (sem a chave) e o link da planilha com os 7 rascunhos gerados por ele.',
          criterios: [
            'Só pautas verificadas viraram post.',
            'Todos os posts entraram como rascunho, com "Pontos a verificar" e, nos de afiliados, divulgação.',
            'Rodar de novo não apaga, não sobrescreve e não duplica nada.',
            'A chave não está no script.'
          ]
        },
        {
          id: '6.3',
          titulo: 'Fila de agendamento e relatório da semana',
          minutos: 60,
          objetivo: 'Cumprir o marco da semana 4 do guia: agenda e relatório automatizados.',
          passos: [
            'Peça ao Claude a extensão do script que monta a fila (prompt abaixo): um bloco por dia e por rede, só com posts aprovados.',
            'Se você já configurou a API oficial do Instagram seguindo a documentação da Meta, o script pode enviar por ela os posts aprovados. TikTok e Shorts: publique a partir da fila, à mão ou pelo agendador da própria rede, até configurar a API oficial de cada uma.',
            'Deixe escrita no script a regra fixa: nada de curtir, seguir ou comentar automaticamente. Respostas a comentários são sugeridas pelo M-resposta e publicadas por você.',
            'Depois de uma semana publicando, preencha na planilha os salvamentos, compartilhamentos e cliques de cada post. Faça à mão, se ainda não tiver métricas por API; prints também servem, porque o Claude analisa prints de métricas.',
            'Rode o prompt de relatório (pelo script ou no app) e lance as 5 pautas sugeridas na planilha como "ideia". Elas passam pela checagem do Módulo 2 antes de virar post.'
          ],
          prompts: [
            {
              titulo: 'Pedido da fila de agendamento',
              texto: [
                'Estenda o meu script para montar a fila da semana:',
                '1. leia só os posts com status do post = aprovado e com data de publicação;',
                '2. monte um bloco por dia e por rede, com o texto pronto para publicar;',
                '3. nunca curta, siga ou comente nada automaticamente;',
                '4. se eu configurar a API oficial do Instagram, envie por ela apenas os',
                '   posts aprovados do Instagram; para TikTok e Shorts, só gere o texto.',
                'Explique como rodar, passo a passo.'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Pedido da fila de agendamento', categoria: 'apoio', rotulo: 'Salvar no Caderno' }
            },
            {
              titulo: 'Prompt de relatório',
              texto: [
                'Com base só nos números desta tabela, diga:',
                '1) quais posts tiveram mais salvamentos, compartilhamentos e cliques;',
                '2) o que eles têm em comum (formato, rede, linha, gancho);',
                '3) o que repetir e o que parar;',
                '4) 5 pautas para a próxima semana, cada uma com o motivo.',
                'Não invente números. Se os dados forem poucos para concluir, diga isso.',
                '',
                '[cole a tabela ou anexe os prints]'
              ].join('\n'),
              acao: { tipo: 'salvar', nome: 'Prompt de relatório', categoria: 'relatorio', rotulo: 'Salvar no Caderno' }
            }
          ],
          entregavel: 'Um resumo do primeiro relatório semanal (o que repetir e o que parar) e as 5 pautas sugeridas.',
          criterios: [
            'Nenhum post sem status "aprovado" aparece na fila.',
            'O relatório só usa números que estão na planilha.',
            'As pautas sugeridas entraram como "ideia", não como "verificada".'
          ]
        }
      ],
      perguntas: [
        {
          id: '6a',
          enunciado: 'Você colou um print com a sua chave de API num grupo para pedir ajuda. O que fazer agora?',
          opcoes: [
            'Apagar a mensagem do grupo e seguir normalmente.',
            'Revogar a chave na hora, criar outra e conferir o gasto.',
            'Trocar a senha do e-mail.'
          ],
          correta: 1,
          explicacao: 'Apagar a mensagem não desfaz o vazamento: alguém pode ter copiado. Se a chave vazar, outra pessoa gasta no seu nome.'
        },
        {
          id: '6b',
          enunciado: 'Um app promete crescer seu Instagram com um robô que segue e curte 500 perfis por dia. Usa?',
          opcoes: [
            'Sim, se for só por um mês.',
            'Sim, se o app for pago.',
            'Não: ações em massa por robô quebram as regras e levam a bloqueio; o caminho é a API oficial.'
          ],
          correta: 2,
          explicacao: 'O guia é explícito: robôs que curtem, seguem ou comentam em massa levam a bloqueio. Crescimento vem de conteúdo e nicho.'
        },
        {
          id: '6c',
          enunciado: 'O script gerou 7 posts e um cita um dado de saúde. Pode ir direto para a fila?',
          opcoes: [
            'Sim, porque a v5 já proíbe promessa de resultado.',
            'Não: só post aprovado na revisão humana entra na fila, e saúde exige verificação.',
            'Sim, se o dado tiver um link.'
          ],
          correta: 1,
          explicacao: 'A regra no prompt reduz erros, mas não aprova nada. Quem aprova é você.'
        },
        {
          id: '6d',
          enunciado: 'Por que definir o limite de gasto antes do primeiro teste, e não depois?',
          opcoes: [
            'Porque um erro no script, como um laço que repete chamadas, pode gastar muito em minutos.',
            'Porque sem limite a API não funciona.',
            'Porque o limite deixa as respostas melhores.'
          ],
          correta: 0,
          explicacao: 'A API cobra por uso. O limite é o cinto de segurança: precisa estar preso antes de o carro andar.'
        },
        {
          id: '6e',
          enunciado: 'O relatório diz que posts de terça rendem o triplo, mas você só tem duas terças de dados. Como usar isso?',
          opcoes: [
            'Passar a publicar só às terças.',
            'Tratar como hipótese a testar e conferir os números na planilha.',
            'Ignorar o relatório inteiro.'
          ],
          correta: 1,
          explicacao: 'Amostra pequena engana, e a IA pode errar números. Use o relatório para escolher o próximo teste, não para tirar uma regra.'
        },
        {
          id: '6f',
          enunciado: 'Você quer publicar no TikTok pelo script, mas o guia não traz o procedimento. O que fazer?',
          opcoes: [
            'Usar uma ferramenta não oficial que promete postar por você.',
            'Seguir a documentação oficial da API do TikTok e, até lá, publicar a partir da fila, à mão ou pelo agendador da rede.',
            'Desistir do TikTok.'
          ],
          correta: 1,
          explicacao: 'Quando o guia não cobre, a regra do curso é não inventar: siga a fonte oficial e mantenha a publicação manual até lá.'
        }
      ],
      retomada: 'Script, fila e relatório funcionando. Daqui em diante, você entra na rotina semanal do guia, descrita no fim da Trilha.'
    }
  ],

  trilha: {
    intro: 'As quatro etapas seguem o plano de 30 dias do guia. Como a sua dedicação varia, o que conta é o marco, não o calendário: numa semana curta, a etapa pode avançar para a semana seguinte. Os blocos marcados como "mínimo" são o caminho de uma semana curta.',
    etapas: [
      {
        id: 'e1',
        nome: 'Fundação',
        dias: [1, 7],
        doGuia: 'Escolha um nicho e um público. Crie contas Business/Creator. Teste Claude e Prompt Cowboy e salve 3 a 5 prompts bons.',
        marco: 'Nichos definidos, contas criadas, 3 a 5 prompts bons salvos e 3 posts escritos no teste manual.',
        blocos: [
          { id: 'e1b1', dia: 'Dia 1', texto: 'Seus dois nichos em uma frase', missao: '1.1', minimo: true },
          { id: 'e1b2', dia: 'Dia 2', texto: 'Do v0 à v1, com a planilha montada', missao: '1.2', minimo: true },
          { id: 'e1b3', dia: 'Dia 3', texto: 'O prompt de pesquisa e 15 ideias', missao: '2.1', minimo: true },
          { id: 'e1b4', dia: 'Dia 4', texto: 'Pautas verificadas e a v2', missao: '2.2', minimo: true },
          { id: 'e1b5', dia: 'Dia 5', texto: 'O prompt-mãe, v3', missao: '3.1', minimo: true },
          { id: 'e1b6', dia: 'Dia 6', texto: 'Os quatro modelos derivados (numa semana curta, só M-legenda e M-roteiro)', missao: '3.2', minimo: true },
          { id: 'e1b7', dia: 'Dia 7', texto: 'Teste manual: 3 posts e a v4', missao: '4.1', minimo: true },
          { id: 'e1b8', dia: 'Extra', texto: 'Um roteiro, quatro formatos', missao: '4.2', minimo: false }
        ],
        semanaCurta: 'Faça só os blocos mínimos, um por sessão. Se não couber, esta etapa continua na semana seguinte: a Etapa 2 começa quando o marco estiver cumprido.'
      },
      {
        id: 'e2',
        nome: 'Automação básica',
        dias: [8, 14],
        doGuia: 'Crie as chaves de API (Claude e, se quiser, Grok). Monte um script que gera uma semana de posts em uma planilha.',
        marco: 'Kit de conformidade pronto, chave com limite de gasto e o script gerando 7 rascunhos, revisados, na planilha.',
        blocos: [
          { id: 'e2b1', dia: 'Dia 8', texto: 'Revisão humana: aprovar, ajustar ou barrar', missao: '4.3', minimo: true },
          { id: 'e2b2', dia: 'Dia 9', texto: 'Kit de conformidade e a v5', missao: '5.2', minimo: true },
          { id: 'e2b3', dia: 'Dia 10', texto: 'Chaves com cadeado', missao: '6.1', minimo: true },
          { id: 'e2b4', dia: 'Dias 11 e 12', texto: 'Script: uma semana de posts na planilha', missao: '6.2', minimo: true },
          { id: 'e2b5', dia: 'Dia 13', texto: 'Revisar os 7 rascunhos com o checklist e verificar as pautas da semana', minimo: true },
          { id: 'e2b6', dia: 'Dia 14', texto: 'Mapa de renda (numa semana curta, fica para a Etapa 4)', missao: '5.1', minimo: false }
        ],
        semanaCurta: 'Não pule o kit de conformidade: ele precisa estar pronto antes do primeiro post de afiliado. O mapa de renda pode esperar a Etapa 4.'
      },
      {
        id: 'e3',
        nome: 'Publicação',
        dias: [15, 21],
        doGuia: 'Publique todos os dias com revisão manual. Registre o que gera salvamentos, compartilhamentos e cliques.',
        marco: 'Uma semana de publicações, todas revisadas, e a planilha com salvamentos, compartilhamentos e cliques de cada post.',
        blocos: [
          { id: 'e3b1', dia: 'Dia 15', texto: 'Publicar o post do dia (o mesmo vídeo em Reels, TikTok e Shorts; carrossel quando a pauta pedir) e responder comentários com o M-resposta', minimo: true },
          { id: 'e3b2', dia: 'Dia 16', texto: 'Publicar o post do dia e registrar as métricas dos anteriores', minimo: false },
          { id: 'e3b3', dia: 'Dia 17', texto: 'Publicar o post do dia e registrar as métricas dos anteriores', minimo: true },
          { id: 'e3b4', dia: 'Dia 18', texto: 'Publicar o post do dia e registrar as métricas dos anteriores', minimo: false },
          { id: 'e3b5', dia: 'Dia 19', texto: 'Publicar o post do dia e registrar as métricas dos anteriores', minimo: true },
          { id: 'e3b6', dia: 'Dia 20', texto: 'Publicar o post do dia e registrar as métricas dos anteriores', minimo: false },
          { id: 'e3b7', dia: 'Dia 21', texto: 'Publicar o post do dia e fechar a planilha da semana com as métricas', minimo: true }
        ],
        semanaCurta: 'Grave em lote no dia em que tiver tempo e use o agendador da própria rede, se houver. Se não der, publique em dias alternados, mas nunca sem revisão.'
      },
      {
        id: 'e4',
        nome: 'Escala',
        dias: [22, 30],
        doGuia: 'Automatize agendamento e relatório. Defina a oferta (afiliado, serviço ou produto) e coloque o link na bio.',
        marco: 'Relatório semanal rodando, oferta definida e link na bio.',
        blocos: [
          { id: 'e4b1', dia: 'Dias 22 e 23', texto: 'Fila de agendamento e relatório da semana', missao: '6.3', minimo: true },
          { id: 'e4b2', dia: 'Dia 24', texto: 'Gerar a semana seguinte com o script e revisar', minimo: true },
          { id: 'e4b3', dia: 'Dias 25 a 28', texto: 'Publicar seguindo a fila e registrar as métricas', minimo: false },
          { id: 'e4b4', dia: 'Dia 29', texto: 'Rodar o relatório e lançar as 5 pautas sugeridas como "ideia"', minimo: true },
          { id: 'e4b5', dia: 'Dia 30', texto: 'Revisar o mapa de renda com os números, definir a oferta principal e colocar o link na bio (com divulgação, se for de afiliado)', missao: '5.1', minimo: true }
        ],
        semanaCurta: 'O mínimo é o relatório, a oferta definida e o link na bio. A fila automática pode esperar.'
      }
    ],
    rotina: [
      { quando: 'Domingo à noite', oque: 'Pesquisa e produção: o script pergunta ao Grok o que está em alta e salva 15 ideias; o Claude transforma as melhores em 7 posts com legenda, roteiro e hashtags.' },
      { quando: 'Segunda de manhã', oque: 'Revisão: você revisa tudo em cerca de 30 minutos e aprova.' },
      { quando: 'Durante a semana', oque: 'Publicação: posts agendados e respostas sugeridas aos comentários, com a sua aprovação.' },
      { quando: 'Fim da semana', oque: 'Relatório: mostra o que funcionou e sugere o que repetir.' }
    ]
  },

  recursos: {
    checklist: {
      barrar: [
        'Fato ou número sem fonte conferida.',
        'Pauta não verificada tratada como fato.',
        'Saúde, finanças ou resultado sem verificação, ou qualquer promessa de resultado.',
        'Post de afiliado ou parceria sem divulgação clara.',
        'Imagem ou música sem direito de uso comercial.'
      ],
      ajustar: [
        'Não soa como você (tom de voz).',
        'Gancho fraco ou CTA ausente.',
        'Genérico: poderia ser de qualquer perfil.',
        'CTA que a rede não permite (por exemplo, link não clicável).'
      ],
      aprovar: [
        'Passou em todos os itens acima.',
        'Cada fato citado tem fonte que você conferiu.'
      ]
    },
    glossario: [
      { termo: 'Afiliado', def: 'Quem indica produtos de terceiros com um link próprio e ganha comissão por venda.' },
      { termo: 'API', def: 'A porta que deixa um programa conversar com outro.' },
      { termo: 'Chave de API', def: 'A senha que identifica você numa API. O uso é cobrado nela, por isso ela nunca pode vazar.' },
      { termo: 'CTA (chamada para ação)', def: 'O que você pede para a pessoa fazer: salvar, comentar, seguir ou clicar no link.' },
      { termo: 'Fonte primária', def: 'Quem originou a informação (comunicado oficial, página do fabricante, documento), e não quem repostou.' },
      { termo: 'Gancho', def: 'O começo do post ou do vídeo, feito para prender a atenção.' },
      { termo: 'Nicho', def: 'Quem você ajuda e com quê, em uma frase.' },
      { termo: 'Pauta', def: 'Um assunto específico que vira post.' },
      { termo: 'Prompt', def: 'A instrução que você dá para uma IA.' },
      { termo: 'Prompt-modelo', def: 'Um prompt com variáveis, criado uma vez e reutilizado.' },
      { termo: 'Script', def: 'Um programa pequeno que executa passos por você.' },
      { termo: 'UGC', def: 'Conteúdo feito por criadores para marcas usarem nos seus canais.' },
      { termo: 'Variável', def: 'Um espaço entre chaves no prompt, como {PAUTA}, preenchido a cada uso.' }
    ],
    lacunas: [
      { onde: 'Módulos 1 a 4', falta: 'Cadastro, planos e limites de Instagram, TikTok, YouTube, Grok, Prompt Cowboy e Claude', fazer: 'Seguir o cadastro oficial de cada um' },
      { onde: 'Módulo 1', falta: 'Como entrar em programas de afiliados', fazer: 'Escolher um programa e ler as regras dele' },
      { onde: 'Módulo 4', falta: 'Especificações de cada formato (duração, legenda, links clicáveis, link na bio)', fazer: 'Conferir na própria rede antes de produzir' },
      { onde: 'Módulo 4', falta: 'Gravação e edição de vídeo', fazer: 'Fora do escopo do curso' },
      { onde: 'Módulo 5', falta: 'Regras de cada rede para conteúdo de marca', fazer: 'Páginas de ajuda oficiais de cada rede' },
      { onde: 'Módulo 6', falta: 'Configuração da API oficial do Instagram', fazer: 'Documentação oficial da Meta' },
      { onde: 'Módulo 6', falta: 'Publicação por API no TikTok e no YouTube Shorts', fazer: 'Documentação oficial de cada plataforma; até lá, publicação manual ou pelo agendador da rede' },
      { onde: 'Módulo 6', falta: 'Métricas por API', fazer: 'Registro manual na planilha, ou prints analisados pelo Claude' },
      { onde: 'Geral', falta: 'Preços e limites das ferramentas', fazer: 'Confirmar nos sites oficiais; o próprio guia avisa que mudam com frequência' }
    ],
    fontes: [
      { titulo: 'Guia "Automação de marketing com IA" (novembro de 2026), base do curso', url: 'guia-automacao-marketing-ia.pdf' },
      { titulo: 'Fontes citadas pelo guia: documentação da xAI', url: 'https://docs.x.ai' },
      { titulo: 'Fontes citadas pelo guia: Prompt Cowboy', url: 'https://promptcowboy.ai' },
      { titulo: 'Workspaces e limite de gasto no Claude Console (documentação do Claude)', url: 'https://platform.claude.com/docs/en/manage-claude/workspaces' },
      { titulo: 'Novo guia do CONAR e links de afiliado (uai.com.br, setembro de 2026)', url: 'https://www.uai.com.br/networking-e-negocios/2026/09/23/ganha-comissao-com-link-de-afiliado-para-o-conar-isso-ja-e-publicidade/' },
      { titulo: 'Novo guia do CONAR: identificação e conteúdo com IA (Mundo do Marketing)', url: 'https://mundodomarketing.com.br/marketing-de-influencia-entra-na-era-do-compliance-apos-novo-guia-do-conar' },
      { titulo: 'Código de Defesa do Consumidor (Lei 8.078/1990), art. 36', url: '' }
    ]
  },

  planilha: {
    arquivo: 'planilha-de-conteudo.csv',
    colunas: [
      { nome: 'id', uso: 'Número da linha' },
      { nome: 'data', uso: 'Data de publicação prevista' },
      { nome: 'rede', uso: 'Instagram, TikTok ou YouTube' },
      { nome: 'formato', uso: 'Feed (carrossel), feed (imagem), Reels, TikTok ou Shorts' },
      { nome: 'linha', uso: 'Própria ou afiliado' },
      { nome: 'pauta', uso: 'O assunto específico do post' },
      { nome: 'evidência', uso: 'Link do que mostra que está em alta' },
      { nome: 'fonte conferida', uso: 'Link da fonte primária' },
      { nome: 'status da pauta', uso: 'Ideia, em verificação, verificada ou descartada' },
      { nome: 'id do roteiro', uso: 'Liga as versões do mesmo roteiro em redes diferentes' },
      { nome: 'gancho', uso: 'O começo que prende a atenção' },
      { nome: 'roteiro', uso: 'O texto do vídeo ou dos slides' },
      { nome: 'legenda', uso: 'O texto do post' },
      { nome: 'hashtags', uso: 'As hashtags do post' },
      { nome: 'CTA', uso: 'A chamada para ação' },
      { nome: 'divulgação', uso: 'O aviso de publicidade ou afiliado, quando houver' },
      { nome: 'pontos a verificar', uso: 'O que a revisão precisa conferir' },
      { nome: 'status do post', uso: 'Rascunho, aprovado, barrado ou publicado' },
      { nome: 'salvamentos', uso: 'Métrica registrada depois da publicação' },
      { nome: 'compartilhamentos', uso: 'Métrica registrada depois da publicação' },
      { nome: 'cliques', uso: 'Métrica registrada depois da publicação' },
      { nome: 'observações', uso: 'Motivo de barramento, ajustes, aprendizados' }
    ]
  }
};
