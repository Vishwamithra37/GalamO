import test_sse
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
from re import escape
from email_dbops import get as email_get
from hashlib import sha512


dab = config.DB[config.DATABASE]


def enco(sstr: str):
    key2 = easycrypt.genkeypassword(
        config.SESSION_ENCRYPTING_KEY, "Ammori daya".encode("utf-8")
    )
    fkey = easycrypt.encrypt((sstr).encode("utf-8"), key2)
    fkey = fkey.decode("utf-8")
    return fkey


def deco(secode: str):
    secode = secode.encode("utf-8")
    key2 = easycrypt.genkeypassword(
        config.SESSION_ENCRYPTING_KEY, "Ammori Daya".encode("utf-8")
    )
    fkey3 = easycrypt.decrypt(secode, key2)
    return fkey3


class cards:
    def comment_card_in_single_post_page(i, UserDetails, circle_name, post_id):
        i["sid"] = str(i["_id"])
        i["Anonymous"] = "Yes"
        replies_list = get.count_number_of_replies_to_a_comment(
            circle_name, "REPLY_COMMENT", post_id, i["sid"]
        )
        if replies_list:
            i["replies"] = str(replies_list)
        else:
            i["replies"] = "No"
        srcounters = get.get_number_of_supports_or_rejects_for_a_post(
            i["sid"], circle_name, {"$in": ["COMMENT", "REPLY_COMMENT"]}
        )
        i["Supports"] = str(srcounters[0])
        i["Rejects"] = str(srcounters[1])
        if UserDetails:
            i["Anonymous"] = "No"
            if i["user"] == UserDetails["UserEmail"]:
                i["Self"] = "Yes"
            else:
                i["Self"] = "No"
            k1 = get.verify_if_user_supports_or_rejects_post_by_email(
                i["sid"],
                circle_name,
                UserDetails["UserEmail"],
                {"$in": ["COMMENT", "REPLY_COMMENT"]},
            )
            if k1 == True:
                i["Supported"] = "Yes"
                i["Rejected"] = "No"
            elif k1 == False:
                i["Rejected"] = "Yes"
                i["Supported"] = "No"
            else:
                i["Rejected"] = "No"
                i["Supported"] = "No"
        i["creatorID"] = enco(i["user"])
        Commentor_User_Details = get.get_user_details_by_email(i["user"])
        i["CreatorName"] = Commentor_User_Details["DisplayName"]
        UserRole = common_mains.circle_role_getter(Commentor_User_Details, circle_name)
        i["CreatorRole"] = UserRole
        time_difference = datetime.datetime.now() - i["CreatedAt"]
        time_difference = str(time_difference)
        time_difference = time_difference.split(":")
        if time_difference[0] == "0":
            time_difference = time_difference[1] + " minutes ago"
        elif time_difference[0] == "1":
            time_difference = time_difference[0] + " hours ago"
        else:
            time_difference = i["CreatedAt"].strftime("%d %b %Y")
        i["time_difference"] = time_difference
        del i["user"]
        del i["_id"]
        return i


class webpushing:
    def find_and_push(useremail: str):
        subscription_objects = get.get_all_subscription_objects_for_a_user(useremail)
        print(subscription_objects)
        all_unread_notificaitons = get.get_special_unread_notifications_for_sse(
            useremail
        )
        if len(all_unread_notificaitons) > 7:
            notif2 = {
                "CreatedAt": "2021-01-01 00:00:00.000000",
                "From": "WebPushEngine",
                "notifier_DisplayName": "Many Notifications",
                "description": "You have more than 7 unread notifications. Please check them out.",
                "title": "Too many notifications",
                "url": "/home",
                "sid": "000000000000000000000000",
                "seen": "No",
                "timestamp": "2021-01-01 00:00:00.000000",
            }
            test_sse.webpusher(notif2, subscription_objects, too_many=True)
        for notif in all_unread_notificaitons:
            notif["CreatedAt"] = str(notif["CreatedAt"])
            notif["From"] = "WebPushEngine"
            test_sse.webpusher(notif, subscription_objects)


