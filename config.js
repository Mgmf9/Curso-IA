/*
  Configuração do site. Preencha depois de criar o Supabase e o servidor no Render (passo a passo no README).

  supabaseUrl      Project URL do Supabase, ex.: https://abcdefgh.supabase.co
  supabaseAnonKey  a chave PÚBLICA do Supabase ("publishable" ou "anon public").
                   Ela pode ficar aqui porque o banco só deixa cada aluno ver o próprio progresso.
                   NUNCA coloque aqui a chave "secret" ou "service_role".
  apiUrl           endereço do seu servidor no Render, ex.: https://linha-producao-api.onrender.com

  A chave da Groq NÃO vai neste arquivo: ela fica só no Render, como variável de ambiente.
  Com os campos vazios, o site funciona sem login, salvando o progresso só neste aparelho.
*/
window.CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  apiUrl: ''
};
