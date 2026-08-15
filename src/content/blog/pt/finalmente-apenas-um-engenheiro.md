---
title: 'Finalmente, apenas um engenheiro'
description: 'Sempre fomos o engenheiro e o pedreiro ao mesmo tempo, porque, em software, erguer as paredes é um trabalho altamente qualificado. Agora, existe algo para assentar os tijolos — o que não o torna menos engenheiro, mas sim, finalmente, apenas um engenheiro.'
pubDate: 'Aug 13 2026'
translationOf: 'at-long-last-only-an-engineer'
series: 'you-are-now-the-whole-team'
seriesPart: 1
tags: ['engenharia com ia', 'ia', 'engenharia de software']
draft: false
---

Olá, e boas-vindas ao
*[Você agora é a equipe inteira](/pt/series/you-are-now-the-whole-team/)*.

Começo compartilhando aquilo em que acredito, pois tudo o que escreverei aqui é uma tentativa de explicar o porquê.

> **Acredito que construir software profissional com um agente de IA exige que você seja um profissional *mais* completo do que quando construía tudo manualmente.**

Não menos. Mais.

Acha estranho ouvir isso em 2026? Quando quase todos dizem o oposto — que a barreira de entrada caiu, que qualquer um pode programar agora e que a parte difícil ficou para trás?

Acostume-se, pois pretendo dedicar uma série inteira a este tema.

Sei como isso soa. Soa como um engenheiro sênior defendendo a própria posição, que é a coisa menos interessante que um engenheiro sênior pode fazer, e não tenho interesse algum nisso.

Portanto, vou explicar de onde isso vem e, em seguida, o que *não* estou afirmando.

Esta não é uma primeira impressão. Passei cerca de um ano e meio focado em desenvolvimento orientado a agentes, de forma deliberada e intensa — e não como um passatempo. Faz parte do meu trabalho atual: pesquisar como os agentes conquistam seu espaço dentro de uma organização de engenharia em produção, em vez de apenas em demonstrações.

