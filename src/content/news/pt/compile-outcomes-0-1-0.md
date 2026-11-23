---
title: 'compile-outcomes 0.1.0 é publicado'
date: 2026-11-17
time: '15:39'
project: 'compile-outcomes'
translationOf: 'compile-outcomes-0-1-0'
---

O compile-outcomes está no crates.io. Ele compila trechos de Rust e entrega aos seus testes o que o compilador disse sobre cada um, como dados: se compilou, e cada erro e aviso com a sua mensagem, código e localização. Ele não julga nada, então um `#[test]` simples ou um cenário em Gherkin decide o que está certo. Foi feito para bibliotecas que precisam testar o que dizem a quem as usa errado, como os erros de compilação das macros do snapfit, e um alfa dele verificou as fixtures de falha de compilação do snapfit em Linux, macOS e Windows antes desta versão.

[A versão no GitHub (em inglês)](https://github.com/marlon-sousa/compile-outcomes-rs/releases/tag/v0.1.0) traz as notas.
