import { useState } from "react";

const C = {
  bg:"#07111A", surface:"#0D1E2C", card:"#112030", border:"#1A3448",
  text:"#DDD5C5", muted:"#5A7A90",
  m5:"#7F77DD", m6:"#5DCAA5", m7:"#EF9F27", m8:"#D4537E", m9:"#85B7EB",
  good:"#50C878", bad:"#E05C5C", warn:"#D4C870", accent:"#7AB8D4",
  note:"#8FAF6A",
};

const modules = [
  {
    id:"m5", label:"M5", title:"Cifras de Bloco", color:C.m5,
    lists:["L3 Q3–Q6","L4 Q1–Q2"],
    sections:[
      {
        title:"Confusão e Difusão (Shannon)",
        lista:"L3 Q3 · L4 Q1",
        color:C.m5,
        points:[
          "DIFUSÃO: espalha influência de cada bit do texto claro por muitos bits do cifrado. Implementada por permutações. Efeito: 1 bit muda → ≈50% dos bits do cifrado mudam (efeito avalanche).",
          "CONFUSÃO: torna complexa a relação entre chave e cifrado. Implementada por S-boxes (substituições não-lineares). Dificulta deduzir a chave mesmo com muitos pares (claro, cifrado).",
          "F LINEAR (ex: R*K) → sem confusão real → ataque algébrico resolve a chave sem força bruta.",
          "Juntas formam a base de toda cifra de produto segura — Feistel implementa ambas.",
        ],
        note:"Apostila: 'Confusão dificulta relacionar chave e texto cifrado. Difusão espalha padrões do texto claro pela saída.' São conceitos de Shannon (1949).",
        relation:"Difusão responde à análise de frequência que quebrou o Vigenère (P1). Confusão responde à criptoanálise algébrica.",
      },
      {
        title:"Cifra de Feistel",
        lista:"L3 Q3 · L4 Q1 · L4 Q2",
        color:C.m5,
        points:[
          "Bloco 2w bits → L₀ | R₀. Cada rodada: Lᵢ = Rᵢ₋₁ e Rᵢ = Lᵢ₋₁ ⊕ F(Rᵢ₋₁, Kᵢ).",
          "Decriptação = mesmo algoritmo + subchaves em ordem REVERSA. Entrada com metades TROCADAS: Rₙ ‖ Lₙ.",
          "Por que funciona: o XOR se cancela — (A ⊕ F) ⊕ F = A. F não precisa ser invertível.",
          "5 parâmetros de segurança: tamanho do bloco, tamanho da chave, nº de rodadas, key schedule, função F.",
          "Exemplo L4 Q2: bloco 10100110, F=1111 → L₁=0110, R₁=1010⊕1111=0101 → saída 01100101.",
        ],
        note:"Apostila: A rede de Feistel é a realização prática das ideias de Shannon. F não precisa ser invertível — a própria estrutura garante reversibilidade.",
        relation:"AES NÃO usa Feistel (usa SPN). DES usa Feistel com 16 rodadas. IPSec usa AES-GCM na cifração do ESP (M8).",
      },
      {
        title:"DES e 3DES",
        lista:"L3 Q4",
        color:"#C9A84C",
        points:[
          "DES: bloco 64 bits, chave 56 bits efetivos (64 com 8 de paridade), 16 rodadas, S-boxes.",
          "Fraqueza: chave de 56 bits → 2⁵⁶ possibilidades → quebrado por força bruta (hardware moderno: horas).",
          "3DES — sequência EDE: C = E(K3, D(K2, E(K1, P))). Retrocompatibilidade: K1=K2=K3 → DES simples.",
          "Chave efetiva: 3 chaves → 168 bits; 2 chaves (K1=K3) → 112 bits.",
          "Problema do 3DES: manteve bloco de 64 bits → birthday attack após 2³² blocos (4 GB).",
        ],
        note:"Apostila: 'DES usa chave efetiva curta e é obsoleto. 3DES aplica DES três vezes para aumentar segurança e manter compatibilidade histórica.'",
        relation:"O bloco de 64 bits do DES/3DES é análogo ao q pequeno no DH (M7) — ambos tornam ataques de exaustão factíveis.",
      },
      {
        title:"AES e Modos de Operação",
        lista:"L3 Q5 · L3 Q6",
        color:C.m6,
        points:[
          "AES (Rijndael): NÃO usa Feistel. Bloco fixo 128 bits. AES-128: 10 rodadas; AES-192: 12; AES-256: 14.",
          "ECB: Cᵢ = E(K, Pᵢ). Determinístico, blocos iguais → cifrado igual. NÃO usar em dados com padrão.",
          "CBC: Cᵢ = E(K, Pᵢ ⊕ Cᵢ₋₁). Sem paralelismo na cifração. Requer IV único. Apenas confidencialidade.",
          "CTR: Cᵢ = Pᵢ ⊕ E(K, Nonce‖i). Paralelizável. NUNCA reutilizar (Nonce, K) — mesmo ataque do RC4.",
          "GCM: CTR + GHASH em GF(2¹²⁸) → confidencialidade + autenticidade em uma passagem.",
          "Por que rodadas ≠ segurança contra força bruta: rodadas combatem criptoanálise; espaço de chave combate força bruta.",
        ],
        note:"Apostila: 'CTR gera fluxo a partir de contadores. GCM combina CTR com autenticação por tag. ECB revela padrões; CBC encadeia blocos com IV.' GCM é o padrão moderno (TLS 1.3, IPSec ESP).",
        relation:"GCM é usado pelo ESP do IPSec (M8) e pelo TLS Record Protocol (M9). Reutilizar nonce no CTR = mesmo problema da reutilização de chave no RC4/WEP (P1).",
      },
    ]
  },
  {
    id:"m6", label:"M6", title:"Hash, MAC e HMAC", color:C.m6,
    lists:["L4 Q3–Q5"],
    sections:[
      {
        title:"Funções Hash — Propriedades",
        lista:"L4 Q4",
        color:C.m6,
        points:[
          "H(M): entrada variável → saída fixa (digest). 7 propriedades: tamanho variável, saída fixa, eficiência, pré-imagem, 2ª pré-imagem, colisão forte, pseudoaleatoriedade.",
          "Pré-imagem: dado h, inviável achar x com H(x)=h. Esforço 2ᵐ.",
          "2ª pré-imagem: dado x, inviável achar y≠x com H(y)=H(x). Esforço 2ᵐ.",
          "Colisão forte: inviável achar qualquer par x≠y com H(x)=H(y). Esforço 2^(m/2) — paradoxo do aniversário.",
          "Hierarquia: colisão forte ⟹ 2ª pré-imagem ⟹ pré-imagem. Inverso NÃO vale.",
          "Hash simples NÃO garante autenticidade — qualquer um pode recalcular H(M').",
        ],
        note:"Apostila: 'Hash simples não usa chave e não autentica origem. MAC usa chave secreta e autentica a mensagem.' Ataque de Yuval (colisão para assinatura): gerar 2^(m/2) variantes legítimas e fraudulentas.",
        relation:"Hash é usado internamente pelo HMAC (M6), pelo IPSec ESP para autenticação (M8), e pelo TLS Record Protocol e Handshake (M9).",
      },
      {
        title:"Hash XOR e Função de Compactação",
        lista:"L4 Q3 · L4 Q4",
        color:C.m6,
        points:[
          "Hash XOR: Hᵢ = Hᵢ₋₁ ⊕ Bᵢ. VULNERÁVEL: XOR é comutativo → reordenar blocos não muda o hash.",
          "Correção: incluir índice i ANTES do XOR (mas XOR com índice ainda pode cancelar em troca de posição). Solução robusta: rotação antes do XOR (RXOR do Stallings).",
          "Função de compactação f: (n bits + b bits) → n bits, com b > n. CVᵢ = f(CVᵢ₋₁, Yᵢ).",
          "Teorema Merkle-Damgård: se f resistente a colisões → hash iterativo também é.",
        ],
        note:"Apostila: A construção iterativa de Merkle-Damgård reduz a segurança do hash à segurança da função de compactação f. SHA-512 usa 80 rodadas por bloco de 1024 bits.",
        relation:"A estrutura iterativa do hash (cada bloco depende do anterior) é análoga ao encadeamento do modo CBC (M5) — ambos criam dependência sequencial.",
      },
      {
        title:"Paradoxo do Aniversário",
        lista:"L4 Q5",
        color:C.warn,
        points:[
          "Para m bits de hash: pré-imagem requer 2ᵐ, colisão requer apenas 2^(m/2).",
          "m=128: colisão em 2⁶⁴ ≈ 1,8×10¹⁹ → INSUFICIENTE (factível com clusters modernos).",
          "m=256: colisão em 2¹²⁸ ≈ 3,4×10³⁸ → SUFICIENTE (inviável com qualquer tecnologia previsível).",
          "Conversão: 2⁶⁴ ≈ (2¹⁰)⁶ × 2⁴ ≈ 10¹⁸ × 16 = 1,6×10¹⁹.",
        ],
        note:"Apostila: 'O paradoxo do aniversário é relevante porque permite encontrar colisões muito mais rápido do que a força bruta plena sugere.' SHA-256 oferece 128 bits de segurança efetiva contra colisão.",
        relation:"O mesmo raciocínio de 2^(m/2) se aplica ao tamanho de bloco de 64 bits do DES/3DES — birthday attack após 2³² blocos (M5).",
      },
      {
        title:"HMAC e Autenticação",
        lista:"L4 Q4 · L6 Q5",
        color:C.m6,
        points:[
          "MAC: hash COM chave secreta → garante integridade + autenticidade. Sem não-repúdio forte.",
          "HMAC(K,M) = H[(K⁺⊕opad) ‖ H[(K⁺⊕ipad) ‖ M]]. ipad=0x36, opad=0x5C.",
          "Tabela: Hash → integridade only. MAC/HMAC → + autenticidade. Assinatura digital → + não-repúdio.",
          "HMAC no ESP (L6 Q5): posição ao final do pacote ESP. Cobre ESP header + payload cifrado + trailer. NÃO cobre IP externo.",
        ],
        note:"Apostila: 'MAC é simétrico e não oferece não repúdio forte. Assinatura digital usa chave privada e pode ser verificada publicamente.' Ordem no receptor: verificar HMAC ANTES de decifrar (Encrypt-then-MAC).",
        relation:"HMAC é o mecanismo de autenticação do IPSec ESP (M8). TLS Record Protocol usa MAC derivado do Handshake (M9). RSA/DH do M7 resolve a distribuição da chave K do HMAC.",
      },
    ]
  },
  {
    id:"m7", label:"M7", title:"Criptografia Assimétrica", color:C.m7,
    lists:["L5 Q1–Q6"],
    sections:[
      {
        title:"Simétrica vs. Assimétrica",
        lista:"L5 Q1",
        color:C.m7,
        points:[
          "Simétrica: 1 chave secreta compartilhada. Problema: distribuição. n partes → n(n-1)/2 chaves.",
          "Assimétrica: par pública+privada. Distribuição resolvida. n partes → n pares.",
          "Sistema híbrido: assimétrica troca a chave de sessão; simétrica cifra os dados. Usado em TLS, SSH, PGP.",
          "Assimétrica TAMBÉM é vulnerável a força bruta e criptoanálise algébrica — mas espaço de chave gigantesco.",
          "Regra: pública do destinatário para confidencialidade. Privada do emissor para assinatura.",
        ],
        note:"Apostila: 'A pública pode ser distribuída. A privada deve ficar secreta e permite decriptar ou assinar. RSA pode cifrar e assinar. Diffie-Hellman estabelece chave compartilhada.'",
        relation:"O sistema híbrido é exatamente o que IPSec IKE usa (M8): DH assimétrico na Fase 1, AES simétrico nas IPSec SAs. TLS também: RSA/DH no Handshake, AES no Record Protocol (M9).",
      },
      {
        title:"RSA — Geração, Operação e Segurança",
        lista:"L5 Q2 · L5 Q3",
        color:C.m7,
        points:[
          "n=p×q, φ(n)=(p-1)(q-1), escolhe e com mdc(e,φ(n))=1, d=e⁻¹ mod φ(n).",
          "Encriptação: C=Mᵉ mod n. Decriptação: M=Cᵈ mod n. Assinatura: S=Mᵈ mod n.",
          "Exemplo L5 Q2: p=17, q=11 → n=187, φ(n)=160, e=7 → d=23. C=88⁷ mod 187=11. M=11²³ mod 187=88.",
          "Euclides estendido: 7×23=161=1+160 → 7d≡1 (mod 160) → d=23.",
          "Segurança: fatorar n é computacionalmente difícil. n pequeno → fatoração trivial. φ(n) conhecido → d calculável → RSA comprometido.",
        ],
        note:"Apostila: 'RSA se baseia na dificuldade de fatorar n. Conhecer φ(n) equivale a conhecer p e q — pois p+q = n−φ(n)+1 e pq=n formam equação quadrática com raízes p e q.'",
        relation:"A chave pública RSA é usada no TLS Handshake Fase 2 (autenticação do servidor via certificado) e Fase 3 (cifrar Pre-Master Secret). IKE usa RSA para autenticar roteadores (M8).",
      },
      {
        title:"Diffie-Hellman e Segurança",
        lista:"L5 Q4 · L5 Q5 · L5 Q6",
        color:C.m7,
        points:[
          "Parâmetros públicos: q (primo grande), α (raiz primitiva mod q).",
          "Alice: XA privado, YA=α^XA mod q público. Bob: XB privado, YB=α^XB mod q público.",
          "Chave compartilhada: K = YB^XA mod q = YA^XB mod q = α^(XA·XB) mod q.",
          "Segurança: logaritmo discreto — dado YA=α^XA mod q, encontrar XA é inviável para q grande.",
          "q pequeno → força bruta factível. Mitiga: q ≥ 2048 bits.",
          "MITM: Eve intercepta YA e YB, substitui pelos seus. Mitiga: assinar YA/YB com RSA + certificados PKI.",
          "L5 Q4: q=467, α=2, XA=400, XB=134 → YA=2^400 mod 467, YB=2^134 mod 467 → KA=KB.",
        ],
        note:"Apostila: 'DH é vulnerável a man-in-the-middle porque não autentica as partes. A solução é combinar DH com autenticação por certificado (como TLS e IKE fazem).'",
        relation:"DH é usado no IKE Fase 1 do IPSec (M8). TLS usa ECDHE (DH com curvas elípticas) no Handshake Fase 3 (M9). Ambos resolvem o mesmo problema: trocar chaves seguramente.",
      },
    ]
  },
  {
    id:"m8", label:"M8", title:"IPSec", color:C.m8,
    lists:["L6 Q1–Q5"],
    sections:[
      {
        title:"SA, SAD e SPD",
        lista:"L6 Q1",
        color:C.m8,
        points:[
          "SA: conexão lógica SIMPLEX (unidirecional). Identificada por SPI + IP destino + protocolo (AH/ESP).",
          "Bidirecional → 2 SAs. VPN (1 Matriz + 1 Filial + n Vendedores) → 2 + 2n SAs.",
          "SPD (Security Policy Database): POLÍTICA — PROTECT/BYPASS/DISCARD. Baseada em IP src, IP dst, protocolo.",
          "SAD (Security Association Database): ESTADO — chaves, algoritmos, SPI, sequence number, janela anti-replay.",
          "Fluxo: pacote chega → SPD consulta política → se PROTECT → SAD fornece como aplicar.",
        ],
        note:"Apostila: 'SAD guarda parâmetros das SAs. SPD define políticas sobre o que fazer com pacotes.' SPD = regulamento (o quê). SAD = manual operacional (como).",
        relation:"A SA do IPSec é análoga à sessão TLS (M9): ambas definem parâmetros criptográficos para uma relação. Diferença: SA é unidirecional, sessão TLS é bidirecional.",
      },
      {
        title:"AH e ESP",
        lista:"L6 Q2",
        color:C.m8,
        points:[
          "AH (protocolo 51): autenticação + integridade. SEM confidencialidade. Autentica IP externo (campos imutáveis).",
          "ESP (protocolo 50): confidencialidade + autenticação + integridade + anti-replay. NÃO autentica IP externo.",
          "Estrutura ESP modo túnel: [IP ext | ESP hdr (SPI+SeqN) | CIFRADO(IP orig+TCP+dados+trailer) | HMAC].",
          "Padding: alinha payload ao tamanho de bloco (AES = 16 bytes). Campo Pad Length indica quantos bytes.",
          "Next Protocol = 50 (ESP) ou 51 (AH) no IP externo indica ao receptor que é pacote IPSec.",
          "AH é deprecated (RFC 4302 desaconselha). Foco: ESP.",
        ],
        note:"Apostila: 'AH fornece autenticação e integridade. ESP pode fornecer confidencialidade, integridade e autenticação.' ESP = AH + confidencialidade. Por isso AH raramente é usado sozinho.",
        relation:"HMAC no ESP usa a mesma construção estudada no M6 (L6 Q5). A autenticação ESP garante os mesmos serviços que o MAC do Record Protocol TLS (M9).",
      },
      {
        title:"Modos Transporte e Túnel",
        lista:"L6 Q2",
        color:C.m8,
        points:[
          "Transporte: [IP orig | ESP/AH | TCP | dados]. IP original mantido — endereços visíveis. Host-to-host.",
          "Túnel: [IP ext | ESP/AH | IP orig cifrado | TCP | dados]. IPs internos ocultos. Gateway-to-gateway.",
          "VPN site-to-site → modo TÚNEL: endpoints são gateways, não hosts. IPs internos ficam cifrados.",
          "Overhead: Transporte < Túnel (tunel adiciona novo cabeçalho IP externo).",
        ],
        note:"Apostila: 'Transporte protege principalmente a carga útil. Túnel encapsula o pacote IP original inteiro.' VPNs usam túnel para ocultar topologia interna.",
        relation:"Modo túnel e o sistema híbrido são a mesma ideia: encapsular para proteger. TLS também encapsula dados HTTP dentro do Record Protocol (M9).",
      },
      {
        title:"IKE e HMAC",
        lista:"L6 Q3 · L6 Q5",
        color:C.ike||C.m8,
        points:[
          "IKE: 3 responsabilidades → autenticar entidades, negociar parâmetros, gerar chaves (via DH).",
          "Fase 1: DH anônimo → autenticação com certificados RSA → IKE SA BIDIRECIONAL.",
          "Fase 2: dentro do canal seguro → 2 IPSec SAs UNIDIRECIONAIS. Chaves derivadas do segredo mestre.",
          "IKE SA ≠ IPSec SA: IKE SA protege as negociações; IPSec SA protege os dados do usuário.",
          "Custo: Fase 1 usa assimétrica (cara, uma vez). Fase 2 usa simétrica (rápida, para o tráfego).",
          "MITM no IKE mitigado: assinar YA/YB com chave privada RSA + certificados de CA confiável.",
          "HMAC no ESP (L6 Q5): integridade + autenticidade. Posição: ao final do ESP. Cobre ESP hdr + payload cifrado + trailer.",
        ],
        note:"Apostila: 'IKE automatiza a criação de SAs, evitando configuração manual. A Fase 1 cria um canal seguro (IKE SA); a Fase 2 usa esse canal para criar as IPSec SAs.' Mesmo padrão híbrido do TLS.",
        relation:"IKE Fase 1 usa DH (M7) + RSA (M7) exatamente como TLS Handshake usa DH/RSA para estabelecer chaves. Tanto IPSec quanto TLS convergem para o sistema híbrido (M7).",
      },
      {
        title:"Best-Effort e Transformação do Pacote",
        lista:"L6 Q4",
        color:C.m8,
        points:[
          "IP Best-Effort: sem garantia de entrega, ordem ou unicidade. Cada datagrama roteado independentemente.",
          "Sequence Number no ESP: existe justamente porque IP pode duplicar pacotes. Anti-replay via janela deslizante.",
          "Fluxo remetente: recebe IP orig → consulta SPD → consulta SAD → padding → ESP trailer → cifra → ESP hdr → HMAC → IP ext.",
          "Fluxo receptor: recebe → vê Protocol=50 → extrai SPI → localiza SA no SAD → verifica SeqN → verifica HMAC → decifra → extrai IP orig.",
        ],
        note:"Apostila: 'O IPSec adiciona controle de sequência e integridade que o IP deliberadamente omite.' O IP foi projetado para ser simples e best-effort — segurança foi adicionada depois.",
        relation:"A verificação de integridade (HMAC) no receptor IPSec é análoga à verificação de MAC no TLS Record Protocol (M9). Ambos verificam antes de processar os dados.",
      },
    ]
  },
  {
    id:"m9", label:"M9", title:"TLS", color:C.m9,
    lists:["L7 Q1–Q5"],
    sections:[
      {
        title:"Sessão, Conexão e Record Protocol",
        lista:"L7 Q1 · L7 Q2",
        color:C.m9,
        points:[
          "Sessão TLS: parâmetros criptográficos reutilizáveis. Criada pelo Handshake. Múltiplas conexões podem compartilhar.",
          "Conexão TLS: canal peer-to-peer transitório. Associada a UMA sessão. Cada conexão tem seus próprios IVs.",
          "Sessão existe para evitar Handshake completo (assimétrico, caro) a cada nova conexão.",
          "Record Protocol: camada base. Dois serviços: confidencialidade (chave AES) + integridade (chave MAC) — chaves DISTINTAS do Master Secret.",
          "Tipos de conteúdo: handshake, alert, change_cipher_spec, application_data.",
          "Fluxo: fragmentar → comprimir → MAC → cifrar → cabeçalho → TCP.",
        ],
        note:"Apostila: 'Sessão guarda parâmetros reutilizáveis. Conexão é o canal transitório. Handshake negocia parâmetros e chaves. Record Protocol protege os dados transmitidos.'",
        relation:"Sessão TLS ≈ IKE SA do IPSec (M8): ambas guardam parâmetros reutilizáveis e são criadas por protocolo específico (Handshake / IKE). Conexão TLS ≈ IPSec SA (dados de uso).",
      },
      {
        title:"Handshake — 4 Fases",
        lista:"L7 Q3",
        color:C.m9,
        points:[
          "Fase 1: ClientHello (versão, Client Random, Session ID, lista CipherSuites) + ServerHello (escolhas + Server Random).",
          "Fase 2: servidor envia Certificate + opcionalmente ServerKeyExchange + ServerHelloDone.",
          "Fase 3: cliente envia ClientKeyExchange (Pre-Master Secret cifrado com chave pública do servidor).",
          "Fase 4: ambos enviam ChangeCipherSpec (ativa algoritmos) + Finished (hash do handshake inteiro).",
          "Random: previne replay + garante unicidade das chaves. Master Secret = PRF(PMS, 'master secret', CR ‖ SR).",
          "CipherSuite: identifica combinação de troca de chaves + autenticação + cifração + MAC. Ex: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256.",
          "Autenticação do servidor: previne MITM — cliente verifica certificado via CA confiável.",
        ],
        note:"Apostila: 'O Handshake negocia a versão do protocolo, escolhe o conjunto criptográfico, autentica o servidor e estabelece segredos compartilhados.' Finished é a primeira mensagem com os novos algoritmos — verifica integridade de todo o Handshake.",
        relation:"TLS Handshake usa RSA/DH (M7) exatamente como IKE do IPSec (M8). O Pre-Master Secret no TLS cumpre o mesmo papel que o segredo mestre no IKE: base para derivação de chaves simétricas.",
      },
      {
        title:"Alert, CCS e Heartbleed",
        lista:"L7 Q4 · L7 Q5",
        color:C.hb||C.m9,
        points:[
          "Alert: 2 bytes [severidade | código]. Fatal(2) → encerra conexão imediatamente. Warning(1) → aviso.",
          "Fatal encerra CONEXÃO mas NÃO encerra outras conexões da mesma SESSÃO.",
          "Exemplo fatal: bad_record_mac. Exemplo warning: close_notify.",
          "ChangeCipherSpec: 1 byte de valor 1. NÃO faz parte do Handshake. Ativa CipherSpec pendente.",
          "Heartbeat (RFC 6250): keep-alive (verifica se peer está vivo) + firewall traversal (evita timeout).",
          "Comportamento correto: servidor copia EXATAMENTE payload_length bytes do payload recebido.",
          "Heartbleed: servidor não verificava payload_length ≤ tamanho_real → lia memória adjacente → até 64KB por request.",
          "Falha lógica: ausência de bounds checking. Não é falha criptográfica — é bug de C.",
          "Impacto Heartbleed: chaves privadas RSA, cookies, senhas, tokens. Sem rastros nos logs.",
        ],
        note:"Apostila: 'Heartbleed mostra que usar um protocolo criptográfico forte não basta. A implementação também precisa ser correta, validada e atualizada.' CVE-2014-0160, afetou 17% dos servidores HTTPS.",
        relation:"Alert fatal no TLS tem efeito análogo ao DISCARD na SPD do IPSec (M8): rejeita imediatamente. ChangeCipherSpec é o equivalente TLS da ativação de uma nova SA após o IKE (M8).",
      },
    ]
  },
];

