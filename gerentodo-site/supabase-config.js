/* =====================================================================
   supabase-config.js — liga o site ao Supabase.
   A chave "publishable" é pública por desenho (pode ficar no site).
   NUNCA coloque aqui a "secret key" nem a "service_role".
   Precisa de estar carregado DEPOIS da biblioteca supabase-js.
   ===================================================================== */
window.SUPA_URL = 'https://niocmasompmdqjcylhsx.supabase.co';
window.SUPA_KEY = 'sb_publishable_8jaPLVM--s_f0aKsFhtUnw_T9V4n136';
(function () {
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase: a biblioteca não carregou (verifique a internet).');
    return;
  }
  window.sb = window.supabase.createClient(window.SUPA_URL, window.SUPA_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'authvault.supabase.auth' }
  });
})();
