$(document).ready(function () {

    function notifier(notifcation_info) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/static/js/sw.js')
                .then(function (registration) {
                    console.log('Service Worker Registered');
                    let options = notifcation_info
                    // Use the service worker to send a notification
                    let k1 = registration.showNotification(notifcation_info["description"], options);
                    registration.addEventListener('notificationclick', function (event) {
                        // Prevent the browser from focusing the Notification's tab
                        event.notification.notify();
                        console.log("URL: " + event.notification.data.url)
                        console.log(event.notification.data.url)
                        event.waitUntil(
                            clients.openWindow(event.notification.data.url)
                        );
                    }
                    );
                });
        }
    }


    let url_to_get_sse_token = "/api/v1/user/get_SSE_ENGINE_TOKEN"
    let g1 = new APICALLS().GenericAPICallv2(url_to_get_sse_token, "GET", {}).then(function (token_data) {
        var source = new EventSource(token_data["SSE_ENGINE_URL"] + "/listen?SSE_TOKEN=" + token_data["SSE_ENGINE_TOKEN"]);
        // var source = new EventSource('https://www.galam.in:5000/listen?SSE_TOKEN=' + token_data["SSE_ENGINE_TOKEN"]);
        source.addEventListener('message', function (event) {
            var data = JSON.parse(event.data);
            console.log(data);
            notifier(data);

        });
    });

});


