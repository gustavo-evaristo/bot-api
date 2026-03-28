# Integração WhatsApp - Guia de Testes

Este documento fornece instruções para testar a integração do WhatsApp com a API.

## 🚀 Como Testar

### 1. Preparação

Certifique-se de que a aplicação está rodando:

```bash
# Inicie a aplicação em modo de desenvolvimento
pnpm run dev
```

### 2. Testar a Conexão

Execute o script de teste:

```bash
# Instale o axios se necessário
npm install axios

# Execute o script de teste
node test-whatsapp.js
```

### 3. Conectar o WhatsApp

1. Após executar o script, o console da API mostrará um QR Code em formato de string
2. Abra o WhatsApp no seu celular
3. Vá em **Configurações** → **Dispositivos Conectados** → **Conectar um Dispositivo**
4. Escaneie o QR Code exibido no console
5. Aguarde a conexão ser estabelecida

### 4. Testar o Fluxo de Mensagens

1. **Configure um Kanban** (se ainda não tiver):
   - Crie um usuário via API
   - Crie um Kanban com um número de telefone
   - Ative o Kanban

2. **Envie uma mensagem**:
   - Abra o WhatsApp Web ou o app
   - Envie uma mensagem para o número que foi conectado

3. **Verifique os logs**:
   - No console da API, você deve ver:
   ```
   === MENSAGEM RECEBIDA ===
   Número do remetente: [número]
   Conteúdo da mensagem: [mensagem]
   Timestamp: [data/hora]
   ========================
   ```

## 📋 Endpoints Disponíveis

### Iniciar Sessão WhatsApp

```http
POST /whatsapp/start
Content-Type: application/json

{
  "userId": "seu-id-de-usuario"
}
```

### Testar Mensagens

```http
POST /whatsapp/test-message
Content-Type: application/json

{
  "userId": "seu-id-de-usuario"
}
```

## 🔍 Fluxo de Mensagens

Quando uma mensagem é recebida, o sistema:

1. **Registra a mensagem** no console com detalhes
2. **Busca Kanban ativo** para o número do remetente
3. **Se encontrar Kanban**:
   - Envia mensagem de boas-vindas
   - Inicia o fluxo de estágios (para implementação futura)
4. **Se não encontrar Kanban**:
   - Envia mensagem padrão de atendimento

## 🛠️ Estrutura Implementada

### Serviços

- `WhatsappService`: Gerencia conexões e mensagens
- `handleIncomingMessage()`: Processa mensagens recebidas
- `findActiveKanbanByPhoneNumber()`: Busca Kanban por número

### Repositórios

- `IKanbanRepository`: Interface com novo método `findByPhoneNumber()`
- `KanbanRepository`: Implementação com busca por número de telefone

### Controladores

- `WhatsappController`: Endpoints para testes e controle

## 📝 Próximos Passos

1. **Criar modelo de conversas** para armazenar histórico
2. **Implementar fluxo de estágios** do Kanban
3. **Adicionar armazenamento de respostas**
4. **Criar interface para visualizar conversas**

## 🐛 Solução de Problemas

### QR Code não aparece

- Verifique se o Puppeteer está instalado corretamente
- Confira se o Node.js tem permissão para executar browsers

### Mensagens não são detectadas

- Verifique se a sessão está ativa
- Confira se o número do remetente está correto
- Verifique os logs de erro

### Conexão cai frequentemente

- O WhatsApp pode desconectar por inatividade
- Reinicie a sessão se necessário

## 📞 Suporte

Para dúvidas ou problemas, consulte:

- Logs da aplicação
- Documentação do whatsapp-web.js
- Issues do projeto
