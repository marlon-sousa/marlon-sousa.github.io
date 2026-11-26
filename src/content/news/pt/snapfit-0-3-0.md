---
title: 'snapfit 0.3.0 é publicado, com static dispatch'
date: 2026-11-26
time: '09:32'
project: 'snapfit'
translationOf: 'snapfit-0-3-0'
---

Agora uma trait pode ser despachada por um `match` em vez de uma vtable: marque-a com `#[snapfit::static_dispatch]`, declare `#[static_dispatch_for(PriceRule as Prices)]` no contêiner, e um campo do tipo `Arc<Prices>` guarda uma das implementações que os campos do contêiner nomeiam, enquanto os serviços que o recebem não carregam nenhum parâmetro de tipo. `Prices::of(value)` constrói qualquer variante para um teste, e `extend_static_dispatch` acrescenta substitutos à lista só quando os testes são compilados. Uma trait com um método genérico, que nenhum trait object consegue guardar, também pode ser despachada assim. A edição 0.3 do livro ensina isso, e como escolher entre static e dynamic dispatch, em dois capítulos novos.

[A versão no GitHub (em inglês)](https://github.com/marlon-sousa/snapfit-rs/releases/tag/v0.3.0) traz as notas, e [o livro (em inglês)](https://marlon-sousa.com/snapfit-rs/book/v0.3.0/13-static-dispatch/) tem uma edição para esta versão.
