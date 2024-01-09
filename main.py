import flask
from flask import Flask, render_template
from flask_mail import Mail
import config
from copy import deepcopy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
from pprint import pprint as print
from nested_dictionaries import NestedDictionaries as nd
from sys import getsizeof
from flask_dance.contrib.github import make_github_blueprint, github
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.contrib.facebook import make_facebook_blueprint, facebook
from datetime import datetime
import os


##############Initialization of db basics#############################
# import initialization_of_databases

##############Initialization of db basics#############################
############## Helper Modules- In directory############################
import forms
import dbops
import data_verifications
import common_mains
import notification
import mail_pistol
import email_dbops

############# End of Helper Modules- In directory#######################


app = Flask(__name__)
app.config["MAIL_SERVER"] = "cxbvxcvvcbxb"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USERNAME"] = "bvvcvbvbxvcb"
app.config["MAIL_PASSWORD"] = "vcvcxvbvcb"
app.config["MAIL_USE_TLS"] = True
app.config["WTF_CSRF_TIME_LIMIT"] = 10800


MAIL = Mail(app)


# Set limiter with the db name as Galam_limiter, we are using mongodb as the db. and key func is 'x-ip' header.
def get_ip_from_x_header():
    x_ip = flask.request.headers.get("X-IP")
    if x_ip:
        return x_ip
    return get_remote_address()


limiter = Limiter(
    app,
    key_func=get_ip_from_x_header,
    default_limits=["1000 per minute", "200 per second"],
    storage_uri=config.DBLINK,
    storage_options={"appname": "Galam_Limiter", "database_name": "Galam_Limiter"},
    strategy="fixed-window",  # or "moving-window"
)


app.secret_key = config.SECRET_KEY
app.permanent_session_lifetime = config.SESSION_LIFE
if config.DEBUG == True:
    pass
else:
    csrf = CSRFProtect(app)
    # pass

app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)
# Breaks Login
provide_oauth = {
    "github": 0,
    "google": 0,
    "facebook": 0,
}


############# Blueprints ##############################################
from API_FOR_END_USERS.routes import APIS as END_USER_APIS

# APIS FOR END USER BLUEPRINT
if config.DEBUG == True:
    pass
else:
    csrf.exempt(END_USER_APIS)
    # pass
app.register_blueprint(END_USER_APIS, url_prefix="/vip")

from GBOARD_ROUTES.routes import TESTROUTES as gboard_routes

# APIS FOR END USER BLUEPRINT
if config.DEBUG == True:
    pass
else:
    csrf.exempt(gboard_routes)
    # pass
app.register_blueprint(gboard_routes, url_prefix="/gboard")


############# End of Blueprints #######################################


# def personal_mailer(UserEmail, subject):
#     mail_pistol.mail.custom_mail(
#         MAIL,
#         flask.render_template("mail_templates/offer_letter_test.html"),
#         subject,
#         UserEmail,
#         "Galam-HR",
#     )


# @app.route("/send_out_emails")
# def send_out_emails():
#     dab = config.DB[config.DATABASE]
#     dac = dab["USER_DETAILS"]
#     fil = {}
#     reter = {"UserEmail": 1}
#     for i in dac.find(fil, reter):
#         print(i["UserEmail"])
#         if i["UserEmail"] == "Anonymous@galam.in":
#             continue
#         personal_mailer(i["UserEmail"])
#     return "Done", 200


# Testing
# @app.route("/testing", methods=["GET"])
# @limiter.limit(
#     "2 per minute",
#     key_func=lambda: dbops.get.get_rate_limiting_user_token_details(
#         flask.session["Top_Secret_Token"]
#     )["UserEmail"],
# )
# def tester_route():
#     # This route is for updating the description of a circle role.
#     User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
#     if not User_Details:
#         return "User Not Logged In", 403
#     return "Working", 200


# For Android Compatibility.
@app.route("/.well-known/assetlinks.json")
def assetlinks():
    return flask.send_from_directory("static", "assetlinks.json")


@app.route("/robots.txt")
def robots():
    return flask.send_from_directory("static", "seo_files/robots.txt")


@app.route("/sitemap.xml")
def sitemap():
    return flask.send_from_directory("static", "seo_files/sitemap.xml")


# OAUTH ROUTES
oauth_configurations = dbops.get.get_custom_configs_type("oauth_configurations")
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = oauth_configurations[
    "OAUTHLIB_INSECURE_TRANSPORT"
]

if oauth_configurations:
    if "github" in oauth_configurations.keys():
        if (
            oauth_configurations["github"]["client_id"]
            and oauth_configurations["github"]["client_secret"]
        ):
            blueprint = make_github_blueprint(
                client_id=oauth_configurations["github"]["client_id"],
                client_secret=oauth_configurations["github"]["client_secret"],
                # add scope to get email id.
                scope=oauth_configurations["github"]["scope"],
                redirect_to="oauth_login_api",
            )
            app.register_blueprint(blueprint, url_prefix="/oauth")
            provide_oauth["github"] = 1
    if "google" in oauth_configurations.keys():
        if (
            oauth_configurations["google"]["client_id"]
            and oauth_configurations["google"]["client_secret"]
        ):
            blueprint2 = make_google_blueprint(
                client_id=oauth_configurations["google"]["client_id"],
                client_secret=oauth_configurations["google"]["client_secret"],
                scope=oauth_configurations["google"]["scope"],
                redirect_to="oauth_login_api",
            )
            app.register_blueprint(blueprint2, url_prefix="/oauth")
            provide_oauth["google"] = 1


@app.route("/login2/githublogin")
@limiter.limit("15 per hour")
def oauth_login_api_github():
    if not github.authorized:
        return flask.redirect(flask.url_for("github.login"))
    try:
        resp = github.get("/user")
        return flask.redirect(flask.url_for("oauth_login_api"))
    except:
        github.token = None
        return flask.redirect(flask.url_for("github.login"))


@app.route("/login2/googlelogin")
@limiter.limit("15 per hour")
def oauth_login_api_google():
    if not google.authorized:
        return flask.redirect(flask.url_for("google.login"))
    try:
        resp = google.get("/oauth2/v2/userinfo")
        return flask.redirect(flask.url_for("oauth_login_api"))
    except:
        google.token = None
        return flask.redirect(flask.url_for("google.login"))


@app.route("/oauth2/login_success", methods=["GET"])
@limiter.limit("40 per hour")
def oauth_login_api():
    if github.authorized:
        resp = github.get("/user/emails")
        if resp.ok:
            print(resp.json())
            User_Email = resp.json()[0]["email"]
            if oauth_login_user(User_Email):
                return flask.redirect("/home")
            new_registry = {
                "email": User_Email,
                "password": "",
                "confirm_password": "",
                "agreement": "on",
                "signedup_with": "Github",
            }
            undecorated_user_basic_register_only_email_JSONIC_for_oauth(new_registry)
            if oauth_login_user(User_Email):
                return flask.redirect("/home")

    elif google.authorized:
        resp = google.get("/oauth2/v2/userinfo")
        if resp.ok:
            print(resp.json())
            User_Email = resp.json()["email"]
            if oauth_login_user(User_Email):
                return flask.redirect("/home")
            new_registry = {
                "email": User_Email,
                "password": "",
                "confirm_password": "",
                "agreement": "on",
                "signedup_with": "Google",
            }
            undecorated_user_basic_register_only_email_JSONIC_for_oauth(new_registry)
            if oauth_login_user(User_Email):
                return flask.redirect("/home")
    return flask.redirect("/login2")


def undecorated_user_basic_register_only_email_JSONIC_for_oauth(json_data):
    allowed_list = [
        "email",
        "password",
        "confirm_password",
        "agreement",
        "signedup_with",
    ]

    if set(list(json_data.keys())) != set(allowed_list):
        return False
    data_verifications.structured_verifiers.email_verification(
        json_data["email"],
        4,
        100,
        [
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "icloud.com",
            "hotmail.com",
            "rocketmail.com",
            "mac.com",
        ],
    )
    if json_data["password"] != json_data["confirm_password"]:
        return False
    json_data["username"] = common_mains.create_random_string_of_10_chara()
    while True:
        if dbops.get.verify_if_DisplayName_exists(json_data["username"]):
            json_data["username"] = common_mains.create_random_string_of_10_chara()
        else:
            break
    if dbops.get.verify_if_email_id_exists(json_data["email"], ["USER_DETAILS", "OTP"]):
        return False

    final_data = {
        "DisplayName": json_data["username"],
        "UserEmail": json_data["email"],
        "UserPassword": json_data["password"],
        "Aadhar_Number": "ABC123456789",
        "Voter_Number": "ABC1234567",
        "VoterID_Verification": "No",
        "Aadhar_Verification": "No",
        "Circles": [],
        "UserAgreement": "Agreed",
        "signedup_with": json_data["signedup_with"],
        "Available_username": "Yes",
        "startup_screen": "Yes",
    }
    CUSTOM_INITIALS = dbops.get.get_custom_configs_type("circle_creation_configs")
    final_data["Powers"] = CUSTOM_INITIALS["Powers"]
    final_data = the_function_to_join_circle(final_data, "MyCircle")
    step1_registration = dbops.inserts.basic_register_user(final_data)
    if step1_registration:
        # mail_pistol.mail.custom_mail(
        #     MAIL,
        #     flask.render_template("mail_templates/OTP_Template.html", OTP=step1_OTP),
        #     "Email Verification",
        #     final_data["UserEmail"],
        #     "Founder",
        # )
        mail_pistol.mail.custom_mail(
            MAIL,
            flask.render_template(
                "mail_templates/welcome_template.html",
            ),
            "Welcome to Galam",
            final_data["UserEmail"],
            "Galam-Team",
        )
        True
    return False


# OAuth routes
# OAUTH ROUTES


# AADHAR AND VOTER ID VERIFICATION ROUTES
@limiter.limit("15 per hour")
@app.route("/api/v1/user/aadhar_verification_get_captcha", methods=["GET"])
def aadhar_verification_get_captcha():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "aadhar_verification" not in User_Details["Powers"]:
        return "User Not Allowed", 403
    aadhar_id = flask.request.args.get("aadhar_id")
    aadhar_id = aadhar_id.replace(" ", "")
    if len(aadhar_id) != 12:
        return "Invalid Aadhar ID", 403
    if not data_verifications.Verhoeff.is_valid(aadhar_id):
        return "Invalid Aadhar ID", 403
    get_captcha_details_base64_dict = email_dbops.inserts.aadhar_verification_get_captcha(  ####################################
        aadhar_id, User_Details["UserEmail"]
    )
    if get_captcha_details_base64_dict:
        return get_captcha_details_base64_dict, 200
    return "Captcha Generation Failed", 403


@app.route(
    "/api/v1/user/aadhar_verification_validate_captcha_and_send_otp", methods=["POST"]
)
@limiter.limit("15 per hour")
def aadhar_verification_validate_captcha_and_send_otp():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "aadhar_verification" not in User_Details["Powers"]:
        return "User Not Allowed", 403
    json_data = flask.request.get_json()
    allowed_list = ["captcha_id", "captcha"]
    if set(list(json_data.keys())) != set(allowed_list):
        return "Invalid JSON", 403
    captcha_id = json_data["captcha_id"]
    captcha = json_data["captcha"]
    verify_details = email_dbops.get.verify_if_captcha_and_captcha_is_successful(
        json_data["captcha_id"], captcha, User_Details["UserEmail"]
    )

    if not verify_details:
        return "Invalid Captcha", 403
    return "Successfully Sent OTP", 200


@app.route("/api/v1/user/aadhar_verification_validate_mobile_otp", methods=["POST"])
@limiter.limit("15 per hour")
def aadhar_verification_validate_mobile_otp():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "aadhar_verification" not in User_Details["Powers"]:
        return "User Not Allowed", 403
    json_data = flask.request.get_json()
    allowed_list = ["otp"]
    if set(list(json_data.keys())) != set(allowed_list):
        return "Invalid JSON", 403
    otp = json_data["otp"]
    if len(otp) != 6 and not otp.isdigit():
        return "Invalid OTP", 403
    verify_details = email_dbops.get.verify_if_aadhar_otp_is_valid(
        User_Details["UserEmail"], otp
    )
    if not verify_details:
        return "Invalid OTP", 403

    if common_mains.if_in_circle(User_Details, "India"):
        India_Pure_Circle_Details = dbops.get.get_pure_circle_details_without_images(
            "India"
        )
        dbops.updates.update_user_role(
            "India",
            User_Details["UserEmail"],
            India_Pure_Circle_Details["Default_Role_For_Verified_Users"],
        )
    else:
        if not the_function_to_join_circle(User_Details, "India"):
            return "Invalid Circle", 200
    try:
        if (
            verify_details["district"] == "Hyderabad"
            and verify_details["state"] == "Andhra Pradesh"
        ):
            verify_details["state"] = "Telangana"
        if common_mains.if_in_circle(User_Details, verify_details["state"]):
            Circle_Pure_Details = dbops.get.get_pure_circle_details_without_images(
                verify_details["state"]
            )
            dbops.updates.update_user_role(
                verify_details["state"],
                User_Details["UserEmail"],
                Circle_Pure_Details["Default_Role_For_Verified_Users"],
            )
        else:
            if not the_function_to_join_circle(User_Details, verify_details["state"]):
                return "Invalid Circle", 200
            v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
    except:
        pass
    v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
    return "Successfully Verified OTP and User", 200


@app.route("/api/v1/user/voter_id_verification/<voter_id>", methods=["GET"])
@limiter.limit("15 per hour")
def voter_id_verification(voter_id):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "voter_id_verification" not in User_Details["Powers"]:
        return "User Not Allowed", 403
    voter_id = voter_id.replace(" ", "")
    if len(voter_id) != 10:
        return "Invalid Voter ID", 403
    voter_id_details = email_dbops.get.verify_if_voter_id_exists(
        voter_id, User_Details["UserEmail"]
    )
    if not voter_id_details:
        return "Invalid Voter ID", 403
    # Do some inserting and updating--what to do with these details.
    v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
    return "Successfully Verified User", 200


@app.route("/api/v1/user/close_startup_screen", methods=["GET"])
def close_startup_screen():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "close_startup_screen" not in User_Details["Powers"]:
        return "User Not Allowed", 403
    action = flask.request.args.get("action")
    if action not in ["Yes", "No"]:
        return "Invalid Action", 403
    set1 = dbops.updates.update_user_details_by_email(
        User_Details["UserEmail"], {"$set": {"startup_screen": action}}
    )
    v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
    return "Successfully set startup_screen to No", 200


# AADHAR AND VOTER ID VERIFICATION ROUTES


# Subscription Routes for Web Push Notifications.
@app.route("/api/v1/user/subscribe", methods=["POST"])
@limiter.limit("500 per hour")
def subscribe():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return flask.jsonify({"Status": "Failure"}), 403
    # if "web_push_notifications" not in User_Details["Powers"]:
    #     return flask.jsonify({"success": False}), 403
    subscription_info = flask.request.get_json()
    subscription_info["endpoint"] = subscription_info["endpoint"].replace(
        "https://", "https://"
    )
    r1 = dbops.inserts.create_new_subscription_for_notifications(
        User_Details["UserEmail"], subscription_info
    )
    if r1[0]:
        dbops.webpushing.find_and_push(User_Details["UserEmail"])
        return flask.jsonify({"Status": "Yes"}), 200
    return flask.jsonify({"Status": "Yes_no new details to push"}), 200


# Subscription Routes for Web Push Notifications.


def login_session(theffunc):
    def inner_function(*args, **kwargs):
        if "Top_Secret_Token" in flask.session:
            UserDetails = dbops.get.get_user_token_details(
                flask.session["Top_Secret_Token"]
            )
            if UserDetails:
                return theffunc(UserDetails)
        return flask.redirect("/login2")

    return inner_function


# @app.route("/testing_limits", methods=["GET"])
# @limiter.limit(
#     "1 per day",
#     key_func=lambda: dbops.get.get_user_token_details(flask.session["Top_Secret_Toke"])[
#         "UserEmail"
#     ],
#     deduct_when=lambda response: response.status_code == 200,
# )
# def login_verification():
#     UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
#     if not UserDetails:
#         return flask.redirect("/login2")
#     return "Login Verification Successful", 400


