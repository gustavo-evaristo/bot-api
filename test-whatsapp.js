// Script de teste para integração WhatsApp
// Este script pode ser usado para testar a conexão e o fluxo de mensagens

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testWhatsappIntegration() {
  console.log('🚀 Iniciando teste de integração WhatsApp...\n');

  try {
    // 1. Testar se a API está respondendo
    console.log('1. Testando conexão com a API...');
    const healthCheck = await axios.get(`${BASE_URL}/`);
    console.log('✅ API está respondendo\n');

    // 2. Iniciar sessão WhatsApp
    console.log('2. Iniciando sessão WhatsApp...');
    const startResponse = await axios.post(`${BASE_URL}/whatsapp/start`, {
      userId: 'test-user-123',
    });
    console.log('✅ Sessão WhatsApp iniciada:', startResponse.data);
    console.log(
      '   Escaneie o QR Code exibido no console para conectar o WhatsApp\n',
    );

    // 3. Testar endpoint de mensagens
    console.log('3. Testando endpoint de mensagens...');
    const testResponse = await axios.post(`${BASE_URL}/whatsapp/test-message`, {
      userId: 'test-user-123',
    });
    console.log('✅ Endpoint de teste:', testResponse.data.message);
    console.log('   Instruções:', testResponse.data.instructions);

    console.log('\n📋 Próximos passos:');
    console.log('1. Escaneie o QR Code exibido no console');
    console.log('2. Aguarde a conexão do WhatsApp');
    console.log('3. Envie uma mensagem para o número conectado');
    console.log('4. Verifique os logs no console da API');
    console.log(
      '5. A mensagem deve aparecer no formato: === MENSAGEM RECEBIDA ===',
    );
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
  }
}

// Executar o teste se este script for executado diretamente
if (require.main === module) {
  testWhatsappIntegration();
}

module.exports = { testWhatsappIntegration };
