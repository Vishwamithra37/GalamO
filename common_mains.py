from random import randint
from requests import get as requester_get
from bs4 import BeautifulSoup
from re import escape
from flask import request
import dbops
from functools import wraps


def get_favoured_langauge_html(UserDetails, html_file_path):
    if "favoured_language" in list(UserDetails.keys()):
        return [
            UserDetails["favoured_language"] + "/" + html_file_path,
            UserDetails["favoured_language"],
        ]
    return [html_file_path, "en"]


def get_meta_data_of_link(link):
    meta_data = {}
    try:
        response = requester_get(link, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")
        meta_data["title"] = soup.find("meta", property="og:title")["content"]
        meta_data["description"] = soup.find("meta", property="og:description")[
            "content"
        ]

        meta_data["type"] = soup.find("meta", attrs={"property": "og:type"})["content"]
        meta_data["url"] = soup.find("meta", attrs={"property": "og:url"})["content"]
        meta_data["site_name"] = soup.find("meta", attrs={"property": "og:site_name"})[
            "content"
        ]
        meta_data["image"] = soup.find("meta", property="og:image")["content"]
        meta_data["keywords"] = soup.find("meta", attrs={"name": "keywords"})["content"]

        return meta_data
    except Exception as e:
        return meta_data


def create_random_string_of_10_chara():
    part1_array = [
        "Gani",
        "Jwala",
        "Kali",
        "Kala",
        "jeevam",
        "kanakam",
        "Katthi",
        "rabon",
        "vilantaka",
        "kuaw",
        "rawbs",
        "pesir",
        "shuesi",
        "honey",
        "ching",
        "chong",
        "kong",
        "hungry",
        "skele",
        "Jee",
        "tao",
        "resi",
    ]
    part2_array = [
        "yuwa",
        "machine",
        "robo",
        "happy",
        "sad",
        "evil",
        "red",
        "blood",
        "good",
        "bad",
        "awww",
        "wow",
        "wonder",
        "yeyy",
        "chunchumaru",
        "lepracon",
        "ganesh",
        "chanda",
        "krodam",
        "bedam",
        "gali",
        "aarti",
        "swati",
        "saraswati",
        "lakshmi",
    ]
    part3_array = [
        "123",
        "456",
        "789",
        "101",
        "202",
        "303",
        "404",
        "505",
        "606",
        "707",
        "808",
        "909",
        "000",
        "111",
        "222",
        "333",
        "444",
        "555",
        "666",
        "777",
        "888",
        "999",
        "000",
        "111",
        "222",
        "333",
        "444",
        "555",
        "666",
        "777",
        "888",
        "999",
    ]
    part4_array = [
        "Dreamer",
        "Dynamo",
        "Maestro",
        "Wizard",
        "Champion",
        "Ninja",
        "Rockstar",
        "Phoenix",
        "Rebel",
        "Diva",
        "Warrior",
        "Enigma",
        "Captain",
        "Sultan",
        "Jester",
        "Guru",
        "Sorcerer",
        "Siren",
        "Rhythm",
        "Pioneer",
        "Maverick",
        "Cosmic",
        "Galaxy",
        "Pixel",
        "Vortex",
        "Jungle",
        "Thriller",
        "Stardust",
        "Chaos",
        "Blossom",
    ]

    # Create a 10 digit word with at least one _ in it. If there are more charecters than 10, then cut it down to 10.
    # If there are less than 10 charecters, then add random charecters to it.

    while True:
        ran1 = randint(0, len(part1_array) - 1)
        ran2 = randint(0, len(part2_array) - 1)
        ran3 = randint(0, len(part3_array) - 1)
        ran4 = randint(0, len(part4_array) - 1)
        mixer = randint(0, 3)

        cutdown_by = randint(8, 12)
        if mixer == 0:
            word = (
                part4_array[ran4]
                + "_"
                + part2_array[ran2]
                + "_"
                + part3_array[ran3]
                + "_"
                + part1_array[ran1]
            )
        elif mixer == 1:
            word = (
                part1_array[ran1]
                + "_"
                + part4_array[ran4]
                + "_"
                + part2_array[ran2]
                + "_"
                + part3_array[ran3]
            )
        elif mixer == 2:
            word = (
                part2_array[ran2]
                + "_"
                + part3_array[ran3]
                + "_"
                + part4_array[ran4]
                + "_"
                + part1_array[ran1]
            )
        elif mixer == 3:
            word = (
                part3_array[ran3]
                + "_"
                + part1_array[ran1]
                + "_"
                + part4_array[ran4]
                + "_"
                + part2_array[ran2]
            )
        if len(word) > 12:
            word = word[:cutdown_by]
            return word


def if_in_circle(User_Details, CircleName: str):
    """Returns True if user exists in the circle else False"""

    if type(CircleName) != str or CircleName == "*":
        return False
    for i in User_Details["Circles"]:
        if i["DisplayName"] == CircleName:
            return True
    print("Jambalakadi bomba")
    return False


def circle_power_verification(User_Details, CircleName: str, powername: str):
    #     Make sure CircleName is a string and is not wildcard.
    if type(CircleName) != str or CircleName == "*":
        return ["You are not allowed to do this", 403]
    for i in range(len(User_Details["Circles"])):
        if User_Details["Circles"][i]["DisplayName"] == CircleName:
            spec_circle_index = i
            break
    if powername not in User_Details["Circles"][spec_circle_index]["Powers"]:
        return ["You are not allowed to do this", 403]
    return ["Successful", 200]


def get_all_powers_of_user(User_Detail, circle_name):
    """Returns the powers of the user in the circle. If the user is not in the circle, returns False"""
    for i in User_Detail["Circles"]:
        if i["DisplayName"] == circle_name:
            return i["Powers"]
    return False


def circle_role_getter(User_Details, CircleName):
    spec_circle_index = -1
    # print(User_Details["Circles"])
    for i in range(len(User_Details["Circles"])):
        if User_Details["Circles"][i]["DisplayName"] == CircleName:
            spec_circle_index = i
            break
    if spec_circle_index == -1:
        raise Exception("Circle not found")
    return User_Details["Circles"][spec_circle_index]["Role"]


def find_the_appropriate_description_for_powers(powers_dict_list, powers_list: list):
    r1 = []
    for i in powers_dict_list:
        r2 = {}
        r2["PowerName"] = i["power_description"]
        if all(j in powers_list for j in i["powers_list"]):
            r2["PowerStatus"] = "Yes"
        else:
            r2["PowerStatus"] = "No"
        r1.append(r2)
    return r1


def find_the_powers_list_from_power_description(powers_dict, power_description: str):
    for i in powers_dict:
        if i["power_description"] == power_description:
            return i["powers_list"]
    return False


def check_if_current_user_role_is_to_the_left_of_check_role(
    current_user_role: str, check_role: str, roles: list
):
    """Returns True if current_user_role is to the left of check_role in the roles list. Else returns False"""
    Index_current_user_role = roles.index(current_user_role)
    Index_check_role = roles.index(check_role)
    if Index_current_user_role < Index_check_role:
        return True
    return False


def get_index_of_item_in_list(lister, itemer):
    return lister.index(itemer)


def verify_rearranged_list(original_list, rearranged_list, user_role):
    must_not_change_order_list = original_list[: original_list.index(user_role) + 1]
    must_not_change_order_list_2 = rearranged_list[: original_list.index(user_role) + 1]
    if must_not_change_order_list != must_not_change_order_list_2:
        return False
    return True


# Fancy decorators starts here.


def general_user_power_verification(power_name):
    def decorator_function(route_function):
        @wraps(route_function)
        def wrapper_function(*args, **kwargs):
            UserDetails = dbops.get.get_user_token_details(
                request.session["Top_Secret_Token"]
            )
            power_name = route_function.__name__
            if not UserDetails:
                return {"status": "error", "message": "Invalid token"}, 400
            if not power_name in UserDetails["permissions"]:
                return {
                    "status": "error",
                    "message": "You do not have permission to get rented book list",
                }, 400
            return route_function(*args, **kwargs, UserDetails=UserDetails)

        return wrapper_function

    return decorator_function


def general_user_power_verification_with_circle(route_function):
    @wraps(route_function)
    def wrapper_function(*args, **kwargs):
        UserDetails = dbops.get.get_user_token_details(
            request.session["Top_Secret_Token"]
        )
        power_name = route_function.__name__
        circle_name = kwargs["circle_name"]
        if not UserDetails:
            return {"status": "error", "message": "Invalid token"}, 400
        if not power_name in UserDetails["permissions"]:
            return {
                "status": "error",
                "message": "You do not have permission to get rented book list",
            }, 400
        if not if_in_circle(UserDetails, circle_name):
            return {
                "status": "error",
                "message": "You do not have permission to get rented book list",
            }, 400
        return route_function(*args, **kwargs, UserDetails=UserDetails)

    return wrapper_function