const comparacoes = [
  {a:"Hash vs MAC", r:"Hash sem chave não autentica origem — qualquer um recalcula H(M'). MAC usa chave K secreta — sem K é inviável gerar MAC válido.", color:C.m6},
  {a:"MAC vs Assinatura Digital", r:"MAC é simétrico (ambos têm K), sem não-repúdio. Assinatura usa chave privada (só o dono assina), verificável publicamente — tem não-repúdio.", color:C.m7},
  {a:"DES vs AES", r:"DES: chave 56 bits, bloco 64 bits, Feistel, obsoleto. AES: chave 128/192/256 bits, bloco 128 bits, SPN, padrão atual.", color:C.m5},
  {a:"ECB vs CBC vs GCM", r:"ECB: blocos independentes, vaza padrões. CBC: encadeia com IV, sem paralelismo na cifração. GCM: CTR + autenticação GHASH, paralelizável, confidencialidade + autenticidade.", color:C.m5},
  {a:"RSA vs Diffie-Hellman", r:"RSA: cifra e assina. Segurança = dificuldade de fatorar n. DH: só troca chaves. Segurança = dificuldade do logaritmo discreto.", color:C.m7},
  {a:"AH vs ESP", r:"AH: autenticação + integridade, SEM confidencialidade, autentica IP externo. ESP: confidencialidade + autenticação + integridade, NÃO autentica IP externo. ESP é o padrão atual.", color:C.m8},
  {a:"SAD vs SPD", r:"SPD = POLÍTICA (o quê fazer: PROTECT/BYPASS/DISCARD). SAD = ESTADO (como fazer: chaves, algoritmos, SPI). SPD consulta SAD.", color:C.m8},
  {a:"Modo Transporte vs Túnel", r:"Transporte: IP original mantido, endereços visíveis, host-to-host. Túnel: IP encapsulado, IPs internos ocultos, gateway-to-gateway (VPNs).", color:C.m8},
  {a:"IPSec vs TLS", r:"IPSec: camada de rede, protege qualquer protocolo IP, transparente às aplicações, VPNs. TLS: acima do TCP, protege conexões específicas de aplicação, requer suporte na app.", color:C.m9},
  {a:"Sessão TLS vs Conexão TLS", r:"Sessão: parâmetros criptográficos reutilizáveis, criada pelo Handshake, persiste. Conexão: canal transitório associado a uma sessão, tem seus próprios IVs.", color:C.m9},
  {a:"IKE SA vs IPSec SA", r:"IKE SA: bidirecional, protege as negociações do IKE (Fase 1). IPSec SA: unidirecional, protege os dados do usuário (Fase 2). 1 IKE SA cria 2 IPSec SAs.", color:C.m8},
  {a:"Pré-imagem vs Colisão Forte", r:"Pré-imagem: dado h, achar x com H(x)=h — alvo fixo, esforço 2ᵐ. Colisão forte: qualquer par x≠y com H(x)=H(y) — sem alvo fixo, esforço 2^(m/2).", color:C.m6},
];

