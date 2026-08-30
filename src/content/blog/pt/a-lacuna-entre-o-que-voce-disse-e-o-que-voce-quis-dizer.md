---
title: 'A lacuna entre o que você disse e o que você quis dizer'
description: 'A extrapolação é toda a razão para você usar um agente — e todo o risco de usá-lo, porque os dois são o mesmo mecanismo. Então a pergunta nunca é como impedi-la: é onde ela deve ser ampla e onde precisa ser estreita.'
pubDate: 'Aug 13 2026 22:00'
translationOf: 'the-gap-between-what-you-said-and-what-you-meant'
series: 'you-are-now-the-whole-team'
seriesPart: 3
tags: ['engenharia com ia', 'ia', 'engenharia de software']
draft: false
---

[Da última vez](article:the-terminal-i-could-not-build) falei sobre um terminal
que eu queria havia anos, por que nunca tinha conseguido tirá-lo do papel e por
que um agente é a razão de ele existir. E terminei com uma recusa: eu tinha a
ferramenta, tinha o design na cabeça, e não pedi que ele saísse escrevendo
código.

Vou explicar essa recusa agora, porque ela é a base de tudo o que vou escrever
daqui em diante, e é o tipo de coisa que quase nunca vejo alguém explicando por
aí.

Vamos falar sobre extrapolação.

(Se você caiu aqui de paraquedas, tranquilo. Você só precisa da afirmação que
fico repetindo: que construir software profissional com um agente pede *mais* de
você, não menos. O que vem a seguir é a engrenagem por trás disso, e ela se
sustenta sozinha.)

## Por que você usa um agente, afinal

Vamos começar com uma pergunta que parece boba: para que serve um agente, na
prática?

A resposta óbvia é "ele escreve o código para eu não precisar escrever".
Verdade, mas pouco útil. Vamos descer um nível.

Você descreve algo. O agente gera algo. E o que ele gera é sempre,
inevitavelmente, **mais específico do que o que você descreveu.**

Você disse "adicione uma tela de configurações". Não disse o que acontece quando
um valor é inválido, onde o arquivo é salvo, se ele grava ao mudar ou ao fechar,
o que a mensagem de erro diz, ou se a coisa toda é uma struct ou cinco. Mas o
código precisa responder a todas essas perguntas, porque código não aceita
ambiguidade. Então o agente tomou vinte ou trinta decisões no espaço entre a sua
frase e o arquivo que ele escreveu.

Esse espaço — entre o que você disse e o que você *quis* dizer — é o produto
inteiro. É isso que você está comprando. Vamos chamar esse preenchimento de
**extrapolação**.

E agora a parte que vale a pena remoer:

> **Se um agente não pudesse extrapolar, ele seria inútil para você.**

Pense comigo. Se você tivesse que declarar cada regra, cada ramificação, cada
convenção, cada caso de erro de forma exaustiva e inequívoca, sem deixar nada
para ser inferido... você não estaria fazendo prompt. Estaria *programando*.
Programar sempre foi isso: fechar essa lacuna até o zero, à mão, numa linguagem
incapaz de interpretar você mal.

Portanto, a extrapolação não é um efeito colateral de usar um agente. É todo o
valor.

O que significa — e essa foi a ficha que demorei um pouco para virar — que **ela
é também o risco inteiro, exatamente pelo mesmo motivo.** Não dá para ter um lado
sem o outro. Não existe configuração que entregue a inferência útil sem trazer a
inferência indesejada junto, porque as duas são o mesmo mecanismo.

## Um agente sem limites não extrapola "só um pouquinho"

É aqui que a coisa desanda.

Suponha que você dê uma tarefa a um agente e mais nada. Ele não vai extrapolar
com cuidado as coisas pequenas e deixar as grandes em paz. Por que faria isso?
Ele não tem como saber a diferença. Então ele extrapola *tudo* — a arquitetura,
as camadas, a nomenclatura, o tratamento de erros, o propósito de um teste, se
aquilo merece um arquivo novo ou se aquela duplicação de código importa.

Com confiança. Com educação. De um jeito que se lê bem.

E quero defendê-lo por um instante, porque a reação normal é tratar isso como um
defeito da máquina — e não é.

Pegue um bom engenheiro — um genuinamente bom — e solte-o num repositório que ele
nunca viu na vida, com um ticket de uma linha, nenhuma convenção documentada e
ninguém a quem perguntar. O que você recebe? Vinte decisões que você nunca
mencionou, cada uma localmente razoável, mas várias erradas para a *sua* base de
código de um jeito que vai cobrar o preço daqui a três semanas.

