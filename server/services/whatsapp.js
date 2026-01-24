const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let whatsappClient = null;

// Initialize WhatsApp client
function initializeWhatsApp() {
  if (whatsappClient) {
    return whatsappClient;
  }

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  whatsappClient.on('qr', (qr) => {
    console.log('WhatsApp QR Code:');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp client is ready!');
  });

  whatsappClient.on('authenticated', () => {
    console.log('WhatsApp client authenticated');
  });

  whatsappClient.on('auth_failure', (msg) => {
    console.error('WhatsApp authentication failure:', msg);
  });

  whatsappClient.initialize();

  return whatsappClient;
}

// Send WhatsApp message
async function sendWhatsAppMessage(phone, message) {
  try {
    if (!whatsappClient) {
      initializeWhatsApp();
      // Wait a bit for client to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Format phone number (remove any non-digit characters except +)
    const formattedPhone = phone.replace(/\D/g, '');
    const chatId = formattedPhone.includes('@c.us') ? formattedPhone : `${formattedPhone}@c.us`;

    await whatsappClient.sendMessage(chatId, message);
    return { success: true };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    // In development, just log the message instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WhatsApp Mock] To: ${phone}, Message: ${message}`);
      return { success: true, mock: true };
    }
    throw error;
  }
}

// Initialize on module load if enabled
if (process.env.ENABLE_WHATSAPP === 'true') {
  initializeWhatsApp();
}

module.exports = {
  initializeWhatsApp,
  sendWhatsAppMessage
};