@app.route("/email_verification", methods=["GET"])
def email_verification_page():
    user_email = flask.request.args.get("user_email")
    verification_type = flask.request.args.get("verification_type")
    if not user_email:
        return "Invalid Email", 403
    if not dbops.get.verify_if_email_id_exists(user_email, ["USER_DETAILS", "OTP"]):
        return "Invalid Email", 403
    if verification_type not in ["Registration", "reset_password"]:
        return "Invalid Verification Type", 403
    data_verifications.structured_verifiers.email_verification(
        user_email,
        4,
        100,
        [
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "icloud.com",
            "hotmail.com",
            "rocketmail.com",
            "mac.com",
            "protonmail.com",
        ],
    )
    return flask.render_template(
        "mail_templates/verify_email.html",
        user_email=user_email,
        verification_type=verification_type,
    )


@app.route("/api/v1/user/get_SSE_ENGINE_TOKEN", methods=["GET"])
def get_SSE_ENGINE_TOKEN():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    return (
        flask.jsonify(
            {
                "SSE_ENGINE_TOKEN": flask.session["Top_Secret_Token"],
                "SSE_ENGINE_URL": config.SSE_API_URL,
            }
        ),
        200,
    )


@app.route("/api/v1/user/email_only_registration", methods=["POST"])
@limiter.limit("10 per hour")
def user_basic_register_only_email_JSONIC():
    json_data = flask.request.get_json()
    allowed_list = [
        "email",
        "password",
        "confirm_password",
        "username",
        "agreement",
    ]
    if set(list(json_data.keys())) != set(allowed_list):
        return "Invalid JSON", 403
    data_verifications.structured_verifiers.email_verification(
        json_data["email"],
        4,
        100,
        [
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "icloud.com",
            "hotmail.com",
            "rocketmail.com",
            "mac.com",
        ],
    )
    data_verifications.structured_verifiers.string_verification(
        json_data["password"], 64, 64
    )
    data_verifications.structured_verifiers.string_verification(
        json_data["confirm_password"], 64, 64
    )

    if json_data["password"] != json_data["confirm_password"]:
        return "Password and Confirm Password are not same", 403
    if json_data["agreement"] != "on":
        return "User Agreement Not Agreed", 403
    data_verifications.structured_verifiers.string_verification(
        json_data["username"], 4, 64
    )
    if dbops.get.verify_if_DisplayName_exists(json_data["username"]):
        return "Username Already Exists", 403
    if dbops.get.verify_if_email_id_exists(json_data["email"], ["USER_DETAILS", "OTP"]):
        return "Email Already Exists", 403
    final_data = {
        "DisplayName": json_data["username"],
        "UserEmail": json_data["email"],
        "UserPassword": json_data["password"],
        "Aadhar_Number": "ABC123456789",
        "Voter_Number": "ABC1234567",
        "VoterID_Verification": "No",
        "Aadhar_Verification": "No",
        "Circles": [],
        "UserAgreement": "Agreed",
        "signedup_with": flask.request.headers.get("User-Agent"),
        "Available_username": "Yes",
        "startup_screen": "Yes",
    }
    CUSTOM_INITIALS = dbops.get.get_custom_configs_type("circle_creation_configs")
    final_data["Powers"] = CUSTOM_INITIALS["Powers"]
    final_data = the_function_to_join_circle(final_data, "MyCircle")
    step1_OTP = email_dbops.inserts.create_OTP_and_insert_in_DB(
        final_data["UserEmail"], "OTP", final_data
    )
    if step1_OTP:
        mail_pistol.mail.custom_mail(
            MAIL,
            flask.render_template("mail_templates/OTP_Template.html", OTP=step1_OTP),
            "Email Verification",
            final_data["UserEmail"],
            "Founder",
        )
        return "OTP Sent", 200
    return "OTP Sending Failed", 403


def the_function_to_join_circle(UserDetails, circleName):
    circle_object = dbops.get.get_pure_circle_details_without_images(circleName)
    if not circle_object:
        return False
    if circle_object["isClosed"] == "Yes":
        return False
    for i in UserDetails["Circles"]:
        if i["DisplayName"] == circleName:
            return False
    default_role = circle_object["Default_Role"]
    verified_default_role = circle_object["Default_Role_For_Verified_Users"]
    if default_role not in circle_object["Roles_List"]:
        return "Invalid Role Name", 403
    if UserDetails["Aadhar_Verification"] == "Yes":
        user_circle_object = {
            "DisplayName": circleName,
            "Role": verified_default_role,
            "Powers": circle_object["Roles"][verified_default_role]["Role_Powers"],
        }
    else:
        user_circle_object = {
            "DisplayName": circleName,
            "Role": default_role,
            "Powers": circle_object["Roles"][default_role]["Role_Powers"],
        }
    user_circle_object = {
        "DisplayName": circleName,
        "Role": default_role,
        "Powers": circle_object["Roles"][default_role]["Role_Powers"],
    }
    UserDetails["Circles"].append(user_circle_object)
    dbops.updates.update_circle_details_customized(
        circleName, {"$inc": {"All_Time_Member_Traffic": 1, "Current_Members": 1}}
    )
    return UserDetails


@app.route("/api/v1/user/email_only_otp_verification/", methods=["POST"])
def email_only_otp_verification():
    form_details = flask.request.form
    otp_dict = dict(form_details)
    UserEmail = otp_dict["user_email"]
    del otp_dict["user_email"]
    otp = []
    if otp_dict["verification_type"] == "Registration":
        del otp_dict["verification_type"]
        for i in otp_dict:
            otp.append(otp_dict[i])
        if len(otp) != 4:
            return "Invalid OTP", 403
        otp = "".join(otp)
        check_dict = {"UserEmail": UserEmail, "Type": "OTP", "OTP": otp}
        step1 = email_dbops.get.get_OTP(check_dict)
        if not step1:
            return "Invalid OTP", 403
        r1 = dbops.inserts.basic_register_user(step1["UserDict"])
        if r1:
            email_dbops.deletes.delete_OTP(UserEmail, "OTP")
            mail_pistol.mail.custom_mail(
                MAIL,
                flask.render_template(
                    "mail_templates/welcome_template.html",
                ),
                "Welcome to Galam",
                UserEmail,
                "Galam-Team",
            )
            return "Email Only OTP Verification", 200
    if otp_dict["verification_type"] == "reset_password":
        new_pass = otp_dict["new_password"]
        del otp_dict["verification_type"]
        del otp_dict["new_password"]
        for i in otp_dict:
            otp.append(otp_dict[i])
        if len(otp) != 4:
            return "Invalid OTP", 403
        otp = "".join(otp)

        check_dict = {"UserEmail": UserEmail, "Type": "Reset_OTP", "OTP": otp}
        step1 = email_dbops.get.get_OTP(check_dict)
        if not step1:
            return "Invalid OTP", 403
        data_verifications.structured_verifiers.string_verification(new_pass, 64, 64)
        r1 = dbops.updates.update_user_details_by_email(
            UserEmail,
            {
                "$set": {
                    "UserPassword": dbops.sha512(new_pass.encode("utf-8")).hexdigest()
                }
            },
        )
        if r1:
            email_dbops.deletes.delete_OTP(UserEmail, "Reset_OTP")
            mail_pistol.mail.custom_mail(
                MAIL,
                flask.render_template(
                    "mail_templates/reset_password_successfully.html",
                ),
                "Password Reset Successfully",
                UserEmail,
                "Galam-Team",
            )
            return "Email Only OTP Verification", 200
    return "Email Only OTP Verification Failed", 403


@app.route("/api/v1/user/start_reset_password_otp", methods=["GET"])
@limiter.limit("2 per minute")
def reset_password_otp():
    try:
        UserDetails = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
    except:
        UserDetails = {"UserEmail": flask.request.args.get("user_email")}
    if not UserDetails["UserEmail"]:
        return "Invalid Email", 403
    if not dbops.get.verify_if_email_id_exists(
        UserDetails["UserEmail"], ["USER_DETAILS"]
    ):
        return "Invalid Email", 403

    step1_OTP = email_dbops.inserts.create_OTP_and_insert_in_DB(
        UserDetails["UserEmail"], "Reset_OTP", {}
    )
    mail_pistol.mail.custom_mail(
        MAIL,
        flask.render_template("mail_templates/OTP_Reset_Template.html", OTP=step1_OTP),
        "Reset Password OTP Verification",
        UserDetails["UserEmail"],
        "Reset-Password",
    )
    email_arg_string = "?user_email=" + UserDetails["UserEmail"]
    email_arg_string += "&verification_type=reset_password"
    return flask.url_for("email_verification_page") + email_arg_string


############################## This is a test route for testing the email sending system. ##############################
@limiter.limit("1 per minute")
@app.route("/home", methods=["GET"])
# @login_session
# Limit by User_Details["UserEmail"]
def home_webpage():
    optional_select_circle = flask.request.args.get("circle_name")
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if not User_Details or User_Details["UserEmail"] == "Anonymous@galam.in":
            raise Exception
    except:
        User_Details = False
        if optional_select_circle:
            try:
                User_Details, session_token_id = dbops.inserts.anonymous_token_creation(
                    flask.session, optional_select_circle
                )
            except:
                return flask.redirect("/login2")
        else:
            return flask.redirect("/login2")
    app.logger.info("IP: " + flask.request.remote_addr + " Accessed Home Page")
    User_Circles = []
    for i in User_Details["Circles"]:
        User_Circles.append(i["DisplayName"])
    if User_Details["startup_screen"] != "Yes":
        User_Details["startup_screen"] = False

    if optional_select_circle:
        if optional_select_circle not in User_Circles:
            optional_select_circle = False
    isAnon = "No"
    if User_Details["UserEmail"] == "Anonymous@galam.in":
        isAnon = "Yes"
    favoured_language = common_mains.get_favoured_langauge_html(
        User_Details, "home.html"
    )
    return render_template(
        # If you want to change the language use this crap.
        favoured_language[0],
        User_Circles=User_Circles,
        user_powers=User_Details["Powers"],
        startup_screen_enabled=User_Details["startup_screen"],
        optional_select_circle=optional_select_circle,
        isAnonymous=isAnon,
        favoured_language=favoured_language[1],
    )


@app.route("/circles", methods=["GET"])
def circles_controlboard_webpage():
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if not User_Details or User_Details["UserEmail"] == "Anonymous@galam.in":
            return flask.redirect("/login2")
    except:
        return flask.redirect("/login2")
    app.logger.info(
        "IP: " + flask.request.remote_addr + " Accessed Circles Controlboard Page"
    )
    return render_template("circles_controlboard.html")


@app.route("/profile", methods=["GET"])
def profile_webpage():
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if not User_Details or User_Details["UserEmail"] == "Anonymous@galam.in":
            return flask.redirect("/login2")
    except:
        return flask.redirect("/login2")
    app.logger.info("IP: " + flask.request.remote_addr + " Accessed Profile Page")
    required_verification = "No"
    if (
        "aadhar_verification" in User_Details["Powers"]
        or "voter_id_verification" in User_Details["Powers"]
    ):
        print("User has Aadhar or Voter ID Verification Powers")
        required_verification = "Yes"
    return render_template(
        "profile_page.html", required_verification=required_verification
    )


@app.route("/circles/<DisplayName>", methods=["GET"])
def specific_circle_controlboard_webpage(DisplayName):
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if not User_Details or User_Details["UserEmail"] == "Anonymous@galam.in":
            return flask.redirect("/login2")
        circle_power_verification = common_mains.circle_power_verification(
            User_Details, DisplayName, "specific_circle_controlboard_webpage"
        )
        if circle_power_verification[1] >= 400:
            return flask.redirect("/login2")
    except:
        return flask.redirect("/login2")
    circle_data_of_information_board = (
        dbops.get.get_information_board_title_and_subtitle(DisplayName)
    )
    app.logger.info(
        "IP: "
        + flask.request.remote_addr
        + " Accessed Specific Circle Controlboard Web Page"
    )
    return render_template(
        "specific_circle_controlboard.html",
        DisplayName=DisplayName,
        circle_data_of_information_board=circle_data_of_information_board,
    )


# @app.route("/post/<circle_name2>/<post_id>")
@app.route("/post/<post_id>", methods=["GET"])
def generic_post_webpage(post_id, circle_name2=None):
    circle_name = flask.request.args.get("circle_name")
    if circle_name2:
        circle_name = circle_name2
    # optional_comment_id = flask.request.args.get("comment_id")
    User_Circles = [circle_name]
    # if optional_comment_id:
    #     data_verifications.post_id_verification(optional_comment_id)
    data_verifications.post_id_verification(post_id)
    data_verifications.stringVerification(circle_name)
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if User_Details["UserEmail"] == "Anonymous@galam.in":
            raise Exception
    except:
        User_Details = False
        try:
            User_Details, session_token_id = dbops.inserts.anonymous_token_creation(
                flask.session, circle_name
            )
        except:
            return flask.redirect("/login2")
    isAnon = "No"
    if User_Details["UserEmail"] == "Anonymous@galam.in":
        isAnon = "Yes"
    if User_Details:
        isUser = "Yes"
        post_details = dbops.get.get_single_post_in_a_circle(
            circle_name, post_id, User_Details
        )
        attachhment_details = (
            dbops.get.get_all_images_and_PDFs_in_a_single_post_in_a_cricle_as_array(
                circle_name, post_id
            )
        )
        for i in attachhment_details["images"]:
            i_index = attachhment_details["images"].index(i)
            image_url = flask.url_for(
                "get_pictures_from_mongodb_for_single_post",
                circlename=circle_name,
                image_id=i,
            )
            attachhment_details["images"].remove(i)
            attachhment_details["images"].insert(i_index, image_url)
            print(attachhment_details["images"])
        for i in attachhment_details["pdfs"]:
            i_index = attachhment_details["pdfs"].index(i)
            image_url = flask.url_for(
                "get_pictures_from_mongodb_for_single_post",
                circlename=circle_name,
                image_id=i,
            )
            attachhment_details["pdfs"].remove(i)
            attachhment_details["pdfs"].insert(i_index, image_url)
        post_details["attachment_store"] = attachhment_details
        get_user_powers = common_mains.get_all_powers_of_user(User_Details, circle_name)
        return render_template(
            "post_page.html",
            User_Circles=User_Circles,
            post_details=post_details,
            isUser=isUser,
            user_powers=get_user_powers,
            isAnonymous=isAnon,
            og_timestamp=post_details["CreatedAt"].strftime("%Y-%m-%dT%H:%M:%S%z"),
        )

    post_details = dbops.get.get_single_post_in_a_circle(circle_name, post_id)
    return render_template(
        "post_page.html",
        User_Circles=User_Circles,
        post_details=post_details,
        isUser="No",
        isAnonymous=isAnon,
        og_timestamp=post_details["CreatedAt"].strftime("%Y-%m-%dT%H:%M:%S%z"),
    )


@app.route("/api/v1/pictures/<circlename>/<picture_id>", methods=["GET"])
def get_pictures_from_mongodb(circlename, picture_id):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circlename, "get_pictures_from_mongodb"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    base64_image = dbops.get.get_base64_image_from_a_circle(picture_id, circlename)
    if base64_image:
        image_file_object = data_verifications.convert_base64_to_file(base64_image)
        return flask.send_file(
            image_file_object, mimetype="image/png", download_name="image.png"
        )


@app.route("/api/v1/user/get_user_details", methods=["GET"])
def get_user_details():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "get_user_details" not in User_Details["Powers"]:
        return "User Not Allowed", 403
    self_user = flask.request.args.get("self_user")
    if self_user == "Yes":
        requested_user_details = dbops.get.get_user_details_by_email(
            User_Details["UserEmail"]
        )
        del requested_user_details["UserPassword"]
        del requested_user_details["Circles"]
        del requested_user_details["Powers"]
        del requested_user_details["_id"]
        return requested_user_details, 200
    encrypted_email_of_the_user_data = flask.request.args.get("UserData")
    unencrypted_email = dbops.deco(encrypted_email_of_the_user_data)
    print(unencrypted_email)
    requested_user_details = dbops.get.get_user_details_by_email(
        unencrypted_email, {"Description": 1, "UserEmail": 1, "_id": 0}
    )
    if not requested_user_details:
        return {"Status": "Deleted", "Description": "User Deleted"}
    if "Description" not in requested_user_details.keys():
        return {"Status": "Active", "Description": "No Description"}
    return {
        "Status": "Active",
        "Description": requested_user_details["Description"],
    }, 200


