$(document).ready(function () {
    

});

$(function() {
    $('#Basic_User_Registration').submit(function(event) {
        event.preventDefault();
        var form_data = new FormData();
        var hash = CryptoJS.SHA256($('#confirm_password').val());
        form_data.append('confirm_password', hash);
        form_data.append('UserPassword', hash);
        form_data.append('UserEmail', $('#email').val());
        form_data.append('csrf_token', $('#csrf_token').val());
        form_data.append('UserAgreement', $('#terms').val());
        if(form_data.get('UserPassword')!=form_data.get('confirm_password')){
            alert("Passwords do not match");
            return;
        }
        if(form_data.get('UserAgreement')!="on"){
            form_data.set('UserAgreement',"No");
        }else if(form_data.get('UserAgreement')=="on"){
            form_data.set('UserAgreement',"Yes");
        }
        let caller=new APICALLS().registerUser(form_data);
        }); 
});




class APICALLS{
    async registerUser(dat){
        let r1=$.ajax(
            {url: "/api/v1/user/basic_register",
            method:"post",
            crossDomain: true,
            withCredentials: true,
            data: dat,
            processData: false,
            contentType: false,
            success: function(result) { 
             return result;
            },
            error: function(result) {
             console.log("An unexpected error occured");
             }
             }
            );
        return r1; 
            
    }        

}