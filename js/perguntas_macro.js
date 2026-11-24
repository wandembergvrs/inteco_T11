// Banco de perguntas — Revisão de Macroeconomia — INTECO
// Abrir com ?banco=macro (enquete.html?banco=macro e apresentador.html?banco=macro)
// Tipos: "mc" (múltipla escolha), "scale" (1-5), "numero", "texto"
// Campos extras:
//   "secao"      título do bloco (vira cabeçalho na lista do apresentador)
//   "gabarito"   resposta numérica (mostrada ao publicar; conta quantos acertaram)
//   "tolerancia" margem aceita na resposta numérica (padrão: 0,5% do gabarito)
//   "comentario" explicação mostrada ao publicar o resultado
//   "tabela"     { cabecalho: [...], linhas: [[...], ...] } mostrada junto da pergunta
//   "fixa"       true = não embaralhar as alternativas
//   "reserva"    true = pergunta guardada, fora da sessão
const PERGUNTAS_TODAS = [
  // ---- 1. Taxa de câmbio nominal ----
  { id: "m0", reserva: true, tipo: "numero", secao: "1. Câmbio nominal",
    texto: "💱 Para aquecer, sem pesquisar: quantos reais você acha que custa 1 dólar hoje?",
    unidade: "R$ por US$",
    comentario: "Compare a média da turma com a cotação do dia. Esse preço de uma moeda em termos de outra é a taxa de câmbio NOMINAL." },

  { id: "m1", tipo: "mc", secao: "1. Câmbio nominal",
    texto: "💱 Simulação — Em janeiro, 1 dólar custava R$ 5,00. Em dezembro, passou a custar R$ 5,50. O que aconteceu com o real?",
    opcoes: ["O real se DESVALORIZOU frente ao dólar (é preciso mais reais para comprar 1 dólar)", "O real se VALORIZOU frente ao dólar", "O real não mudou; foi o dólar que mudou", "Não dá para saber sem a inflação dos dois países"], certa: 0,
    grafico: { xmin: 0, xmax: 12, ymin: 4.5, ymax: 6, xlabel: "Mês", ylabel: "R$ por US$",
      curves: [{ formula: "5 + 0.5*x/12", domain: [0, 12], color: "bad", label: "Câmbio R$/US$", labelT: 0.55, labelDy: -10 }],
      points: [{ x: 0, y: 5, label: "jan: 5,00", color: "acc" }, { x: 12, y: 5.5, label: "dez: 5,50", color: "bad" }] },
    comentario: "Com a cotação em R$ por US$, um número MAIOR significa um real MAIS FRACO: cada dólar passou a custar 10% mais reais." },

  { id: "m2", tipo: "mc", secao: "1. Câmbio nominal",
    texto: "💱 Com o dólar passando de R$ 5,00 para R$ 5,50, quem tende a SAIR GANHANDO?",
    opcoes: ["O exportador brasileiro de soja, que recebe em dólar e converte para reais", "O brasileiro que vai passar férias nos EUA", "A empresa brasileira que importa peças cotadas em dólar", "O brasileiro com dívida em dólar"], certa: 0,
    comentario: "Cada US$ 1.000 exportados passam a render R$ 5.500 em vez de R$ 5.000. Já viagem, importação e dívida em dólar ficam mais caras em reais." },

  // ---- 2. Paridade do poder de compra e índice Big Mac ----
  { id: "m3", tipo: "numero", secao: "2. PPC e índice Big Mac",
    texto: "🍔 Um hambúrguer custa R$ 25,00 no Brasil. Nos EUA, o mesmo hambúrguer custa US$ 5,00. Pela paridade do poder de compra (PPC), qual deveria ser a taxa de câmbio (R$ por US$)?",
    unidade: "R$ por US$", gabarito: 5,
    comentario: "PPC: e = P(Brasil) / P(EUA) = 25 / 5 = R$ 5,00 por dólar. É a taxa que faz o mesmo bem custar o mesmo nos dois países." },

  { id: "m4", tipo: "mc", secao: "2. PPC e índice Big Mac",
    texto: "🍔 A PPC aponta R$ 5,00 por dólar, mas o câmbio de mercado está em R$ 5,50. Um americano troca US$ 5,00 e recebe R$ 27,50, mais do que os R$ 25,00 que o hambúrguer custa no Brasil. Pela lógica do índice Big Mac, o real está:",
    opcoes: ["Subvalorizado (barato demais) em relação ao dólar", "Sobrevalorizado (caro demais) em relação ao dólar", "Exatamente na paridade", "A PPC não permite comparar"], certa: 0,
    comentario: "Em dólares, o hambúrguer brasileiro sai a 25 / 5,50 = US$ 4,55, abaixo dos US$ 5,00 dos EUA. O real está cerca de 9% subvalorizado pelo critério da PPC." },

  { id: "m5", tipo: "mc", secao: "2. PPC e índice Big Mac",
    texto: "🍔 O índice Big Mac, publicado pela revista The Economist, é um indicador que:",
    opcoes: ["Compara o preço de um mesmo produto entre países para avaliar se as moedas estão sub ou sobrevalorizadas segundo a PPC", "Mede a inflação de alimentos nos Estados Unidos", "Calcula o PIB per capita a partir do consumo de fast food", "Define a taxa de câmbio oficial dos países"], certa: 0,
    comentario: "É uma forma simples e didática de aplicar a PPC: um produto padronizado, vendido em quase todos os países." },

  { id: "m6", reserva: true, tipo: "scale", secao: "2. PPC e índice Big Mac",
    texto: "🍔 O quanto você concorda: “a PPC funciona perfeitamente para o hambúrguer, porque ele pode ser comprado num país e revendido no outro”?",
    minLabel: "Discordo totalmente", maxLabel: "Concordo totalmente",
    comentario: "A afirmação é falsa: o hambúrguer não é comercializável entre países e carrega custos locais (aluguel, salário do atendente, impostos). Por isso a PPC falha no curto prazo e vale melhor como tendência de longo prazo." },

  // ---- 3. Tipos de inflação ----
  { id: "m7", tipo: "mc", fixa: true, secao: "3. Inflação",
    texto: "📈 O governo amplia gastos e o crédito fica barato. Famílias e empresas querem comprar mais, mas a economia já está perto da capacidade máxima de produção, e os preços sobem. Esse é um caso de inflação:",
    opcoes: ["De demanda", "De custos (oferta)", "Inercial"], certa: 0,
    comentario: "Excesso de demanda agregada diante de uma oferta que não consegue acompanhar." },

  { id: "m8", tipo: "mc", fixa: true, secao: "3. Inflação",
    texto: "📈 Uma seca reduz o nível dos reservatórios, a energia elétrica fica mais cara e o preço do petróleo sobe no mercado internacional. As empresas repassam esses aumentos aos preços. Esse é um caso de inflação:",
    opcoes: ["De demanda", "De custos (oferta)", "Inercial"], certa: 1,
    comentario: "Choque de oferta: sobe o custo de produção, e os preços sobem mesmo sem aumento da demanda." },

  { id: "m9", tipo: "mc", fixa: true, secao: "3. Inflação",
    texto: "📈 Brasil, anos 1980: aluguéis, salários e contratos são reajustados automaticamente pela inflação do período anterior. Mesmo sem novo choque de demanda ou de custos, a inflação de hoje repete a de ontem. Esse é um caso de inflação:",
    opcoes: ["De demanda", "De custos (oferta)", "Inercial"], certa: 2,
    comentario: "A indexação perpetua a inflação passada. O Plano Real (com a URV) foi desenhado justamente para quebrar essa inércia." },

  { id: "m10", reserva: true, tipo: "mc", secao: "3. Inflação",
    texto: "📈 Para combater uma inflação de DEMANDA, o Banco Central costuma:",
    opcoes: ["Subir a taxa de juros (Selic), encarecendo o crédito e esfriando a demanda", "Baixar a taxa de juros para estimular a produção", "Congelar todos os preços por decreto", "Indexar todos os contratos à inflação passada"], certa: 0,
    comentario: "Juros mais altos encarecem o crédito e reduzem consumo e investimento. Contra a inflação de custos, o mesmo remédio custa mais caro em produção e emprego, porque a origem do problema está na oferta." },

  // ---- 4. PIB nominal e real ----
  { id: "m11", tipo: "numero", secao: "4. PIB nominal e real",
    texto: "🧮 Uma economia produz só pão e café (tabela). Qual é o PIB NOMINAL do Ano 2, em R$?",
    tabela: { cabecalho: ["", "Pão", "Café"], linhas: [["Ano 1 (base)", "10 un. a R$ 2", "5 un. a R$ 4"], ["Ano 2", "12 un. a R$ 3", "6 un. a R$ 5"]] },
    unidade: "R$", gabarito: 66,
    comentario: "PIB nominal usa as quantidades e os preços do PRÓPRIO ano: 12 × 3 + 6 × 5 = 36 + 30 = R$ 66." },

  { id: "m12", tipo: "numero", secao: "4. PIB nominal e real",
    texto: "🧮 Mesma economia (tabela). Usando o Ano 1 como base, qual é o PIB REAL do Ano 2, em R$?",
    tabela: { cabecalho: ["", "Pão", "Café"], linhas: [["Ano 1 (base)", "10 un. a R$ 2", "5 un. a R$ 4"], ["Ano 2", "12 un. a R$ 3", "6 un. a R$ 5"]] },
    unidade: "R$", gabarito: 48,
    comentario: "PIB real usa as quantidades do ano e os preços do ANO-BASE: 12 × 2 + 6 × 4 = 24 + 24 = R$ 48." },

  { id: "m13", reserva: true, tipo: "numero", secao: "4. PIB nominal e real",
    texto: "🧮 O PIB real passou de R$ 40 no Ano 1 para R$ 48 no Ano 2. De quanto foi o crescimento REAL da economia, em %?",
    tabela: { cabecalho: ["", "PIB nominal", "PIB real"], linhas: [["Ano 1 (base)", "R$ 40", "R$ 40"], ["Ano 2", "R$ 66", "R$ 48"]] },
    unidade: "%", gabarito: 20,
    comentario: "Crescimento real = 48 / 40 − 1 = 20%. É a variação da PRODUÇÃO, já descontada a alta dos preços." },

  { id: "m13b", tipo: "mc", secao: "4. PIB nominal e real",
    texto: "🧮 No mesmo período, o PIB nominal subiu 65% (de R$ 40 para R$ 66), mas o PIB real cresceu só 20%. O que explica a diferença?",
    tabela: { cabecalho: ["", "PIB nominal", "PIB real"], linhas: [["Ano 1 (base)", "R$ 40", "R$ 40"], ["Ano 2", "R$ 66", "R$ 48"]] },
    opcoes: ["A alta dos preços: o deflator do PIB passou de 100 para 137,5", "A produção de pão e de café caiu no Ano 2", "O PIB real inclui os impostos, e o nominal não", "Um erro de cálculo: PIB nominal e PIB real deveriam ser sempre iguais"], certa: 0,
    comentario: "Deflator = PIB nominal / PIB real × 100 = 66 / 48 × 100 = 137,5: os preços subiram 37,5% desde o ano-base. Conferindo: 1,20 × 1,375 = 1,65." },

  // ---- 5. Cálculo do PIB ----
  { id: "m14", tipo: "numero", secao: "5. Cálculo do PIB",
    texto: "🏭 Ótica da despesa, em R$ bilhões (tabela). Qual é o PIB?",
    tabela: { cabecalho: ["Componente", "R$ bi"], linhas: [["Consumo das famílias (C)", "600"], ["Investimento (I)", "200"], ["Gastos do governo (G)", "250"], ["Exportações (X)", "150"], ["Importações (M)", "200"]] },
    unidade: "R$ bi", gabarito: 1000,
    comentario: "PIB = C + I + G + (X − M) = 600 + 200 + 250 + (150 − 200) = 1.000. As importações entram com sinal negativo porque já estão contadas dentro de C, I e G, mas não foram produzidas no país." },

  { id: "m15", tipo: "mc", secao: "5. Cálculo do PIB",
    texto: "🏭 Qual destas transações ENTRA no PIB brasileiro deste ano?",
    opcoes: ["Um corte de cabelo feito hoje num salão em Brasília", "A compra de um carro usado fabricado em 2019", "O pagamento do Bolsa Família a uma família", "A farinha comprada pela padaria para fazer o pão que ela vende"], certa: 0,
    comentario: "Carro usado já entrou no PIB de 2019; transferência não remunera produção; a farinha é bem intermediário (já está no preço do pão). O corte de cabelo é serviço final produzido no ano." },

  // ---- 6. Capital físico e capital humano ----
  { id: "m16", tipo: "mc", secao: "6. Capital físico e humano",
    texto: "🛠️ Uma metalúrgica compra uma nova máquina de solda e, no mesmo mês, paga um curso técnico de soldagem para seus funcionários. Cada uma dessas decisões aumenta, respectivamente:",
    opcoes: ["Capital físico e capital humano", "Capital humano e capital físico", "Capital físico nas duas", "Recursos naturais e capital humano"], certa: 0,
    comentario: "Capital físico: equipamentos e estruturas usados para produzir. Capital humano: conhecimento e habilidades dos trabalhadores, adquiridos com educação, treinamento e experiência." },

  { id: "m17", reserva: true, tipo: "mc", secao: "6. Capital físico e humano",
    texto: "🛠️ Qual destes itens NÃO é capital físico?",
    opcoes: ["O conhecimento acumulado pelos engenheiros de uma empresa", "Uma rodovia", "Os computadores de um escritório", "O galpão de uma fábrica"], certa: 0,
    comentario: "Conhecimento dos trabalhadores é capital humano. Os dois tipos de capital elevam a produtividade e, portanto, o padrão de vida." },

  // ---- 7. Tipos de desemprego ----
  { id: "m18", tipo: "mc", fixa: true, secao: "7. Desemprego",
    texto: "👷 Ana se formou e passou três meses procurando a vaga que combinava com sua área, enquanto mandava currículos. Esse é um desemprego:",
    opcoes: ["Friccional", "Estrutural", "Cíclico (conjuntural)", "Sazonal"], certa: 0,
    comentario: "Tempo de busca e ajuste entre trabalhadores e vagas: existe mesmo com a economia em boa fase." },

  { id: "m19", tipo: "mc", fixa: true, secao: "7. Desemprego",
    texto: "👷 Bancos fecham agências e substituem caixas por aplicativos. Ex-caixas não têm as habilidades pedidas nas vagas abertas (programação, análise de dados). Esse é um desemprego:",
    opcoes: ["Friccional", "Estrutural", "Cíclico (conjuntural)", "Sazonal"], certa: 1,
    comentario: "Descompasso duradouro entre as habilidades dos trabalhadores e as vagas disponíveis (ou salários acima do equilíbrio)." },

  { id: "m20", tipo: "mc", fixa: true, secao: "7. Desemprego",
    texto: "👷 Em uma recessão, as vendas caem e as empresas demitem em praticamente todos os setores. Esse é um desemprego:",
    opcoes: ["Friccional", "Estrutural", "Cíclico (conjuntural)", "Sazonal"], certa: 2,
    comentario: "Acompanha o ciclo econômico: some quando a economia volta a crescer." },

  { id: "m21", reserva: true, tipo: "mc", secao: "7. Desemprego",
    texto: "👷 A TAXA NATURAL de desemprego é formada por:",
    opcoes: ["Desemprego friccional + estrutural", "Desemprego cíclico apenas", "Desemprego friccional + cíclico", "Todo o desemprego da economia"], certa: 0,
    comentario: "É o desemprego que persiste mesmo com a economia operando no seu nível normal; o cíclico é o desvio em relação a ela." },

  // ---- 8. Poupança e investimento em economia fechada ----
  { id: "m22", reserva: true, tipo: "numero", secao: "8. Poupança em economia fechada",
    texto: "🏦 Economia fechada e SEM governo: renda Y = 1.000 e consumo C = 700. Qual é a poupança (S)?",
    unidade: "R$ bi", gabarito: 300,
    comentario: "Sem governo: S = Y − C = 300. Em economia fechada, essa poupança financia o investimento: S = I." },

  { id: "m23", tipo: "numero", secao: "8. Poupança em economia fechada",
    texto: "🏦 Numa economia FECHADA (sem comércio com o exterior): renda Y = 1.000, consumo C = 650, impostos T = 150 e gastos do governo G = 200. Qual é a poupança NACIONAL?",
    unidade: "R$ bi", gabarito: 150,
    comentario: "Em economia fechada, Y = C + I + G, então S = Y − C − G = 1.000 − 650 − 200 = 150, e a poupança é igual ao investimento (S = I). Separando: poupança privada = Y − T − C = 200; poupança pública = T − G = −50 (déficit)." },

  { id: "m24", tipo: "mc", secao: "8. Poupança em economia fechada",
    texto: "🏦 Economia fechada. No mercado de fundos de empréstimo (gráfico), a curva crescente é a oferta de fundos (poupança nacional) e a decrescente é a demanda (investimento). O governo, que tinha orçamento equilibrado, passa a ter DÉFICIT. O que acontece?",
    opcoes: ["A oferta de fundos se desloca para a esquerda: os juros sobem e o investimento cai", "A demanda por fundos se desloca para a direita: juros e investimento sobem", "A oferta de fundos se desloca para a direita: os juros caem", "Nada muda, pois o déficit não afeta a poupança"], certa: 0,
    grafico: { xmin: 0, xmax: 20, ymin: 0, ymax: 10, xlabel: "Fundos (S, I)", ylabel: "Juros r (%)",
      curves: [
        { formula: "0.5*x", domain: [0, 20], color: "good", label: "S (poupança)", labelT: 0.72, labelDy: 14 },
        { formula: "10 - 0.5*x", domain: [0, 20], color: "acc", label: "I (investimento)", labelT: 0.8 }],
      points: [{ x: 10, y: 5, label: "E1", color: "good" }] },
    comentario: "O déficit é poupança pública negativa: reduz a poupança nacional (S = privada + pública), e a curva de oferta de fundos se desloca para a esquerda." },

  { id: "m24b", tipo: "mc", secao: "8. Poupança em economia fechada",
    texto: "🏦 O gráfico agora mostra a curva de poupança COM o déficit (tracejada). Comparando o novo equilíbrio E2 com o inicial E1, o que aconteceu com os juros e com o investimento privado?",
    opcoes: ["Juros subiram de 5% para 6% e o investimento caiu de 10 para 8", "Juros caíram de 5% para 4% e o investimento subiu de 10 para 12", "Juros subiram de 5% para 6% e o investimento também subiu", "Nada mudou: o governo apenas tomou o lugar das famílias"], certa: 0,
    grafico: { xmin: 0, xmax: 20, ymin: 0, ymax: 10, xlabel: "Fundos (S, I)", ylabel: "Juros r (%)",
      curves: [
        { formula: "0.5*x", domain: [0, 20], color: "good", label: "S sem déficit", labelT: 0.72, labelDy: 14 },
        { formula: "0.5*x + 2", domain: [0, 16], color: "bad", dashed: true, label: "S com déficit", labelT: 0.22 },
        { formula: "10 - 0.5*x", domain: [0, 20], color: "acc", label: "I (investimento)", labelT: 0.8 }],
      points: [{ x: 10, y: 5, label: "E1", color: "good" }, { x: 8, y: 6, label: "E2", color: "bad" }] },
    comentario: "Juros sobem (5% → 6%) e o investimento privado cai (10 → 8): é o efeito deslocamento (crowding out). Parte da poupança que financiaria empresas passa a financiar o governo." },

  { id: "m25", reserva: true, tipo: "texto", secao: "8. Poupança em economia fechada",
    texto: "🏦 Em uma frase: por que um déficit público persistente pode prejudicar o crescimento de longo prazo?",
    comentario: "Juros mais altos reduzem o investimento; com menos investimento, o estoque de capital cresce menos, e a produtividade e o padrão de vida crescem mais devagar." },

  // ---- Fechamento ----
  { id: "m26", reserva: true, tipo: "scale", secao: "Fechamento",
    texto: "O quanto você se sente pronto para a avaliação de Macroeconomia nesse conteúdo?",
    minLabel: "Nada pronto", maxLabel: "Totalmente pronto" }
];

// A sessão usa 20 perguntas. As marcadas com "reserva: true" ficam guardadas:
// para trazer uma de volta, basta apagar o "reserva: true" dela.
const PERGUNTAS = PERGUNTAS_TODAS.filter(p => !p.reserva);

// Embaralha as alternativas de cada pergunta "mc" com ordem FIXA (derivada do id),
// para a certa nao cair sempre na mesma posicao. Aluno e apresentador veem a mesma ordem,
// pois os votos sao gravados pelo indice da alternativa.
(function embaralharFixo() {
  PERGUNTAS.forEach(p => {
    if (p.tipo !== 'mc' || p.fixa) return;
    let h = 2166136261;
    for (const c of p.id + 'macro') { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
    const idx = p.opcoes.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    p.opcoes = idx.map(i => p.opcoes[i]);
    p.certa = idx.indexOf(p.certa);
  });
})();
