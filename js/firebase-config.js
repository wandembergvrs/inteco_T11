// CONFIGURAÇÃO DO FIREBASE — PENDENTE
//
// Passo a passo (uns 5 minutos, uma vez só):
// 1. Acesse https://console.firebase.google.com/ e faça login com sua conta Google.
// 2. Clique em "Adicionar projeto" (pode chamar de "inteco-enquetes", por exemplo). Pode desativar o Google Analytics, não precisa.
// 3. No menu lateral, vá em "Compilação" > "Realtime Database" > "Criar banco de dados".
//    - Escolha a região "us-central1" (ou a mais próxima).
//    - Em "Regras de segurança", escolha "Iniciar no modo de teste" (deixa leitura/escrita liberada — suficiente para uma enquete de sala de aula, sem dados sensíveis).
// 4. Ainda no console, clique no ícone de engrenagem > "Configurações do projeto" > role até "Seus apps" > clique no ícone "</>" (Web) para criar um app da Web.
//    - Dê um nome (ex: "inteco-web") e clique em "Registrar app".
// 5. O Firebase vai mostrar um bloco de código com "firebaseConfig = {...}". Copie os valores de apiKey, authDomain, databaseURL,
//    projectId, storageBucket, messagingSenderId e appId para dentro do objeto abaixo, substituindo os placeholders.
// 6. Salve este arquivo e suba (commit/push) — pronto, a enquete passa a funcionar.

const firebaseConfig = {
  apiKey: "AIzaSyDXhBxC-KDpMxxDrXGAo-IyyA8ggXrof0w",
  authDomain: "inteco-5fa6d.firebaseapp.com",
  // ATENÇÃO: databaseURL abaixo é um palpite (região us-central1). Confirme no console:
  // Compilação > Realtime Database > a URL aparece no topo da página. Se for diferente, troque aqui.
  databaseURL: "https://inteco-5fa6d-default-rtdb.firebaseio.com",
  projectId: "inteco-5fa6d",
  storageBucket: "inteco-5fa6d.firebasestorage.app",
  messagingSenderId: "632586373458",
  appId: "1:632586373458:web:9274da81f217a8e182d28b"
};

const FIREBASE_CONFIGURADO = !Object.values(firebaseConfig).some(v => String(v).includes("SUBSTITUA_AQUI"));
