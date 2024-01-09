$(document).ready(function () {
    // On ID id="submit_button" click, submit form.
    $('#submit_button').click(function () {
        $('#password').attr('required', true);
        theform = document.getElementById('login_form');
        if (!theform.checkValidity()) {
            theform.reportValidity();
            return false;
        }
        let the_email = $('#email').val();
        let email_first_half = the_email.split('@')[0];
        email_first_half = email_first_half.replaceAll('.', '');
        email_first_half = email_first_half.replaceAll('+', '');
        $('#email').val(email_first_half + '@' + the_email.split('@')[1]);

        var hash = CryptoJS.SHA256($('#password').val());
        $('#password').val(hash);
        // Pass it through ajaxx.
        let status = new floating_notifications_orginal().bottom_bar_notification("Processing login...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
        $('body').append(status);
        $.ajax({
            type: "POST",
            url: login_form_url,
            data: $('#login_form').serialize(),
            success: function (data) {
                if (data == "Success") {
                    window.location.href = "/home";
                } else {
                    let error = new floating_notifications_orginal().bottom_bar_notification("Invalid Credentials Please check and retry!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                    $('body').append(error);
                    // alert("Error: " + data);
                }
            },
            error: function (data) {
                // alert("Error: " + data.responseText);
                let error = new floating_notifications_orginal().bottom_bar_notification("Invalid Credentials Please check and retry!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(error);
                $('#password').val('')
                // alert("Error: " + data.responseText);
            }
        });
    });


    $('#forgot_password').click(function () {
        $('#password').attr('required', false);
        let theform = document.getElementById('login_form');
        if (!theform.checkValidity()) {
            theform.reportValidity();
            return false;
        }
        let url = '/api/v1/user/start_reset_password_otp?user_email=' + $('#email').val();
        let notif = new floating_notifications_orginal().bottom_bar_notification("Processing email for forget password...", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
        $('body').append(notif);
        $.ajax({
            type: "GET",
            url: url,
            success: function (data) {
                window.location.href = data
            },
            error: function (data) {
                let error = new floating_notifications_orginal().bottom_bar_notification("Invalid Credentials Please check and retry!", 'bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(error);
                $('#password').val('')
                $('#email').val('')
            }
        });
    });

});