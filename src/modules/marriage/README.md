# Módulo Matrimônio & Família (Pyxie Marriage Core)

Sistema completo e desacoplado de matrimônio, família e relacionamentos da Pyxie para Discord.js v14.

## Funcionalidades
- **Barra do Amor & Decaimento Preguiçoso (Lazy Decay)**: Redução de 20% a cada 24 horas, calculada sob demanda para poupar CPU.
- **Árvore da Vida**: Desbloqueio bilateral com Feijões Mágicos 🌱, cultivo a cada 12 horas e recarga de +10% de amor.
- **Casa do Casal = Casinha (`/py-home`)**: a casa agora é a Casinha. Quem tem a própria casa (grátis pelas Catacumbas ou comprada) convida o cônjuge para morar junto; no divórcio a casa fica com a dona original e os itens da outra pessoa voltam para ela ("separar bens").
- **Cofre do Amor Eterno**: depósito do casal que mora junto, com rendimento diário proporcional à Barra do Amor.
- **Força do Laço (`/py-marriage bond`)**: o lado duradouro do casamento (não cai como a Barra do Amor). 10 níveis com nome (Recém-casados → Laço Eterno), gesto do dia de cada pessoa (bilhete, café, abraço ou estrelas: +15 de Laço e +5% de amor), dia de Sintonia quando as duas fazem o gesto (+20 e sequência), e uma missão da semana a dois (date nights, gestos, sintonia, árvore, turnos do `/py-work` ou descidas nas Catacumbas) que dá +120 de Laço, amor cheio e uma lembrança para a Casinha de cada pessoa. As conquistas `bond_3`, `bond_7` e `bond_10` dão os títulos Laço Firme, Alma Gêmea e Laço Eterno. O antigo carinho (`affection`) agora é o abraço do dia.
- **Date Night (Teste de Sintonia)**: Quiz interativo a cada 12h com banco generativo de 400 questões bilíngues e prêmios em moedas.
- **Sistema de Filiação & Animação Sequencial**: Pipeline visual de 3 frames a cada 1.2s para a cegonha arcana, gerando até 5 filhos por casal.
- **Estágio & Trava Estrita de Processamento (Job Lock)**: Envio de filhos para estágios de 24h por 50 a 100 moedas com trava temporal rígida.

