import { useState, useCallback } from "react";
const C={bg:"#07111A",surface:"#0D1E2C",card:"#112030",border:"#1A3448",text:"#DDD5C5",muted:"#5A7A90",m5:"#7F77DD",m6:"#5DCAA5",m7:"#EF9F27",m8:"#D4537E",m9:"#85B7EB",good:"#50C878",bad:"#E05C5C",warn:"#D4C870",accent:"#7AB8D4"};

const allQ=[
  // M5
  {id:1,mod:"M5",lista:"L3 Q3",color:C.m5,q:"O que é DIFUSÃO segundo Shannon?",opts:["Torna opaca a relação entre chave e cifrado","Espalha a influência de cada bit do texto claro por muitos bits do cifrado","Substitui bytes usando S-boxes não-lineares","Divide o bloco em metades para processamento alternado"],ans:1,exp:"Difusão = espalhar bits (permutações). Confusão = tornar opaca a relação chave-cifrado (S-boxes). Feistel implementa ambas."},
  {id:2,mod:"M5",lista:"L3 Q3",color:C.m5,q:"Por que uma função F linear (ex: R*K) torna a cifra de Feistel insegura?",opts:["Aumenta muito o overhead computacional","Elimina a CONFUSÃO: a chave não influencia a saída e um ataque algébrico encontra a chave","Impede a decriptação com subchaves invertidas","Torna o efeito avalanche impossível de alcançar"],ans:1,exp:"F linear → a relação entre chave e saída é algebricamente resolvível. Sem confusão, um sistema de equações lineares revela a chave sem força bruta."},
  {id:3,mod:"M5",lista:"L4 Q2",color:C.m5,q:"Na cifra de Feistel com bloco 10100110 e F=1111, qual é o bloco de saída?",opts:["11001010","01100101","10110010","01011001"],ans:1,exp:"L₀=1010, R₀=0110. L₁=R₀=0110. R₁=L₀⊕F=1010⊕1111=0101. Saída: L₁‖R₁=01100101."},
  {id:4,mod:"M5",lista:"L4 Q1",color:C.m5,q:"Por que a decriptação de Feistel usa o mesmo algoritmo com as subchaves invertidas?",opts:["Porque F é sempre invertível","Porque o XOR cancela: (A⊕F)⊕F=A, independente de qual seja F","Porque as S-boxes são simétricas","Porque o bloco é dividido simetricamente"],ans:1,exp:"O XOR se cancela algebricamente: (A⊕F)⊕F=A. F não precisa ser invertível — a estrutura garante reversibilidade. Entrada da decriptação = metades trocadas: Rₙ‖Lₙ."},
  {id:5,mod:"M5",lista:"L3 Q4",color:C.m5,q:"Por que a sequência do 3DES é EDE (Encripta-Decripta-Encripta) e não EEE?",opts:["EDE é mais eficiente computacionalmente","EDE garante retrocompatibilidade: K1=K2=K3 resulta em DES simples","EDE fornece 3× mais rodadas de Feistel","EEE não é matematicamente correto para cifras de bloco"],ans:1,exp:"K1=K2=K3: E(K,D(K,E(K,P)))=E(K,P)=DES. O D cancela o E anterior. EEE também funcionaria, mas perderia a retrocompatibilidade com DES."},
  {id:6,mod:"M5",lista:"L3 Q4",color:C.m5,q:"Qual é o problema do 3DES com bloco de 64 bits?",opts:["A chave de 168 bits é desnecessariamente grande","Birthday attack torna-se factível após 2³² blocos (~4GB) com a mesma chave","64 bits é muito grande para roteadores modernos","O 3DES não suporta bloco de 64 bits"],ans:1,exp:"Paradoxo do aniversário: com bloco de 64 bits e 2³² blocos processados, a probabilidade de colisão supera 50%. Isso limita a quantidade de dados que podem ser cifrados com a mesma chave."},
  {id:7,mod:"M5",lista:"L3 Q5",color:C.m5,q:"'AES-128 com 10 rodadas é mais seguro que DES com 16 rodadas.' Verdadeiro ou falso?",opts:["Falso — mais rodadas = mais seguro","Verdadeiro — o espaço de chave (2¹²⁸ vs 2⁵⁶) é o que determina resistência a força bruta","Falso — DES com mais rodadas compensa a chave menor","Verdadeiro — AES usa SPN que é intrinsecamente superior ao Feistel"],ans:1,exp:"VERDADEIRO. Força bruta depende do espaço de chave, não do número de rodadas. Rodadas combatem criptoanálise diferencial/linear. 2¹²⁸/2⁵⁶=2⁷² vezes mais chaves no AES."},
  {id:8,mod:"M5",lista:"L3 Q6",color:C.m5,q:"O que o AES-GCM oferece que o AES-CBC NÃO oferece?",opts:["Paralelismo na cifração","Autenticidade além de confidencialidade","Suporte a blocos menores","Maior número de rodadas"],ans:1,exp:"GCM = CTR (confidencialidade) + GHASH (autenticação por tag de 128 bits). CBC oferece APENAS confidencialidade. Para autenticar com CBC é necessário um MAC separado."},
  // M6
  {id:9,mod:"M6",lista:"L4 Q4",color:C.m6,q:"Por que hash simples H(M) NÃO garante autenticidade?",opts:["Porque o digest é muito curto","Porque qualquer um pode calcular H(M') para uma mensagem alterada M'","Porque hash não usa chave secreta e qualquer um pode recalcular","Porque hash é reversível com força bruta"],ans:2,exp:"Sem chave secreta, qualquer atacante pode: (1) interceptar M, (2) alterar para M', (3) recalcular H(M') e substituir. HMAC resolve isso com a chave K: sem K é inviável gerar HMAC válido para M' alterada."},
  {id:10,mod:"M6",lista:"L4 Q4",color:C.m6,q:"Qual a ordem de grandeza do esforço para encontrar uma COLISÃO em um hash de 128 bits?",opts:["2¹²⁸","2⁶⁴","2³²","2⁸"],ans:1,exp:"Paradoxo do aniversário: colisão em 2^(m/2) = 2^64 ≈ 1,8×10¹⁹. Para pré-imagem (alvo fixo) o esforço é 2^128. A colisão é muito mais fácil porque não há alvo fixo."},
  {id:11,mod:"M6",lista:"L4 Q4",color:C.m6,q:"Qual é a hierarquia de resistências de uma função de hash?",opts:["Pré-imagem ⟹ 2ª pré-imagem ⟹ colisão forte","Colisão forte ⟹ 2ª pré-imagem ⟹ pré-imagem","Todas as três são independentes","2ª pré-imagem ⟹ pré-imagem ⟹ colisão forte"],ans:1,exp:"Colisão forte ⟹ 2ª pré-imagem ⟹ pré-imagem. A mais forte (colisão) implica as mais fracas. O inverso NÃO vale: resistente à pré-imagem não implica resistência a colisões."},
  {id:12,mod:"M6",lista:"L4 Q3",color:C.m6,q:"Por que o hash XOR simples (Hᵢ=Hᵢ₋₁⊕Bᵢ) é vulnerável?",opts:["Não suporta mensagens maiores que 1 bloco","XOR é comutativo: reordenar blocos não altera o hash","Produz um digest muito pequeno","Não usa padding adequado"],ans:1,exp:"A⊕B=B⊕A (comutatividade do XOR). Portanto H(B1,B2,B3)=B1⊕B2⊕B3=H(B2,B1,B3). Atacante reordena blocos sem alterar o hash. Solução: RXOR (rotação antes do XOR)."},
  {id:13,mod:"M6",lista:"L4 Q4",color:C.m6,q:"O que o Teorema de Merkle-Damgård garante?",opts:["Que SHA-512 é mais seguro que MD5","Se a função de compactação f é resistente a colisões, o hash iterativo também é","Que o paradoxo do aniversário não se aplica a hashes de 256 bits","Que HMAC é mais seguro que MAC simples"],ans:1,exp:"Merkle-Damgård reduz a segurança do hash inteiro à segurança da função de compactação f: (n+b bits)→n bits. Isso permite projetar e analisar apenas f, com a garantia de que a construção iterativa herda a segurança."},
  {id:14,mod:"M6",lista:"L4 Q5",color:C.m6,q:"Um hash de 128 bits é suficiente para segurança moderna contra colisões?",opts:["Sim, 2¹²⁸ tentativas é suficiente","Não — colisão requer apenas 2^64, factível com clusters modernos","Sim, mas apenas para assinaturas digitais","Não — qualquer hash abaixo de 512 bits é inseguro"],ans:1,exp:"m=128 bits → colisão em 2^64 ≈ 1,8×10¹⁹. Clusters modernos processam bilhões de hashes/segundo → factível em horas. SHA-256 (m=256, colisão em 2^128) é o mínimo recomendado."},
  {id:15,mod:"M6",lista:"L6 Q5",color:C.m6,q:"No pacote ESP, o HMAC autentica qual parte?",opts:["Apenas o payload decifrado (IP original + TCP)","ESP header + payload cifrado + ESP trailer (mas NÃO o IP externo)","O pacote IP externo completo","Apenas o ESP header (SPI + Sequence Number)"],ans:1,exp:"HMAC no ESP cobre: ESP header (SPI+SeqN) + payload cifrado + ESP trailer. O IP externo NÃO é autenticado (muda em trânsito: TTL decrementa a cada hop). O AH autenticaria o IP externo, mas é deprecated."},
  // M7
  {id:16,mod:"M7",lista:"L5 Q2",color:C.m7,q:"No RSA com p=17, q=11, e=7: qual é o valor de d?",opts:["7","23","160","17"],ans:1,exp:"φ(n)=(p-1)(q-1)=16×10=160. d=e⁻¹ mod 160. Verificação: 7×23=161=1×160+1 → 7×23≡1(mod 160) → d=23. Euclides estendido confirma."},
  {id:17,mod:"M7",lista:"L5 Q3",color:C.m7,q:"Se um atacante descobre φ(n) no RSA, o que acontece?",opts:["Ele pode fatorar n diretamente","φ(n) permite calcular d=e⁻¹ mod φ(n), comprometendo a chave privada","Nada — φ(n) é informação pública","Ele pode decifrar apenas mensagens antigas"],ans:1,exp:"Conhecer φ(n) + e → d=e⁻¹ mod φ(n) = chave privada. Além disso, φ(n)=(p-1)(q-1) com n=pq → p+q=n-φ(n)+1 → equação quadrática → p e q descobertos. φ(n) é tão sensível quanto d, p e q."},
  {id:18,mod:"M7",lista:"L5 Q4",color:C.m7,q:"No Diffie-Hellman, por que KA=YB^XA mod q é igual a KB=YA^XB mod q?",opts:["Porque q é primo e garante simetria","Porque α^(XA·XB)=α^(XB·XA) — multiplicação de inteiros é comutativa","Porque XA e XB são gerados pelo mesmo gerador aleatório","Porque mod q tem propriedade comutativa especial"],ans:1,exp:"YB=α^XB, então YB^XA=(α^XB)^XA=α^(XB·XA)=α^(XA·XB). YA=α^XA, então YA^XB=(α^XA)^XB=α^(XA·XB). São iguais porque a multiplicação é comutativa. A chave K=α^(XA·XB) mod q nunca precisou ser transmitida."},
  {id:19,mod:"M7",lista:"L5 Q5",color:C.m7,q:"Como mitigar o ataque MITM no Diffie-Hellman?",opts:["Usar um primo q maior","Assinar YA e YB com chaves privadas RSA e verificar via certificados de CA confiável","Repetir o protocolo DH três vezes","Usar AES para cifrar os valores YA e YB"],ans:1,exp:"Eve intercepta YA e YB e substitui pelos seus. A assinatura RSA sobre YA (por Alice) garante que Eve não pode substituir sem a chave privada de Alice. Certificados verificam que a chave pública usada para verificar pertence a Alice."},
  {id:20,mod:"M7",lista:"L5 Q1",color:C.m7,q:"Em um sistema de comunicação com 10 partes, quantas chaves são necessárias com criptografia simétrica vs. assimétrica?",opts:["Simétrica: 100 | Assimétrica: 20","Simétrica: 45 | Assimétrica: 20","Simétrica: 10 | Assimétrica: 10","Simétrica: 90 | Assimétrica: 10"],ans:1,exp:"Simétrica: n(n-1)/2 = 10×9/2 = 45 chaves. Assimétrica: n pares = 10 pares (20 chaves contando pública+privada de cada um). A assimétrica é muito mais escalável."},
  {id:21,mod:"M7",lista:"L5 Q6",color:C.m7,q:"Para enviar uma mensagem ASSINADA E CONFIDENCIAL para Bob:",opts:["Cifrar com sua própria chave pública e assinar com a chave pública de Bob","Assinar com sua chave privada e cifrar com a chave pública de Bob","Cifrar com a chave privada de Bob e assinar com a chave pública de Alice","Assinar e cifrar com a chave pública de Bob"],ans:1,exp:"Assinatura usa PRIVADA do emissor (Alice assina com PR_Alice). Confidencialidade usa PÚBLICA do destinatário (Alice cifra com PU_Bob). Só Bob pode decifrar (com PR_Bob). Qualquer um pode verificar a assinatura de Alice (com PU_Alice)."},
  // M8
  {id:22,mod:"M8",lista:"L6 Q1",color:C.m8,q:"Uma empresa tem 1 Matriz, 1 Filial e 3 Vendedores. Quantas SAs são necessárias para a VPN IPSec?",opts:["6","8","10","4"],ans:1,exp:"Bidirecional requer 2 SAs por par. Matriz↔Filial: 2 SAs. Matriz↔3Vendedores: 2×3=6 SAs. Total: 2+6=8 SAs. Fórmula: 2+2n onde n=número de vendedores."},
  {id:23,mod:"M8",lista:"L6 Q1",color:C.m8,q:"Qual é a diferença entre SPD e SAD no IPSec?",opts:["SPD guarda as chaves; SAD guarda as políticas","SPD define POLÍTICA (o quê fazer); SAD guarda ESTADO (como fazer)","SPD é para pacotes de saída; SAD é para pacotes de entrada","SPD é configurado manualmente; SAD é gerado pelo IKE"],ans:1,exp:"SPD = Security Policy Database = POLÍTICA: PROTECT/BYPASS/DISCARD por IP src+dst+protocolo. SAD = Security Association Database = ESTADO: chaves, algoritmos, SPI, sequence number. SPD consulta SAD quando decide PROTECT."},
  {id:24,mod:"M8",lista:"L6 Q2",color:C.m8,q:"Qual protocolo IPSec fornece confidencialidade E autenticidade?",opts:["AH","ESP","IKE","SAD"],ans:1,exp:"ESP (protocolo 50) fornece confidencialidade + autenticidade + integridade + anti-replay. AH (protocolo 51) fornece apenas autenticidade + integridade, SEM confidencialidade. AH é deprecated — ESP é o padrão atual."},
  {id:25,mod:"M8",lista:"L6 Q2",color:C.m8,q:"Por que VPNs site-to-site usam modo TÚNEL e não modo TRANSPORTE?",opts:["Modo túnel é mais rápido","Modo túnel encapsula o IP original, ocultando endereços internos; endpoints são gateways, não hosts","Modo transporte não funciona com ESP","Modo túnel oferece maior resistência a força bruta"],ans:1,exp:"Modo transporte: IP original visível, host-to-host (cada host implementa IPSec). Modo túnel: IP original encapsulado e cifrado, gateway-to-gateway (hosts internos não precisam saber de IPSec). VPNs precisam ocultar topologia interna."},
  {id:26,mod:"M8",lista:"L6 Q3",color:C.m8,q:"Qual é a diferença entre IKE SA e IPSec SA?",opts:["IKE SA é unidirecional; IPSec SA é bidirecional","IKE SA protege as negociações do IKE (bidirecional); IPSec SA protege os dados do usuário (unidirecional)","IKE SA usa AES; IPSec SA usa RSA","São termos diferentes para a mesma coisa"],ans:1,exp:"IKE SA: bidirecional, criada na Fase 1, protege as mensagens do próprio IKE. IPSec SA: unidirecional (2 para bidirecional), criada na Fase 2, protege tráfego do usuário. 1 IKE SA → cria 2 IPSec SAs."},
  {id:27,mod:"M8",lista:"L6 Q3",color:C.m8,q:"Por que o IKE usa criptografia assimétrica na Fase 1 e simétrica na Fase 2?",opts:["Fase 1 usa simétrica porque é mais segura; Fase 2 usa assimétrica por ser mais rápida","Fase 1: assimétrica é necessária para autenticar sem chave prévia (realizada uma vez). Fase 2: simétrica é suficiente e muito mais rápida para o tráfego contínuo","Por definição do protocolo IKE v2","Porque a Fase 1 precisa de não-repúdio e a Fase 2 não"],ans:1,exp:"Mesmo padrão híbrido do TLS e sistemas práticos: assimétrica para estabelecer confiança e trocar segredos (uma vez, mais lenta). Simétrica para cifrar o tráfego contínuo (AES = Gbps). Eficiência + segurança."},
  {id:28,mod:"M8",lista:"L6 Q4",color:C.m8,q:"Para que serve o campo Padding no pacote ESP?",opts:["Para confundir o atacante com dados aleatórios","Para alinhar o payload ao tamanho de bloco do algoritmo de cifração (ex: AES=16 bytes)","Para indicar o tipo de protocolo encapsulado","Para proteger o cabeçalho IP externo"],ans:1,exp:"Cifras de bloco exigem múltiplos do tamanho de bloco. AES usa blocos de 16 bytes. Se payload=100 bytes, adiciona 12 bytes de padding → 112 = 7×16 blocos. O campo Pad Length no trailer indica quantos bytes foram adicionados."},
  {id:29,mod:"M8",lista:"L6 Q5",color:C.m8,q:"O HMAC no ESP garante quais serviços?",opts:["Apenas confidencialidade","Apenas integridade","Integridade E autenticidade simultaneamente","Confidencialidade e integridade"],ans:2,exp:"HMAC=hash+chave K → (1) INTEGRIDADE: qualquer bit alterado → HMAC diverge. (2) AUTENTICIDADE: sem K é inviável gerar HMAC válido, confirmando a origem. O HMAC NÃO fornece confidencialidade — isso é papel da cifração AES no ESP."},
  // M9
  {id:30,mod:"M9",lista:"L7 Q1",color:C.m9,q:"Por que múltiplas conexões TLS podem compartilhar uma sessão?",opts:["Para simplificar a implementação do protocolo","Para evitar o custo do Handshake assimétrico (RSA/DH) a cada nova conexão","Porque o TLS não tem estado entre conexões","Por limitação do protocolo TCP"],ans:1,exp:"O Handshake usa RSA/DH (operações assimétricas — lentas). Com sessões, apenas a primeira conexão faz o Handshake completo. As demais reutilizam os parâmetros criptográficos (Master Secret, algoritmos) via abbreviated handshake."},
  {id:31,mod:"M9",lista:"L7 Q2",color:C.m9,q:"O TLS Record Protocol provê dois serviços com chaves DISTINTAS. Quais são eles?",opts:["Autenticação e não-repúdio","Confidencialidade (AES) e integridade (MAC), cada um com sua própria chave derivada do Master Secret","Compressão e cifração","Fragmentação e controle de erros"],ans:1,exp:"Duas chaves derivadas do Master Secret: (1) chave AES para cifração (confidencialidade). (2) chave MAC para autenticação de mensagem (integridade). São DISTINTAS — não é a mesma chave para os dois serviços."},
  {id:32,mod:"M9",lista:"L7 Q3",color:C.m9,q:"Na Fase 1 do Handshake TLS, quais valores são trocados que previnem ataques de replay?",opts:["Pre-Master Secret e Master Secret","Session ID e CipherSuite","Client Random e Server Random — valores únicos gerados aleatoriamente em cada handshake","Certificado do servidor e chave pública da CA"],ans:2,exp:"Client Random + Server Random são gerados aleatoriamente em cada Handshake. Atacante que gravar uma sessão não pode reutilizá-la: os Randoms diferentes geram Master Secret diferente → chaves diferentes → sessão capturada não funciona."},
  {id:33,mod:"M9",lista:"L7 Q3",color:C.m9,q:"O que uma CipherSuite como TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 especifica?",opts:["Apenas o algoritmo de cifração","Troca de chaves (ECDHE) + autenticação (RSA) + cifração (AES-128-GCM) + hash (SHA256)","O número de rodadas e o tamanho do bloco","A versão do TLS e o tamanho máximo do pacote"],ans:1,exp:"CipherSuite = combinação completa: ECDHE (troca de chaves via DH com curvas elípticas) + RSA (autenticação do certificado) + AES-128-GCM (cifração em modo GCM) + SHA256 (hash para PRF e MAC)."},
  {id:34,mod:"M9",lista:"L7 Q3",color:C.m9,q:"Por que o servidor é AUTENTICADO durante o Handshake TLS?",opts:["Por exigência do protocolo TCP","Para prevenir MITM: sem autenticação, atacante poderia se passar pelo servidor e interceptar todos os dados","Para cumprir requisitos legais de e-commerce","Para verificar se o servidor tem capacidade de processar TLS"],ans:1,exp:"Sem autenticação, Eve se coloca entre cliente e servidor, estabelece chaves com cada um — o cliente pensa falar com o servidor, mas está falando com Eve. O certificado RSA, verificado via CA confiável, garante que a chave pública pertence ao servidor legítimo."},
  {id:35,mod:"M9",lista:"L7 Q4",color:C.m9,q:"O que acontece quando o Alert Protocol envia uma mensagem fatal?",opts:["A sessão TLS inteira é encerrada e todos os parâmetros descartados","A conexão atual é encerrada imediatamente, mas outras conexões da mesma sessão continuam","Apenas o cliente é desconectado; o servidor mantém o estado","A mensagem é descartada e o protocolo tenta recuperação automática"],ans:1,exp:"Alert fatal(2): encerra CONEXÃO imediatamente. Outras conexões da mesma sessão podem continuar. Novas conexões nessa sessão NÃO podem ser estabelecidas. Exemplo fatal: bad_record_mac. Exemplo warning: close_notify."},
  {id:36,mod:"M9",lista:"L7 Q4",color:C.m9,q:"O que é o ChangeCipherSpec?",opts:["Uma fase do Handshake que negocia os algoritmos","Uma mensagem de 1 byte (valor 1) que ativa os algoritmos negociados — NÃO faz parte do Handshake","Um protocolo de autenticação bidirecional","O mecanismo que cifra as mensagens do Handshake"],ans:1,exp:"ChangeCipherSpec: protocolo mais simples do TLS — 1 mensagem, 1 byte, valor 1. Sinaliza transição: copia CipherSpec pendente para atual. É enviado por AMBOS (cliente e servidor) na Fase 4. NÃO é parte do Handshake — é um sinal entre fases."},
  {id:37,mod:"M9",lista:"L7 Q5",color:C.m9,q:"Qual é a falha lógica do Heartbleed?",opts:["O algoritmo de cifração do TLS estava errado","O servidor não verificava se payload_length ≤ tamanho real recebido, lendo memória adjacente","A chave privada RSA do servidor era muito pequena","O protocolo Heartbeat não usava cifração"],ans:1,exp:"Request malicioso: payload='A'(1 byte), payload_length=65535. OpenSSL não verificava: payload_length ≤ tamanho_real. Então alocava 65535 bytes e lia da memória do processo — expondo chaves, senhas, cookies. Bug de C (bounds checking), não de criptografia."},
  {id:38,mod:"M9",lista:"L7 Q5",color:C.m9,q:"Qual é a LIÇÃO principal do Heartbleed?",opts:["SHA-256 é insuficiente para aplicações modernas","Protocolo criptográfico forte não basta — a IMPLEMENTAÇÃO também precisa ser correta","O TLS deveria ser substituído por IPSec em todos os casos","Certificados digitais precisam ser renovados anualmente"],ans:1,exp:"CVE-2014-0160: o TLS em si estava correto. A falha era na implementação do OpenSSL — um simples bounds checking ausente em C. 17% dos servidores HTTPS afetados. Lição: criptografia forte + implementação correta = AMBOS necessários."},
];

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