class inserts:
    def create_new_subscription_for_notifications(
        user_email: str, subscription_info: dict
    ):
        """Insert subscription details into the database.\n"""
        dac = dab["NOTIFICATIONS_SUBSCRIPTIONS"]
        fil = {"UserEmail": user_email, "subscription_info": subscription_info}
        # If the object does not exist, insert it.
        ret = {"UserEmail": 1, "_id": 0}
        # If not UserEmail in the filter.
        todelete = {
            "UserEmail": {"$ne": user_email},
            "subscription_info": subscription_info,
        }
        deleters = dac.delete_many(todelete)
        count_of_subscriptions = dac.count_documents(fil)
        if count_of_subscriptions == 10:
            dac.delete_one(fil)
        if not dac.find_one(fil, ret):
            dac.insert_one(fil)
            return [True, "Inserted"]
        return [False, "Already Exists"]

    def create_my_description(user_token_details_dict: dict, description: str):
        """Insert description into the database.\n"""
        dac = dab["USER_DETAILS"]
        fil = {"UserEmail": user_token_details_dict["UserEmail"]}
        topushin = {"Description": description}
        a1 = dac.update_one(fil, {"$set": topushin})
        return a1.modified_count

    def create_new_username(user_token_details_dict: dict, username: str):
        """Insert username into the database.\n"""
        dac = dab["USER_DETAILS"]
        fil = {"UserEmail": user_token_details_dict["UserEmail"]}
        if user_token_details_dict["Available_username"] != "Yes":
            return False
        if dac.find_one({"DisplayName": username}):
            return False
        topushin = {
            "DisplayName": username,
            "OldUserName": user_token_details_dict["DisplayName"],
            "Available_username": "No",
        }
        a1 = dac.update_one(fil, {"$set": topushin})
        return a1.modified_count

    def register_for_verification(User_details: dict):
        """Insert verification details into the database.\n"""
        dac = dab["PENDING_VERIFICATION"]
        User_details["CreatedAt"] = datetime.datetime.now()
        User_details["Aadhar_Verification"] = "No"
        User_details["VoterID_Verification"] = "No"
        a1 = dac.insert_one(User_details)
        return str(a1.inserted_id)

    def create_report_for_post(
        user_token_details_dict: dict,
        circle_name: str,
        post_id: str,
        reason: str,
        post_type: str,
        #    Be careful.
        hypothetical_url: str = None,
    ):
        """Insert report details into the database.\n"""
        post_details = get.get_any_type_single_post_details_from_POSTS(
            circle_name, post_id, post_type
        )
        if not post_details:
            return False
        dac = dab["REPORTS"]
        report_data = {}
        report_data["CreatedAt"] = datetime.datetime.now()
        report_data["user"] = user_token_details_dict["UserEmail"]
        report_data["reporter_displayname"] = user_token_details_dict["DisplayName"]
        report_data["poster_displayname"] = post_details["poster_display_name"]
        report_data["circle"] = circle_name
        report_data["post_id"] = post_id
        report_data["reason"] = reason
        report_data["post_type"] = post_type
        report_data["first_report"] = "Yes"
        report_data["posted_on"] = post_details["CreatedAt"]
        v1 = dac.find_one(
            {
                "post_id": post_id,
                "post_type": post_type,
                "circle": circle_name,
                "first_report": "Yes",
            }
        )
        v2 = dac.find_one(
            {
                "post_id": post_id,
                "post_type": post_type,
                "circle": circle_name,
                "user": user_token_details_dict["UserEmail"],
            }
        )

        if v1:
            # This will allow us to retreive easily the number of reports for a post.
            report_data["first_report"] = "no"
        else:
            if hypothetical_url != None:
                report_data["url"] = hypothetical_url
            if post_type == "POST":
                report_data["html_content"] = post_details["title"]
            elif post_type == "COMMENT" or post_type == "REPLY_COMMENT":
                report_data["html_content"] = post_details["html_content"]
        if v2:
            # Because the user has already reported the post.
            return False
        a1 = dac.insert_one(report_data)
        return str(a1.inserted_id)

    def create_new_flair_tag_in_a_circle(cirle_name: str, flair_tag_name: str):
        """Insert flair tag details into the database.\n"""
        dac = dab["CIRCLES"]
        fil = {"DisplayName": cirle_name}
        push_in_the_last = flair_tag_name
        v1 = dac.find_one(fil)
        if flair_tag_name in v1["Flairs_List"]:
            return False
        if len(v1["Flairs_List"]) == 200:
            return False
        a1 = dac.update_one(fil, {"$push": {"Flairs_List": push_in_the_last}})
        return a1.modified_count

    def create_new_role_in_a_circle(
        circle_Name: str, role_name: str, role_description: str
    ):
        """Insert role details into the database.\n"""
        dac = dab["CIRCLES"]
        fil = {"DisplayName": circle_Name}
        toupdate_to_roles_object = {
            "Role_Description": role_description,
            "Role_Name": role_name,
            "Role_Tags": [],
            "Role_Powers": [],
            "Role_Symbol": "",
        }
        push_in_the_last = role_name
        v1 = dac.find_one(fil)
        if v1["Roles_List"].count(role_name) > 0:
            return False
        if len(v1["Roles_List"]) == 7:
            return False
        a1 = dac.update_one(
            fil,
            {
                "$set": {"Roles." + role_name: toupdate_to_roles_object},
                "$push": {"Roles_List": push_in_the_last},
            },
        )
        return a1.modified_count

    # Notification Section #

    def create_notification_for_end_user(
        end_user_email: str,
        circle_name: str,
        notification_type: str,
        notification_url: str = None,
        notifier_DisplayName: str = None,
        post_id: str = None,
        support_reject_count: int = None,
    ):
        """Insert notification details into the database.\n"""
        dac = dab["NOTIFICATIONS"]
        notification_data = {}
        notification_data["CreatedAt"] = datetime.datetime.now()
        notification_data["user"] = end_user_email
        notification_data["notifier_DisplayName"] = notifier_DisplayName
        notification_data["circle"] = circle_name
        notification_data["type"] = notification_type
        notification_data["url"] = notification_url
        notification_data["seen"] = "No"
        notification_data["support_reject_count"] = support_reject_count
        notification_data["PostId"] = post_id
        if notification_data["type"] == "New_Comment":
            notification_data[
                "description"
            ] = " A new comment has been made on a post you follow by {displayname} in {circle_name}.".format(
                displayname=notifier_DisplayName, circle_name=circle_name
            )
            notification_data["url"] = (
                notification_url
                + "&comment_id="
                + post_id
                + "&comment_type="
                + "COMMENT"
            )
        elif notification_data["type"] == "New_Reply_Comment":
            notification_data[
                "description"
            ] = " A new reply comment has been made on your comment by {displayname} in {circle_name}.".format(
                displayname=notifier_DisplayName, circle_name=circle_name
            )
            notification_data["url"] = (
                notification_url
                + "&comment_id="
                + post_id
                + "&comment_type="
                + "REPLY_COMMENT"
            )
        elif notification_data["type"] == "support_POST":
            notification_data[
                "description"
            ] = " {support_reject_count} people have supported your post in {circle_name}.".format(
                support_reject_count=support_reject_count, circle_name=circle_name
            )
        elif notification_data["type"] == "reject_POST":
            notification_data[
                "description"
            ] = " {support_reject_count} people have rejected your post in {circle_name}.".format(
                support_reject_count=support_reject_count, circle_name=circle_name
            )

        elif (
            notification_data["type"] == "support_COMMENT"
            or notification_data["type"] == "support_REPLY_COMMENT"
        ):
            notification_data[
                "description"
            ] = " {support_reject_count} people have supported your comment in {circle_name}.".format(
                support_reject_count=support_reject_count, circle_name=circle_name
            )
            if notification_data["type"] == "support_COMMENT":
                special_type = "COMMENT"
            else:
                special_type = "REPLY_COMMENT"
            notification_data["url"] = (
                notification_url
                + "&comment_id="
                + post_id
                + "&comment_type="
                + special_type
            )

        elif (
            notification_data["type"] == "reject_COMMENT"
            or notification_data["type"] == "reject_REPLY_COMMENT"
        ):
            notification_data[
                "description"
            ] = " {support_reject_count} people have rejected your comment in {circle_name}.".format(
                support_reject_count=support_reject_count, circle_name=circle_name
            )
            if notification_data["type"] == "reject_COMMENT":
                special_type = "COMMENT"
            else:
                special_type = "REPLY_COMMENT"
            notification_data["url"] = (
                notification_url
                + "&comment_id="
                + post_id
                + "&comment_type="
                + special_type
            )

        elif notification_data["type"] == "New_Post":
            notification_data[
                "description"
            ] = " A new post has been made by {displayname} in {circle_name}.".format(
                displayname=notifier_DisplayName, circle_name=circle_name
            )
        elif notification_data["type"] == "New_Feature":
            notification_data[
                "description"
            ] = " A new feature has been added in {circle_name}, please join and check it out.".format(
                circle_name=circle_name
            )
        elif notification_data["type"] == "New_Important_Circle_Announcement":
            notification_data[
                "description"
            ] = " A new important announcement has been made in {circle_name}.".format(
                circle_name=circle_name
            )
        try_finder = {
            "user": end_user_email,
            "circle": circle_name,
            "type": notification_type,
            "PostId": post_id,
            "support_reject_count": support_reject_count,
        }
        if dac.find_one(try_finder):
            return "Already Exists"
        else:
            try_finder["notifier_DisplayName"] = notifier_DisplayName
            if dac.find_one(try_finder):
                return "Already Exists"
        a1 = dac.insert_one(notification_data)

        trigger_sse = get.get_special_unread_notifications_for_sse(end_user_email)
        TooMany = "No"
        if len(trigger_sse) > 7:
            TooMany = "Yes"
        if trigger_sse:
            trigger_sse[0]["CreatedAt"] = str(trigger_sse[0]["CreatedAt"])
            subscritpions = get.get_all_subscription_objects_for_a_user(end_user_email)
            test_sse.webpusher(trigger_sse[0], subscritpions, too_many=TooMany)
            # email_get.send_data_to_SSE_engine(end_user_email, trigger_sse[0], TooMany)
        return str(a1.inserted_id)

    # End of Notification Section #

    # Information board card section #
    def create_indvidual_cards(
        card_data: dict, card_type: str, user_token_details_dict: dict, circle_name: str
    ):
        """Insert card details into the database.\n"""
        dac = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
        card_data["CreatedAt"] = datetime.datetime.now()
        card_data["user"] = user_token_details_dict["UserEmail"]
        card_data["circle"] = circle_name
        card_data["type"] = card_type
        a1 = dac.insert_one(card_data)
        return str(a1.inserted_id)

    def insert_base64_image(base64_string: str, circleName: str):
        """Insert base64 image into the database.\n"""
        dac = dab["BASE64_IMAGES"]
        fil = {"circle": circleName, "base64": base64_string}
        # r1 = dac.delete_one(fil)
        a1 = dac.insert_one(fil)
        return str(a1.inserted_id)

    def create_information_board_cards(
        information_board_title, information_cards_list, circle_name
    ):
        """Create information board cards. Insert ID of the card array which are ids in the circle_information_board_cards collection. \n"""
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
            "Information_Board_Title_And_Subtitle.title": information_board_title,
        }
        # The below code is to create a new list in the Information_Board_Title_And_Subtitle in the exact position of the title.
        topushin = {
            "$set": {
                "Information_Board_Title_And_Subtitle.$.Information_cards": information_cards_list
            }
        }
        # Delete existing list and push the new list. If it exists that is, if the title exists.
        r1 = dac.find_one(fil, {"Information_Board_Title_And_Subtitle": 1, "_id": 0})
        if r1:
            for i in r1["Information_Board_Title_And_Subtitle"]:
                # Check wheater information_cards exists in the list.
                if i["title"] == information_board_title:
                    if "Information_cards" in list(i.keys()):
                        # Delete the existing list. Carefully.
                        for j in i["Information_cards"]:
                            nullifier = deleters.nullify_all_post_support_and_reject(
                                j, circle_name, "profile_card"
                            )
                            dac2 = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
                            image_test = dac2.find_one(
                                {"_id": ObjectId(j), "circle": circle_name},
                                {"card_image_id": 1, "_id": 0},
                            )
                            if image_test:
                                dac3 = dab["BASE64_IMAGES"]
                                dac3.delete_one(
                                    {
                                        "_id": ObjectId(image_test["card_image_id"]),
                                        "circle": circle_name,
                                    }
                                )
                            dac2.delete_one({"_id": ObjectId(j), "circle": circle_name})
        a1 = dac.update_one(fil, topushin)
        return a1.modified_count

    # End of information board card section #

    def create_information_board_cards_special_precaution_against_deletion(
        information_board_title,
        information_cards_list,
        circle_name,
        preserve_list: list = [],
    ):
        """Create information board cards. Insert ID of the card array which are ids in the circle_information_board_cards collection. \n"""
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
            "Information_Board_Title_And_Subtitle.title": information_board_title,
        }
        # The below code is to create a new list in the Information_Board_Title_And_Subtitle in the exact position of the title.
        topushin = {
            "$set": {
                "Information_Board_Title_And_Subtitle.$.Information_cards": information_cards_list
            }
        }
        # Delete existing list and push the new list.
        r1 = dac.find_one(fil, {"Information_Board_Title_And_Subtitle": 1, "_id": 0})
        print(r1)
        if r1:
            for i in r1["Information_Board_Title_And_Subtitle"]:
                # Check wheater information_cards exists in the list.
                if i["title"] == information_board_title:
                    if "Information_cards" in list(i.keys()):
                        # Delete the existing list. Carefully.
                        for j in i["Information_cards"]:
                            if j in preserve_list:
                                continue
                            nullifier = deleters.nullify_all_post_support_and_reject(
                                j, circle_name, "profile_card"
                            )
                            dac2 = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
                            image_test = dac2.find_one(
                                {"_id": ObjectId(j), "circle": circle_name},
                                {"card_image_id": 1, "_id": 0},
                            )
                            if image_test:
                                dac3 = dab["BASE64_IMAGES"]
                                dac3.delete_one(
                                    {
                                        "_id": ObjectId(image_test["card_image_id"]),
                                        "circle": circle_name,
                                    }
                                )
                            dac2.delete_one({"_id": ObjectId(j), "circle": circle_name})
        print(topushin)
        print(fil)
        a1 = dac.update_one(fil, topushin)
        return a1.modified_count

    def create_title_and_subtitle(
        title: str, subtitle: str, circle_name: str, user_token_details_dict: dict
    ):
        """Insert title and subtitle into the database.\n"""
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
        }
        topushin = {
            "title": title,
            "subtitle": subtitle,
        }
        # If the title already exists, Return False.
        fil2 = {
            "DisplayName": circle_name,
            "Information_Board_Title_And_Subtitle.title": title,
        }
        if dac.find_one(fil2):
            return False
        # Push the topushin into the a1["Information_Board_Title_And_Subtitle"] which is a list.
        a1 = dac.update_one(
            fil, {"$pull": {"Information_Board_Title_And_Subtitle": topushin}}
        )
        a1 = dac.update_one(
            fil, {"$push": {"Information_Board_Title_And_Subtitle": topushin}}
        )
        return a1.modified_count

    #################### THIS SHOULD NOT BE HERE#########################################
    # Go to deleters.
    #################### THIS SHOULD NOT BE HERE#########################################

    def create_reply_comment_in_a_circle_post(
        comment_data: dict,
        user_token_details_dict: dict,
        circle_name: str,
        post_id: str,
        comment_id: str,
    ):
        """Insert comment details into the database.\n"""
        # verify if the post exists.
        assert get.verify_if_post_exists(post_id, circle_name, "POST")
        assert get.verify_if_post_supports_comments_or_supports(
            post_id, circle_name, "supports_comments"
        )
        assert get.verify_if_post_supports_comments_or_supports(
            post_id, circle_name, "supports_comments"
        )
        dac = dab["POSTS"]
        comment_data["CreatedAt"] = datetime.datetime.now()
        comment_data["user"] = user_token_details_dict["UserEmail"]
        comment_data["parent_post_id"] = post_id
        comment_data["circle"] = circle_name
        comment_data["type"] = "REPLY_COMMENT"
        comment_data["html_content"] = comment_data["html_content"]
        comment_data["parent_comment_id"] = comment_id
        assert get.verify_if_post_exists(
            comment_id, circle_name, {"$in": ["COMMENT", "REPLY_COMMENT"]}
        )
        a1 = dac.insert_one(comment_data)
        updates.update_post_to_add_or_remove_comment_count(post_id, circle_name, "add")
        return str(a1.inserted_id)

    def reject_post(
        post_id: str, circle_name: str, user_token_details_dict: dict, post_type: str
    ):
        """Insert post details into the database.\n"""
        # Check if post already exists.
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": post_id,
            "user": user_token_details_dict["UserEmail"],
            "circle": circle_name,
            "post_type": post_type,
        }
        assert get.verify_if_post_exists(post_id, circle_name, post_type)
        if post_type in ["POST", "COMMENT", "REPLY_COMMENT"]:
            assert get.verify_if_post_supports_comments_or_supports(
                post_id, circle_name, "supports_supports_rejects"
            )
        v1 = get.verify_if_user_supports_or_rejects_post_by_email(
            post_id, circle_name, user_token_details_dict["UserEmail"], post_type
        )
        if v1 == False:
            return True
        elif v1 == True:
            fil["type"] = "post_supporters"
            dac.delete_one(fil)
            fil["type"] = "post_rejectors"
            a1 = dac.insert_one(fil)
            updates.update_post_to_add_support_or_reject(
                post_id, circle_name, post_type, "reject", "add_and_remove"
            )
        elif v1 == None:
            fil["type"] = "post_rejectors"
            a1 = dac.insert_one(fil)
            updates.update_post_to_add_support_or_reject(
                post_id, circle_name, post_type, "reject", "add"
            )
        if a1:
            return True

    def support_post(
        post_id: str, circle_name: str, user_token_details_dict: dict, post_type: str
    ):
        """Insert post details into the database.\n"""
        # Check if post already exists.
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": post_id,
            "user": user_token_details_dict["UserEmail"],
            "circle": circle_name,
            "post_type": post_type,
        }
        assert get.verify_if_post_exists(post_id, circle_name, post_type)
        if post_type in ["POST", "COMMENT", "REPLY_COMMENT"]:
            assert get.verify_if_post_supports_comments_or_supports(
                post_id, circle_name, "supports_supports_rejects"
            )
        v1 = get.verify_if_user_supports_or_rejects_post_by_email(
            post_id, circle_name, user_token_details_dict["UserEmail"], post_type
        )
        if v1 == False:
            fil["type"] = "post_rejectors"
            dac.delete_one(fil)
            fil["type"] = "post_supporters"
            a1 = dac.insert_one(fil)
            updates.update_post_to_add_support_or_reject(
                post_id, circle_name, post_type, "support", "add_and_remove"
            )
        elif v1 == True:
            return True
        elif v1 == None:
            fil["type"] = "post_supporters"
            a1 = dac.insert_one(fil)
            updates.update_post_to_add_support_or_reject(
                post_id, circle_name, post_type, "support", "add"
            )
        if a1:
            return True

    def nullify_post_support_and_reject(
        post_id: str, circle_name: str, user_token_details_dict: dict, post_type: str
    ):
        """Insert post details into the database.\n"""
        # Check if post already exists.
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": post_id,
            "user": user_token_details_dict["UserEmail"],
            "circle": circle_name,
            "post_type": post_type,
        }
        assert get.verify_if_post_exists(post_id, circle_name, post_type)
        v1 = get.verify_if_user_supports_or_rejects_post_by_email(
            post_id, circle_name, user_token_details_dict["UserEmail"], post_type
        )
        if v1 == None:
            return True
        elif v1 == True:
            fil["type"] = "post_supporters"
            dac.delete_one(fil)
            updates.update_post_to_add_support_or_reject(
                post_id, circle_name, post_type, "support", "remove"
            )
            return True
        elif v1 == False:
            fil["type"] = "post_rejectors"
            dac.delete_one(fil)
            updates.update_post_to_add_support_or_reject(
                post_id, circle_name, post_type, "reject", "remove"
            )
            return True

    def create_survey_vote(
        post_id: str,
        circle_name: str,
        user_token_details_dict: dict,
        option_details: str,
    ):
        """Insert survey vote details into the database.\n"""
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": post_id,
            "user": user_token_details_dict["UserEmail"],
            "circle": circle_name,
            "type": "survey_vote",
        }
        assert get.verify_if_post_exists(post_id, circle_name, "POST")
        deleters.nullify_specific_type_of_a_post_in_post_metadata(
            post_id, circle_name, "survey_vote", user_token_details_dict["UserEmail"]
        )
        fil["option_details"] = option_details
        r1 = dac.insert_one(fil)
        if r1.acknowledged:
            return True
        return False
        # Nullify any previous vote.

    def create_follower(
        user_token_details_dict: dict,
        postID: str,
        circle_name: str,
        type_of_follower: str,
    ):
        """Insert follower details into the database.\n"""
        dac = dab["POST_METADATA"]
        # Check if post already exists.
        if dac.find_one(
            {
                "user": user_token_details_dict["UserEmail"],
                "PostId": postID,
                "circle": circle_name,
                "type": type_of_follower,
            }
        ):
            return False
        else:
            a1 = dac.insert_one(
                {
                    "user": user_token_details_dict["UserEmail"],
                    "PostId": postID,
                    "circle": circle_name,
                    "type": type_of_follower,
                }
            )
            return str(a1.inserted_id)

    def create_post_in_a_circle(post_data: dict, user_token_details_dict: dict):
        """Insert post details into the database.\n"""
        dac = dab["POSTS"]
        # Check if post already exists.
        post_data["CreatedAt"] = datetime.datetime.now()
        if dac.find_one({"Title": post_data["title"]}):
            return False
        else:
            a1 = dac.insert_one(post_data)
            return str(a1.inserted_id)

    def create_comment_in_a_circle_post(
        comment_data: dict,
        user_token_details_dict: dict,
        circle_name: str,
        post_id: str,
    ):
        """Insert comment details into the database.\n"""
        # verify if the post exists.
        assert get.verify_if_post_exists(post_id, circle_name, "POST")
        assert get.verify_if_post_supports_comments_or_supports(
            post_id, circle_name, "supports_comments"
        )
        dac = dab["POSTS"]
        comment_data["CreatedAt"] = datetime.datetime.now()
        comment_data["user"] = user_token_details_dict["UserEmail"]
        comment_data["parent_post_id"] = post_id
        comment_data["circle"] = circle_name
        comment_data["type"] = "COMMENT"
        comment_data["html_content"] = comment_data["html_content"]
        a1 = dac.insert_one(comment_data)
        updates.update_post_to_add_or_remove_comment_count(post_id, circle_name, "add")
        return str(a1.inserted_id)

    def create_pdf_tags_in_a_post(
        post_id: str, pdf_tags: dict, user_token_details_dict: dict
    ):
        """Insert pdf tags into the database.\n"""
        dac = dab["POSTS_ATTACHMENTS_STORE"]
        # Check if post already exists.
        fil = {
            "PostId": post_id,
            "user": user_token_details_dict["UserEmail"],
            "type": "pdf",
            "title": pdf_tags["title"],
        }
        pdf_tags["user"] = user_token_details_dict["UserEmail"]
        pdf_tags["PostId"] = post_id
        if dac.find_one(fil):
            return True
        else:
            a1 = dac.insert_one(pdf_tags)
            return str(a1.inserted_id)

    def create_image_tags_in_a_post(
        post_id: str, image_tags: dict, user_token_details_dict: dict
    ):
        """Insert image tags into the database.\n"""
        dac = dab["POSTS_ATTACHMENTS_STORE"]
        # Check if post already exists.
        fil = {
            "PostId": post_id,
            "user": user_token_details_dict["UserEmail"],
            "type": "image",
            "title": image_tags["title"],
        }
        image_tags["user"] = user_token_details_dict["UserEmail"]
        image_tags["PostId"] = post_id
        if dac.find_one(fil):
            return True
        else:
            a1 = dac.insert_one(image_tags)
            return str(a1.inserted_id)

    def basic_register_user(user_info: dict):
        """Insert user details into the database.\n
        Example:\n
        user_info={UserEmail:a1@gmail.com,\n
                   UserPassword:123456,\n
                   UserAgreement: Yes.
                   Powers:[]
                   }"""
        dac = dab["USER_DETAILS"]
        user_info["UserPassword"] = sha512(
            user_info["UserPassword"].encode()
        ).hexdigest()
        # Check if user already exists.
        if dac.find_one({"UserEmail": user_info["UserEmail"]}):
            return False
        a1 = dac.insert_one(user_info)
        return a1.inserted_id

    def token_creation(user_info: dict):
        """Insert user data into token database and generate token.\n"""
        dac = dab["SESSION_TOKENS"]
        # count user tokens.
        user_info["CreatedAt"] = datetime.datetime.now()
        coutable = dac.find({"UserEmail": user_info["UserEmail"]})
        counter = 0
        for i in coutable:
            counter += 1
        if counter > 4:
            dac.delete_one({"UserEmail": user_info["UserEmail"]})
        t1 = dac.insert_one(user_info)
        t1 = {"Token": str(t1.inserted_id)}
        t1 = enco(json.dumps(t1))
        return t1

    def anonymous_token_creation(flask_session, circle_name):
        """Insert user data into token database and generate token.\n"""
        dac = dab["SESSION_TOKENS"]
        # count user tokens.
        # Check if the circle is publicly available.
        dac2 = dab["CIRCLES"]
        fil = {"DisplayName": circle_name}
        ret2 = {"_id": 0, "Publicly_Available": 1}
        r1 = dac2.find_one(fil, ret2)
        if not r1 or r1["Publicly_Available"] != "Yes":
            raise Exception("Circle is not publicly available.")
        user_info = {
            "DisplayName": "Anonymous",
            "UserEmail": "Anonymous@galam.in",
            "startup_screen": "No",
            "Powers": ["get_posts_multi_filter_personal_user"],
            "Circles": [
                {
                    "DisplayName": circle_name,
                    "Powers": [
                        "get_circle_statistics",
                        "get_all_flair_tags_for_editor",
                        "get_information_board_title_and_subtitle",
                        "get_pictures_from_mongodb",
                        "get_information_and_announcement_board",
                        "get_pictures_from_mongodb_for_single_post",
                        "get_posts_multi_filter",
                        "get_flair_tags_for_editor",
                        "get_all_flair_tags",
                        "get_comments",
                        "find_circles",
                    ],
                    "Role": "Anonymous",
                }
            ],
        }
        user_info["CreatedAt"] = datetime.datetime.now()
        user_info["expires_time"] = datetime.datetime.utcnow()
        t1 = dac.insert_one(user_info)
        t1 = {"Token": str(t1.inserted_id)}
        t1 = enco(json.dumps(t1))
        # Clear session of Top_Secret_Token
        # flask.session.pop("Top_Secret_Token", None)
        flask_session["Top_Secret_Token"] = t1
        # Make it secure and not accessible by Javascript. And must be from the same origin.
        return user_info, t1

    def circle_creation(circle_info: dict):
        """Insert circle details into the database.\n
        Example:\n
        circle_info={DisplayName:circle1,\n
                     Description:This is a circle,\n
                     Tags:[tag1,tag2,tag3],\n
                     CreatedBy:
                        }"""
        dac = dab["CIRCLES"]
        # Check if circle already exists.
        if dac.find_one({"DisplayName": circle_info["DisplayName"]}):
            return False
        else:
            a1 = dac.insert_one(circle_info)
            return a1.inserted_id