function Tag({label, color}){
  return <span style={{background:`${color}22`,color,fontSize:10,padding:"2px 8px",borderRadius:10,fontFamily:"monospace",border:`1px solid ${color}44`,fontWeight:700}}>{label}</span>;
}

function NoteBox({text}){
  return <div style={{background:"#0A1A0A",border:`1px solid ${C.note}44`,borderLeft:`3px solid ${C.note}`,borderRadius:7,padding:"9px 12px",marginTop:8,display:"flex",gap:8}}>
    <span style={{fontSize:13,flexShrink:0}}>📗</span>
    <span style={{color:C.note,fontSize:12,lineHeight:1.6,fontStyle:"italic"}}>{text}</span>
  </div>;
}

function RelBox({text}){
  return <div style={{background:"#0A0A1A",border:`1px solid ${C.m9}44`,borderLeft:`3px solid ${C.m9}`,borderRadius:7,padding:"9px 12px",marginTop:6,display:"flex",gap:8}}>
    <span style={{fontSize:13,flexShrink:0}}>🔗</span>
    <span style={{color:C.m9,fontSize:12,lineHeight:1.6}}>{text}</span>
  </div>;
}

function Section({sec}){
  const [open,setOpen]=useState(true);
  return <div style={{marginBottom:12}}>
    <div onClick={()=>setOpen(!open)} style={{background:C.card,border:`1px solid ${sec.color}44`,borderRadius:8,padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
      <span style={{color:sec.color,fontWeight:700,fontSize:14,flex:1}}>{sec.title}</span>
      <Tag label={sec.lista} color={sec.color}/>
      <span style={{color:sec.color,fontFamily:"monospace",fontSize:12}}>{open?"▲":"▼"}</span>
    </div>
    {open&&<div style={{background:C.surface,border:`1px solid ${sec.color}33`,borderRadius:"0 0 8px 8px",padding:"12px 14px",borderTop:"none"}}>
      {sec.points.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:8,marginBottom:7}}>
          <span style={{color:sec.color,fontWeight:700,flexShrink:0,marginTop:1}}>›</span>
          <span style={{color:"#A8C0D0",fontSize:13,lineHeight:1.6}}>{p}</span>
        </div>
      ))}
      <NoteBox text={sec.note}/>
      <RelBox text={sec.relation}/>
    </div>}
  </div>;
}