@app.route("/api/v1/images/post/<circlename>/<image_id>", methods=["GET"])
def get_pictures_from_mongodb_for_single_post(circlename, image_id):
    """This is for getting the image of a single post."""
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circlename, "get_pictures_from_mongodb_for_single_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    data_verifications.stringVerification(circlename)
    data_verifications.post_id_verification(image_id)
    base64_image = dbops.get.get_base64_image_from_a_circle_post(circlename, image_id)
    if base64_image:
        image_file_object = data_verifications.convert_base64_to_file(
            base64_image["base64"]
        )
        if base64_image["base64_type"] == "PDF":
            return flask.send_file(
                image_file_object,
                mimetype="application/pdf",
                download_name=base64_image["title"],
            )
        elif base64_image["base64_type"] == "IMAGE":
            return flask.send_file(
                image_file_object,
                mimetype="image/png",
                download_name=base64_image["title"],
            )


@app.route("/editor", methods=["GET"])
def Editor_webpage():
    app.logger.info("IP: " + flask.request.remote_addr + " Accessed Editor Page")
    return render_template("editor_tester.html")


@app.route("/register2", methods=["GET"])
def registration_webpage2():
    app.logger.info("IP: " + flask.request.remote_addr + " Accessed Editor Page")
    return render_template("registration_only_email.html")


@app.route("/login2", methods=["GET"])
def login_webpage2():
    # Get the user email through the API.
    # if flask.request.headers.get("X-Forwarded-For"):
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if not User_Details or User_Details["UserEmail"] == "Anonymous@galam.in":
            raise Exception
        if User_Details:
            return flask.redirect("/home")
    except:
        return render_template("login2.html", oauth=provide_oauth)
    return render_template("login2.html", oauth=provide_oauth)


def oauth_login_user(email):
    User_Email = email
    v1 = {
        "UserEmail": User_Email,
    }
    User_Info = dbops.get.get_user_details_by_dict(v1)
    if not User_Info:
        return False
    if "login_user" not in User_Info["Powers"]:
        return False
    del User_Info["_id"]
    r1 = dbops.inserts.token_creation(User_Info)
    if r1:
        flask.session["Top_Secret_Token"] = r1
        flask.session.permanent = True
        return True
    return False


@app.route("/sw.js")
def service_worker():
    response = flask.make_response(
        flask.send_from_directory(
            "static",
            path="js/sw.js",
        )
    )
    response.headers["Content-Type"] = "application/javascript"
    response.headers["Service-Worker-Allowed"] = "/"
    print(response.headers)
    return response


################################ End of Template Routes############################################


############################### API Routes without Authentication##################################
@app.route("/api/v1/user/basic_register", methods=["POST"])
def user_basic_register_user():
    data = flask.request.form
    form1 = forms.Basic_Registration(meta={"csrf": not config.DEBUG})
    app.logger.info(
        "API___user_basic_register_user__ IP: "
        + flask.request.remote_addr
        + " Accessed Basic Registration API"
    )
    if form1.validate_on_submit():
        User_Info = dict(data)
        v1 = {
            "Powers": ["Advanced_Registration"],
            "UserEmail": User_Info["UserEmail"],
            "UserPassword": User_Info["UserPassword"],
            "UserAgreement": User_Info["UserAgreement"],
            "csrf_token": User_Info["csrf_token"],
            "Available_username": "Yes",
        }
        r1 = dbops.inserts.basic_register_user(v1)
        if r1:
            r2 = dbops.inserts.token_creation(v1)
            if r2:
                flask.session["Top_Secret_Token"] = r2
                return "User Registered", 200
        return "User Registration Failed Because Email Already Exists", 412
    else:
        print(form1.errors)
        print("Form is Invalid")
        return "Form is Invalid", 400


@app.route("/api/v1/user/basic_register2", methods=["POST"])
def user_basic_register_user2_JSONIC():
    json_data = flask.request.get_json()
    allowed_list = [
        "VoterID",
        "Aadhar",
        "email",
        "password",
        "confirm_password",
        "username",
        "agreement",
    ]
    if set(list(json_data.keys())) != set(allowed_list):
        # Because VoterID is not mandatory.
        allowed_list.remove("VoterID")
        if set(list(json_data.keys())) != set(allowed_list):
            print("Invalid JSON")
            return "Invalid JSON", 403
    if json_data["VoterID"] == "":
        json_data["VoterID"] = "ABC1234567"

    data_verifications.structured_verifiers.string_verification(
        json_data["VoterID"], 10, 10
    )
    data_verifications.structured_verifiers.string_verification(
        json_data["Aadhar"], 12, 12
    )
    data_verifications.structured_verifiers.email_verification(
        json_data["email"],
        4,
        100,
        [
            "gmail.com",
            "yahoo.com",
            "outlook.com",
            "icloud.com",
            "hotmail.com",
            "rocketmail.com",
            "mac.com",
        ],
    )
    data_verifications.structured_verifiers.string_verification(
        json_data["password"], 4, 100
    )
    data_verifications.structured_verifiers.string_verification(
        json_data["confirm_password"], 4, 100
    )

    if json_data["password"] != json_data["confirm_password"]:
        return "Password and Confirm Password are not same", 403

    if dbops.get.verify_if_DisplayName_exists(json_data["username"]):
        print("Username Already Exists")
        return "Username Already Exists", 403
    if dbops.get.verify_if_email_id_exists(
        json_data["email"], ["USER_DETAILS", "PENDING_VERIFICATION"]
    ):
        return "Email Already Exists", 403
    if dbops.get.verify_if_aadhar_already_exists(
        json_data["Aadhar"], ["USER_DETAILS", "PENDING_VERIFICATION"]
    ):
        return "Aadhar Already Exists", 403
    if json_data["VoterID"] != "ABC1234567":
        if dbops.get.verify_if_voter_id_already_exists(
            json_data["VoterID"], ["USER_DETAILS", "PENDING_VERIFICATION"]
        ):
            print("VoterID Already Exists")
            return "VoterID Already Exists", 403
    final_data = {
        "DisplayName": json_data["username"],
        "UserEmail": json_data["email"],
        "UserPassword": json_data["password"],
        "Aadhar_Number": json_data["Aadhar"],
        "Voter_Number": json_data["VoterID"],
    }
    step1 = dbops.inserts.register_for_verification(final_data)
    if step1:
        return "User Application Registered", 200
    return "Application Registration Failed", 403


############################### End of API Routes without Authentication##################################


############################### API Routes with Authentication (Session Top_Secret_Token)##################################
@app.route("/api/v1/user/Advanced_Registration", methods=["POST"])
def Advanced_Registration():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if "Advanced_Registration" not in User_Details["Powers"]:
        return "You are not allowed to do this", 403
    return "Advanced Registration"


@app.route("/api/v1/user/approve_registration", methods=["POST"])
def approve_registration():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if "approve_registration" not in User_Details["Powers"]:
        return "You are not allowed to do this", 403
    json_data = flask.request.get_json()
    print(json_data)
    allowed_list = ["ApplicationID", "Additional_Details"]
    if set(list(json_data.keys())) != set(allowed_list):
        return "Invalid JSON", 403
    data_verifications.structured_verifiers.string_verification(
        json_data["ApplicationID"], 24, 24
    )
    step1 = dbops.updates.swap_application_to_users(
        json_data["ApplicationID"], json_data["Additional_Details"]
    )
    if step1:
        return "Application Approved", 200
    return "approve_registration Failed", 403


@app.route("/api/v1/user/login", methods=["POST"])
def login_user():
    print("Login API")
    dat = flask.request.form
    User_Info = dict(dat)
    print(User_Info)
    data_verifications.emailVerification(User_Info["UserEmail"])
    data_verifications.structured_verifiers.string_verification(
        User_Info["UserPassword"], 64, 64
    )
    v1 = {
        "UserEmail": User_Info["UserEmail"],
        "UserPassword": User_Info["UserPassword"],
    }

    User_Info = dbops.get.get_user_details_by_dict(v1)
    if not User_Info:
        return "User Login Failed", 412
    del User_Info["_id"]
    r1 = dbops.inserts.token_creation(User_Info)
    if r1:
        # Clear session of Top_Secret_Token
        # flask.session.pop("Top_Secret_Token", None)
        flask.session["Top_Secret_Token"] = r1
        flask.session.permanent = True
        # Make it secure and not accessible by Javascript. And must be from the same origin.
        return "Success", 200
    return "User Login Failed", 412


@app.route("/api/v1/user/logout", methods=["GET"])
def logout_user():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return flask.redirect("/login2")
    if "logout_user" not in User_Details["Powers"]:
        return "You are not allowed to do this", 403
    dbops.deleters.delete_session_token(flask.session["Top_Secret_Token"])
    # Clear OAuth Sessions
    flask.session.clear()
    flask.session.pop("Top_Secret_Token", None)
    return "Successful", 200


@app.route("/api/v1/user/resetpassword", methods=["POST"])
def reset_password():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    return "Password Reset"


############################ Work under Progress########################################
############################ End of Work under Progress##################################


@app.route("/api/v1/circle/create_circle", methods=["POST"])
def create_circle():
    """Limited to 5 per user"""
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "create_circle" not in User_Details["Powers"]:
        print(User_Details["Powers"])
        print("User Not Allowed to do this")
        return "You are not allowed to do this", 403
    formdata = flask.request.form
    circle_Data = nd()
    circle_Data["DisplayName"] = formdata["circle_create_display_name"]
    circle_Data["Description"] = formdata["circle_create_description"]
    circle_Data["Circle_Tags"] = data_verifications.split_string_by_commaseperator(
        formdata["circle_create_related_tags"]
    )
    circle_Data["Related_Circles"] = data_verifications.split_string_by_commaseperator(
        formdata["circle_create_related_circles"]
    )
    data_verifications.stringVerification(circle_Data["DisplayName"])
    data_verifications.stringVerification(circle_Data["Description"])
    # Strip the whitespaces from the display name and description.
    circle_Data["DisplayName"] = circle_Data["DisplayName"].strip()
    circle_Data["Description"] = circle_Data["Description"].strip()
    for i in circle_Data["Circle_Tags"]:
        if not len(i):
            circle_Data["Circle_Tags"].remove(i)
            continue
        data_verifications.stringVerification(i)
    circle_Data["Related_Circles"] = list(dict.fromkeys(circle_Data["Related_Circles"]))
    if len(circle_Data["Related_Circles"]) > 1:
        for i in circle_Data["Related_Circles"]:
            if not len(i):
                circle_Data["Related_Circles"].remove(i)
                continue
            data_verifications.stringVerification(i)
            assert dbops.get.verify_if_circle_exists(i)
    circle_Data["CreatorEmail"] = User_Details["UserEmail"]
    CUSTOM_INITIALS = dbops.get.get_custom_configs_type("circle_creation_configs")
    circle_Data["Roles"] = CUSTOM_INITIALS["Roles"]
    circle_Data["Roles_List"] = CUSTOM_INITIALS["Roles_List"]
    circle_Data["Flairs_List"] = CUSTOM_INITIALS["Flairs_List"]
    circle_Data["Default_Role"] = CUSTOM_INITIALS["Default_Role"]
    circle_Data["Default_Role_For_Verified_Users"] = CUSTOM_INITIALS[
        "Default_Role_For_Verified_Users"
    ]
    circle_Data["isClosed"] = "No"
    circle_Data["Current_Members"] = 1
    circle_Data["All_Time_Member_Traffic"] = 1
    circle_Data["Publicly_Available"] = "Yes"
    if dbops.inserts.circle_creation(circle_Data):
        user_updates = {
            "DisplayName": circle_Data["DisplayName"],
            "Powers": CUSTOM_INITIALS["Roles"]["Admin"]["Role_Powers"],
            "Role": "Admin",
        }
        User_Details["Circles"].append(user_updates)
        del User_Details["_id"]
        dbops.updates.update_user_details(User_Details)
        v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
        return "Circle Created", 200
    return "Circle Creation Failed", 403


@app.route("/api/v1/circle/get_circle_tags/<ListTypes>", methods=["GET"])
def get_circle_tags(ListTypes, query=None):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if ListTypes == "CircleTags":
        circle_tags = dbops.get.get_tags_for_circles()
    elif ListTypes == "RelatedCircleTags":
        cicle_query = flask.request.args.get("query")
        if len(cicle_query) < 2:
            return "Query Too Short", 412
        circle_tags = dbops.get.get_tags_for_related_circles(cicle_query)
    elif ListTypes == "CircleNames":
        cicle_query = flask.request.args.get("query")
        if len(cicle_query) < 2:
            return "Query Too Short", 412
        circle_tags = dbops.get.get_types_for_circles()
    # print(circle_tags)
    return {"circle_tags": circle_tags}, 200


@app.route("/api/v1/circle/get_circles", methods=["GET"])
def get_circle_details():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "get_circle_details" not in User_Details["Powers"]:
        return "You are not allowed to do this", 403
    current_number_of_circles = flask.request.args.get("skip")
    if not current_number_of_circles.isdigit():
        return "Invalid Skip", 403
    r1 = dbops.get.get_user_circle_details(User_Details, int(current_number_of_circles))
    for i in r1:
        i["isAdmin"] = "No"
        user_role = common_mains.circle_role_getter(User_Details, i["DisplayName"])
        if user_role == "Admin":
            i["isAdmin"] = "Yes"
    if r1:
        return {"Circle_Details": r1}, 200
    return "No Circles Found", 403


@app.route("/api/v1/circle/get_circle_statistics/<circle_name>", methods=["GET"])
def get_circle_statistics(circle_name):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle_name, "get_circle_statistics"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    r1 = dbops.get.get_circle_statistics(circle_name, "ultra_basic")

    if r1:
        return r1, 200
    return "No Statistics Found", 403


@app.route("/api/v1/circle/get_circle_users_details/<circle_name>", methods=["GET"])
def get_circle_users_details(circle_name):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle_name, "get_circle_users_details"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    noofusers_to_skip = flask.request.args.get("skip")
    data_verifications.structured_verifiers.string_verification(
        noofusers_to_skip, 1, 999999
    )
    circle_object = dbops.get.get_pure_circle_details_without_images(circle_name)
    r1 = dbops.get.get_circle_users_details(circle_name, int(noofusers_to_skip))
    if r1:
        return {
            "Circle_Users_Details": r1,
            "Roles_List": circle_object["Roles_List"],
        }, 200
    return "No More Users Found", 403


@app.route("/api/v1/circle/update_user_power/<circle_name>", methods=["POST"])
def update_user_circle_powers(circle_name):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle_name, "update_user_circle_powers"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    power_description = json_data["power_description"]
    data_verifications.structured_verifiers.string_verification(
        power_description, 2, 500
    )
    action = json_data["action"]
    if action not in ["add", "remove"]:
        return "Invalid Action", 403
    if action == "add":
        action = "Push"
    user_email = dbops.deco(json_data["userid"])
    update_user_object = dbops.get.get_user_details_by_email(user_email)
    powers_dict = (
        dbops.get.get_translation_of_power_to_description_for_circle_from_configs()
    )
    powers_list = common_mains.find_the_powers_list_from_power_description(
        powers_dict, power_description
    )
    ###### The below code is newly added and is not tested in production#############
    # Make sure the user has the powers to provide in the first place.
    # Make sure the role is to the right. Ignoring admin.
    current_user_role = common_mains.circle_role_getter(User_Details, circle_name)
    update_user_role = common_mains.circle_role_getter(update_user_object, circle_name)
    get_all_circle_roles = dbops.get.get_all_circle_roles(circle_name)["Roles_List"]
    verificaiton_step1 = (
        common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
            current_user_role, update_user_role, get_all_circle_roles
        )
    )
    if not verificaiton_step1 and current_user_role != "Admin":
        return "You are not allowed to do this", 403
    # Now check if the user has the array of powers_list in his circle powers.
    current_user_circle_powers = common_mains.get_all_powers_of_user(
        update_user_object, circle_name
    )
    if current_user_role != "Admin":
        for i in powers_list:
            if i not in current_user_circle_powers:
                return (
                    "You are not allowed to do this as you do not have the powers yourself",
                    403,
                )
    ###### The below code is newly added and is not tested in production#############
    strep1 = dbops.updates.update_user_circle_powers(
        user_email, circle_name, powers_list, action
    )
    if strep1:
        dbops.updates.reload_my_session_token(user_email)
        return "User Powers Updated", 200
    return "User Powers Update Failed", 403