class get:
    def get_all_subscription_objects_for_a_user(user_email: str):
        """Get all subscription objects for a user.\n"""
        dac = dab["NOTIFICATIONS_SUBSCRIPTIONS"]
        fil = {"UserEmail": user_email}
        ret = {"subscription_info": 1, "_id": 0}
        f1 = dac.find(fil, ret)
        r1 = []
        for i in f1:
            r1.append(i["subscription_info"])
        return r1

    def get_custom_configs_type(data_type: str):
        dac = dab["CONFIGS"]
        fil = {"type": data_type}
        ret = {"_id": 0}
        f1 = dac.find_one(fil, ret)
        return f1

    def get_circle_configs():
        """Get circle configs.\n"""
        dac = dab["CONFIGS"]
        fil = {"type": "circle_creation_configs"}
        ret = {"_id": 0}
        f1 = dac.find_one(fil, ret)
        return f1

    def get_circle_statistics(circle_name: str, filter_string: str = None):
        """Get circle statistics.\n
        Keyword arguments: \n
        circle_name -- Name of the circle.\n
        filter_string -- Filter string. ultra_basic, very_basic, basic and advanced\n
        Returns: \n
        Get the Number of current users by role.\n
        Get the Number of posts and comments in the past 24 hours.\n
        Get the Total NUmber of Support and reject for posts and comments in the past 24 hours.\n
        """
        # Maake an aggregate call, to get the number of users by role. The data structure is:
        # [{
        #     "role": "role_name":
        #     "noofposts": 0,
        #     "noofcomments": 0,
        #     "noofcomment_replies": 0,
        #     "noofsupport": 0,
        #     "noofreject": 0,
        #     "noofusers": 0,
        #     "lifetime_noofposts_timestamps": [],
        #     "lifetime_noofcomments_timestamps": [],
        #     "lifetime_noofcomment_replies_timestamps": [],
        #     "lifetime_noofsupport_timestamps": [],
        #     "lifetime_noofreject_timestamps": [],
        #     "lifetime_noofusers_timestamps": [],
        #     "lifetime_noofimages_timestamps": [],
        #     "lifetime_noofpdfs_timestamps": [],
        #     "lifetime_power_usage_timestamps": [
        #    {
        #       "power": "power_name",
        #      "noofusages": 0,
        #  }
        # ], -- Not implemented yet.
        # }]
        # F
        # In basic, do not provide lifetime data.
        # In advanced, provide lifetime data in addition to the basic data.
        # In very basic, provide only the number of users by role and total number by calculating the length of the array.
        # In ultra basic, provide only the number of users and alltime users from the circle.
        dac1 = dab["CIRCLES"]
        dac2 = dab["USER_DETAILS"]
        dac3 = dab["POSTS"]
        dac4 = dab["POST_METADATA"]
        dac5 = dab["POSTS_ATTACHMENTS_STORE"]
        print("ultra_basic")
        if filter_string == "ultra_basic":
            ret1 = {
                "Current_Members": 1,
                "All_Time_Member_Traffic": 1,
                "Description": 1,
                "_id": 0,
            }
            print("ultra_basic")
            returns = dac1.find_one({"DisplayName": circle_name}, ret1)
            print(returns)
            return returns
        # ########### Need to implement this. ##############
        # ########## Need to implement this. ###############
        return False

    def get_all_circle_roles(circle_name: str):
        """
        Get all circle roles in a circle.\n
        The output is a list of roles.
        """
        dac = dab["CIRCLES"]
        dac2 = dab["CONFIGS"]
        powers_dict = dac2.find_one(
            {"type": "translation_of_powers_to_description"},
            {"circle_powers_to_description_translation": 1, "_id": 0},
        )
        fil = {"DisplayName": circle_name}
        ret = {
            "Roles": 1,
            "Roles_List": 1,
            "Default_Role": 1,
            "Default_Role_For_Verified_Users": 1,
            "_id": 0,
        }
        f1 = dac.find_one(fil, ret)
        for i in f1["Roles"]:
            power_list = common_mains.find_the_appropriate_description_for_powers(
                powers_dict["circle_powers_to_description_translation"],
                f1["Roles"][i]["Role_Powers"],
            )
            f1["Roles"][i]["Role_Powers"] = power_list

        return f1

    ################################################## More customization is possible in this section. ##################################################
    def get_user_details_by_DisplayName_and_circle_name(
        DisplayName: str, circle_name: str
    ):
        """Get a user details.\n
        Keyword arguments:
        DisplayName -- Display name of the user.
        circle_name -- Name of the circle.
        Return: return_description
        """
        dac = dab["USER_DETAILS"]
        DisplayName = escape(DisplayName)
        fil = {
            "DisplayName": {"$regex": DisplayName, "$options": "i"},
            "Circles.DisplayName": circle_name,
        }
        ret = {
            "DisplayName": 1,
            "UserEmail": 1,
            "Circles.$": 1,
        }
        f2 = dac.find(fil, ret).limit(10)
        let_dat = []
        power_to_description_translator = (
            get.get_translation_of_power_to_description_for_circle_from_configs()
        )
        for f1 in f2:
            final_dat = {}
            final_dat["DisplayName"] = f1["DisplayName"]
            final_dat["userid"] = enco(f1["UserEmail"])
            final_dat[
                "circle_powers"
            ] = common_mains.find_the_appropriate_description_for_powers(
                power_to_description_translator, f1["Circles"][0]["Powers"]
            )
            final_dat["circle_role"] = f1["Circles"][0]["Role"]
            final_dat["circle_display_name"] = f1["Circles"][0]["DisplayName"]
            let_dat.append(final_dat)
        return let_dat

    def get_reported_posts_by_content(html_content: str, circle: str):
        """Get reported posts by content.\n
        Keyword arguments:
        html_content -- Content of the post.
        Return: return_description
        """
        dac = dab["REPORTS"]
        html_content = escape(html_content)
        fil = {
            "html_content": {"$regex": html_content, "$options": "i"},
            "first_report": "Yes",
        }
        a1 = dac.find(fil).limit(40)
        final_array = []
        for i in a1:
            final_dat = {}
            real_post_details = get.get_any_type_single_post_details_from_POSTS(
                i["circle"], i["post_id"], i["post_type"]
            )
            post_type = i["post_type"]
            final_dat["number_of_reports"] = str(
                dac.count_documents(
                    {"circle": circle, "post_type": post_type, "post_id": i["post_id"]},
                    {"_id": 0},
                )
            )
            final_dat["reasons"] = get.get_report_reasons(
                circle, i["post_id"], post_type
            )
            # So as to capture the content at the time of reporting.
            final_dat["html_content"] = i["html_content"]
            final_dat["poster_displayname"] = i["poster_displayname"]
            final_dat["post_type"] = i["post_type"]
            final_dat["post_id"] = i["post_id"]
            if (
                real_post_details["isClosed"] == "Yes"
                and real_post_details["isVisible"] == "Yes"
            ):
                final_dat["current_status"] = "Closed but visible"
            elif (
                real_post_details["isClosed"] == "Yes"
                and real_post_details["isVisible"] == "No"
            ):
                final_dat["current_status"] = "Deleted"
            elif (
                real_post_details["isClosed"] == "No"
                and real_post_details["isVisible"] == "Yes"
            ):
                final_dat["current_status"] = "Open"
            time_difference = datetime.datetime.now() - i["posted_on"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["posted_on"].strftime("%d %b %Y")
            final_dat["time_difference"] = time_difference
            if "url" in list(i.keys()):
                final_dat["url"] = i["url"]
            final_array.append(final_dat)
        return final_array

    def get_pure_circle_details_without_images(circle_name: str):
        """Get pure circle details without images.\n
        Keyword arguments:
        circle_name -- Name of the circle.
        Return: return_description
        """
        dac = dab["CIRCLES"]
        fil = {"DisplayName": circle_name}
        ret = {"CircleImage": 0, "Information_Board_Title_And_Subtitle": 0, "_id": 0}
        f1 = dac.find_one(fil, ret)
        return f1

    def get_multiple_circle_card_details(circle_name: str, skip: int = 0):
        """Get circle card details.\n
        Keyword arguments:
        circle_name -- Name of the circle.
        Return: return_description
        """
        dac = dab["CIRCLES"]
        # Regex filter is case insensitive.
        circle_name = escape(circle_name)
        fil = {"DisplayName": {"$regex": circle_name, "$options": "i"}}

        # In fil2 search for the same using regex but add related ccircles and tags in OR.
        fil2 = {
            "$or": [
                {"DisplayName": {"$regex": circle_name, "$options": "i"}},
                {"Circle_Tags": circle_name},
                {"Related_Circles": circle_name},
            ]
        }
        ret = {
            "DisplayName": 1,
            "CircleImage": 1,
            "Description": 1,
            "Circle_Tags": 1,
            "Related_Circles": 1,
        }
        circles_array = []
        f1 = dac.find(fil2, ret).skip(skip).limit(10)
        for i in f1:
            del i["_id"]
            circles_array.append(i)
        return circles_array

    def get_circle_users_details(circle_name: str, skip: int = 0):
        """Get users in a circle.\n
        Keyword arguments:
        circle_name -- Name of the circle.
        Return: return_description
        """
        dac = dab["USER_DETAILS"]
        fil = {"Circles.DisplayName": circle_name}
        ret = {
            "DisplayName": 1,
            "UserEmail": 1,
            "Circles.$": 1,
        }
        f1 = dac.find(fil, ret).skip(skip).limit(10)
        let_dat = []
        power_to_description_translator = (
            get.get_translation_of_power_to_description_for_circle_from_configs()
        )
        for i in f1:
            final_dat = {}
            final_dat["DisplayName"] = i["DisplayName"]
            final_dat["userid"] = enco(i["UserEmail"])
            final_dat[
                "circle_powers"
            ] = common_mains.find_the_appropriate_description_for_powers(
                power_to_description_translator, i["Circles"][0]["Powers"]
            )
            if (
                "create_comment_reply" not in i["Circles"][0]["Powers"]
                and "create_comment" not in i["Circles"][0]["Powers"]
                and "create_post" not in i["Circles"][0]["Powers"]
                and "update_comment_post_reply" not in i["Circles"][0]["Powers"]
            ):
                final_dat["Muted"] = "Yes"
            final_dat["circle_role"] = i["Circles"][0]["Role"]
            final_dat["circle_display_name"] = i["Circles"][0]["DisplayName"]
            let_dat.append(final_dat)
        return let_dat

    ################################################## More customization is possible in this section. ##################################################

    def get_posts_in_a_circle_search_engine(
        circle_name: str,
        search_query: str,
        filter: str,
        skip: int = 0,
        parent_post_id: str = None,
    ):
        """Get posts in a circle.\n
        Keyword arguments:
        circle_name -- Name of the circle.
        search_query -- Search query.
        filter -- Filter.
        Return: return_description
        """
        dac = dab["POSTS"]
        search_query = escape(search_query)
        if filter == "POST":
            fil = {
                "circle": circle_name,
                "type": filter,
                "isVisible": "Yes",
                # The regesx search query is case insensitive. It needs to match with any part of the string. It needs to be fast.
                "title": {"$regex": search_query, "$options": "i"},
            }
        elif filter == "COMMENT":
            fil = {
                "circle": circle_name,
                "type": filter,
                "isVisible": "Yes",
                # "parent_post_id":parent_post_id,
                "html_content": {"$regex": search_query, "$options": "i"},
            }
        # ({"circle":"Telangana","type":"COMMENT","html_content":{"$regex":"^Ma","$options":"i"}})
        re2 = []
        r1 = (
            dac.find(
                fil,
                {
                    "circle": 1,
                    "_id": 1,
                    "title": 1,
                    "html_content": 1,
                    "flair_tags": 1,
                    "CreatedAt": 1,
                    "type": 1,
                    "Creator_Role": 1,
                    "Creator_Symbol": 1,
                    "parent_post_id": 1,
                    "isVisible": 1,
                    "isClosed": 1,
                    "user": 1,
                },
            )
            .sort("CreatedAt", -1)
            .skip(skip)
            .limit(10)
        )
        for i in r1:
            i["sid"] = str(i["_id"])
            user_details = get.get_user_details_by_email(i["user"])
            i["CreatorName"] = user_details["DisplayName"]
            i["numberofcomments"] = get.count_number_of_comments_and_replies_to_a_post(
                circle_name, i["sid"]
            )
            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["CreatedAt"].strftime("%d %b %Y")
            i["time_difference"] = time_difference
            del i["_id"]
            del i["user"]
            re2.append(i)
        return re2

    def get_followers_of_a_post(post_id: str, follow_type: str, circle_name: str):
        """Get followers of a post.\n
        Keyword arguments:
        post_id -- Id of the post.
        circle_name -- Name of the circle.
        Return: return_description
        """
        dac = dab["POST_METADATA"]
        fil = {"PostId": post_id, "circle": circle_name, "type": follow_type}
        re2 = []
        r1 = dac.find(fil, {"user": 1, "_id": 0})
        for i in r1:
            re2.append(i["user"])
        return re2

    def verify_if_user_voted_in_a_survey(
        post_id: str, circle_name: str, user_email: str
    ):
        """Verify if user voted in a survey.\n

        Keyword arguments:
        argument --
        post_id -- Id of the post.
        circle_name -- Name of the circle.
        user_email -- Email of the user.
        Return:
        True if user voted.
        False if user did not vote.
        """
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": post_id,
            "circle": circle_name,
            "user": user_email,
            "type": "survey_vote",
        }
        r1 = dac.find_one(fil, {"option_details": 1, "_id": 0})
        if r1:
            return r1["option_details"]
        else:
            return False

    def count_survey_stats(post_id: str, circle_name: str, all_options: list):
        """Count survey stats.\n
        and return the stats in a dictionary.
        In percentage. You are expected to provide all_options."""
        dac = dab["POST_METADATA"]
        fil = {"PostId": post_id, "circle": circle_name, "type": "survey_vote"}
        ret = {"option_details": 1, "_id": 0}
        r1 = dac.find(fil, ret)
        total_votes = 0
        return_dict = {}
        for option in all_options:
            return_dict[option] = 0
        for i in r1:
            # Each i has an option_details array. Which counts as a vote to that option.
            # So we make a dict with keys being that option and values being the number of votes/total_votes.
            total_votes += 1
            return_dict[i["option_details"]] += 1
        return_dict2 = return_dict.copy()
        for i in return_dict:
            return_dict[i] = (return_dict[i] / total_votes) * 100
            return_dict2[i] = return_dict2[i]
        return [return_dict, return_dict2, total_votes]

    def count_total_number_of_user_notifications(user_email: str):
        """Get total count of user notifications.\n
        Keyword arguments:
        user_email -- Email of the user.
        Return: return_description
        """
        dac = dab["NOTIFICATIONS"]
        fil = {"user": user_email, "seen": "No"}
        return dac.count_documents(fil, {})

    def get_user_notifications(user_email: str, skip: int = 0):
        """Get user notifications.\n
        Keyword arguments:
        user_email -- Email of the user.
        Return: return_description
        """
        dac = dab["NOTIFICATIONS"]
        fil = {"user": user_email}
        re2 = []
        r1 = dac.find(fil).sort("CreatedAt", -1).skip(skip).limit(10)
        for i in r1:
            i["sid"] = str(i["_id"])
            i["timestamp"] = str(i["CreatedAt"])
            # Calculate time difference and make it look good.
            current_time = datetime.datetime.now()
            time_difference = current_time - i["CreatedAt"]
            if time_difference.days > 0:
                i["time_difference"] = str(time_difference.days) + " days ago"
            elif time_difference.seconds > 3600:
                i["time_difference"] = (
                    str(time_difference.seconds // 3600) + " hours ago"
                )
            elif time_difference.seconds > 60:
                i["time_difference"] = (
                    str(time_difference.seconds // 60) + " minutes ago"
                )
            else:
                i["time_difference"] = str(time_difference.seconds) + " seconds ago"

            del i["_id"]
            del i["user"]
            re2.append(i)
        return re2

    def get_special_unread_notifications_for_sse(user_email: str):
        """Get user notifications.\n
        Keyword arguments:
        user_email -- Email of the user.
        Return: return_description
        """
        dac = dab["NOTIFICATIONS"]
        fil = {"user": user_email, "seen": "No"}
        re2 = []
        r1 = dac.find(fil).sort("CreatedAt", -1)
        for i in r1:
            i["sid"] = str(i["_id"])
            i["timestamp"] = str(i["CreatedAt"])
            # Calculate time difference and make it look good.
            current_time = datetime.datetime.now()
            time_difference = current_time - i["CreatedAt"]
            if time_difference.days > 0:
                i["time_difference"] = str(time_difference.days) + " days ago"
            elif time_difference.seconds > 3600:
                i["time_difference"] = (
                    str(time_difference.seconds // 3600) + " hours ago"
                )
            elif time_difference.seconds > 60:
                i["time_difference"] = (
                    str(time_difference.seconds // 60) + " minutes ago"
                )
            else:
                i["time_difference"] = str(time_difference.seconds) + " seconds ago"

            del i["_id"]
            del i["user"]
            re2.append(i)
        return re2

    def get_post_owner_email_from_id(circle_name: str, post_id: str):
        """Get post owner email from id.\n
        Keyword arguments:
        circle_name -- Name of the circle.
        post_id -- Id of the post.
        Return: return_description
        """
        dac = dab["POSTS"]
        fil = {"circle": circle_name, "_id": ObjectId(post_id)}
        r1 = dac.find_one(fil, {"user": 1, "_id": 0})
        if r1:
            return r1["user"]
        else:
            return False

    def get_base64_image_from_a_circle(id: str, circle_name: str):
        """Get base64 image from a circle.\n
        Keyword arguments:
        id -- Id of the image.
        circle_name -- Name of the circle.
        Return: return_description
        """
        dac = dab["BASE64_IMAGES"]
        r1 = dac.find_one({"_id": ObjectId(id), "circle": circle_name})["base64"]
        if r1:
            return r1
        else:
            return False

    def get_base64_image_from_a_circle_post(circle_name: str, post_id: str):
        """Get base64 image from a circle post.\n
        Keyword arguments:
        id -- Id of the image.
        circle_name -- Name of the circle.
        post_id -- Id of the post.
        Return: return_description
        """
        dac = dab["POSTS_ATTACHMENTS_STORE"]
        r1 = dac.find_one({"circle": circle_name, "_id": ObjectId(post_id)})
        if r1:
            return r1
        else:
            return False

    def get_replies_in_a_circle_post(
        circle_name: str,
        post_id: str,
        UserDetails: dict,
        skip: int = 0,
        comment_id=None,
    ):
        """Get replies for a post in a circle.\n
          This may include comments and so on.\n
          NOTE: This function is not yet complete.
                And needs to be updated.\n
        Keyword arguments:
        circle_name -- Name of the circle.
        post_id -- Id of the post.
        UserDetails -- User details. (Optional)
        skip -- Number of comments to skip. (Optional)
        comment_id -- Id of the comment. (Optional)
        Return: return_description
        """
        dac = dab["POSTS"]
        return_list = []
        fil = {
            "circle": circle_name,
            "parent_post_id": post_id,
            "parent_comment_id": comment_id,
            "isVisible": "Yes",
            "type": "REPLY_COMMENT",
        }
        g1 = dac.find(fil).sort("CreatedAt", 1)
        for i in g1:
            i["sid"] = str(i["_id"])
            i["Anonymous"] = "Yes"
            replies_list = get.count_number_of_replies_to_a_comment(
                circle_name, "REPLY_COMMENT", post_id, i["sid"]
            )
            if replies_list:
                i["replies"] = str(replies_list)
            else:
                i["replies"] = "No"
            srcounters = get.get_number_of_supports_or_rejects_for_a_post(
                i["sid"], circle_name, "REPLY_COMMENT"
            )
            i["Supports"] = str(srcounters[0])
            i["Rejects"] = str(srcounters[1])
            if UserDetails:
                i["Anonymous"] = "No"
                if i["user"] == UserDetails["UserEmail"]:
                    i["Self"] = "Yes"
                else:
                    i["Self"] = "No"
                k1 = get.verify_if_user_supports_or_rejects_post_by_email(
                    i["sid"], circle_name, UserDetails["UserEmail"], "REPLY_COMMENT"
                )
                if k1 == True:
                    i["Supported"] = "Yes"
                    i["Rejected"] = "No"
                elif k1 == False:
                    i["Rejected"] = "Yes"
                    i["Supported"] = "No"
                else:
                    i["Rejected"] = "No"
                    i["Supported"] = "No"
            i["creatorID"] = enco(i["user"])
            i["CreatorName"] = get.get_user_details_by_email(i["user"])["DisplayName"]

            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["CreatedAt"].strftime("%d %b %Y")
            i["time_difference"] = time_difference
            del i["user"]
            del i["_id"]
            return_list.append(i)
        return return_list

    def get_comments_in_a_circle_post(
        circle_name: str,
        post_id: str,
        UserDetails: dict = None,
        skip: int = 0,
        comment_id=None,
        flask_context=None,
    ):
        """Get comments for a post in a circle.\n
          This may include comments and so on.\n
          NOTE: This function is not yet complete.
                And needs to be updated.\n

        Keyword arguments:
        circle_name -- Name of the circle.
        post_id -- Id of the post.
        UserDetails -- User details. (Optional)
        skip -- Number of comments to skip. (Optional)
        comment_id -- Id of the comment. (Optional)
        flask_context -- Flask context-Basically url_for function. (Optional)
        Return: return_description
        """
        dac = dab["POSTS"]
        return_list = []

        fil = {
            "circle": circle_name,
            "parent_post_id": post_id,
            "isVisible": "Yes",
            "type": "COMMENT",
        }

        def image_maker(post_id):
            attachhment_details = (
                get.get_all_images_and_PDFs_in_a_single_post_in_a_cricle_as_array(
                    circle_name, post_id
                )
            )
            for i in attachhment_details["images"]:
                i_index = attachhment_details["images"].index(i)
                image_url = flask_context(
                    "get_pictures_from_mongodb_for_single_post",
                    circlename=circle_name,
                    image_id=i,
                )
                attachhment_details["images"].remove(i)
                attachhment_details["images"].insert(i_index, image_url)
                print(attachhment_details["images"])
            for i in attachhment_details["pdfs"]:
                i_index = attachhment_details["pdfs"].index(i)
                image_url = flask_context(
                    "get_pictures_from_mongodb_for_single_post",
                    circlename=circle_name,
                    image_id=i,
                )
                attachhment_details["pdfs"].remove(i)
                attachhment_details["pdfs"].insert(i_index, image_url)
            return attachhment_details

        if comment_id:
            fil["_id"] = ObjectId(comment_id)
            # fil["type"] can be both COMMENT and REPLY_COMMENT.
            # So, we need to delete it and make a fil for both.
            fil["type"] = {"$in": ["COMMENT", "REPLY_COMMENT"]}
            g1 = dac.find_one(fil)
            g1 = [g1]
        else:
            g1 = dac.find(fil).sort("CreatedAt", 1).skip(skip).limit(10)
        for i in g1:
            i["sid"] = str(i["_id"])
            i["Anonymous"] = "Yes"
            replies_list = get.count_number_of_replies_to_a_comment(
                circle_name, "REPLY_COMMENT", post_id, i["sid"]
            )
            if replies_list:
                i["replies"] = str(replies_list)
            else:
                i["replies"] = "No"
            srcounters = get.get_number_of_supports_or_rejects_for_a_post(
                i["sid"], circle_name, {"$in": ["COMMENT", "REPLY_COMMENT"]}
            )
            i["Supports"] = str(srcounters[0])
            i["Rejects"] = str(srcounters[1])
            if UserDetails:
                i["Anonymous"] = "No"
                if i["user"] == UserDetails["UserEmail"]:
                    i["Self"] = "Yes"
                else:
                    i["Self"] = "No"
                k1 = get.verify_if_user_supports_or_rejects_post_by_email(
                    i["sid"],
                    circle_name,
                    UserDetails["UserEmail"],
                    {"$in": ["COMMENT", "REPLY_COMMENT"]},
                )
                if k1 == True:
                    i["Supported"] = "Yes"
                    i["Rejected"] = "No"
                elif k1 == False:
                    i["Rejected"] = "Yes"
                    i["Supported"] = "No"
                else:
                    i["Rejected"] = "No"
                    i["Supported"] = "No"
            i["creatorID"] = enco(i["user"])
            Commentor_User_Details = get.get_user_details_by_email(i["user"])
            i["CreatorName"] = Commentor_User_Details["DisplayName"]
            UserRole = i["Creator_Role"]
            i["CreatorRole"] = UserRole
            # time_difference=datetime.datetime.now()-i["CreatedAt"]
            # time_difference=str(time_difference)
            # time_difference=time_difference.split(":")
            # time_difference=time_difference[0]+" hours "+time_difference[1]+" minutes ago"

            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["CreatedAt"].strftime("%d %b %Y")
            i["time_difference"] = time_difference
            i["attachment_store"] = image_maker(i["sid"])
            # i["commentID"]=str(i["_id"])
            del i["user"]
            del i["_id"]
            return_list.append(i)
        return return_list

    def get_all_images_and_PDFs_in_a_single_post_in_a_cricle_as_array(
        circle_name: str, post_id: str
    ):
        """Get all images and PDFs in a single post in a circle.\n
        Example:\n
        circle_name="circle1" """
        dac = dab["POSTS_ATTACHMENTS_STORE"]
        g1 = dac.find(
            {"circle": circle_name, "PostId": post_id}, {"_id": 1, "base64_type": 1}
        )
        image_array = []
        pdf_array = []
        for i in g1:
            if i["base64_type"] == "IMAGE":
                print(i["_id"])
                image_array.append(str(i["_id"]))
            elif i["base64_type"] == "PDF":
                pdf_array.append(str(i["_id"]))
        toreturn = {"images": image_array, "pdfs": pdf_array}
        return toreturn

    def get_private_uncensored_single_post_in_a_circle(
        circle_name: str, post_id: str, type_of_post: str, UserDetails: dict = None
    ):
        dac = dab["POSTS"]
        g1 = dac.find_one(
            {"circle": circle_name, "_id": ObjectId(post_id), "type": type_of_post}
        )
        return g1

    def get_single_post_in_a_circle(
        circle_name: str, post_id: str, UserDetails: dict = None
    ):
        """Get single post in a circle.\n
        Example:\n
        circle_name="circle1" """
        dac = dab["POSTS"]
        g1 = dac.find_one(
            {
                "circle": circle_name,
                "isVisible": "Yes",
                "_id": ObjectId(post_id),
                "type": "POST",
            }
        )
        if g1:
            post_user_details = get.get_user_details_by_email(g1["user"])
            g1["sid"] = str(g1["_id"])
            comment_and_replies_count = (
                get.count_number_of_comments_and_replies_to_a_post(
                    circle_name, g1["sid"]
                )
            )
            if g1["type2"] == "SURVEY":
                survey_voter = get.verify_if_user_voted_in_a_survey(
                    g1["sid"], g1["circle"], UserDetails["UserEmail"]
                )
                if survey_voter:
                    g1["voted"] = survey_voter
                else:
                    g1["voted"] = "No"
            g1["numberofcomments"] = str(comment_and_replies_count)
            g1["CreatorName"] = post_user_details["DisplayName"]
            g1["creatorID"] = enco(g1["user"])
            srcounters = get.get_number_of_supports_or_rejects_for_a_post(
                g1["sid"], circle_name, "POST"
            )
            g1["Supports"] = str(srcounters[0])
            g1["Rejects"] = str(srcounters[1])
            time_difference = datetime.datetime.now() - g1["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = g1["CreatedAt"].strftime("%d %b %Y")
            g1["time_difference"] = time_difference
            if UserDetails:
                if (g1["user"]) == UserDetails["UserEmail"]:
                    g1["Self"] = "Yes"
                else:
                    g1["Self"] = "No"
                if get.verify_if_user_follows_post_by_email(
                    UserDetails["UserEmail"], post_id, circle_name
                ):
                    g1["Following"] = "Yes"
                else:
                    g1["Following"] = "No"
                k1 = get.verify_if_user_supports_or_rejects_post_by_email(
                    post_id, circle_name, UserDetails["UserEmail"], "POST"
                )
                if k1 == True:
                    g1["Supported"] = "Yes"
                    g1["Rejected"] = "No"
                elif k1 == False:
                    g1["Rejected"] = "Yes"
                    g1["Supported"] = "No"
                else:
                    g1["Rejected"] = "No"
                    g1["Supported"] = "No"

            ############# Need to check support or reject #############
            del g1["user"]
            del g1["_id"]
            return g1

        return False

    def get_any_type_single_post_details_from_POSTS(
        circle_name: str, post_id: str, type_of_post: str
    ):
        """Get single post card details.\n
        Example:\n
        circle_name="circle1" """
        dac = dab["POSTS"]
        g1 = dac.find_one(
            {"circle": circle_name, "type": type_of_post, "_id": ObjectId(post_id)}
        )
        if g1:
            poster_display_name = get.get_user_details_by_email(g1["user"])[
                "DisplayName"
            ]
            g1["sid"] = str(g1["_id"])
            g1["userid"] = enco(g1["user"])
            g1["poster_display_name"] = poster_display_name
            del g1["user"]
            del g1["_id"]
            return g1
        else:
            return False

    def get_info_card_details(circle_name: str, postID: str, type_of_post: str):
        """Get profile card of a infocard"""
        dac = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
        g1 = dac.find_one(
            {"circle": circle_name, "type": type_of_post, "_id": ObjectId(postID)}
        )
        if g1:
            return g1
        else:
            return False

    def get_posts_in_a_circle(
        circle_name: str,
        noofposts_currently_existing: int,
        filter: str,
        UserDetails2: dict,
    ):
        """Get posts in a circle.\n
        Example:\n
        circle_name="circle1" """
        dac = dab["POSTS"]
        g1 = (
            dac.find({"circle": circle_name, "type": "POST", "isVisible": "Yes"})
            .limit(10)
            .skip(noofposts_currently_existing)
        )
        g1_list = []
        for i in g1:
            i["sid"] = str(i["_id"])
            srcounters = get.get_number_of_supports_or_rejects_for_a_post(
                i["sid"], circle_name, "POST"
            )
            i["Supports"] = str(srcounters[0])
            i["Rejects"] = str(srcounters[1])
            UserDetails = get.get_user_details_by_email(i["user"])
            UserRole = common_mains.circle_role_getter(
                UserDetails["UserEmail"], circle_name
            )
            i["CreatorRole"] = UserRole
            i["CreatorName"] = UserDetails["DisplayName"]
            i["creatorID"] = enco(i["user"])
            if (i["user"]) == UserDetails["UserEmail"]:
                i["Self"] = "Yes"
            # Calculate the time difference.
            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            time_difference = (
                time_difference[0] + " hours " + time_difference[1] + " minutes ago"
            )
            i["time_difference"] = time_difference
            if get.verify_if_user_follows_post_by_email(
                UserDetails2["UserEmail"], str(i["_id"]), circle_name
            ):
                i["Following"] = "Yes"
            else:
                i["Following"] = "No"
            i["PostId"] = enco(str(i["_id"]))

            del i["_id"]
            del i["user"]
            g1_list.append(i)
        if g1_list:
            return g1_list
        else:
            return False

    def get_posts_in_a_circle_multi_filter(
        circle_name: str,
        noofposts_currently_existing: int,
        filter: list,
        UserDetails2: dict,
        special_active_filter: str = None,
        flask_context: str = None,
    ):
        """get posts in a circle with multiple filters.\n
        Example:\n
        circle_name="circle1"
        filter=["POST","QUESTION"]"""
        dac = dab["POSTS"]
        g1_fil = {
            "circle": circle_name,
            "type": "POST",
            "flair_tags": {"$in": filter},
            "isVisible": "Yes",
        }
        # ######## Conditions Conditions ########
        if filter == []:
            del g1_fil["flair_tags"]
        if special_active_filter == "New":
            # Sort by the latest.
            g1 = (
                dac.find(g1_fil)
                .sort("CreatedAt", -1)
                .skip(noofposts_currently_existing)
                .limit(10)
            )
        elif special_active_filter == "Rising":
            # Get the posts with the most number of supports at the top. The keys to check for is,
            # supporters and rejectors and sum them up. We shall do this by an aggregation pipeline.
            # These should be only from the last 24 hours.
            special_pipeline = [
                {"$match": g1_fil},
                {
                    "$addFields": {
                        "total_supports": {"$sum": ["$supporters", "$rejectors"]}
                    }
                },
                {"$sort": {"total_supports": -1}},
                {"$sort": {"CreatedAt": -1}},
                {"$skip": noofposts_currently_existing},
                {"$limit": 10},
                {"$project": {"total_supports": 0}},
            ]
            g1 = dac.aggregate(special_pipeline)
        elif special_active_filter == "Hot":
            special_pipeline = [
                {"$match": g1_fil},
                {
                    "$addFields": {
                        "total_supports": {"$sum": ["$supporters", "$rejectors"]}
                    }
                },
                {"$sort": {"total_supports": -1}},
                {"$skip": noofposts_currently_existing},
                {"$limit": 10},
                {"$project": {"total_supports": 0}},
            ]
            g1 = dac.aggregate(special_pipeline)

        ############# Conditions Conditions #############
        ############ Safety trigger for infinite loop ############
        g1 = list(g1)
        if g1 == []:
            return False
        ############ Safety trigger for infinite loop ############
        g1_list = []
        id_pins = []

        def image_maker(post_id):
            attachhment_details = (
                get.get_all_images_and_PDFs_in_a_single_post_in_a_cricle_as_array(
                    circle_name, post_id
                )
            )
            for i in attachhment_details["images"]:
                i_index = attachhment_details["images"].index(i)
                image_url = flask_context(
                    "get_pictures_from_mongodb_for_single_post",
                    circlename=circle_name,
                    image_id=i,
                )
                attachhment_details["images"].remove(i)
                attachhment_details["images"].insert(i_index, image_url)
                print(attachhment_details["images"])
            for i in attachhment_details["pdfs"]:
                i_index = attachhment_details["pdfs"].index(i)
                image_url = flask_context(
                    "get_pictures_from_mongodb_for_single_post",
                    circlename=circle_name,
                    image_id=i,
                )
                attachhment_details["pdfs"].remove(i)
                attachhment_details["pdfs"].insert(i_index, image_url)
            return attachhment_details

        def making_the_feed_post_card(i):
            i["sid"] = str(i["_id"])
            srcounters = get.get_number_of_supports_or_rejects_for_a_post(
                i["sid"], circle_name, "POST"
            )
            comment_and_replies_count = (
                get.count_number_of_comments_and_replies_to_a_post(
                    circle_name, i["sid"]
                )
            )
            if i["type2"] == "SURVEY":
                survey_voter = get.verify_if_user_voted_in_a_survey(
                    i["sid"], i["circle"], UserDetails2["UserEmail"]
                )
                if survey_voter:
                    i["voted"] = survey_voter
                else:
                    i["voted"] = "No"
            i["numberofcomments"] = str(comment_and_replies_count)
            i["Supports"] = str(srcounters[0])
            i["Rejects"] = str(srcounters[1])
            UserDetails = get.get_user_details_by_email(i["user"])
            UserRole = i["Creator_Role"]
            i["CreatorRole"] = UserRole
            i["CreatorName"] = UserDetails["DisplayName"]
            i["creatorID"] = enco(i["user"])
            if (i["user"]) == UserDetails["UserEmail"]:
                i["Self"] = "Yes"
            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["CreatedAt"].strftime("%d %b %Y")

            i["attachment_store"] = image_maker(i["sid"])

            i["time_difference"] = time_difference
            if get.verify_if_user_follows_post_by_email(
                UserDetails2["UserEmail"], str(i["_id"]), circle_name
            ):
                i["Following"] = "Yes"
            else:
                i["Following"] = "No"
            i["PostId"] = str(i["_id"])

            del i["_id"]
            del i["user"]
            return i

        circle_pinned_posts = get.get_pinned_posts(circle_name)
        id_pins = circle_pinned_posts
        if noofposts_currently_existing == 0 and filter == []:
            for i in circle_pinned_posts:
                k1 = dac.find_one({"_id": ObjectId(i), "circle": circle_name})
                card1 = making_the_feed_post_card(k1)
                g1_list.append(card1)

        for i in g1:
            if str(i["_id"]) in id_pins:
                continue
            card1 = making_the_feed_post_card(i)
            g1_list.append(card1)

        if g1_list:
            return g1_list

        return False

    def get_pinned_posts(circle, type_of_post="POST"):
        """Get pinned posts"""
        dac = dab["CIRCLES"]
        g1 = dac.find_one({"DisplayName": circle}, {"PINNED_POST_IDS": 1, "_id": 0})
        g1_list = []
        if not g1:
            return []
        for i in g1["PINNED_POST_IDS"]:
            if i["post_type"] == type_of_post:
                g1_list.append(i["post_id"])
        return g1_list

    def get_root_comment(
        circle: str, comment_id: str, parent_post_id: str, UserDetails: dict = None
    ):
        """Get root comment"""
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(comment_id),
            "circle": circle,
            "parent_post_id": parent_post_id,
        }
        ret = {
            "parent_comment_id": 1,
            "type": 1,
            "_id": 1,
        }

        while True:
            g1 = dac.find_one(fil, ret)
            if g1["type"] == "REPLY_COMMENT":
                fil["_id"] = ObjectId(g1["parent_comment_id"])
                continue
            break
        if g1:
            g1["sid"] = str(g1["_id"])
            return g1["sid"]
        return False

    def get_posts_in_a_circle_multi_filter_personal_user(
        noofposts_currently_existing: int,
        filter: str,
        UserDetails2: dict,
        flask_context: str = None,
    ):
        """get posts in a circle with multiple filters.\n
        Example:\n
        filter="Following","Supported","Rejected","Comments","MyPosts" ,"Replies"
        """
        dac = dab["POSTS"]
        mefil = {
            "user": UserDetails2["UserEmail"],
        }
        filter_to_type = {
            "MyPosts": "POST",
            "Comments": "COMMENT",
            "Replies": "REPLY_COMMENT",
        }
        mefil["type"] = filter_to_type[filter]
        print(mefil)
        g1 = dac.find(mefil).limit(10).skip(noofposts_currently_existing)
        # elif(filter=="Supported"):

        if filter == []:
            mefil["type"] = "POST"
            g1 = dac.find(mefil).limit(10).skip(noofposts_currently_existing)

        g1_list = []

        def image_maker(post_id, circle_name):
            attachhment_details = (
                get.get_all_images_and_PDFs_in_a_single_post_in_a_cricle_as_array(
                    circle_name, post_id
                )
            )
            for i in attachhment_details["images"]:
                i_index = attachhment_details["images"].index(i)
                image_url = flask_context(
                    "get_pictures_from_mongodb_for_single_post",
                    circlename=circle_name,
                    image_id=i,
                )
                attachhment_details["images"].remove(i)
                attachhment_details["images"].insert(i_index, image_url)
                print(attachhment_details["images"])
            for i in attachhment_details["pdfs"]:
                i_index = attachhment_details["pdfs"].index(i)
                image_url = flask_context(
                    "get_pictures_from_mongodb_for_single_post",
                    circlename=circle_name,
                    image_id=i,
                )
                attachhment_details["pdfs"].remove(i)
                attachhment_details["pdfs"].insert(i_index, image_url)
            return attachhment_details

        for i in g1:
            i["sid"] = str(i["_id"])
            srcounters = get.get_number_of_supports_or_rejects_for_a_post(
                i["sid"], i["circle"], "POST"
            )
            if i.get("parent_comment_id"):
                i["sid"] = str(i["parent_comment_id"])
            i["attachment_store"] = image_maker(i["sid"], i["circle"])
            i["Supports"] = str(srcounters[0])
            i["Rejects"] = str(srcounters[1])
            UserDetails = get.get_user_details_by_email(i["user"])
            i["CreatorName"] = UserDetails["DisplayName"]
            i["creatorID"] = enco(i["user"])
            if (i["user"]) == UserDetails["UserEmail"]:
                i["Self"] = "Yes"
            # Calculate the time difference.
            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            time_difference = (
                time_difference[0] + " hours " + time_difference[1] + " minutes ago"
            )
            i["time_difference"] = time_difference
            if get.verify_if_user_follows_post_by_email(
                UserDetails2["UserEmail"], str(i["_id"]), i["circle"]
            ):
                i["Following"] = "Yes"
            else:
                i["Following"] = "No"
            i["PostId"] = enco(str(i["_id"]))

            del i["_id"]
            del i["user"]
            g1_list.append(i)
        if g1_list:
            return g1_list
        return False

    def get_number_of_supports_or_rejects_for_a_post(
        post_id: str, circle_name: str, postType: Union[str, dict]
    ):
        """Get number of supports or rejects for a post.\n
        Example:\n
        post_id="circle1"
        postType="POST"
        circle_name="circle1"

        returns [supports,rejects]

        """
        dac = dab["POST_METADATA"]
        fil = {"PostId": post_id, "circle": circle_name, "post_type": postType}
        fil["type"] = "post_supporters"
        c1 = dac.count_documents(fil, {})
        fil["type"] = "post_rejectors"
        c2 = dac.count_documents(fil, {})
        return [c1, c2]

    def get_user_details_by_email(user_email: str, reter=None):
        """Get user details from the database.\n
        Example:\n
        a1@gmail.com"""
        dac = dab["USER_DETAILS"]
        if not reter:
            g1 = dac.find_one({"UserEmail": user_email})
        else:
            g1 = dac.find_one({"UserEmail": user_email}, reter)
        if g1:
            return g1
        else:
            return False

    def get_user_token_details(Token: str):
        """Get user token from the database.\n
        Example:\n
        a1@gmail.com"""
        dac = dab["SESSION_TOKENS"]
        Token = deco(Token)
        Token = json.loads(Token)
        t1 = Token["Token"]
        g1 = dac.find_one({"_id": ObjectId(t1)})
        if g1:
            return g1
        else:
            raise Exception("Token not found")

    def get_rate_limiting_user_token_details(Token: str):
        """Get user token from the database.\n
        Example:\n
        a1@gmail.com"""
        dac = dab["SESSION_TOKENS"]
        Token = deco(Token)
        Token = json.loads(Token)
        t1 = Token["Token"]
        ret = {
            "UserEmail": 1,
        }
        g1 = dac.find_one({"_id": ObjectId(t1)}, ret)
        if g1:
            return g1
        else:
            raise Exception("Token not found")

    def get_circles_in_an_area(coordinates, UserDetails: dict = None):
        def mapper(datain, exclude_array=[]):
            array_list = []
            display_name_array = []
            counter = 0
            for i in datain:
                if i["DisplayName"] in exclude_array:
                    continue
                counter += 1
                print(counter)
                print(i.keys())
                g1 = i
                g1["isJoined"] = "No"
                if common_mains.if_in_circle(UserDetails, i["DisplayName"]):
                    g1["isJoined"] = "Yes"
                array_list.append(g1)
                display_name_array.append(i["DisplayName"])
            return array_list, display_name_array

        dac = dab["CIRCLES"]
        ret = {
            "DisplayName": 1,
            "CircleImage": 1,
            "Circle_Tags": 1,
            "Description": 1,
            "_id": 0,
        }

        infil = {
            "Circle_Area": {
                "$geoIntersects": {
                    "$geometry": {"type": "Point", "coordinates": coordinates}
                }
            }
        }
        print(infil)

        r1 = dac.find(
            infil,
            ret,
        ).sort("All_Time_Member_Traffic", -1)
        array_list = []
        array_list, exclusion_array = mapper(r1)
        len_of_array = len(array_list)
        info_string = "The number of circles in this location are " + str(len_of_array)
        if not array_list or len_of_array < 10:
            info_string += " . Since the number is low, we are filling in some other visited circles on GTSocial :)"
            r1 = (
                dac.find({}, ret)
                .sort("All_Time_Member_Traffic", -1)
                .limit(10 - len_of_array)
            )
            array_list2 = mapper(r1, exclusion_array)[0]
            array_list.extend(array_list2)

        return array_list, info_string

    def get_user_details_by_dict(user_info: dict):
        """Get user details from the database.\n
        ONLY USED FOR LOGINS.
        Example:\n
        user_info={UserEmail: "fsadf asdf "
                      UserPassword: "asdf asdf "
                      }"""
        dac = dab["USER_DETAILS"]
        if "UserPassword" in user_info.keys():
            user_info["UserPassword"] = sha512(
                user_info["UserPassword"].encode("utf-8")
            ).hexdigest()
        print(user_info)
        g1 = dac.find_one(user_info)
        if g1:
            return g1
        else:
            return False

    def get_tags_for_circles():
        """Get tags for circles."""
        dac = dab["CONFIGS"]
        g1 = dac.find_one({"type": "tags_for_circles"})
        if g1:
            return g1["tags"]
        else:
            return False

    def get_translation_of_power_to_description_for_circle_from_configs():
        """Get tags for circles.
        This returns a list of dictionaries with the following keys.
        "power_description"
        "powers_list"
        """
        dac = dab["CONFIGS"]
        g1 = dac.find_one({"type": "translation_of_powers_to_description"})
        if g1:
            # This returns a list of dictionaries with the following keys.
            # "power_description"
            # "powers_list"
            return g1["circle_powers_to_description_translation"]
        return False

    def get_flair_by_user_role_in_circle(circle_name: str, user_role: str):
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
            "Roles.{0}.Role_Name".format(user_role): user_role,
        }
        g1 = dac.find_one(fil, {"Roles.{0}.Role_Tags".format(user_role): 1, "_id": 0})
        if g1:
            return g1["Roles"][user_role]["Role_Tags"]
        return False

    def get_flairs_for_circle(circle_name: str, user_status_in_circle: str):
        """Get flairs for circles."""
        dac = dab["CIRCLES"]
        circle_user_map = {
            "Galam_Founder": {
                "Admin_Circle_Tags": 1,
                "Member_Circle_Tags": 1,
                "Galam_Circle_Tags": 1,
                "_id": 0,
            },
            "Admin": {"Admin_Circle_Tags": 1, "Member_Circle_Tags": 1, "_id": 0},
            "Member": {"Member_Circle_Tags": 1, "_id": 0},
        }
        g1 = dac.find_one(
            {"DisplayName": circle_name}, circle_user_map[user_status_in_circle]
        )
        array_list = []
        for i in g1:
            r1 = {}
            if i == "Admin_Circle_Tags":
                r1["name"] = "Admin"
                r1["tags"] = g1[i]
            elif i == "Galam_Circle_Tags":
                r1["name"] = "Galam"
                r1["tags"] = g1[i]
            elif i == "Member_Circle_Tags":
                r1["name"] = "Member"
                r1["tags"] = g1[i]
            array_list.append(r1)
        if g1:
            return array_list
        else:
            return []

    def get_flairs_for_circle2(circle_name: str):
        """Get flairs for circles."""
        dac = dab["CIRCLES"]
        flairs_List = dac.find_one({"DisplayName": circle_name}, {"Flairs_List": 1})
        if flairs_List:
            return flairs_List["Flairs_List"]
        return False

    def get_role_specific_flair_for_circle(circle_name: str, role_name: str):
        """Get role specific flairs for circle."""
        dac = dab["CIRCLES"]
        Roles_Dict = dac.find_one({"DisplayName": circle_name}, {"Roles": 1})
        if Roles_Dict:
            return Roles_Dict["Roles"][role_name]["Role_Tags"]
        return False

    def get_all_flairs_for_circle_without_label(
        circle_name: str, user_status_in_circle: str
    ):
        """Get flairs for circles."""
        dac = dab["CIRCLES"]
        circle_user_map = {
            "Galam_Founder": {
                "Admin_Circle_Tags": 1,
                "Member_Circle_Tags": 1,
                "Galam_Circle_Tags": 1,
                "_id": 0,
            },
            "Admin": {"Admin_Circle_Tags": 1, "Member_Circle_Tags": 1, "_id": 0},
            "Member": {"Member_Circle_Tags": 1, "_id": 0},
        }
        g1 = dac.find_one(
            {"DisplayName": circle_name}, circle_user_map[user_status_in_circle]
        )
        array_list = []
        for i in g1:
            r1 = {}
            array_list.extend(g1[i])
        if g1:
            return array_list
        else:
            return []

    def get_tags_for_related_circles(starter: str):
        """Get tags for circles."""
        dac = dab["CIRCLES"]
        # Do a regex search for DisplayName with starts with starter.
        starter = escape(starter)
        g1 = dac.find({"DisplayName": {"$regex": f"^{starter}.*"}})
        tags = []
        for i in g1:
            tags.append(i["DisplayName"])
        if tags:
            return tags
        else:
            return False

    def get_information_board_title_and_subtitle(circle_name: str):
        """Get title and subtitle of circle.\n
        Example:\n
        circle_name="circle1" """
        dac = dab["CIRCLES"]
        g1 = dac.find_one(
            {"DisplayName": circle_name},
            {"Information_Board_Title_And_Subtitle": 1, "_id": 0},
        )
        if "Information_Board_Title_And_Subtitle" in list(g1.keys()):
            return g1["Information_Board_Title_And_Subtitle"]
        else:
            return []

    def get_user_circle_details(user_token_details_dict: dict, skip: int = 0):
        """Get user circle details from the database.\n
        Example:\n
        user_token={}
        """
        dac = dab["CIRCLES"]
        circle_array = []
        circle_details = []
        ret = {
            "DisplayName": 1,
            "CircleImage": 1,
            "Description": 1,
            "Circle_Tags": 1,
        }
        for i in user_token_details_dict["Circles"]:
            circle_array.append(i["DisplayName"])
        g1 = dac.find({"DisplayName": {"$in": circle_array}}, ret).skip(skip).limit(20)
        for i in g1:
            del i["_id"]
            # del i["CreatorEmail"]
            circle_details.append(i)
        return circle_details

    def get_information_and_announcement_board_cards(
        circle_name: str, User_Token_Details: dict
    ):
        """Get information and announcement board from the database.\n
        Example:\n
        circle_name="circle1" """
        dac = dab["CIRCLES"]
        g1 = dac.find_one(
            {"DisplayName": circle_name},
            {"Information_Board_Title_And_Subtitle": 1, "_id": 0},
        )
        g1_list = []
        r1 = g1.copy()
        dac2 = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
        if g1:
            for i in g1["Information_Board_Title_And_Subtitle"]:
                if "Information_cards" in i:
                    for card_id in i["Information_cards"]:
                        fil2 = {"circle": circle_name, "_id": ObjectId(card_id)}
                        g2 = dac2.find_one(fil2)
                        g2["CreatedAt"] = str(g2["CreatedAt"])
                        if g2["card_type"] == "profile_card":
                            if "support_reject_buttons" in list(g2.keys()):
                                if g2["support_reject_buttons"] == "on":
                                    counters = get.get_number_of_supports_or_rejects_for_a_post(
                                        str(g2["_id"]), circle_name, "profile_card"
                                    )
                                    g2["support_count"] = counters[0]
                                    g2["reject_count"] = counters[1]
                                    g2[
                                        "user_support_reject_status"
                                    ] = get.verify_if_user_supports_or_rejects_post_by_email(
                                        str(g2["_id"]),
                                        circle_name,
                                        User_Token_Details["UserEmail"],
                                        "profile_card",
                                    )
                                    if g2["user_support_reject_status"] == True:
                                        g2["user_support_reject_status"] = "support"
                                    elif g2["user_support_reject_status"] == False:
                                        g2["user_support_reject_status"] = "reject"
                                    else:
                                        g2["user_support_reject_status"] = "none"
                        g2["sid"] = str(g2["_id"])
                        del g2["_id"]
                        del g2["user"]
                        g1_list.append(g2)
                # Replace information cards in r1 with g1_list
                r1["Information_Board_Title_And_Subtitle"][
                    g1["Information_Board_Title_And_Subtitle"].index(i)
                ]["Information_cards"] = g1_list
                g1_list = []
        return r1["Information_Board_Title_And_Subtitle"]

    def get_specific_circle_details_of_user(
        user_token_details_dict: dict, DisplayName: str
    ):
        """Get user circle details from the database.\n
        Example:\n
        user_token={}
        """
        dac = dab["CIRCLES"]
        for i in user_token_details_dict["Circles"]:
            if i["DisplayName"] == DisplayName:
                g1 = dac.find_one({"DisplayName": DisplayName})
                del g1["_id"]
                del g1["CreatorEmail"]
        if g1:
            return g1
        else:
            return False

    def get_reported_posts(circle, skip: int):
        """Get reported posts from the database.\n
        Example:\n
        circle="circle1" """
        dac = dab["REPORTS"]
        dac2 = dab["POSTS"]
        a1 = dac.find({"circle": circle, "first_report": "Yes"}).skip(skip).limit(10)
        final_array = []
        for i in a1:
            final_dat = {}
            real_post_details = get.get_any_type_single_post_details_from_POSTS(
                circle, i["post_id"], i["post_type"]
            )
            post_type = i["post_type"]
            final_dat["number_of_reports"] = str(
                dac.count_documents(
                    {"circle": circle, "post_type": post_type, "post_id": i["post_id"]},
                    {},
                )
            )
            final_dat["reasons"] = get.get_report_reasons(
                circle, i["post_id"], post_type
            )
            final_dat["html_content"] = i["html_content"]
            final_dat["poster_displayname"] = i["poster_displayname"]
            final_dat["post_type"] = i["post_type"]
            final_dat["post_id"] = i["post_id"]
            if (
                real_post_details["isClosed"] == "Yes"
                and real_post_details["isVisible"] == "Yes"
            ):
                final_dat["current_status"] = "Closed but visible"
            elif (
                real_post_details["isClosed"] == "Yes"
                and real_post_details["isVisible"] == "No"
            ):
                final_dat["current_status"] = "Deleted"
            elif (
                real_post_details["isClosed"] == "No"
                and real_post_details["isVisible"] == "Yes"
            ):
                final_dat["current_status"] = "Open"
            time_difference = datetime.datetime.now() - i["posted_on"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["posted_on"].strftime("%d %b %Y")
            final_dat["time_difference"] = time_difference

            if "url" in list(i.keys()):
                final_dat["url"] = i["url"]
            final_array.append(final_dat)
        return final_array

    def get_report_reasons(circle: str, post_id: str, post_type: str, skip: int = 0):
        """Get report reasons from the database.\n
        Example:\n
        circle="circle1" """
        dac = dab["REPORTS"]
        a1 = (
            dac.find({"circle": circle, "post_type": post_type, "post_id": post_id})
            .skip(skip)
            .limit(10)
        )
        return_list = []
        for i in a1:
            f1 = {}
            f1["reporter_displayname"] = i["reporter_displayname"]
            f1["reason"] = i["reason"]
            time_difference = datetime.datetime.now() - i["CreatedAt"]
            time_difference = str(time_difference)
            time_difference = time_difference.split(":")
            if time_difference[0] == "0":
                time_difference = time_difference[1] + " minutes ago"
            elif time_difference[0] == "1":
                time_difference = time_difference[0] + " hours ago"
            else:
                time_difference = i["CreatedAt"].strftime("%d %b %Y")
            f1["time_difference"] = time_difference
            return_list.append(f1)
        return return_list

    def verify_if_circle_exists(DisplayName: str):
        """Verify if circle exists. Returns true if circle display name exists\n
        Example:\n
        circle_name="circle1" """
        dac = dab["CIRCLES"]
        if dac.find_one({"DisplayName": DisplayName}):
            return True
        else:
            return False

    def verify_if_user_follows_post_by_email(
        UserEmail: str, PostID: str, circle_name: str
    ):
        """Verify if user follows post. Returns true if user follows post.\n
        Example:\n
        UserEmail="
        """
        dac = dab["POST_METADATA"]
        if dac.find_one(
            {
                "user": UserEmail,
                "PostId": PostID,
                "type": "post_followers",
                "circle": circle_name,
            }
        ):
            return True
        else:
            return False

    def verify_if_post_exists(PostID: str, circle_name: str, postType: str):
        """Verify if post exists. Returns true if post exists.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        """
        dac = dab["POSTS"]
        mefil = {
            "circle": circle_name,
            "type": postType,
            "_id": ObjectId(PostID),
            "isVisible": "Yes",
            "isClosed": "No",
        }
        ret = {"circle": 1}
        if postType in ["profile_card", "title_card"]:
            dac = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
            del mefil["isVisible"]
            del mefil["isClosed"]
        if dac.find_one(mefil, ret):
            return True
        return False

    def verify_if_post_supports_comments_or_supports(
        post_id: str, circle_name: str, checker: str
    ):
        """Verify if post supports comments. Returns true if post supports comments.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        """
        dac = dab["POSTS"]
        mefil = {
            "circle": circle_name,
            "_id": ObjectId(post_id),
            "isVisible": "Yes",
            "isClosed": "No",
        }
        ret = {"circle": 1, checker: 1}
        r1 = dac.find_one(mefil, ret)
        if r1[checker] == "Yes":
            return True
        return False

    def verify_if_user_supports_or_rejects_post_by_email(
        PostID: str, circle_name: str, UserEmail: str, postType: Union[str, dict]
    ):
        """Verify if user supports post. Returns true if user supports post.\n
        Keyword arguments:
        argument --
        PostID -- String
        circle_name -- String
        UserEmail -- String
        Return: True or False or None
        """
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": PostID,
            "circle": circle_name,
            "user": UserEmail,
            "post_type": postType,
        }
        fil["type"] = {"$in": ["post_supporters", "post_rejectors"]}
        g1 = dac.find_one(fil)
        if g1 == None:
            return None
        elif g1["type"] == "post_supporters":
            return True
        elif g1["type"] == "post_rejectors":
            return False

    def verify_if_title_exists_in_a_circle(circle_name: str, title: str):
        """Verifies if a title exists in a circle"""
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
            "Information_Board_Title_And_Subtitle.title": title,
        }
        if dac.find_one(fil):
            return True
        else:
            return False

    def verify_if_DisplayName_exists(DisplayName: str):
        """Verifies if a DisplayName exists in a circle"""
        dac = dab["USER_DETAILS"]
        fil = {"DisplayName": DisplayName}
        if dac.find_one(fil):
            return True
        else:
            return False

    def verify_if_email_id_exists(email_id: str, db_to_search: list):
        """Verifies if a email_id exists in a circle\n
        Returns True if email_id exists in any of the databases in db_to_search \n
        Suggest to search in\n
        USER_DETAILS and PENDING_VERIFICATION
        """
        fil = {"UserEmail": email_id}
        for i in db_to_search:
            if dab[i].find_one(fil):
                return True
        return False

    def verify_if_aadhar_already_exists(aa: str, db_to_search: list):
        """Verifies if a aadhar already exists in a circle
        Suggest to search in
        USER_DETAILS and PENDING_VERIFICATION
        """
        fil = {"Aadhar_Number": aa}
        for i in db_to_search:
            if dab[i].find_one(fil):
                return True
        return False

    def verify_if_voter_id_already_exists(aa: str, db_to_search: list):
        """Verifies if a voter id already exists in a circle"""
        fil = {"Voter_Number": aa}
        for i in db_to_search:
            if dab[i].find_one(fil):
                return True
        return False

    def count_number_of_comments_and_replies_to_a_post(
        circle_name: str, parent_post_id: str
    ) -> int:
        """sumary_line

        Keyword arguments:
        argument --
        circle_name -- String
        parent_post_id -- String
        Return: Number of comments and replies to a post as
        """
        dac = dab["POSTS"]
        fil = {
            "circle": circle_name,
            "parent_post_id": parent_post_id,
            "isVisible": "Yes",
        }
        g1 = dac.count_documents(fil, {})
        return g1

    def count_number_of_replies_to_a_comment(
        circle_name: str,
        postType: str,
        parent_post_id: str = None,
        parent_comment_id: str = None,
    ):
        """Count number of replies to a comment.\n
        Example:\n
        parent_comment_id="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        postType="POST"
        """
        dac = dab["POSTS"]
        fil = {
            "circle": circle_name,
            "type": postType,
            "isVisible": "Yes",
        }
        if parent_post_id:
            fil["parent_post_id"] = parent_post_id
        if parent_comment_id:
            fil["parent_comment_id"] = parent_comment_id
        g1 = int(dac.count_documents(fil, {}))
        if g1 == 0:
            return False
        else:
            return g1


class updates:
    def move_verified_users_to_role(Role_Name: str, Circle_Object: dict):
        """Move verified users to role.\n
        Example:\n
        Role_Name="Admin"
        Circle_Object={}
        """
        dac = dab["USER_DETAILS"]
        dac2 = dab["CIRCLES"]
        fil = {
            "Circles.DisplayName": Circle_Object["DisplayName"],
            "Aadhar_Verification": "Yes",
            "VoterID_Verification": "Yes",
        }

        # Number 1 we need to transfer existing users to the new role.
        # Number 2 we need to make it the default role for verified users.
        dac.update_many(
            fil,
            {
                "$set": {
                    "Circles.$[elem].Role": Role_Name,
                }
            },
            array_filters=[
                {
                    "elem.DisplayName": Circle_Object["DisplayName"],
                    "elem.Role": {"$ne": "Admin"},
                }
            ],
        )
        dac2.update_one(
            {"DisplayName": Circle_Object["DisplayName"]},
            {"$set": {"Default_Role_For_Verified_Users": Role_Name}},
        )
        return True

    def update_user_details_by_email(user_email: str, update_dict: dict):
        """Update user details by email.\n
        Example:\n
        user_email="
        update_dict={"DisplayName": "asdf asdf"}
        """
        dac = dab["USER_DETAILS"]
        u1 = dac.update_one({"UserEmail": user_email}, update_dict)
        if u1.modified_count == 1:
            return True
        return False

    def add_role_to_circle(circle_name: str, role_name: str, role_symbol: str):
        """Add role to circle.\n
        Example:\n
        circle_name="circle1"
        role_name="Admin"
        role_symbol="👑"
        """
        dac = dab["CIRCLES"]
        fil = {"DisplayName": circle_name, "Roles_List": role_name}
        u1 = dac.update_one(
            fil, {"$set": {"Roles." + role_name + ".Role_Symbol": role_symbol}}
        )
        if u1.modified_count == 1:
            return True
        return False

    def toggle_pin_post(PostID: str, circle_name: str, postType: str):
        """Toggle pin post.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        postType="POST"
        action="pin" """
        dac = dab["POSTS"]
        dac2 = dab["CIRCLES"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
            "type": postType,
        }
        ret = {"isPinned": 1, "_id": 0}
        post_object = dac.find_one(fil, ret)
        if not post_object:
            g1 = dac.update_one(fil, {"$set": {"isPinned": "Yes"}})
            g2 = dac2.update_one(
                {"DisplayName": circle_name},
                {
                    "$set": {"last_updated": datetime.datetime.now()},
                    "$push": {
                        "PINNED_POST_IDS": {
                            "$each": [
                                {
                                    "type": "pin_post",
                                    "post_id": PostID,
                                    "post_type": postType,
                                }
                            ],
                            "$position": 0,
                        }
                    },
                },
            )
        elif post_object["isPinned"] == "No":
            g1 = dac.update_one(fil, {"$set": {"isPinned": "Yes"}})
            g2 = dac2.update_one(
                {"DisplayName": circle_name},
                {
                    "$set": {"last_updated": datetime.datetime.now()},
                    "$push": {
                        "PINNED_POST_IDS": {
                            "$each": [
                                {
                                    "type": "pin_post",
                                    "post_id": PostID,
                                    "post_type": postType,
                                }
                            ],
                            "$position": 0,
                        }
                    },
                },
            )
        elif post_object["isPinned"] == "Yes":
            g1 = dac.update_one(fil, {"$set": {"isPinned": "No"}})
            g2 = dac2.update_one(
                {"DisplayName": circle_name},
                {
                    "$set": {"last_updated": datetime.datetime.now()},
                    "$pull": {
                        "PINNED_POST_IDS": {"post_id": PostID, "post_type": postType}
                    },
                },
            )
        if g1.modified_count == 1:
            return True
        return False

    def update_post_to_add_or_remove_comment_count(
        PostID: str, circle_name: str, action: str
    ):
        """Update post to add or remove comment count.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        action="add" """
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
        }
        setter = {}
        if action == "add":
            setter["$inc"] = {"comment_count": 1}
        elif action == "remove":
            setter["$inc"] = {"comment_count": -1}
        v1 = dac.update_one(fil, setter)
        if v1.modified_count == 1:
            return True
        return False

    def update_post_to_add_support_or_reject(
        PostID: str, circle_name: str, postType: str, action: str, action2: str = None
    ):
        """Update post to add support or reject.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        UserEmail="
        postType="POST"
        action="support" """
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
            "type": postType,
        }
        if postType in ["profile_card", "title_card"]:
            dac = dab["CIRCLES_INFORMATION_BOARD_CARDS"]
            del fil["type"]
        setter = {}
        if action2 == "add_and_remove" and action == "support":
            setter["$inc"] = {"supporters": 1, "rejectors": -1}
        elif action2 == "add_and_remove" and action == "reject":
            setter["$inc"] = {"supporters": -1, "rejectors": 1}
        elif action2 == "add" and action == "support":
            setter["$inc"] = {"supporters": 1}
        elif action2 == "add" and action == "reject":
            setter["$inc"] = {"rejectors": 1}
        elif action2 == "remove" and action == "support":
            setter["$inc"] = {"supporters": -1}
        elif action2 == "remove" and action == "reject":
            setter["$inc"] = {"rejectors": -1}
        v1 = dac.update_one(fil, setter)
        if v1.modified_count == 1:
            return True
        return False

    def reload_my_session_token(UserEmail: str):
        """reload my session token.\n
        Example:\n
        UserEmail="
        Token=" """
        dac = dab["SESSION_TOKENS"]
        dac2 = dab["USER_DETAILS"]
        updated_user_object = dac2.find_one({"UserEmail": UserEmail})
        if updated_user_object == None:
            return False
        del updated_user_object["_id"]
        dac.update_many({"UserEmail": UserEmail}, {"$set": updated_user_object})
        return True

    def reload_many_users_session_token(UserEmails: list):
        """reload many users session token.\n
        Example:\n
        UserEmails=["", ""]"""
        dac = dab["SESSION_TOKENS"]
        dac2 = dab["USER_DETAILS"]
        updated_user_object = dac2.find({"UserEmail": {"$in": UserEmails}})
        if updated_user_object == None:
            return False
        for i in updated_user_object:
            del i["_id"]
            dac.update_many({"UserEmail": i["UserEmail"]}, {"$set": i})
        return True

    def update_user_to_add_to_a_circle(user_circle_object_to_add: dict, useremail: str):
        """Update user to add to a circle.\n
        Example:\n
        user_circle_object_to_add={}
        useremail="
        """
        dac = dab["USER_DETAILS"]
        g1 = dac.update_one(
            {"UserEmail": useremail}, {"$push": {"Circles": user_circle_object_to_add}}
        )
        if g1.modified_count == 1:
            return True
        return False

    def update_user_to_remove_from_a_circle(circle_name: str, useremail: str):
        """Update user to remove from a circle.\n
        Example:\n
        circle_name="circle1"
        useremail="
        """
        dac = dab["USER_DETAILS"]
        g1 = dac.update_one(
            {"UserEmail": useremail},
            {"$pull": {"Circles": {"DisplayName": circle_name}}},
        )
        if g1.modified_count == 1:
            return True
        return False

    def update_default_role_for_joining(circle_name: str, default_role: str):
        """Update default role for joining.\n
        Example:\n
        circle_name="circle1"
        default_role="Member" """
        dac = dab["CIRCLES"]
        g1 = dac.update_one(
            {"DisplayName": circle_name}, {"$set": {"Default_Role": default_role}}
        )
        if g1.modified_count == 1:
            return True
        else:
            return False

    def update_user_role(
        Circle_DisplayName: str, ToUpdateUserEmail: str, UpdateRole: str
    ):
        """Update user role.\n
        Example:\n
        UserEmail="
        Circle_DisplayName="circle1"
        UserRole="Moderator" \n
        """
        dac = dab["USER_DETAILS"]
        fil = {
            "UserEmail": ToUpdateUserEmail,
            "Circles.DisplayName": Circle_DisplayName,
        }
        updater = {"$set": {"Circles.$.Role": UpdateRole}}
        g1 = dac.update_one(fil, updater)
        if g1.modified_count == 1:
            return True
        return False

    def update_role_order(
        UserRole: str, Re_ordered_role_list: list, Circle_DisplayName: str
    ):
        """Update role order.\n
        Example:\n
        UserRole="Admin"
        Re_ordered_role_list=["Admin", "Moderator", "Member"]
        Circle_DisplayName="circle1" \n
        Notes: Make sure the UserRole is to the right of the role in the list. \n
               Update Now! :) \n
               The checking if the user can rearrange or not is done in the main.py file. \n
        """
        dac = dab["CIRCLES"]
        fil = {"DisplayName": Circle_DisplayName, "Roles_List": UserRole}
        g1 = dac.update_one(fil, {"$set": {"Roles_List": Re_ordered_role_list}})
        if g1.modified_count == 1:
            return True
        return False

    def update_circle_role_flair_tags(
        UserRole: str,
        Circle_DisplayName: str,
        Flair_Name: str,
        Update_Role: str,
        action: str = "add",
    ):
        """This operation is used to update the flair tags of a role in a circle.\n
        Example:\n
        UserRole="Admin"
        Circle_DisplayName="circle1"
        Flair_Name="flair1"
        Update_Role="Moderator"
        action="add" \n
        Notes: action can be "add" or "remove" \n
        """
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": Circle_DisplayName,
            "Roles_List": Update_Role,
            "Flairs_List": Flair_Name,
        }
        circle_object = dac.find_one(fil, {"CircleImage": 0})
        if circle_object == None:
            return False
        assert common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
            UserRole, Update_Role, circle_object["Roles_List"]
        )
        if (
            action == "add"
            and Flair_Name not in circle_object["Roles"][Update_Role]["Role_Tags"]
        ):
            dac.update_one(
                fil, {"$push": {"Roles.{0}.Role_Tags".format(Update_Role): Flair_Name}}
            )
            return True
        elif (
            action == "remove"
            and Flair_Name in circle_object["Roles"][Update_Role]["Role_Tags"]
        ):
            dac.update_one(
                fil, {"$pull": {"Roles.{0}.Role_Tags".format(Update_Role): Flair_Name}}
            )
            return True
        return False

    def update_circle_role_powers(
        UserRole: str,
        Circle_DisplayName: str,
        Power_List: str,
        Update_Role: str,
        action: str = "add",
    ):
        """Update circle role powers.\n
        Example:\n
        UserRole="Admin"
        Circle_DisplayName="circle1"
        Power_List=["post", "comment", "reply"]
        Update_Role="Moderator"
        action="add" \n
        Notes: action can be "add" or "remove" \n
               Make sure the Update_Role is to the right of UserRole in the list of roles. \n
               Update Now! :) \n
        """
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": Circle_DisplayName,
            "Roles_List": UserRole,
        }
        v1 = dac.find_one(fil, {"CircleImage": 0, "_id": 0})
        if v1 == None:
            return False
        assert common_mains.check_if_current_user_role_is_to_the_left_of_check_role(
            UserRole, Update_Role, v1["Roles_List"]
        )
        if action == "add":
            updater = {
                "$push": {
                    "Roles.{0}.Role_Powers".format(Update_Role): {"$each": Power_List}
                }
            }
        elif action == "remove":
            updater = {
                "$pull": {
                    "Roles.{0}.Role_Powers".format(Update_Role): {"$in": Power_List}
                }
            }
        uppas = dac.update_one(fil, updater)
        if uppas.modified_count == 1:
            return True
        return False

    def update_user_circle_powers(
        UserEmail: str, Circle_DisplayName: str, Power_list: list, Action: str = "Push"
    ):
        """Update user circle powers.\n
        Example:\n
        UserEmail="""
        dac = dab["USER_DETAILS"]
        fil = {"UserEmail": UserEmail, "Circles.DisplayName": Circle_DisplayName}
        # Update the Circles.$.powers by pushing the Power_list if does not exist in the powers
        # And pull the Power_list if it exists in the powers.
        a1 = dac.update_one(fil, {"$pull": {"Circles.$.Powers": {"$in": Power_list}}})
        if Action == "Push":
            a1 = dac.update_one(
                fil, {"$push": {"Circles.$.Powers": {"$each": Power_list}}}
            )
        return a1.modified_count

    def swap_application_to_users(application_id: str, updating_details: dict):
        """Swap application to users.\n
        Example:\n
        application_id="5f1b7c6d8e8d7f0e0d0c0b0a"
        updating_details={
            "UserEmail":"
        }
        """
        dac = dab["PENDING_VERIFICATION"]
        fil = {"_id": ObjectId(application_id)}
        application_data = dac.find_one(fil)
        if not application_data:
            return False
        # Merge the updating_details with application_data.
        application_data.update(updating_details)
        dac = dab["USER_DETAILS"]
        dac.insert_one(application_data)
        dac = dab["PENDING_VERIFICATION"]
        dac.delete_one(fil)
        return True

    def update_title_and_subtitle(
        title: str,
        subtitle: str,
        new_title: str,
        new_subtitle: str,
        circle_name: str,
        user_token_details_dict: dict,
    ):
        """update title and subtitle into the database.\n"""
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
        }
        pullout = {
            "title": title,
            "subtitle": subtitle,
        }
        topushin = {
            "title": new_title,
            "subtitle": new_subtitle,
        }
        # Push the topushin into the a1["Information_Board_Title_And_Subtitle"] which is a list.
        # Find one and pull out Information cards if any.
        g1 = dac.find_one(fil)
        k1 = copy.deepcopy(g1["Information_Board_Title_And_Subtitle"])
        for i in k1:
            if "Information_cards" in list(i.keys()):
                del k1[k1.index(i)]["Information_cards"]
        buffer_information_cards = g1["Information_Board_Title_And_Subtitle"][
            k1.index(pullout)
        ]
        if "Information_cards" in list(buffer_information_cards.keys()):
            buffer_information_cards = buffer_information_cards["Information_cards"]
            topushin["Information_cards"] = buffer_information_cards
        a1 = dac.update_one(
            fil, {"$pull": {"Information_Board_Title_And_Subtitle": pullout}}
        )
        a1 = dac.update_one(
            fil, {"$push": {"Information_Board_Title_And_Subtitle": topushin}}
        )
        return a1.modified_count

    def update_post_in_a_circle_post(
        PostID: str,
        circle_name: str,
        html_content: str,
        UserDetails: dict,
        postType: str,
    ):
        """Update comment in a circle post.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        html_content="<p> This is a comment </p>"
        UserDetails={
            "UserEmail":"fsadf asdf ",
            }
        postType="POST"
        """
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
            "type": postType,
            "user": UserDetails["UserEmail"],
            "isVisible": "Yes",
            "isClosed": "No",
        }
        if dac.find_one(fil):
            a1 = dac.update_one(
                fil,
                {
                    "$set": {
                        "html_content": html_content,
                        "UpdatedAt": datetime.datetime.now(),
                    }
                },
            )
            return True
        else:
            return False

    def update_user_details(user_info: dict):
        """Update user details into the database.\n
        Example:\n
        user_info={UserEmail:
                      UserPassword:
                      UserAgreement:
                      }"""
        dac = dab["USER_DETAILS"]
        # Check if user already exists.
        if dac.find_one({"UserEmail": user_info["UserEmail"]}):
            a1 = dac.update_one(
                {"UserEmail": user_info["UserEmail"]}, {"$set": user_info}
            )
            return True
        else:
            return False

    def update_circle_details(circle_info: dict):
        """Update circle details into the database.\n
        Example:\n
        circle_info={DisplayName:
                      Description:
                      Tags:
                      }"""
        dac = dab["CIRCLES"]
        # Check if circle already exists.
        if dac.find_one({"DisplayName": circle_info["DisplayName"]}):
            a1 = dac.update_one(
                {"DisplayName": circle_info["DisplayName"]}, {"$set": circle_info}
            )
            return True
        return False

    def update_circle_details_customized(circle_name: str, circle_info: dict):
        """Update circle details into the database.\n
        Example:\n
        circle_info={DisplayName:
                      Description:
                      Tags:
                      }"""
        dac = dab["CIRCLES"]
        # Check if circle already exists.
        if dac.find_one({"DisplayName": circle_name}):
            a1 = dac.update_one({"DisplayName": circle_name}, circle_info)
            return True
        return False

    def update_notification_to_read(
        circle_name: str, UserEmail: str, NotificationID: str
    ):
        """Update notification to read.\n
        Example:\n
        UserEmail="fsadf asdf "
        NotificationID="5f1b7c6d8e8d7f0e0d0c0b0a"
        """
        dac = dab["NOTIFICATIONS"]
        fil = {
            "user": UserEmail,
            "circle": circle_name,
            "_id": ObjectId(NotificationID),
        }
        a1 = dac.update_one(fil, {"$set": {"seen": "Yes"}})
        return True

    def update_all_notifications_to_read(UserEmail: str):
        """Update all notifications to read.\n
        Example:\n
        UserEmail="fsadf asdf "
        """
        dac = dab["NOTIFICATIONS"]
        fil = {
            "user": UserEmail,
        }
        a1 = dac.update_many(fil, {"$set": {"seen": "Yes"}})
        return True


