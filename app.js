/*
  Linha de Produção de Conteúdo com IA: aplicação do site.
  Sem dependências. Login e progresso no Supabase (config.js); IA pela Groq, através do seu servidor no Render.
  Sem configuração, o site funciona sem login e guarda o progresso só neste aparelho.
  O conteúdo do curso está em curso.js.
*/
(function () {
  'use strict';

  const C = window.CURSO;
  const CFG = window.CONFIG || {};
  const app = document.getElementById('app');
  const toastEl = document.querySelector('.toast');
  if (!C) { app.innerHTML = '<p class="sem-js">Não foi possível carregar o conteúdo do curso (curso.js).</p>'; return; }

  /* ================= Utilidades ================= */
  const MAPA_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => MAPA_ESC[c]);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const z = (n) => String(n).padStart(2, '0');
  const isoLocal = (d) => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  const hojeISO = () => isoLocal(new Date());
  const agoraISO = () => new Date().toISOString();
  const dataBR = (iso) => {
    if (!iso) return '';
    const s = String(iso);
    const base = s.length > 10 && !isNaN(Date.parse(s)) ? isoLocal(new Date(s)) : s.slice(0, 10);
    const p = base.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : s;
  };
  const somarDias = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return isoLocal(new Date(y, m - 1, d + n)); };
  const idDom = (id) => String(id).replace(/[^a-zA-Z0-9_-]/g, '-');
  const reduzMovimento = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const fatiar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'aluno';
  const ehObjeto = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const texto = (x, max) => String(x == null ? '' : x).slice(0, max || 20000);
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  const corMod = (mod) => `--m:${mod.cor};--mt:${mod.corTexto}`;
  const limpaUrl = (u) => String(u || '').trim().replace(/\/+$/, '');

  let toastTimer = null;
  function aviso(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('ver');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('ver'), 4000);
  }

  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (_) { /* nada */ } }
  };
  const K_SESSAO = 'linha-producao:sessao';
  const K_TEMA = 'linha-producao:tema';
  const K_ANTIGO = 'linha-producao:v1';
  const K_VOLTAR = 'linha-producao:voltar';
  const kAluno = (id) => 'linha-producao:aluno:' + id;

  /* Chaves de API e tokens nunca são salvos nem enviados. */
  const PADROES_CHAVE = [
    /\bgsk_[A-Za-z0-9]{20,}/, /sk-ant-[A-Za-z0-9_-]{16,}/, /\bxai-[A-Za-z0-9_-]{20,}/, /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}/,
    /\bAIza[0-9A-Za-z_-]{30,}/, /\bgh[pousr]_[A-Za-z0-9]{30,}/, /\bgithub_pat_[A-Za-z0-9_]{30,}/,
    /\bEAA[A-Za-z0-9]{40,}/, /\bIG(?:QV|AA)[A-Za-z0-9_-]{40,}/, /\bsb_secret_[A-Za-z0-9_-]{10,}/
  ];
  const pareceChave = (t) => PADROES_CHAVE.some((r) => r.test(String(t || '')));
  const TEXTO_CHAVE = 'Isto parece uma chave de API ou um token, e não foi salvo nem enviado. Apague do campo: chaves nunca devem ser coladas em sites, prints, prompts ou planilhas.';

  /* ================= Configuração ================= */
  const SB_URL = limpaUrl(CFG.supabaseUrl);
  const SB_KEY = String(CFG.supabaseAnonKey || '').trim();
  const API_URL = limpaUrl(CFG.apiUrl);
  function papelJwt(k) {
    try { return JSON.parse(atob(k.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role || ''; } catch (_) { return ''; }
  }
  let erroConfig = '';
  if (SB_KEY && (/^sb_secret_/.test(SB_KEY) || papelJwt(SB_KEY) === 'service_role')) {
    erroConfig = 'A chave em config.js é a chave secreta do Supabase. Ela dá acesso total ao banco e não pode ficar num site público. Troque pela chave pública ("publishable" ou "anon public") e gere uma nova chave secreta no painel do Supabase.';
  } else if (pareceChave([CFG.supabaseUrl, CFG.apiUrl].join(' '))) {
    erroConfig = 'Há uma chave de API em config.js. A chave da Groq fica só no Render, como variável de ambiente. Apague-a de config.js e gere uma nova no console da Groq.';
  } else if ((SB_URL && !SB_KEY) || (!SB_URL && SB_KEY)) {
    erroConfig = 'O config.js está incompleto: preencha supabaseUrl e supabaseAnonKey juntos.';
  }
  const modoNuvem = !erroConfig && !!(SB_URL && SB_KEY);
  const iaAtiva = modoNuvem && !!API_URL;

  /* ================= Supabase (login e progresso) ================= */
  function traduzErro(d, status) {
    const cod = String((d && (d.error_code || d.code || d.error)) || '');
    const msg = String((d && (d.msg || d.error_description || d.message || d.error)) || '');
    const tudo = cod + ' ' + msg;
    if (/invalid login credentials|invalid_credentials|invalid_grant/i.test(tudo)) return 'E-mail ou senha incorretos.';
    if (/email not confirmed|email_not_confirmed/i.test(tudo)) return 'Confirme o seu e-mail antes de entrar. Procure a mensagem na caixa de entrada e no spam.';
    if (/already registered|user_already_exists|email_exists/i.test(tudo)) return 'Já existe uma conta com este e-mail. Entre ou recupere a senha.';
    if (/same_password|should be different/i.test(tudo)) return 'A nova senha precisa ser diferente da atual.';
    if (/weak_password|password should be|at least \d+ characters/i.test(tudo)) return 'Senha fraca. Use pelo menos 8 caracteres, misturando letras e números.';
    if (/rate limit|over_email_send_rate_limit|over_request_rate_limit/i.test(tudo) || status === 429) return 'Muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.';
    if (/signup.*disabled|signups not allowed/i.test(tudo)) return 'A criação de contas está desligada no Supabase.';
    if (/invalid.*email|email_address_invalid/i.test(tudo)) return 'Este e-mail não parece válido.';
    if (status === 401 || status === 403) return 'A sua sessão expirou. Entre de novo.';
    if (status >= 500) return 'O servidor de login não respondeu. Se o projeto do Supabase estiver pausado, reative-o no painel.';
    return msg || 'Algo deu errado. Tente de novo.';
  }
  async function sbReq(caminho, op) {
    op = op || {};
    const h = Object.assign({ apikey: SB_KEY, 'Content-Type': 'application/json' }, op.headers || {});
    if (op.token) h.Authorization = 'Bearer ' + op.token;
    let r;
    try {
      r = await fetch(SB_URL + caminho, { method: op.method || 'GET', headers: h, body: op.body ? JSON.stringify(op.body) : undefined, keepalive: !!op.keepalive });
    } catch (_) {
      const e = new Error('Sem conexão com o servidor de login. Confira a internet.');
      e.status = 0;
      throw e;
    }
    const t = await r.text();
    let d = null;
    try { d = t ? JSON.parse(t) : null; } catch (_) { d = { msg: t }; }
    if (!r.ok) { const e = new Error(traduzErro(d, r.status)); e.status = r.status; e.dados = d; throw e; }
    return d;
  }
  const urlRetorno = () => location.origin + location.pathname;

  let sessao = null;
  function guardarSessao(d) {
    const agora = Math.floor(Date.now() / 1000);
    sessao = {
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: Number(d.expires_at) || agora + (Number(d.expires_in) || 3600),
      user: d.user ? { id: d.user.id, email: d.user.email, nome: (d.user.user_metadata && d.user.user_metadata.nome) || '' } : (sessao && sessao.user)
    };
    ls.set(K_SESSAO, sessao);
  }
  function limparSessao() { sessao = null; ls.del(K_SESSAO); }
  let renovando = null;
  async function tokenValido() {
    if (!sessao) throw Object.assign(new Error('Entre na sua conta.'), { status: 401 });
    if (sessao.expires_at - 90 > Date.now() / 1000) return sessao.access_token;
    if (!renovando) {
      renovando = sbReq('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: sessao.refresh_token } })
        .then((d) => { guardarSessao(d); return sessao.access_token; })
        .finally(() => { renovando = null; });
    }
    return renovando;
  }
  async function tratarRetornoEmail() {
    const h = location.hash.replace(/^#/, '');
    if (!/(^|&)(access_token|error)=/.test(h)) return null;
    const p = new URLSearchParams(h);
    history.replaceState(null, '', location.pathname + location.search);
    if (p.get('error')) {
      const d = p.get('error_description') || '';
      return { erro: /expired|invalid/i.test(d + p.get('error_code')) ? 'O link expirou ou já foi usado. Peça outro.' : (d || 'Não foi possível usar o link.') };
    }
    const token = p.get('access_token');
    const user = await sbReq('/auth/v1/user', { token });
    guardarSessao({ access_token: token, refresh_token: p.get('refresh_token'), expires_at: p.get('expires_at'), expires_in: p.get('expires_in'), user });
    return { tipo: p.get('type') || '' };
  }

  /* ================= Estado do aluno ================= */
  const VERSOES = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5', 'v6'];
  const TIPOS = { base: 'Prompt-base', modelo: 'Modelo', pesquisa: 'Pesquisa', apoio: 'Apoio', relatorio: 'Relatório', saida: 'Saída de teste' };

  function alunoNovo(nome) {
    return { id: uid(), nome: nome || 'Aluno', criadoEm: hojeISO(), atualizadoEm: '', leitura: {}, acesso: {}, missoes: {}, quiz: {}, caderno: [], diario: [], trilha: { inicio: '', feitos: {}, marcos: {} }, ultimo: null };
  }
  function normalizar(a) {
    if (!ehObjeto(a)) a = alunoNovo('');
    a.id = texto(a.id || uid(), 60);
    a.nome = texto(a.nome || 'Aluno', 40);
    a.criadoEm = texto(a.criadoEm || hojeISO(), 30);
    a.atualizadoEm = texto(a.atualizadoEm || '', 40);
    a.leitura = ehObjeto(a.leitura) ? a.leitura : {};
    a.acesso = ehObjeto(a.acesso) ? a.acesso : {};
    a.quiz = ehObjeto(a.quiz) ? a.quiz : {};
    a.missoes = ehObjeto(a.missoes) ? a.missoes : {};
    Object.keys(a.missoes).forEach((k) => {
      const m = a.missoes[k];
      if (!ehObjeto(m)) { delete a.missoes[k]; return; }
      m.passos = ehObjeto(m.passos) ? m.passos : {};
      m.criterios = ehObjeto(m.criterios) ? m.criterios : {};
      m.entregavel = texto(m.entregavel);
      m.concluidaEm = /^\d{4}-\d{2}-\d{2}$/.test(m.concluidaEm || '') ? m.concluidaEm : '';
      m.revisaoIA = ehObjeto(m.revisaoIA) ? { texto: texto(m.revisaoIA.texto, 6000), em: texto(m.revisaoIA.em, 40) } : null;
    });
    a.caderno = Array.isArray(a.caderno) ? a.caderno.filter(ehObjeto).map((e) => ({
      id: texto(e.id || uid(), 60), nome: texto(e.nome, 120), versao: VERSOES.includes(e.versao) ? e.versao : '',
      tipo: TIPOS[e.tipo] ? e.tipo : 'apoio', texto: texto(e.texto, 60000), nota: texto(e.nota, 4000), bom: !!e.bom,
      criadoEm: texto(e.criadoEm || agoraISO(), 40), atualizadoEm: texto(e.atualizadoEm || e.criadoEm || agoraISO(), 40)
    })) : [];
    a.diario = Array.isArray(a.diario) ? a.diario.filter(ehObjeto).map((d) => ({
      id: texto(d.id || uid(), 60), data: /^\d{4}-\d{2}-\d{2}$/.test(d.data || '') ? d.data : hojeISO(),
      fiz: texto(d.fiz, 4000), proximo: texto(d.proximo, 2000), missao: texto(d.missao, 10), criadoEm: texto(d.criadoEm || agoraISO(), 40)
    })) : [];
    a.trilha = ehObjeto(a.trilha) ? a.trilha : {};
    a.trilha.inicio = /^\d{4}-\d{2}-\d{2}$/.test(a.trilha.inicio || '') ? a.trilha.inicio : '';
    a.trilha.feitos = ehObjeto(a.trilha.feitos) ? a.trilha.feitos : {};
    a.trilha.marcos = ehObjeto(a.trilha.marcos) ? a.trilha.marcos : {};
    a.ultimo = ehObjeto(a.ultimo) && typeof a.ultimo.rota === 'string' && /^#\/[a-z0-9./-]*$/i.test(a.ultimo.rota)
      ? { rota: a.ultimo.rota.slice(0, 80), rotulo: texto(a.ultimo.rotulo, 200), em: texto(a.ultimo.em, 30) } : null;
    delete a.boasVindas;
    return a;
  }
  function progressoAntigo() {
    const e = ls.get(K_ANTIGO);
    if (!ehObjeto(e) || !ehObjeto(e.alunos)) return null;
    const a = e.alunos[e.ativo] || Object.values(e.alunos)[0];
    if (!a) return null;
    const temAlgo = (a.caderno && a.caderno.length) || Object.keys(a.missoes || {}).length || Object.keys(a.quiz || {}).length;
    return temAlgo ? a : null;
  }

  let aluno = null;
  const sync = { estado: 'local', timer: null, emCurso: false, pendente: false, podeEnviar: false };

  function salvar() {
    if (!aluno) return;
    aluno.atualizadoEm = agoraISO();
    const ok = ls.set(kAluno(aluno.id), aluno);
    if (!modoNuvem) {
      if (!ok) aviso('Não foi possível salvar neste navegador. Baixe o seu progresso na página Conta.');
      return;
    }
    marcarSync('salvando');
    clearTimeout(sync.timer);
    sync.timer = setTimeout(sincronizar, 1200);
  }
  async function buscarRemoto() {
    const token = await tokenValido();
    const r = await sbReq(`/rest/v1/progresso?select=dados,atualizado_em&user_id=eq.${encodeURIComponent(sessao.user.id)}`, { token });
    return Array.isArray(r) && r[0] && ehObjeto(r[0].dados) ? r[0].dados : null;
  }
  async function enviarRemoto(keepalive) {
    const token = await tokenValido();
    await sbReq('/rest/v1/progresso?on_conflict=user_id', {
      method: 'POST', token, keepalive,
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { user_id: sessao.user.id, dados: aluno, atualizado_em: agoraISO() }
    });
  }
  async function sincronizar() {
    if (!modoNuvem || !sessao || !aluno) return;
    if (sync.emCurso) { sync.pendente = true; return; }
    sync.emCurso = true;
    marcarSync('salvando');
    try {
      if (!sync.podeEnviar) {
        const remoto = await buscarRemoto();
        sync.podeEnviar = true;
        if (remoto && (remoto.atualizadoEm || '') > (aluno.atualizadoEm || '')) {
          aluno = normalizar(remoto);
          aluno.id = sessao.user.id;
          ls.set(kAluno(aluno.id), aluno);
          marcarSync('ok');
          rerender();
          return;
        }
      }
      await enviarRemoto(false);
      marcarSync('ok');
    } catch (e) {
      marcarSync('erro');
      if (e.status === 400 || e.status === 401) sessaoExpirada();
    } finally {
      sync.emCurso = false;
      if (sync.pendente) { sync.pendente = false; setTimeout(sincronizar, 300); }
    }
  }
  const TEXTO_SYNC = { local: 'Salvo neste aparelho', ok: 'Salvo na sua conta', salvando: 'Salvando', erro: 'Sem conexão: salvo neste aparelho' };
  function marcarSync(estado) {
    sync.estado = estado;
    document.querySelectorAll('[data-sync]').forEach((el) => {
      el.dataset.estado = estado;
      el.title = TEXTO_SYNC[estado];
      const s = el.querySelector('span');
      if (s) s.textContent = TEXTO_SYNC[estado];
    });
  }
  const htmlSync = () => `<span class="sync" data-sync data-estado="${sync.estado}" title="${TEXTO_SYNC[sync.estado]}" role="status"><span>${TEXTO_SYNC[sync.estado]}</span></span>`;

  async function abrirProgressoDaConta() {
    const id = sessao.user.id;
    let local = ls.get(kAluno(id));
    let remoto = null;
    try { remoto = await buscarRemoto(); sync.podeEnviar = true; marcarSync('ok'); } catch (e) {
      if (e.status === 400 || e.status === 401) throw e;
      sync.podeEnviar = false;
      marcarSync('erro');
    }
    let trouxe = false;
    if (!remoto && !local && sync.podeEnviar) {
      const semLogin = ls.get(kAluno('local'));
      const antigo = semLogin && (semLogin.caderno || []).length + Object.keys(semLogin.missoes || {}).length ? semLogin : progressoAntigo();
      if (antigo) { local = antigo; trouxe = true; }
    }
    let escolhido = remoto;
    if (local && (!remoto || (local.atualizadoEm || '') > (remoto.atualizadoEm || ''))) escolhido = local;
    aluno = normalizar(escolhido ? JSON.parse(JSON.stringify(escolhido)) : alunoNovo(''));
    aluno.id = id;
    if (sessao.user.nome) aluno.nome = sessao.user.nome;
    else if (!escolhido || aluno.nome === 'Aluno') aluno.nome = (sessao.user.email || 'Aluno').split('@')[0].slice(0, 40);
    ls.set(kAluno(id), aluno);
    if (sync.podeEnviar && escolhido !== remoto) { clearTimeout(sync.timer); sync.timer = setTimeout(sincronizar, 400); }
    if (trouxe) setTimeout(() => aviso('Trouxemos para a sua conta o progresso que estava neste navegador.'), 600);
    if (iaAtiva) fetch(API_URL + '/saude').catch(() => {});
  }
  function abrirProgressoLocal() {
    let a = ls.get(kAluno('local'));
    if (!a) { a = progressoAntigo() || alunoNovo(''); }
    aluno = normalizar(a);
    aluno.id = 'local';
    ls.set(kAluno('local'), aluno);
    marcarSync('local');
  }
  function sessaoExpirada() {
    limparSessao();
    aluno = null;
    aviso('A sua sessão expirou. Entre de novo.');
    ir('#/entrar');
  }
  async function sair() {
    clearTimeout(sync.timer);
    if (sessao && aluno) { try { await enviarRemoto(true); } catch (_) { /* fica no aparelho */ } }
    if (sessao) { try { await sbReq('/auth/v1/logout', { method: 'POST', token: sessao.access_token }); } catch (_) { /* sem problema */ } }
    limparSessao();
    aluno = null;
    sync.podeEnviar = false;
    ir('#/entrar');
  }

  /* ================= Índices do curso ================= */
  const MISSOES = [];
  const MAPA = {};
  C.modulos.forEach((mod) => mod.missoes.forEach((mi) => { MAPA[mi.id] = { mod, mi, idx: MISSOES.length }; MISSOES.push(mi.id); }));
  const modulo = (n) => C.modulos.find((m) => m.n === Number(n));
  const ROTULO_STATUS = { pendente: 'Não iniciada', andamento: 'Em andamento', feito: 'Concluída' };

  /* ================= Progresso ================= */
  const lerMissao = (id) => aluno.missoes[id] || { passos: {}, criterios: {}, entregavel: '', concluidaEm: '', revisaoIA: null };
  function missaoEditavel(id) {
    if (!aluno.missoes[id]) aluno.missoes[id] = { passos: {}, criterios: {}, entregavel: '', concluidaEm: '', revisaoIA: null };
    return aluno.missoes[id];
  }
  function statusMissao(id) {
    const m = aluno.missoes[id];
    if (!m) return 'pendente';
    if (m.concluidaEm) return 'feito';
    const algo = Object.values(m.passos).some(Boolean) || Object.values(m.criterios).some(Boolean) || String(m.entregavel || '').trim() !== '';
    return algo ? 'andamento' : 'pendente';
  }
  function faltasMissao(id) {
    const { mi } = MAPA[id];
    const m = lerMissao(id);
    const f = [];
    const n = mi.criterios.filter((_, i) => !m.criterios[i]).length;
    if (n) f.push(plural(n, 'critério', 'critérios'));
    if (!String(m.entregavel || '').trim()) f.push('o entregável');
    return f;
  }
  function progressoQuiz(mod) {
    const r = aluno.quiz[mod.n] || {};
    const total = mod.perguntas.length;
    const certas = mod.perguntas.filter((q) => r[q.id] && r[q.id].certa).length;
    const respondidas = mod.perguntas.filter((q) => r[q.id] && typeof r[q.id].escolha === 'number').length;
    const primeira = mod.perguntas.filter((q) => r[q.id] && r[q.id].primeira === true).length;
    return { total, certas, respondidas, primeira };
  }
  const itemOpcional = (it) => /Opcional/i.test(it.texto);
  function statusAcesso(mod) {
    const f = aluno.acesso[mod.n] || {};
    const obrig = mod.acesso.itens.filter((it) => !itemOpcional(it));
    if (obrig.every((it) => f[it.id])) return 'feito';
    return mod.acesso.itens.some((it) => f[it.id]) ? 'andamento' : 'pendente';
  }
  function etapasModulo(mod) {
    const q = progressoQuiz(mod);
    return [
      { chave: 'leitura', rota: `#/modulo/${mod.n}/leitura`, titulo: 'Leitura', sub: 'O conceito do guia, do zero', status: aluno.leitura[mod.n] ? 'feito' : 'pendente' },
      { chave: 'acesso', rota: `#/modulo/${mod.n}/acesso`, titulo: 'Acesso', sub: 'Contas e arquivos antes das missões', status: statusAcesso(mod) },
      ...mod.missoes.map((mi) => ({ chave: 'missao-' + mi.id, rota: `#/missao/${mi.id}`, titulo: `Missão ${mi.id}: ${mi.titulo}`, sub: `Cerca de ${mi.minutos} minutos`, status: statusMissao(mi.id) })),
      { chave: 'perguntas', rota: `#/modulo/${mod.n}/perguntas`, titulo: 'Perguntas de verificação', sub: `${q.certas} de ${q.total} certas`, status: q.certas === q.total ? 'feito' : q.respondidas ? 'andamento' : 'pendente' }
    ];
  }
  function progressoModulo(mod) {
    const et = etapasModulo(mod);
    const feitas = et.filter((e) => e.status === 'feito').length;
    return { etapas: et, feitas, total: et.length, pct: Math.round((100 * feitas) / et.length), concluido: feitas === et.length, iniciado: et.some((e) => e.status !== 'pendente') };
  }
  function proximaEtapa() {
    for (const mod of C.modulos) {
      const e = etapasModulo(mod).find((x) => x.status !== 'feito');
      if (e) return { mod, etapa: e };
    }
    return null;
  }
  const totais = () => ({ feitas: MISSOES.filter((id) => statusMissao(id) === 'feito').length, total: MISSOES.length });
  const blocoFeito = (b) => (b.missao ? statusMissao(b.missao) === 'feito' : !!aluno.trilha.feitos[b.id]);
  function atualizarMarcos() {
    C.trilha.etapas.forEach((e) => {
      if (aluno.trilha.marcos[e.id]) return;
      if (e.blocos.filter((b) => b.minimo).every(blocoFeito)) aluno.trilha.marcos[e.id] = hojeISO();
    });
  }
  function registrarUltimo(rota, rotulo) {
    if (aluno.ultimo && aluno.ultimo.rota === rota && aluno.ultimo.em === hojeISO()) return;
    aluno.ultimo = { rota, rotulo, em: hojeISO() };
    salvar();
  }
  const ordemDiario = (x, y) => (y.data || '').localeCompare(x.data || '') || (y.criadoEm || '').localeCompare(x.criadoEm || '');

  /* ================= Ícones ================= */
  const IC = {
    inicio: '<path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>',
    modulos: '<rect x="3.5" y="3.5" width="7" height="17" rx="2"/><rect x="13.5" y="3.5" width="7" height="17" rx="2"/><path d="M5.5 6.5h3M15.5 6.5h3"/>',
    trilha: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M8 5h7.5a3.5 3.5 0 0 1 0 7h-7a3.5 3.5 0 0 0 0 7H16"/>',
    caderno: '<path d="M6 3.5h11.5a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6z"/><path d="M6 3.5v17M9.5 8h6M9.5 12h6"/>',
    mais: '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>',
    diario: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14 8l2 2"/>',
    recursos: '<path d="M4 7.5L12 4l8 3.5-8 3.5z"/><path d="M4 12l8 3.5 8-3.5M4 16.5L12 20l8-3.5"/>',
    comece: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    conta: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    sair: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
    ia: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>'
  };
  const icone = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
  const MARCA_SVG = '<img src="logo.png" alt="" width="30" height="30">';
  const marca = (href) => `<a class="marca" href="${href || '#/'}">${MARCA_SVG}<span>Linha de Produção</span></a>`;
  const avatar = (cls) => `<span class="avatar${cls ? ' ' + cls : ''}" aria-hidden="true">${esc(((aluno && aluno.nome) || 'A').trim().charAt(0).toUpperCase() || 'A')}</span>`;

  /* ================= Instalar no celular ================= */
  let pedidoInstalar = null;
  const instalado = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  const ehIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); pedidoInstalar = e; if (/^#\/(mais|conta)/.test(location.hash)) rerender(); });
  window.addEventListener('appinstalled', () => { pedidoInstalar = null; aviso('Pronto: o curso está na sua tela inicial.'); });
  function secaoInstalar() {
    if (instalado()) return '<section class="secao instalar"><h2>No seu celular</h2><p class="msg-ok">O curso já está instalado neste aparelho.</p></section>';
    let como;
    if (pedidoInstalar) como = '<div class="acoes"><button class="btn" type="button" data-acao="instalar">Instalar na tela inicial</button></div>';
    else if (ehIOS()) como = '<ol><li>No Safari, toque no botão Compartilhar (o quadrado com a seta para cima).</li><li>Escolha "Adicionar à Tela de Início".</li><li>Toque em "Adicionar".</li></ol>';
    else como = '<ol><li>No Chrome do celular, toque no menu de três pontos.</li><li>Escolha "Instalar app" ou "Adicionar à tela inicial".</li></ol>';
    return `<section class="secao instalar"><h2>Instalar no celular</h2><p>O curso vira um ícone na tela inicial e abre em tela cheia, como um app. O progresso continua o mesmo da sua conta.</p>${como}</section>`;
  }

  /* ================= Componentes ================= */
  const selo = (st, id) => `<span class="selo selo-${st}"${id ? ` id="${id}"` : ''}>${ROTULO_STATUS[st]}</span>`;
  const migalhas = (itens) => `<nav class="migalhas" aria-label="Você está em"><ol>${itens.map(([r, href]) => (href ? `<li><a href="${href}">${esc(r)}</a></li>` : `<li aria-current="page">${esc(r)}</li>`)).join('')}</ol></nav>`;
  function segsSimples(etapas) {
    return `<span class="segs" aria-hidden="true">${etapas.map((e) => `<span class="${e.status}"></span>`).join('')}</span>`;
  }
  function segsNav(mod, chaveAtual) {
    const et = etapasModulo(mod);
    const i = et.findIndex((e) => e.chave === chaveAtual);
    return `<nav aria-label="Etapas do módulo ${mod.n}"><ol class="segs segs-nav">${et.map((e) => `<li class="${e.status}${e.chave === chaveAtual ? ' atual' : ''}"><a href="${e.rota}" title="${esc(e.titulo)}"${e.chave === chaveAtual ? ' aria-current="step"' : ''}><span class="vh">${esc(e.titulo)} (${ROTULO_STATUS[e.status]})</span></a></li>`).join('')}</ol></nav>
      <p class="segs-legenda">Etapa ${i + 1} de ${et.length} do Módulo ${mod.n}: ${esc(mod.titulo)}</p>`;
  }
  function pagerModulo(mod, chaveAtual) {
    const et = etapasModulo(mod);
    const i = et.findIndex((e) => e.chave === chaveAtual);
    let ant = et[i - 1] ? { rota: et[i - 1].rota, rot: 'Anterior', t: et[i - 1].titulo } : { rota: `#/modulo/${mod.n}`, rot: 'Voltar', t: `Módulo ${mod.n}` };
    let prox = et[i + 1] ? { rota: et[i + 1].rota, rot: 'Próxima etapa', t: et[i + 1].titulo } : null;
    if (!prox) { const pm = modulo(mod.n + 1); prox = pm ? { rota: `#/modulo/${pm.n}`, rot: 'Próximo módulo', t: `${pm.n}. ${pm.titulo}` } : { rota: '#/trilha', rot: 'Depois', t: 'Trilha de 30 dias' }; }
    return `<nav class="pager" aria-label="Navegação entre etapas">
      <a href="${ant.rota}"><span>${ant.rot}</span><strong>${esc(ant.t)}</strong></a>
      <a class="prox" href="${prox.rota}"><span>${prox.rot}</span><strong>${esc(prox.t)}</strong></a></nav>`;
  }
  function reel(mod) {
    const p = progressoModulo(mod);
    return `<a class="reel${p.concluido ? ' feito' : ''}" href="#/modulo/${mod.n}" style="${corMod(mod)}">
      ${segsSimples(p.etapas)}
      <span class="reel-n" aria-hidden="true">${mod.n}</span>
      <span class="reel-t"><span class="vh">Módulo ${mod.n}: </span>${esc(mod.titulo)}</span>
      <span class="reel-s">${esc(mod.subtitulo)}</span>
      <span class="reel-p">${p.concluido ? 'Concluído' : `${p.feitas} de ${p.total} etapas`}</span>
    </a>`;
  }

  function esteira() {
    const itens = C.estacoes.map((st) => {
      const mod = modulo(st.modulo);
      const p = progressoModulo(mod);
      const est = p.concluido ? 'feito' : p.iniciado ? 'andamento' : 'pendente';
      return `<li class="estacao ${est}${st.humano ? ' humano' : ''}" style="${corMod(mod)}"><a href="#/modulo/${st.modulo}">
        <span class="estacao-n" aria-hidden="true">${st.n}</span>
        <span class="estacao-txt"><span class="estacao-nome"><span class="vh">Etapa ${st.n}: </span>${esc(st.nome)}</span>
        <span class="estacao-quem">${esc(st.quem)}, Módulo ${st.modulo}</span></span></a></li>`;
    }).join('');
    return `<div class="esteira-bloco"><ol class="esteira" aria-label="As seis etapas do fluxo do guia">${itens}</ol>
      <p class="esteira-legenda">A medição sugere as pautas da semana seguinte, e a linha recomeça. A etapa 4, com borda quadrada, é a única feita por você: a revisão, que nunca é pulada. Cada etapa ganha a cor do módulo quando ele é concluído.</p></div>`;
  }
  function checklistRevisao() {
    const r = C.recursos.checklist;
    const col = (cls, t, itens) => `<div class="rev rev-${cls}"><h4>${t}</h4><ul>${itens.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    return `<div class="revisao">${col('barrar', 'Barrar se', r.barrar)}${col('ajustar', 'Ajustar se', r.ajustar)}${col('aprovar', 'Aprovar se', r.aprovar)}</div>`;
  }
  function tabelaRotina() {
    return `<div class="tabela-rolavel"><table><thead><tr><th scope="col">Quando</th><th scope="col">O que acontece</th></tr></thead><tbody>${C.trilha.rotina.map((r) => `<tr><th scope="row">${esc(r.quando)}</th><td>${esc(r.oque)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function prepararHTML(html) {
    return html.replace(/<table>/g, '<div class="tabela-rolavel"><table>').replace(/<\/table>/g, '</table></div>')
      .replace('{{ESTEIRA}}', esteira()).replace('{{CHECKLIST}}', checklistRevisao()).replace('{{ROTINA}}', tabelaRotina());
  }
  /* Texto da IA: escapado, com parágrafos, listas e negrito simples. */
  function formatarIA(t) {
    const linhas = esc(t).split(/\r?\n/);
    let html = '', lista = false;
    linhas.forEach((l) => {
      const li = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (li) { if (!lista) { html += '<ul>'; lista = true; } html += `<li>${li[1]}</li>`; return; }
      if (lista) { html += '</ul>'; lista = false; }
      if (l.trim()) html += `<p>${l}</p>`;
    });
    if (lista) html += '</ul>';
    return html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^#+\s*/gm, '');
  }

  /* Blocos de prompt */
  function statusPrompt(ac) {
    const cad = aluno.caderno;
    const evol = (v) => cad.filter((e) => e.versao === v && (e.tipo === 'base' || e.tipo === 'modelo'));
    if (ac.tipo === 'evoluir') {
      const feitos = evol(ac.para);
      if (feitos.length) return `No seu Caderno: ${plural(feitos.length, 'prompt', 'prompts')} na ${ac.para}. <a href="#/caderno/${ac.para}">Abrir</a>`;
      if (!evol(ac.de).length) return `Primeiro, tenha um prompt ${ac.de} no Caderno.`;
      return `Pronto para criar a partir de ${plural(evol(ac.de).length, 'prompt', 'prompts')} na ${ac.de}.`;
    }
    if (ac.tipo === 'modelos') {
      const tem = C.modelos.filter((m) => cad.some((e) => e.nome === m.nome && e.versao === 'v3' && e.tipo === 'modelo')).length;
      if (tem) return `No seu Caderno: ${tem} de 4 modelos na v3. <a href="#/caderno/v3">Abrir</a>`;
      return cad.some((e) => e.versao === 'v3' && e.tipo === 'base') ? 'Pronto para criar a partir da sua v3.' : 'Primeiro, crie a v3 na Missão 3.1.';
    }
    if (ac.tipo === 'salvar') return cad.some((e) => e.nome === ac.nome) ? 'Já está no seu Caderno. <a href="#/caderno/outros">Abrir</a>' : '';
    return '';
  }
  function botaoAcao(ac, key) {
    if (ac.tipo === 'evoluir') return `<button class="btn btn-p btn-cor" type="button" data-acao="evoluir" data-de="${ac.de}" data-para="${ac.para}" data-bloco="${ac.bloco}">${esc(ac.rotulo)}</button>`;
    if (ac.tipo === 'salvar') return `<button class="btn btn-p" type="button" data-acao="salvar-prompt" data-alvo="pre-${key}" data-nome="${esc(ac.nome)}" data-categoria="${ac.categoria}">${esc(ac.rotulo)}</button>`;
    if (ac.tipo === 'modelos') return `<button class="btn btn-p btn-cor" type="button" data-acao="criar-modelos">${esc(ac.rotulo)}</button>`;
    return '';
  }
  function blocoPrompt(p, key, aberto) {
    const txt = p.bloco ? C.blocos[p.bloco] : p.texto;
    const st = p.acao ? statusPrompt(p.acao) : '';
    return `<div class="prompt">
      <div class="prompt-cab"><h3>${esc(p.titulo)}</h3>
        <div class="prompt-acoes"><button class="btn btn-sec btn-p" type="button" data-acao="copiar" data-alvo="pre-${key}">Copiar</button>${p.acao ? botaoAcao(p.acao, key) : ''}</div></div>
      <details${aberto ? ' open' : ''}><summary>Ver o texto</summary><pre id="pre-${key}">${esc(txt)}</pre></details>
      ${st ? `<p class="prompt-status">${st}</p>` : ''}
    </div>`;
  }

  /* ================= Telas de login ================= */
  function arteAuth() {
    return `<aside class="auth-arte">${marca('#/entrar')}
      <h2>Monte a sua linha de produção de conteúdo com IA</h2>
      <ul class="auth-reels" aria-hidden="true">${C.modulos.map((m) => `<li style="${corMod(m)}"><b>${m.n}</b><span>${esc(m.titulo)}</span></li>`).join('')}</ul>
      <p>Seis módulos em missões curtas: Grok, Prompt Cowboy, Claude e APIs juntos, do nicho ao relatório da semana, no Instagram, no TikTok e no YouTube Shorts.</p>
    </aside>`;
  }
  const campoSenha = (id, rotulo, auto) => `<label class="campo" for="${id}">${rotulo}</label>
    <div class="campo-senha"><input type="password" id="${id}" name="senha" autocomplete="${auto}" minlength="8" required>
    <button type="button" data-acao="ver-senha" data-alvo="${id}" aria-pressed="false">Mostrar</button></div>`;
  function telaAuth(conteudo) { return `<div class="auth">${arteAuth()}<main class="auth-form" id="conteudo" tabindex="-1">${conteudo}</main></div>`; }
  let msgAuth = null;
  const htmlMsgAuth = () => (msgAuth ? `<p class="${msgAuth.ok ? 'msg-ok' : 'msg-erro'}" role="alert">${esc(msgAuth.texto)}</p>` : '<p class="msg-erro" role="alert" hidden></p>');

  function vEntrar() {
    return { titulo: 'Entrar', auth: true, html: telaAuth(`
      <h1>Entrar</h1><p>Use o e-mail e a senha da sua conta. O seu progresso está nela.</p>
      <form data-form="entrar" novalidate>
        <label class="campo" for="e-email">E-mail</label><input type="email" id="e-email" name="email" autocomplete="email" required>
        ${campoSenha('e-senha', 'Senha', 'current-password')}
        ${htmlMsgAuth()}
        <button class="btn btn-largo" type="submit">Entrar</button>
      </form>
      <div class="auth-links"><a href="#/criar-conta">Criar conta</a><a href="#/recuperar">Esqueci a senha</a></div>`) };
  }
  function vCriarConta() {
    return { titulo: 'Criar conta', auth: true, html: telaAuth(`
      <h1>Criar conta</h1><p>Grátis. O seu progresso fica salvo e acompanha você no celular e no computador.</p>
      <form data-form="criar" novalidate>
        <label class="campo" for="c-nome">Como quer ser chamado</label><input type="text" id="c-nome" name="nome" autocomplete="given-name" maxlength="40" required>
        <label class="campo" for="c-email">E-mail</label><input type="email" id="c-email" name="email" autocomplete="email" required>
        ${campoSenha('c-senha', 'Senha (pelo menos 8 caracteres)', 'new-password')}
        ${htmlMsgAuth()}
        <button class="btn btn-largo" type="submit">Criar conta</button>
      </form>
      <div class="auth-links"><span>Já tem conta? <a href="#/entrar">Entrar</a></span></div>`) };
  }
  function vRecuperar() {
    return { titulo: 'Recuperar senha', auth: true, html: telaAuth(`
      <h1>Recuperar senha</h1><p>Enviamos um link para você criar uma senha nova.</p>
      <form data-form="recuperar" novalidate>
        <label class="campo" for="r-email">E-mail da conta</label><input type="email" id="r-email" name="email" autocomplete="email" required>
        ${htmlMsgAuth()}
        <button class="btn btn-largo" type="submit">Enviar link</button>
      </form>
      <div class="auth-links"><a href="#/entrar">Voltar para entrar</a></div>`) };
  }
  function vNovaSenha() {
    return { titulo: 'Nova senha', auth: true, html: telaAuth(`
      <h1>Nova senha</h1><p>Escolha a nova senha da conta ${esc(sessao && sessao.user.email)}.</p>
      <form data-form="nova-senha" novalidate>
        ${campoSenha('n-senha', 'Nova senha (pelo menos 8 caracteres)', 'new-password')}
        ${htmlMsgAuth()}
        <button class="btn btn-largo" type="submit">Salvar nova senha</button>
      </form>`) };
  }
  function vErroConfig() {
    return { titulo: 'Configuração', auth: true, html: `<main class="erro-config" id="conteudo" tabindex="-1">${marca('#/')}<h1>Ajuste o config.js</h1><p class="msg-erro">${esc(erroConfig)}</p><p>O passo a passo está no README.md do repositório.</p></main>` };
  }

  /* ================= Vistas do curso ================= */
  function vInicio() {
    const t = totais();
    const prox = proximaEtapa();
    const nota = [...aluno.diario].sort(ordemDiario).find((d) => d.proximo);
    const primeiroNome = (aluno.nome || '').split(' ')[0];
    let cont;
    if (!prox) {
      cont = `<section class="continuar" style="--m:#2FBF8A;--mt:#1A1530" aria-labelledby="ct"><p class="rotulo">Curso concluído</p><h2 id="ct">A sua linha está rodando</h2><p class="nota">Agora é a rotina semanal do guia: pesquisa no domingo, revisão na segunda, relatório no fim da semana.</p><a class="btn" href="#/trilha">Ver a rotina semanal</a></section>`;
    } else {
      const comecou = t.feitas > 0 || Object.keys(aluno.leitura).length > 0;
      cont = `<section class="continuar" style="${corMod(prox.mod)}" aria-labelledby="ct">
        ${segsSimples(progressoModulo(prox.mod).etapas)}
        <p class="rotulo">${comecou ? 'Continue de onde parou' : 'Comece por aqui'}, Módulo ${prox.mod.n}: ${esc(prox.mod.titulo)}</p>
        <h2 id="ct">${esc(prox.etapa.titulo)}</h2>
        ${nota ? `<p class="nota">Próximo passo que você anotou: ${esc(nota.proximo)}</p>` : `<p class="nota">${esc(prox.etapa.sub)}</p>`}
        <a class="btn" href="${prox.etapa.rota}">${comecou ? 'Continuar' : 'Começar'}</a>
      </section>`;
    }
    const etapas = C.trilha.etapas.map((e, i) => {
      const min = e.blocos.filter((b) => b.minimo);
      const feitos = min.filter(blocoFeito).length;
      return `<li><strong>${i + 1}. ${esc(e.nome)}</strong><span class="segs" aria-hidden="true">${min.map((b) => `<span class="${blocoFeito(b) ? 'feito' : ''}"></span>`).join('')}</span>
        <span>${aluno.trilha.marcos[e.id] ? 'Marco atingido' : `Dias ${e.dias[0]} a ${e.dias[1]}, ${feitos} de ${min.length}`}</span></li>`;
    }).join('');
    return { titulo: '', larga: true, html: `
      <header class="saudacao"><h1>Oi, ${esc(primeiroNome || 'aluno')}</h1><p>Você concluiu ${t.feitas} de ${t.total} missões.</p></header>
      ${cont}
      <div class="sec-cab"><h2>Módulos</h2><a href="#/comece">Como o curso funciona</a></div>
      <ul class="reels rolavel">${C.modulos.map((m) => `<li>${reel(m)}</li>`).join('')}</ul>
      <div class="sec-cab"><h2>Trilha de 30 dias</h2><a href="#/trilha">Abrir a trilha</a></div>
      <ol class="trilha-mini">${etapas}</ol>` };
  }
  function vModulos() {
    return { titulo: 'Módulos', larga: true, html: `<h1>Módulos</h1><p class="nota">Cada módulo tem leitura, acesso, missões e perguntas. A barrinha no topo de cada card mostra quantas etapas você já fez.</p>
      <ul class="reels">${C.modulos.map((m) => `<li>${reel(m)}</li>`).join('')}</ul>` };
  }
  function bandaModulo(mod, curta) {
    const p = progressoModulo(mod);
    return `<header class="banda" style="${corMod(mod)}">
      <span class="banda-n" aria-hidden="true">${mod.n}</span>
      <p class="rotulo">Módulo ${mod.n} de ${C.modulos.length}</p>
      <h1>${esc(mod.titulo)}</h1>
      <p>${esc(curta ? mod.subtitulo : mod.objetivo)}</p>
      ${curta ? '' : `<dl class="ficha"><div><dt>Tempo</dt><dd>${esc(mod.tempo)}</dd></div><div><dt>Prompt</dt><dd>${esc(mod.versao)}</dd></div><div><dt>Feito</dt><dd>${p.feitas} de ${p.total} etapas</dd></div></dl>`}
      ${segsSimples(p.etapas)}
    </header>`;
  }
  function vModulo(n) {
    const mod = modulo(n);
    if (!mod) return vNaoEncontrado();
    registrarUltimo(`#/modulo/${n}`, `Módulo ${n}: ${mod.titulo}`);
    const p = progressoModulo(mod);
    const prox = p.etapas.find((e) => e.status !== 'feito');
    const lista = p.etapas.map((e, i) => `<li class="${e.status}${prox && e.chave === prox.chave ? ' proxima' : ''}">
      <a class="etapa-link" href="${e.rota}"><span class="etapa-marca" aria-hidden="true">${e.status === 'feito' ? '&#10003;' : i + 1}</span>
      <span><span class="etapa-t">${esc(e.titulo)}</span><span class="etapa-s">${esc(e.sub)}</span></span>
      ${selo(e.status)}</a></li>`).join('');
    const pm = modulo(n + 1);
    return { titulo: `Módulo ${n}: ${mod.titulo}`, style: corMod(mod), html: `
      ${migalhas([['Início', '#/'], ['Módulos', '#/modulos'], [`Módulo ${n}`]])}
      ${bandaModulo(mod)}
      <div class="acoes empilha">${prox ? `<a class="btn" href="${prox.rota}">${p.iniciado ? 'Continuar' : 'Começar'}: ${esc(prox.titulo)}</a>` : (pm ? `<a class="btn" href="#/modulo/${pm.n}">Ir para o Módulo ${pm.n}</a>` : '<a class="btn" href="#/trilha">Ver a trilha</a>')}</div>
      <h2>Etapas</h2>
      <ol class="etapas">${lista}</ol>
      <div class="retomada-box"><p class="rotulo">Ponto de retomada</p><p>${esc(mod.retomada)}</p></div>` };
  }
  function vLeitura(n) {
    const mod = modulo(n);
    if (!mod) return vNaoEncontrado();
    registrarUltimo(`#/modulo/${n}/leitura`, `Leitura do Módulo ${n}: ${mod.titulo}`);
    const lida = !!aluno.leitura[n];
    return { titulo: `Leitura: ${mod.titulo}`, style: corMod(mod), html: `
      ${segsNav(mod, 'leitura')}
      ${bandaModulo(mod, true)}
      <article class="prosa">${prepararHTML(mod.leitura)}</article>
      <div class="concluir${lida ? ' feito' : ''}">${lida
        ? `<span class="carimbo">Lida em ${dataBR(aluno.leitura[n])}</span><a class="btn" href="#/modulo/${n}/acesso">Ir para o Acesso</a>`
        : `<button class="btn" type="button" data-acao="ler" data-mod="${n}">Marcar como lida e continuar</button><p>Depois vem o Acesso: o que criar antes das missões.</p>`}</div>
      ${pagerModulo(mod, 'leitura')}` };
  }
  function vAcesso(n) {
    const mod = modulo(n);
    if (!mod) return vNaoEncontrado();
    registrarUltimo(`#/modulo/${n}/acesso`, `Acesso do Módulo ${n}: ${mod.titulo}`);
    const f = aluno.acesso[n] || {};
    const itens = mod.acesso.itens.map((it) => {
      const iid = `ac-${n}-${it.id}`;
      return `<li><input type="checkbox" id="${iid}" data-bind="acesso" data-mod="${n}" data-item="${it.id}"${f[it.id] ? ' checked' : ''}><label for="${iid}">${it.texto}</label></li>`;
    }).join('');
    const nota = mod.acesso.lacuna ? `<p class="lacuna"><span class="selo selo-lacuna">Lacuna do guia</span> ${esc(mod.acesso.nota)}</p>` : `<p class="nota">${esc(mod.acesso.nota)}</p>`;
    const st = statusAcesso(mod);
    const primeira = mod.missoes[0];
    return { titulo: `Acesso: ${mod.titulo}`, style: corMod(mod), html: `
      ${segsNav(mod, 'acesso')}
      <h1>Acesso antes das missões</h1>
      <p class="objetivo">Marque o que já está pronto. Os itens opcionais não contam para concluir esta etapa.</p>
      <div class="painel"><ul class="checks">${itens}</ul></div>
      ${nota}
      <div class="concluir${st === 'feito' ? ' feito' : ''}">${st === 'feito' ? '<span class="carimbo">Tudo pronto</span>' : ''}<a class="btn" href="#/missao/${primeira.id}">Ir para a Missão ${primeira.id}</a></div>
      ${pagerModulo(mod, 'acesso')}` };
  }

  function hash(s) { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; } return x; }
  function ordemOpcoes(q) {
    const ordem = q.opcoes.map((_, i) => i).filter((i) => i !== q.correta);
    ordem.splice(hash('lp' + q.id) % q.opcoes.length, 0, q.correta);
    return ordem;
  }
  function vPerguntas(n, query) {
    const mod = modulo(n);
    if (!mod) return vNaoEncontrado();
    registrarUltimo(`#/modulo/${n}/perguntas`, `Perguntas do Módulo ${n}: ${mod.titulo}`);
    const r = aluno.quiz[n] || {};
    const qs = mod.perguntas;
    const pq = progressoQuiz(mod);
    let i;
    const qp = query.get('q');
    if (qp === 'fim') i = -1;
    else if (qp !== null && /^\d+$/.test(qp) && Number(qp) < qs.length) i = Number(qp);
    else { i = qs.findIndex((q) => !(r[q.id] && r[q.id].certa)); }
    const pontos = `<ol class="q-pontos" aria-label="Perguntas">${qs.map((q, k) => {
      const rr = r[q.id];
      const cls = rr && typeof rr.escolha === 'number' ? (rr.certa ? 'certa' : 'errada') : '';
      return `<li><a class="${cls}${k === i ? ' atual' : ''}" href="#/modulo/${n}/perguntas?q=${k}"${k === i ? ' aria-current="step"' : ''}>${k + 1}<span class="vh">${cls === 'certa' ? ', certa' : cls === 'errada' ? ', errada' : ''}</span></a></li>`;
    }).join('')}</ol>`;
    let corpo;
    if (i === -1) {
      const pm = modulo(n + 1);
      corpo = `<p class="placar-grande">${pq.certas} de ${pq.total}</p><p>certas${pq.respondidas ? `, ${pq.primeira} na primeira tentativa` : ''}.</p>
        ${pq.certas < pq.total ? `<p>Faltam ${pq.total - pq.certas}. Toque no número da pergunta para responder.</p>` : `<p>${esc(mod.retomada)}</p>`}
        <div class="acoes empilha">${pq.certas === pq.total ? (pm ? `<a class="btn" href="#/modulo/${pm.n}">Ir para o Módulo ${pm.n}</a>` : '<a class="btn" href="#/trilha">Ver a trilha</a>') : ''}
        <button class="btn btn-sec" type="button" data-acao="refazer-quiz" data-mod="${n}">Refazer as perguntas</button></div>`;
    } else {
      const q = qs[i];
      const resp = r[q.id];
      const nome = 'q-' + idDom(q.id);
      const ops = ordemOpcoes(q).map((k) => {
        const marcada = !!resp && resp.escolha === k;
        const cls = marcada ? (k === q.correta ? ' certa' : ' errada') : '';
        return `<label class="opcao${cls}" for="${nome}-${k}"><input type="radio" id="${nome}-${k}" name="${nome}" value="${k}" data-bind="quiz" data-mod="${n}" data-q="${esc(q.id)}"${marcada ? ' checked' : ''}><span>${esc(q.opcoes[k])}</span></label>`;
      }).join('');
      let fb = '';
      if (resp && typeof resp.escolha === 'number') {
        fb = resp.certa ? `<div class="feedback ok"><strong>Isso.</strong> ${esc(q.explicacao)}</div>` : '<div class="feedback nao"><strong>Ainda não.</strong> Releia a situação e escolha outra opção.</div>';
      }
      const proxQ = i + 1 < qs.length ? `#/modulo/${n}/perguntas?q=${i + 1}` : `#/modulo/${n}/perguntas?q=fim`;
      corpo = `<fieldset class="pergunta" id="${nome}"><legend>${esc(q.enunciado)}</legend>${ops}<div aria-live="polite">${fb}</div></fieldset>
        <div class="acoes">${resp && resp.certa ? `<a class="btn" href="${proxQ}">${i + 1 < qs.length ? 'Próxima pergunta' : 'Ver resultado'}</a>` : `<a class="link-btn" href="${proxQ}">Pular</a>`}</div>`;
    }
    return { titulo: `Perguntas: ${mod.titulo}`, style: corMod(mod), html: `
      ${segsNav(mod, 'perguntas')}
      <h1>Perguntas de verificação</h1>
      <p class="nota">Situações práticas do Módulo ${n}. Escolha uma opção e veja a explicação.</p>
      ${pontos}${corpo}
      ${pagerModulo(mod, 'perguntas')}` };
  }

  function widgetV0() {
    if (aluno.caderno.some((e) => e.versao === 'v0' && e.tipo === 'base')) return '<div class="painel"><h3>Registrar o v0</h3><p>O seu v0 já está no Caderno. <a href="#/caderno/v0">Ver o v0</a></p></div>';
    return `<div class="painel"><h3>Registrar o v0</h3>
      <form data-form="v0">
        <label class="campo" for="v0-texto">Cole aqui o seu primeiro prompt, sem editar</label>
        <textarea class="mono" id="v0-texto" name="texto" rows="6" required></textarea>
        <p class="aviso-chave" role="alert" hidden></p>
        <div class="acoes"><button class="btn" type="submit">Salvar como v0</button><button class="link-btn" type="button" data-acao="v0-minimo">Usar o v0 mínimo</button></div>
        <p class="dica">Perdeu o seu primeiro prompt? "Usar o v0 mínimo" preenche com: ${esc(C.promptBase.v0Minimo)}</p>
      </form></div>`;
  }
  function widgetComparar() {
    return `<div class="painel"><h3>Comparar saídas</h3>
      <p>Cole a resposta do v0 e a da v4 para a mesma pauta. As duas vão para o Caderno, com a comparação linha a linha.</p>
      <form data-form="saidas">
        <label class="campo" for="s-v0">Resposta do v0</label><textarea id="s-v0" name="a" rows="5" required></textarea>
        <label class="campo" for="s-v4">Resposta da v4</label><textarea id="s-v4" name="b" rows="5" required></textarea>
        <p class="aviso-chave" role="alert" hidden></p>
        <div class="acoes"><button class="btn" type="submit">Salvar e comparar</button></div>
      </form></div>`;
  }
  const iaEstado = {};
  function painelRevisaoIA(id) {
    if (!iaAtiva) return '';
    const m = lerMissao(id);
    const st = iaEstado['rev-' + id];
    let corpo = '';
    if (st && st.carregando) corpo = `<p class="ia-espera" role="status">${st.lento ? 'Acordando o servidor. Na primeira vez do dia pode levar até um minuto.' : 'A IA está lendo o seu entregável.'}</p>`;
    else if (st && st.erro) corpo = `<p class="msg-erro" role="alert">${esc(st.erro)}</p>`;
    else if (m.revisaoIA) corpo = `<div class="ia-texto">${formatarIA(m.revisaoIA.texto)}</div><p class="dica">Revisão de ${dataBR(m.revisaoIA.em)}. A IA sugere; quem marca os critérios é você.</p>`;
    return `<div class="painel painel-ia" id="ia-rev-${idDom(id)}">
      <h3 class="ia-cab">${icone('ia')} Revisão da IA</h3>
      <p class="dica">Compara o seu entregável com os critérios abaixo e sugere melhorias. Ela não abre links nem verifica fatos na internet.</p>
      <div class="acoes"><button class="btn btn-p" type="button" data-acao="revisar-ia" data-missao="${id}"${st && st.carregando ? ' disabled' : ''}>${m.revisaoIA ? 'Pedir nova revisão' : 'Pedir revisão da IA'}</button></div>
      <div aria-live="polite">${corpo}</div></div>`;
  }

  let animarCarimbo = null;
  function vMissao(id) {
    const ref = MAPA[id];
    if (!ref) return vNaoEncontrado();
    const { mod, mi, idx } = ref;
    registrarUltimo(`#/missao/${id}`, `Missão ${id}: ${mi.titulo}`);
    const m = lerMissao(id);
    const st = statusMissao(id);
    const did = idDom(id);
    const passos = mi.passos.map((p, i) => {
      const pid = `p-${did}-${i}`;
      return `<li><input type="checkbox" id="${pid}" data-bind="passo" data-missao="${id}" data-i="${i}"${m.passos[i] ? ' checked' : ''}><label for="${pid}"><span class="passo-n">${i + 1}</span><span>${p}</span></label></li>`;
    }).join('');
    const criterios = mi.criterios.map((c, i) => {
      const cid = `c-${did}-${i}`;
      return `<li><input type="checkbox" id="${cid}" data-bind="criterio" data-missao="${id}" data-i="${i}"${m.criterios[i] ? ' checked' : ''}><label for="${cid}">${esc(c)}</label></li>`;
    }).join('');
    const linhas = mi.linhas ? `<div class="linhas"><div class="linha"><h3>Na linha própria</h3><p>${mi.linhas.propria}</p></div><div class="linha"><h3>Na linha de afiliados</h3><p>${mi.linhas.afiliado}</p></div></div>` : '';
    const tabela = mi.tabela === 'modelos' ? `<div class="tabela-rolavel"><table><thead><tr><th scope="col">Modelo</th><th scope="col">Tarefa</th><th scope="col">Saída</th></tr></thead><tbody>${C.modelos.map((x) => `<tr><th scope="row">${esc(x.nome)}</th><td>${esc(x.resumo)}</td><td>${esc(x.formato)}</td></tr>`).join('')}</tbody></table></div>` : '';
    let widget = '';
    if (mi.widget === 'registrar-v0') widget = widgetV0();
    if (mi.widget === 'comparar-saidas') widget = widgetComparar();
    if (mi.widget === 'checklist-revisao') widget = `<div class="painel"><h3>Checklist de revisão</h3>${checklistRevisao()}</div>`;
    const prompts = (mi.prompts || []).map((p, i) => blocoPrompt(p, `${did}-${i}`, !!p.bloco)).join('');
    const prox = MISSOES[idx + 1];
    const faltas = faltasMissao(id);
    let nBloco = 0;
    const cab = (t) => `<div class="bloco-cab"><span class="bloco-n" aria-hidden="true">${++nBloco}</span><h2>${t}</h2></div>`;
    const concluir = st === 'feito'
      ? `<div class="concluir feito"><span class="carimbo${animarCarimbo === id ? ' animar' : ''}">Concluída em ${dataBR(m.concluidaEm)}</span>
          <div class="acoes">${prox ? `<a class="btn" href="#/missao/${prox}">Próxima: Missão ${prox}</a>` : '<a class="btn" href="#/trilha">Ver a trilha</a>'}
          <button class="link-btn" type="button" data-acao="reabrir" data-missao="${id}">Reabrir</button></div></div>`
      : `<div class="concluir"><button class="btn" type="button" data-acao="concluir" data-missao="${id}"${faltas.length ? ' aria-disabled="true"' : ''} aria-describedby="faltam-${did}">Concluir missão</button>
          <p id="faltam-${did}">${faltas.length ? 'Falta: ' + faltas.join(' e ') + '.' : 'Tudo pronto para concluir.'}</p></div>`;
    return { titulo: `Missão ${id}: ${mi.titulo}`, style: corMod(mod), html: `
      ${segsNav(mod, 'missao-' + id)}
      <header class="cab-missao">
        <p class="rotulo"><i aria-hidden="true"></i><a href="#/modulo/${mod.n}">Módulo ${mod.n}: ${esc(mod.titulo)}</a></p>
        <h1>Missão ${id}: ${esc(mi.titulo)}</h1>
        <ul class="meta"><li>Cerca de ${mi.minutos} minutos</li><li>${selo(st, 'selo-' + did)}</li></ul>
        <p class="objetivo">${esc(mi.objetivo)}</p>
      </header>
      ${linhas}
      <section class="bloco">${cab('Faça')}<ol class="passos">${passos}</ol>${tabela}${widget}</section>
      ${prompts ? `<section class="bloco">${cab('Prompts e blocos')}${prompts}</section>` : ''}
      <section class="bloco">${cab('Entregue')}
        <p>${esc(mi.entregavel)}</p>
        <label class="campo" for="ent-${did}">O seu entregável (texto ou link)</label>
        <textarea id="ent-${did}" rows="5" data-bind="entregavel" data-missao="${id}" placeholder="Cole aqui o texto ou o link">${esc(m.entregavel)}</textarea>
        <p class="dica">Salva sozinho. Nunca cole chaves de API ou senhas.</p>
        <p class="aviso-chave" id="ak-${did}" role="alert" hidden></p>
        <p class="salvo" id="sv-${did}" aria-live="polite"></p>
        ${painelRevisaoIA(id)}
      </section>
      <section class="bloco">${cab('Confira')}<div class="painel"><ul class="checks">${criterios}</ul></div>${concluir}</section>
      <details class="parar"><summary>Vai parar agora? Anote o próximo passo</summary>
        <form data-form="diario-rapido" data-missao="${id}">
          <label class="campo" for="prox-${did}">Próximo passo</label>
          <textarea id="prox-${did}" name="proximo" rows="2" required></textarea>
          <p class="aviso-chave" role="alert" hidden></p>
          <div class="acoes"><button class="btn btn-sec" type="submit">Anotar no Diário</button></div>
          <p class="dica">Ele aparece na página inicial quando você voltar.</p>
        </form></details>
      ${pagerModulo(mod, 'missao-' + id)}` };
  }

  function vComece() {
    const pb = C.promptBase;
    const tabela = `<div class="tabela-rolavel"><table><thead><tr><th scope="col">Versão</th><th scope="col">Módulo</th><th scope="col">O que você acrescenta</th></tr></thead><tbody>${pb.versoes.map((v) => `<tr><th scope="row">${v.v}</th><td>${v.modulo || 'Antes'}</td><td>${esc(v.acrescenta)}</td></tr>`).join('')}</tbody></table></div>`;
    return { titulo: 'Comece aqui', html: `
      ${migalhas([['Início', '#/'], ['Comece aqui']])}
      <h1>Comece aqui</h1>
      <p class="objetivo">${esc(C.comece.lead)}</p>
      <h2>As seis etapas do fluxo</h2>${esteira()}
      <div class="prosa">${prepararHTML(C.comece.html)}
        <h2>Seu prompt-base: do v0 ao v6</h2>
        <p>Todas as missões partem do primeiro prompt que você já escreveu, o v0, e o evoluem até a v6, a versão que o script do Módulo 6 usa. Os botões "Criar vX" das missões copiam a versão anterior para o Caderno e acrescentam o bloco novo.</p>
        ${tabela}
        <h3>Variáveis e as duas linhas</h3>
        <p>Variáveis são os espaços entre chaves, como {PAUTA} ou {REDE}. Use sempre os mesmos nomes: no Módulo 6, o script preenche cada uma pelo nome. A linha própria e a de afiliados usam o mesmo prompt; a variável {LINHA} liga as regras extras de afiliados.</p>
      </div>
      ${blocoPrompt({ titulo: 'v0 mínimo (se o seu primeiro prompt se perdeu)', texto: pb.v0Minimo }, 'v0min', true)}
      ${blocoPrompt({ titulo: 'Onde você vai chegar: o esqueleto da v6', texto: pb.esqueleto }, 'esqueleto', false)}
      <div class="acoes"><a class="btn" href="#/modulo/1">Começar o Módulo 1</a></div>` };
  }

  function vTrilha() {
    const t = C.trilha;
    const inicio = aluno.trilha.inicio;
    const etapas = t.etapas.map((e, idx) => {
      const min = e.blocos.filter((b) => b.minimo);
      const feitosMin = min.filter(blocoFeito).length;
      const marco = aluno.trilha.marcos[e.id];
      const datas = inicio ? `, de ${dataBR(somarDias(inicio, e.dias[0] - 1))} a ${dataBR(somarDias(inicio, e.dias[1] - 1))}` : '';
      const blocos = e.blocos.map((b) => {
        const minimo = b.minimo ? ' <span class="selo selo-minimo">mínimo</span>' : '';
        if (b.missao) {
          const st = statusMissao(b.missao);
          return `<li class="bloco-t"><span class="ponto ${st}" aria-hidden="true"></span><span><span class="bloco-t-dia">${esc(b.dia)}</span><a href="#/missao/${b.missao}">Missão ${b.missao}: ${esc(b.texto)}</a>${minimo}<span class="vh"> (${ROTULO_STATUS[st]})</span></span></li>`;
        }
        const bid = `tb-${b.id}`;
        return `<li class="bloco-t"><input type="checkbox" id="${bid}" data-bind="trilha" data-t="${b.id}"${aluno.trilha.feitos[b.id] ? ' checked' : ''}><label for="${bid}"><span class="bloco-t-dia">${esc(b.dia)}</span>${esc(b.texto)}${minimo}</label></li>`;
      }).join('');
      return `<section class="etapa-trilha${marco ? ' feita' : ''}" id="${e.id}" aria-labelledby="${e.id}-t">
        <h2 id="${e.id}-t">${idx + 1}. ${esc(e.nome)}</h2>
        <p class="etapa-dias">Dias ${e.dias[0]} a ${e.dias[1]}${datas}</p>
        <span class="segs" aria-hidden="true">${min.map((b) => `<span class="${blocoFeito(b) ? 'feito' : ''}"></span>`).join('')}</span>
        <p class="do-guia"><strong>Do guia:</strong> ${esc(e.doGuia)}</p>
        <ul class="blocos-t">${blocos}</ul>
        <p class="marco"><strong>Marco:</strong> ${esc(e.marco)} ${marco ? `<span class="selo selo-feito">Atingido em ${dataBR(marco)}</span>` : `<span class="nota">(${feitosMin} de ${min.length} blocos mínimos)</span>`}</p>
        <p class="curta"><strong>Semana curta:</strong> ${esc(e.semanaCurta)}</p>
      </section>`;
    }).join('');
    return { titulo: 'Trilha de 30 dias', html: `
      <h1>Trilha de 30 dias</h1>
      <p class="objetivo">${esc(t.intro)}</p>
      <div class="painel"><label class="campo" for="inicio">Quando você começou (opcional)</label>
        <input type="date" id="inicio" data-bind="inicio" value="${esc(inicio)}">
        <p class="dica">Com a data, cada etapa mostra as datas sugeridas. Os blocos de missão se marcam sozinhos.</p></div>
      <div style="margin-top:18px">${etapas}</div>
      <section class="secao prosa" id="rotina"><h2>Depois do dia 30: a rotina semanal</h2>${tabelaRotina()}
        <p>No fim de cada semana, o relatório diz o que repetir. As pautas sugeridas entram como "ideia" e passam pela checagem do Módulo 2.</p></section>` };
  }

  /* ----- Caderno ----- */
  const cadernoUI = { editando: null, comparar: { a: '', b: '' }, testando: null, teste: {} };
  const rotuloEntrada = (e) => `${e.nome || 'Sem nome'}${e.versao ? ' (' + e.versao + ')' : ''}`;
  const variaveisDe = (t) => [...new Set((String(t).match(/\{([A-Z][A-Z0-9_]*)\}/g) || []).map((v) => v.slice(1, -1)))];

  function formEntrada(e) {
    const novo = !e;
    const d = e || { nome: '', versao: '', tipo: 'base', texto: '', nota: '' };
    const fid = novo ? 'novo' : e.id;
    const optV = ['<option value="">Sem versão</option>'].concat(VERSOES.map((v) => `<option value="${v}"${d.versao === v ? ' selected' : ''}>${v}</option>`)).join('');
    const optT = Object.keys(TIPOS).map((k) => `<option value="${k}"${d.tipo === k ? ' selected' : ''}>${TIPOS[k]}</option>`).join('');
    return `<form class="form-entrada" data-form="entrada" data-id="${novo ? '' : esc(e.id)}">
      <h3>${novo ? 'Novo prompt' : 'Editar prompt'}</h3>
      <div class="form-grade">
        <div><label class="campo" for="f-nome-${fid}">Nome</label><input type="text" id="f-nome-${fid}" name="nome" maxlength="120" required value="${esc(d.nome)}"></div>
        <div><label class="campo" for="f-versao-${fid}">Versão</label><select id="f-versao-${fid}" name="versao">${optV}</select></div>
        <div><label class="campo" for="f-tipo-${fid}">Tipo</label><select id="f-tipo-${fid}" name="tipo">${optT}</select></div>
      </div>
      <label class="campo" for="f-texto-${fid}">Texto</label><textarea class="mono" id="f-texto-${fid}" name="texto" rows="12" required>${esc(d.texto)}</textarea>
      <label class="campo" for="f-nota-${fid}">O que mudou e por quê</label><textarea id="f-nota-${fid}" name="nota" rows="2">${esc(d.nota)}</textarea>
      <p class="aviso-chave" role="alert" hidden></p>
      <div class="acoes"><button class="btn" type="submit">Salvar</button><button class="btn btn-sec" type="button" data-acao="cancelar-edicao">Cancelar</button></div>
    </form>`;
  }
  function painelTeste(e) {
    const st = cadernoUI.teste;
    const vars = variaveisDe(e.texto);
    const campos = vars.map((v) => `<div><label class="campo" for="tv-${v}">{${v}}</label><input type="text" id="tv-${v}" name="var-${v}" value="${esc((st.valores || {})[v] || '')}" placeholder="Deixe vazio para manter {${v}}"></div>`).join('');
    let res = '';
    if (st.carregando) res = `<p class="ia-espera" role="status">${st.lento ? 'Acordando o servidor. Na primeira vez do dia pode levar até um minuto.' : 'Gerando a resposta.'}</p>`;
    else if (st.erro) res = `<p class="msg-erro" role="alert">${esc(st.erro)}</p>`;
    else if (st.resposta) res = `<div class="ia-texto">${formatarIA(st.resposta)}</div>
      <div class="acoes"><button class="btn btn-p btn-sec" type="button" data-acao="copiar-teste">Copiar resposta</button><button class="btn btn-p" type="button" data-acao="salvar-teste" data-id="${esc(e.id)}">Salvar como saída de teste</button></div>
      <p class="dica">Fatos, números e tendências na resposta precisam de verificação: a IA não acessa a internet.</p>`;
    return `<div class="painel painel-ia">
      <h3 class="ia-cab">${icone('ia')} Testar com IA</h3>
      <form data-form="testar" data-id="${esc(e.id)}">
        ${vars.length ? `<p class="dica">Preencha as variáveis para este teste.</p><div class="vars">${campos}</div>` : '<p class="dica">Este prompt não tem variáveis entre chaves.</p>'}
        <p class="aviso-chave" role="alert" hidden></p>
        <div class="acoes"><button class="btn btn-p" type="submit"${st.carregando ? ' disabled' : ''}>Gerar resposta</button><button class="link-btn" type="button" data-acao="fechar-teste">Fechar</button></div>
      </form>
      <div aria-live="polite">${res}</div></div>`;
  }
  function entradaHTML(e) {
    if (cadernoUI.editando === e.id) return `<article class="entrada" id="e-${esc(e.id)}">${formEntrada(e)}</article>`;
    const chips = (e.versao ? `<span class="chip">${e.versao}</span>` : '') + `<span class="chip">${esc(TIPOS[e.tipo] || e.tipo)}</span>` + (e.bom ? '<span class="chip bom">Prompt bom</span>' : '') + `<span class="chip">${dataBR(e.atualizadoEm)}</span>`;
    const eid = esc(e.id);
    return `<article class="entrada" id="e-${eid}" aria-labelledby="t-${eid}">
      <div class="entrada-cab"><h3 id="t-${eid}">${esc(e.nome || 'Sem nome')}</h3><div class="chips">${chips}</div></div>
      <div class="entrada-acoes">
        ${iaAtiva && e.tipo !== 'saida' ? `<button class="link-btn" type="button" data-acao="testar" data-id="${eid}">Testar com IA</button>` : ''}
        <button class="link-btn" type="button" data-acao="copiar-entrada" data-id="${eid}">Copiar</button>
        <button class="link-btn" type="button" data-acao="estrela" data-id="${eid}" aria-pressed="${e.bom ? 'true' : 'false'}">${e.bom ? 'Tirar estrela' : 'Prompt bom'}</button>
        <button class="link-btn" type="button" data-acao="editar" data-id="${eid}">Editar</button>
        <button class="link-btn" type="button" data-acao="duplicar" data-id="${eid}">Duplicar</button>
        <button class="link-btn perigo" type="button" data-acao="excluir" data-id="${eid}">Excluir</button>
      </div>
      <pre>${esc(e.texto)}</pre>
      ${e.nota ? `<p class="entrada-nota"><strong>O que mudou:</strong> ${esc(e.nota)}</p>` : ''}
      ${cadernoUI.testando === e.id ? painelTeste(e) : ''}
    </article>`;
  }
  function diffLinhas(x, y) {
    const a = String(x).split('\n'), b = String(y).split('\n');
    const n = a.length, m = b.length;
    if (n * m > 600000) return null;
    const dp = [];
    for (let i = 0; i <= n; i++) dp.push(new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out = [];
    let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push(['=', a[i]]); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(['-', a[i]]); i++; } else { out.push(['+', b[j]]); j++; }
    }
    while (i < n) out.push(['-', a[i++]]);
    while (j < m) out.push(['+', b[j++]]);
    return out;
  }
  function secaoComparar() {
    if (aluno.caderno.length < 2) return '<section class="secao" id="comparar"><h2>Comparar duas versões</h2><p class="nota">Com duas entradas no Caderno, você compara linha a linha o que mudou.</p></section>';
    const { a: ia, b: ib } = cadernoUI.comparar;
    const sel = (nome, atual) => `<select id="cmp-${nome}" name="${nome}" required><option value="">Escolha</option>${aluno.caderno.map((e) => `<option value="${esc(e.id)}"${atual === e.id ? ' selected' : ''}>${esc(rotuloEntrada(e))}</option>`).join('')}</select>`;
    const ea = aluno.caderno.find((e) => e.id === ia), eb = aluno.caderno.find((e) => e.id === ib);
    let res = '';
    if (ea && eb) {
      const d = diffLinhas(ea.texto, eb.texto);
      if (!d) res = '<p class="nota">Os textos são grandes demais para comparar aqui.</p>';
      else {
        const add = d.filter((l) => l[0] === '+').length, rem = d.filter((l) => l[0] === '-').length;
        res = `<p class="diff-resumo">${plural(add, 'linha acrescentada', 'linhas acrescentadas')} e ${plural(rem, 'linha removida', 'linhas removidas')}.</p>
          <div class="diff">${d.map(([op, l]) => (op === '+' ? `<div class="d-add"><span class="vh">Acrescentada: </span>${esc(l)}</div>` : op === '-' ? `<div class="d-rem"><span class="vh">Removida: </span>${esc(l)}</div>` : `<div>${esc(l)}</div>`)).join('')}</div>`;
      }
    }
    return `<section class="secao" id="comparar"><h2>Comparar duas versões</h2>
      <form class="comparar-form" data-form="comparar"><div><label class="campo" for="cmp-a">Antes</label>${sel('a', ia)}</div><div><label class="campo" for="cmp-b">Depois</label>${sel('b', ib)}</div><button class="btn" type="submit">Comparar</button></form>${res}</section>`;
  }
  function vCaderno(filtro, query) {
    if (query.get('a') || query.get('b')) cadernoUI.comparar = { a: query.get('a') || '', b: query.get('b') || '' };
    const f = ['todos', 'outros'].concat(VERSOES).includes(filtro) ? filtro : 'todos';
    const visiveis = f === 'todos' ? VERSOES.concat(['']) : f === 'outros' ? [''] : [f];
    const filtros = [['todos', 'Todos']].concat(VERSOES.map((v) => [v, v]), [['outros', 'Outros']]).map(([k, r]) => `<a class="filtro" href="#/caderno/${k}"${f === k ? ' aria-current="true"' : ''}>${r}</a>`).join('');
    const corpo = visiveis.map((g) => {
      const itens = aluno.caderno.filter((e) => (e.versao || '') === g);
      if (!itens.length) return '';
      return `<section class="grupo-versao"><h2>${g ? 'Versão ' + g : 'Outros prompts e saídas'}</h2>${itens.map(entradaHTML).join('')}</section>`;
    }).join('');
    let vazio = '';
    if (!aluno.caderno.length) vazio = '<div class="vazio"><p>O seu Caderno ainda está vazio. Ele começa na <a href="#/missao/1.2">Missão 1.2</a>, quando você registra o seu primeiro prompt como v0.</p></div>';
    else if (!corpo) vazio = '<div class="vazio"><p>Nada nesta versão ainda. <a href="#/caderno/todos">Ver tudo</a></p></div>';
    return { titulo: 'Caderno de prompts', html: `
      <h1>Caderno de prompts</h1>
      <p class="objetivo">Todas as versões do seu prompt, do v0 ao v6, com a nota do que mudou.${iaAtiva ? ' Use "Testar com IA" para rodar um prompt na hora.' : ''}</p>
      <div class="acoes"><button class="btn" type="button" data-acao="novo-prompt">Novo prompt</button><button class="btn btn-sec" type="button" data-acao="ir-comparar">Comparar versões</button><button class="btn btn-sec" type="button" data-acao="baixar-caderno"${aluno.caderno.length ? '' : ' aria-disabled="true"'}>Baixar (.txt)</button></div>
      ${cadernoUI.editando === 'novo' ? `<div class="entrada">${formEntrada(null)}</div>` : ''}
      <nav class="filtros" aria-label="Filtrar por versão">${filtros}</nav>
      ${vazio}${corpo}${secaoComparar()}` };
  }

  function vDiario() {
    const lista = [...aluno.diario].sort(ordemDiario);
    const opts = ['<option value="">Nenhuma</option>'].concat(MISSOES.map((id) => `<option value="${id}">Missão ${id}: ${esc(MAPA[id].mi.titulo)}</option>`)).join('');
    const itens = lista.map((d) => `<li><article>
        <h3>${dataBR(d.data)}${d.missao && MAPA[d.missao] ? ` <a class="chip" href="#/missao/${d.missao}">Missão ${d.missao}</a>` : ''}</h3>
        ${d.fiz ? `<p><span class="rotulo">O que eu fiz:</span> ${esc(d.fiz)}</p>` : ''}
        ${d.proximo ? `<p><span class="rotulo">Próximo passo:</span> ${esc(d.proximo)}</p>` : ''}
        <button class="link-btn perigo" type="button" data-acao="excluir-diario" data-id="${esc(d.id)}">Excluir</button></article></li>`).join('');
    return { titulo: 'Diário de bordo', html: `
      <h1>Diário de bordo</h1>
      <p class="objetivo">Uma anotação por sessão: o que você fez e qual é o próximo passo. O último próximo passo aparece na página inicial.</p>
      <form class="painel" data-form="diario"><h3>Nova anotação</h3>
        <label class="campo" for="d-data">Data</label><input type="date" id="d-data" name="data" value="${hojeISO()}">
        <label class="campo" for="d-fiz">O que eu fiz</label><textarea id="d-fiz" name="fiz" rows="3"></textarea>
        <label class="campo" for="d-prox">Próximo passo</label><textarea id="d-prox" name="proximo" rows="2"></textarea>
        <label class="campo" for="d-missao">Missão relacionada</label><select id="d-missao" name="missao">${opts}</select>
        <p class="aviso-chave" role="alert" hidden></p>
        <div class="acoes"><button class="btn" type="submit">Anotar</button></div></form>
      ${lista.length ? `<h2>Anotações</h2><ol class="diario-lista">${itens}</ol>` : '<div class="vazio"><p>Nenhuma anotação ainda.</p></div>'}` };
  }

  function vRecursos(secao) {
    const r = C.recursos, pl = C.planilha;
    const ind = [['checklist', 'Checklist de revisão'], ['planilha', 'Planilha'], ['glossario', 'Glossário'], ['lacunas', 'Lacunas do guia'], ['fontes', 'Fontes']].map(([k, t]) => `<a class="filtro" href="#/recursos/${k}">${t}</a>`).join('');
    const colunas = `<div class="tabela-rolavel"><table><thead><tr><th scope="col">Coluna</th><th scope="col">Para que serve</th></tr></thead><tbody>${pl.colunas.map((c) => `<tr><th scope="row">${esc(c.nome)}</th><td>${esc(c.uso)}</td></tr>`).join('')}</tbody></table></div>`;
    const lacunas = `<div class="tabela-rolavel"><table><thead><tr><th scope="col">Onde</th><th scope="col">O que o guia não cobre</th><th scope="col">O que fazer</th></tr></thead><tbody>${r.lacunas.map((l) => `<tr><th scope="row">${esc(l.onde)}</th><td>${esc(l.falta)}</td><td>${esc(l.fazer)}</td></tr>`).join('')}</tbody></table></div>`;
    const fontes = `<ul>${r.fontes.map((x) => (x.url ? `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.titulo)}</a></li>` : `<li>${esc(x.titulo)}</li>`)).join('')}</ul>`;
    return { titulo: 'Recursos', secao, html: `
      <h1>Recursos</h1>
      <p class="objetivo">O que você consulta durante o curso.</p>
      <nav class="indice-rec" aria-label="Nesta página">${ind}</nav>
      <section class="secao prosa" id="checklist"><h2>Checklist de revisão</h2><p>Use em todo post, antes de aprovar.</p>${checklistRevisao()}</section>
      <section class="secao prosa" id="planilha"><h2>Planilha de conteúdo</h2>
        <p>Baixe o modelo e abra no Excel, ou importe no Google Planilhas (Arquivo, Importar, Fazer upload; separador ponto e vírgula). A primeira linha é um exemplo: apague depois.</p>
        <div class="acoes"><a class="btn" href="${esc(pl.arquivo)}" download>Baixar o modelo (.csv)</a></div>${colunas}
        <ul><li><strong>Status da pauta:</strong> ideia, em verificação, verificada, descartada.</li><li><strong>Status do post:</strong> rascunho, aprovado, barrado, publicado.</li></ul></section>
      <section class="secao prosa" id="glossario"><h2>Glossário</h2><dl class="termos">${r.glossario.map((g) => `<dt>${esc(g.termo)}</dt><dd>${esc(g.def)}</dd>`).join('')}</dl></section>
      <section class="secao prosa" id="lacunas"><h2>Lacunas do guia</h2><p>Onde o guia não traz um procedimento, o curso não inventa: indica onde confirmar.</p>${lacunas}</section>
      <section class="secao prosa" id="fontes"><h2>Fontes</h2>${fontes}<p class="nota">Recursos, limites e preços das ferramentas mudam com frequência; confirme nos sites oficiais. O conteúdo sobre divulgação não é orientação jurídica.</p></section>` };
  }

  function vMais() {
    return { titulo: 'Mais', html: `
      <h1>Mais</h1>
      <a class="cartao-conta" href="#/conta" style="text-decoration:none">${avatar()}<div><strong>${esc(aluno.nome)}</strong><span>${modoNuvem ? esc(sessao.user.email) : 'Progresso salvo neste aparelho'}</span></div></a>
      <ul class="lista-menu">
        <li><a href="#/comece">${icone('comece')} Comece aqui</a></li>
        <li><a href="#/diario">${icone('diario')} Diário de bordo</a></li>
        <li><a href="#/recursos">${icone('recursos')} Recursos</a></li>
        <li><a href="#/conta">${icone('conta')} Conta e progresso</a></li>
        ${modoNuvem ? `<li><button type="button" class="perigo" data-acao="sair">${icone('sair')} Sair</button></li>` : ''}
      </ul>
      ${secaoInstalar()}` };
  }
  function vConta() {
    const t = totais();
    const temas = [['auto', 'Automático'], ['claro', 'Claro'], ['escuro', 'Escuro']].map(([k, r]) => `<label><input type="radio" name="tema" value="${k}" data-bind="tema"${temaAtual() === k ? ' checked' : ''}> ${r}</label>`).join('');
    return { titulo: 'Conta', html: `
      ${migalhas([['Início', '#/'], ['Conta']])}
      <h1>Conta e progresso</h1>
      <div class="cartao-conta">${avatar()}<div><strong>${esc(aluno.nome)}</strong><span>${modoNuvem ? esc(sessao.user.email) : 'Sem login: o progresso fica só neste aparelho'}</span><span>${t.feitas} de ${t.total} missões concluídas</span></div></div>
      <p>${htmlSync()}</p>
      <section class="secao"><h2>Seu nome</h2>
        <form class="linha-form" data-form="renomear"><div><label class="campo" for="al-nome">Como quer ser chamado</label><input type="text" id="al-nome" name="nome" maxlength="40" required value="${esc(aluno.nome)}"></div><button class="btn btn-sec" type="submit">Salvar</button></form></section>
      ${modoNuvem ? `<section class="secao"><h2>Senha</h2>
        <form class="linha-form" data-form="trocar-senha"><div>${campoSenha('t-senha', 'Nova senha (pelo menos 8 caracteres)', 'new-password')}</div><button class="btn btn-sec" type="submit">Trocar senha</button></form>
        <p class="msg-erro" role="alert" hidden></p></section>` : ''}
      ${secaoInstalar()}
      <section class="secao"><h2>Aparência</h2><fieldset class="opcoes-tema"><legend>Tema</legend>${temas}</fieldset></section>
      <section class="secao prosa"><h2>Cópia de segurança</h2>
        <p>Baixe um arquivo com todo o seu progresso. Dá para importar depois, neste ou em outro aparelho.</p>
        <div class="acoes"><button class="btn btn-sec" type="button" data-acao="exportar">Baixar meu progresso</button><button class="btn btn-sec" type="button" data-acao="importar">Importar progresso</button><input type="file" id="importar-arquivo" accept="application/json,.json" hidden></div></section>
      <section class="secao prosa"><h2>Recomeçar</h2>
        <p>Apaga missões, respostas, Caderno, Diário e Trilha${modoNuvem ? ' da sua conta' : ''}. Baixe uma cópia antes, se quiser guardar.</p>
        <button class="btn btn-perigo" type="button" data-acao="zerar">Apagar meu progresso</button></section>
      ${modoNuvem ? `<div class="acoes"><button class="btn btn-sec" type="button" data-acao="sair">${icone('sair')} Sair da conta</button></div>` : ''}` };
  }
  function vNaoEncontrado() {
    return { titulo: 'Página não encontrada', html: '<h1>Página não encontrada</h1><p>Este endereço não existe no curso.</p><div class="acoes"><a class="btn" href="#/">Voltar ao início</a></div>' };
  }

  /* ================= Shell ================= */
  function secaoAtiva(chave) {
    if (chave === '') return 'inicio';
    if (['modulos', 'modulo', 'missao'].includes(chave)) return 'modulos';
    if (['trilha', 'caderno'].includes(chave)) return chave;
    return 'mais';
  }
  function shell(v, chave, modAtual) {
    const sec = secaoAtiva(chave);
    const cur = (s) => (s === sec ? ' aria-current="page"' : '');
    const nav = [['inicio', '#/', 'Início'], ['comece', '#/comece', 'Comece aqui'], ['trilha', '#/trilha', 'Trilha de 30 dias'], ['caderno', '#/caderno', 'Caderno de prompts'], ['diario', '#/diario', 'Diário de bordo'], ['recursos', '#/recursos', 'Recursos']];
    const curLat = (k) => ((k === 'inicio' && chave === '') || k === chave ? ' aria-current="page"' : '');
    const mods = C.modulos.map((m) => {
      const p = progressoModulo(m);
      return `<li><a href="#/modulo/${m.n}" style="${corMod(m)}"${modAtual === m.n ? ' aria-current="page"' : ''}><span class="lat-num" aria-hidden="true">${m.n}</span><span class="lat-mod-t"><span class="vh">Módulo ${m.n}: </span>${esc(m.titulo)}</span>${segsSimples(p.etapas)}</a></li>`;
    }).join('');
    const abas = [['inicio', '#/', 'Início'], ['modulos', '#/modulos', 'Módulos'], ['trilha', '#/trilha', 'Trilha'], ['caderno', '#/caderno', 'Caderno'], ['mais', '#/mais', 'Mais']];
    return `<div class="app">
      <aside class="lateral" aria-label="Navegação">
        ${marca('#/')}
        <nav class="lat-nav" aria-label="Principal"><ul>${nav.map(([k, h, t]) => `<li><a href="${h}"${curLat(k)}>${icone(k)}${t}</a></li>`).join('')}</ul></nav>
        <div><p class="lat-titulo">Módulos</p><ul class="lat-mods">${mods}</ul></div>
        <div class="lat-rodape">
          <a class="lat-conta" href="#/conta">${avatar()}<span class="lat-conta-txt"><strong>${esc(aluno.nome)}</strong><span>${modoNuvem ? esc(sessao.user.email) : 'Sem login'}</span></span></a>
          ${htmlSync()}
        </div>
      </aside>
      <div class="coluna">
        <header class="topo-movel">${marca('#/')}${htmlSync()}<a href="#/conta" aria-label="Conta">${avatar()}</a></header>
        <main class="pagina${v.larga ? ' larga' : ''}" id="conteudo" tabindex="-1"${v.style ? ` style="${v.style}"` : ''}>${v.html}</main>
        <footer class="rodape"><p>Curso baseado no guia "Automação de marketing com IA" (novembro de 2026). <a href="guia-automacao-marketing-ia.pdf" target="_blank" rel="noopener">Guia original (PDF)</a></p></footer>
      </div>
      <nav class="abas" aria-label="Seções">${abas.map(([k, h, t]) => `<a class="aba" href="${h}"${cur(k)}>${icone(k)}<span>${t}</span></a>`).join('')}</nav>
    </div>`;
  }

  /* ================= Rotas ================= */
  function rota() {
    const h = (location.hash || '').replace(/^#\/?/, '');
    const i = h.indexOf('?');
    const caminho = i >= 0 ? h.slice(0, i) : h;
    let partes;
    try { partes = caminho.split('/').filter(Boolean).map(decodeURIComponent); } catch (_) { partes = []; }
    return { partes, query: new URLSearchParams(i >= 0 ? h.slice(i + 1) : '') };
  }
  const ROTAS_AUTH = ['entrar', 'criar-conta', 'recuperar', 'nova-senha'];
  function temaAtual() { const t = ls.get(K_TEMA); return ['claro', 'escuro'].includes(t) ? t : 'auto'; }
  function aplicarTema() {
    const t = temaAtual(), r = document.documentElement;
    if (t === 'claro') r.setAttribute('data-theme', 'light'); else if (t === 'escuro') r.setAttribute('data-theme', 'dark'); else r.removeAttribute('data-theme');
  }

  let primeiraRender = true;
  function render(opts) {
    opts = opts || {};
    const { partes, query } = rota();
    const chave = partes[0] || '';
    if (chave !== 'caderno') { cadernoUI.editando = null; cadernoUI.testando = null; }
    let v;
    if (erroConfig) v = vErroConfig();
    else if (modoNuvem && (!sessao || (!aluno && chave !== 'nova-senha'))) {
      if (chave === 'criar-conta') v = vCriarConta();
      else if (chave === 'recuperar') v = vRecuperar();
      else {
        if (chave && !ROTAS_AUTH.includes(chave)) { try { sessionStorage.setItem(K_VOLTAR, location.hash); } catch (_) { /* nada */ } }
        if (location.hash !== '#/entrar') history.replaceState(null, '', '#/entrar');
        v = vEntrar();
      }
    } else if (chave === 'nova-senha' && modoNuvem) v = vNovaSenha();
    else if (ROTAS_AUTH.includes(chave)) { history.replaceState(null, '', '#/'); return render(opts); }
    else {
      try {
        switch (chave) {
          case '': v = vInicio(); break;
          case 'comece': v = vComece(); break;
          case 'modulos': v = vModulos(); break;
          case 'modulo':
            if (partes[2] === 'leitura') v = vLeitura(partes[1]);
            else if (partes[2] === 'acesso') v = vAcesso(partes[1]);
            else if (partes[2] === 'perguntas') v = vPerguntas(partes[1], query);
            else v = vModulo(partes[1]);
            break;
          case 'missao': v = vMissao(partes[1]); break;
          case 'trilha': v = vTrilha(); break;
          case 'caderno': v = vCaderno(partes[1], query); if (query.get('a') && query.get('b')) v.secao = 'comparar'; break;
          case 'diario': v = vDiario(); break;
          case 'recursos': v = vRecursos(partes[1]); break;
          case 'mais': v = vMais(); break;
          case 'conta': v = vConta(); break;
          default: v = vNaoEncontrado();
        }
      } catch (err) {
        console.error(err);
        v = { titulo: 'Erro', html: '<h1>Algo deu errado</h1><p>Recarregue a página. Se continuar, baixe o seu progresso na página Conta.</p>' };
      }
    }
    const modAtual = chave === 'modulo' ? Number(partes[1]) : chave === 'missao' && MAPA[partes[1]] ? MAPA[partes[1]].mod.n : null;
    app.innerHTML = v.auth ? v.html : shell(v, chave, modAtual);
    document.title = v.titulo ? `${v.titulo} | Linha de Produção` : C.meta.titulo;
    msgAuth = null;
    if (opts.manter) {
      window.scrollTo(0, opts.y || 0);
      const el = opts.foco && document.getElementById(opts.foco);
      if (el) el.focus({ preventScroll: true });
    } else {
      const alvo = v.secao && document.getElementById(v.secao);
      if (alvo) alvo.scrollIntoView(); else window.scrollTo(0, 0);
      if (!primeiraRender) { const h1 = document.querySelector('main h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); } }
    }
    primeiraRender = false;
    animarCarimbo = null;
  }
  function rerender() {
    const ae = document.activeElement;
    render({ manter: true, y: window.scrollY, foco: ae && ae.id ? ae.id : null });
  }
  function ir(h) { if (location.hash === h) render(); else location.hash = h; }
  function focar(id) { const el = document.getElementById(id); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } }

  /* ================= IA (servidor no Render) ================= */
  async function chamarIA(caminho, corpo, aoDemorar) {
    const token = await tokenValido();
    const ctl = new AbortController();
    const lento = setTimeout(() => aoDemorar && aoDemorar(), 5000);
    const limite = setTimeout(() => ctl.abort(), 90000);
    let r;
    try {
      r = await fetch(API_URL + caminho, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(corpo), signal: ctl.signal });
    } catch (e) {
      throw new Error(e.name === 'AbortError' ? 'O servidor demorou demais para responder. Tente de novo.' : 'Não foi possível falar com o servidor da IA. Confira a internet e o endereço em config.js.');
    } finally { clearTimeout(lento); clearTimeout(limite); }
    let d = null;
    try { d = await r.json(); } catch (_) { d = null; }
    if (!r.ok) throw new Error((d && d.erro) || `O servidor da IA respondeu com erro ${r.status}.`);
    return d;
  }
  async function revisarIA(id) {
    const { mi } = MAPA[id];
    const m = lerMissao(id);
    const ent = String(m.entregavel || '').trim();
    if (!ent) { aviso('Escreva o entregável antes de pedir a revisão.'); return; }
    if (pareceChave(ent)) { aviso(TEXTO_CHAVE); return; }
    const k = 'rev-' + id;
    iaEstado[k] = { carregando: true };
    rerender();
    try {
      const d = await chamarIA('/ia/revisar', { missao: `${id}: ${mi.titulo}`, objetivo: mi.objetivo, esperado: mi.entregavel, criterios: mi.criterios, entregavel: ent }, () => { if (iaEstado[k]) { iaEstado[k].lento = true; rerender(); } });
      missaoEditavel(id).revisaoIA = { texto: texto(d.texto, 6000), em: agoraISO() };
      delete iaEstado[k];
      salvar();
    } catch (e) {
      iaEstado[k] = { erro: e.message };
    }
    rerender();
  }
  async function testarIA(entradaId, valores) {
    const e = aluno.caderno.find((x) => x.id === entradaId);
    if (!e) return;
    let prompt = e.texto;
    Object.keys(valores).forEach((v) => { if (valores[v]) prompt = prompt.split('{' + v + '}').join(valores[v]); });
    if (pareceChave(prompt)) { cadernoUI.teste = { valores, erro: TEXTO_CHAVE }; rerender(); return; }
    cadernoUI.teste = { valores, carregando: true };
    rerender();
    try {
      const d = await chamarIA('/ia/testar', { prompt }, () => { if (cadernoUI.teste.carregando) { cadernoUI.teste.lento = true; rerender(); } });
      cadernoUI.teste = { valores, resposta: d.texto, prompt };
    } catch (err) {
      cadernoUI.teste = { valores, erro: err.message };
    }
    rerender();
  }

  /* ================= Ações ================= */
  function baixar(nomeArq, conteudo, tipo) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = document.createElement('a');
    a.href = url; a.download = nomeArq;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function copiar(t) {
    const reserva = () => {
      const ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      ta.remove();
      aviso(ok ? 'Copiado.' : 'Não deu para copiar. Selecione o texto e copie à mão.');
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(() => aviso('Copiado.'), reserva); else reserva();
  }
  function novaEntrada(campos) {
    const e = Object.assign({ id: uid(), nome: '', versao: '', tipo: 'apoio', texto: '', nota: '', bom: false, criadoEm: agoraISO(), atualizadoEm: agoraISO() }, campos);
    aluno.caderno.push(e);
    return e;
  }
  function evoluir(de, para, blocoKey) {
    const fontes = aluno.caderno.filter((e) => e.versao === de && (e.tipo === 'base' || e.tipo === 'modelo'));
    if (!fontes.length) { aviso(`Você ainda não tem um prompt ${de} no Caderno. Faça a missão anterior primeiro.`); return; }
    let criados = 0;
    fontes.forEach((f) => {
      if (aluno.caderno.some((e) => e.versao === para && e.nome === f.nome && e.tipo === f.tipo)) return;
      novaEntrada({ nome: f.nome, versao: para, tipo: f.tipo, texto: f.texto.replace(/\s+$/, '') + '\n\n' + C.blocos[blocoKey], nota: `Criada a partir de ${f.nome} (${de}). O que mudou e por quê: ` });
      criados++;
    });
    salvar();
    aviso(criados ? `${plural(criados, 'prompt criado', 'prompts criados')} na ${para}. Revise no Caderno e escreva a nota.` : `Os prompts da ${para} já existem no Caderno.`);
    rerender();
  }
  function criarModelos() {
    const bases = aluno.caderno.filter((e) => e.versao === 'v3' && e.tipo === 'base');
    if (!bases.length) { aviso('Crie primeiro a v3 do prompt-base, na Missão 3.1.'); return; }
    const base = bases[bases.length - 1];
    let criados = 0;
    C.modelos.forEach((mo) => {
      if (aluno.caderno.some((e) => e.nome === mo.nome && e.versao === 'v3' && e.tipo === 'modelo')) return;
      const partes = [base.texto.replace(/\s+$/, ''), '[TAREFA]\n' + mo.tarefa, '[FORMATO DE SAÍDA]\n' + mo.saida, C.blocos.regraLinha];
      if (mo.extra) partes.push(mo.extra);
      novaEntrada({ nome: mo.nome, versao: 'v3', tipo: 'modelo', texto: partes.join('\n\n'), nota: `Derivado da v3 do ${base.nome}. O que mudei: ` });
      criados++;
    });
    salvar();
    aviso(criados ? `${plural(criados, 'modelo criado', 'modelos criados')} na v3.` : 'Os 4 modelos já estão no Caderno.');
    rerender();
  }
  function salvarEntregavel(id, valor, silencioso) {
    const did = idDom(id);
    const ak = document.getElementById('ak-' + did);
    const campo = document.getElementById('ent-' + did);
    if (pareceChave(valor)) {
      if (ak) { ak.hidden = false; ak.textContent = TEXTO_CHAVE; }
      if (campo) campo.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (ak) ak.hidden = true;
    if (campo) campo.removeAttribute('aria-invalid');
    missaoEditavel(id).entregavel = texto(valor);
    salvar();
    if (!silencioso) { const sv = document.getElementById('sv-' + did); if (sv) sv.textContent = 'Salvo.'; }
    return true;
  }
  function atualizarConcluir(id) {
    const did = idDom(id);
    const btn = document.querySelector(`[data-acao="concluir"][data-missao="${id}"]`);
    const p = document.getElementById('faltam-' + did);
    const f = faltasMissao(id);
    if (btn) { if (f.length) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled'); }
    if (p) p.textContent = f.length ? 'Falta: ' + f.join(' e ') + '.' : 'Tudo pronto para concluir.';
    const s = document.getElementById('selo-' + did);
    if (s) s.outerHTML = selo(statusMissao(id), 'selo-' + did);
  }
  function exportar() {
    baixar(`progresso-${fatiar(aluno.nome)}-${hojeISO()}.json`, JSON.stringify({ formato: 'linha-producao', versao: 2, exportadoEm: agoraISO(), aluno }, null, 2), 'application/json');
    aviso('Arquivo de progresso baixado.');
  }
  function importarArquivo(arq) {
    if (!arq) return;
    if (arq.size > 5 * 1024 * 1024) { aviso('Arquivo grande demais para ser um progresso deste curso.'); return; }
    const leitor = new FileReader();
    leitor.onload = () => {
      let d = null;
      try { d = JSON.parse(String(leitor.result)); } catch (_) { d = null; }
      if (!ehObjeto(d) || d.formato !== 'linha-producao' || !ehObjeto(d.aluno)) { aviso('Este arquivo não é um progresso deste curso.'); return; }
      if (!window.confirm('Substituir o seu progresso atual pelo do arquivo?')) return;
      const id = aluno.id, nome = aluno.nome;
      aluno = normalizar(JSON.parse(JSON.stringify(d.aluno)));
      aluno.id = id;
      if (modoNuvem) aluno.nome = nome;
      sync.podeEnviar = true;
      salvar();
      aviso('Progresso importado.');
      ir('#/');
    };
    leitor.onerror = () => aviso('Não foi possível ler o arquivo.');
    leitor.readAsText(arq);
  }
  function baixarCaderno() {
    if (!aluno.caderno.length) { aviso('O Caderno está vazio.'); return; }
    const ordem = (e) => { const i = VERSOES.indexOf(e.versao); return i < 0 ? 99 : i; };
    const linhas = [`CADERNO DE PROMPTS: ${aluno.nome}`, `Exportado em ${dataBR(hojeISO())}`, ''];
    aluno.caderno.slice().sort((x, y) => ordem(x) - ordem(y)).forEach((e) => {
      linhas.push('='.repeat(64), `${rotuloEntrada(e)}  [${TIPOS[e.tipo] || e.tipo}]${e.bom ? '  (prompt bom)' : ''}`, '-'.repeat(64), e.texto, '');
      if (e.nota) linhas.push('O que mudou: ' + e.nota, '');
    });
    baixar(`caderno-de-prompts-${fatiar(aluno.nome)}.txt`, linhas.join('\n'), 'text/plain;charset=utf-8');
  }

  /* ================= Eventos ================= */
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-acao]');
    if (!el) return;
    const ac = el.dataset.acao;
    switch (ac) {
      case 'ver-senha': {
        const inp = document.getElementById(el.dataset.alvo);
        if (!inp) return;
        const ver = inp.type === 'password';
        inp.type = ver ? 'text' : 'password';
        el.textContent = ver ? 'Ocultar' : 'Mostrar';
        el.setAttribute('aria-pressed', String(ver));
        return;
      }
      case 'sair': sair(); return;
      case 'instalar': if (pedidoInstalar) { pedidoInstalar.prompt(); pedidoInstalar.userChoice.finally(() => { pedidoInstalar = null; rerender(); }); } return;
      default: break;
    }
    if (!aluno) return;
    switch (ac) {
      case 'copiar': { const pre = document.getElementById(el.dataset.alvo); if (pre) copiar(pre.textContent); return; }
      case 'salvar-prompt': {
        const pre = document.getElementById(el.dataset.alvo);
        if (!pre) return;
        const nome = el.dataset.nome;
        if (aluno.caderno.some((e) => e.nome === nome && e.texto === pre.textContent)) { aviso('Já está no Caderno.'); return; }
        novaEntrada({ nome, tipo: TIPOS[el.dataset.categoria] ? el.dataset.categoria : 'apoio', texto: pre.textContent, nota: 'Salvo a partir de uma missão.' });
        salvar(); aviso(`Salvo no Caderno: ${nome}.`); rerender();
        return;
      }
      case 'evoluir': evoluir(el.dataset.de, el.dataset.para, el.dataset.bloco); return;
      case 'criar-modelos': criarModelos(); return;
      case 'ler': {
        const n = el.dataset.mod;
        aluno.leitura[n] = hojeISO();
        salvar();
        ir(`#/modulo/${n}/acesso`);
        return;
      }
      case 'concluir': {
        const id = el.dataset.missao;
        const campo = document.getElementById('ent-' + idDom(id));
        if (campo && campo.value !== lerMissao(id).entregavel && !salvarEntregavel(id, campo.value, true)) { aviso('Tire a chave de API do entregável antes de concluir.'); return; }
        const f = faltasMissao(id);
        if (f.length) { aviso('Para concluir, falta: ' + f.join(' e ') + '.'); return; }
        missaoEditavel(id).concluidaEm = hojeISO();
        animarCarimbo = reduzMovimento() ? null : id;
        atualizarMarcos(); salvar(); rerender();
        aviso(`Missão ${id} concluída.`);
        return;
      }
      case 'reabrir': missaoEditavel(el.dataset.missao).concluidaEm = ''; salvar(); rerender(); return;
      case 'revisar-ia': revisarIA(el.dataset.missao); return;
      case 'refazer-quiz': delete aluno.quiz[el.dataset.mod]; salvar(); ir(`#/modulo/${el.dataset.mod}/perguntas?q=0`); aviso('Respostas apagadas. Responda de novo.'); return;
      case 'v0-minimo': { const ta = document.getElementById('v0-texto'); if (ta) { ta.value = C.promptBase.v0Minimo; ta.focus(); } return; }
      case 'novo-prompt': cadernoUI.editando = 'novo'; rerender(); focar('f-nome-novo'); return;
      case 'editar': cadernoUI.editando = el.dataset.id; cadernoUI.testando = null; rerender(); focar('f-texto-' + el.dataset.id); return;
      case 'cancelar-edicao': cadernoUI.editando = null; rerender(); return;
      case 'testar': cadernoUI.testando = el.dataset.id; cadernoUI.teste = {}; cadernoUI.editando = null; rerender(); { const p = document.querySelector(`#e-${CSS.escape(el.dataset.id)} .painel-ia`); if (p) p.scrollIntoView({ block: 'nearest' }); } return;
      case 'fechar-teste': cadernoUI.testando = null; cadernoUI.teste = {}; rerender(); return;
      case 'copiar-teste': if (cadernoUI.teste.resposta) copiar(cadernoUI.teste.resposta); return;
      case 'salvar-teste': {
        const e = aluno.caderno.find((x) => x.id === el.dataset.id);
        if (!e || !cadernoUI.teste.resposta) return;
        novaEntrada({ nome: `Resposta da IA: ${rotuloEntrada(e)}`, tipo: 'saida', texto: cadernoUI.teste.resposta, nota: 'Gerada pelo teste com IA no Caderno.' });
        salvar(); aviso('Resposta salva em "Outros".'); rerender();
        return;
      }
      case 'duplicar': {
        const e = aluno.caderno.find((x) => x.id === el.dataset.id);
        if (!e) return;
        const c = novaEntrada({ nome: e.nome + ' (cópia)', versao: e.versao, tipo: e.tipo, texto: e.texto, nota: e.nota });
        salvar(); cadernoUI.editando = c.id; rerender(); focar('f-nome-' + c.id);
        return;
      }
      case 'excluir': {
        const e = aluno.caderno.find((x) => x.id === el.dataset.id);
        if (!e || !window.confirm(`Excluir "${rotuloEntrada(e)}" do Caderno? Não dá para desfazer.`)) return;
        aluno.caderno = aluno.caderno.filter((x) => x.id !== e.id);
        salvar(); rerender(); aviso('Excluído.');
        return;
      }
      case 'estrela': { const e = aluno.caderno.find((x) => x.id === el.dataset.id); if (e) { e.bom = !e.bom; salvar(); rerender(); } return; }
      case 'copiar-entrada': { const e = aluno.caderno.find((x) => x.id === el.dataset.id); if (e) copiar(e.texto); return; }
      case 'baixar-caderno': baixarCaderno(); return;
      case 'ir-comparar': { const s = document.getElementById('comparar'); if (s) { s.scrollIntoView(); const c = document.getElementById('cmp-a'); if (c) c.focus({ preventScroll: true }); } return; }
      case 'excluir-diario': if (window.confirm('Excluir esta anotação do Diário?')) { aluno.diario = aluno.diario.filter((d) => d.id !== el.dataset.id); salvar(); rerender(); } return;
      case 'exportar': exportar(); return;
      case 'importar': { const inp = document.getElementById('importar-arquivo'); if (inp) inp.click(); return; }
      case 'zerar': {
        if (!window.confirm('Apagar todo o seu progresso? Não dá para desfazer.')) return;
        const novo = alunoNovo(aluno.nome);
        novo.id = aluno.id;
        aluno = novo;
        sync.podeEnviar = true;
        salvar(); aviso('Progresso apagado.'); ir('#/');
        return;
      }
      default: return;
    }
  });

  document.addEventListener('change', (ev) => {
    const el = ev.target;
    if (!aluno) return;
    if (el.id === 'importar-arquivo') { importarArquivo(el.files && el.files[0]); el.value = ''; return; }
    const b = el.dataset && el.dataset.bind;
    if (!b || b === 'entregavel') return;
    switch (b) {
      case 'acesso': { const k = el.dataset.mod; aluno.acesso[k] = ehObjeto(aluno.acesso[k]) ? aluno.acesso[k] : {}; aluno.acesso[k][el.dataset.item] = el.checked; break; }
      case 'passo': missaoEditavel(el.dataset.missao).passos[el.dataset.i] = el.checked; break;
      case 'criterio': missaoEditavel(el.dataset.missao).criterios[el.dataset.i] = el.checked; break;
      case 'quiz': {
        const mod = modulo(el.dataset.mod);
        const q = mod && mod.perguntas.find((x) => x.id === el.dataset.q);
        if (!q) return;
        const r = aluno.quiz[mod.n] = ehObjeto(aluno.quiz[mod.n]) ? aluno.quiz[mod.n] : {};
        const ant = r[q.id];
        const escolha = Number(el.value);
        const certa = escolha === q.correta;
        r[q.id] = { escolha, certa, primeira: ant && typeof ant.primeira === 'boolean' ? ant.primeira : certa };
        if (!/[?&]q=/.test(location.hash)) history.replaceState(null, '', `#/modulo/${mod.n}/perguntas?q=${mod.perguntas.indexOf(q)}`);
        break;
      }
      case 'trilha': aluno.trilha.feitos[el.dataset.t] = el.checked; break;
      case 'inicio': aluno.trilha.inicio = /^\d{4}-\d{2}-\d{2}$/.test(el.value) ? el.value : ''; break;
      case 'tema': ls.set(K_TEMA, ['claro', 'escuro'].includes(el.value) ? el.value : 'auto'); aplicarTema(); return;
      default: return;
    }
    atualizarMarcos(); salvar(); rerender();
  });

  const temporizadores = {};
  document.addEventListener('input', (ev) => {
    const el = ev.target;
    if (el.dataset && el.dataset.bind === 'entregavel' && aluno) {
      const id = el.dataset.missao;
      const sv = document.getElementById('sv-' + idDom(id));
      if (sv) sv.textContent = '';
      clearTimeout(temporizadores[id]);
      if (pareceChave(el.value)) { salvarEntregavel(id, el.value); return; }
      temporizadores[id] = setTimeout(() => { if (salvarEntregavel(id, el.value)) atualizarConcluir(id); }, 450);
      return;
    }
    const form = el.form;
    if (form && form.dataset.form && (el.tagName === 'TEXTAREA' || el.type === 'text')) {
      const alerta = form.querySelector('.aviso-chave');
      if (!alerta) return;
      const ruim = pareceChave(el.value);
      alerta.hidden = !ruim;
      alerta.textContent = ruim ? TEXTO_CHAVE : '';
      if (ruim) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
  });

  function erroForm(f, msg) {
    const p = f.querySelector('.msg-erro') || (f.parentElement && f.parentElement.querySelector('.msg-erro'));
    if (p) { p.hidden = false; p.className = 'msg-erro'; p.textContent = msg; } else aviso(msg);
  }
  async function enviarAuth(f, botaoTexto, fn) {
    const btn = f.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = botaoTexto;
    try { await fn(); } catch (e) { erroForm(f, e.message || 'Algo deu errado.'); } finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = orig; } }
  }
  const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  async function depoisDeEntrar() {
    try { await abrirProgressoDaConta(); } catch (e) { limparSessao(); aluno = null; throw e; }
    let volta = '#/';
    try { volta = sessionStorage.getItem(K_VOLTAR) || '#/'; sessionStorage.removeItem(K_VOLTAR); } catch (_) { /* nada */ }
    if (!/^#\/[a-z0-9./?=&-]*$/i.test(volta) || ROTAS_AUTH.some((r) => volta.startsWith('#/' + r))) volta = '#/';
    ir(volta);
  }

  document.addEventListener('submit', (ev) => {
    const f = ev.target;
    const tipo = f.dataset && f.dataset.form;
    if (!tipo) return;
    ev.preventDefault();
    const d = new FormData(f);
    const val = (k) => String(d.get(k) || '').trim();
    const bloquear = (...ts) => {
      if (!ts.some(pareceChave)) return false;
      const a = f.querySelector('.aviso-chave');
      if (a) { a.hidden = false; a.textContent = TEXTO_CHAVE; } else aviso(TEXTO_CHAVE);
      return true;
    };

    /* ----- login ----- */
    if (tipo === 'entrar') {
      const email = val('email'), senha = String(d.get('senha') || '');
      if (!emailValido(email)) return erroForm(f, 'Digite um e-mail válido.');
      if (!senha) return erroForm(f, 'Digite a sua senha.');
      enviarAuth(f, 'Entrando', async () => {
        const r = await sbReq('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password: senha } });
        guardarSessao(r);
        await depoisDeEntrar();
      });
      return;
    }
    if (tipo === 'criar') {
      const nome = val('nome').slice(0, 40), email = val('email'), senha = String(d.get('senha') || '');
      if (!nome) return erroForm(f, 'Diga como quer ser chamado.');
      if (!emailValido(email)) return erroForm(f, 'Digite um e-mail válido.');
      if (senha.length < 8) return erroForm(f, 'A senha precisa ter pelo menos 8 caracteres.');
      enviarAuth(f, 'Criando a conta', async () => {
        const r = await sbReq('/auth/v1/signup?redirect_to=' + encodeURIComponent(urlRetorno()), { method: 'POST', body: { email, password: senha, data: { nome } } });
        if (r && r.access_token) { guardarSessao(r); await depoisDeEntrar(); aviso(`Conta criada. Bem-vindo, ${nome.split(' ')[0]}.`); return; }
        msgAuth = { ok: true, texto: `Quase lá: enviamos um link de confirmação para ${email}. Abra o e-mail (confira o spam) e depois entre com a sua senha.` };
        ir('#/entrar');
      });
      return;
    }
    if (tipo === 'recuperar') {
      const email = val('email');
      if (!emailValido(email)) return erroForm(f, 'Digite um e-mail válido.');
      enviarAuth(f, 'Enviando', async () => {
        await sbReq('/auth/v1/recover?redirect_to=' + encodeURIComponent(urlRetorno()), { method: 'POST', body: { email } });
        const p = f.querySelector('.msg-erro');
        if (p) { p.hidden = false; p.className = 'msg-ok'; p.textContent = `Se existir uma conta com ${email}, o link chega em alguns minutos. Confira também o spam.`; }
      });
      return;
    }
    if (tipo === 'nova-senha' || tipo === 'trocar-senha') {
      const senha = String(d.get('senha') || '');
      if (senha.length < 8) return erroForm(f, 'A senha precisa ter pelo menos 8 caracteres.');
      enviarAuth(f, 'Salvando', async () => {
        await sbReq('/auth/v1/user', { method: 'PUT', token: await tokenValido(), body: { password: senha } });
        f.reset();
        aviso('Senha trocada.');
        if (tipo === 'nova-senha') { await abrirProgressoDaConta(); ir('#/'); }
      });
      return;
    }
    if (!aluno) return;

    /* ----- curso ----- */
    switch (tipo) {
      case 'renomear': {
        const nome = val('nome').slice(0, 40);
        if (!nome || bloquear(nome)) return;
        aluno.nome = nome;
        salvar();
        if (modoNuvem) {
          sessao.user.nome = nome; ls.set(K_SESSAO, sessao);
          tokenValido().then((tk) => sbReq('/auth/v1/user', { method: 'PUT', token: tk, body: { data: { nome } } })).catch(() => {});
        }
        rerender(); aviso('Nome salvo.');
        return;
      }
      case 'v0': {
        const t = String(d.get('texto') || '').replace(/\s+$/, '');
        if (!t.trim() || bloquear(t)) return;
        novaEntrada({ nome: 'Prompt-base', versao: 'v0', tipo: 'base', texto: t, nota: 'Meu primeiro prompt, sem alterações.' });
        salvar(); rerender(); aviso('v0 salvo no Caderno.');
        return;
      }
      case 'saidas': {
        const ta = String(d.get('a') || '').replace(/\s+$/, ''), tb = String(d.get('b') || '').replace(/\s+$/, '');
        if (!ta.trim() || !tb.trim() || bloquear(ta, tb)) return;
        const e1 = novaEntrada({ nome: 'Resposta do v0 (Missão 4.1)', tipo: 'saida', texto: ta, nota: 'Saída de teste do v0.' });
        const e2 = novaEntrada({ nome: 'Resposta da v4 (Missão 4.1)', tipo: 'saida', texto: tb, nota: 'Saída de teste da v4, mesma pauta.' });
        salvar();
        cadernoUI.comparar = { a: e1.id, b: e2.id };
        aviso('Respostas salvas no Caderno.');
        ir(`#/caderno/outros?a=${encodeURIComponent(e1.id)}&b=${encodeURIComponent(e2.id)}`);
        return;
      }
      case 'diario-rapido': {
        const prox = val('proximo'), id = f.dataset.missao;
        if (!prox || bloquear(prox) || !MAPA[id]) return;
        aluno.diario.push({ id: uid(), data: hojeISO(), fiz: `Trabalhei na Missão ${id}: ${MAPA[id].mi.titulo}.`, proximo: prox, missao: id, criadoEm: agoraISO() });
        salvar(); f.reset(); aviso('Anotado no Diário.');
        return;
      }
      case 'diario': {
        const fiz = val('fiz'), prox = val('proximo');
        if (!fiz && !prox) { aviso('Escreva o que você fez ou o próximo passo.'); return; }
        if (bloquear(fiz, prox)) return;
        aluno.diario.push({ id: uid(), data: /^\d{4}-\d{2}-\d{2}$/.test(val('data')) ? val('data') : hojeISO(), fiz, proximo: prox, missao: MAPA[val('missao')] ? val('missao') : '', criadoEm: agoraISO() });
        salvar(); rerender(); aviso('Anotação salva.');
        return;
      }
      case 'entrada': {
        const nome = val('nome').slice(0, 120), t = String(d.get('texto') || '').replace(/\s+$/, ''), nota = val('nota');
        const versao = VERSOES.includes(val('versao')) ? val('versao') : '', tp = TIPOS[val('tipo')] ? val('tipo') : 'apoio';
        if (!nome || !t.trim()) { aviso('Preencha o nome e o texto.'); return; }
        if (bloquear(nome, t, nota)) return;
        const e = f.dataset.id && aluno.caderno.find((x) => x.id === f.dataset.id);
        if (e) Object.assign(e, { nome, versao, tipo: tp, texto: t, nota, atualizadoEm: agoraISO() }); else novaEntrada({ nome, versao, tipo: tp, texto: t, nota });
        cadernoUI.editando = null; salvar(); rerender(); aviso('Salvo no Caderno.');
        return;
      }
      case 'testar': {
        const valores = {};
        for (const [k, v] of d.entries()) if (k.startsWith('var-')) valores[k.slice(4)] = String(v).trim();
        if (bloquear(...Object.values(valores))) return;
        testarIA(f.dataset.id, valores);
        return;
      }
      case 'comparar': {
        cadernoUI.comparar = { a: val('a'), b: val('b') };
        rerender();
        const s = document.getElementById('comparar'); if (s) s.scrollIntoView();
        return;
      }
      default: return;
    }
  });

  window.addEventListener('hashchange', () => render());
  window.addEventListener('online', () => { if (modoNuvem && sessao) sincronizar(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && modoNuvem && sessao && aluno && sync.estado === 'salvando' && sync.podeEnviar) {
      clearTimeout(sync.timer);
      enviarRemoto(true).then(() => marcarSync('ok')).catch(() => marcarSync('erro'));
    }
  });

  /* ================= Início ================= */
  async function iniciar() {
    aplicarTema();
    if (erroConfig) { render(); return; }
    if (!modoNuvem) { abrirProgressoLocal(); atualizarMarcos(); render(); return; }
    let retorno = null;
    try { retorno = await tratarRetornoEmail(); } catch (e) { retorno = { erro: e.message }; }
    if (!sessao) sessao = ls.get(K_SESSAO);
    if (sessao && !(sessao.user && sessao.user.id && sessao.refresh_token)) limparSessao();
    if (sessao) {
      try {
        await tokenValido();
        await abrirProgressoDaConta();
        atualizarMarcos();
      } catch (e) {
        if (e.status === 400 || e.status === 401 || e.status === 403) { limparSessao(); msgAuth = { texto: 'A sua sessão expirou. Entre de novo.' }; } else {
          const local = ls.get(kAluno(sessao.user.id));
          aluno = normalizar(local || alunoNovo(sessao.user.nome || ''));
          aluno.id = sessao.user.id;
          sync.podeEnviar = false;
          marcarSync('erro');
        }
      }
    }
    if (retorno && retorno.erro) msgAuth = { texto: retorno.erro };
    if (retorno && retorno.tipo === 'recovery' && sessao) { history.replaceState(null, '', '#/nova-senha'); render(); return; }
    if (retorno && sessao && retorno.tipo !== 'recovery') { history.replaceState(null, '', '#/'); render(); aviso('E-mail confirmado. Bem-vindo.'); return; }
    render();
  }
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
  iniciar();
})();