A gente chama isso de falha de caráter do dev? Não. Chama de falta de
*onboarding*. Com o agente é a mesma coisa.

Vou colocar de outro jeito, porque gosto de explicar as coisas pela vida comum.

Você pede a alguém para dar uma geral na sua cozinha. Se a pessoa for boa, vai
tomar decisões que você nem mencionou: vai notar a panela queimada que você tinha
esquecido e esfregar até sair, vai jogar fora aquele pote no fundo da geladeira
que virou projeto de ciências. Excelente. Foi por isso que você chamou uma pessoa,
e não um braço robótico parafusado no balcão. Se tivesse que especificar cada um
desses detalhes, você mesmo já teria arrumado a cozinha.

Mas ela também vai decidir em qual armário as panelas vão ficar.

E essa decisão não parece errada no momento em que é tomada. Pode até ser
objetivamente melhor que o seu arranjo anterior. Ainda assim sai caro, porque
outras três pessoas naquela casa têm memória muscular, e você paga por isso toda
manhã durante um mês, e ninguém liga o custo de volta à arrumação.

Mesmo ato. Mesma competência. Consequências totalmente diferentes. A diferença
não é o *quanto* extrapolaram — é *onde*.

## Então a pergunta nunca é "como impedir isso?"

As pessoas tentam. Escrevem prompts gigantescos, colocam "não faça nada além do
que pedi", ficam frustradas. Mas não dá para pedir inferência e ausência de
inferência ao mesmo tempo — e se você conseguisse, estaria apenas programando de
novo, devagar, em inglês.

A pergunta de verdade é esta:

> **Onde a extrapolação deve ser ampla, e onde ela precisa ser estreita?**

**Ampla** é onde você a quer. Resolvendo o problema. Escolhendo o algoritmo.
Notando o caso em que você não tinha pensado. Esfregando a panela.

**Estreita** é onde errar custa caro e é difícil de perceber. A arquitetura. As
camadas. O que "pronto" significa. O que não pode mudar sem uma conversa. Em qual
armário as panelas vão ficar.

E aí vem a consequência desconfortável, aquela sobre a qual tudo o que escrevo
aqui trata, de verdade: **essa decisão precisa ser tomada com antecedência.**
Quando ela passa a importar, o código já está escrito. Não dá para resolver isso
no *code review*, porque revisar mil decisões localmente razoáveis não é algo que
uma pessoa cansada consiga fazer numa terça-feira à noite.

## O que "estreita" quer dizer na prática

Vou parar de ser abstrato, porque "defina um limite" é o tipo de conselho que soa
sábio e não diz nada.

Aqui vai um exemplo real. Está no `CLAUDE.md` do `acter`, o arquivo que o agente
lê no começo de toda sessão, e esteve lá desde a primeira noite. Esses arquivos
vivem em inglês — o idioma em que trabalho com os agentes — e as citações a
seguir estão reproduzidas exatamente como aparecem:

> Items marked **Decided** in the docs are settled. Do not relitigate them
> silently; to change one, propose it explicitly and update the doc in the same
> PR that implements the change.

Três linhas. Vou abrir o porquê de estarem ali, porque a razão não é a que você
imagina.

Não está ali porque o agente é desobediente. Está ali porque o agente é
*prestativo* — e prestativo é o problema.

Pense em como uma sessão funciona do lado da máquina. Ela chega sem memória
nenhuma da discussão que tivemos na terça passada. Lê o código, vê uma decisão de
design e — sendo boa no que faz — nota que existe uma alternativa razoável. Do
ponto de vista dela, aquela questão está genuinamente aberta. Então ela levanta o
assunto. Educadamente. Com um raciocínio decente.

E vai fazer isso de novo na próxima sessão. E na seguinte. Cada uma dessas
conversas custa tempo e atenção e, pior, mais cedo ou mais tarde você vai estar
cansado e vai dizer "tá bom, pode ser", e uma decisão que você achava consolidada
vira silenciosamente outra coisa, de um jeito que ninguém nunca revisou.

É isso que a regra fecha. Não um "o agente tem que me obedecer". Algo bem mais
estreito: **esta questão não está aberta, e é aqui que você olha para descobrir
quais estão.**

Agora leia de novo a segunda metade, porque é a parte que eu defenderia com mais
força:

> to change one, propose it explicitly and update the doc in the same PR that
> implements the change.

Não é um bloqueio. É um pedágio. Você está explicitamente autorizado a mudar algo
Decidido — só tem que fazer isso de forma visível e pagar o preço atualizando o
documento no mesmo fôlego que o código. O que significa que o documento não
consegue se descolar do que o código de fato faz, porque os dois andam juntos ou
não andam.

Voltando à cozinha: a regra não é *nunca mude as panelas de lugar*. A regra é **se
mudar as panelas de lugar, avise a casa e deixe um bilhete no armário.**

## A metade que demorei muito mais para aprender

Então você traça um limite. Ótimo. Eu garanto: você ainda vai passar raiva —
porque eu tinha traçado vários e continuava passando.

Eis o que me faltava:

> **Um limite que o agente não consegue verificar não é um limite. É apenas um
> desejo.**

Ele não corrige o que não enxerga. Se a resposta para "isso está correto?" vem do
julgamento do próprio agente, então a resposta vai ser o julgamento do próprio
agente, com toda a sinceridade do mundo — e você só vai descobrir quanto ele valia
bem mais tarde.

Quem disse isso do jeito mais afiado não fui eu — é uma regra que acabou no
`AGENTS.md` do `screen-readers-mcp`, e acho que é a melhor frase de qualquer um
dos dois repositórios:

> **`uv run poe dev` is the gate. Nothing is "done", "working" or "verified"
> until it has passed, and you ran it.** Not a suite you picked, not the tests you
> happened to touch — the whole thing, ~1 min. Reporting success on a subset is
> the single most expensive mistake made in this repo, because the subset is
> always chosen by the same reasoning that wrote the bug.

Leia devagar essa última frase, porque levei um tempo constrangedor para enxergar
o que ela diz:

**the subset is always chosen by the same reasoning that wrote the bug.**

Se um modelo entendeu errado o que você queria, ele não entende errado só
enquanto escreve o código. Entende errado também enquanto escolhe quais testes
rodar, enquanto decide quais deles importavam e enquanto resume o resultado para
você. O mal-entendido está na raiz de tudo isso. Então ele escolhe as verificações
que concordam com ele, roda, vê passar e te diz — honestamente, sem a menor
intenção de enganar — que está tudo certo.

Isso não é mentir. É um ciclo fechado. E não se conserta um ciclo fechado pedindo
"mais cuidado", porque o cuidado está dentro do próprio ciclo.

A única saída é a verificação vir de **fora** do raciocínio que está sendo
verificado. Um comando, definido de antemão, cujo conteúdo o agente não pode
escolher, e que ele é obrigado a rodar e reportar. É só isso que "verde"
significa. É por isso que o `acter` tinha integração contínua já na primeira
noite, antes de existir uma única linha de código de aplicação para ela testar.

E, se você me permitir mais um paralelo com a aviação: é por isso que piloto voa
olhando para os instrumentos, e não para a sensação. Na nuvem, o seu próprio corpo
diz, com confiança e sem parar, que você está voando reto e nivelado quando, na
verdade, está numa espiral suave. O instrumento não está ali porque piloto é
descuidado. Está ali porque quem sente e quem se engana são a mesma coisa.

## Então, quem faz tudo isso?

Duas coisas precisam acontecer antes de você confiar a um agente qualquer coisa
que importe.

O limite tem que **existir** — o que significa que alguém decidiu, de antemão,
quais questões estão abertas e quais não estão, e escreveu isso onde será lido.

E o limite tem que ser **verificável** — o que significa que alguém construiu o
instrumento, botou tudo num único comando e tornou rodá-lo obrigatório.

Nenhuma das duas é código. Nenhuma delas pode ser delegada à coisa que está sendo
limitada. As duas têm que acontecer antes de escrever a primeira linha, porque
depois é tarde demais — as decisões já vão estar espalhadas pelos arquivos, cada
uma localmente razoável, e ninguém vai encontrá-las numa terça-feira à noite.

Então: quem decide onde ficam os limites? Quem decide o que "verde" significa, em
que ordem as coisas são construídas e se a explicação que você acabou de receber é
de fato verdadeira?

Você. Tudo isso é você.

O que me leva a uma noite de julho e a uma conversa que gerou quinhentas linhas de
documentação e nenhuma linha de código — na qual, relendo depois, contei seis
papéis diferentes que eu vinha desempenhando sem notar que alternava entre eles.