Grande parte desse trabalho foi feito com o [Devin](https://devin.ai), desenvolvido pela [Cognition](https://cognition.ai). Se você ainda não o conhece, o Devin é um engenheiro de software autônomo: você atribui uma tarefa e ele a executa de forma independente — planeja, escreve, executa e abre o pull request —, em vez de apenas sugerir conclusões de linhas no seu editor. Essa diferença é fundamental para tudo o que vou argumentar, pois um agente que trabalha sem supervisão direta exige um julgamento prévio muito bem estruturado por sua parte.

Ao longo do caminho, enfrentei muitos desafios tentando me comunicar adequadamente com esses agentes e passei diversas noites descobrindo que o que eu acreditava ter solicitado não correspondia ao que realmente havia dito.

Em junho de 2026, a Cognition realizou seu primeiro [Champions Summit](https://www.linkedin.com/posts/cognition-ai-labs_we-recently-hosted-the-first-cognition-champions-activity-7471215029489471488-0hKr/): reuniu vinte dos usuários mais avançados do Devin em todo o mundo — equipes que já o utilizavam em produção para migrações, ferramentas internas e automações — no escritório de São Francisco para um dia de workshops. Eu fui um dos vinte e [apareço no vídeo](https://www.youtube.com/watch?v=CHHtsJGivE4&t=109s) produzido sobre o evento.

Menciono isso não para ostentar uma credencial, mas porque é a resposta honesta para a pergunta: "por que eu deveria ler *este* texto?". Estou nesse processo há algum tempo e passei um dia inteiro debatendo o tema com outras dezenove pessoas que também estão no assunto há bastante tempo, o que é algo mais raro do que parece.

Isso não significa que eu esteja certo. Significa apenas que sou alguém que já cometeu muitos dos erros. O que segue é o resultado do que esse ano e meio me ensinou e do que ainda estou tentando compreender.

Agora, o que não estou afirmando.

Não estou afirmando que a IA não funciona. Funciona. Funciona tão bem que finalmente construí algo que desejava há anos e nunca havia tido condições de realizar. Não estou dizendo que ela o torna preguiçoso ou que buscar ajuda seja uma trapaça — voltarei a esse ponto mais adiante e minha resposta é o oposto do que você pode esperar.

E certamente não estou afirmando que **escrever código era a parte barata.**

Ouve-se muito isso: que o agente apenas assumiu a digitação, que nunca foi a parte cara do processo. Isso é um equívoco, e qualquer pessoa que já perdeu uma semana tentando resolver um único bug sabe disso. Escrever código é lento e dispendioso. É *exatamente* por isso que um agente representa um avanço tão significativo e por que consigo construir hoje o que não consegui durante anos. Não vou fingir desinteresse apenas para parecer sábio.

Portanto, aqui está a estrutura do problema, e quero colocá-la de forma mais cuidadosa do que costumo ouvir.

O problema não era a incapacidade de projetar o sistema. Claro que sabíamos como fazer isso. A maioria de nós sabia perfeitamente como era uma arquitetura adequada, qual deveria ser a estratégia de testes e em que ordem os componentes deveriam ser desenvolvidos.

O problema é que **a construção competia com a engenharia**, e a construção sempre vencia, pois trazia um prazo atrelado a ela.

Vou utilizar a metáfora da construção civil, pois foi assim que tudo fez sentido para mim.

Observe um canteiro de obras. Há um engenheiro e há os trabalhadores ergando as paredes, e não são as mesmas pessoas. Não porque o engenheiro seja nobre demais para assentar um tijolo, mas porque são funções distintas. O engenheiro determina onde as paredes ficam e por que a estrutura se mantém em pé. Os pedreiros erguem as paredes. Cada um é altamente qualificado em sua função e nenhum executa o trabalho do outro.

Agora olhe para a nossa área. **Nós não tínhamos pedreiros.**

E quero ser preciso sobre o motivo: não porque fôssemos orgulhosos demais para contratá-los, mas porque **em software, erguer as paredes é, em si, um trabalho altamente qualificado.** Não é possível delegar "apenas implemente este módulo" a alguém sem qualificação e retornar ao planejamento. Escrever o código real exige quase tudo o que projetá-lo exigiu — o mesmo entendimento, o mesmo cuidado, a mesma pessoa. Nunca houve uma mão de obra mais barata para essa tarefa, pois uma mão de obra menos qualificada simplesmente não conseguiria executá-la.

Assim, éramos os engenheiros e também éramos nós nos andaimes, o dia todo, todos os dias. E assentar tijolos exige tempo. Exige a *maior parte* do tempo.

Isso significava que a engenharia recebia apenas o tempo restante. Geralmente, isso se resumia a um esforço concentrado no início — o momento em que você menos sabe sobre o problema que está resolvendo — e, depois disso, você estava no andaime com as mãos ocupadas. Retornar para alterar o projeto significava demolir algo que já havia sido construído.

Observe o resultado disso. Qualquer leitor reconhecerá esta lista:

* **Débito técnico**, que em grande parte são apenas decisões que ninguém teve tempo de tomar adequadamente, acumulando-se silenciosamente.
* **Projetos abandonados pela metade**, porque a estrutura real do sistema só se tornava visível após o investimento da maior parte do orçamento.
* **Mudanças bruscas e tardias de escopo**, porque ninguém podia se dar ao luxo de descobrir antecipadamente o que realmente era necessário.

Nada disso reflete incompetência. Já trabalhei com excelentes engenheiros que entregaram projetos com esses três problemas, e você provavelmente também. Trata-se apenas de uma questão de alocação de tempo.

E agora, pela primeira vez, existe algo capaz de assentar os tijolos.

Não de forma perfeita. Não sem supervisão. Mas de forma genuína, rápida e com qualidade suficiente para manter a estrutura em pé. Esse é o evento principal. É isso o que realmente mudou na nossa indústria, e é algo muito mais significativo do que "a IA pode escrever código".

Para ser justo, não se trata mais apenas de tijolos. Os agentes começaram a auxiliar também no projeto. Eles debatem ideias, identificam cenários que não foram considerados e, mais adiante, mostrarei uma ocasião em que um agente analisou uma regra da qual eu me orgulhava, encontrou uma falha e estava totalmente correto. Isso é real e não vou ignorar esse fato para preservar minha posição.

Contudo, auxiliar no raciocínio não é o mesmo que ser responsável por ele. Alguém ainda precisa decidir o que está sendo construído, definir os limites de atuação do agente e verificar se a explicação convicta que acabou de ser apresentada é de fato verdadeira. Essa pessoa é você, e esse é o foco principal do que discutiremos.

Pois é isto o que essa mudança provoca em você: ela não o torna menos engenheiro.

**Ela o torna, finalmente, apenas um engenheiro.**

E esse é um trabalho consideravelmente mais difícil do que o que você vinha realizando, pela simples razão de que você nunca teve tempo para executá-lo adequadamente — e nunca precisou provar se realmente era capaz.

As horas estão de volta. E com elas vêm todas as atribuições que você sempre soube que deveria estar executando, mas nunca teve espaço para tal — decidir o que vale a pena construir, em qual sequência, sob quais limites e o que serve como validação. Essas não são tarefas novas. Sempre foram suas. A novidade é que **você não tem mais a única desculpa que costumava justificar cada uma delas.**

## Mas eu utilizo o conceito de *vibe coding* constantemente e funciona muito bem

Sim, e funciona muito bem. Gostaria de estabelecer uma distinção clara aqui, pois não quero que este texto seja interpretado como uma crítica ao método de trabalho de outras pessoas.

*Vibe coding* possui um significado real e útil, e sua definição é precisa: **você não lê o código gerado.** Você descreve o que deseja, aceita as alterações, não inspeciona os detalhes e deixa o processo correr. Se o objetivo for atingido, a tarefa está concluída.

Não há nenhum problema nisso. Faço questão de afirmar isso claramente, pois o debate sobre o tema tornou-se excessivamente moralista e não tenho interesse em participar dessa discussão. O *vibe coding* é genuinamente útil. Se você está automatizando uma planilha, criando um script para renomear centenas de fotos, desenvolvendo uma pequena ferramenta de uso estritamente pessoal ou criando algo para sua residência — essa é uma aplicação perfeita e uma possibilidade que simplesmente não existia para a maioria das pessoas há dois anos. Aproveite o recurso. Eu também o utilizo e não vejo razões para restrições.

No entanto, não é sobre isso que trata esta série, e a diferença não é apenas uma questão de grau.

> O *vibe coding* é definido pelo que você ignora. O que estou descrevendo aqui é definido pelo que você se recusa a deixar indeterminado.

Trata-se de disciplinas opostas. Explico a diferença da forma como ela finalmente se tornou clara para mim: afastando-nos totalmente do desenvolvimento de software.

## A pequena aeronave e o avião comercial

Pense no aprendizado de pilotagem.

Para voar sozinho em uma pequena aeronave — um monomotor simples, em condições meteorológicas favoráveis e sem passageiros —, é necessário treinamento real, porém em volume compreensível. Algumas dezenas de horas com um instrutor, um exame teórico e um voo de avaliação. Milhares de pessoas comuns fazem isso. Não é simples, mas é perfeitamente viável para quem se dedica.

Agora considere o que é necessário para ocupar o assento do comandante em um avião comercial.

Significativamente mais de mil horas de voo antes mesmo de poder se candidatar. Habilitação específica para aquele modelo exato de aeronave. Avaliações periódicas em simulador, de forma contínua, onde falhas são induzidas deliberadamente. Certificação médica rigorosa. Uma segunda pessoa ao seu lado cuja função inclui questionar suas decisões.

E aqui está o ponto que considero genuinamente instrutivo:

> **O avião comercial possui vasta automação em comparação à pequena aeronave. E exige infinitamente mais treinamento, não menos.**

Reflita sobre isso, pois nossa indústria insiste em presumir a relação oposta.

Aquela aeronave pode manter a proa, a altitude, navegar por uma rota, gerenciar os motores e, em determinadas condições, pousar sozinha. No papel, uma parte substancial da *pilotagem* foi retirada do piloto. No entanto, os requisitos para comandá-la continuaram subindo.

Por quê? Porque a automação nunca foi implementada para que uma pessoa menos qualificada pudesse voar. Ela foi introduzida para que uma pessoa altamente qualificada pudesse gerenciar uma operação consideravelmente mais complexa — mais pesada, mais rápida, mais distante, sob condições meteorológicas adversas, com centenas de passageiros a bordo — sem ser consumida pelo esforço físico de manter as asas niveladas.

A automação não substituiu o conhecimento do piloto. **Ela transferiu a especialização do piloto dos controles manuais para a gestão do sistema.** O trabalho deixou de ser "manusear os controles corretamente" e passou a ser "saber a todo momento o que a máquina está fazendo, perceber o exato instante em que ela executa algo diferente do pretendido, entender o motivo e estar pronto para assumir o controle."

E essa segunda atribuição é mais complexa que a primeira. É mais difícil por ser mais silenciosa. Nada treme. Nada parece errado. A automação não avisa quando interpreta algo incorretamente — ela prossegue, de forma suave e convicta, executando exatamente o que pressupõe que foi solicitado. As falhas de sistemas automatizados raramente são ruidosas; geralmente, são *plausíveis*.

Acredito que seja evidente onde quero chegar.

O *vibe coding* representa a pequena aeronave. Tempo bom, sem outros ocupantes, e se algo falhar, o prejuízo limita-se a uma tarde. De fato, aproveite esse tipo de voo.

Software profissional — sistemas dos quais terceiros dependem e que precisarão ser mantidos por profissionais que não estavam presentes durante a criação — representa o avião comercial. E o agente é a automação: real, potente, a razão pela qual a operação é viável, mas absolutamente longe de substituir a necessidade de compreender exatamente o que está sendo executado.

Caso discorde, é perfeitamente compreensível. Eu também não me convenceria apenas com um parágrafo.

## No próximo capítulo

Portanto, em vez de apenas apresentar afirmações, passarei a demonstrar os fatos.

No próximo texto, em *[O terminal que eu não conseguia construir](article:the-terminal-i-could-not-build)*, quero relatar a história de um software que desejava há anos e não tinha condições de desenvolver — o que ele é, como funciona, por que estava fora do alcance de alguém com um emprego em tempo integral e família, e o que finalmente mudou.

Em seguida, abordarei a noite em que finalmente reuni os meios necessários. Sentei-me diante de um agente que iniciaria prontamente o desenvolvimento daquele terminal nos trinta segundos seguintes, caso eu tivesse emitido a ordem.

Eu não emitia a ordem.

---