## Objetivo do sistema

O sistema deve maximizar a conversão de leads em revendedoras,
guiando o lead através de um fluxo estruturado e automatizado,
coletando informações e aumentando o interesse ao longo da conversa.

## Modelo de Negócio

- O cliente do sistema é uma empresa de semijoias
- O objetivo dessa empresa é captar revendedoras
- Revendedoras são tratadas como leads até serem convertidas

## Fluxo base

O fluxo do sistema funciona da seguinte maneira:

1º Lead visualiza um anúncio no facebook / instagram.
2º Lead clica no anúncio e é levado para o whatsapp e envia a seguinte mensagem automatica: "Olá! Tenho interesse e queria mais informações, por favor."
3º Neste momento, o sistema inicía o fluxo que está configurado em um kanban ativo para aquele número de telefone (Cada número de whatsapp só pode ter um kanban configurado)
4º Kanban inícia uma conversa no whatsapp enviando as mensagens configuradas, por exemplo: "Oie! Tudo bem? Vi que você demonstrou interesse em revender as semijoias da Mabruk pelo consignado, e queria te dar as boas-vindas! você já conhece como funciona o modelo de consignado ou se prefere que eu te explique rapidinho como tudo acontece?"
5º Quando o kanban tem um conteúdo configurado como texto, ele envia a mensagem e segue para o próximo conteúdo configurado. Quando o kanban tem um conteúdo definido como resposta livre, ele aguarda a resposta do lead para prosseguir. Quando o kanban tem um conteúdo definido como multipla escolha, ele aguarda o lead escolher uma repsosta para prosseguir e com base na resposta toma a decisão necessária.
6º O kanban deve seguir todos os estágios configurados um após o outro até o fim de todos eles.

## Modelo de Negócio

- O sistema é um CRM conversacional via WhatsApp
- O cliente do sistema é uma empresa de semijoias
- O objetivo principal é captar revendedoras
- Revendedoras são tratadas como leads até serem convertidas

## Origem do Lead

- O lead visualiza um anúncio (Facebook / Instagram)
- O lead clica e é redirecionado para o WhatsApp
- Uma mensagem inicial padrão é enviada automaticamente:
  `Olá! Tenho interesse e queria mais informações, por favor.`

## Associação de Kanban

- Cada número de WhatsApp possui exatamente 1 Kanban ativo
- O Kanban representa um fluxo de conversa automatizado
- Quando uma nova conversa inicia, o sistema:
  - identifica o número
  - carrega o Kanban ativo
  - inicia o fluxo do início

## Estrutura do Kanban

```
Kanban
 └── Stages (etapas)
      └── StageContents (interações)
           └── Answers (opcional)
```

## Tipos de Conteúdo

Cada `StageContent` pode ser de 3 tipos:

1. TEXT

- Apenas envia uma mensagem
- Não espera resposta
- Avança automaticamente

2. FREE_INPUT

- Faz uma pergunta aberta
- Espera resposta do lead
- Armazena resposta

3. MULTIPLE_CHOICE

- Exibe opções de resposta
- Lead escolhe uma opção
- Pode influenciar o fluxo

## Motor de Execução do Fluxo

O fluxo segue as seguintes regras:

1º O Kanban inicia no primeiro Stage

2º Dentro de cada Stage:

- percorre os StageContents em ordem

3º Para cada conteúdo:

Text:

- Envia mensagem
- Avança automaticamente

FREE_INPUT:

- Envia pergunta
- Aguarda resposta do lead
- Salva resposta
- Avança

MULTIPLE_CHOICE:

- Envia pergunta + opções
- Aguarda escolha
- Salva resposta
- Pode alterar fluxo (futuro)
- Avança

## Regras importantes

- O fluxo é sequencial
- Um Stage só termina quando todos os conteúdos forem executados
- O próximo Stage só inicia após o anterior finalizar
- O fluxo termina quando todos os Stages forem concluídos

## Regras de Validação

- TEXT não pode ter answers
- FREE_INPUT não pode ter answers
- MULTIPLE_CHOICE deve ter pelo menos 1 answer
- Cada answer possui:
  - content
  - score

## Persistência de Respostas

- Toda resposta do lead deve ser armazenada
- Respostas podem ser usadas para:
- qualificação (score)
- decisões futuras
- segmentação
