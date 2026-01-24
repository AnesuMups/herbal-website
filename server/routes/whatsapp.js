const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../services/whatsapp');

// Send WhatsApp message
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    await sendWhatsAppMessage(phone, message);
    res.json({ message: 'WhatsApp message sent successfully' });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

module.exports = router;