@app.route("/api/v1/circle/find_circle_user/<circle_name>", methods=["POST"])
def find_single_circle_user(circle_name):
    # This goes inside single circle controlboard
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, circle_name, "find_single_circle_user"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    user_display_name = json_data["DisplayName"]
    data_verifications.structured_verifiers.string_verification(
        user_display_name, 2, 100
    )
    circle_object = dbops.get.get_pure_circle_details_without_images(circle_name)
    r1 = dbops.get.get_user_details_by_DisplayName_and_circle_name(
        user_display_name, circle_name
    )
    if r1:
        return {
            "Circle_Users_Details": r1,
            "Roles_List": circle_object["Roles_List"],
        }, 200
    return "User Details Not Found", 403


@app.route("/api/v1/circle/<circle_name>/create_role_symbol", methods=["POST"])
def create_role_symbol(circle_name):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle_name, "create_role_symbol"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    if list(json_data.keys()) != ["role_name", "role_symbol"]:
        return "Invalid JSON", 403
    role_name = json_data["role_name"]
    role_symbol = ""
    data_verifications.structured_verifiers.string_verification(role_name, 2, 100)
    if json_data["role_symbol"]:
        data_verifications.structured_verifiers.string_verification(
            json_data["role_symbol"], 1, 3
        )
        role_symbol = json_data["role_symbol"]
    step1 = dbops.updates.add_role_to_circle(circle_name, role_name, role_symbol)
    if step1:
        return "Role Added", 200
    return "Role Addition Failed", 403


@app.route("/api/v1/user/read_notification", methods=["POST"])
def mark_notification_as_read():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "mark_notification_as_read" not in User_Details["Powers"]:
        return "You are not allowed to do this", 403
    notifi_data = flask.request.get_json()
    notification_id = notifi_data["notification_id"]
    notification_all = notifi_data["notification_all"]
    circle = notifi_data["circle"]
    data_verifications.stringVerification(circle)
    if notification_all not in ["Yes", "No"]:
        return "Invalid Request", 412
    if not notification_id:
        return "Notification ID not provided", 412
    if notification_all == "Yes":
        r1 = dbops.updates.update_all_notifications_to_read(User_Details["UserEmail"])
    else:
        data_verifications.post_id_verification(notification_id)
        r1 = dbops.updates.update_notification_to_read(
            circle, User_Details["UserEmail"], notification_id
        )
    return "Notification Marked as Read", 200


@app.route("/api/v1/user/notifications", methods=["GET"])
def get_user_notifications():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "get_user_notifications" not in User_Details["Powers"]:
        return "You are not allowed to do this", 403
    noofnotificationstoskip = flask.request.args.get("skip")
    if not noofnotificationstoskip.isdigit():
        return "Invalid Request", 412
    r1 = dbops.get.get_user_notifications(
        User_Details["UserEmail"], int(noofnotificationstoskip)
    )
    total_count = dbops.get.count_total_number_of_user_notifications(
        User_Details["UserEmail"]
    )
    if r1:
        return {"Notifications": r1, "Total_count": total_count}, 200
    print("No Notifications Found")
    return {"message": "No notifications found", "Error": "Yes"}, 403


@app.route(
    "/api/v1/circle/get_information_and_announcement_board/<CircleName>",
    methods=["GET"],
)
def get_information_and_announcement_board(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "get_information_and_announcement_board"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    r1 = dbops.get.get_information_and_announcement_board_cards(
        CircleName, User_Details
    )
    if r1:
        return {"Information_Board": r1}, 200
    return "Circle Details Could Not be Found", 403


###################################### Start of Work Under progress################################################################


@app.route(
    "/api/v1/circle/user_moderation/update_user_role/<CircleName>", methods=["POST"]
)
def update_user_role(CircleName):
    # This route is for updating the role of a user in a circle.
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, CircleName, "update_user_role"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    end_user_email = dbops.deco(json_data["userid"])
    if UserDetails["UserEmail"] == end_user_email:
        return "You are not allowed to do this", 403
    new_role = json_data["update_to_new_role"]
    User_Role = common_mains.circle_role_getter(UserDetails, CircleName)
    circle_object = dbops.get.get_pure_circle_details_without_images(CircleName)
    if not common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
        User_Role, new_role, circle_object["Roles_List"]
    ):
        return "You are not allowed to do this", 403
    u1 = dbops.updates.update_user_role(CircleName, end_user_email, new_role)
    if u1:
        return "User Role Updated", 200
    return "User Role Update Failed", 403


@app.route(
    "/api/v1/circle/tag_moderation/create_new_flair_tag/<CircleName>", methods=["POST"]
)
def create_new_flair_tag(CircleName):
    # This route is for creating new flair tags in a circle.
    # This does not put the tag under any role, but just adds it to the generic pool.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "create_new_flair_tag"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    flair_tag_name = json_data["flair_tag_name"]
    if list(set(json_data.keys())) != ["flair_tag_name"]:
        return "Invalid Request", 412
    data_verifications.structured_verifiers.string_verification(flair_tag_name, 2, 50)
    step1 = dbops.inserts.create_new_flair_tag_in_a_circle(CircleName, flair_tag_name)
    if step1:
        return "Flair Tag Created Successfully", 200
    return "Flair Tag Creation Failed", 403


@app.route(
    "/api/v1/circle/tag_moderation/delete_flair_tag_from_general_pool/<CircleName>",
    methods=["GET"],
)
def delete_flair_tag_from_general_pool(CircleName):
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, CircleName, "delete_flair_tag_from_general_pool"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    flair_tag_name = flask.request.args.get("flair_tag_name")
    data_verifications.structured_verifiers.string_verification(flair_tag_name, 2, 50)
    step1 = dbops.deleters.delete_flair_tag_from_general_pool(
        flair_tag_name, CircleName
    )
    if step1:
        return "Flair Tag Deleted Successfully", 200
    return "Flair Tag Deletion Failed", 403


@app.route(
    "/api/v1/circle/user_moderation/get_all_flair_tags/<CircleName>", methods=["GET"]
)
def get_all_flair_tags(CircleName):
    # This route is for getting all the flair tags in a circle. The generic pool.
    UserDetils = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetils:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetils, CircleName, "get_all_flair_tags"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    step1 = dbops.get.get_flairs_for_circle2(CircleName)
    if step1:
        return {"all_flairs": step1}, 200
    return "An Unknown Error Occured", 403


@app.route(
    "/api/v1/circle/user_moderation/get_specific_role_flairs/<CircleName>",
    methods=["GET"],
)
def get_specific_role_flairs(CircleName):
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, CircleName, "get_specific_role_flairs"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    finding_flairs_for = flask.request.args.get("finding_flairs_for")
    data_verifications.structured_verifiers.string_verification(
        finding_flairs_for, 2, 20
    )
    UserRole = common_mains.circle_role_getter(UserDetails, CircleName)
    step1 = dbops.get.get_role_specific_flair_for_circle(CircleName, finding_flairs_for)
    if step1 != False:
        return {"specific_flairs": step1}, 200
    return "An Unknown Error Occured", 403


@app.route(
    "/api/v1/circle/user_moderation/update_circle_role_flair_tags/<CircleName>",
    methods=["POST"],
)
def update_circle_role_flair_tags(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "update_circle_role_flair_tags"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    UserRole = common_mains.circle_role_getter(User_Details, CircleName)
    data_verifications.structured_verifiers.string_verification(
        json_data["Flair_Name"], 2, 50
    )
    if json_data["action"] not in ["add", "remove"]:
        return "Invalid Action", 412
    data_verifications.structured_verifiers.string_verification(
        json_data["Role_Name"], 2, 20
    )
    if list(set(json_data.keys())) != list(set(["Flair_Name", "action", "Role_Name"])):
        return "Invalid Request", 412
    step1 = dbops.updates.update_circle_role_flair_tags(
        UserRole,
        CircleName,
        json_data["Flair_Name"],
        json_data["Role_Name"],
        json_data["action"],
    )
    if step1:
        return "Flair Tags Updated Successfully", 200
    return "Flair Tags Update Failed", 403


@app.route("/api/v1/circle/user_moderation/get_all_roles/<CircleName>", methods=["GET"])
def get_all_circle_roles(CircleName):
    # This route is for getting all the roles in a circle.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "get_all_circle_roles"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    user_role = common_mains.circle_role_getter(User_Details, CircleName)
    step1 = dbops.get.get_all_circle_roles(CircleName)
    if step1:
        final_dat = {
            "user_role": user_role,
            "Roles": step1["Roles"],
            "Roles_List": step1["Roles_List"],
            "Default_Role": step1["Default_Role"],
            "Default_Role_For_Verified_Users": step1["Default_Role_For_Verified_Users"],
        }
        return final_dat, 200
    return "An Unknown Error Occured", 403


@app.route(
    "/api/v1/circle/user_moderation/create_new_role/<CircleName>", methods=["POST"]
)
def create_new_circle_role(CircleName):
    # This route is for creating new roles in a circle.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "create_new_circle_role"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    user_role = common_mains.circle_role_getter(User_Details, CircleName)
    if user_role not in ["Admin", "Galam_Founder"]:
        return "User Not Allowed", 403
    json_data = flask.request.get_json()
    role_name = json_data["role_name"]
    role_description = json_data["role_description"]
    data_verifications.structured_verifiers.string_verification(role_name, 2, 20)
    data_verifications.structured_verifiers.string_verification(
        role_description, 2, 100
    )
    step1 = dbops.inserts.create_new_role_in_a_circle(
        CircleName, role_name, role_description
    )
    if step1:
        return "Role Created Successfully", 200
    return "Role Creation Failed", 403


@app.route(
    "/api/v1/circle/user_moderation/update_circle_role_powers/<CircleName>",
    methods=["POST"],
)
def update_circle_role_powers(CircleName):
    # This route is for updating the powers of a circle role.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "update_circle_role_powers"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    User_Role = common_mains.circle_role_getter(User_Details, CircleName)
    json_data = flask.request.get_json()
    data_verifications.structured_verifiers.string_verification(
        json_data["Role_Name"], 2, 20
    )
    if json_data["action"] not in ["add", "remove"]:
        print("Invalid Action")
        return "Invalid Action", 412
    print("Checkpoint1")
    data_verifications.structured_verifiers.string_verification(
        json_data["power_description"], 2, 300
    )
    if list(set(json_data.keys())) != list(
        set(["Role_Name", "action", "power_description"])
    ):
        return "Invalid Request", 412
    powers_dict = (
        dbops.get.get_translation_of_power_to_description_for_circle_from_configs()
    )
    powers_list = common_mains.find_the_powers_list_from_power_description(
        powers_dict, json_data["power_description"]
    )
    if not powers_list:
        print("Invalid Power Description")
        return "Invalid Power Description", 412
    ###### The below code is newly added and is not tested in production#############
    # Make sure the user has the powers to provide in the first place.
    # Make sure the role is to the right. Ignoring admin.
    current_user_role = common_mains.circle_role_getter(User_Details, CircleName)
    update_user_role = json_data["Role_Name"]
    get_all_circle_roles = dbops.get.get_all_circle_roles(CircleName)["Roles_List"]
    verificaiton_step1 = (
        common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
            current_user_role, update_user_role, get_all_circle_roles
        )
    )
    if not verificaiton_step1 and current_user_role != "Admin":
        return "You are not allowed to do this", 403
    # Now check if the user has the array of powers_list in his circle powers.
    current_user_circle_powers = common_mains.get_all_powers_of_user(
        User_Details, CircleName
    )
    if current_user_role != "Admin":
        for i in powers_list:
            if i not in current_user_circle_powers:
                return (
                    "You are not allowed to do this as you do not have the powers yourself",
                    403,
                )
    ###### The below code is newly added and is not tested in production#############

    step1 = dbops.updates.update_circle_role_powers(
        User_Role, CircleName, powers_list, json_data["Role_Name"], json_data["action"]
    )
    if step1:
        return "Role Powers Updated Successfully", 200
    return "Role Powers Update Failed", 403


@app.route(
    "/api/v1/circle/user_moderation/update_role_order/<CircleName>", methods=["POST"]
)
def update_role_order(CircleName):
    # This route is for updating the role order of a circle roles.
    # This will prevent the below roles from having powers over the above roles.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "update_role_order"
    )
    if circle_power_verification[1] >= 400:
        print("User Not Logged In")
        return circle_power_verification[0], circle_power_verification[1]
    UserRole = common_mains.circle_role_getter(User_Details, CircleName)
    json_data = flask.request.get_json()
    circle_object = dbops.get.get_pure_circle_details_without_images(CircleName)
    if not circle_object:
        return "Circle Does Not Exist", 404
    for i in json_data["Rearranged_Roles"]:
        if i not in circle_object["Roles_List"]:
            return "Invalid Role Name", 412
    if len(json_data["Rearranged_Roles"]) != len(circle_object["Roles_List"]):
        return "Invalid Role List", 412
    if not common_mains.verify_rearranged_list(
        circle_object["Roles_List"], json_data["Rearranged_Roles"], UserRole
    ):
        return "Invalid Rearranged List", 412
    if list(set(json_data.keys())) != list(set(["Rearranged_Roles"])):
        return "Invalid Request", 412
    step1 = dbops.updates.update_role_order(
        UserRole, json_data["Rearranged_Roles"], CircleName
    )
    if step1:
        return "Role Order Updated Successfully", 200
    print("Role Order Update Failed")
    return "Role Order Update Failed", 403


@app.route(
    "/api/v1/circle/user_moderation/delete_circle_role/<CircleName>", methods=["POST"]
)
def delete_circle_role(CircleName):
    # This route is for deleting a circle role.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        # print("User Not Logged In")
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "delete_circle_role"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    UserRole = common_mains.circle_role_getter(User_Details, CircleName)
    json_data = flask.request.get_json()
    ################## Verifications Under Progress ##############################
    if list(set(json_data.keys())) != list(set(["Role_Name"])):
        return "Invalid Request", 412
    pure_circle_details = dbops.get.get_pure_circle_details_without_images(CircleName)
    if json_data["Role_Name"] not in pure_circle_details["Roles_List"]:
        return "Invalid Role Name", 412
    if json_data["Role_Name"] == pure_circle_details["Default_Role"]:
        return "Cannot Delete Default Role", 403
    if json_data["Role_Name"] == pure_circle_details["Default_Role_For_Verified_Users"]:
        return "Cannot Delete Default Role For Verified Users", 403
    if not common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
        UserRole, json_data["Role_Name"], pure_circle_details["Roles_List"]
    ):
        return "You are not allowed to do this", 403
    is_item_after_var = (
        json_data["Role_Name"] in pure_circle_details["Roles_List"]
        and pure_circle_details["Roles_List"].index(json_data["Role_Name"])
        < len(pure_circle_details["Roles_List"]) - 1
    )
    if not is_item_after_var:
        return "Cannot Delete Last Role", 403
    ################## VerifiWcations Under Progress ##############################
    step1 = dbops.deleters.delete_circle_role(
        json_data["Role_Name"], pure_circle_details
    )
    if step1:
        return "Role Deleted Successfully", 200
    return "Role Deletion Failed", 403


@app.route(
    "/api/v1/circle/user_moderation/update_role_description/<CircleName>",
    methods=["POST"],
)
def update_role_description(CircleName):
    # This route is for updating the description of a circle role.
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "update_role_description"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    pass


######################### End of Under progress####################################################################################


