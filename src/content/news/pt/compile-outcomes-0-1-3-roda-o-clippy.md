---
title: 'compile-outcomes 0.1.3 roda o clippy também'
date: 2026-11-23
time: '08:36'
project: 'compile-outcomes'
translationOf: 'compile-outcomes-0-1-3'
---

O compile-outcomes agora consegue compilar trechos com `cargo clippy` em vez de `cargo build`, reportando os lints do clippy como avisos, ou como erros no caso de um lint negado, cada um com o lint como código. Os níveis dos lints são definidos por grupo ou por nome, e o clippy analisa só os trechos, nunca as suas dependências. Código escrito para o 0.1.2 compila sem mudanças.

[A versão no GitHub (em inglês)](https://github.com/marlon-sousa/compile-outcomes-rs/releases/tag/v0.1.3) traz as notas.
