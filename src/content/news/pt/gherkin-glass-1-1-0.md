---
title: 'Gherkin Glass 1.1.0 é publicado'
date: 2026-11-24
time: '13:17'
project: 'Gherkin Glass'
translationOf: 'gherkin-glass-1-1-0'
---

O Gherkin Glass agora pode deixar arquivos seus na pasta em que escreve o site: `--keep-in-output`, ou `keep_in_output` no `ghg.toml`, diz o que a construção do site não deve remover, como `.nojekyll` ou `CNAME`, na sintaxe de um `.gitignore`. `ghg build --message-format json` informa como a construção terminou em um objeto JSON para um programa ler, e uma construção que não encontra nenhum arquivo de funcionalidades agora não escreve nada, avisa e termina com sucesso, em vez de escrever um site vazio. Há também um binário para Windows em ARM64, o que dá seis plataformas.

[A versão no GitHub (em inglês)](https://github.com/marlon-sousa/gherkin-glass/releases/tag/v1.1.0) traz as notas, e [o site do projeto (em inglês)](https://marlon-sousa.com/gherkin-glass/) mostra o que ele faz com uma suíte de exemplo.
