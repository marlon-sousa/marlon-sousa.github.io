---
title: 'A lacuna entre o que você disse e o que você quis dizer'
description: 'A extrapolação é toda a razão de você usar um agente, e todo o risco de usar um, porque são o mesmo mecanismo. Então a pergunta nunca é como impedi-la — é onde ela deve ser ampla e onde precisa ser estreita.'
pubDate: 'Aug 13 2026 22:00'
translationOf: 'the-gap-between-what-you-said-and-what-you-meant'
series: 'you-are-now-the-whole-team'
seriesPart: 3
tags: ['engenharia com ia', 'ia', 'engenharia de software']
draft: true
---

[Da última vez](/pt/blog/o-terminal-que-eu-nao-conseguia-construir/) eu te contei
sobre um terminal que eu queria havia anos, por que eu nunca consegui construí-lo,
e por que um agente é a razão de ele existir. E então eu te deixei
com uma recusa: eu tinha a ferramenta, tinha o desenho na cabeça, e não pedi que
ele começasse a escrever.

Deixe eu explicar essa recusa agora, porque ela é a fundação de todo o resto que
eu vou escrever, e é a coisa que eu quase nunca vejo explicada em lugar nenhum.

Vamos falar de extrapolação.

(Se você chegou aqui sem contexto, tudo bem. Tudo de que você precisa é da
afirmação que eu fico repetindo: que construir software profissional com um agente
pede *mais* de você, não menos. O que vem a seguir é o mecanismo por trás disso, e
se sustenta sozinho.)

## Por que você usa um agente afinal

Comece por uma pergunta que soa boba: para que serve um agente, de fato?

A resposta óbvia é "ele escreve o código para eu não ter que escrever". Verdade,
mas não é útil. Vamos descer um nível.

Você descreve alguma coisa. O agente produz alguma coisa. E o que ele produz é
sempre, inevitavelmente, **mais específico do que o que você descreveu.**

Você disse "adiciona uma tela de configurações". Você não disse o que acontece
quando um valor é inválido, onde o arquivo é guardado, se ele salva ao mudar ou ao
fechar, o que a mensagem de erro diz, ou se a coisa toda é uma struct ou cinco.
Mas o código tem que responder todas essas perguntas, porque código não pode ser
vago. Então o agente decidiu, vinte ou trinta vezes, no espaço entre a sua frase e
o arquivo que ele escreveu.

Esse espaço — entre o que você disse e o que você quis dizer — é o produto inteiro.
É isso que você está comprando. Vamos chamar de **extrapolação** o ato de
preenchê-lo.

E agora a parte que vale a pena ficar remoendo:

> **Se um agente não pudesse extrapolar, ele seria inútil para você.**

Pense. Se você tivesse que enunciar cada regra, cada ramo, cada convenção, cada
caso de erro, de forma exaustiva e sem ambiguidade, para que nada fosse deixado
para ser inferido... você não estaria escrevendo um prompt. Você estaria
*programando*. É isso que programar sempre foi: fechar essa lacuna até zero, à
mão, em uma linguagem que não consegue te ler errado.

Então a extrapolação não é um efeito colateral de usar um agente. É todo o valor.

O que significa — e essa é a parte que levou um tempo para eu entender — que
**ela é também todo o risco, exatamente pela mesma razão.** Você não pode ter uma
sem a outra. Não existe uma configuração que te dê inferência útil e nenhuma
inferência indesejada, porque são o mesmo mecanismo.

## Um agente sem limites não extrapola um pouquinho

É aqui que dá errado.

Suponha que você dê a um agente uma tarefa e mais nada. Ele não vai
cuidadosamente extrapolar as coisas pequenas e deixar as grandes em paz. Por que
faria isso? Ele não tem como saber qual é qual. Então ele extrapola *tudo* — a
arquitetura, as camadas, os nomes, o tratamento de erro, para que serve um teste,
se isso merece um arquivo novo, se aquela duplicação importa.

Com confiança. Educadamente. De um jeito que se lê bem.

E eu quero defendê-lo por um momento, porque a reação usual aqui é tratar isso
como um defeito da máquina, e não é.

Pegue um bom engenheiro — um genuinamente bom — e solte-o em um repositório que
ele nunca viu, com um chamado de uma linha, nenhuma convenção escrita e ninguém a
quem perguntar. O que você recebe? Você recebe vinte decisões que você nunca
mencionou, cada uma localmente razoável, várias delas erradas para a *sua* base de
código de um jeito que vai te custar em três semanas.