class deleters:
    def delete_session_token(Token: str):
        """Delete session Token.\n
        Example:\n
        a1@gmail.com"""
        dac = dab["SESSION_TOKENS"]
        Token = deco(Token)
        Token = json.loads(Token)
        t1 = Token["Token"]
        g1 = dac.delete_one({"_id": ObjectId(t1)})
        if g1.deleted_count == 1:
            return g1
        else:
            raise Exception("Token not found")

    def delete_circle_role(role_name: str, pure_circle_object: dict):
        # Shift all users with role_name to the next role in the role list (right).
        # Clear the users who are shifted powers.
        # Assign the new role powers.
        # Delete the role from the circle.
        dac1 = dab["USER_DETAILS"]
        dac2 = dab["CIRCLES"]
        dac3 = dab["SESSION_TOKENS"]
        userdetails_fil = {
            "Circles.DisplayName": pure_circle_object["DisplayName"],
            "Circles.Role": role_name,
        }
        Update_Role = pure_circle_object["Roles_List"][
            pure_circle_object["Roles_List"].index(role_name) + 1
        ]
        circle_powers_to_fill_in = pure_circle_object["Roles"][Update_Role][
            "Role_Powers"
        ]
        userdetails_updater = {
            "$set": {
                "Circles.$.Role": Update_Role,
                "Circles.$.Powers": circle_powers_to_fill_in,
            }
        }
        a1 = dac1.update_many(userdetails_fil, userdetails_updater)

        # Delete the role from the circle.
        circle_fil = {"DisplayName": pure_circle_object["DisplayName"]}
        circle_updater = {
            "$unset": {"Roles." + role_name: ""},
            "$pull": {"Roles_List": role_name},
        }
        a2 = dac2.update_one(circle_fil, circle_updater)
        k1 = dac3.find(userdetails_fil, {"UserEmail": 1, "_id": 0})
        k2 = []
        for i in k1:
            k2.append(i["UserEmail"])
        updates.reload_many_users_session_token(k2)
        return a2.modified_count

    def delete_flair_tag_from_general_pool(flair_name: str, circlename: str):
        """Deletes flair tag from general pool"""
        dac = dab["CIRCLES"]
        fil = {"DisplayName": circlename, "Flairs_List": flair_name}
        circle_object = dac.find_one(fil, {"CircleImage": 0})
        if circle_object == None:
            return False
        role_keys = list(circle_object["Roles"].keys())
        # Pull from Flairs_list and all the roles[rolename]["Flair_Tags"].
        dac.update_one(fil, {"$pull": {"Flairs_List": flair_name}})
        del fil["Flairs_List"]
        for i in role_keys:
            remove_from = "Roles.{0}.Role_Tags".format(i)
            k1 = dac.update_one(fil, {"$pull": {remove_from: flair_name}})
        return True

    def delete_post_from_a_circle_post(
        PostID: str, circle_name: str, UserDetails: dict, postType: str
    ):
        """Delete post from a circle post.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        UserDetails={
            "UserEmail":"fsadf asdf ",
            }
        postType="POST"
        """
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
            "type": postType,
            "user": UserDetails["UserEmail"],
        }
        if dac.find_one(fil):
            a1 = dac.delete_one(fil)
            return True
        else:
            return False

    def close_post(
        PostID: str,
        circle_name: str,
        UserDetails: dict,
        postType: str,
        isVisible: str = "Yes",
        isClosedBy: str = None,
    ):
        """Closes Post so no new comments can be created on that post. Locks post.\n
        Change isVisible to "No" if you want to hide the post from the circle.\n
        Example:\n
        PostID="5f1b7c6d8e8d7f0e0d0c0b0a"
        circle_name="circle1"
        UserDetails={
            "UserEmail":"fsadf asdf ",
            }
        postType="POST"
        """
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
            "type": postType,
            "user": UserDetails["UserEmail"],
            "isVisible": "Yes",
            "isClosed": "No",
        }
        if isClosedBy:
            updates = {"$set": {"isClosed": "Yes", "isClosedBy": isClosedBy}}
        else:
            updates = {
                "$set": {"isClosed": "Yes", "isClosedBy": UserDetails["UserEmail"]}
            }
        if isVisible == "Yes":
            updates["$set"]["isVisible"] = "Yes"
        elif isVisible == "No":
            updates["$set"]["isVisible"] = "No"
        if dac.find_one(fil):
            a1 = dac.update_one(fil, updates)
            return True
        else:
            return False

    def make_post_invisible_and_closed(
        PostID: str,
        circle_name: str,
        UserDetails: dict,
        postType: str,
        isClosedBy: str = None,
    ):
        """Closes Post so no new comments can be created on that post. Locks post.\n
        Change isVisible to "No" if you want to hide the post from the circle.\n
        """
        dac = dab["POSTS"]
        fil = {
            "_id": ObjectId(PostID),
            "circle": circle_name,
            "type": postType,
            "user": UserDetails["UserEmail"],
            "isVisible": "Yes",
        }
        if isClosedBy:
            updates = {
                "$set": {"isClosed": "Yes", "isVisible": "No", "isClosedBy": isClosedBy}
            }
        else:
            updates = {
                "$set": {
                    "isClosed": "Yes",
                    "isVisible": "No",
                    "isClosedBy": UserDetails["UserEmail"],
                }
            }
        dac2 = dab["CIRCLES"]
        if dac.find_one(fil):
            a1 = dac.update_one(fil, updates)
            dac2.update_one(
                {"DisplayName": circle_name},
                {
                    "$pull": {
                        "PINNED_POST_IDS": {"post_id": PostID, "post_type": postType}
                    }
                },
            )
            return True
        else:
            return False

    def Unfollow_Post(User_Details: dict, PostID: str, circle_name: str):
        """Unfollow post.\n
        Example:\n
        UserEmail="
        """
        dac = dab["POST_METADATA"]
        a1 = dac.delete_one(
            {
                "user": User_Details["UserEmail"],
                "PostId": PostID,
                "type": "post_followers",
                "circle": circle_name,
            }
        )
        if a1.deleted_count == 1:
            return True
        else:
            return False

    def popout_title_and_subtitle(
        title: str, subtitle: str, circle_name: str, user_token_details: dict
    ):
        dac = dab["CIRCLES"]
        fil = {
            "DisplayName": circle_name,
        }
        topushin = {
            "title": title,
            # "Subtitle":subtitle,
        }
        # Push the topushin into the a1["Information_Board_Title_And_Subtitle"] which is a list.
        inserts.create_information_board_cards(title, [], circle_name)
        a1 = dac.update_one(
            fil, {"$pull": {"Information_Board_Title_And_Subtitle": topushin}}
        )
        return a1.modified_count

    def nullify_all_post_support_and_reject(
        post_id: str, circle_name: str, post_type: str
    ):
        """IDANGEROUS CRAP. Used in deleting stuff in information board\n"""
        # Check if post already exists.
        dac = dab["POST_METADATA"]
        fil = {"PostId": post_id, "circle": circle_name, "post_type": post_type}
        r1 = dac.delete_many(fil)
        return r1.deleted_count

    def nullify_specific_type_of_a_post_in_post_metadata(
        post_id: str, circle_name: str, post_type: str, UserEmail: str
    ):
        """IDANGEROUS CRAP. Used in surveys first.\n
        post_id: str, circle_name: str, post_type: str, UserEmail: str
        """
        # Check if post already exists.
        dac = dab["POST_METADATA"]
        fil = {
            "PostId": post_id,
            "circle": circle_name,
            "user": UserEmail,
            "type": post_type,
        }
        r1 = dac.delete_many(fil)
        return r1.deleted_count
