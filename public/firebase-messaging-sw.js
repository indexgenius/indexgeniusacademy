importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCBbArh4CbrwQLXwhbyohgh7KW9QDz5NPw",
  authDomain: "indexgeniusacademy.firebaseapp.com",
  projectId: "indexgeniusacademy",
  messagingSenderId: "404102537484",
  appId: "1:404102537484:web:13b12ee20640f95dbd6929"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/img/logos/IMG_5208.PNG'
  });
});