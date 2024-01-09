// Ask the user for permission to send push notifications.

if ('serviceWorker' in navigator) {
    // Check if service worker is already registered

    let r1 = navigator.serviceWorker.register("/sw.js", {
        scope: "/"
    }).then(async function (registration) {
        registration.update();
        // Check if the user has an existing subscription
        return registration.pushManager.getSubscription()
            .then(async function (subscription) {
                let url_to_get_sse_token = "/api/v1/user/get_SSE_ENGINE_TOKEN"
                if (subscription) {
                    // If there is a subscription, unsubscribe
                    // let k1 = await subscription.unsubscribe();
                    // let g1 = await new APICALLS().GenericAPICallv2(url_to_get_sse_token, "GET", {}).then(async function (token_data) {
                    //     let url = "http://localhost:5000/subscribe?SSE_TOKEN=" + token_data["SSE_ENGINE_TOKEN"];
                    //     let ap_call = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(subscription));
                    //     return subscription;
                    // });
                    let url = "/api/v1/user/subscribe"
                    let ap_call = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(subscription));
                    return subscription;

                    // return g1;
                }
                // If there is no subscription, register a new one
                const vapidPublicKey = "BDEhHwhoHdlJly2CyswhtWKQX9jbPVlXUYBEuAERULfNuyvC-jUDYchg_GzEJ-crVzYY9BFPi9MRj9BICTi9WCY"
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                let suber1 = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
                // Send the new subscription details to the server
                // let g1 = await new APICALLS().GenericAPICallv2(url_to_get_sse_token, "GET", {}).then(async function (token_data) {
                //     let url = "http://localhost:5000/subscribe?SSE_TOKEN=" + token_data["SSE_ENGINE_TOKEN"];
                //     let ap_call = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(suber1));
                //     return suber1;
                // });
                let url = "/api/v1/user/subscribe"
                let ap_call = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(suber1));
                return suber1;
            }
            );
    });

}




// Utility function for browser interoperability
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}