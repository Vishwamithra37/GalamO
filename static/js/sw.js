console.log("Service Worker Loaded...");
var self = this;
console.log(self)

var filesToCache = [
    '/static/styles.css',
    '/static/custom_webpacks.css',
    '/static/images/logo.png',
    '/static/js/jquery.js',
    '/static/js/domPurify.js',
    '/static/js/CryptoJS.js',
    '/static/images/global-community.png',
    '/static/images/profile.png',
    '/static/images/nonotification.png',
    '/static/images/notification.png',
    '/static/images/registration.gif',
    '/static/images/breaking_computers.gif',
    '/static/images/circle.gif',
];
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open('Galam').then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Respond to a server push with a user notification.
self.addEventListener('push', function (event) {
    if (Notification.permission === "granted") {
        let notification_data = JSON.parse(event.data.text());
        const notificationText = notification_data["description"];
        const notification_title = notification_data["notifier_DisplayName"];
        let notificaiotn_timestampt = notification_data["CreatedAt"];
        // Convert the string date to a date object. And unix timestamp to milliseconds
        let notification_timestamp = new Date(notificaiotn_timestampt * 1000);
        // Convert the date object to a string, using the locale language
        let notification_timestamp_string = notification_timestamp.toLocaleString();
        let notificaiton_sid = notification_data["sid"];


        const showNotification = self.registration.showNotification(notification_title, {
            // title: notification_title,
            body: notificationText,
            icon: '/static/images/Logos/logo.png',
            tag: notificaiton_sid,
            data: {
                url: notification_data["url"]
            },
            // actions: [
            //     { action: 'actionName', title: 'Mark as read', icon: '/static/images/Logos/logo.png' },
            //     { action: 'actionName', title: 'Mark as unread', icon: '/static/images/Logos/logo.png' },
            // ],
            timestamp: notification_timestamp_string,
        });
        // Make sure the toast notification is displayed.
        event.waitUntil(showNotification);
    }
});

// Respond to the user selecting the toast notification.
self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
        clients.openWindow(event.notification.data.url) // This line will open the URL saved in 'data' when the notification was first created.
    );
});

// // Now we add the code to perform the background sync.
// self.addEventListener('sync', function (event) {
//     if (event.tag === 'myFirstSync') {
//         event.waitUntil(doSomeStuff());
//     }
// }
// );
// navigator.serviceWorker.ready.then(registration => {
//     if (registration.sync) {
//         // Background Sync is supported.
//     } else {
//         // Background Sync isn't supported.
//     }
// });