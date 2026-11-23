---
title: 'snapfit 0.2.0 é publicado'
date: 2026-11-23
time: '13:49'
project: 'snapfit'
translationOf: 'snapfit-0-2-0'
---

Agora um campo pode ter como tipo a sua trait: `#[singleton(implementation = StripeGateway)] payments: Arc<dyn PaymentGateway>` faz o contêiner construir o `StripeGateway`, enquanto o campo, o seu getter e cada serviço que depende dele veem só o trait object, então trocar uma implementação muda uma palavra. Um campo cujo construtor, builder ou factory pode falhar é marcado com `fallible = true`, e o seu contêiner passa a ser construído por `try_new()`, que devolve um erro dizendo qual campo falhou. A edição 0.2 do livro ensina os dois, e ganha um capítulo sobre testar um serviço sozinho.

[A versão no GitHub (em inglês)](https://github.com/marlon-sousa/snapfit-rs/releases/tag/v0.2.0) traz as notas, e [o livro (em inglês)](https://marlon-sousa.com/snapfit-rs/book/v0.2.0/) tem uma edição para esta versão.