export default function App(){
  const[mode,setMode]=useState("menu"); // menu | quiz | result
  const[filter,setFilter]=useState("all");
  const[questions,setQuestions]=useState([]);
  const[cur,setCur]=useState(0);
  const[answers,setAnswers]=useState({});
  const[showExp,setShowExp]=useState(false);

  const start=useCallback(()=>{
    const pool=filter==="all"?allQ:allQ.filter(q=>q.mod===filter);
    setQuestions(shuffle(pool));
    setCur(0);
    setAnswers({});
    setShowExp(false);
    setMode("quiz");
  },[filter]);

  const mods=["M5","M6","M7","M8","M9"];
  const modColors={M5:C.m5,M6:C.m6,M7:C.m7,M8:C.m8,M9:C.m9};
  const modLabels={M5:"Cifras de Bloco",M6:"Hash/HMAC",M7:"Assimétrica",M8:"IPSec",M9:"TLS"};

  if(mode==="menu") return <div style={{fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",background:C.bg,minHeight:"100vh",color:C.text,paddingBottom:80}}>
    <div style={{background:"linear-gradient(160deg,#050C14 0%,#0A1828 50%,#07101A 100%)",borderBottom:`1px solid ${C.border}`,padding:"36px 24px 24px",textAlign:"center"}}>
      <div style={{fontSize:10,letterSpacing:6,color:C.muted,textTransform:"uppercase",marginBottom:10,fontFamily:"monospace"}}>ICP473 · P2 · Quiz</div>
      <h1 style={{fontSize:"clamp(20px,5vw,32px)",fontWeight:700,color:"#F5EDE0",margin:"0 0 8px"}}>Quiz Completo P2</h1>
      <p style={{color:"#4A7090",fontSize:13,margin:"0 0 4px",fontStyle:"italic"}}>38 questões · L3 a L7 · Todos os módulos</p>
      <p style={{color:C.warn,fontSize:12,fontFamily:"monospace",margin:0}}>Prova Qua 17/06</p>
    </div>
    <div style={{maxWidth:600,margin:"0 auto",padding:"24px 16px 0"}}>
      <div style={{marginBottom:20}}>
        <div style={{color:C.muted,fontSize:11,fontFamily:"monospace",letterSpacing:3,marginBottom:10}}>FILTRAR POR MÓDULO</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {mods.map(m=>(
            <div key={m} onClick={()=>setFilter(m)} style={{background:filter===m?`${modColors[m]}22`:C.card,border:`1px solid ${filter===m?modColors[m]:C.border}`,borderRadius:8,padding:"12px 14px",cursor:"pointer",transition:"all .15s"}}>
              <div style={{color:filter===m?modColors[m]:C.muted,fontWeight:filter===m?700:400,fontSize:13}}>{m} — {modLabels[m]}</div>
              <div style={{color:C.muted,fontSize:11,marginTop:2}}>{allQ.filter(q=>q.mod===m).length} questões</div>
            </div>
          ))}
          <div onClick={()=>setFilter("all")} style={{background:filter==="all"?"#1A3040":C.card,border:`1px solid ${filter==="all"?C.accent:C.border}`,borderRadius:8,padding:"12px 14px",cursor:"pointer",gridColumn:"1/-1"}}>
            <div style={{color:filter==="all"?C.accent:C.muted,fontWeight:filter==="all"?700:400,fontSize:13}}>Todos os módulos — {allQ.length} questões</div>
          </div>
        </div>
      </div>
      <button onClick={start} style={{width:"100%",background:`${filter==="all"?C.accent:modColors[filter]||C.accent}22`,border:`1px solid ${filter==="all"?C.accent:modColors[filter]||C.accent}`,borderRadius:10,padding:"14px",color:filter==="all"?C.accent:modColors[filter]||C.accent,fontSize:16,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
        ▶ Iniciar Quiz — {filter==="all"?allQ.length:allQ.filter(q=>q.mod===filter).length} questões
      </button>
    </div>
  </div>;

  const q=questions[cur];
  const answered=answers[cur]!==undefined;
  const correct=answered&&answers[cur]===q.ans;
  const total=questions.length;
  const done=Object.keys(answers).length;

  if(mode==="quiz") return <div style={{fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",background:C.bg,minHeight:"100vh",color:C.text,paddingBottom:80}}>
    <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
      <button onClick={()=>setMode("menu")} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,padding:"5px 10px",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Menu</button>
      <div style={{flex:1,height:4,background:C.card,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",background:q.color,borderRadius:2,width:`${(done/total)*100}%`,transition:"width .3s"}}/>
      </div>
      <span style={{color:C.muted,fontSize:12,fontFamily:"monospace",flexShrink:0}}>{cur+1}/{total}</span>
      {done===total&&<button onClick={()=>setMode("result")} style={{background:`${C.good}22`,border:`1px solid ${C.good}`,borderRadius:6,padding:"5px 12px",color:C.good,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Ver resultado</button>}
    </div>
    <div style={{maxWidth:720,margin:"0 auto",padding:"20px 16px 0"}}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <span style={{background:`${q.color}22`,color:q.color,fontSize:11,padding:"2px 10px",borderRadius:10,fontFamily:"monospace",fontWeight:700,border:`1px solid ${q.color}44`}}>{q.mod}</span>
        <span style={{color:C.muted,fontSize:11,fontFamily:"monospace"}}>{q.lista}</span>
      </div>
      <div style={{background:C.card,border:`1px solid ${q.color}44`,borderRadius:10,padding:"16px 18px",marginBottom:16}}>
        <div style={{color:"#C0D4E4",fontSize:15,lineHeight:1.7,fontWeight:500}}>{q.q}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {q.opts.map((opt,i)=>{
          let bg=C.surface,border=C.border,color="#8AAABB";
          if(answered){
            if(i===q.ans){bg="#0A1F14";border=C.good;color=C.good;}
            else if(i===answers[cur]&&i!==q.ans){bg:"#1F0A0A";border=C.bad;color=C.bad;}
          }
          return <div key={i} onClick={()=>{if(!answered){const na={...answers,[cur]:i};setAnswers(na);setShowExp(false);if(Object.keys(na).length===total)setTimeout(()=>setMode("result"),8000);}}}
            style={{background:answered&&i===q.ans?"#0A1F14":answered&&i===answers[cur]&&i!==q.ans?"#1F0A0A":C.surface,border:`1px solid ${answered&&i===q.ans?C.good:answered&&i===answers[cur]&&i!==q.ans?C.bad:C.border}`,borderRadius:8,padding:"12px 14px",cursor:answered?"default":"pointer",display:"flex",gap:10,alignItems:"flex-start",transition:"all .15s"}}>
            <span style={{color:answered&&i===q.ans?C.good:answered&&i===answers[cur]&&i!==q.ans?C.bad:C.muted,fontSize:12,fontFamily:"monospace",fontWeight:700,flexShrink:0,marginTop:1}}>{["A","B","C","D"][i]}</span>
            <span style={{color:answered&&i===q.ans?C.good:answered&&i===answers[cur]&&i!==q.ans?C.bad:"#8AAABB",fontSize:13,lineHeight:1.5}}>{opt}</span>
            {answered&&i===q.ans&&<span style={{color:C.good,marginLeft:"auto",flexShrink:0}}>✓</span>}
            {answered&&i===answers[cur]&&i!==q.ans&&<span style={{color:C.bad,marginLeft:"auto",flexShrink:0}}>✗</span>}
          </div>;
        })}
      </div>
      {answered&&<>
        <button onClick={()=>setShowExp(!showExp)} style={{width:"100%",background:correct?"#0A1F14":"#1F0A0A",border:`1px solid ${correct?C.good:C.bad}`,borderRadius:7,padding:"9px",color:correct?C.good:C.bad,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginBottom:showExp?0:12}}>
          {correct?"✓ Correto!":"✗ Incorreto"} — {showExp?"Ocultar":"Ver"} explicação
        </button>
        {showExp&&<div style={{background:correct?"#0A1F14":"#1A0A0A",border:`1px solid ${correct?C.good:C.bad}44`,borderRadius:"0 0 8px 8px",padding:"12px 14px",marginBottom:12}}>
          <div style={{color:correct?"#7AE08A":"#E07070",fontSize:13,lineHeight:1.7}}>{q.exp}</div>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
          <button onClick={()=>{setCur(c=>Math.max(0,c-1));setShowExp(false);}} disabled={cur===0} style={{flex:1,background:C.card,border:`1px solid ${cur===0?"#1A3448":C.border}`,borderRadius:7,padding:"9px",color:cur===0?"#1A3448":C.muted,fontSize:13,cursor:cur===0?"default":"pointer",fontFamily:"inherit"}}>← Anterior</button>
          <button onClick={()=>{setCur(c=>Math.min(total-1,c+1));setShowExp(false);}} disabled={cur===total-1} style={{flex:1,background:C.card,border:`1px solid ${cur===total-1?"#1A3448":q.color}`,borderRadius:7,padding:"9px",color:cur===total-1?"#1A3448":q.color,fontSize:13,cursor:cur===total-1?"default":"pointer",fontFamily:"inherit"}}>Próxima →</button>
        </div>
      </>}
    </div>
  </div>;

  // Result screen
  const score=Object.entries(answers).filter(([i,a])=>questions[Number(i)].ans===a).length;
  const pct=Math.round((score/total)*100);
  const msg=pct>=90?"Excelente! Pronto para a prova 🎓":pct>=75?"Muito bom! Revise os erros":pct>=60?"Bom progresso — revise os módulos com mais erros":"Continue praticando — releia o resumo";
  const byMod=mods.map(m=>{const qs=questions.map((q,i)=>({...q,i})).filter(q=>q.mod===m);const c=qs.filter(q=>answers[q.i]===q.ans).length;return{m,total:qs.length,correct:c};});

  return <div style={{fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,Georgia,serif",background:C.bg,minHeight:"100vh",color:C.text,paddingBottom:80}}>
    <div style={{maxWidth:600,margin:"0 auto",padding:"32px 16px 0",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12}}>{pct>=90?"🎓":pct>=75?"🎯":pct>=60?"📚":"📖"}</div>
      <div style={{color:"#DDD5C5",fontSize:28,fontWeight:700,marginBottom:8}}>{score}/{total}</div>
      <div style={{color:pct>=75?C.good:pct>=60?C.warn:C.bad,fontSize:16,fontWeight:700,marginBottom:6}}>{pct}%</div>
      <div style={{color:C.muted,fontSize:13,marginBottom:24}}>{msg}</div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
        {byMod.filter(b=>b.total>0).map(b=>(
          <div key={b.m} style={{background:C.card,border:`1px solid ${modColors[b.m]}44`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:modColors[b.m],fontWeight:700,fontSize:13,minWidth:40}}>{b.m}</span>
            <div style={{flex:1,height:6,background:C.surface,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",background:b.total>0&&b.correct/b.total>=.75?C.good:C.warn,width:`${b.total>0?Math.round((b.correct/b.total)*100):0}%`,borderRadius:3}}/>
            </div>
            <span style={{color:C.muted,fontSize:12,fontFamily:"monospace"}}>{b.correct}/{b.total}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={start} style={{flex:1,background:`${C.accent}22`,border:`1px solid ${C.accent}`,borderRadius:8,padding:"12px",color:C.accent,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>↺ Refazer</button>
        <button onClick={()=>setMode("menu")} style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Menu</button>
      </div>
    </div>
  </div>;
}
