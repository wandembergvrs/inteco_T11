// Banco de perguntas — Revisão Módulo 1 (Micro) — INTECO
// Tipos suportados: "mc" (múltipla escolha) e "scale" (escala 1-5)
const PERGUNTAS = [
  { id: "q1", tipo: "mc", texto: "Um ponto DENTRO da fronteira de possibilidade de produção significa que a economia está:",
    opcoes: ["Usando todos os recursos eficientemente", "Subutilizando recursos", "Crescendo", "Em equilíbrio de mercado"], certa: 1 },

  { id: "q2", tipo: "mc", texto: "“O salário mínimo deveria ser maior” é um exemplo de análise:",
    opcoes: ["Positiva", "Normativa"], certa: 1 },

  { id: "q3", tipo: "scale", texto: "O quanto você se sente seguro com a diferença entre microeconomia e macroeconomia?",
    minLabel: "Nada seguro", maxLabel: "Totalmente seguro" },

  { id: "q4", tipo: "mc", texto: "Sobre vantagem comparativa: qual país tem vantagem comparativa no Bem X? (ver tabela mostrada em aula)",
    opcoes: ["País A", "País B", "Nenhum", "Os dois"], certa: 0 },

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
  { id: "q23", tipo: "mc", texto: "Quando um país passa a comercializar internacionalmente, ele consegue consumir combinações de bens que ficam:",
    opcoes: ["Dentro da sua FPP", "Exatamente sobre sua FPP", "Fora da sua FPP, na linha de possibilidades de consumo", "Na origem do gráfico"], certa: 2 },

  { id: "q24", tipo: "mc", texto: "A linha de possibilidades de consumo (com comércio) é traçada usando:",
    opcoes: ["Os custos de oportunidade internos do país", "Os preços relativos praticados no comércio internacional", "A curva de demanda interna", "O excedente do consumidor"], certa: 1 },

  { id: "q25", tipo: "mc", texto: "Sozinha, Marina produz no máximo 4 bolos por dia. Se ela trocar parte do seu trabalho por ingredientes no mercado, a um preço relativo diferente do seu custo de oportunidade, ela poderá consumir:",
    opcoes: ["Só o que ela mesma produz (4 bolos)", "Menos do que 4 bolos", "Mais do que ela conseguiria produzir sozinha", "É impossível saber sem mais dados"], certa: 2 },

  // ---- Excedente do consumidor e do produtor (forma discreta) ----
  { id: "q26", tipo: "mc", texto: "Quatro compradores têm disposição a pagar por um ingresso: Ana R$40, Bia R$30, Caio R$20, Duda R$10. Se o preço de mercado for R$25, quantos ingressos são vendidos e qual o excedente do consumidor total?",
    opcoes: ["1 ingresso; EC = R$15", "2 ingressos; EC = R$20", "3 ingressos; EC = R$30", "4 ingressos; EC = R$40"], certa: 1 },

  { id: "q27", tipo: "mc", texto: "Com os mesmos compradores (Ana R$40, Bia R$30, Caio R$20, Duda R$10), se o preço cair de R$25 para R$15, o que acontece com o excedente do consumidor?",
    opcoes: ["Aumenta — compradores pagam menos e um novo comprador entra no mercado", "Diminui", "Fica igual", "Não dá para saber sem a curva de oferta"], certa: 0 },

  { id: "q28", tipo: "mc", texto: "Três vendedores têm custo mínimo de produção: Léo R$5, Mel R$15, Rui R$25. Se o preço de mercado for R$20, qual o excedente do produtor total?",
    opcoes: ["R$5", "R$15", "R$20", "R$35"], certa: 2 },

  // ---- Três bens: complementares e substitutos ----
  { id: "q29", tipo: "mc", texto: "Carros (bem X), gasolina (complementar de X) e passagem de ônibus (substituto de X). Se o preço da gasolina cai bastante, o que tende a acontecer na demanda por carros?",
    opcoes: ["Aumenta (desloca para a direita)", "Diminui (desloca para a esquerda)", "Só a quantidade muda, ao longo da curva", "Nada muda"], certa: 0 },

  { id: "q30", tipo: "mc", texto: "Ainda com carros, gasolina (complementar) e ônibus (substituto): se o preço da gasolina cai, o que tende a acontecer na demanda por passagens de ônibus?",
    opcoes: ["Aumenta", "Diminui", "Não se altera", "Só a oferta de ônibus muda"], certa: 1 },

  { id: "q31", tipo: "mc", texto: "Café e açúcar são complementares; café e chá são substitutos. Uma quebra de safra faz o preço do café subir bastante. O que acontece nos mercados de açúcar e de chá?",
    opcoes: ["Demanda por açúcar cai; demanda por chá sobe", "Demanda por açúcar sobe; demanda por chá cai", "As duas demandas sobem", "As duas demandas caem"], certa: 0 },

  // ---- Cálculo de elasticidade ----
  { id: "q32", tipo: "mc", texto: "O preço de um bem sobe de R$10 para R$12, e a quantidade demandada cai de 100 para 80 unidades. Pelo método do ponto médio, a elasticidade-preço da demanda é aproximadamente:",
    opcoes: ["-0,5 (inelástica)", "-1,2 (elástica)", "-2,0 (elástica)", "0 (perfeitamente inelástica)"], certa: 1 },

  { id: "q33", tipo: "mc", texto: "A renda de um consumidor sobe 10% e a quantidade demandada de um bem sobe 4%. A elasticidade-renda desse bem é:",
    opcoes: ["0,4 — bem normal de necessidade", "2,5 — bem de luxo", "-0,4 — bem inferior", "10 — bem de luxo"], certa: 0 },

  { id: "q34", tipo: "mc", texto: "O preço do bem Y sobe 20% e a quantidade demandada do bem X cai 10%, dando elasticidade-cruzada de X em relação a Y igual a -0,5. Isso indica que X e Y são:",
    opcoes: ["Substitutos", "Complementares", "Bens independentes", "Bens de Giffen"], certa: 1 },

  // ---- Tragédia dos comuns (simulação ao vivo, não é múltipla escolha) ----
  { id: "q35", tipo: "numero", texto: "Simulação: este lago comunitário sustenta a pesca de até 100 peixes por ano, no total da turma. Pensando SÓ no seu ganho pessoal, quantos peixes você pescaria este ano?",
    min: 0, max: 50, unidade: "peixes/ano", sustentavel: 100 },

  { id: "q36", tipo: "numero", texto: "Agora existe uma cota individual de 5 peixes por pescador, fiscalizada por um guarda florestal. Quantos peixes você pescaria dentro dessa regra?",
    min: 0, max: 10, unidade: "peixes/ano" },

  { id: "q37", tipo: "texto", texto: "Em uma frase: qual solução (além da cota individual) você aplicaria para evitar a tragédia dos comuns nesse lago?" }
];
