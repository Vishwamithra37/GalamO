class APICALLS {
    async GenericAPICall(url, method, data) {
        let r1 = await $.ajax({
            url: url,
            method: method,
            data: data,
            success: function (data) {
                return data;
            },
            error: function (error) {
                return error;
            }
        });
        return r1;
    }
    async GenericAPICallv2(url, method, data) {
        let r1 = await $.ajax({
            url: url,
            method: method,
            data: data,
            success: function (data) {
                return [data.status, data.data]
            },
            error: function (error) {
                return [error.status, error.data]
            }
        });
        return r1;
    }
    async GenericAPIJSON_CALL(url, method, data) {
        let r1 = await $.ajax({
            url: url,
            method: method,
            data: data,
            contentType: "application/json",
            success: function (data) {
                return [data.status, data.data]
            },
            error: function (error) {
                return [error.status, error.data]
            }
        });
        return r1;
    }

}