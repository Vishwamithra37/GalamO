from nested_dictionaries import NestedDictionaries as nd
from flask_mail import Message
from config import DB, DATABASE
import easycrypt

# from config import SECRETKEYS
import datetime
import hashlib


SECRETKEYS = "GalamIsTheBest"


# from flask import render_template
def hashing_512(bytes_data: bytes):
    """This function hashes bytes using sha512"""
    return hashlib.sha512(bytes_data).hexdigest()


dab = DB[DATABASE]


def enco(key: str, sstr: str):
    key2 = easycrypt.genkeypassword(key, "Renukamma Ghat".encode("utf-8"))
    fkey = easycrypt.encrypt((sstr).encode("utf-8"), key2)
    fkey = fkey.decode("utf-8")
    return fkey


def deco(key: str, secode: str):
    secode = secode.encode("utf-8")
    key2 = easycrypt.genkeypassword(key, "Renukamma Ghat".encode("utf-8"))
    fkey3 = easycrypt.decrypt(secode, key2)
    return fkey3


def get_email_subscription_status(Email, Type, metadata=[]):
    dac = dab["Email_Unsubscriptions"]
    doc = nd()
    doc["Email"] = Email
    doc["Type"] = Type
    if dac.find_one(doc):
        return False  # If the user has unsubscribed.
    else:
        return True  # If the user has not unsubscribed.


def Unsunscribed_from_emails(Email, Type, metadata=[]):
    dac = dab["Email_Unsubscriptions"]
    doc = nd()
    doc["Email"] = Email
    doc["Type"] = Type
    doc["Timestamp"] = str(datetime.datetime.now())
    # Delete if already exists.
    dac.delete_many({"Email": Email, "Type": Type})
    r2 = dac.insert_one(doc)
    return str(r2.inserted_id)


def jinja_html_buttons_for_unsubscribe(Email, Type, metadata=[]):
    """This function returns the html for the unsubscribe button"""
    if get_email_subscription_status(Email, Type):
        Encoded_Email = enco(SECRETKEYS, Email)
        Encoded_Type = enco(SECRETKEYS, Type)
        return (
            """
            <form action="https://www.galam.in/Unsubscribe" method="POST">
            <input type="hidden" name="Encoded_Email" value="""
            + Encoded_Email
            + """>
            <input type="hidden" name="Encoded_Type" value="""
            + Encoded_Type
            + """>
            <input 
                  type="submit"
                  style="
                         outline: none;
                         border: none;
                         background-color: transparent;
                         color: blue;
                         text-decoration: underline;
                        "
                  value="Unsubscribe from """
            + Type
            + """ Mails"
            </form>
            """
        )
    return False


class mail:
    def custom_mail(
        mail_object,
        html_content,
        subject: str,
        reciepient: str,
        sender: str,
        DocumentName: str = None,
        filebytes: bytes = None,
    ):
        """This function sends out mails to invested parties"""
        msg = Message(
            subject,
            sender=sender + "@mail.galam.in",
            recipients=[reciepient],
            html=html_content,
        )
        if DocumentName and filebytes:
            msg.attach(DocumentName, "application/pdf", filebytes)
        mail_object.send(msg)

        return True

    def message_of_interest(mail_object, dat: dict):
        """This function sends out mails to invested parties"""

        msg = Message(
            "New MOI from "
            + dat["CommonName"]
            + " with subject "
            + dat["subject"]
            + " = From "
            + dat["email"],
            sender="MOI@mail.galam.in",
            recipients=["mithravishwa2004@gmail.com"],
            body=dat["message"],
        )
        mail_object.send(msg)
        return True