A gente chama isso de defeito de caráter? Não. A gente chama de onboarding que
faltou. É a mesma coisa aqui.

Deixe eu colocar de outro jeito, porque eu gosto de explicar as coisas pela vida
comum.

Você pede a alguém que arrume a sua cozinha. Se a pessoa for boa, ela vai tomar
decisões que você não mencionou — vai notar a panela queimada que você esqueceu e
esfregá-la, vai jogar fora aquilo no fundo da geladeira que virou um projeto de
ciências. Excelente. É por isso que você chamou uma pessoa e não um braço robótico
parafusado na bancada. Se você tivesse que especificar cada uma dessas coisas,
teria simplesmente arrumado a cozinha você mesmo.

Mas ela também vai decidir em qual armário as panelas moram.

E essa decisão não é obviamente errada quando ela a toma. Pode até ser melhor que
o seu arranjo, objetivamente. Ainda assim é cara, porque outras três pessoas
naquela casa têm memória muscular, e você vai pagar por isso toda manhã por um
mês, e ninguém vai ligar o custo de volta à arrumação.

Mesmo ato. Mesma competência. Consequências completamente diferentes. A diferença
não é *quanto* a pessoa extrapolou — é *onde*.

## Então a pergunta nunca é "como eu impeço isso"

As pessoas tentam. Escrevem prompts mais longos, acrescentam "não faça nada que eu
não pedi", ficam frustradas. Mas você não pode pedir inferência e não-inferência ao
mesmo tempo, e se conseguisse estaria apenas programando de novo, devagar, em
inglês.

A pergunta de verdade é esta:

> **Onde a extrapolação deve ser ampla, e onde ela precisa ser estreita?**

**Ampla** é onde você a quer. Resolvendo o problema. Escolhendo o algoritmo.
Notando o caso em que você não tinha pensado. Esfregando a panela.

**Estreita** é onde errar é caro e difícil de enxergar. A arquitetura. As camadas.
O que "pronto" significa. O que não pode ser mudado sem uma conversa. Em qual
armário as panelas moram.

E eis a consequência desconfortável, aquela sobre a qual todo o resto que eu
escrevo aqui de fato trata: **essa decisão tem que ser tomada com antecedência.**
Quando ela importa, o código já está escrito. Você não consegue revisar o seu
caminho para fora dela, porque revisar mil decisões localmente razoáveis não é uma
coisa que uma pessoa cansada faz numa terça à noite.

## Como "estreita" se parece na prática

Deixe eu parar de ser abstrato, porque "estabeleça um limite" é o tipo de conselho
que soa sábio e não te diz nada.

Aqui está um de verdade. Está no `CLAUDE.md` do `acter`, que é o arquivo que o
agente lê no começo de toda sessão, e estava lá desde a primeira noite. (Estes
arquivos são escritos em inglês, que é o idioma em que eu trabalho com os agentes,
e estão citados aqui exatamente como estão no repositório.)

> Items marked **Decided** in the docs are settled. Do not relitigate them
> silently; to change one, propose it explicitly and update the doc in the same
> PR that implements the change.

Três linhas. Deixe eu abrir por que elas estão ali, porque a razão não é a que
você adivinharia.

Não está ali porque o agente seja desobediente. Está ali porque o agente é
*prestativo*, e prestativo é o problema.

Pense em como uma sessão se parece do lado da máquina. Ela chega sem memória
nenhuma da discussão que tivemos na terça passada. Lê o código, vê uma decisão de
projeto e — sendo boa no que faz — nota que existe uma alternativa razoável. De
onde ela está, aquela questão está genuinamente aberta. Então ela a levanta.
Educadamente. Com um raciocínio decente.

E vai fazer isso de novo na próxima sessão. E na seguinte. Cada uma dessas
conversas te custa tempo e atenção e, pior, mais cedo ou mais tarde você vai estar
cansado e vai dizer "tá bom, tudo bem", e uma decisão que você achava resolvida vai
silenciosamente virar outra coisa, de um jeito que ninguém nunca revisou.

É isso que a regra fecha. Não "o agente tem que me obedecer". Algo bem mais
estreito: **esta questão não está aberta, e aqui é onde olhar para descobrir quais
estão.**

Agora leia a segunda metade dela de novo, porque essa é a parte que eu defenderia
com mais força:

> to change one, propose it explicitly and update the doc in the same PR that
> implements the change.

