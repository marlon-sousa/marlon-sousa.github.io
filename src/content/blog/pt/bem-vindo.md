---
title: 'Boas-vindas'
description: 'Por que este site existe, o que pretendo escrever aqui e o que farei caso algo não funcione para você.'
pubDate: 'Aug 06 2026 14:00'
translationOf: 'welcome'
tags: ['acessibilidade', 'escrita']
---

Escrevo e falo sobre tecnologia há mais de uma década — na BlindTec, em podcasts, palestras e publicações de terceiros. Esta é a primeira vez que esse conteúdo reside em um espaço sob meu controle total, incluindo o controle sobre sua acessibilidade real.

## Minha trajetória

Sou engenheiro de software. Desde 2004, atuo predominantemente em sistemas de movimentação financeira: a plataforma de internet banking do Itaú, um core banking completo em Rust para um banco local em Turks e Caicos, e pagamentos internacionais no EBANX. Também sou cego e desenvolvo complementos para o leitor de tela NVDA, distribuídos pela loja da NV Access.

Não são duas carreiras distintas. Construir software em que as pessoas confiam e construir software que todos possam utilizar é, em essência, o mesmo problema abordado por duas perspectivas diferentes.

Se há um padrão no que desenvolvo, é a preferência por atuar nos bastidores — no framework em vez da interface, na infraestrutura de testes em vez da funcionalidade, no complemento em vez do aplicativo. Esse é também o foco do conteudo que pretendo produzir.

## O que vem por aí

Duas séries estão em preparação.

**Engenharia com IA.** Não sobre a capacidade de os agentes escreverem código — o que é evidente —, mas sobre o que é necessário para obter software confiável em nível profissional a partir deles. Minha tese contrapõe-se à visão popular: executar esse processo adequadamente exige *mais* de um único engenheiro, não menos, uma vez que você assume simultaneamente os papéis de product owner, gerente de projetos, arquiteto, engenheiro de plataforma, gestor e revisor. Cada afirmação é fundamentada em dois repositórios que desenvolvi dessa forma, acompanhados das respectivas métricas.

**Rust além da programação de sistemas.** A defesa de que o Rust é uma escolha viável para software convencional — ferramentas, serviços, aplicações desktop — e não apenas para a camada de sistemas a que costuma ser restrito.

Entre as séries, publicarei textos individuais sobre o funcionamento interno de leitores de tela, testes em estruturas que não foram projetadas para serem testadas e temas da profissão que justificam o debate.

## Sobre acessibilidade

Seria incoerente escrever sobre acessibilidade em um site inacessível. Por isso, este site é intencionalmente simples: HTML semântico, link de atalho para o conteúdo principal (skip link), hierarquia clara de cabeçalhos, foco de teclado visível e ausência de necessidade de JavaScript para leitura. A busca e os comentários utilizam a linguagem; os textos, não.

A acessibilidade é auditada de forma contínua, não presumida. Cada processo de build executa testes com o axe em todas as páginas, nos modos claro e escuro, além de uma verificação específica para o cálculo de contraste de cores. Se houver falha em qualquer um dos testes, o build é interrompido.

Ainda assim, ferramentas automatizadas não identificam a totalidade dos problemas. Portanto, se algum elemento aqui não funcionar adequadamente com seu leitor de tela, navegador ou ampliador, entre em contato. Trata-se de um bug e será corrigido.