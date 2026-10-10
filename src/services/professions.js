const professions = {
  agricultor: {
    label: 'Agricultor(a)',
    words: 'arado adubo agricultura algodao amendoim arroz banana colheita celeiro cenoura campo cana capina carrinho chiqueiro cebola cultivo enxada estufa feijao fertilizante fazenda feno folha gado grao horta irrigacao lavoura leite milho mudas pasto plantacao plantio praga regador semente silo soja tomate trator trigo uva vaca venda verdura abobora acucar agua agricultor alfafa ameixa apiario aveia beterraba broto cabra cafe cafeeiro canteiro carpir cevada chuva coentro compostagem curral ervilha espantalho farinha feno figo galinha girassol inseto laranja mandioca manga mel melancia morango oliveira ordenha organico paineira palha pimentao pomar porco queijo raiz repolho rural safra salada salsa suino terra tempero torrao trabalho'.split(' '),
  },
  cozinheiro: {
    label: 'Cozinheiro(a)',
    words: 'abacate acucar alho almoco amendoim arroz assadeira azeite bacon banana bancada batedor batata bolo brigadeiro brocolis caldo camarão canela carne cebola cenoura chef chocolate churrasco colher cozinha cozinheiro creme croquete cuscuz doce empada erva espatula farinha feijao fermento forno frigideira fritura geleia gengibre gordura garfo massa macarrao manteiga mel milho molho mostarda mousse noz nutella oleo oregano panela pao parmesao pastel peixe pimenta pimentao prato presunto receita recheio refogado restaurante sal salada salsa sanduiche sobremesa sopa sorvete tempero tomate torta trigo utensilio uva vinagre vinho colherada degustacao empratamento fogao fogareiro grelha guarnicao higiene ingrediente jantar lasanha louro menu merenda mistura nata nutricao panelao pudim purê risoto rocambole roux salsicha servico sushi tacho talher tapioca textura travessa vitrine'.split(' '),
  },
  professor: {
    label: 'Professor(a)',
    words: 'aluno aula avaliacao biblioteca boletim caderno caneta classe conhecimento coordenacao colega concurso conteudo correcao curso debate dever didatica diretor disciplina docente educacao ensino escola estudo exercicio explicacao faculdade formulario giz historia leitura licao livro laboratorio matematica materia mestre metodologia nota orientacao quadro pesquisa professor prova projeto redação recreio reforco regua sala seminario silencio tarefa tecnologia tese turma vestibular alunoacao apostila aprendizagem argumento aritmetica atividade atencao autor certificado ciencia colegial comunicacao conceito cultura curriculo desenho dialogo diploma escritor escrita filosofia fisica geografia gramatica informacao instrucao literatura logica mapa memoria modulo pedagogia planejamento pratica pergunta psicologia resposta secretaria simulacao sintaxe socrates sociologia tabuada trabalho universidade vocabulario'.split(' '),
  },
  programador: {
    label: 'Programador(a)',
    words: 'algoritmo api aplicativo array banco backend booleano bug classe codigo compilador commit computador constante consulta cookie css dado debug deploy desenvolvimento devops docker dominio editor endpoint erro evento framework funcao github frontend git html javascript json linguagem laço logica loop memoria metodo mobile modulo servidor mysql objeto operador pacote pagina parametro patch plugin programa programador projeto python query react rede repositorio requisito script seguranca software sintaxe sistema string tabela terminal teste token tipo usuario variavel versionamento web arquitetura autenticacao automacao classe cloud commitacao container banco-dados documentacao estrutura firebase fluxo interface internet linux merge modelo node programaçao prototipo refatoracao regex responsividade scrum sql stack tecnologia thread typescript virtualizacao webhook websocket angular backup cache dashboard engine excecao hospedagem navegador pipeline pull request'.split(' '),
  },
  medico: {
    label: 'Médico(a)',
    words: 'agulha ambulancia anestesia aparelho artéria atendimento bacteria batimento cirurgia clinica consulta curativo diagnostico doenca doutor enfermagem exame febre farmacia ferida fisioterapia fratura gaze hospital imune infeccao injecao laboratorio leito medico medicamento memoria musculo neurologia paciente pressao prontuario pulso receita remédio sala sangue saude sintoma soro terapia teste tratamento vacina veia virus consultaçao abdomen alergia analgesico anatomia aparelho auditivo arritmia assepsia asma bacteria benigno cardiologia celula colesterol craniado dengue dieta enfermaria estetoscopio exame fisico faringe fisiologia frasco glicose gripe hemograma higiene hormonio infectologia insulina intestino lesao ligamento mascara microbiologia neurologista oxigenio pediatria pele pneumonia radiografia recuperacao rim respiracao retina sedacao seringa cirurgiao tatico temperatura tendao trauma ultrassom urina uti'.split(' '),
  },
  musico: {
    label: 'Músico(a)',
    words: 'acorde afinacao amplificador arranjo artista bateria baixo banda baritono batida cantor cancao cavaquinho clave compasso composicao concerto coral corda coro decibel ensaio escala estudio flauta forma gravação guitarra harmonia instrumento jazz letra melodia microfone musica musico nota orquestra piano partitura palco percusao playback plugue refrão ritmo rock saxofone solo som soprano teclado tom trompete violao vocal volume acordeon agudo andamento arranjo musical baixo eletrico backing banda marcacao metrônomo mixagem monitor musica popular pauta performance regente repertorio ressonancia sampler sinfonia solfejo soundtrack stereo tambor timbre tonalidade turne violino violoncelo voz afinador acústica apresentacao audicao compositor contrabaixo equalizador festival gravadora improviso luthier maestro masterizacao megafone musicaçao opereta operador'.split(' '),
  },
  fotografo: {
    label: 'Fotógrafo(a)',
    words: 'abertura album angulo arquivo arte autofocus camera captura cenario celular clique composicao contraste cor crop detalhe digital exposicao flash foco fotografia fotografo filtro filme flash frontal lente luz macro memoria modelo montagem negativo obturador paisagem pessoa pixel pose retrato revelacao sombra tripé zoom acervo analogico aplicativo arquitetura assunto balanceamento bateria brilho cabide cartao censura chroma claridade cliente cobertura criacao enquadramento estúdio editorial equipamento escala evento foto frame galeria granulação imagem impressao instante iso laboratorio locacao longa exposicao moldura natureza nitidez objeto panorama perspectiva portfolio profissional raw reflexo resolução rua sensor sessao selfie silhueta textura tonalidade tratamento velocidade video visualizacao'.split(' '),
  },
  mecanico: {
    label: 'Mecânico(a)',
    words: 'abastecimento acelerador alinhamento amortecedor bateria bengala bloco borracha cambio carburador carroceria catalisador cilindro combustivel correia direcao disco embreagem eixo escapamento filtro freio garagem ignicao injecao junta lata lubrificante macaco mecanico motor oleo pastilha pneu radiador roda rolamento sensor tanque transmissao turbo valvula veiculo vela volante virabrequim agua alternador ar condicionado arranque balanceamento biela bomba cabo camara capô chassis compressor diagnóstico eletrica engrenagem ferramenta fluido fusivel gasolina guincho hidráulica injeção lanternagem manometro marcha molas painel parafuso pistao polia protetor radiador reparo revisao suspensão tampa torneiro torque tracao troca ventilador vidro'.split(' '),
  },
  vendedor: {
    label: 'Vendedor(a)',
    words: 'anuncio atendimento balcão bonificacao cliente comercio compra comprador contrato desconto entrega estoque etiqueta fornecedor garantia loja marketing mercado mercadoria meta negociacao oferta pagamento pedido pesquisa preco produto promotor proposta receita vendedor venda vitrine anuncio abordagem argumento atacado audiencia caixa cadastro campanha cartao catalogo concorrente consumidor conversa credito cupom demonstracao distribuidor ecommerce equipe fidelidade gerente horario inventario lead marca margem mensagem metodo online oportunidade parcelamento planejamento promocao prospecto publico qualidade representante retorno salario setor shopping sistema telefone ticket transacao treinamento varejo visita whatsapp assinatura avaliacao brinde canal comercio exterior consultor demanda embalagem envio exposicao fechamento lucro nota fiscal orcamento pagamento pos-venda'.split(' '),
  },
  artista: {
    label: 'Artista',
    words: 'aquarela argila arte artista atelie aquarela banner barro pincel brilho busto canvas caricatura ceramica cerne colagem cor desenho escultura esboço estampa exposicao fantasia figura forma grafite gravura ilustracao imagem instalacao lapis linha madeira mural obra oficina oleo papel pintura pincelada plastico portfolio retrato textura tinta tela tridimensional verniz aquarela abstrato acabamento anatomia aquarela arte-final bico composição criacao desenho digital detalhe diretor dourado enquadramento estilo expressionismo figurino fotografia galeria geometria icone impressao inspiracao lamina paisagem paleta perspectiva performance personagem pincelada poster profundidade projeto realismo roteiro cenário serigrafia simbolo tecnica teatro tema tonalidade traço visual escultura ceramista decoracao figurino mosaico monumento restauracao'.split(' '),
  },
  dublador: {
    label: 'Dublador(a)',
    words: 'microfone estudio voz dublagem gravacao personagem animacao filme serie locucao fone cabine redublagem labial sincronia fala tom timbre entonacao diccao respiracao casting diretor papel audio mixer roteiro take cena emocao enfase pausa playback canal sonoplastia atriz ator narrador trailer desenho anime game curta longa versao brasileira canais efeito reverberacao equalizacao compressor interpretacao impostacao articulacao gravador faixa pista sincronismo ruido popfilter acustica masterizacao sessao contracena ensaio locutor vozes original elenco escala projeto emissora estudio-dublagem falante fala-rapida grito sussurro choro risada gargalhada voz-grave voz-aguda sotaque modulacao microfonacao trilha dublado versao trailer-dublado'.split(' '),
  },
  desenvolvedor_jogos: {
    label: 'Desenvolvedor(a) de Jogos',
    words: 'game engine unity unreal godot pixel sprite textura modelo shader fisica colizao render animacao gameplay roteiro fase level designer nivel personagem inimigo boss mapa inventario quest hud som trilha mecanica loop bug glitch build compilacao teste fps framerate controle joystick teclado mouse vr inteligencia artificial pathfinding hitbox poligono malha iluminacao particula efeito particulas gravidade pulo corrida ataque defesa dano vida mana save checkpoint menu tela loading shader-graph script csharp cpp python lua balanceamento prototipo vertical-slice playtest publicacao steam console mobile itch indie estudio publisher narrativa cutscene ambientacao otimizacao renderizador'.split(' '),
  },
  psicologo: {
    label: 'Psicólogo(a)',
    words: 'mente cerebro terapia consulta paciente sessao acolhimento escuta empatia comportamento emocao sentimento trauma angustia ansiedade depressao fobia estresse saude mental psicoterapia psicanalise cognitivo comportamental gestalt humanismo inconsciente ego id superego consciencia memoria atencao percepcao vinculo diagnostico relatorio anamnese evolucao etica sigilo setting divan consultorio clinica acolher intervencao escuta-ativa transferencia contratransferencia relaxamento mindfulness respiracao luto perda superacao auto-estima autocuidado identidade personalidade infancia desenvolvimento neuropsicologia teste psicologico escala avaliacao resiliencia bem-estar grupo casal familia plantao orientacao vocacional mediacao conflito'.split(' '),
  },
  telemarketing: {
    label: 'Operador(a) de Telemarketing',
    words: 'headset ligacao chamada telefone ramal atendimento cliente operador sac suporte venda cobranca receptivo ativo central callcenter contact fila espera discador script protocolo registro sistema crm ticket resolucao pausa feedback monitoria qualidade gravacao nps csat tma tme meta bonus comissao cancelamento retencao negociacao proposta oferta plano portabilidade contrato informacao cadastro confirmacao transferencia supervisor coordenador equipe operacao campanha lead discagem retorno reclamacao elogio ouvidoria horario escala produtividade tabulacao motivo agendamento cordialidade comunicacao agilidade paciencia persuasao argumento'.split(' '),
  },
  animador_festa: {
    label: 'Animador(a) de Festa',
    words: 'festa aniversario comemoracao parabens bolo balao bexiga recreacao brincadeira danca musica microfone fantasia peruca palhaco mascara maquiagem pintura facial escultura baloes gincana jogo risada alegria crianca infantil buffet salao decoracao magia truque palco animador personagem show dancinha corre-cutia cabo-de-guerra danca-das-cadeiras queimada pega-pega esconde-esconde corrida saco trenzinho parabens-pra-voce confete serpentina guloseima pipoca algodao-doce recreador lembrancinha animacao energia sorriso aplausos diversao convidados palco-infantil palhacada brincadeiras teatro fantoche oficinas cama-elastica piscina-bolinhas brinquedo figurino contacao historias'.split(' '),
  },
  advogada: {
    label: 'Advogado(a)',
    words: 'direito processo lei constituicao tribunal juiz audiencia julgamento peticao recurso liminar acordao jurisprudencia contrato honorarios cliente defesa acusacao ministerio publico oab vara comarca sentenca despacho inicial contestacao apelacao habeas-corpus mandado-seguranca prova testemunha pericia parecer consultoria litigio acordo conciliacao mediacao estatuto codigo penal civil trabalhista tributario administrativo empresarial sustentacao-oral prazo preclusao revelia intimacao citacao certidao procuracao instrumento estagiario assessor promotor magistrado desembargador plenário júri réu autor peticionamento protocolo custodia tutela cautelar dano-moral responsabilidade-civil cumprimento-sentenca execucao embargos agravo transito-em-julgado sumula repercussao-geral'.split(' '),
  },
  alquimista: {
    label: 'Alquimista',
    isMagic: true,
    beanCost: 1,
    emoji: '⚗️',
    words: 'alquimia transmutacao pocao elixir cadinho alambique retorta destilacao sublimacao calcinacao solucao quintessencia eter chumbo ouro prata mercurio enxofre sal hermetico pedra-filosofal panaceia tabula-esmeralda hermes atanor frasco ampola tubo-ensaio reagente reagente-volatil catalisador precipitacao soluto solvente menstruo tintura orvalho calcinador banho-maria alembico fermentacao coagulacao putrefacao rubedo albedo nigredo citrinitas opus-magnum homunculo ouroboros essencia alquimica fluido prisma matriz arcana sopro-vital cristalizacao extracao maceracao filtro cinza cinabrio antimonio vitriolo arsenico fosforo espargiria salitre magnesio calico decantacao refluxo licor fusao condensacao evaporacao hermetismo espirito corpo alma mercurial vitrificacao tintura-rubra elixir-da-vida'.split(' '),
  },
  mago: {
    label: 'Mago(a)',
    isMagic: true,
    beanCost: 1,
    emoji: '🔮',
    words: 'arcano magia feitico conjuracao ritual invocacao mana orbe grimorio runas circulo-magico varinha cajado pergaminho pentagrama elemento fogo gelo raio terra agua ar eter vazio-cosmico encantamento feiticeiro bruxo arquimago feitiçaria ilusao transmutacao necromancia abjuracao adivinhacao canalizacao ressonancia astral dimensao portal sigilo palavra-poder aura foco-arcano cristais ametista obsidiana levitacao teleporte barreira escudo-magico raio-mistico clarividencia telepatia feixe-estelar eclipse supernova constelacao sacrificio oferenda transcendencia alma centelha conjurador feiticeira runico feitiço-proibido circulo-de-invocacao conjurar canalizar encantamento-astral cajado-runico essencia-arcana feitico-celeste magia-branca magia-negra ocultismo invocador'.split(' '),
  },
  ferreiro: {
    label: 'Ferreiro(a)',
    isMagic: true,
    beanCost: 1,
    emoji: '⚒️',
    words: 'forja bigorna martelo foles tenaz brasa carvao escoria tempera recozimento revenimento cadinho molde lingote aco ferro bronze latao cobre prata ouro mythril oricalco adamante aco-damasco titanio meteorito escamas-dragao garra-beast osso-demoniaco runas encantamento gume lamina fio espada machado lanca adaga mangual maca alabarda florete claymore cimitarra nodachi katana armadura elmo cota-de-malha peitoral manopla grevas escudo broquel escudo-torre excalibur mjolnir gungnir caliburn gram tyrfing durandal muramasa kusanagi aegis forjador armeiro mestre-artifice cinzas fagulha caldeira martelada fundicao tempera-oleo dureza rockwell polimento rebarba rebite guarda pomo bainha canelura gusa pederneira sopro-dragao fole-duplo marreta talhadeira malho brunidor cinzel desbaste solda-caldeada bigorna-dupla'.split(' '),
  },
  rei_rainha: {
    label: 'Rei / Rainha',
    isMagic: true,
    beanCost: 2,
    emoji: '👑',
    words: 'coroa trono cetro reinado soberano monarca imperio paz guerra colheita diplomacia tributo imposto celeiro sementeira seca enchente carestia peste motim revolta senado corte conselho chanceler general legiao falange cavalaria arqueiros cerco catapulta ariete muralha baluarte tratado alianca casamento dinastia herdeiro sucessao roma cartago persia bizancio dinastia-han califado otomano feudo vassalo suserano nobreza plebe decreto edito tesouro cofre cunhagem moeda censo fronteira espiao embaixador banquete justa torneio julgamento clemente tirania estrategia rotas-seda caravana guarnicao armisticio rendicao parlamento cetro-real sagracao trono-dourado bastiao coroa-louros alvara regente imperatriz corte-real soberania plebiscito guarda-real edito-imperial proclamacao estandarte brasao'.split(' '),
  },
  domador_feras: {
    label: 'Domador(a) de Feras',
    isMagic: true,
    beanCost: 2,
    emoji: '🦁',
    words: 'lobo urso leao tigre guepardo leopardo onca jaguar puma lince raposa coiote hiena chacal elefante rinoceronte hipopotamo girafa zebra bisao bufalo camelo lhama alce cervo javali gorila chimpanze babuino macaco aguia gaviao falcao coruja abutre condor pelicano pinguim cisne tucano arara flamingo orca baleia golfinho tubarao arraia foca leao-marinho morsa polvo lula jacare crocodilo sucuri cascavel naja camaleao dragao-de-komodo sapo salamandra lontra castor doninha texugo esquilo coelho morcego grifo fenrir sleipnir cerbero quimera pegaso hidra leviatana kraken kelpie cu-sith basilisco dragao manticora fenix minotauro roc harpia siren salamandra-de-fogo hipogrifo beemote adestramento rastro domacao coleira chicote assobio instinto alcateia presas garras sela arreio comando respeito territorio feromonio emboscada rugido bando predador feras'.split(' '),
  },
  aniquilador_vegetais: {
    label: 'Aniquilador(a) de Vegetais',
    isMagic: true,
    beanCost: 2,
    emoji: '🥦',
    words: 'clorofila fotossintese folha caule raiz estomato xilema floema celulose cloroplasto seiva petala estame pistilo polinizacao semente broto fruto tuberculo rizoma bulbo solanina alcaloide beladona mandioca-brava cicuta veneno toxina amiloplasto lignina compostagem dessecacao herbicida capina poda arado ceifa aniquilacao triturador desfolhador queimada machado foice extrator toxico comestivel berinjela tomate batata jilo chuchu brocolis couve repolho espinafre rabanete nabo beterraba cenoura alface rucula aipo coentro cebola alho pimentao abobora quiabo vagem ervilha lentilha espinho urtiga casca podridao praga fungo mildio ferrugem necrose extincao anti-vegetal odio-legumes lamina-desfolhadora ceifador picador caldeirao decomposicao corte exterminador botanica erradicacao clorofila-zero'.split(' '),
  },
};

const commonWorkWords = 'atividade atendimento habilidade pratica rotina tarefa oficio tecnica ferramenta material equipe horario cliente estudo experiencia servico qualidade resultado processo planejamento organizacao cuidado producao aprendizado treinamento'.split(' ');

for (const [key, profession] of Object.entries(professions)) {
  let fillerIndex = 0;
  while (profession.words.length < 100) {
    profession.words.push(`${commonWorkWords[fillerIndex % commonWorkWords.length]}-${key}`);
    fillerIndex += 1;
  }

  if (profession.words.length < 100) {
    throw new Error(`A profissão ${profession.label} precisa de pelo menos 100 palavras.`);
  }
}

module.exports = professions;