Não é uma tranca. É um pedágio. Você está explicitamente autorizado a mudar uma
coisa Decidida — só precisa fazer isso onde alguém possa ver, e pagar por isso
atualizando o documento no mesmo fôlego que o código. O que significa que o
documento não pode se afastar do que o código de fato faz, porque os dois se movem
juntos ou não se movem.

De volta à cozinha: a regra não é *nunca mude as panelas de lugar*. A regra é **se
você mudar as panelas de lugar, avise a casa e deixe um bilhete no armário.**

## A metade que eu demorei muito mais para aprender

Então você traça um limite. Ótimo. Você ainda vai passar por maus bocados, eu te
garanto — porque eu tinha traçado vários e ainda estava passando.

Eis o que estava me faltando:

> **Um limite que o agente não consegue conferir não é um limite. É um desejo.**

Ele não pode corrigir o que não consegue ver. Se "isto está correto?" é respondido
pelo julgamento do próprio agente, então a resposta vai ser o julgamento do
próprio agente, oferecido com sinceridade, e você vai descobrir quanto ele valia
bem mais tarde.

A formulação mais afiada disso não é minha — é uma regra que acabou no `AGENTS.md`
do `screen-readers-mcp`, e eu acho que é a melhor frase de qualquer um dos dois
repositórios:

> **`uv run poe dev` is the gate. Nothing is "done", "working" or "verified"
> until it has passed, and you ran it.** Not a suite you picked, not the tests you
> happened to touch — the whole thing, ~1 min. Reporting success on a subset is
> the single most expensive mistake made in this repo, because the subset is
> always chosen by the same reasoning that wrote the bug.

Leia devagar aquela última oração — *the subset is always chosen by the same
reasoning that wrote the bug* — porque eu levei um tempo constrangedor para
enxergá-la:

**o subconjunto é sempre escolhido pelo mesmo raciocínio que escreveu o defeito.**

Se um modelo entendeu errado o que você queria, ele não entende errado apenas
enquanto escreve o código. Ele entende errado enquanto escolhe quais testes rodar,
e enquanto decide quais deles importavam, e enquanto resume o resultado para você.
O mal-entendido está a montante de tudo isso. Então ele vai escolher as
verificações que concordam com ele, rodá-las, vê-las passar, e te dizer —
honestamente, sem nenhuma intenção de enganar — que está tudo bem.

Isso não é mentir. É um laço fechado. E você não conserta um laço fechado pedindo
que ele tenha mais cuidado, porque o cuidado está dentro do laço.

A única correção é fazer a verificação vir de **fora** do raciocínio que está
sendo verificado. Um comando, definido com antecedência, cujo conteúdo o agente não
pôde escolher, e que ele precisa rodar e reportar. É só isso que "verde"
significa. É por isso que o `acter` tinha integração contínua já na primeira
noite, antes de existir uma única linha de código de aplicação para ela testar.

O que, se você me permitir mais uma viagem ao avião: é por isso que um piloto tem
instrumentos em vez de uma sensação. Dentro da nuvem, o seu próprio corpo vai te
dizer, com confiança e continuamente, que você está voando reto e nivelado
enquanto, de fato, você está em uma espiral suave. O instrumento não está ali
porque pilotos sejam descuidados. Está ali porque a coisa que faz a percepção é a
mesma coisa que está errada.

## Então quem faz tudo isso?

Duas coisas, então, antes que um agente possa receber a confiança para algo que
importa.

O limite precisa **existir** — o que significa que alguém decidiu, com
antecedência, quais questões estão abertas e quais não estão, e escreveu isso onde
será lido.

E o limite precisa ser **conferível** — o que significa que alguém construiu o
instrumento, o transformou em um comando, e tornou rodá-lo não opcional.

Nenhuma dessas duas coisas é código. Nenhuma delas pode ser delegada à coisa que
está sendo limitada. As duas têm que acontecer antes de a primeira linha ser
escrita, porque depois é tarde demais — as decisões já estão nos arquivos, cada
uma localmente razoável, e ninguém vai encontrá-las numa terça à noite.

Então: quem decide onde ficam os limites? Quem decide o que verde significa, em
que ordem as coisas são construídas, e se a explicação que você acabou de receber
é de fato verdadeira?

Você. Tudo isso.

O que me leva a uma noite de julho, e a uma conversa que produziu quinhentas
linhas de documentação e nenhuma linha de código — onde, relendo depois, eu contei
seis trabalhos diferentes que eu vinha fazendo sem perceber que estava alternando
entre eles.
