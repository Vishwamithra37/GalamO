$(document).ready(function () {

    // On checking the agreement checkbox, change its label to green.
    $('#agreement').change(function () {
        if ($(this).is(':checked')) {
            $('#agreement_label').removeClass('border-yellow-500');
            $('#agreement_label').addClass('border-green-500');
        } else {
            $('#agreement_label').removeClass('border-green-500');
            $('#agreement_label').addClass('border-yellow-500');
        }
    });


    $('#submiter').click(function (e) {
        e.preventDefault();
        let reg_form = $('#registration_form')
        // Make sure hash and hash2 are the same.
        if ($('#password').val() != $('#confirm_password').val()) {
            $('#password').addClass('border-red-500 border');
            $('#confirm_password').addClass('border-red-500 border');
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Confirm Password and password are not matching", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return false;
        } else {
            $('#password').removeClass('border-red-500 border');
            $('#confirm_password').removeClass('border-red-500 border');
        }
        // Validate the registration form.
        if (reg_form[0].checkValidity() === false) {
            e.stopPropagation();
            reg_form[0].reportValidity();
            return false;
        } else {
            let the_email = $('#email').val();
            let email_first_half = the_email.split('@')[0];
            email_first_half = email_first_half.replaceAll('.', '');
            email_first_half = email_first_half.replaceAll('+', '');
            $('#email').val(email_first_half + '@' + the_email.split('@')[1]);

            let hash = CryptoJS.SHA256($('#password').val());
            let hash2 = CryptoJS.SHA256($('#confirm_password').val());
            // Convert hash2 to string.
            $('#password').val(hash);
            $('#confirm_password').val(hash2);

            let serializedArray_of_form = reg_form.serializeArray();
            // Converting it to object.
            let form_object = {};
            for (let i = 0; i < serializedArray_of_form.length; i++) {
                form_object[serializedArray_of_form[i].name] = serializedArray_of_form[i].value;
            }
            let notification = new floating_notifications_orginal().bottom_bar_notification("Processing your application. Please wait!", ' animate-pulse  bg-black p-2 text-yellow-500 text-sm font-bold rounded', 3000)
            $('body').append(notification);
            new APICALLS().GenericAPIJSON_CALL("/api/v1/user/email_only_registration", "POST", JSON.stringify(form_object)).then(function (data) {
                console.log(data);
                let notification = new floating_notifications_orginal().bottom_bar_notification("You application has been successfully submitted. And will be processed in 24 hours.", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                $('body').append(notification);
                $('#submiter').remove();
                window.location.href = "/email_verification" + "?user_email=" + $('#email').val() + "&verification_type=Registration";
            }).catch(function (error) {
                console.log(error[1]);
                $('#password').val('');
                let notification = new floating_notifications_orginal().bottom_bar_notification("Non standard registration values. Please check and resubmit!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(notification);
            });
            // let jsonified_form=JSON.stringify(reg_form.serializeArray());
            // console.log(jsonified_form);
            // 

        }


    });
});