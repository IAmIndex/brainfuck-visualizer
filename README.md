# Brainfuck Visualizer
Um simples visualizador de código em brainfuck feito com JavaScript.

## Como funciona?
Insira o código em brainfuck no campo abaixo das células de memória. Depois disso, clique em "interpretar" e o seu código será lido passo a passo.

## Ajustando os parâmetros
No topo da página, há dois campos: o primeiro para o número de células sendo exibidas (padrão 10) e o segundo para o *delay* entre cada comando do código em ms (padrão 500ms).

O número de células é aumentado automaticamente caso seja ultrapassado pelo código (limite 30.000).

## Output
Abaixo do código, há uma seção para a visualização do output do código. 

## Limitações
- Por se tratar de uma interpretação e não compilação do código, por mais que o *delay* seja definido para 0ms, ainda haverá um pequeno tempo para que o código seja completamente varrido.
- Ainda não há suporte para o comando de input. Ele será apenas ignorado.
- Não foram realizadas otimizações para que hajam execuções mais rápidas do código.
