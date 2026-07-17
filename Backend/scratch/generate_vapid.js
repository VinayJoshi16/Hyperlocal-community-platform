const webPush = require('web-push');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('=== GENERATED VAPID KEYS ===');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_SUBJECT=mailto:vinay.joshi1608@gmail.com');
console.log('============================');
