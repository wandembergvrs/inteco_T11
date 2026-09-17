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
    minLabel: "Nada pronto", maxLabel: "Totalmente pronto" }
];
