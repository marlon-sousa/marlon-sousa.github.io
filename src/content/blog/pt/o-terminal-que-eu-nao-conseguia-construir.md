---
title: 'O terminal que eu não conseguia construir'
description: 'A coisa que eu queria havia anos e nunca consegui construir, como soa um terminal navegável por cabeçalhos, e por que mesmo assim eu não comecei pedindo a um agente que o escrevesse.'
pubDate: 'Aug 13 2026 21:00'
translationOf: 'the-terminal-i-could-not-build'
series: 'you-are-now-the-whole-team'
seriesPart: 2
tags: ['engenharia com ia', 'ia', 'acessibilidade', 'nvda', 'rust']
draft: false
---

[Da última vez](article:at-long-last-only-an-engineer) eu defendi uma ideia
impopular: a de que criar software profissional usando agentes exige *mais* de
você do que construir tudo manualmente exigia antes. Que sempre fomos, ao mesmo
tempo, o engenheiro e o pedreiro — porque, na nossa área, erguer as paredes é, em
si, um trabalho altamente qualificado, e não havia ninguém mais barato a quem
entregá-lo. Que assentar tijolos consumia as horas de que a engenharia
precisava. E que agora existe algo capaz de assentá-los — o que não o torna menos
engenheiro, torna você *apenas* um engenheiro, que é justamente o trabalho mais
difícil que você nunca teve tempo de fazer direito.

Essa é uma convicção, e convicções não custam nada. Então prefiro sustentá-la do
único jeito honesto que conheço: mostrando o trabalho real.

