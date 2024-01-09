from pymongo import MongoClient

DBLINK = "mongodb://localhost:27017/"  # connecting to the local Mongodb
DBPORT = 3000
DATABASE = "GTS"
RUNNING_HOST_IP = "0.0.0.0"
RUNNINGPORTADDRESS = 80
SERVERTIMEOUT = 500
DEBUG = False
TESTING_HTTP = "http://"
TESTING_IP = "localhost"
SSE_API_KEY = "Manasa Gelupu Needhera"
SSE_API_URL = "http://localhost:5000"
SOFTPAY_API_KEY = "garbage"
SOFTPAY_API_URLS = {
    "AADHAR_JSON": {
        "GET_CAPTCHA": {
            "URL": "https://g2c.softpayapi.com/api/",
            "request_type": "GET",
        },
        "GET_OTP": {
            "URL": "https://g2c.softpayapi.com/api/",
            "request_type": "GET",
        },
        "VERIFY_OTP": {
            "URL": "https://g2c.softpayapi.com/api/",
            "request_type": "GET",
        },
    },
    "VOTER_ID_VERIFY": {
        "GET_DATA": {
            "URL": "https://g2c.softpayapi.com/api/",
            "request_type": "GET",
        }
    },
}
# RUNNINGPORT=443
# MAXUPDATELENGTH=500
DB = MongoClient(
    DBLINK, port=DBPORT, serverSelectionTimeoutMS=SERVERTIMEOUT, appname="GTS_OPEN"
)


SESSION_ENCRYPTING_KEY = """8934610201
                          075717frfwerg
                          942517088f
                          1746549927
                          4853666879
                          8281993675
                          0595648483
                          4337605057
                          4490809401
                          4101643836"""

VAPID_PRIVATE_KEY = """D1KllvJNZ0w_sClXkm-ivMuDtVlC2nGPqyQshjtbzIE"""
VAPID_PUBLIC_KEY = """BCqRJv5Pe4xGmXco4dzSJdnU3npIA7D8GN-R_brrji9eEJKLVY3yFSTwcEG2f6okHowIUjArWVpl6gY83SMd0Ns"""

SECRET_KEY = "123456"
SESSION_LIFE = 3600000
################################## Circle Power Categories################################################
