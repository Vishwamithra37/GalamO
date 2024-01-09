import config
from typing import Union
import datetime
from nested_dictionaries import NestedDictionaries as nd
from bson.objectid import ObjectId
import easycrypt
import json
import copy
import time
import common_mains
import secrets
import requests
from hashlib import sha512


# from flask import render_template
def hashing_512(string_data: str):
    """This function hashes a string using sha512"""
    return sha512(string_data.encode("utf-8")).hexdigest()


dab = config.DB[config.DATABASE]


class get:
    def get_OTP(check: dict):
        """This function gets the OTP from the database."""
        dac = dab["OTP"]
        doc = dac.find_one(check)
        return doc

    def send_data_to_SSE_engine(email: str, data: dict, too_many="No"):
        """This function sends data to the SSE engine."""
        json_data = {
            "UserEmail": email,
            "data": data,
            "api_key": config.SSE_API_KEY,
            "TooMany": too_many,
        }
        print("Sending data to SSE Engine.")
        re1 = requests.post(
            config.SSE_API_URL + "/get_me_data/post",
            json=json_data,
            timeout=10,
            verify=False,
        )
        return True

    def verify_if_captcha_and_captcha_is_successful(
        captcha_id: str,
        captcha: str,
        UserEmail: str,
    ):
        """This function verifies if the captcha and transaction is successful."""
        dac = dab["OTP"]
        doc = dac.find_one(
            {
                "captcha_id": captcha_id,
                "UserEmail": UserEmail,
                "Type": "AADHAR_JSON_GET_CAPTCHA",
                "attempts": {"$lt": 3},
            }
        )
        if not doc:
            return False

        re1 = requests.get(
            config.SOFTPAY_API_URLS["AADHAR_JSON"]["GET_OTP"]["URL"]
            + "&captcha_id="
            + captcha_id
            + "&aadhar="
            + doc["AadharID"]
            + "&captcha="
            + captcha
        )
        re1 = re1.json()

        if re1["status"] == "SUCCESS":
            new_doc = nd()
            new_doc["UserEmail"] = UserEmail
            new_doc["Type"] = "AADHAR_JSON_GET_MOBILE_OTP"
            new_doc["Timestamp"] = datetime.datetime.utcnow()
            new_doc["transaction_id"] = re1["det"]["txnId"]
            new_doc["mobile_number"] = re1["det"]["mobileNumber"]
            new_doc["authorization_number"] = re1["det"]["authorization"]
            new_doc["AadharID"] = doc["AadharID"]
            new_doc["attempts"] = 0
            dac.insert_one(new_doc)
            dac.delete_one(doc)
            return True
        dac.update_one(doc, {"$inc": {"attempts": 1}})
        return False

    def verify_if_aadhar_otp_is_valid(UserEmail: str, OTP: str):
        """This function verifies if the captcha and transaction is successful."""
        dac = dab["OTP"]
        doc = dac.find_one(
            {
                "UserEmail": UserEmail,
                "Type": "AADHAR_JSON_GET_MOBILE_OTP",
            }
        )
        if not doc:
            return False
        re1 = requests.get(
            config.SOFTPAY_API_URLS["AADHAR_JSON"]["VERIFY_OTP"]["URL"]
            + "&txn_id="
            + doc["transaction_id"]
            + "&otp="
            + OTP
            + "&authorization="
            + doc["authorization_number"]
            + "&aadhar_number="
            + doc["AadharID"]
            + "&client_order_id="
            + hashing_512(doc["UserEmail"])
            + "&aadhar_number="
            + doc["AadharID"]
        )
        # Need to be implemented.
        re1 = re1.json()
        if re1["status"] == "SUCCESS":
            dac.delete_one(doc)
            dac = dab["USER_DETAILS_SPECIALS"]
            try:
                del re1["root"]["photo"]
                del re1["root"]["name"]
                del re1["root"]["healthIdNumber"]
            except:
                pass
            re1["UserEmail"] = UserEmail
            re1["Timestamp"] = datetime.datetime.utcnow()
            re1["Type"] = "AADHAR_JSON"
            re1["TheAadharID"] = doc["AadharID"]
            re1["state"] = re1["root"]["state"]
            re1["district"] = re1["root"]["district"]
            dac.insert_one(re1)
            dac2 = dab["USER_DETAILS"]
            dac2.update_one(
                {"UserEmail": UserEmail},
                {
                    "$set": {"Aadhar_Verification": "Yes"},
                    "$pull": {"Powers": "aadhar_verification"},
                },
            )
            dac2.update_one(
                {"UserEmail": UserEmail}, {"$push": {"Powers": "voter_id_verification"}}
            )
            return re1
        dac.update_one(doc, {"$inc": {"attempts": 1}})
        return False

    def verify_if_voter_id_exists(voter_id: str, UserEmail: str):
        dac = dab["USER_DETAILS_SPECIALS"]
        doc = dac.find_one({"VoterID": voter_id})
        if doc:
            return False
        re1 = requests.get(
            config.SOFTPAY_API_URLS["VOTER_ID_VERIFY"]["GET_DATA"]["URL"]
            + "&epic_no="
            + voter_id
            + "&client_order_id="
            + hashing_512(UserEmail)
        )
        re1 = re1.json()
        if re1["status"] == "Success":
            re1["UserEmail"] = UserEmail
            re1["Timestamp"] = datetime.datetime.utcnow()
            re1["Type"] = "VOTER_ID_VERIFY"
            dac.insert_one(re1)
            dac2 = dab["USER_DETAILS"]
            dac2.update_one(
                {"UserEmail": UserEmail},
                {
                    "$set": {"VoterID_Verification": "Yes"},
                    "$pull": {"Powers": "voter_id_verification"},
                },
            )
            return True
        return False