Dois repositórios no GitHub, com o histórico completo —
[acter](https://github.com/marlon-sousa/acter), um terminal acessível, e o
[screen-readers-mcp](https://github.com/marlon-sousa/screen-readers-mcp), a
ferramenta que tive que parar e construir para conseguir testar o primeiro. Cada
afirmação que faço aponta para algo que você pode conferir diretamente: um
commit, um documento, um job de CI ou uma conversa.

E sobre essas conversas — uma decisão inicial, porque ela muda o que tudo isto
pode provar.

**Eu vou mostrar os dois lados.** Não apenas o que eu digitei — o que é fácil de
selecionar para parecer brilhante —, mas o que a máquina respondeu, citado
exatamente como foi. Incluindo as vezes em que ela estava certa e eu demorei para
perceber, e as vezes em que ela errou de uma forma que parecia completamente
convincente. As minhas próprias palavras também estão citadas exatamente como
foram digitadas — com erros de digitação, letras faltando, tudo em minúsculo.
Foram escritas rapidamente, à noite, no meio de outra atividade, e corrigi-las
agora representaria mal o que isso de fato é.

> **Uma nota sobre esta tradução.** Estas conversas aconteceram em inglês, que é
> o idioma em que eu trabalho com os agentes, e estão reproduzidas aqui exatamente
> como foram — sem tradução. Traduzir um prompt é reescrevê-lo, e o argumento
> deste artigo depende de você poder ver o que foi realmente dito. O texto ao
> redor é português; o que está entre aspas é o registro.

Porque a questão é a seguinte: o argumento que estou apresentando vive *na
lacuna* entre o que a máquina propôs e o que eu realmente aceitei. Se você vir
apenas a minha parte, terá que confiar na minha palavra. Se vir os dois lados,
poderá julgar por si mesmo se manter essa lacuna aberta exige habilidade.

Mais um detalhe antes de começarmos, no espírito de não prometer demais. Não
estou escrevendo uma metodologia aqui e definitivamente não estou em posição de
ditar a forma correta de trabalhar com agentes — tudo isso é muito recente e cada
um de nós ainda está entendendo o processo, inclusive quem está nisso há mais
tempo. O que tenho é o registro de uma pessoa sobre dois projetos reais, algumas
coisas que funcionaram e algumas coisas que passaram por todos os mecanismos que
criei. Para os engenheiros muito experientes que estiverem lendo: fiz algumas
simplificações, de propósito, porque meu interesse principal é o formato da
coisa, e não esgotá-la. Seus conselhos teriam mais valor para mim do que suas
críticas, mas aceito ambos.

## Algo que me incomodava havia anos

Eu uso o terminal todos os dias. Como sou cego, utilizo um leitor de tela e nunca
fiquei satisfeito com essa experiência.

Vou explicar o problema, pois para quem enxerga é fácil não notar.

O terminal é um bloco denso de texto. Para você, isso funciona bem — seu olho
identifica a parte desejada porque o formato da tela indica onde um comando
terminou e o próximo começou. Linhas em branco, indentação, cores e posição. Você
não está lendo tudo; está *observando*, e depois lendo apenas a parte específica
em que focou.

Um leitor de tela não consegue observar. Ele lê. Ele informa o conteúdo da linha
onde o cursor está, depois a linha seguinte, e depois a próxima.

Assim: você executa um comando, ouve uma resposta e tudo corre bem. Agora você
precisa da saída do comando que executou quatro comandos atrás. Onde ela está?
Está lá em cima, em algum lugar, num bloco denso de linhas indiferenciadas, sem
nada para marcar onde ela começa. Não há cabeçalhos, marcos ou fronteiras. Então você
navega com a seta para cima. Linha, linha, linha, linha. Aquele era o início?
Linha, linha. Passou do ponto. Seta para baixo novamente.

Todos os dias. Durante anos.

E a parte frustrante é que a solução não é misteriosa. As páginas da web
resolveram isso há muito tempo. Uma página web possui cabeçalhos, e quem usa
leitor de tela não lê a página do topo — pressiona a tecla **H** e navega de
cabeçalho em cabeçalho até encontrar o que deseja. É rápido, e é o recurso mais
útil que existe na navegação não visual.

E se uma sessão de terminal fosse estruturada dessa forma? E se cada comando
executado se tornasse um *cabeçalho*, com a respectiva saída logo abaixo,
permitindo navegar pela sessão da mesma forma que se navega por uma página web?

Esse é o [acter](https://github.com/marlon-sousa/acter). Você digita em um campo
de edição, o resultado vai para um buffer revisável e cada comando se torna um
cabeçalho de nível dois. Saídas curtas o suficiente para ouvir são lidas
automaticamente; respostas maiores são anunciadas como extensas e sinalizadas com
um bipe, para que você seja *informado* de que há um bloco denso de texto em vez
de recebê-lo de uma vez só. Um atalho alterna para a emulação de terminal de verdade
para quando você precisar do `nano` ou de qualquer outra aplicação baseada em
curses.

Para tornar isso concreto, já que "cada comando é um cabeçalho" é o tipo de frase
que não significa nada até ser ouvida na prática:

Hoje, ao buscar a saída de um build executado alguns comandos atrás, começo a
subir pelo buffer, e o meu leitor fornece o texto linha por linha, na velocidade
que deixei configurada:

> *(em branco)*
> `Compiling serde v1.0.219`
> `Compiling proc-macro2 v1.0.95`
> `Compiling unicode-ident v1.0.18`
> *(em branco)*
> `warning: unused variable: cx`

Em algum ponto aí está a fronteira entre um comando e o anterior, e o único jeito
de encontrá-la é continuar subindo até perceber que o texto deixou de fazer
sentido.

O que eu queria, em vez disso, era o seguinte. Pressiono **H** — a mesma tecla
que uso em qualquer site, a tecla que minhas mãos já conhecem — e escuto:

> "cabeçalho nível dois, cargo build"

Não voltei o bastante. **H** novamente:

> "cabeçalho nível dois, git status"

Pronto. Seta para baixo e já estou lendo a saída daquele comando, que começa
exatamente onde o cabeçalho indicava.

<figure>
	<picture>
		<source media="(max-width: 720px)" srcset="/diagrams/acter-headings-stacked.svg" width="360" height="632" />
		<img src="/diagrams/acter-headings.svg" alt="" width="720" height="306" loading="lazy" />
	</picture>
	<figcaption>
		A mesma sessão duas vezes. Nada foi acrescentado e nada foi escondido — a
		linha de comando já estava lá, nas duas. A única coisa que mudou é que ela
		deixou de ser mais uma linha e virou um cabeçalho.
	</figcaption>
</figure>

Essa é a ideia inteira. Não tem nada de genial. É uma estrutura que existe na web
há vinte e cinco anos, aplicada ao único lugar onde passo o meu dia de trabalho
em que ninguém tinha se dado ao trabalho de aplicá-la.

Rust, Tauri 2 — um frontend em HTML sobre WebView2 — Windows primeiro.

## Então por que eu não construí isso anos atrás?

Porque eu não tinha como, e quero ser preciso sobre o que isso significa.

Não é que eu não soubesse como fazer. É o que a coisa de fato é, se você a
escrever com honestidade: um emulador de terminal, uma interface verdadeiramente
acessível construída sobre ele, integração com o Windows e — a parte que
frequentemente é esquecida — uma forma de *testar* se tudo isso funciona. Isso
não é um projeto de fim de semana. Nem de dez fins de semana.

Tenho um trabalho em tempo integral. Tenho família. O tempo disponível para isso
são noites, em fatias, quando já estou cansado. A distância entre isso e a
exigência do projeto era simplesmente grande demais, e eu não lançaria meio
terminal acessível, pois meio terminal acessível é pior do que nenhum — as
pessoas testariam, ele as deixaria na mão e elas concluiriam que a ideia não
funciona.

Por isso a ideia permaneceu na lista. Por anos.

O cenário mudou quando os agentes de programação atingiram um nível suficiente —
aqueles que mencionei anteriormente, que pegam uma tarefa e vão embora fazê-la.
Não me refiro a autocompletar uma função. Refiro-me a um desempenho suficiente
para que uma pessoa, trabalhando à noite, possa encarar algo que antes exigiria
uma equipe inteira.

Quero ser transparente sobre a minha motivação aqui, pois ela influencia todo o
resto: **eu não adotei agentes porque achava a tecnologia interessante. Adotei
porque eles foram a diferença entre construir isto e não construir.** Não sou um
observador neutro. Sou alguém que alcançou o que desejava.

E é exatamente por isso que estou sendo criterioso com as minhas afirmações.

## Uma ideia para a todas governar

Então — hora de pedir para a IA escrever o código!

Bem. Não.

Não se alguém for depender do resultado.

E este é o ponto em que preciso parar e explicar um conceito com calma, pois ele
é a base de tudo o que escreverei adiante, e eu quase nunca vejo isso explicado
em lugar nenhum. Cada detalhe da forma como trabalho com agentes — os documentos,
as especificações, as validações, as discussões de madrugada sobre onde uma trait
deveria morar — deriva de uma única ideia.

Essa ideia se chama extrapolação, e é sobre ela que falarei no próximo texto, em
[*A lacuna entre o que você disse e o que você quis
dizer*](article:the-gap-between-what-you-said-and-what-you-meant).
