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

  { id: "m2b", tipo: "mc", secao: "1. Câmbio nominal",
    texto: "💱 Agora o caminho inverso: o dólar CAI de R$ 5,50 para R$ 5,00. O que aconteceu com o real, e quem tende a sair ganhando?",
    opcoes: ["O real se VALORIZOU; ganha quem importa ou viaja para o exterior", "O real se VALORIZOU; ganha o exportador, que recebe em dólar", "O real se DESVALORIZOU; ganha quem importa ou viaja para o exterior", "O real se DESVALORIZOU; ganha o exportador, que recebe em dólar"], certa: 0,
    comentario: "Menos reais por dólar = real mais forte (valorizado). Tudo que é cotado em dólar fica mais barato em reais: importados, viagens, dívidas em dólar. O exportador recebe menos reais por dólar vendido." },

  { id: "m2c", tipo: "numero", secao: "1. Câmbio nominal",
    texto: "💱 Um celular custa US$ 200 numa loja dos EUA. Com o dólar a R$ 5,50, quanto ele custa em reais (sem impostos nem frete)?",
    unidade: "R$", gabarito: 1100,
    comentario: "Preço em reais = preço em dólares × taxa de câmbio = 200 × 5,50 = R$ 1.100. Se o dólar subisse para R$ 6,00, o mesmo celular passaria a custar R$ 1.200." },

  // ---- 2. Paridade do poder de compra e índice Big Mac ----
  { id: "m3", tipo: "numero", secao: "2. PPC e índice Big Mac",
    texto: "🍔 Um hambúrguer custa R$ 25,00 no Brasil. Nos EUA, o mesmo hambúrguer custa US$ 5,00. Pela paridade do poder de compra (PPC), qual deveria ser a taxa de câmbio (R$ por US$)?",
    unidade: "R$ por US$", gabarito: 5,
    comentario: "PPC: e = P(Brasil) / P(EUA) = 25 / 5 = R$ 5,00 por dólar. É a taxa que faz o mesmo bem custar o mesmo nos dois países." },

  { id: "m4", tipo: "mc", secao: "2. PPC e índice Big Mac",
    texto: "🍔 A PPC aponta R$ 5,00 por dólar, mas o câmbio de mercado está em R$ 5,50. Um americano troca US$ 5,00 e recebe R$ 27,50, mais do que os R$ 25,00 que o hambúrguer custa no Brasil. Pela lógica do índice Big Mac, o real está:",
    opcoes: ["Subvalorizado (barato demais) em relação ao dólar", "Sobrevalorizado (caro demais) em relação ao dólar", "Exatamente na paridade", "A PPC não permite comparar"], certa: 0,
    comentario: "Em dólares, o hambúrguer brasileiro sai a 25 / 5,50 = US$ 4,55, abaixo dos US$ 5,00 dos EUA. O real está cerca de 9% subvalorizado pelo critério da PPC." },

  { id: "m4b", tipo: "mc", secao: "2. PPC e índice Big Mac",
    texto: "🍔 Outro país, mesma lógica: o hambúrguer custa 30 pesos lá e US$ 5,00 nos EUA, então a PPC aponta 6 pesos por dólar. Mas o câmbio de mercado está em 4 pesos por dólar. Pela PPC, o peso está:",
    opcoes: ["Sobrevalorizado (caro demais) em relação ao dólar", "Subvalorizado (barato demais) em relação ao dólar", "Exatamente na paridade", "A PPC não permite comparar"], certa: 0,
    comentario: "Em dólares, o hambúrguer desse país sai a 30 / 4 = US$ 7,50, acima dos US$ 5,00 dos EUA. O país está caro em dólar: a moeda está sobrevalorizada. Regra prática: câmbio de mercado ABAIXO da PPC = moeda sobrevalorizada; ACIMA = subvalorizada." },

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

  { id: "m9b", tipo: "numero", secao: "3. Inflação",
    texto: "📈 O índice de preços ao consumidor passou de 200 em dezembro de um ano para 210 em dezembro do ano seguinte. De quanto foi a inflação do período, em %?",
    unidade: "%", gabarito: 5,
    comentario: "Inflação = variação percentual do índice de preços = (210 − 200) / 200 = 5%. A inflação é a alta do NÍVEL GERAL de preços, não a de um produto isolado." },

  { id: "m9c", tipo: "numero", secao: "3. Inflação",
    texto: "📈 Uma aplicação rendeu 10% no ano (juros nominais). No mesmo ano, a inflação foi de 4%. De aproximadamente quanto foi o juro REAL, em %?",
    unidade: "%", gabarito: 6, tolerancia: 0.3,
    comentario: "Juro real ≈ juro nominal − inflação = 10% − 4% = 6% (a conta exata dá 1,10 / 1,04 − 1 = 5,8%). O juro real mede o quanto o PODER DE COMPRA de quem aplicou aumentou." },

  { id: "m9d", tipo: "mc", secao: "3. Inflação",
    texto: "📈 João emprestou dinheiro a Maria a juros FIXOS de 8% ao ano, quando todos esperavam inflação de 4%. A inflação acabou sendo de 10%. Quem saiu ganhando com essa inflação inesperada?",
    opcoes: ["Maria (a devedora): ela paga a dívida com um dinheiro que vale menos", "João (o credor): ele recebe mais juros do que esperava", "Os dois ganham, porque os preços subiram para todos", "Ninguém: a inflação não afeta contratos com juros fixos"], certa: 0,
    comentario: "O juro real combinado era de cerca de 4% (8 − 4), mas virou cerca de −2% (8 − 10). Inflação inesperada transfere riqueza do credor para o devedor." },

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

  { id: "m15b", tipo: "numero", secao: "5. Cálculo do PIB",
    texto: "🏭 Uma economia só produz pão, em três etapas (tabela). Qual é o PIB dessa economia, em R$?",
    tabela: { cabecalho: ["Etapa", "Venda"], linhas: [["Fazendeiro vende trigo ao moinho", "R$ 100"], ["Moinho vende farinha à padaria", "R$ 250"], ["Padaria vende pão às famílias", "R$ 400"]] },
    unidade: "R$", gabarito: 400,
    comentario: "O PIB conta só o bem FINAL: R$ 400. Somar as três vendas (750) contaria o trigo três vezes e a farinha duas. Dá o mesmo pelo valor adicionado: 100 (fazendeiro) + 150 (moinho) + 150 (padaria) = 400." },

  { id: "m15c", tipo: "mc", secao: "5. Cálculo do PIB",
    texto: "🏭 Qual destas atividades NÃO entra no PIB, embora gere bem-estar?",
    opcoes: ["O trabalho doméstico não remunerado, como cozinhar para a própria família", "A consulta paga a um médico particular", "A construção de uma casa nova", "O salário de um professor da rede pública"], certa: 0,
    comentario: "O PIB mede a produção vendida no mercado (mais os serviços do governo, pelo custo). Trabalho doméstico não remunerado, lazer e qualidade do meio ambiente ficam de fora: por isso o PIB é uma boa medida de produção, mas imperfeita de bem-estar." },

  // ---- 6. Capital físico e capital humano ----
  { id: "m16", tipo: "mc", secao: "6. Capital físico e humano",
    texto: "🛠️ Uma metalúrgica compra uma nova máquina de solda e, no mesmo mês, paga um curso técnico de soldagem para seus funcionários. Cada uma dessas decisões aumenta, respectivamente:",
    opcoes: ["Capital físico e capital humano", "Capital humano e capital físico", "Capital físico nas duas", "Recursos naturais e capital humano"], certa: 0,
    comentario: "Capital físico: equipamentos e estruturas usados para produzir. Capital humano: conhecimento e habilidades dos trabalhadores, adquiridos com educação, treinamento e experiência." },

  { id: "m17", reserva: true, tipo: "mc", secao: "6. Capital físico e humano",
    texto: "🛠️ Qual destes itens NÃO é capital físico?",
    opcoes: ["O conhecimento acumulado pelos engenheiros de uma empresa", "Uma rodovia", "Os computadores de um escritório", "O galpão de uma fábrica"], certa: 0,
    comentario: "Conhecimento dos trabalhadores é capital humano. Os dois tipos de capital elevam a produtividade e, portanto, o padrão de vida." },

  { id: "m17b", tipo: "mc", secao: "6. Capital físico e humano",
    texto: "🛠️ Dois países têm o mesmo número de trabalhadores, mas no país A cada trabalhador produz o dobro do que produz no país B. Qual destas explicações NÃO ajuda a entender a diferença de produtividade?",
    opcoes: ["O país A tem mais moeda em circulação", "O país A tem mais máquinas e equipamentos por trabalhador", "Os trabalhadores do país A têm mais escolaridade e treinamento", "O país A usa tecnologias de produção mais avançadas"], certa: 0,
    comentario: "A produtividade depende de capital físico, capital humano, recursos naturais e conhecimento tecnológico. Imprimir mais moeda não aumenta o que cada trabalhador produz: no longo prazo, só eleva os preços." },

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

  { id: "m21b", tipo: "numero", secao: "7. Desemprego",
    texto: "👷 Numa cidade (tabela), qual é a TAXA DE DESEMPREGO, em %?",
    tabela: { cabecalho: ["Situação", "Pessoas"], linhas: [["Ocupadas (trabalhando)", "90"], ["Desocupadas (sem trabalho e procurando)", "10"], ["Fora da força de trabalho (estudantes, aposentados...)", "50"]] },
    unidade: "%", gabarito: 10,
    comentario: "Força de trabalho = ocupados + desocupados = 90 + 10 = 100. Taxa de desemprego = desocupados / força de trabalho = 10 / 100 = 10%. Quem está fora da força de trabalho não entra na conta (dividir por 150 é o erro mais comum)." },

  { id: "m21c", tipo: "mc", secao: "7. Desemprego",
    texto: "👷 Pedro perdeu o emprego, procurou vaga por um ano e, desanimado, DESISTIU de procurar. Para as estatísticas, Pedro agora é:",
    opcoes: ["Fora da força de trabalho (desalentado): não conta como desempregado", "Desempregado, e por isso a taxa de desemprego sobe", "Ocupado, porque ainda pode voltar a trabalhar", "Desempregado friccional"], certa: 0,
    comentario: "Só é desempregado quem NÃO tem trabalho e ESTÁ PROCURANDO. Quando alguém desiste de procurar, sai da força de trabalho, e a taxa de desemprego pode até cair sem que ninguém tenha conseguido emprego." },

  // ---- 8. Poupança e investimento em economia fechada ----
  // Sequência em quatro passos, com os mesmos dados: privada -> pública -> nacional -> investimento.
  { id: "m23p", tipo: "numero", secao: "8. Poupança em economia fechada",
    texto: "🏦 Passo 1 de 4 — Economia FECHADA (sem comércio com o exterior), dados na tabela. A poupança PRIVADA é o que sobra para as famílias depois de pagar impostos e consumir. Quanto é a poupança privada?",
    tabela: { cabecalho: ["Dado", "R$ bi"], linhas: [["Renda (PIB), Y", "1.000"], ["Consumo das famílias, C", "650"], ["Impostos, T", "150"], ["Gastos do governo, G", "200"]] },
    unidade: "R$ bi", gabarito: 200,
    comentario: "Poupança privada = renda − impostos − consumo = Y − T − C = 1.000 − 150 − 650 = 200. É a poupança das famílias e empresas." },

  { id: "m23g", tipo: "mc", secao: "8. Poupança em economia fechada",
    texto: "🏦 Passo 2 de 4 — Mesmos dados (tabela). A poupança PÚBLICA é o que sobra para o governo: o que ele arrecada menos o que ele gasta. Qual é a situação do governo?",
    tabela: { cabecalho: ["Dado", "R$ bi"], linhas: [["Renda (PIB), Y", "1.000"], ["Consumo das famílias, C", "650"], ["Impostos, T", "150"], ["Gastos do governo, G", "200"]] },
    opcoes: ["Déficit de 50: a poupança pública é NEGATIVA (−50)", "Superávit de 50: a poupança pública é positiva (+50)", "Orçamento equilibrado: a poupança pública é zero", "Déficit de 200, que é o total dos gastos do governo"], certa: 0,
    comentario: "Poupança pública = impostos − gastos do governo = T − G = 150 − 200 = −50. O governo gasta mais do que arrecada: tem déficit, e precisa tomar 50 emprestados." },

  { id: "m23", tipo: "numero", secao: "8. Poupança em economia fechada",
    texto: "🏦 Passo 3 de 4 — A poupança NACIONAL é a soma das duas: poupança privada (200) + poupança pública (−50). Quanto é a poupança nacional?",
    tabela: { cabecalho: ["Dado", "R$ bi"], linhas: [["Renda (PIB), Y", "1.000"], ["Consumo das famílias, C", "650"], ["Impostos, T", "150"], ["Gastos do governo, G", "200"]] },
    unidade: "R$ bi", gabarito: 150,
    comentario: "Poupança nacional = privada + pública = 200 + (−50) = 150. Dá o mesmo pelo atalho S = Y − C − G = 1.000 − 650 − 200 = 150: é a parte da renda que não foi consumida nem pelas famílias nem pelo governo." },

  { id: "m23i", tipo: "numero", secao: "8. Poupança em economia fechada",
    texto: "🏦 Passo 4 de 4 — Nessa economia FECHADA, tudo o que é produzido vira consumo, investimento ou gasto do governo (Y = C + I + G). Com Y = 1.000, C = 650 e G = 200, quanto é o INVESTIMENTO (I)?",
    tabela: { cabecalho: ["Dado", "R$ bi"], linhas: [["Renda (PIB), Y", "1.000"], ["Consumo das famílias, C", "650"], ["Impostos, T", "150"], ["Gastos do governo, G", "200"]] },
    unidade: "R$ bi", gabarito: 150,
    comentario: "I = Y − C − G = 1.000 − 650 − 200 = 150, exatamente a poupança nacional. Em economia fechada, POUPANÇA = INVESTIMENTO (S = I): as empresas só podem investir o que o país poupou, porque não há como tomar emprestado do exterior. Dos 200 poupados pelas famílias, 50 financiam o déficit do governo e 150 financiam o investimento." },

  { id: "m24", tipo: "mc", secao: "8. Poupança em economia fechada",
    texto: "🏦 Economia fechada. No mercado de fundos de empréstimo (gráfico), a curva crescente é a oferta de fundos (poupança nacional) e a decrescente é a demanda (investimento). O governo gasta mais sem arrecadar mais, e o DÉFICIT público AUMENTA. O que acontece com as curvas?",
    opcoes: ["A oferta de fundos se desloca para a esquerda: os juros sobem e o investimento cai", "A demanda por fundos se desloca para a direita: juros e investimento sobem", "A oferta de fundos se desloca para a direita: os juros caem", "Nada muda, pois o déficit não afeta a poupança"], certa: 0,
    grafico: { xmin: 0, xmax: 20, ymin: 0, ymax: 10, xlabel: "Fundos (S, I)", ylabel: "Juros r (%)",
      curves: [
        { formula: "0.5*x", domain: [0, 20], color: "good", label: "S (poupança)", labelT: 0.72, labelDy: 14 },
        { formula: "10 - 0.5*x", domain: [0, 20], color: "acc", label: "I (investimento)", labelT: 0.8 }],
      points: [{ x: 10, y: 5, label: "E1", color: "good" }] },
    comentario: "O déficit é poupança pública negativa: quando ele aumenta, a poupança nacional (privada + pública) cai, e a curva de poupança se desloca para a ESQUERDA. A curva de investimento não se move." },

  { id: "m24b", tipo: "mc", secao: "8. Poupança em economia fechada",
    texto: "🏦 O gráfico mostra o DESLOCAMENTO da curva de poupança depois do aumento do déficit público: de S1 para S2 (tracejada). Comparando o novo equilíbrio E2 com o inicial E1, o que aconteceu com os juros e com o investimento privado?",
    opcoes: ["Juros subiram de 5% para 6% e o investimento caiu de 10 para 8", "Juros caíram de 5% para 4% e o investimento subiu de 10 para 12", "Juros subiram de 5% para 6% e o investimento também subiu", "Nada mudou: o governo apenas tomou o lugar das famílias"], certa: 0,
    grafico: { xmin: 0, xmax: 20, ymin: 0, ymax: 10, xlabel: "Fundos (S, I)", ylabel: "Juros r (%)",
      curves: [
        { formula: "0.5*x", domain: [0, 20], color: "good", label: "S1 (antes)", labelT: 0.72, labelDy: 14 },
        { formula: "0.5*x + 2", domain: [0, 16], color: "bad", dashed: true, label: "S2 (déficit maior)", labelT: 0.3, labelDy: -10 },
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