@app.route(
    "/api/v1/circle/create_information_and_announcement_board/<CircleName>",
    methods=["POST"],
)
# Under Progress ESPECIALLY AT VERIFICATIONS Under progress
def create_information_board(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "create_information_board"
    )
    if circle_power_verification[1] >= 400:
        print("User Not Logged In")
        return circle_power_verification[0], circle_power_verification[1]

    json_data = flask.request.get_json()
    # print(json_data)
    information_board_title = flask.request.args.get("information_board_title")
    information_board_title = data_verifications.sanitize_html(information_board_title)
    if not data_verifications.stringVerification(information_board_title):
        return "Invalid Title", 403
    dbops.get.verify_if_title_exists_in_a_circle(
        circle_name=CircleName, title=information_board_title
    )
    information_board = json_data["information_board"]
    if json_data.keys() != set(["information_board"]):
        return "Invalid Keys", 403
    assert type(information_board) == list
    card_array = []
    g1 = {}
    preserve_list = []

    for i in information_board:
        # if i.keys()!=set(["card_type","card_image","card_title","card_description","card_link","card_voting","card_color","card_rating"]):
        #     return 'Invalid Keys',403
        if "sid" in list(i.keys()):
            data_verifications.post_id_verification(i["sid"])
            verification1 = dbops.get.verify_if_post_exists(
                i["sid"], CircleName, i["card_type"]
            )
            if verification1:
                card_array.append(i["sid"])
                preserve_list.append(i["sid"])
                g1 = {}
                continue
        if i["card_type"] == "profile_card":
            g1["card_description"] = i["card_description"]
            g1["card_image"] = i["card_image"]
            g1["card_link"] = i["card_link"]
            g1["card_title"] = i["card_title"]
            g1["card_type"] = i["card_type"]
            g1["support_reject_buttons"] = i["support_reject_buttons"]
            g1["voterID_verification"] = i["voterID"]
            g1["card_color"] = i["card_color"]
            # g1["card_rating"] = i["card_rating"]
            g1["card_description"] = data_verifications.sanitize_html(
                g1["card_description"]
            )
            g1["card_title"] = data_verifications.sanitize_html(g1["card_title"])
            data_verifications.check_if_only_on_or_off(g1["support_reject_buttons"])
            data_verifications.check_if_only_on_or_off(g1["voterID_verification"])
            data_verifications.structured_verifiers.string_verification(
                g1["card_title"], 2, 80
            )
            data_verifications.structured_verifiers.string_verification(
                g1["card_description"], 2, 400
            )
            data_verifications.structured_verifiers.string_verification(
                g1["card_color"], 2, 20
            )
        elif i["card_type"] == "title_card":
            g1["card_title"] = i["card_title"]
            g1["card_type"] = i["card_type"]
            g1["card_color"] = i["card_color"]
            g1["card_title"] = data_verifications.sanitize_html(g1["card_title"])
            data_verifications.structured_verifiers.string_verification(
                g1["card_title"], 2, 80
            )
            data_verifications.structured_verifiers.string_verification(
                g1["card_color"], 2, 20
            )
        else:
            return "Invalid Card Type", 403
        # 1) if profile card, put the image in another collection.
        if g1["card_type"] == "profile_card":
            if len(g1["card_image"]) > 10:
                data_verifications.base64_image_verification(g1["card_image"])
                g1["card_image"] = data_verifications.compress_base64_image(
                    g1["card_image"], 300, 300, 100
                )
                # Step1 returns the inserted ID.
                step1 = dbops.inserts.insert_base64_image(g1["card_image"], CircleName)
                step2 = flask.url_for(
                    "get_pictures_from_mongodb", picture_id=step1, circlename=CircleName
                )
                g1["card_image_id"] = step1
                g1["card_image"] = step2
        # 2) if title card, put it directly in the information board.
        g1 = data_verifications.stringVerification_for_cards(g1)
        step3 = dbops.inserts.create_indvidual_cards(
            g1, g1["card_type"], User_Details, CircleName
        )
        card_array.append(step3)
        g1 = {}

    step1 = dbops.inserts.create_information_board_cards_special_precaution_against_deletion(
        information_board_title, card_array, CircleName, preserve_list
    )
    print("apple_Pies")
    print(step1)
    if step1:
        return "Information Board Created", 200
    return "Information Board Could Not Be Created", 403


