// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD8d49Jfq8netKWIcdhKv_MQTakO1OayCc",
  authDomain: "road-to-ny.firebaseapp.com",
  projectId: "road-to-ny",
  storageBucket: "road-to-ny.appspot.com",
  messagingSenderId: "530090129839",
  appId: "1:530090129839:web:c7fd3e0c8f64ac55ec575a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || "Risparmia!";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: '/chuck.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
