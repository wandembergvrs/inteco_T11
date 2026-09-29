// Banco de perguntas — Revisão Módulo 1 (Micro) — INTECO
// Tipos suportados: "mc" (múltipla escolha) e "scale" (escala 1-5)
const PERGUNTAS = [
  { id: "q1", tipo: "mc", texto: "Um ponto DENTRO da fronteira de possibilidade de produção significa que a economia está:",
    opcoes: ["Usando todos os recursos eficientemente", "Subutilizando recursos", "Crescendo", "Em equilíbrio de mercado"], certa: 1 },

  { id: "q2", tipo: "mc", texto: "“O salário mínimo deveria ser maior” é um exemplo de análise:",
    opcoes: ["Positiva", "Normativa"], certa: 1 },

  { id: "q3", tipo: "scale", texto: "O quanto você se sente seguro com a diferença entre microeconomia e macroeconomia?",
    minLabel: "Nada seguro", maxLabel: "Totalmente seguro" },

  { id: "q4", tipo: "mc", texto: "País A, usando todos os seus recursos, produz no máximo 100 unidades do Bem X OU 50 do Bem Y. País B produz no máximo 60 do Bem X OU 20 do Bem Y. Qual país tem vantagem comparativa no Bem X?",
    opcoes: ["País A (custo de oportunidade do X é menor: 0,5Y por unidade)", "País B (custo de oportunidade do X é menor: 0,33Y por unidade)", "Nenhum — nenhum país tem vantagem absoluta nos dois bens", "Os dois, no mesmo grau"], certa: 1 },

  { id: "q5", tipo: "scale", texto: "O quanto você concorda: “um país só se beneficia do comércio se tiver vantagem absoluta em algo”?",
    minLabel: "Discordo totalmente (certa)", maxLabel: "Concordo totalmente" },

  { id: "q6", tipo: "mc", texto: "Um aumento na renda dos consumidores desloca a curva de demanda de um bem normal para:",
    opcoes: ["Direita", "Esquerda"], certa: 0 },

  { id: "q7", tipo: "mc", texto: "Uma queda no preço do insumo de produção desloca a curva de:",
    opcoes: ["Oferta, para a direita", "Demanda, para a direita"], certa: 0 },

  { id: "q8", tipo: "mc", texto: "Um movimento AO LONGO da curva de demanda é causado por:",
    opcoes: ["Mudança no preço do próprio bem", "Mudança na renda"], certa: 0 },

  { id: "q9", tipo: "mc", texto: "Se demanda e oferta aumentam simultaneamente, o que é certo sobre o novo equilíbrio?",
    opcoes: ["Quantidade sobe; preço é ambíguo", "Preço sobe; quantidade é ambígua", "Os dois caem", "Nada muda"], certa: 0 },

  { id: "q10", tipo: "mc", texto: "Um imposto sobre o vendedor desloca a curva de:",
    opcoes: ["Oferta, para a esquerda (para cima)", "Demanda, para a esquerda"], certa: 0 },

  { id: "q11", tipo: "scale", texto: "Classifique a elasticidade-preço da demanda de: Gasolina",
    minLabel: "Totalmente inelástico", maxLabel: "Totalmente elástico" },

  { id: "q12", tipo: "scale", texto: "Classifique a elasticidade-preço da demanda de: Sal de cozinha",
    minLabel: "Totalmente inelástico", maxLabel: "Totalmente elástico" },

  { id: "q13", tipo: "scale", texto: "Classifique a elasticidade-preço da demanda de: Carro de luxo",
    minLabel: "Totalmente inelástico", maxLabel: "Totalmente elástico" },

  { id: "q14", tipo: "scale", texto: "Classifique a elasticidade-preço da demanda de: Remédio de uso contínuo",
    minLabel: "Totalmente inelástico", maxLabel: "Totalmente elástico" },

  { id: "q15", tipo: "mc", texto: "Se a demanda é elástica e o preço sobe, a receita total do vendedor:",
    opcoes: ["Sobe", "Cai", "Não muda", "Depende da oferta"], certa: 1 },

  { id: "q16", tipo: "mc", texto: "Um preço-teto (tabelamento) abaixo do preço de equilíbrio tende a gerar:",
    opcoes: ["Excedente de oferta", "Escassez (Qd > Qs)", "Aumento do excedente total", "Nenhum efeito"], certa: 1 },

  { id: "q17", tipo: "mc", texto: "Um bem não-rival e não-excludente é chamado de:",
    opcoes: ["Bem público", "Bem privado", "Recurso comum", "Monopólio natural"], certa: 0 },

  { id: "q18", tipo: "mc", texto: "O “problema do carona” (free-rider) ocorre principalmente em bens:",
    opcoes: ["Excludentes", "Não-excludentes"], certa: 1 },

  { id: "q19", tipo: "mc", texto: "O Teorema de Coase funciona melhor quando os custos de negociação são:",
    opcoes: ["Altos", "Baixos"], certa: 1 },

  { id: "q20", tipo: "mc", texto: "A “Tragédia dos Comuns” ocorre em recursos que são:",
    opcoes: ["Rivais e excludentes", "Rivais e não-excludentes", "Não-rivais e excludentes", "Não-rivais e não-excludentes"], certa: 1 },

  { id: "q21", tipo: "scale", texto: "O quanto você concorda: “o Teorema de Coase resolve qualquer externalidade, bastando as partes negociarem”?",
    minLabel: "Discordo totalmente (certa)", maxLabel: "Concordo totalmente" },

  { id: "q22", tipo: "scale", texto: "O quanto você se sente pronto para o Controle 1 (06/10) nesse conteúdo?",
    minLabel: "Nada pronto", maxLabel: "Totalmente pronto" },

  // ---- Possibilidades de consumo (ganhos do comércio) ----
  { id: "q23", tipo: "mc",
    texto: "O gráfico mostra a FPP (Fronteira de Possibilidades de Produção) de um país. O ponto azul é onde ele PRODUZ hoje, sem comércio. O ponto verde é onde ele passa a CONSUMIR depois de abrir comércio internacional. Como isso é possível, se o ponto verde está fora da fronteira de produção?",
    opcoes: ["É um erro no gráfico — não é possível consumir fora da FPP", "O país exporta parte do Bem A que produz e importa o Bem B, trocando pelos preços mundiais", "O país aumentou seus recursos internamente", "O ponto verde representa produção futura, não consumo"],
    certa: 1,
    grafico: { xmin: 0, xmax: 10, ymin: 0, ymax: 10, xlabel: "Bem A", ylabel: "Bem B",
      curves: [{ formula: "sqrt(100 - x^2)", domain: [0, 10], color: "acc", label: "FPP" }],
      points: [{ x: 6, y: 8, label: "Produção", color: "acc" }, { x: 8, y: 8, label: "Consumo (com comércio)", color: "good" }] } },

  { id: "q24", tipo: "mc", texto: "No mesmo gráfico da pergunta anterior, a linha que ligaria o ponto de produção ao ponto de consumo (a \"linha de possibilidades de consumo\") é traçada usando:",
    opcoes: ["Os custos de oportunidade internos do próprio país", "Os preços relativos praticados no comércio internacional", "A curva de demanda interna do país", "O excedente do consumidor"], certa: 1 },

  { id: "q25", tipo: "mc", texto: "Sozinha, a confeiteira Marina produz no máximo 4 bolos por dia com seus próprios ingredientes. Ela decide trocar parte do seu trabalho por ingredientes no mercado, a um preço relativo diferente do seu custo de oportunidade. O que acontece com o quanto ela consegue consumir?",
    opcoes: ["Continua limitada a 4 bolos (o que ela mesma produz)", "Passa a conseguir MENOS do que 4 bolos", "Passa a conseguir MAIS do que conseguiria produzindo sozinha", "É impossível saber sem mais dados"], certa: 2 },

  // ---- Excedente do consumidor e do produtor (forma discreta) ----
  { id: "q26", tipo: "mc",
    texto: "Um show tem só 4 pessoas interessadas em comprar ingresso, cada uma com uma disposição máxima a pagar (gráfico: bolinhas = compradores, linha vermelha = preço do ingresso). Com o preço em R$25, quantos ingressos são vendidos e qual o excedente do consumidor total?",
    opcoes: ["1 ingresso; EC = R$15", "2 ingressos; EC = R$20", "3 ingressos; EC = R$30", "4 ingressos; EC = R$40"], certa: 1,
    grafico: { xmin: 0, xmax: 5, ymin: 0, ymax: 45, xlabel: "Comprador", ylabel: "Disp. a pagar (R$)",
      points: [{ x: 1, y: 40, label: "Ana", color: "acc" }, { x: 2, y: 30, label: "Bia", color: "acc" }, { x: 3, y: 20, label: "Caio", color: "acc" }, { x: 4, y: 10, label: "Duda", color: "acc" }],
      hlines: [{ y: 25, color: "bad", label: "Preço R$25" }] } },

  { id: "q27", tipo: "mc",
    texto: "Mesmos 4 compradores do show (Ana R$40, Bia R$30, Caio R$20, Duda R$10). O organizador baixa o preço do ingresso de R$25 para R$15 (linha vermelha no gráfico). O que acontece com o excedente do consumidor?",
    opcoes: ["Aumenta — compradores pagam menos e Caio (que antes ficou de fora) agora entra no mercado", "Diminui", "Fica igual", "Não dá para saber sem a curva de oferta"], certa: 0,
    grafico: { xmin: 0, xmax: 5, ymin: 0, ymax: 45, xlabel: "Comprador", ylabel: "Disp. a pagar (R$)",
      points: [{ x: 1, y: 40, label: "Ana", color: "acc" }, { x: 2, y: 30, label: "Bia", color: "acc" }, { x: 3, y: 20, label: "Caio", color: "acc" }, { x: 4, y: 10, label: "Duda", color: "acc" }],
      hlines: [{ y: 15, color: "bad", label: "Preço R$15" }] } },

  { id: "q28", tipo: "mc",
    texto: "Do lado da oferta: 3 artesãos vendem o mesmo tipo de vaso, cada um com um custo mínimo de produção diferente (gráfico). Se o preço de mercado for R$20 (linha verde), qual o excedente do produtor total?",
    opcoes: ["R$5", "R$15", "R$20", "R$35"], certa: 2,
    grafico: { xmin: 0, xmax: 4, ymin: 0, ymax: 30, xlabel: "Vendedor", ylabel: "Custo mínimo (R$)",
      points: [{ x: 1, y: 5, label: "Léo", color: "warn" }, { x: 2, y: 15, label: "Mel", color: "warn" }, { x: 3, y: 25, label: "Rui", color: "warn" }],
      hlines: [{ y: 20, color: "good", label: "Preço R$20" }] } },

  // ---- Três bens: complementares e substitutos ----
  { id: "q29", tipo: "mc",
    texto: "Três mercados interligados: carros (bem X), gasolina (complementar de X — usados juntos) e passagem de ônibus (substituto de X — uma alternativa ao carro). Se o preço da gasolina cai bastante, o gráfico mostra o que tende a acontecer com a demanda por carros:",
    opcoes: ["A demanda desloca para a DIREITA (D0 → D1), como no gráfico: dirigir ficou mais barato", "A demanda desloca para a esquerda", "Só a quantidade muda, ao longo da mesma curva", "Nada muda"], certa: 0,
    grafico: { xmin: 0, xmax: 10, ymin: 0, ymax: 12, xlabel: "Q (carros)", ylabel: "P",
      curves: [{ formula: "10 - x", domain: [0, 10], color: "acc", label: "D₀", labelT: 0.3, labelDy: -8 },
               { formula: "13 - x", domain: [3, 10], color: "good", dashed: true, label: "D₁", labelT: 0.15, labelDy: -8 }] } },

  { id: "q30", tipo: "mc",
    texto: "Ainda os três mercados (carros, gasolina complementar, ônibus substituto): se a gasolina fica mais barata e mais gente passa a usar carro, o gráfico mostra o que tende a acontecer na demanda por passagens de ônibus:",
    opcoes: ["Aumenta (desloca para a direita)", "Diminui (desloca para a ESQUERDA, D0 → D1), como no gráfico: ônibus perde passageiros para o carro", "Não se altera", "Só a oferta de ônibus muda"], certa: 1,
    grafico: { xmin: 0, xmax: 10, ymin: 0, ymax: 12, xlabel: "Q (passagens)", ylabel: "P",
      curves: [{ formula: "10 - x", domain: [0, 10], color: "acc", label: "D₀", labelT: 0.3, labelDy: -8 },
               { formula: "7 - x", domain: [0, 7], color: "bad", dashed: true, label: "D₁", labelT: 0.15, labelDy: -8 }] } },

  { id: "q31", tipo: "mc", texto: "Café e açúcar são complementares (tomados juntos); café e chá são substitutos (uma alternativa ao outro). Uma quebra de safra faz o preço do café disparar. O que tende a acontecer nos mercados de açúcar e de chá?",
    opcoes: ["Demanda por açúcar CAI (menos café = menos açúcar usado com ele); demanda por chá SOBE (vira alternativa ao café caro)", "Demanda por açúcar sobe; demanda por chá cai", "As duas demandas sobem", "As duas demandas caem"], certa: 0 },

  // ---- Cálculo de elasticidade ----
  { id: "q32", tipo: "mc",
    texto: "Uma loja sobe o preço de um produto de R$10 para R$12, e a quantidade demandada cai de 100 para 80 unidades (pontos no gráfico). Pelo método do ponto médio, a elasticidade-preço da demanda nesse trecho é aproximadamente:",
    opcoes: ["-0,5 (inelástica)", "-1,2 (elástica)", "-2,0 (elástica)", "0 (perfeitamente inelástica)"], certa: 1,
    grafico: { xmin: 60, xmax: 110, ymin: 0, ymax: 20, xlabel: "Q", ylabel: "P",
      curves: [{ formula: "20 - 0.1*x", domain: [60, 110], color: "acc" }],
      points: [{ x: 100, y: 10, label: "Inicial", color: "good" }, { x: 80, y: 12, label: "Novo", color: "bad" }] } },

  { id: "q33", tipo: "mc", texto: "A renda de um consumidor sobe 10% num mês, e a quantidade que ele compra de um certo bem sobe 4% no mesmo período. A elasticidade-renda da demanda desse bem é:",
    opcoes: ["0,4 — bem normal de necessidade (cresce menos que a renda)", "2,5 — bem de luxo", "-0,4 — bem inferior", "10 — bem de luxo"], certa: 0 },

  { id: "q34", tipo: "mc", texto: "Quando o preço da manteiga (bem Y) sobe 20%, a quantidade demandada de pão (bem X) cai 10% — uma elasticidade-cruzada de -0,5. Isso indica que pão e manteiga são:",
    opcoes: ["Substitutos", "Complementares (o sinal negativo mostra que andam juntos)", "Bens independentes", "Bens de Giffen"], certa: 1 },

  // ---- Tragédia dos comuns (simulação ao vivo, não é múltipla escolha) ----
  { id: "q35", tipo: "numero",
    texto: "🎣 Simulação — Você e seus colegas de turma são pescadores de um mesmo lago comunitário, sem dono e sem fiscalização. Cientistas calcularam que o lago só se regenera se, juntos, vocês tirarem no máximo 100 peixes por ano. Pensando SÓ no seu próprio ganho (mais peixe = mais dinheiro pra você), quantos peixes você pescaria este ano?",
    min: 0, max: 50, unidade: "peixes/ano", sustentavel: 100 },

  { id: "q36", tipo: "numero",
    texto: "🎣 Segunda rodada — Depois de ver o resultado anterior, a prefeitura criou uma cota individual de 5 peixes por pescador, fiscalizada por um guarda florestal (quem pescar mais é multado). Quantos peixes você pescaria agora, dentro dessa regra?",
    min: 0, max: 10, unidade: "peixes/ano" },

  { id: "q37", tipo: "texto", texto: "🎣 Em uma frase: além da cota fiscalizada, que OUTRA solução você aplicaria para evitar a tragédia dos comuns nesse lago (pense em quem poderia ser dono dele, ou em outro tipo de acordo entre os pescadores)?" }
];