@app.route(
    "/api/v1/circle/update_circle_information_board/<CircleName>", methods=["POST"]
)
def update_circle_information_board(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "update_circle_information_board"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    assert json_data.keys() == set(["old_title", "old_subtitle", "title", "subtitle"])
    data_verifications.stringVerification(json_data["title"])
    data_verifications.stringVerification(json_data["subtitle"])
    data_verifications.stringVerification(json_data["old_title"])
    data_verifications.stringVerification(json_data["old_subtitle"])
    if dbops.updates.update_title_and_subtitle(
        json_data["old_title"],
        json_data["old_subtitle"],
        json_data["title"],
        json_data["subtitle"],
        CircleName,
        User_Details,
    ):
        return "Information Board Title and Subtitle updated", 200
    return "Information Board Title and Subtitle Could Not be Updated", 403


@app.route(
    "/api/v1/circle/get_information_board_title_and_subtitle/<CircleName>",
    methods=["GET", "POST"],
)
def get_information_board_title_and_subtitle(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "get_information_board_title_and_subtitle"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    if flask.request.method == "GET":
        r1 = dbops.get.get_information_board_title_and_subtitle(CircleName)
        if r1:
            return {"Information_Board_title_and_subtitle": r1}, 200
        print("Circle Details Could Not be Found")
        return "Circle Details Could Not be Found", 403
    elif flask.request.method == "POST":
        json_data = flask.request.get_json()
        assert json_data.keys() == set(["title", "subtitle"])
        data_verifications.stringVerification(json_data["title"])
        data_verifications.stringVerification(json_data["subtitle"])
        if dbops.deleters.popout_title_and_subtitle(
            json_data["title"], json_data["subtitle"], CircleName, User_Details
        ):
            return "Information Board Title and Subtitle Deleted", 200
        return "Information Board Title and Subtitle Could Not be Deleted", 403


@app.route("/api/v1/circle/create_title_and_subtitle/<CircleName>", methods=["POST"])
def create_title_and_subtitle(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "create_title_and_subtitle"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    if json_data.keys() != set(["title", "subtitle"]):
        return "Invalid Keys", 403
    data_verifications.stringVerification(json_data["title"])
    data_verifications.stringVerification(json_data["subtitle"])
    # Remove trailing space.
    json_data["title"] = json_data["title"].strip()
    json_data["subtitle"] = json_data["subtitle"].strip()
    if dbops.inserts.create_title_and_subtitle(
        json_data["title"], json_data["subtitle"], CircleName, User_Details
    ):
        return "Title and Subtitle Created", 200
    return "Title and Subtitle Could Not be Created", 403


@app.route("/api/v1/circle/get_flair_tags_for_editor/<CircleName>", methods=["GET"])
def get_flair_tags_for_editor(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "get_flair_tags_for_editor"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    circle_role = common_mains.circle_role_getter(User_Details, CircleName)
    circle_powers = common_mains.get_all_powers_of_user(User_Details, CircleName)
    editor_powers = []
    if "create_survey" in circle_powers:
        editor_powers.append("create_survey")
    r1 = dbops.get.get_role_specific_flair_for_circle(CircleName, circle_role)
    if circle_role == "Admin":
        r1 = dbops.get.get_flairs_for_circle2(CircleName)
    if r1:
        return {"Flair_Tags": r1, "Editor_Powers": editor_powers}, 200
    return "Flair Tags Could Not be Found", 403


@app.route("/api/v1/circle/get_all_flair_tags_for_editor/<CircleName>", methods=["GET"])
def get_all_flair_tags_for_editor(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "get_flair_tags_for_editor"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    circle_role = common_mains.circle_role_getter(User_Details, CircleName)
    r1 = dbops.get.get_flairs_for_circle2(CircleName)
    if r1:
        return {"Flair_Tags": r1}, 200
    return "Flair Tags Could Not be Found", 403


@app.route("/api/v1/circle/get_specific_circle_details/<CircleName>", methods=["GET"])
def get_specific_circle_details_of_user(CircleName):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, CircleName, "get_specific_circle_details_of_user"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    r1 = dbops.get.get_specific_circle_details_of_user(User_Details, CircleName)
    if r1:
        return {"Circle_Details": r1}, 200
    return "Circle Details", 200


@app.route("/api/v1/circle/update_circle_details/<circlename>", methods=["POST"])
def update_circle_details(circlename):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circlename, "update_circle_details"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    real_data = dict(flask.request.form)
    data_verifications.base64_image_verification(real_data["CircleImage"])
    real_data["CircleImage"] = data_verifications.compress_base64_image(
        real_data["CircleImage"], 240, 128, 80
    )
    data_verifications.stringVerification(real_data["Description"])
    data_verifications.stringVerification(real_data["Circle_Tags"])
    data_verifications.stringVerification(real_data["Related_Circles"])
    split_tags = data_verifications.split_string_by_commaseperator(
        real_data["Circle_Tags"]
    )
    split_tags = list(filter(None, split_tags))
    split_tags = list(dict.fromkeys(split_tags))
    for i in split_tags:
        data_verifications.stringVerification(i)
    split_circle = data_verifications.split_string_by_commaseperator(
        real_data["Related_Circles"]
    )
    split_circle = list(filter(None, split_circle))
    split_circle = list(dict.fromkeys(split_circle))
    for i in split_circle:
        dbops.get.verify_if_circle_exists(i)
        data_verifications.stringVerification(i)
    rl2 = {}
    rl2["Circle_Tags"] = split_tags
    rl2["Related_Circles"] = split_circle
    rl2["UpdaterEmail"] = User_Details["UserEmail"]
    rl2["DisplayName"] = circlename
    rl2["Description"] = real_data["Description"]
    rl2["CircleImage"] = real_data["CircleImage"]

    if dbops.updates.update_circle_details(rl2):
        return "Successfull", 200
    else:
        return "Failed to Update Circle Details", 400


@app.route("/api/v1/circle/join_circle", methods=["POST", "GET"])
def join_circle():
    try:
        User_Details = dbops.get.get_user_token_details(
            flask.session["Top_Secret_Token"]
        )
        if not User_Details:
            return "No such token Exists", 403
        if "join_circle" not in User_Details["Powers"]:
            return "User Not Allowed", 403
    except:
        return flask.redirect("/login2", code=302)
    if flask.request.method == "GET":
        CircleName = flask.request.args.get("CircleName")
    if flask.request.method == "POST":
        json_data = flask.request.get_json()
        CircleName = json_data["CircleName"]
    data_verifications.stringVerification(CircleName)
    circle_object = dbops.get.get_pure_circle_details_without_images(CircleName)
    if not circle_object:
        return "Circle Not Found", 404
    if circle_object["isClosed"] == "Yes":
        return "Circle is Closed", 403
    for i in User_Details["Circles"]:
        if i["DisplayName"] == CircleName:
            return "Circle Already Joined", 403
    default_role = circle_object["Default_Role"]
    verified_default_role = circle_object["Default_Role_For_Verified_Users"]
    if default_role not in circle_object["Roles_List"]:
        return "Invalid Role Name", 403
    if User_Details["Aadhar_Verification"] == "Yes":
        user_circle_object = {
            "DisplayName": CircleName,
            "Role": verified_default_role,
            "Powers": circle_object["Roles"][verified_default_role]["Role_Powers"],
        }
    else:
        user_circle_object = {
            "DisplayName": CircleName,
            "Role": default_role,
            "Powers": circle_object["Roles"][default_role]["Role_Powers"],
        }

    step1 = dbops.updates.update_user_to_add_to_a_circle(
        user_circle_object_to_add=user_circle_object,
        useremail=User_Details["UserEmail"],
    )
    if step1:
        v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
        dbops.updates.update_circle_details_customized(
            CircleName, {"$inc": {"All_Time_Member_Traffic": 1, "Current_Members": 1}}
        )
        if v1 and flask.request.method == "POST":
            return "Circle Joined", 200
        elif v1 and flask.request.method == "GET":
            return flask.redirect("/home", code=302)
    return "Circle Could Not be Joined", 403


@app.route("/api/v1/circle/leave_circle/<circlename>", methods=["POST"])
def leave_circle(circlename):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circlename, "leave_circle"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    if circlename == "MyCircle":
        return "Cannot Leave MyCircle", 403
    step1 = dbops.updates.update_user_to_remove_from_a_circle(
        circlename, User_Details["UserEmail"]
    )
    if step1:
        dbops.updates.update_circle_details_customized(
            circlename, {"$inc": {"Current_Members": -1, "All_Time_Members_Leaving": 1}}
        )
        re1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
        return "Quit circle successfully", 200
    return "Failed to quit circle", 403


@app.route("/api/v1/circle/set_default_role_for_joining/<circlename>", methods=["POST"])
def set_default_role_for_joining(circlename):
    """Only Public Circles can be joined"""
    print("Circle Power Verification")
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circlename, "set_default_role_for_joining"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    json_data = flask.request.get_json()
    if ["RoleName"] != list(json_data.keys()):
        return "Invalid Request", 403
    pure_circle_object = dbops.get.get_pure_circle_details_without_images(circlename)
    if not pure_circle_object:
        return "Circle Not Found", 404
    if json_data["RoleName"] not in pure_circle_object["Roles_List"]:
        return "Invalid Role Name", 403
    step1 = dbops.updates.update_default_role_for_joining(
        circlename, json_data["RoleName"]
    )
    if step1:
        return "Default Role Updated", 200
    return "Circle Joined", 200


@app.route("/api/v1/circle/move_verified_users_to_role/<circlename>", methods=["GET"])
def move_verified_users_to_role(circlename):
    # move_verified_users_to_role
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circlename, "move_verified_users_to_role"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    role_name = flask.request.args.get("role_name")
    if not role_name:
        return "Invalid Request", 403
    pure_circle_object = dbops.get.get_pure_circle_details_without_images(circlename)
    if role_name not in pure_circle_object["Roles_List"]:
        return "Invalid Role Name", 403
    current_user_role = common_mains.circle_role_getter(User_Details, circlename)
    if not common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
        current_user_role, role_name, pure_circle_object["Roles_List"]
    ):
        return "You are not allowed to do this", 403
    step1 = dbops.updates.move_verified_users_to_role(role_name, pure_circle_object)
    if step1:
        return "Successfull Operation", 200
    return "Failed Operation", 403


@app.route("/api/v1/circle/<circle>/create_post", methods=["POST"])
def create_post(circle):
    print("Circle Power Verification")
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "create_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    post_json_data = flask.request.get_json()
    final_post_data = nd()
    final_post_data["title"] = post_json_data["title"]
    final_post_data["html_content"] = post_json_data["html_content"]
    final_post_data["flair_tags"] = post_json_data["flair_tags"]
    final_post_data["pdf_tags"] = post_json_data["pdf_tags"]
    final_post_data["image_tags"] = post_json_data["image_tags"]
    final_post_data["type"] = "POST"
    final_post_data["circle"] = circle
    final_post_data["user"] = User_Details["UserEmail"]
    final_post_data["isClosed"] = "No"
    final_post_data["isVisible"] = "Yes"
    final_post_data["supports_comments"] = "Yes"
    final_post_data["supports_supports_rejects"] = "Yes"
    final_post_data["type2"] = ""
    final_post_data["Creator_Role"] = common_mains.circle_role_getter(
        User_Details, circle
    )
    final_post_data["Creator_Symbol"] = circle_object["Roles"][
        final_post_data["Creator_Role"]
    ]["Role_Symbol"]

    # ###########Verifying the data################ #
    final_post_data["title"] = data_verifications.sanitize_html(
        final_post_data["title"]
    )
    final_post_data["html_content"] = data_verifications.sanitize_html(
        final_post_data["html_content"]
    )
    assert len(final_post_data["title"]) <= 600
    data_verifications.stringVerification(final_post_data["title"])
    data_verifications.stringVerification(final_post_data["html_content"])
    assert len(final_post_data["html_content"]) <= 10000

    if (
        len(final_post_data["flair_tags"]) == 1
        and final_post_data["flair_tags"][0] == "No Flair"
    ):
        pass
    else:
        circle_role = common_mains.circle_role_getter(User_Details, circle)
        r1 = dbops.get.get_role_specific_flair_for_circle(circle, circle_role)
        if circle_role == "Admin":
            r1 = dbops.get.get_flairs_for_circle2(circle)
        for i in final_post_data["flair_tags"]:
            data_verifications.stringVerification(i)
            if i not in r1:
                return "Flair Tag Not Found", 400
            # assert len(i)<=100
        assert len(final_post_data["flair_tags"]) <= 3
    for i in final_post_data["pdf_tags"]:
        data_verifications.stringVerification(i["title"])
        data_verifications.base64_pdf_verification(i["base64"])
        assert i.keys() == set(["title", "base64"])
        assert len(i["title"]) <= 50
    for i in final_post_data["image_tags"]:
        data_verifications.stringVerification(i["title"])
        data_verifications.base64_image_verification(i["base64"])
        i["base64"] = data_verifications.compress_base64_image_for_posts(
            i["base64"], 10000
        )
        assert i.keys() == set(["title", "base64"])
        if not len(i["title"]) <= 40:
            # Splice it to 40 characters.
            i["title"] = i["title"][:40]
    # Make sure the size of the final_post_data is less than 10MB.
    if getsizeof(final_post_data) > 10000000:
        return "Post Size Exceeded", 400
    final_post_data2 = deepcopy(dict(final_post_data))
    final_post_data2["NumberOfPDFs"] = len(final_post_data["pdf_tags"])
    final_post_data2["NumberOfImages"] = len(final_post_data["image_tags"])
    if final_post_data2["NumberOfPDFs"] > 2:
        return "PDFs Exceeded", 400
    if final_post_data2["NumberOfImages"] > 4:
        return "Images Exceeded", 400
    del final_post_data2["image_tags"]
    del final_post_data2["pdf_tags"]
    # ###########Verifying the data################ #
    step1 = dbops.inserts.create_post_in_a_circle(dict(final_post_data2), User_Details)
    step2 = True
    step3 = True
    for i in final_post_data["pdf_tags"]:
        step2 = False
        i["circle"] = circle
        i["base64_type"] = "PDF"
        step2 = dbops.inserts.create_pdf_tags_in_a_post(step1, i, User_Details)
    for i in final_post_data["image_tags"]:
        step3 = False
        i["circle"] = circle
        i["base64_type"] = "IMAGE"
        step3 = dbops.inserts.create_image_tags_in_a_post(step1, i, User_Details)
    step4 = dbops.inserts.create_follower(User_Details, step1, circle, "post_followers")
    if step1 and step2 and step3 and step4:
        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOfPosts": 1}},
        )
        return {"message": "Post Created Successfully", "post_id": step1}, 200
    return "Post Failed to Create", 400


@app.route("/api/v1/circle/<circle>/create_comment", methods=["POST"])
def create_comment(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "create_comment"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    post_json_data = flask.request.get_json()
    final_comment_data = nd()
    # print(len(   final_comment_data["html_content"]))
    final_comment_data["html_content"] = post_json_data["html_content"]
    final_comment_data["type"] = "COMMENT"
    final_comment_data["circle"] = circle
    final_comment_data["supports_comments"] = "Yes"
    final_comment_data["supports_supports_rejects"] = "Yes"
    final_comment_data["user"] = User_Details["UserEmail"]
    # print(post_json_data)
    final_comment_data["parent_post_id"] = post_json_data["PostId"]
    final_comment_data["isVisible"] = "Yes"
    final_comment_data["isClosed"] = "No"
    final_comment_data["type2"] = ""
    # ###########Verifying the data################ #
    final_comment_data["html_content"] = data_verifications.sanitize_html(
        final_comment_data["html_content"]
    )
    final_comment_data["Creator_Role"] = common_mains.circle_role_getter(
        User_Details, circle
    )
    final_comment_data["Creator_Symbol"] = circle_object["Roles"][
        final_comment_data["Creator_Role"]
    ]["Role_Symbol"]
    data_verifications.stringVerification(final_comment_data["html_content"])
    assert 1 < len(final_comment_data["html_content"]) <= 10000
    data_verifications.post_id_verification(final_comment_data["parent_post_id"])
    data_verifications.stringVerification(final_comment_data["circle"])
    # Make sure the size of the final_post_data is less than 10MB.
    if getsizeof(final_comment_data) > 1000000:
        return "Comment Size Exceeded", 400
    # ###########Verifying the data################ #
    step1 = dbops.inserts.create_comment_in_a_circle_post(
        dict(final_comment_data),
        User_Details,
        circle,
        final_comment_data["parent_post_id"],
    )
    step2 = dbops.inserts.create_follower(
        User_Details, step1, circle, "comment_followers"
    )
    if step1 and step2:
        # ########## Notifying the followers of the post ########## #
        # post_owner_email=dbops.get.get_post_owner_email_from_id(circle,final_comment_data["parent_post_id"])
        post_owner_email_list = dbops.get.get_followers_of_a_post(
            final_comment_data["parent_post_id"], "post_followers", circle
        )
        if post_owner_email_list:
            for post_owner_email in post_owner_email_list:
                if post_owner_email == User_Details["UserEmail"]:
                    continue
                verinot1 = dbops.inserts.create_notification_for_end_user(
                    end_user_email=post_owner_email,
                    circle_name=circle,
                    notification_type="New_Comment",
                    notification_url=flask.url_for(
                        "generic_post_webpage",
                        post_id=final_comment_data["parent_post_id"],
                        _external=True,
                    )
                    + "?circle_name="
                    + circle,
                    notifier_DisplayName=User_Details["DisplayName"],
                    post_id=step1,
                )
        # ########## Notifying the followers of the post ########## #
        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOfComments": 1}},
        )
        return {"message": "Comment Created Successfully", "comment_id": step1}, 200
    return "Comment Failed to Create", 400


@app.route("/api/v1/circle/<circle>/create_comment_privilaged", methods=["POST"])
def create_comment_privilaged(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "create_comment_privilaged"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    post_json_data = flask.request.get_json()
    print(post_json_data.keys())
    final_comment_data = nd()
    # print(len(   final_comment_data["html_content"]))
    final_comment_data["html_content"] = post_json_data["html_content"]
    final_comment_data["type"] = "COMMENT"
    final_comment_data["circle"] = circle
    final_comment_data["user"] = User_Details["UserEmail"]
    final_comment_data["pdf_tags"] = post_json_data["pdf_tags"]
    final_comment_data["image_tags"] = post_json_data["image_tags"]
    # print(post_json_data)
    final_comment_data["parent_post_id"] = post_json_data["PostId"]
    final_comment_data["isVisible"] = "Yes"
    final_comment_data["isClosed"] = "No"
    final_comment_data["supports_comments"] = "Yes"
    final_comment_data["supports_supports_rejects"] = "Yes"
    final_comment_data["type2"] = "PRIVILAGED"
    # ###########Verifying the data################ #
    final_comment_data["html_content"] = data_verifications.sanitize_html(
        final_comment_data["html_content"]
    )
    final_comment_data["Creator_Role"] = common_mains.circle_role_getter(
        User_Details, circle
    )
    final_comment_data["Creator_Symbol"] = circle_object["Roles"][
        final_comment_data["Creator_Role"]
    ]["Role_Symbol"]
    data_verifications.stringVerification(final_comment_data["html_content"])
    assert 1 < len(final_comment_data["html_content"]) <= 10000
    data_verifications.post_id_verification(final_comment_data["parent_post_id"])
    data_verifications.stringVerification(final_comment_data["circle"])
    # Make sure the size of the final_post_data is less than 10MB.
    for i in final_comment_data["pdf_tags"]:
        data_verifications.stringVerification(i["title"])
        data_verifications.base64_pdf_verification(i["base64"])
        assert i.keys() == set(["title", "base64"])
        assert len(i["title"]) <= 50
    for i in final_comment_data["image_tags"]:
        data_verifications.stringVerification(i["title"])
        data_verifications.base64_image_verification(i["base64"])
        i["base64"] = data_verifications.compress_base64_image_for_posts(
            i["base64"], 10000
        )
        assert i.keys() == set(["title", "base64"])
        if not len(i["title"]) <= 40:
            # Splice it to 40 characters.
            i["title"] = i["title"][:40]
    if getsizeof(final_comment_data) > 1000000:
        return "Comment Size Exceeded", 400
    # ###########Verifying the data################ #
    final_comment_data["NumberOfPDFs"] = len(final_comment_data["pdf_tags"])
    final_comment_data["NumberOfImages"] = len(final_comment_data["image_tags"])
    if final_comment_data["NumberOfPDFs"] > 2:
        return "PDFs limit Exceeded", 400
    if final_comment_data["NumberOfImages"] > 4:
        return "Images limit Exceeded", 400

    img_tags_list = final_comment_data["image_tags"]
    pdf_tags_list = final_comment_data["pdf_tags"]
    del final_comment_data["image_tags"]
    del final_comment_data["pdf_tags"]
    step1 = dbops.inserts.create_comment_in_a_circle_post(
        dict(final_comment_data),
        User_Details,
        circle,
        final_comment_data["parent_post_id"],
    )
    step2 = True
    step3 = True
    for i in pdf_tags_list:
        step2 = False
        i["circle"] = circle
        i["base64_type"] = "PDF"
        step2 = dbops.inserts.create_pdf_tags_in_a_post(step1, i, User_Details)
    for i in img_tags_list:
        step3 = False
        i["circle"] = circle
        i["base64_type"] = "IMAGE"
        step3 = dbops.inserts.create_image_tags_in_a_post(step1, i, User_Details)

    step4 = dbops.inserts.create_follower(
        User_Details, step1, circle, "comment_followers"
    )
    if step1 and step2 and step3 and step4:
        # ########## Notifying the followers of the post ########## #
        # post_owner_email=dbops.get.get_post_owner_email_from_id(circle,final_comment_data["parent_post_id"])
        post_owner_email_list = dbops.get.get_followers_of_a_post(
            final_comment_data["parent_post_id"], "post_followers", circle
        )
        if post_owner_email_list:
            for post_owner_email in post_owner_email_list:
                if post_owner_email == User_Details["UserEmail"]:
                    continue
                verinot1 = dbops.inserts.create_notification_for_end_user(
                    end_user_email=post_owner_email,
                    circle_name=circle,
                    notification_type="New_Comment",
                    notification_url=flask.url_for(
                        "generic_post_webpage",
                        post_id=final_comment_data["parent_post_id"],
                        _external=True,
                    )
                    + "?circle_name="
                    + circle,
                    notifier_DisplayName=User_Details["DisplayName"],
                    post_id=step1,
                )
        # ########## Notifying the followers of the post ########## #

        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOfComments": 1}},
        )
        return {"message": "Comment Created Successfully", "comment_id": step1}, 200
    return "Comment Failed to Create", 400


# Set the rate limit to 100 requests per minute
@app.route("/api/v1/circle/<circle>/reply_comment", methods=["POST"])
def create_comment_reply(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "create_comment_reply"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]

    post_json_data = flask.request.get_json()
    final_comment_data = nd()
    final_comment_data["type"] = "COMMENT_REPLY"
    final_comment_data["html_content"] = post_json_data["html_content"]
    final_comment_data["circle"] = circle
    final_comment_data["user"] = User_Details["UserEmail"]
    final_comment_data["parent_post_id"] = post_json_data["parent_post_id"]
    final_comment_data["parent_comment_id"] = post_json_data["parent_comment_id"]
    final_comment_data["isVisible"] = "Yes"
    final_comment_data["isClosed"] = "No"
    final_comment_data["supports_comments"] = "Yes"
    final_comment_data["supports_supports_rejects"] = "Yes"
    final_comment_data["type2"] = ""
    final_comment_data["Creator_Role"] = common_mains.circle_role_getter(
        User_Details, circle
    )
    circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    final_comment_data["Creator_Symbol"] = circle_object["Roles"][
        final_comment_data["Creator_Role"]
    ]["Role_Symbol"]
    # ###########Verifying the data################ #
    final_comment_data["html_content"] = data_verifications.sanitize_html(
        final_comment_data["html_content"]
    )

    data_verifications.stringVerification(final_comment_data["html_content"])
    assert 1 < len(final_comment_data["html_content"]) <= 10000
    data_verifications.post_id_verification(final_comment_data["parent_post_id"])
    data_verifications.post_id_verification(final_comment_data["parent_comment_id"])
    data_verifications.stringVerification(final_comment_data["circle"])
    # Make sure the size of the final_post_data is less than 10MB.
    verifier1 = dbops.get.get_private_uncensored_single_post_in_a_circle(
        circle,
        final_comment_data["parent_comment_id"],
        {"$in": ["COMMENT", "REPLY_COMMENT"]},
    )
    print("We are printing verifier1")
    print(verifier1)
    if verifier1["isClosed"] == "Yes":
        return (
            "Comment is Closed, No more edits are permitted by anyone relating to this post.",
            400,
        )

    if getsizeof(final_comment_data) > 1000000:
        return "Comment Size Exceeded", 400
    # ###########Verifying the data################ #
    step1 = dbops.inserts.create_reply_comment_in_a_circle_post(
        dict(final_comment_data),
        User_Details,
        circle,
        final_comment_data["parent_post_id"],
        final_comment_data["parent_comment_id"],
    )
    step2 = dbops.inserts.create_follower(
        User_Details, step1, circle, "comment_followers"
    )
    if step1 and step2:
        # ########## Notifying the followers of the post ########## #
        post_owner_email = dbops.get.get_post_owner_email_from_id(
            circle, final_comment_data["parent_comment_id"]
        )
        if post_owner_email:
            if post_owner_email == User_Details["UserEmail"]:
                return {
                    "message": "Comment Created Successfully",
                    "comment_id": step1,
                }, 200
            verinot1 = dbops.inserts.create_notification_for_end_user(
                post_owner_email,
                circle,
                "New_Reply_Comment",
                flask.url_for(
                    "generic_post_webpage",
                    post_id=final_comment_data["parent_post_id"],
                    _external=True,
                )
                + "?circle_name="
                + circle,
                User_Details["DisplayName"],
                final_comment_data["parent_comment_id"],
            )
        # ########## Notifying the followers of the post ########## #
        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOfComments": 1}},
        )
        return {"message": "Comment Created Successfully", "comment_id": step1}, 200
    return "Comment Failed to Create", 400


@app.route("/api/v1/circle/<circle>/update_comment", methods=["POST"])
def update_comment_post_reply(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "update_comment_post_reply"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    final_comment_data = nd()
    # print(len(   final_comment_data["html_content"]))
    final_comment_data["post_id"] = post_json_data["PostId"]
    final_comment_data["html_content"] = post_json_data["html_content"]
    final_comment_data["type"] = post_json_data["type"]
    final_comment_data["circle"] = circle
    final_comment_data["user"] = User_Details["UserEmail"]
    final_comment_data["comment_id"] = post_json_data["comment_id"]
    print(final_comment_data)
    # ###########Verifying the data################ #
    final_comment_data["html_content"] = data_verifications.sanitize_html(
        final_comment_data["html_content"]
    )
    data_verifications.stringVerification(final_comment_data["html_content"])
    data_verifications.stringVerification(final_comment_data["type"])
    assert 1 < len(final_comment_data["html_content"]) <= 10000
    data_verifications.post_id_verification(final_comment_data["comment_id"])
    data_verifications.stringVerification(final_comment_data["circle"])
    # Make sure the size of the final_post_data is less than 10MB.
    if getsizeof(final_comment_data) > 1000000:
        return "Comment Size Exceeded", 400
    # ###########Verifying the data################ #
    if (
        final_comment_data["type"] == "REPLY_COMMENT"
        or final_comment_data["type"] == "COMMENT"
    ):
        verifier1 = dbops.get.get_private_uncensored_single_post_in_a_circle(
            circle, final_comment_data["comment_id"], final_comment_data["type"]
        )
        if verifier1["isClosed"] == "Yes":
            return (
                "Comment is Closed, No more edits are permitted by anyone relating to this post.",
                400,
            )
        verifier2 = dbops.get.get_private_uncensored_single_post_in_a_circle(
            circle, verifier1["parent_post_id"], "POST"
        )
        if verifier2["isClosed"] == "Yes":
            return (
                "Post is Closed, No more edits are permitted by anyone relating to this post.",
                400,
            )
    if final_comment_data["type"] == "POST":
        verifier1 = dbops.get.get_private_uncensored_single_post_in_a_circle(
            circle, final_comment_data["comment_id"], "POST"
        )
        if verifier1["isClosed"] == "Yes":
            return (
                "Post is Closed, No more edits are permitted by anyone relating to this post.",
                400,
            )
    # ###########Verifying the data################ #
    step1 = dbops.updates.update_post_in_a_circle_post(
        final_comment_data["post_id"],
        circle,
        final_comment_data["html_content"],
        User_Details,
        final_comment_data["type"],
    )
    if step1:
        return {"message": "Comment Updated Successfully", "comment_id": step1}, 200
    return "Comment Failed to Update", 400


@app.route("/api/v1/circle/<circle>/create_survey", methods=["POST"])
def create_survey(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "create_survey"
    )
    if circle_power_verification[1] >= 400:
        # print("Circle Power Verification")
        return circle_power_verification[0], circle_power_verification[1]
    circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["title", "options"]):
        return "Invalid Data", 400

    # Data Verification

    # Data Verification
    print(post_json_data)
    final_survey_data = nd()
    final_survey_data["title"] = post_json_data["title"]
    final_survey_data["options"] = post_json_data["options"]
    final_survey_data["type"] = "POST"
    final_survey_data["circle"] = circle
    final_survey_data["user"] = User_Details["UserEmail"]
    final_survey_data["isVisible"] = "Yes"
    final_survey_data["isClosed"] = "No"
    final_survey_data["flair_tags"] = ["Survey"]
    # So if anyone tries to add comments, it will get 400 error.
    final_survey_data["supports_comments"] = "Yes"
    final_survey_data["supports_supports_rejects"] = "Yes"
    # So if anyone tries to add comments, it will get 400 error.
    final_survey_data["Creator_Role"] = common_mains.circle_role_getter(
        User_Details, circle
    )
    final_survey_data["Creator_Symbol"] = circle_object["Roles"][
        final_survey_data["Creator_Role"]
    ]["Role_Symbol"]
    final_survey_data["type2"] = "SURVEY"
    if "Survey" not in circle_object["Flairs_List"]:
        dbops.updates.update_circle_details_customized(
            circle,
            {"$push": {"Flairs_List": "Survey"}},
        )
    # ###########Verifying the data################ #
    final_survey_data["title"] = data_verifications.sanitize_html(
        final_survey_data["title"]
    )
    data_verifications.stringVerification(final_survey_data["title"])
    data_verifications.stringVerification(final_survey_data["circle"])
    # Make sure the size of the final_post_data is less than 10MB.
    if getsizeof(final_survey_data) > 1000000:
        return "Survey Size Exceeded", 400
    data_verifications.structured_verifiers.string_verification(
        final_survey_data["title"], 10, 250
    )
    for i in post_json_data["options"]:
        data_verifications.structured_verifiers.string_verification(i, 1, 350)
    # ###########Verifying the data################ #
    step1 = dbops.inserts.create_post_in_a_circle(
        dict(final_survey_data),
        User_Details,
    )
    step4 = dbops.inserts.create_follower(User_Details, step1, circle, "post_followers")
    if step1:
        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOfSurveys": 1}},
        )
        return {"message": "Survey Created Successfully", "post_id": step1}, 200


@app.route("/api/v1/circle/<circle>/report_post", methods=["POST"])
def report_post(circle):
    print("Circle Power Verification")
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, circle, "report_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    print(post_json_data)
    if set(list(post_json_data.keys())) != set(
        ["PostId", "type", "reason", "parent_post_id"]
    ):
        return "Invalid Data", 400
    data_verifications.structured_verifiers.string_verification(
        post_json_data["reason"], 5, 250
    )
    data_verifications.post_id_verification(post_json_data["PostId"])
    if post_json_data["type"] not in ["POST", "COMMENT", "REPLY_COMMENT"]:
        return "Invalid Data", 400
    if post_json_data["type"] == "POST":
        hypothetical_post_id_url = (
            flask.url_for("generic_post_webpage", post_id=post_json_data["PostId"])
            + "?circle_name="
            + circle
        )
    elif post_json_data["type"] == "COMMENT":
        hypothetical_post_id_url = (
            flask.url_for(
                "generic_post_webpage",
                post_id=post_json_data["parent_post_id"],
                _external=True,
            )
            + "?circle_name="
            + circle
            + "&comment_id="
            + post_json_data["PostId"]
            + "&comment_type="
            + "COMMENT"
        )
    elif post_json_data["type"] == "REPLY_COMMENT":
        hypothetical_post_id_url = (
            flask.url_for(
                "generic_post_webpage",
                post_id=post_json_data["parent_post_id"],
                _external=True,
            )
            + "?circle_name="
            + circle
            + "&comment_id="
            + post_json_data["PostId"]
            + "&comment_type="
            + "COMMENT_REPLY"
        )
    step1 = dbops.inserts.create_report_for_post(
        UserDetails,
        circle,
        post_json_data["PostId"],
        post_json_data["reason"],
        post_json_data["type"],
        hypothetical_post_id_url,
    )
    if step1:
        return {"message": "Post Reported Successfully"}, 200
    return "Already reported or unknown", 400


@app.route("/api/v1/circle/<circle>/get_reported_posts", methods=["GET"])
def get_reported_posts(circle):
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, circle, "get_reported_posts"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    number_of_reports_to_skip = flask.request.args["skip"]
    if not number_of_reports_to_skip.isdigit():
        return "Invalid Data", 400
    step1 = dbops.get.get_reported_posts(circle, int(number_of_reports_to_skip))
    if step1:
        return {"Reported_Posts": step1}, 200
    return "No Reported Posts", 400


@app.route("/api/v1/circle/<circle>/find_reported_post", methods=["POST"])
def find_reported_post(circle):
    get_user_details = dbops.get.get_user_token_details(
        flask.session["Top_Secret_Token"]
    )
    if not get_user_details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        get_user_details, circle, "find_reported_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["html_content"]):
        print("Invalid Data")
        return "Invalid Data", 400
    data_verifications.structured_verifiers.string_verification(
        post_json_data["html_content"], 2, 250
    )
    step1 = dbops.get.get_reported_posts_by_content(
        post_json_data["html_content"], circle
    )
    if step1:
        return {"Reported_Posts": step1}, 200
    return "No Posts Found", 400


@app.route("/api/v1/circle/<circle>/get_more_reasons_for_report", methods=["GET"])
def get_more_reasons_for_report(circle):
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, circle, "get_more_reasons_for_report"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_id = flask.request.args["post_id"]
    number_of_skip = flask.request.args["skip"]
    if not number_of_skip.isdigit():
        return "Invalid Data", 400
    post_type = flask.request.args["post_type"]
    data_verifications.post_id_verification(post_id)
    if post_type not in ["POST", "COMMENT", "REPLY_COMMENT"]:
        return "Invalid Data", 400
    step1 = dbops.get.get_report_reasons(
        circle, post_id, post_type, int(number_of_skip)
    )
    if step1:
        return {"more_resons": step1}, 200
    return "No More Reports Found", 400


@app.route("/api/v1/circle/<circle>/close_post", methods=["POST"])
def close_post(circle):
    # This route will do two things. Make the post and it's children invisible. It may also check if the post needs to be closed and no more comments can be made on it.
    User_Detail = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Detail:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Detail, circle, "close_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["PostId", "type"]) or post_json_data[
        "type"
    ] not in ["POST", "COMMENT", "REPLY_COMMENT"]:
        return "Invalid Data", 400
    data_verifications.post_id_verification(post_json_data["PostId"])
    step1 = dbops.deleters.close_post(
        post_json_data["PostId"], circle, User_Detail, post_json_data["type"]
    )
    if step1:
        return {"message": "Post Closed Successfully"}, 200
    return "Post Failed to Delete", 400


