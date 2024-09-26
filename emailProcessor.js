const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const {authorize} = require('./auth');

async function listMessages(auth) {
  const gmail = google.gmail({version: 'v1', auth});
  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 50,
  });
  const messages = res.data.messages;
  if (!messages || messages.length === 0) {
    console.log('Сообщений не найдено.');
    return;
  }

  const emailInfo = [];

  for (const message of messages) {
    const msg = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full',
    });

    const subjectHeader = msg.data.payload.headers.find(header => header.name === 'Subject')?.value || '';
    
    if (subjectHeader.includes('Повідомлення по речі')) {
      const subject = subjectHeader.split('Повідомлення по речі')[1].trim();
      const body = Buffer.from(msg.data.payload.parts[0].body.data, 'base64').toString('utf-8');
      const buyerMatch = body.match(/Покупець\s*(.+?)\s*зацікавився і написав по речі/);
      
      if (buyerMatch) {
        const buyerInfo = buyerMatch[1].trim();
        emailInfo.push({ subject, buyerInfo });
      }
    }
  }
  console.log('Информация о письме:', emailInfo);
  return emailInfo;
}

// Убедитесь, что файл credentials.json создан и правильно настроен
authorize().then(listMessages).catch(console.error);