class inserts:
    def aadhar_verification_get_captcha(aadhar_id, UserEmail):
        """Insert aadhar verification details into the .\n
        And get the captcha back from the server.\n
        {
            "captcha_id": "string",
            "captcha_base64": "string"
        }
        """
        dac = dab["OTP"]
        doc = nd()
        doc["UserEmail"] = UserEmail
        doc["AadharID"] = aadhar_id
        doc["Type"] = "AADHAR_JSON_GET_CAPTCHA"
        doc["Timestamp"] = datetime.datetime.utcnow()
        doc["attempts"] = 0
        v1 = dac.find_one({"UserEmail": UserEmail, "Type": "AADHAR_JSON_GET_CAPTCHA"})
        if v1:
            dac.delete_one(v1)
        # Send out the request to the apis.
        dac2 = dab["USER_DETAILS_SPECIALS"]
        if dac2.find_one({"TheAadharID": doc["AadharID"]}):
            return False
        re1 = requests.get(config.SOFTPAY_API_URLS["AADHAR_JSON"]["GET_CAPTCHA"]["URL"])
        re1 = re1.json()
        doc["captcha_id"] = re1["cap_detail"]["captchaId"]
        g1 = dac.insert_one(doc)
        return {
            "captcha_id": doc["captcha_id"],
            "captcha_base64": re1["cap_detail"]["captcha"],
        }

    def create_OTP_and_insert_in_DB(email: str, type: str, UserDict: dict = {}):
        """This function creates an OTP and inserts it into the database."""
        dac = dab["OTP"]
        doc = nd()
        doc["UserEmail"] = email
        doc["Type"] = type
        doc["Timestamp"] = datetime.datetime.utcnow()
        doc["UserDict"] = UserDict
        doc["OTP"] = secrets.token_hex(32)[0:4]
        dac.insert_one(doc)
        return doc["OTP"]


class deletes:
    def delete_OTP(email: str, type: str):
        """This function deletes the OTP from the database."""
        dac = dab["OTP"]
        doc = nd()
        doc["UserEmail"] = email
        doc["Type"] = type
        dac.delete_one(doc)
        return True