@app.route(
    "/api/v1/circle/admin_powers/<circle>/close_or_delete_post", methods=["POST"]
)
def admin_lock_post(circle):
    # This route will do two things. Make the post and it's children invisible. It may also check if the post needs to be closed and no more comments can be made on it.
    User_Detail = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Detail:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Detail, circle, "admin_lock_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if (
        set(list(post_json_data.keys())) != set(["PostId", "type", "action"])
        or post_json_data["type"] not in ["POST", "COMMENT", "REPLY_COMMENT"]
        or post_json_data["action"] not in ["close", "delete"]
    ):
        return "Invalid Data", 400
    data_verifications.post_id_verification(post_json_data["PostId"])
    get_post_details = dbops.get.get_private_uncensored_single_post_in_a_circle(
        circle, post_json_data["PostId"], post_json_data["type"]
    )
    if post_json_data["action"] == "close" and get_post_details["isClosed"] == "Yes":
        return "Post Already Locked", 400
    if post_json_data["action"] == "delete" and get_post_details["isVisible"] == "No":
        return "Post Already Deleted", 400
    dummy_user_details = {"UserEmail": get_post_details["user"]}
    if post_json_data["action"] == "close":
        step1 = dbops.deleters.close_post(
            post_json_data["PostId"],
            circle,
            dummy_user_details,
            post_json_data["type"],
            User_Detail["UserEmail"],
        )
    if post_json_data["action"] == "delete":
        step1 = dbops.deleters.make_post_invisible_and_closed(
            post_json_data["PostId"],
            circle,
            dummy_user_details,
            post_json_data["type"],
            User_Detail["UserEmail"],
        )
    if step1:
        return {"message": "Post Closed or deleted Successfully"}, 200
    return "Post Failed to Delete", 400


@app.route("/api/v1/circle/<circle>/get_posts", methods=["GET"])
def get_posts(circle):
    # This API IS DEPRECATED. USE get_posts_multi_filter INSTEAD.
    noofposts_currently_existing = flask.request.args["posts"]
    filter = flask.request.args["filter"]
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "get_posts"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    step1 = dbops.get.get_posts_in_a_circle(
        circle, int(noofposts_currently_existing), filter, User_Details
    )
    if step1:
        return {"Posts": step1}, 200
    return "No Posts Found", 400


@app.route("/api/v1/circle/<circle>/get_posts_multi_filter", methods=["POST"])
def get_posts_multi_filter(circle):
    post_json_data = flask.request.get_json()
    print(post_json_data)
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "get_posts_multi_filter"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    ################## Data VERIFICATION#######################
    if list(post_json_data.keys()) != [
        "noofposts",
        "filters",
        "current_active_feed_filter",
    ]:
        return "Invalid Data", 400
    data_verifications.stringVerification(circle)
    data_verifications.stringVerification(post_json_data["noofposts"])
    for i in post_json_data["filters"]:
        data_verifications.stringVerification(i)
    if post_json_data["current_active_feed_filter"] not in ["New", "Hot", "Rising"]:
        return "Invalid Data", 400
    ################## Data VERIFICATION#######################
    noofposts = post_json_data["noofposts"]
    filter_array = post_json_data["filters"]
    print("Black magic is undersway")
    step1 = dbops.get.get_posts_in_a_circle_multi_filter(
        circle,
        int(noofposts),
        filter_array,
        User_Details,
        post_json_data["current_active_feed_filter"],
        flask.url_for,
    )
    if step1:
        return {"Posts": step1}, 200
    return "No Posts Found", 400


@app.route("/api/v1/circle/<circle>/get_specific_comment", methods=["POST"])
def get_specific_comment(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "get_specific_comment"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["comment_id", "parent_post_id"]):
        return "Invalid Data", 400
    data_verifications.post_id_verification(post_json_data["comment_id"])
    data_verifications.post_id_verification(post_json_data["parent_post_id"])
    step1 = dbops.get.get_comments_in_a_circle_post(
        circle,
        post_json_data["parent_post_id"],
        User_Details,
        0,
        post_json_data["comment_id"],
        flask.url_for,
    )
    if step1:
        return {"Comment": step1}, 200
    return "No Comment Found", 400


@app.route("/api/v1/circle/<circle>/get_root_comment", methods=["POST"])
def get_root_comment(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "get_root_comment"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["comment_id", "parent_post_id"]):
        return "Invalid Data", 400
    print(post_json_data)
    data_verifications.post_id_verification(post_json_data["comment_id"])
    data_verifications.post_id_verification(post_json_data["parent_post_id"])
    step1 = dbops.get.get_root_comment(
        circle,
        post_json_data["comment_id"],
        post_json_data["parent_post_id"],
        User_Details,
    )
    if step1:
        return {"Comment_ID": step1}, 200
    return "No Comment Found", 400


@app.route("/api/v1/user/create_my_description", methods=["POST"])
def create_my_description():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "create_my_description" not in User_Details["Powers"]:
        return "User Not Authorized", 403
    post_json_data = flask.request.get_json()
    print(post_json_data)
    if set(list(post_json_data.keys())) != set(["html_content", "username"]):
        return "Invalid Data", 400
    if len(post_json_data["html_content"]) > 500:
        return "Invalid Data", 400
    if 4 > len(post_json_data["username"]) > 12:
        return "Invalid Data", 400
    post_json_data["html_content"] = data_verifications.sanitize_html(
        post_json_data["html_content"]
    )
    post_json_data["username"] = data_verifications.sanitize_html(
        post_json_data["username"]
    )
    data_verifications.stringVerification(post_json_data["html_content"])
    step1 = dbops.inserts.create_my_description(
        User_Details, post_json_data["html_content"]
    )
    if User_Details["Available_username"] == "Yes":
        step2 = dbops.inserts.create_new_username(
            User_Details, post_json_data["username"]
        )
    if step1:
        v1 = dbops.updates.reload_my_session_token(User_Details["UserEmail"])
        return {"message": "Description Created Successfully"}, 200
    return "Description Failed to Create", 400


@app.route("/api/v1/user/get_posts_single_filter", methods=["POST"])
def get_posts_multi_filter_personal_user():
    post_json_data = flask.request.get_json()
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    if "get_posts_multi_filter_personal_user" not in User_Details["Powers"]:
        return "User Not Authorized", 403
    print(post_json_data)
    if list(post_json_data.keys()) != ["noofposts", "filter"]:
        return "Invalid Data", 400
    noofposts = post_json_data["noofposts"]
    data_verifications.stringVerification(noofposts)
    if post_json_data["filter"] not in [
        "Following",
        "Supported",
        "Rejected",
        "Comments",
        "MyPosts",
        "Replies",
    ]:
        return "Invalid Filter", 400
    step1 = dbops.get.get_posts_in_a_circle_multi_filter_personal_user(
        int(noofposts), post_json_data["filter"], User_Details, flask.url_for
    )
    if step1:
        return {"Posts": step1}, 200
    return "No Posts Found", 400


@app.route("/api/v1/circle/<circle>/get_comments", methods=["GET"])
def get_comments(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "get_comments"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    noofcomments_currently_existing = flask.request.args["comments"]
    post_id = flask.request.args["post_id"]
    optional_comment_id = flask.request.args["comment_id"]
    if optional_comment_id == "0":
        optional_comment_id = None
    ###########################DATA VERIFICATION######################
    data_verifications.post_id_verification(post_id)
    data_verifications.stringVerification(circle)
    if not noofcomments_currently_existing.isdigit():
        return "Invalid Data", 400
    if (
        noofcomments_currently_existing.isdigit()
        and int(noofcomments_currently_existing) < 0
    ):
        return "Invalid Data", 400
    if optional_comment_id:
        data_verifications.post_id_verification(optional_comment_id)
    ###########################DATA VERIFICATION######################
    step1 = dbops.get.get_comments_in_a_circle_post(
        circle,
        post_id,
        skip=int(noofcomments_currently_existing),
        UserDetails=User_Details,
        comment_id=optional_comment_id,
        flask_context=flask.url_for,
    )
    if step1:
        return {"Comments": step1}, 200
    return "No Comments Found", 400


@app.route("/api/v1/circle/<circle>/search_engine", methods=["POST"])
def circle_search_engine(circle):
    print("User Not Logged In")
    post_json_data = flask.request.get_json()
    print(post_json_data)
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "circle_search_engine"
    )
    if circle_power_verification[1] >= 400:
        print(circle_power_verification[0])
        return circle_power_verification[0], circle_power_verification[1]
    if set(list(post_json_data.keys())) != set(
        ["search_string", "noofposts", "filter"]
    ):
        return "Invalid Data", 400
    print(set(list(post_json_data.keys())))
    noofposts = post_json_data["noofposts"]
    data_verifications.stringVerification(noofposts)
    data_verifications.stringVerification(post_json_data["search_string"])
    # data_verifications.stringVerification(post_json_data["filter"])
    if (
        post_json_data["filter"]
        not in [
            "All",
            "Following",
            "Supported",
            "Rejected",
            "COMMENT",
            "POST",
            "Replies",
        ]
        or post_json_data["filter"] == []
    ):
        return "Invalid Filter", 400
    step1 = dbops.get.get_posts_in_a_circle_search_engine(
        circle,
        post_json_data["search_string"],
        post_json_data["filter"],
        int(noofposts),
    )
    if step1:
        return {"Posts": step1}, 200
    return "No Posts Found", 400


