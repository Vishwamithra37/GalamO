# This function is used to initialize the database
# User Initialization.
import config

dab = config.DB[config.DATABASE]
ALL_ANONYMOUS_USER_POWERS = [
    # "home_webpage",
    "get_posts_multi_filter_personal_user",
]
ALL_NORMAL_USER_POWERS = [
    "home_webpage",
    "get_circle_details",
    "create_circle",
    "login_user",
    "logout_user",
    "get_user_notifications",
    "mark_notification_as_read",
    "get_user_details",
    "get_posts_multi_filter_personal_user",
    "create_my_description",
    "reset_password_otp",
    "close_startup_screen",
    "aadhar_verification",
    "get_circles_in_the_area",
    "get_meta_data_of_link",
    "join_circle"
    # "voter_id_verification",
    # "API_Access_v1"
]
ALL_ADMIN_CIRCLE_POWERS = [
    "leave_circle",
    "delete_circle",
    "create_survey",
    "survey_vote",
    "get_specific_circle_details_of_user",
    "update_circle_details",
    "update_comment_post_reply",
    "create_post",
    "create_comment_reply",
    "get_replies",
    "get_posts",
    "get_comments",
    "follow_unfollow_post",
    "get_information_board_title_and_subtitle",
    "specific_circle_controlboard_webpage",
    "create_comment",
    "create_title_and_subtitle",
    "update_circle_information_board",
    "create_information_board",
    "get_pictures_from_mongodb",
    "get_information_and_announcement_board",
    "get_pictures_from_mongodb_for_single_post",
    "get_flair_tags_for_editor",
    "get_posts_multi_filter",
    "get_flair_tags_for_filters",
    "circle_search_engine",
    "close_post",
    "get_circle_users_details",
    "update_user_circle_powers",
    "find_single_circle_user",
    "report_post",
    "get_reported_posts",
    "get_more_reasons_for_report",
    "find_reported_post",
    "admin_lock_post",
    "get_all_circle_roles",
    "create_new_circle_role",
    "support_reject_info_card",
    "support_reject_post",
    "update_circle_role_powers",
    "update_role_order",
    "get_all_flair_tags",
    "get_specific_role_flairs",
    "update_circle_role_flair_tags",
    "create_new_flair_tag",
    "delete_flair_tag_from_general_pool",
    "update_user_role",
    "set_default_role_for_joining",
    "pin_unpin_post",
    "get_root_comment",
    "create_role_symbol",
    "delete_circle_role",
    "create_comment_privilaged",
    "get_circle_statistics",
    "move_verified_users_to_role",
    "API_update_area_of_circle",
]
ALL_GUEST_CIRCLE_POWERS = [
    "create_comment_reply",
    "create_comment",
    "create_post",
    "update_comment_post_reply",
    "leave_circle",
    "close_post",
    "create_comment_privilaged",
    "get_replies",
    "get_posts",
    "get_comments",
    "follow_unfollow_post",
    "get_information_board_title_and_subtitle",
    "get_pictures_from_mongodb",
    "get_information_and_announcement_board",
    "get_pictures_from_mongodb_for_single_post",
    "get_flair_tags_for_editor",
    "get_posts_multi_filter",
    "get_flair_tags_for_filters",
    "circle_search_engine",
    "get_all_flair_tags",
    "report_post",
    "get_root_comment",
    "support_reject_info_card",
    "support_reject_post",
    "get_circle_statistics",
]
ALL_ANONYMOUS_CIRCLE_POWERS = [
    "get_circle_statistics",
    "get_information_board_title_and_subtitle",
    "get_pictures_from_mongodb",
    "get_information_and_announcement_board",
    "get_pictures_from_mongodb_for_single_post",
    "get_posts_multi_filter",
    "get_flair_tags_for_filters",
    "get_all_flair_tags",
    "get_comments",
]
TRANSLATION_DICTIONARY = (
    {
        "type": "translation_of_powers_to_description",
        "circle_powers_to_description_translation": [
            {
                "power_description": "Basic powers to get, follow, search and support/reject , posts, comments and replies in the circle",
                "powers_list": [
                    "get_replies",
                    "get_posts",
                    "get_comments",
                    "follow_unfollow_post",
                    "get_information_board_title_and_subtitle",
                    "get_pictures_from_mongodb",
                    "get_information_and_announcement_board",
                    "get_pictures_from_mongodb_for_single_post",
                    "get_flair_tags_for_editor",
                    "get_posts_multi_filter",
                    "get_flair_tags_for_filters",
                    "circle_search_engine",
                    "get_all_flair_tags",
                    "report_post",
                    "get_root_comment",
                    "get_circle_statistics",
                ],
            },
            {
                "power_description": "Basic power to support and reject posts and info card without verification.",
                "powers_list": [
                    "support_reject_info_card",
                    "support_reject_post",
                ],
            },
            {
                "power_description": "Power to add pictures and PDFs in root comments. Single Power. Decent level security.",
                "powers_list": [
                    "create_comment_privilaged",
                ],
            },
            {
                "power_description": "Basic powers to create posts, comments and replies in the circle",
                "powers_list": [
                    "create_comment_reply",
                    "create_comment",
                    "create_post",
                ],
            },
            {
                "power_description": " Update posts, comments and replies.",
                "powers_list": [
                    "update_comment_post_reply",
                ],
            },
            {
                "power_description": "Single Power. To be able to vote in a survey post.",
                "powers_list": [
                    "survey_vote",
                ],
            },
            {
                "power_description": "Single Power. To be able to create a survey post.",
                "powers_list": [
                    "create_survey",
                ],
            },
            {
                "power_description": "Self power. Single Power. To be able to close post their own post.",
                "powers_list": [
                    "close_post",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Access to the specific circle controlboard",
                "powers_list": [
                    "specific_circle_controlboard_webpage",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Update circle description, tags and related circles.",
                "powers_list": [
                    "get_specific_circle_details_of_user",
                    "update_circle_details",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Update circle information board and title.",
                "powers_list": [
                    "create_title_and_subtitle",
                    "update_circle_information_board",
                    "create_information_board",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Update user roles and powers.",
                "powers_list": [
                    "get_circle_users_details",
                    "update_user_circle_powers",
                    "find_single_circle_user",
                    "update_user_role",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Update roles with flairs.",
                "powers_list": [
                    "get_specific_role_flairs",
                    "update_circle_role_flair_tags",
                    "create_new_flair_tag",
                    "delete_flair_tag_from_general_pool",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Create new roles and powers.",
                "powers_list": [
                    "get_all_circle_roles",
                    "create_new_circle_role",
                    "update_circle_role_powers",
                    "update_role_order",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. To be able to move verified users to a role.",
                "powers_list": [
                    "move_verified_users_to_role",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. To be able to moderate the reported posts, with the ability to take action on the post",
                "powers_list": [
                    "get_reported_posts",
                    "get_more_reasons_for_report",
                    "find_reported_post",
                    "admin_lock_post",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Single Power. To be able to create role symbol.",
                "powers_list": [
                    "create_role_symbol",
                ],
            },
            {
                "power_description": "HIGH LEVEL SECURITY. Single Power. To be able to delete a role in the circle.",
                "powers_list": [
                    "delete_circle_role",
                ],
            },
            {
                "power_description": "HIGH LEVEL POWER. Single Power. To be able to pin or unpin their own post.",
                "powers_list": [
                    "pin_unpin_post",
                ],
            },
            {
                "power_description": "HIGH LEVEL POWER. Single Power. To be able to set default role for joining.",
                "powers_list": [
                    "set_default_role_for_joining",
                ],
            },
            {
                "power_description": "HIGH LEVEL POWER. Single Power. To be able to Mute User below their role.",
                "powers_list": [
                    "mute_user",
                ],
            },
            {
                "power_description": "HIGH LEVEL POWER. Single Power. To be able to leave the circle.",
                "powers_list": [
                    "leave_circle",
                ],
            },
            {
                "power_description": "HIGH LEVEL POWER. API Access to add area polygon to the circle.",
                "powers_list": [
                    "API_update_area_of_circle",
                ],
            },
        ],
    },
)

Admin_User_Details = {
    "DisplayName": "Vishwa Mithra",
    "UserEmail": "mithravishwa37@gmail.com",
    "UserPassword": "82147c33675a632f07e8f959c38af8d4ddf4491207fe687c261b593c9202f4c7",
    "Available_username": "Yes",
    "startup_screen": "Yes",
    "Powers": ALL_NORMAL_USER_POWERS,
    "Role": "Founder_User",
    "Circles": [
        {
            "DisplayName": "MyCircle",
            "Powers": ALL_ADMIN_CIRCLE_POWERS,
            "Role": "Admin",
        },
    ],
    "CreatedAt": {"$date": "2023-06-03T02:57:07.443Z"},
    "VoterID_Verification": "No",
    "Aadhar_Number": "12648948984",
    "Voter_Number": "12357878987",
    "Aadhar_Verification": "No",
}
# Circle Initialization.
My_Circle_Details = {
    "DisplayName": "MyCircle",
    "Description": "Telugu movies and serials",
    "Circle_Tags": ["Movies", "State", "University"],
    "Related_Circles": ["Telangana"],
    "CreatorEmail": "mithravishwa37@gmail.com",
    "Roles": {
        "Admin": {
            "Role_Description": "The creator of the circle. Has all the powers in the circle.",
            "Role_Name": "Admin",
            "Role_Tags": [],
            "Role_Powers": ALL_ADMIN_CIRCLE_POWERS,
            "Role_Symbol": "👑",
        },
        "Guest": {
            "Role_Description": "A user who is not a resident nor voter but is on visit to the circle.",
            "Role_Name": "Guest",
            "Role_Tags": ["No Flair", "Guest Question"],
            "Role_Powers": ALL_GUEST_CIRCLE_POWERS,
            "Role_Symbol": "👁",
        },
    },
    "Roles_List": [
        "Admin",
        "Guest",
    ],
    "Flairs_List": ["No Flair", "Circle Announcement", "Guest Question"],
    "UpdaterEmail": "mithravishwa37@gmail.com",
    "Default_Role": "Guest",
    "isClosed": "No",
}
# Config Initialization.
Config_Details = [
    #   TAGS FOR CIRCLES
    {
        "type": "tags_for_circles",
        "User_Intended": "Admin and Above",
        "tags": [
            "Government",
            "Lok Sabha Constituency",
            "Vidhan Sabha Constituency",
            "Municipality",
            "Corporation",
            "Panchayat",
            "School",
            "Family",
            "Friends",
            "Apartment",
            "Neighbourhood",
            "Company",
            "Office",
            "College",
            "University",
            "City",
            "State",
            "Village",
            "Country",
            "World",
            "Sports",
            "Music",
            "Movies",
            "Books",
            "Technology",
            "Politics",
            "Science",
            "Art",
            "Gaming",
            "Food",
            "Fashion",
            "Travel",
            "Nature",
            "Health",
            "Education",
            "Business",
            "Religion",
            "Philosophy",
            "History",
            "Languages",
            "Other",
        ],
    },
    #   TRANSLATION OF POWERS TO DESCRIPTION
    dict(TRANSLATION_DICTIONARY),
    #  CIRCLE CREATION CONFIGURATIONS
    {
        "type": "circle_creation_configs",
        "Roles": {
            "Admin": {
                "Role_Description": "The creator of the circle. Has all the powers in the circle.",
                "Role_Name": "Admin",
                "Role_Tags": [],
                "Role_Powers": ALL_ADMIN_CIRCLE_POWERS,
                "Role_Symbol": "👑",
            },
            "Guest": {
                "Role_Description": "A user who is not a resident nor voter but is on visit to the circle.",
                "Role_Name": "Guest",
                "Role_Tags": ["No Flair", "Guest Question"],
                "Role_Powers": ALL_GUEST_CIRCLE_POWERS,
                "Role_Symbol": "👁",
            },
        },
        "Roles_List": ["Admin", "Guest"],
        "Flairs_List": ["No Flair", "Circle Announcement", "Guest Question"],
        "Default_Role": "Guest",
        "Default_Role_For_Verified_Users": "Guest",
        "Powers": [
            "home_webpage",
            "get_circle_details",
            "create_circle",
            "login_user",
            "logout_user",
            "get_user_notifications",
            "mark_notification_as_read",
            "get_user_details",
            "get_posts_multi_filter_personal_user",
            "create_my_description",
            "reset_password_otp",
            "aadhar_verification",
            "close_startup_screen",
        ],
    },
    #    OAUTH CONFIGURATIONS
    {
        "type": "oauth_configurations",
        "github": {
            "client_id": "7cd45f7dc42e9a6cfe10",
            "client_secret": "ce0b79999529b4ff45d5250558acc7e4d44855db",
            "scope": "user:email",
        },
        "google": {
            "client_id": "659751808140-1lpun5i290l08n9p261ec9h80b7gg7ba.apps.googleusercontent.com",
            "client_secret": "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",
            "scope": [
                "https://www.googleapis.com/auth/userinfo.profile",
                "openid",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
        },
        "OAUTHLIB_INSECURE_TRANSPORT": "0",
    },
]

Anonymous_User_Details = {
    "DisplayName": "Anonymous",
    "UserEmail": "Anonymous@galam.in",
    # "UserPassword": "82147c33675a632f07e8f959c38af8d4ddf4491207fe687c261b593c9202f4c7",
    "Available_username": "No",
    "startup_screen": "No",
    "Powers": ALL_ANONYMOUS_USER_POWERS,
    "Role": "Anonymous",
    "Circles": [
        {
            # "DisplayName": "Anonymous",
            "Powers": ALL_ANONYMOUS_CIRCLE_POWERS,
            "Role": "Anonymous",
        }
    ],
}

# Anonymous_User_Details = {
#     "DisplayName": "Anonymous",
#     "UserEmail": "Anonymous@galam.in",
#     # "UserPassword": "82147c33675a632f07e8f959c38af8d4ddf4491207fe687c261b593c9202f4c7",
#     "Available_username": "No",
#     "startup_screen": "No",
#     "Powers": [
#         "home_webpage",
#         "get_posts_multi_filter_personal_user",
#     ],
#     "Role": "Anonymous",
#     "Circles": [
#         {
#             "DisplayName": "Anonymous",
#             "Powers": [
#                 "get_circle_statistics",
#                 "get_information_board_title_and_subtitle",
#                 "get_pictures_from_mongodb",
#                 "get_information_and_announcement_board",
#                 "get_pictures_from_mongodb_for_single_post",
#                 "get_posts_multi_filter",
#                 "get_flair_tags_for_filters",
#                 "get_all_flair_tags",
#             ],
#             "Role": "Anonymous",
#         }
#     ],
# }


# User Initialization.
def actionable_db_initialization(
    Admin_User_Details2, My_Circle_Details2, Config_Details2
):
    dab["USER_DETAILS"].insert_one(Admin_User_Details2)
    dab["CIRCLES"].insert_one(My_Circle_Details2)
    for i in Config_Details2:
        dab["CONFIGS"].insert_one(i)


if (
    dab["USER_DETAILS"].find_one({"UserEmail": Admin_User_Details["UserEmail"]}) == None
    and dab["CIRCLES"].find_one({"DisplayName": My_Circle_Details["DisplayName"]})
    == None
    and dab["CONFIGS"].find_one({"type": Config_Details[0]["type"]}) == None
):
    actionable_db_initialization(Admin_User_Details, My_Circle_Details, Config_Details)

dab["OTP"].create_index("Timestamp", expireAfterSeconds=60 * 7)