function CheckItem({text}){
  const[done,setDone]=useState(false);
  return <div onClick={()=>setDone(!done)} style={{display:"flex",alignItems:"flex-start",gap:8,background:done?"#0A1A10":C.surface,border:`1px solid ${done?"#2A5A34":C.border}`,borderRadius:6,padding:"7px 10px",cursor:"pointer",marginBottom:4}}>
    <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${done?C.good:"#3A5A74"}`,background:done?C.good:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
      {done&&<span style={{color:C.bg,fontSize:9,fontWeight:700}}>✓</span>}
    </div>
    <span style={{color:done?"#7ABA8A":"#8AAABB",fontSize:12,lineHeight:1.5,textDecoration:done?"line-through":"none"}}>{text}</span>
  </div>;
}

export default function App(){
  const[activeMod,setActiveMod]=useState("m5");
  const[view,setView]=useState("resumo");
  const mod=modules.find(m=>m.id===activeMod);

  return <div style={{fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",background:C.bg,minHeight:"100vh",color:C.text,paddingBottom:80}}>
    <div style={{background:"linear-gradient(160deg,#050C14 0%,#0A1828 50%,#07101A 100%)",borderBottom:`1px solid ${C.border}`,padding:"30px 24px 20px",textAlign:"center",position:"relative",overflow:"hidden"}}>
      {[C.m5,C.m6,C.m7,C.m8,C.m9].map((col,i)=><div key={i} style={{position:"absolute",borderRadius:"50%",border:`1px solid ${col}14`,width:[380,280,440,320,260][i],height:[380,280,440,320,260][i],top:["-180px","-40px","-210px","10px","-80px"][i],left:["3%","63%","-6%","74%","44%"][i],pointerEvents:"none"}}/>)}
      <div style={{fontSize:10,letterSpacing:6,color:C.muted,textTransform:"uppercase",marginBottom:10,fontFamily:"monospace"}}>ICP473 · P2 · Revisão Completa</div>
      <h1 style={{fontSize:"clamp(18px,4.5vw,30px)",fontWeight:700,color:"#F5EDE0",margin:"0 0 6px"}}>Resumo Completo P2</h1>
      <p style={{color:"#4A7090",fontSize:13,margin:"0 0 4px",fontStyle:"italic"}}>Pontos das listas · Relações entre módulos · Observações da apostila</p>
      <p style={{color:C.warn,fontSize:12,fontFamily:"monospace",margin:"0 0 16px"}}>L3·L4·L5·L6·L7 · Prova Qua 17/06</p>
      <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
        {modules.map(m=><div key={m.id} style={{background:`${m.color}15`,border:`1px solid ${m.color}44`,borderRadius:20,padding:"3px 12px",fontSize:11,fontFamily:"monospace",color:m.color}}>{m.label} {m.title}</div>)}
      </div>
    </div>

    <div style={{maxWidth:900,margin:"0 auto",padding:"18px 16px 0"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
        {[["resumo","📖 Resumo por Módulo"],["comp","⚡ Comparações"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setView(id)} style={{background:view===id?"#1A3040":C.card,border:`1px solid ${view===id?C.accent:C.border}`,borderRadius:8,padding:"10px",color:view===id?C.accent:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:view===id?700:400}}>{lbl}</button>
        ))}
      </div>

      {view==="resumo"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:20}}>
          {modules.map(m=>(
            <button key={m.id} onClick={()=>setActiveMod(m.id)} style={{background:activeMod===m.id?`${m.color}22`:C.card,border:`1px solid ${activeMod===m.id?m.color:C.border}`,borderRadius:8,padding:"9px 4px",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .2s"}}>
              <div style={{color:activeMod===m.id?m.color:C.muted,fontSize:13,fontWeight:700}}>{m.label}</div>
              <div style={{color:activeMod===m.id?"#A8C0D0":C.muted,fontSize:10,lineHeight:1.3}}>{m.title}</div>
              <div style={{color:activeMod===m.id?m.color:C.muted,fontSize:9,marginTop:2,fontFamily:"monospace"}}>{m.lists.join(" · ")}</div>
            </button>
          ))}
        </div>
        <div style={{borderBottom:`1px solid ${mod.color}44`,paddingBottom:10,marginBottom:16}}>
          <div style={{color:mod.color,fontSize:10,fontFamily:"monospace",letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>{mod.label} · {mod.lists.join(" · ")}</div>
          <h2 style={{color:"#DDD5C5",fontSize:18,fontWeight:700,margin:0}}>{mod.title}</h2>
        </div>
        {mod.sections.map((sec,i)=><Section key={i} sec={sec}/>)}
      </>}

      {view==="comp"&&<div>
        <div style={{marginBottom:14}}>
          <h2 style={{color:"#DDD5C5",fontSize:16,fontWeight:700,margin:"0 0 4px"}}>⚡ Comparações Essenciais — Apostila Cap. 6</h2>
          <p style={{color:C.muted,fontSize:12,margin:0}}>Os pontos mais cobrados em questões discursivas</p>
        </div>
        {comparacoes.map((c,i)=>(
          <div key={i} style={{background:C.card,border:`1px solid ${c.color}44`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
            <div style={{color:c.color,fontWeight:700,fontSize:13,marginBottom:6}}>{c.a}</div>
            <div style={{color:"#A8C0D0",fontSize:13,lineHeight:1.6}}>{c.r}</div>
          </div>
        ))}
        <div style={{background:"linear-gradient(135deg,#0A1520,#0A1A10)",border:`1px solid ${C.note}44`,borderRadius:12,padding:"16px 18px",marginTop:16}}>
          <div style={{color:C.note,fontWeight:700,fontSize:13,marginBottom:8}}>📗 Roteiro de véspera (apostila)</div>
          {["1. Hash, MAC e assinatura digital","2. RSA, DH e ataque MITM","3. TLS: Handshake, Record Protocol e Heartbleed","4. IPSec: ESP, SA, SAD, SPD e modo túnel","5. Cifras de bloco: DES, AES e modos de operação"].map((item,i)=>(
            <div key={i} style={{color:"#8AAABB",fontSize:13,paddingLeft:10,borderLeft:`2px solid ${C.note}55`,marginBottom:5}}>{item}</div>
          ))}
          <div style={{color:C.note,fontSize:12,marginTop:10,fontStyle:"italic"}}>"Saber explicar as diferenças entre mecanismos vale mais do que decorar tabelas internas de algoritmos."</div>
        </div>
      </div>}
    </div>
  </div>;
}