@limiter.limit("100 per minute")
@app.route("/api/v1/circle/general/find_circles", methods=["POST"])
def find_circles():
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    # if "find_circles" not in UserDetails["Powers"]:
    #     return 'User Not Authorized', 403
    post_json_data = flask.request.get_json()
    if not any(
        item not in list(post_json_data.keys())
        for item in [
            "search_string",
            "skip",
            "special_filter",
        ]
    ):
        return "Invalid Data", 400
    noofcircles = post_json_data["skip"]
    data_verifications.structured_verifiers.string_verification(
        post_json_data["search_string"], 2, 250
    )
    if not noofcircles.isdigit() or int(noofcircles) < 0:
        return "Invalid Data", 400
    step1 = dbops.get.get_multiple_circle_card_details(
        post_json_data["search_string"], int(noofcircles)
    )
    user_circles = []
    for i in UserDetails["Circles"]:
        user_circles.append(i["DisplayName"])
    isAnonymous = "No"
    if UserDetails["UserEmail"] == "Anonymous@galam.in":
        isAnonymous = "Yes"
    if step1:
        for i in step1:
            if i["DisplayName"] in user_circles:
                i["isJoined"] = "Yes"
            else:
                i["isJoined"] = "No"
        print(len(step1))
        return {"Circles": step1, "isAnonymous": isAnonymous}, 200
    print("Honey singh")
    return {"Circles": [], "isAnonymous": isAnonymous}, 200


@app.route("/api/v1/circle/<circle>/get_replies", methods=["GET"])
def get_replies(circle):
    noofreplies_currently_existing = flask.request.args["replies"]
    post_id = flask.request.args["parent_post_id"]
    comment_id = flask.request.args["parent_comment_id"]
    data_verifications.post_id_verification(comment_id)
    data_verifications.post_id_verification(post_id)
    data_verifications.stringVerification(noofreplies_currently_existing)
    data_verifications.stringVerification(circle)
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "get_replies"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]

    step1 = dbops.get.get_replies_in_a_circle_post(
        circle, post_id, User_Details, int(noofreplies_currently_existing), comment_id
    )
    if step1:
        return {"Replies": step1}, 200
    return "No Replies Found", 400


@app.route("/api/v1/circle/<circle>/follow_unfollow_post", methods=["GET"])
def follow_unfollow_post(circle):
    post_id = flask.request.args["post_id"]
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "follow_unfollow_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    step1 = dbops.get.verify_if_user_follows_post_by_email(
        User_Details["UserEmail"], post_id, circle
    )
    if step1:
        step2 = dbops.deleters.Unfollow_Post(User_Details, post_id, circle)
    else:
        step2 = dbops.inserts.create_follower(
            User_Details, post_id, circle, "post_followers"
        )
    if step2:  # This runs if both the steps are true
        dbops.updates.update_circle_details_customized(
            circle, {"$inc": {"NumberOffollow_unfollow_clicks": 1}}
        )
        return {"message": "Post following toggled successfully"}, 200
    return "Post following toggled failed", 400


@app.route("/api/v1/circle/<circle>/support_reject_post", methods=["GET"])
def support_reject_post(circle):
    """This function is used to support or reject a post. It takes the post_id, action and post_type as arguments."""
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "support_reject_post"
    )
    post_id = flask.request.args["post_id"]
    action = flask.request.args["action"]
    post_type = flask.request.args["post_type"]
    if post_type not in ["POST", "COMMENT", "REPLY_COMMENT"]:
        return "Invalid Post Type", 400
    data_verifications.post_id_verification(post_id)
    data_verifications.stringVerification(circle)
    data_verifications.stringVerification(action)

    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    if action == "reject":
        step2 = dbops.inserts.reject_post(post_id, circle, User_Details, post_type)
    if action == "support":
        step2 = dbops.inserts.support_post(post_id, circle, User_Details, post_type)
    if step2:
        post_object = dbops.get.get_private_uncensored_single_post_in_a_circle(
            circle, post_id, post_type, UserDetails=User_Details
        )
        # ########## Notifying the followers of the post ########## #
        post_owner_email = post_object["user"]
        if post_owner_email:
            if post_owner_email != User_Details["UserEmail"]:
                support_reject_counters = (
                    dbops.get.get_number_of_supports_or_rejects_for_a_post(
                        post_id=post_id, circle_name=circle, postType=post_type
                    )
                )
                if action == "support":
                    support_reject_counters = support_reject_counters[0]
                elif action == "reject":
                    support_reject_counters = support_reject_counters[1]
                if notification.check_if_category_2_is_exponential(
                    support_reject_counters
                ):
                    if post_type == "POST":
                        thenotification_post_id = post_id
                    elif post_type == "COMMENT" or post_type == "REPLY_COMMENT":
                        thenotification_post_id = post_object["parent_post_id"]
                    verinot1 = dbops.inserts.create_notification_for_end_user(
                        end_user_email=post_owner_email,
                        circle_name=circle,
                        notification_type=action + "_" + post_type,
                        # Need to make a site for comments and replies access alone.
                        notification_url=flask.url_for(
                            "generic_post_webpage",
                            post_id=thenotification_post_id,
                            _external=True,
                        )
                        + "?circle_name="
                        + circle,
                        notifier_DisplayName=User_Details["DisplayName"],
                        support_reject_count=1,
                        post_id=post_id,
                    )
        # ########## Notifying the followers of the post ########## #
        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOf_" + action + "_" + post_type: 1}},
        )
        return {"message": "Post supporting toggled successfully"}, 200
    return "Post supporting toggled failed", 400


@app.route("/api/v1/circle/<circle>/survey_vote", methods=["POST"])
def survey_vote(circle):
    print("Invalid Data")
    """This function is used to vote on surveys and send back the survey results."""
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "survey_vote"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["post_id", "vote_option"]):
        print("Invalid Data")
        return "Invalid Data", 400
    data_verifications.post_id_verification(post_json_data["post_id"])
    data_verifications.stringVerification(circle)
    post_object = dbops.get.get_private_uncensored_single_post_in_a_circle(
        circle, post_json_data["post_id"], "POST", UserDetails=User_Details
    )
    if post_object["type2"] != "SURVEY":
        return "Invalid Post Type", 400
    if post_json_data["vote_option"] not in post_object["options"]:
        return "Invalid Vote Option", 400
    step1 = dbops.inserts.create_survey_vote(
        post_json_data["post_id"], circle, User_Details, post_json_data["vote_option"]
    )
    step2 = dbops.get.count_survey_stats(
        post_json_data["post_id"], circle, post_object["options"]
    )
    if step1:
        return {
            "message": "Survey Voted Successfully",
            "survey_stats": step2[0],
            "survey_stats_absolute_numbers": step2[1],
            "total_votes": step2[2],
        }, 200
    return "Survey Vote Failed", 400


@app.route("/api/v1/<circle>/toggle_pin_post", methods=["POST"])
def pin_unpin_post(circle):
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "pin_unpin_post"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["post_id", "post_type"]):
        return "Invalid Data", 400
    data_verifications.post_id_verification(post_json_data["post_id"])
    data_verifications.stringVerification(circle)
    data_verifications.stringVerification(post_json_data["post_type"])
    if post_json_data["post_type"] not in ["POST", "COMMENT", "REPLY_COMMENT"]:
        return "Invalid Post Type", 400
    step1 = dbops.updates.toggle_pin_post(
        post_json_data["post_id"], circle, post_json_data["post_type"]
    )
    if step1:
        return {"message": "Post pinned successfully"}, 200


@app.route(
    "/api/v1/circle/<circle>/pure_api/send_circle_admin_message", methods=["POST"]
)
def send_circle_admin_message(circle):
    pass


@app.route("/api/v1/circle/<circle>/support_reject_info_card", methods=["GET"])
def support_reject_info_card(circle):
    """This function is used to support or reject info_card_in_a_circle. It takes the post_id, action and post_type as arguments."""
    post_id = flask.request.args["post_id"]
    action = flask.request.args["action"]
    if action not in ["support", "reject", "nullify"]:
        return "Invalid Action", 400
    post_type = flask.request.args["post_type"]
    if post_type not in ["profile_card"]:
        return "Invalid Post Type", 400
    data_verifications.post_id_verification(post_id)
    data_verifications.stringVerification(circle)
    data_verifications.stringVerification(action)
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not User_Details:
        return "User Not Logged In", 403

    info_card_details = dbops.get.get_info_card_details(circle, post_id, post_type)
    if not info_card_details:
        return "Invalid Info Card", 400
    if info_card_details["voterID_verification"] == "on":
        print("Checking Voter ID Verification")
        if User_Details["VoterID_Verification"] == "Yes":
            pass
        else:
            print("Voter ID Verification Required")
            return "Voter ID Verification Required", 400
    circle_power_verification = common_mains.circle_power_verification(
        User_Details, circle, "support_reject_info_card"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    if action == "reject":
        step2 = dbops.inserts.reject_post(post_id, circle, User_Details, post_type)
        print("Rejected Successfully")
    if action == "support":
        step2 = dbops.inserts.support_post(post_id, circle, User_Details, post_type)
        print("Supported Successfully")
    if action == "nullify":
        step2 = dbops.inserts.nullify_post_support_and_reject(
            post_id, circle, User_Details, post_type
        )
        print("Nullified Successfully")
    if step2:
        dbops.updates.update_circle_details_customized(
            circle,
            {"$inc": {"NumberOf_" + action + "_" + post_type: 1}},
        )
        return {"message": "Post supporting toggled successfully"}, 200
    return "Post supporting toggled failed", 400


########################################3 Updates ##########################################
@app.route("/api/v1/circle/user_moderation/mute_user/<circle>", methods=["POST"])
def mute_user(circle):
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, circle, "mute_user"
    )
    if circle_power_verification[1] >= 400:
        print("Jao balayya")
        return circle_power_verification[0], circle_power_verification[1]
    muting_power_array = []
    pure_circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    user_role = common_mains.circle_role_getter(UserDetails, circle)
    json_data = flask.request.get_json()
    end_user_details = dbops.get.get_user_details_by_email(
        dbops.deco(json_data["userid"])
    )

    end_user_role = common_mains.circle_role_getter(end_user_details, circle)
    #################### Data Verification ####################
    if set(list(json_data.keys())) != set(["userid", "action"]):
        return "Invalid Data", 400
    if not end_user_details:
        return "User Not Found", 400
    if json_data["action"] not in ["mute", "unmute"]:
        return "Invalid Action", 400
    if not common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
        user_role, end_user_role, pure_circle_object["Roles_List"]
    ):
        return "User Not Authorized", 403
    #################### Data Verification ####################
    powers_that_need_to_be_added_or_removed = (
        "Basic powers to create posts, comments and replies in the circle"
    )
    powers_list = [
        "create_comment_reply",
        "create_comment",
        "create_post",
        "update_comment_post_reply",
    ]
    if json_data["action"] == "mute":
        step1 = dbops.updates.update_user_circle_powers(
            end_user_details["UserEmail"], circle, powers_list, "remove"
        )
    elif json_data["action"] == "unmute":
        step1 = dbops.updates.update_user_circle_powers(
            end_user_details["UserEmail"], circle, powers_list, "Push"
        )
    if step1:
        dbops.updates.reload_my_session_token(end_user_details["UserEmail"])
        return "User Muted Successfully", 200
    return "User Muting Failed", 400


@app.route("/api/v1/circle/user_moderation/ban_user/<circle>", methods=["POST"])
def ban_user(circle):
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    circle_power_verification = common_mains.circle_power_verification(
        UserDetails, circle, "ban_user"
    )
    if circle_power_verification[1] >= 400:
        return circle_power_verification[0], circle_power_verification[1]
    muting_power_array = []
    pure_circle_object = dbops.get.get_pure_circle_details_without_images(circle)
    user_role = common_mains.circle_role_getter(UserDetails, circle)
    json_data = flask.request.get_json()
    end_user_details = dbops.get.get_user_details_by_email(
        dbops.deco(json_data["userid"])
    )
    end_user_role = common_mains.circle_role_getter(end_user_details, circle)
    #################### Data Verification ####################
    if set(list(json_data.keys())) != set(["userid", "action"]):
        return "Invalid Data", 400
    if not end_user_details:
        return "User Not Found", 400
    if json_data["action"] not in ["ban", "unban"]:
        return "Invalid Action", 400
    #################### Data Verification ####################
    if not common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
        user_role, end_user_role, pure_circle_object["Roles_List"]
    ):
        return "User Not Authorized", 403
    # I dont want to implement ban method, because it is too much work. I will just mute the user.


@app.route("/api/v1/user/get_circles_in_the_area", methods=["POST"])
def get_circles_in_the_area():
    """This function is used to get the circles in the area. By getting the user location."""
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    if "get_circles_in_the_area" not in UserDetails["Powers"]:
        return "User Not Authorized", 403
    JSON_Data = flask.request.get_json()
    if list(JSON_Data.keys()) != ["coordinates"]:
        return "Invalid Data", 400
    if len(JSON_Data["coordinates"]) != 2 and type(JSON_Data["coordinates"]) != list:
        return "Invalid Data", 400
    if (
        type(JSON_Data["coordinates"][0]) != float
        and type(JSON_Data["coordinates"][1]) != float
    ):
        return "Invalid Data", 400
    step1 = dbops.get.get_circles_in_an_area(JSON_Data["coordinates"], UserDetails)
    if step1:
        return {"Circles": step1[0], "infostring": step1[1]}, 200
    print("Cielr")
    return "An unknown error occured", 400


########################################3 Updates ##########################################


@app.route("/api/v1/circle/accept_invite", methods=["POST"])
def accept_invite():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    return "Invite Accepted"


@app.route("/api/v1/circle/remove_role", methods=["POST"])
def remove_role():
    User_Details = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    return "Role Removed"


# @limiter.limit("10/second")
@app.route("/api/v1/get_meta_data_of_link", methods=["POST"])
def get_meta_data_of_link():
    UserDetails = dbops.get.get_user_token_details(flask.session["Top_Secret_Token"])
    if not UserDetails:
        return "User Not Logged In", 403
    if "get_meta_data_of_link" not in UserDetails["Powers"]:
        return "User Not Authorized", 403
    post_json_data = flask.request.get_json()
    if set(list(post_json_data.keys())) != set(["link"]):
        return "Invalid Data", 400
    if not post_json_data["link"].startswith("https://"):
        return ("Invalid Data",)
    if len(post_json_data["link"]) > 500:
        return "Invalid Data", 400
    print(post_json_data["link"])
    meta_data = common_mains.get_meta_data_of_link(post_json_data["link"])
    if meta_data:
        return meta_data, 200
    return "Invalid Link", 400


############################### End of API Routes with Authentication (Session Top_Secret_Token)##################################


# Redirect all 404 to /register2.
@app.errorhandler(404)
def page_not_found(e):
    if flask.request.method == "GET":
        return flask.redirect("/home")
    else:
        return "Page Not Found", 400


# If a GET METHOD returns 500, render error.html.


@app.errorhandler(500)
def internal_server_error(e):
    if flask.request.method == "GET":
        return flask.render_template("error.html"), 400
    return "Bad Input", 400


# Set same origin policy to strict same origin policy.


@app.after_request
def after_request3(response):
    if "Temporal_User_Details" in list(flask.session.keys()):  # Hash and encrypt
        del flask.session["Temporal_User_Details"]
    # if "github_oauth_token" in list(flask.session.keys()):
    #     del flask.session["github_oauth_token"]
    response.headers.add("Access-Control-Allow-Origin", "127.0.0.1")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response


if __name__ == "__main__":
    app.run(
        host=config.RUNNING_HOST_IP,
        port=config.RUNNINGPORTADDRESS,
        debug=True,
    )
