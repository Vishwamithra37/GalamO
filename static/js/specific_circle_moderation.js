var scrollers_states = {
    "circle_moderation_user_moderation": 0,
    "circle_moderation_content_moderation": 0,
    "circle_moderation_statistics": 0,
    "circle_moderation_flair_management": 0
}
var Roles_lister;
var feed_loader_counter_for_users = 1;
var noofuserprofiles_currently = 0;
var default_role_setter;
var Default_Role_For_Verified_Users;
$(document).ready(function () {
    let cards_div = document.createElement("div");
    $(cards_div).attr("id", "cards_div");
    $(cards_div).addClass("h-auto w-full");

    let control_divs = ['#Details',
        '#circle_moderation_user_moderation',
        '#circle_moderation_content_moderation',
        '#circle_moderation_statistics',
        '#circle_moderation_flair_management',
        '#Information_Board',
        '#Title_Manager'
    ];
    new top_circle_user_moderation().meta_function_to_change_colors(control_divs, "text-white", "text-yellow-500");
    new top_circle_user_moderation().meta_function_to_change_colors(control_divs, "dark:text-black", "dark:text-yellow-500");

    $("#circle_moderation_user_moderation").click(function () {
        $("#content_board").empty();

        let top_bar = new top_circle_user_moderation().top_circle_bar();
        let mydivs = [top_bar[1], top_bar[2]];
        new top_circle_user_moderation().meta_function_to_change_colors(mydivs, "text-gray-300", "text-yellow-500");
        new top_circle_user_moderation().meta_function_to_change_colors(mydivs, "dark:text-black", "dark:text-yellow-500");
        $('#content_board').append(top_bar[0]);

        let content_div = document.createElement("div");
        $(content_div).addClass("w-full h-auto");
        $(content_div).attr("id", "user_modetation_content_div");
        $('#content_board').append(content_div);
        $(top_bar[2]).attr('id', 'circle_moderation_role_settings')


        $(top_bar[1]).click(function () {
            $(content_div).empty();
            let first_call_1 = new circle_moderation_user_moderation_tools().User_Card_Complete2("Yes", "No", "No", {})
        });
        $(top_bar[1]).click();

        $(top_bar[2]).click(function () {
            //Empty everything under top_bar[0].
            $(top_bar[0]).siblings().empty();

            let title_div = new circle_moderation_user_moderation_tools().generic_div_creator(
                "text-gray-200 font-semibold p-2 flex flex-wrap",
                "Click on the role and drag it to the right or left to change the power hierarchy. The left roles can delete the right roles. 🛈 "
            )
            $(title_div).attr('title', 'Right click on the role to delete it.')

            let role_title_full_width_div = new circle_moderation_user_moderation_tools().full_length_div([title_div], "bg-black mt-2 p-2");
            let admin_div = new circle_moderation_user_moderation_tools().generic_div_creator(
                "p-2 text-gray-200 font-semibold bg-gray-800 hover:bg-gray-700 hover:text-white rounded-md",
                "Admin"
            )
            $(admin_div).attr('title', 'You cant change the power of this role. This enables the special power for creator to delete the circle.')
            widther_div_for_roles = new circle_moderation_user_moderation_tools().full_length_div([], "bg-black mt-2 p-2 border-yellow-400 rounded-md");
            $(widther_div_for_roles).attr('id', 'widther_div_for_roles_for_rearrangement_and_stuff');
            let create_new_role_div = new circle_moderation_user_moderation_tools().generic_div_creator(
                "p-2 mr-1 mt-1 mb-2 text-green-500 float-right ml-auto font-bold bg-black hover:bg-gray-900 hover:text-green-400 rounded-md cursor-pointer",
                "Create New Role"
            )
            let rearrange_roles_div = new circle_moderation_user_moderation_tools().generic_div_creator(
                "p-2 mr-1 mt-1 mb-2 text-gray-200 float-right ml-auto font-semibold bg-black hover:bg-gray-900 hover:text-white rounded-md cursor-pointer",
                "Rearrange Roles"
            )




            $(content_div).append(role_title_full_width_div)
            $(content_div).append(widther_div_for_roles);
            $(content_div).append(create_new_role_div);
            $(content_div).append(rearrange_roles_div);

            $(create_new_role_div).click(function () {
                new circle_role_control_tools().create_new_role_floating_div(widther_div_for_roles);
            });
            $(rearrange_roles_div).click(function () {
                if ($(widther_div_for_roles).hasClass("border") == true) {
                    $(widther_div_for_roles).removeClass("border p-6 cursor-pointer")
                    $(rearrange_roles_div).text("Rearrange Roles")
                    // Get the children roles and send it to the api.
                    let children_roles = $(widther_div_for_roles).children();
                    let children_roles_array = [];
                    for (let i = 0; i < children_roles.length; i++) {
                        let role_name = $(children_roles[i]).attr('data-role_name');
                        children_roles_array.push(role_name);
                    }
                    new circle_role_control_tools().rearrange_roles_api_caller(children_roles_array);

                }
                else {
                    $(widther_div_for_roles).addClass("border p-6 cursor-pointer");
                    $(rearrange_roles_div).text("Finish Rearranging")
                }
                new circle_role_control_tools().toggle_dragging(widther_div_for_roles);
            });



            // This is where we deal with the roles.
            new circle_role_control_tools().refresh_role_list(widther_div_for_roles);


            // This is where we deal with the roles.








            let big_scroll_auto_div = new circle_moderation_user_moderation_tools().generic_appender_div(
                [],
                'w-full overflow-y-auto mt-4 p-0'
            )
            $(big_scroll_auto_div).attr('id', 'big_scroll_auto_div_for_roles');
            $(content_div).append(big_scroll_auto_div);
            let ex_data = {
                "Role_Name": "Admin",
                "Role_Description": "This is the admin role. This role can delete all the other roles. This role is created by default and cannot be deleted.",
                "role_color": "#FF0000",
                "role_power": "100",
                "role_id": "1"

            }
            // new circle_role_control_tools().role_data_card(ex_data, big_scroll_auto_div)


        });


    });

    $("#circle_moderation_content_moderation").click(function () {
        $("#content_board").empty();
        let url_to_call = "/api/v1/circle/" + $('#Circle_Name_MAINS').text() + "/get_reported_posts"
        let number_of_reports_to_skip = '0';
        url_to_call = url_to_call + '?skip=' + number_of_reports_to_skip;

        let searcher_wrapper = new circle_moderation_content_moderation_tools().search_bar_and_user_count();
        $('#content_board').append(searcher_wrapper);
        let reports_div = document.createElement("div");
        $(reports_div).attr("id", "reports_div");
        $(reports_div).addClass("h-auto w-full flex flex-col overflow-y-auto");
        $('#content_board').append(reports_div);

        let all_users_in_the_circle = new APICALLS().GenericAPICall(url_to_call, "GET", {}).then(function (data) {
            $(reports_div).empty();
            let len_of_reports = data["Reported_Posts"].length;
            for (let i = 0; i < len_of_reports; i++) {
                console.log(data["Reported_Posts"][i]);
                let report_card = new circle_moderation_content_moderation_tools().report_card_component(data["Reported_Posts"][i]);
                $(reports_div).append(report_card);
            }
        });

        let feeder_div = $(reports_div)
        let feed_loader_counter_for_users = 1;
        $(feeder_div).scroll(function (e) {
            let scroll_percentage = new circle_moderation_content_moderation_tools().calculateScrollPercentage(feeder_div);
            if (scroll_percentage > 80 && feed_loader_counter_for_users == 0) {
                try {
                    noofuserprofiles_currently = parseInt(noofuserprofiles_currently) + 10;
                    let r1 = new circle_moderation_content_moderation_tools().report_card_complete(noofuserprofiles_currently, data, "No", "No");
                } catch (error) {
                    feed_loader_counter_for_users = 1;
                }
            }
        });
    });

    $("#circle_moderation_statistics").click(function () {
        $("#content_board").empty();
    });

    $("#circle_moderation_flair_management").click(function () {
        $("#content_board").empty();
        let whole_wrapper = new flair_management_moderation_tools().generic_div_creator("w-full h-auto flex flex-row");
        $("#content_board").append(whole_wrapper);
        let left_wrapper = new flair_management_moderation_tools().left_box_creator_all_flairs();
        $(whole_wrapper).append(left_wrapper[0]);
        let right_wrapper = new flair_management_moderation_tools().righ_box_creator_role_specific_flairs();
        $(whole_wrapper).append(right_wrapper[0]);
        let all_sub_tags_pool_gen = $(left_wrapper[1]);
    });

    $('#Details').click();
});



class top_circle_user_moderation {
    top_circle_bar() {
        let wrapper_div = document.createElement("div");
        let option_1 = document.createElement("button");
        let option_2 = document.createElement("button");

        $(wrapper_div).addClass("w-full bg-black flex flex-row justify-start items-center p-2");
        $(option_1).addClass("text-base p-2 text-gray-300 font-semibold rounded-md bg-gray-800 hover:bg-gray-700 outline-none");
        $(option_2).addClass("text-base p-2 text-gray-300 font-semibold rounded-md bg-gray-800 hover:bg-gray-700 outline-none ml-2");

        $(option_1).text("User Moderation");
        $(option_2).text("Role Settings");

        $(wrapper_div).append(option_1);
        $(wrapper_div).append(option_2);


        return [wrapper_div, option_1, option_2]
    }

    generic_div_creator(options) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass(options["class"]);
        $(wrapper_div).text(options["text"]);
        return wrapper_div;
    }

    meta_function_to_change_colors(mydivs, default_text_color, active_text_color) {
        // mydivs is an array of divs.
        // If the div is active, then the text color should be active_text_color, else default_text_color.
        let len_of_divs = mydivs.length;
        for (let i = 0; i < len_of_divs; i++) {
            $(mydivs[i]).click(function () {
                $(mydivs).each(function () {
                    $(this).removeClass(active_text_color);
                    $(this).addClass(default_text_color);
                });
                $(this).removeClass(default_text_color);
                $(this).addClass(active_text_color);
            });
        }

    }


}
class circle_moderation_user_moderation_tools {
    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }
    async user_role_update(options) {
        let data_to_send = {
            "userid": options["userid"],
            "update_to_new_role": options["update_to_new_role"],
        }
        let url = '/api/v1/circle/user_moderation/update_user_role/' + $('#Circle_Name_MAINS').text();
        let all_flair_tags = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        });
        return all_flair_tags;
    }
    async user_mute(options) {
        let data_to_send = {
            "userid": options["userid"],
            "action": options["action"],
        }
        let url = '/api/v1/circle/user_moderation/mute_user/' + $('#Circle_Name_MAINS').text();
        let all_flair_tags = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        });
        return all_flair_tags;
    }

    // The user power controls.  
    // The card makers for the indvidual users
    User_Card_Complete2(first_load = "No", reset_button = "No", search_bar = "No", search_data = {}) {
        // There are basically 3 Times when this function is called.
        // 1. When the user_moderation button is clicked.
        // 2. When the reset button is clicked. 
        // 3. When the search bar is used.
        // And thats all.
        // We need to clear the content_board in the first case.
        // In the second case, we need to clear the cards_div.
        // In the third case, we need to clear the cards_div.
        // The two global variables which track the required scrolling and stuff are:
        // var feed_loader_counter_for_users = 1;
        // var noofuserprofiles_currently = 0;

        if (first_load == "Yes") {
            // $('#content_board').append(content_div);
            $('#content_div').remove();
            let content_div = document.createElement("div");
            $(content_div).attr("id", "content_div");
            $(content_div).addClass("h-auto w-full flex flex-col justify-start items-center");
            let cards_div = document.createElement("div");
            $(cards_div).attr("id", "cards_div");
            $(cards_div).addClass("h-auto w-full overflow-y-scroll");

            $('#content_board').append(content_div);

            feed_loader_counter_for_users = 0;
            noofuserprofiles_currently = 0;

            let searcher_wrapper = new circle_moderation_user_moderation_tools().search_bar_and_user_count(search_data);
            $(content_div).append(searcher_wrapper);
            $(content_div).append(cards_div);
            let data_maker = new circle_moderation_user_moderation_tools().user_loader_call(noofuserprofiles_currently).then(function (data) {
                $('#cards_div').empty();
                let len_of_users = data["Circle_Users_Details"].length;
                for (let i = 0; i < len_of_users; i++) {
                    let user_card = new circle_moderation_user_moderation_tools().user_row_component(data["Circle_Users_Details"][i], data["Roles_List"]);
                    $('#cards_div').append(user_card);
                }
                // Now we need to add the scroll listener to the content_board.
                let feeder_div = $('#content_board')
                $(feeder_div).unbind('scroll');
                $(feeder_div).scroll(function (e) {
                    let scroll_percentage = new circle_moderation_user_moderation_tools().calculateScrollPercentage(feeder_div);
                    if (scroll_percentage > 20 && feed_loader_counter_for_users == 0) {
                        noofuserprofiles_currently = parseInt(noofuserprofiles_currently) + 10;
                        new circle_moderation_user_moderation_tools().user_loader_call(noofuserprofiles_currently).then(function (findata) {
                            let len_of_users = findata["Circle_Users_Details"].length;
                            for (let i = 0; i < len_of_users; i++) {
                                let user_card = new circle_moderation_user_moderation_tools().user_row_component(findata["Circle_Users_Details"][i], findata["Roles_List"]);
                                $('#cards_div').append(user_card);
                            }
                        })
                    }
                });
            })
        }
        if (reset_button == "Yes") {
            let to_append_to = $('#cards_div')
            let content_board = $('#content_board')
            let content_div = $('#content_div')
            $(to_append_to).empty();
            feed_loader_counter_for_users = 0;
            noofuserprofiles_currently = 0;
            let data_maker = new circle_moderation_user_moderation_tools().user_loader_call(noofuserprofiles_currently).then(function (data) {
                let len_of_users = data["Circle_Users_Details"].length;
                for (let i = 0; i < len_of_users; i++) {
                    let user_card = new circle_moderation_user_moderation_tools().user_row_component(data["Circle_Users_Details"][i], data["Roles_List"]);
                    $('#cards_div').append(user_card);
                }
                // Now we need to add the scroll listener to the content_board.
                let feeder_div = $('#content_board')
                $(feeder_div).unbind('scroll');
                $(feeder_div).scroll(function (e) {
                    let scroll_percentage = new circle_moderation_user_moderation_tools().calculateScrollPercentage(feeder_div);
                    if (scroll_percentage > 20 && feed_loader_counter_for_users == 0) {
                        noofuserprofiles_currently = parseInt(noofuserprofiles_currently) + 10;
                        new circle_moderation_user_moderation_tools().user_loader_call(noofuserprofiles_currently).then(function (findata) {
                            let len_of_users = findata["Circle_Users_Details"].length;
                            for (let i = 0; i < len_of_users; i++) {
                                let user_card = new circle_moderation_user_moderation_tools().user_row_component(findata["Circle_Users_Details"][i], findata["Roles_List"]);
                                $('#cards_div').append(user_card);
                            }
                        })
                    }
                });
            })
        }
        if (search_bar == "Yes") {
            $('#cards_div').empty();
            let len_of_users = search_data["Circle_Users_Details"].length;
            for (let i = 0; i < len_of_users; i++) {
                let user_card = new circle_moderation_user_moderation_tools().user_row_component(search_data["Circle_Users_Details"][i], search_data["Roles_List"]);
                $('#cards_div').append(user_card);
            }
        }

    }
    user_row_component(options, Roles_List = []) {
        let mega_wrapper = document.createElement("div");
        let wrapper_div = document.createElement("div");
        let user_basic_details_div = document.createElement("div");
        let user_actions_div = document.createElement("div"); // This will contain the buttons such as kick, promote, demote etc.

        $(mega_wrapper).addClass("w-full h-auto flex flex-col bg-gray-700 mb-1");
        $(wrapper_div).addClass("w-full p-2 flex bg-black flex-row justify-between items-center border-2 border-gray-800 hover:border-gray-700 rounded-md");
        $(user_basic_details_div).addClass("flex flex-col justify-center items-center");
        $(user_actions_div).addClass("flex flex-row justify-center items-center");

        let user_display_name = document.createElement("p");
        let user_join_date = document.createElement("p");

        $(user_display_name).addClass("text-base text-yellow-500 font-semibold");
        $(user_join_date).addClass("text-sm text-gray-200 font-semibold");
        $(user_display_name).text(options["DisplayName"]);
        // $(user_join_date).text("Joining Date: "  + options["JoinDate"]);

        let ban_button = document.createElement("button");
        let mute_button = document.createElement("button");
        let dropdown_roles = document.createElement("select");
        let dropdown_roles_options = Roles_List;

        $(dropdown_roles).addClass("p-2 text-gray-200 font-semibold rounded-md hover:text-gray-300 bg-gray-800 hover:bg-gray-700 outline-none");
        let dropdown_roles_option_length = dropdown_roles_options.length;
        for (let i = 0; i < dropdown_roles_option_length; i++) {
            let option_single = document.createElement("option");
            $(option_single).text(dropdown_roles_options[i]);
            $(dropdown_roles).append(option_single);
        }
        $(dropdown_roles).attr("data-userid", options["userid"]);
        $(dropdown_roles).attr("data-current_role", $(dropdown_roles).find(":selected").text());
        $(dropdown_roles).change(function () {
            let selected_role = $(this).find(":selected").text();
            let userid = $(this).attr("data-userid");
            let data_to_send = {
                "userid": userid,
                "update_to_new_role": selected_role,
            }
            let caller = new circle_moderation_user_moderation_tools().user_role_update(data_to_send).then(function (data) {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Role Updated Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
                $(dropdown_roles).attr("data-current_role", selected_role);
            }).catch(function (error) {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Role Update Failed!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
                // Click the current selected role.
                $(dropdown_roles).val($(dropdown_roles).attr("data-current_role"));
            });
        });


        $(user_actions_div).append(dropdown_roles);
        // Select the one in options["Role"]
        $(dropdown_roles).find("option:contains('" + options["circle_role"] + "')").attr("selected", true);


        $(ban_button).addClass("w-20 h-8 text-red-500  font-semibold rounded-md hover:text-red-600");
        $(mute_button).addClass("w-20 h-8 text-yellow-500 font-semibold rounded-md hover:text-yellow-600");

        $(ban_button).text("Ban 🛇");
        $(mute_button).text("Mute");
        $(ban_button).attr("title", "Ban the user");
        $(mute_button).attr("title", "Mute the user");
        $(mute_button).attr("data-mute_status", "mute");

        if (options["Muted"] == "Yes") {
            $(mute_button).text("unmute");
            $(mute_button).attr("title", "Unmute the user");
            $(mute_button).attr("data-mute_status", "unmute");
        }

        $(mute_button).click(function () {
            let userid = options["userid"];
            let action = $(this).attr("data-mute_status")
            let data_to_send = {
                "userid": userid,
                "action": action,
            }
            let caller = new circle_moderation_user_moderation_tools().user_mute(data_to_send).then(function (data) {
                if (action == "mute") {
                    $(mute_button).text("Unmute");
                    $(mute_button).attr("title", "Unmute the user");
                    $(mute_button).attr("data-mute_status", "unmute");
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Muted Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);

                } else {
                    $(mute_button).text("Mute");
                    $(mute_button).attr("title", "Mute the user");
                    $(mute_button).attr("data-mute_status", "mute");
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Unmuted Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                }
            }).catch(function (error) {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Mute Action Failed!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
            });
        });

        // $(user_actions_div).append(ban_button);
        $(user_actions_div).append(mute_button);


        $(user_basic_details_div).append(user_display_name);
        $(user_basic_details_div).append(user_join_date);

        $(wrapper_div).append(user_basic_details_div);
        $(wrapper_div).append(user_actions_div);

        $(mega_wrapper).append(wrapper_div);

        let power_wrapping_glue_card = new circle_moderation_user_moderation_tools().glue_between_user_and_power(options, mega_wrapper);

        return power_wrapping_glue_card;
    }

    glue_between_user_and_power(example_user, user_card) {
        let nice_hiding_div = document.createElement("div");
        $(nice_hiding_div).addClass("w-52 bg-black rounded-b-md hover:text-gray-100 p-1 text-xs float-right ml-auto text-center text-gray-200 font-semibold cursor-pointer");
        $(nice_hiding_div).text("Show Powers of the user");
        let len_of_powers = example_user["circle_powers"].length;
        let power_wrapper = document.createElement("div");
        $(power_wrapper).addClass("hidden w-full flex flex-col justify-between items-center  bg-gray-800 rounded-b-md");
        for (let i = 0; i < len_of_powers; i++) {
            let counter = i + 1;
            example_user["circle_powers"][i]["serialNumber"] = counter + ". ";
            let power_card = new circle_moderation_user_moderation_tools().user_power_component(example_user["circle_powers"][i], example_user);
            $(power_wrapper).append(power_card);
        }
        $(user_card).append(power_wrapper);
        $(nice_hiding_div).click(function () {
            if ($(power_wrapper).hasClass('hidden')) {
                $(power_wrapper).removeClass('hidden');
                $(nice_hiding_div).text("Hide Powers of the user");
            } else if ($(power_wrapper).hasClass('hidden') == false) {
                $(power_wrapper).addClass('hidden');
                $(nice_hiding_div).text("Show Powers of the user");
            }
        });
        $(user_card).append(nice_hiding_div);
        return user_card;
    }
    user_power_component(options, example_user) {
        let wrapper_div = document.createElement("div");
        let power_name = document.createElement("div");
        let slide_button = new circle_moderation_user_moderation_tools().the_slider_component(options, example_user);

        $(wrapper_div).addClass("w-full p-2  flex bg-black flex-row justify-between items-center rounded-md");
        $(power_name).addClass("text-sm text-yellow-500 font-semibold");

        $(power_name).text(options["serialNumber"] + options["PowerName"]);

        $(wrapper_div).append(power_name);
        $(wrapper_div).append(slide_button);

        return wrapper_div;
    }
    the_slider_component(on_or_off, options) {
        let slider_wrapper = document.createElement("div");
        let rounded_slider = document.createElement("div");

        $(slider_wrapper).addClass("w-20 h-4 bg-gray-800 rounded-full mr-4 cursor-pointer");
        $(rounded_slider).addClass("w-10 h-4 bg-gray-500 rounded-full");

        // On click of the slider, the rounded slider should move to the other side.

        let trigger_data = {
            "userid": options["userid"],
            "power_description": on_or_off["PowerName"]
        }
        let url_to_call = "/api/v1/circle/update_user_power/" + $('#Circle_Name_MAINS').text()


        $(slider_wrapper).click(function () {
            console.log(trigger_data);
            if ($(rounded_slider).hasClass("ml-10") == false) {
                trigger_data["action"] = "add";

                new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(trigger_data)).then(function (data) {
                    $(rounded_slider).addClass("ml-10");
                    $(slider_wrapper).addClass("bg-green-500");
                }).catch(function (error) {
                    console.log(error);
                    return false;
                });
            }
            else {
                trigger_data["action"] = "remove";

                new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(trigger_data)).then(function (data) {
                    $(rounded_slider).removeClass("ml-10");
                    $(slider_wrapper).removeClass("bg-green-500");
                }).catch(function (error) {
                    console.log(error);
                    return false;
                });

            }
        }
        );
        if (on_or_off["PowerStatus"] == "Yes") {
            $(rounded_slider).addClass("ml-10");
            $(slider_wrapper).addClass("bg-green-500");
        }

        $(slider_wrapper).append(rounded_slider);

        return slider_wrapper;
    }
    // The card makers for the indvidual users
    search_bar_and_user_count(data) {
        let wrapper_div = document.createElement("div");
        let search_wrapper = document.createElement("div");
        let search_bar = document.createElement("input");
        let reset_button = document.createElement("button");
        let user_count = document.createElement("span");

        $(wrapper_div).addClass('w-full flex flex-row justify-between p-2');
        $(search_wrapper).addClass('flex flex-row justify-start');
        $(search_bar).addClass('w-52 text-base bg-gray-800 rounded-md p-2 text-gray-200 font-semibold outline-none');
        $(search_bar).attr("placeholder", "Search for a user by name");
        $(reset_button).addClass('text-base bg-gray-800 rounded-md ml-2 p-2 text-gray-200 font-semibold outline-none hover:text-white cursor-pointer');
        $(reset_button).text("Reset");

        $(user_count).addClass('bg-gray-800 rounded-md p-2 text-gray-200 font-semibold text-right');
        // $(user_count).text("Users involved with the circle: " + data["Total_Users"]);

        $(search_wrapper).append(search_bar);
        $(search_wrapper).append(reset_button);
        $(wrapper_div).append(search_wrapper);

        // $(wrapper_div).append(user_count);


        $(search_bar).keyup(function () {
            // Start after 2 characters.
            if ($(search_bar).val().length > 2) {
                let calling = new circle_moderation_user_moderation_tools().search_api_call($(search_bar).val()).then(function (data) {
                    new circle_moderation_user_moderation_tools().User_Card_Complete2("No", "No", "Yes", data);
                });

            }
        });

        $(reset_button).click(function () {
            $(search_bar).val('');
            new circle_moderation_user_moderation_tools().User_Card_Complete2("No", "Yes", "No", {});
        });

        return wrapper_div;
    }
    async search_api_call(search_term) {
        let url_to_call = '/api/v1/circle/find_circle_user/' + $('#Circle_Name_MAINS').text()
        let data_to_send = {
            "DisplayName": search_term
        }
        let all_users_in_the_circle = await new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        });
        return all_users_in_the_circle;
    }
    async user_loader_call(skipper) {
        let url_to_call = "/api/v1/circle/get_circle_users_details/" + $('#Circle_Name_MAINS').text();
        url_to_call = url_to_call + '?skip=' + skipper;
        if (feed_loader_counter_for_users == 0) {
            feed_loader_counter_for_users = 1;
            let r1 = await new APICALLS().GenericAPIJSON_CALL(url_to_call, "GET", "").then(function (data) {
                feed_loader_counter_for_users = 0;
                return data;
            }).catch(function (error) {
                feed_loader_counter_for_users = 1;
            });
            return r1;
        }
        return false;
    }
    // The user power roles

    // Circle power controls.
    full_length_div(inner_divs, bg_of_wrapper) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full h-auto flex flex-row");
        $(wrapper_div).addClass(bg_of_wrapper);
        let len_of_divs = inner_divs.length;
        for (let i = 0; i < len_of_divs; i++) {
            $(wrapper_div).append(inner_divs[i]);
        }
        return wrapper_div;
    }
    generic_appender_div(inner_divs, classer) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass(classer)
        let len_of_divs = inner_divs.length;
        for (let i = 0; i < len_of_divs; i++) {
            $(wrapper_div).append(inner_divs[i]);
        }
        return wrapper_div;
    }
    generic_div_creator(classer, texter) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass(classer);
        $(wrapper_div).html(texter);
        return wrapper_div;
    }

    // Circle power controls.

}
class circle_role_control_tools {
    async create_new_role_api_caller(options) {
        let url = "/api/v1/circle/user_moderation/create_new_role/" + $('#Circle_Name_MAINS').text();
        let data_to_send = {
            "role_name": options["role_name"],
            "role_description": options["role_description"],
        }
        data_to_send = JSON.stringify(data_to_send);
        let calling = await new APICALLS().GenericAPIJSON_CALL(url, "POST", data_to_send).then(function (data) {
            console.log(data);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Role created Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
            return data;
        }).catch(function (error) {
            console.log(error);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Error creating role!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        });
    }
    async add_role_symbol_api_caller(symbol, role_name) {
        let url = '/api/v1/circle/' + $('#Circle_Name_MAINS').text() + '/create_role_symbol'
        let data_to_send = {
            "role_name": role_name,
            "role_symbol": symbol
        }
        data_to_send = JSON.stringify(data_to_send);
        let calling = await new APICALLS().GenericAPIJSON_CALL(url, "POST", data_to_send).then(function (data) {
            console.log(data);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Role Symbol added Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
            return data;
        }).catch(function (error) {
            console.log(error);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Error adding role symbol!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        });
        return calling;
    }
    async rearrange_roles_api_caller(role_list) {
        let url = '/api/v1/circle/user_moderation/update_role_order/' + $('#Circle_Name_MAINS').text();
        let data_to_send = {
            "Rearranged_Roles": role_list
        }
        data_to_send = JSON.stringify(data_to_send);
        let calling = await new APICALLS().GenericAPIJSON_CALL(url, "POST", data_to_send).then(function (data) {
            console.log(data);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Role order updated Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
            return data;
        }).catch(function (error) {
            console.log(error);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Error updating role order!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
            return error;
        });

    }
    async get_all_roles_api_caller() {
        let url = "/api/v1/circle/user_moderation/get_all_roles/" + $('#Circle_Name_MAINS').text();
        let calling = new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            return data["Roles_List"];
        });
        return calling;
    }
    async set_as_default_joining_role_api_caller(role_name) {
        let url = "/api/v1/circle/set_default_role_for_joining/" + $('#Circle_Name_MAINS').text();
        let data_to_send = {
            "RoleName": role_name
        }
        data_to_send = JSON.stringify(data_to_send);
        let calling = await new APICALLS().GenericAPIJSON_CALL(url, "POST", data_to_send).then(function (data) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Default role set Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return data;
        }).catch(function (error) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Error setting default role!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        });
        return calling;
    }
    async move_joining_role_for_verified_users_api_caller(role_name) {
        let url = "/api/v1/circle/move_verified_users_to_role/" + $('#Circle_Name_MAINS').text() + "?role_name=" + role_name;
        let calling = await new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Verified users moved to new role Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return data;
        }
        ).catch(function (error) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Error moving verified users to new role!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        }
        );
        return calling;
    }

    async delete_role_api_caller(role_name) {
        let url = "/api/v1/circle/user_moderation/delete_circle_role/" + $('#Circle_Name_MAINS').text();
        let data_to_send = {
            "Role_Name": role_name
        }
        data_to_send = JSON.stringify(data_to_send);
        let calling = await new APICALLS().GenericAPIJSON_CALL(url, "POST", data_to_send).then(function (data) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Role deleted Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return data;
        }).catch(function (error) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification(error, ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        })
        return calling;
    }
    refresh_role_list(thewidth_div) {
        let url = "/api/v1/circle/user_moderation/get_all_roles/" + $('#Circle_Name_MAINS').text();
        let calling = new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            console.log(data);
            $(thewidth_div).empty();
            default_role_setter = data["Default_Role"];
            Default_Role_For_Verified_Users = data["Default_Role_For_Verified_Users"];
            let role_data_list = Object.keys(data["Roles"])
            let the_role_list = []
            let Roles_By_Order_len = data["Roles_List"].length;
            for (let i = 0; i < Roles_By_Order_len; i++) {
                let role_data = data["Roles"][data["Roles_List"][i]];
                let role_card = role_smol_card(role_data);
                the_role_list.push(role_card);
                $(role_card).click(function () {
                    let thediv = $('#big_scroll_auto_div_for_roles');
                    $(thediv).empty();

                    new circle_role_control_tools().role_data_card(role_data, thediv);
                });
                $(thewidth_div).append(role_card);
            }
            new top_circle_user_moderation().meta_function_to_change_colors(the_role_list, 'text-gray-200', 'text-yellow-500');
            return data;
        });
        function role_smol_card(role_data) {
            let role_div = new circle_moderation_user_moderation_tools().generic_div_creator(
                "p-2 ml-2 text-gray-200 font-semibold bg-gray-800 hover:bg-gray-700 hover:text-white rounded-md",
                role_data["Role_Name"]
            )
            $(role_div).attr('data-role_data', JSON.stringify(role_data));
            $(role_div).attr('data-role_name', role_data["Role_Name"]);
            return role_div;
        }
    }
    generic_input_creator(input_type, input_placeholder, input_class) {
        let input = document.createElement("input");
        $(input).attr("type", input_type);
        $(input).attr("placeholder", input_placeholder);
        $(input).addClass(input_class);
        return input;
    }
    create_new_role_floating_div(widther_div_for_roles) {
        let wrapper_form = document.createElement("form");
        let title_div = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 w-96 font-semibold text-lg",
            "Role Name: "
        );
        let title_input = this.generic_input_creator(
            "text",
            "Role Name",
            "w-96 bg-gray-800 p-2 rounded-md text-gray-200 font-semibold outline-none"
        );
        // A minimum of 2 and a maximum of 20 characters are allowed.
        $(title_input).attr("minlength", "2");
        $(title_input).attr("maxlength", "20");
        $(title_input).attr("required", "true");
        $(title_input).attr("name", "role_name");
        let role_description_title = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 w-96 font-semibold text-lg",
            "Role Description: "
        );

        let role_description_input = document.createElement("textarea");
        $(role_description_input).attr("placeholder", "Role Description");
        $(role_description_input).addClass("w-96 bg-gray-800 p-2 rounded-md text-gray-200 font-semibold outline-none");
        $(role_description_input).attr("rows", "3");
        // A min of 10 and a max of 100 characters are allowed.
        $(role_description_input).attr("minlength", "10");
        $(role_description_input).attr("maxlength", "100");
        $(role_description_input).attr("required", "true");
        $(role_description_input).attr("name", "role_description");
        $(wrapper_form).append(title_div);
        $(wrapper_form).append(title_input);
        $(wrapper_form).append(role_description_title);
        $(wrapper_form).append(role_description_input);

        let create_button = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-lg bg-green-800 hover:bg-green-600 hover:text-white rounded-md p-2 mt-2 cursor-pointer",
            "Create Role"
        );
        let cancel_button = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-lg bg-gray-800 hover:bg-gray-700 hover:text-white rounded-md p-2 mt-2 cursor-pointer",
            "Cancel"
        );

        let final_bot = new floating_notifications_orginal().multi_col_div_ontop(
            [
                wrapper_form
            ],
            create_button,
            cancel_button,
        )
        $('body').append(final_bot);

        $(create_button).click(function () {
            // Validate the form.
            wrapper_form.checkValidity();
            if (wrapper_form.checkValidity()) {
                let data_to_send = {
                    "role_name": $(title_input).val(),
                    "role_description": $(role_description_input).val(),
                }
                let action = new circle_role_control_tools().create_new_role_api_caller(data_to_send).then(function (data) {
                    new circle_role_control_tools().refresh_role_list(widther_div_for_roles);
                });
                $(final_bot).remove();

            } else {
                wrapper_form.reportValidity();
            }
        });
        $(cancel_button).click(function () {
            $(final_bot).remove();
        });



    }
    toggle_dragging(the_div) {
        if ($(the_div).hasClass("ui-draggable")) {
            $(the_div).draggable("destroy");
            $(the_div).sortable("destroy");
        } else {
            $(the_div).sortable({
                revert: true
            });
            $(the_div).draggable({
                helper: "clone",
                revert: "invalid"
            });
        }
    }
    role_data_card(role_data, widther_for_the_card) {
        let basic_details_wrapper = new circle_moderation_user_moderation_tools().generic_div_creator(
            "w-full p-2 flex flex-row bg-black",
            ""
        )
        let det_wrap = document.createElement("div");
        $(det_wrap).addClass("flex flex-col");
        let role_name = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-lg",
            role_data["Role_Name"]
        )
        let role_description = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-400 font-semibold text-sm",
            role_data["Role_Description"]
        )
        let but_wrap = document.createElement("div");
        $(but_wrap).addClass("flex flex-row");
        let role_description_edit_button = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-sm bg-black mr-2 hover:bg-gray-900 hover:text-white rounded-t-md p-2 cursor-pointer",
            "Edit description"
        )
        let set_as_default_joining_role = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-sm bg-black hover:bg-gray-900 hover:text-white rounded-t-md p-2 mr-2 cursor-pointer",
            "Set as default joining role"
        )
        let move_joining_role_for_verified_users = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-sm bg-black hover:bg-gray-900 hover:text-white rounded-t-md p-2 mr-2 cursor-pointer",
            "Move verified users here"
        )
        let special_symbol_setter = new circle_role_control_tools().role_symbol_edit_tag(role_data);

        if (role_data["Role_Name"] == default_role_setter) {
            $(set_as_default_joining_role).text("Default role");
            $(set_as_default_joining_role).removeClass('bg-black hover:bg-gray-900');
            $(set_as_default_joining_role).addClass('bg-green-700')

        }

        if (role_data["Role_Name"] == Default_Role_For_Verified_Users) {
            $(move_joining_role_for_verified_users).text("Default Verified users role");
            $(move_joining_role_for_verified_users).removeClass('bg-black hover:bg-gray-900');
            $(move_joining_role_for_verified_users).addClass('bg-green-700')
        }

        $(set_as_default_joining_role).click(function () {
            let action = new circle_role_control_tools().set_as_default_joining_role_api_caller(role_data["Role_Name"]).then(function (data) {
                default_role_setter = role_data["Role_Name"];
                $(set_as_default_joining_role).text("Default role");
                $(set_as_default_joining_role).removeClass('bg-black hover:bg-gray-900');
                $(set_as_default_joining_role).addClass('bg-green-700')
            });
        });

        $(move_joining_role_for_verified_users).click(function () {
            let action = new circle_role_control_tools().move_joining_role_for_verified_users_api_caller(role_data["Role_Name"]).then(function (data) {
                Default_Role_For_Verified_Users = role_data["Role_Name"];
                $(move_joining_role_for_verified_users).text("Default Verified users role");
                $(move_joining_role_for_verified_users).removeClass('bg-black hover:bg-gray-900');
                $(move_joining_role_for_verified_users).addClass('bg-green-700')
            });
        });


        let role_delete_button = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-red-600 font-semibold text-sm bg-black hover:bg-gray-900 hover:text-red-500 rounded-t-md  p-2 cursor-pointer float-right ml-auto",
            "Delete role"
        )
        $(role_delete_button).click(function () {
            let security_popup = new floating_notifications_orginal().custom_bg_security_popup(
                "Are you sure you want to delete this role? <br/>All users with this role will be set to the role on the right.",
                ["Yes delete role", "No, cancel action"],
                "bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-md cursor-pointer mr-2",
                "bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold p-2 rounded-md cursor-pointer",
            )
            $('body').append(security_popup[0]);
            $(security_popup[1]).click(function () {
                let action = new circle_role_control_tools().delete_role_api_caller(role_data["Role_Name"]).then(function (data) {
                    $('#circle_moderation_role_settings').click();
                });
                $(security_popup[0]).remove();
            });
            $(security_popup[2]).click(function () {
                $(security_popup[0]).remove();
            });
        });




        $(det_wrap).append(role_name);
        $(det_wrap).append(role_description);
        $(basic_details_wrapper).append(det_wrap);
        // $(but_wrap).append(role_description_edit_button);
        $(but_wrap).append(set_as_default_joining_role);
        $(but_wrap).append(move_joining_role_for_verified_users);
        $(but_wrap).append(special_symbol_setter);
        $(but_wrap).append(role_delete_button);
        // $(basic_details_wrapper).append(but_wrap);
        $(widther_for_the_card).append(but_wrap);
        $(widther_for_the_card).append(basic_details_wrapper);


        let power_wrap = document.createElement("div");
        $(power_wrap).addClass("w-full flex flex-row");

        let show_unshow_div = this.role_power_editing_div(role_data, widther_for_the_card);
        $(power_wrap).append(show_unshow_div);
        $(widther_for_the_card).append(power_wrap);

        return widther_for_the_card;
    }

    role_symbol_edit_tag(role_data) {
        let wrapper_div = document.createElement("div");
        let set_as_default_joining_role = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-sm bg-black hover:bg-gray-900 hover:text-white rounded-t-md p-2 cursor-pointer",
            "Add special symbol"
        )
        let changed_wrapper = document.createElement("div");
        let single_letter_input = document.createElement("input");
        $(single_letter_input).addClass("w-14 h-10 bg-gray-800 rounded-md text-gray-200 font-semibold outline-none text-center");
        $(single_letter_input).attr("placeholder", "A");
        $(single_letter_input).attr("value", role_data["Role_Symbol"]);
        $(single_letter_input).attr("maxlength", "2");
        $(single_letter_input).attr("required", "true");
        $(single_letter_input).attr("name", "role_symbol");
        let set_button = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-gray-200 font-semibold text-sm  bg-green-800 hover:bg-green-600 hover:text-white rounded-t-md p-2 cursor-pointer",
            "Set"
        )
        $(changed_wrapper).addClass("hidden flex flex-row");
        $(changed_wrapper).append(single_letter_input);
        $(changed_wrapper).append(set_button);
        $(set_as_default_joining_role).click(function () {
            if ($(changed_wrapper).hasClass('hidden')) {
                $(changed_wrapper).removeClass('hidden');
                $(set_as_default_joining_role).addClass('hidden');
            } else {
                $(changed_wrapper).addClass('hidden');
                $(set_as_default_joining_role).removeClass('hidden');
            }
        });
        $(set_button).click(function () {
            let action = new circle_role_control_tools().add_role_symbol_api_caller($(single_letter_input).val(), role_data["Role_Name"]).then(function (data) {
                new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
            });
            $(changed_wrapper).addClass('hidden');
            $(set_as_default_joining_role).removeClass('hidden');
        });
        $(wrapper_div).append(set_as_default_joining_role);
        $(wrapper_div).append(changed_wrapper);

        return wrapper_div;
    }

    role_edit_tag_floating_box(role_data, widther_for_the_card) {
    }

    role_power_editing_div(role_data, widther_for_the_card) {
        let show_unshow_div = document.createElement("div");
        $(show_unshow_div).addClass("w-full bg-gray-800 text-center text-sm text-gray-200 font-semibold p-2 rounded-b-md cursor-pointer");
        $(show_unshow_div).text("Show Role Powers");

        let power_show_wrapper = document.createElement("div");
        $(power_show_wrapper).addClass("w-full flex flex-col bg-black");
        let power_len = role_data["Role_Powers"].length;
        console.log(role_data);
        for (let i = 0; i < power_len; i++) {
            let optioner = {
                "PowerName": role_data["Role_Powers"][i]["PowerName"],
                "PowerStatus": role_data["Role_Powers"][i]["PowerStatus"],
                "Role_Name": role_data["Role_Name"]                             // The change is here.
            }
            let power_show_div = this.role_power_editing_div_single_power(optioner, i + 1);
            $(power_show_wrapper).append(power_show_div);
        }

        $(show_unshow_div).click(function () {
            if ($(show_unshow_div).hasClass('isVisible') == true) {
                // This needs to hide the power_show_wrapper.
                $(show_unshow_div).text("Show Role Powers");
                $(show_unshow_div).removeClass('isVisible');
                $(power_show_wrapper).remove();
            } else {
                // This needs to show the power_show_wrapper.
                $(show_unshow_div).text("Hide Role Powers");
                $(show_unshow_div).addClass('isVisible');
                $(widther_for_the_card).remove(show_unshow_div);
                $(widther_for_the_card).append(power_show_wrapper);
                $(widther_for_the_card).append(show_unshow_div);
            }
        });


        return show_unshow_div;
    }
    role_power_editing_div_single_power(options, counter) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full flex flex-row p-2");
        let power_description = new circle_moderation_user_moderation_tools().generic_div_creator(
            "text-yellow-500 font-semibold text-sm",
            counter + '. ' + options["PowerName"]
        )
        let slider_component = this.the_slider_component(options);
        $(slider_component).addClass("ml-auto float-right");
        $(wrapper_div).append(power_description);
        $(wrapper_div).append(slider_component);
        return wrapper_div;
    }


    the_slider_component(on_or_off) {
        let slider_wrapper = document.createElement("div");
        let rounded_slider = document.createElement("div");

        $(slider_wrapper).addClass("w-20 h-4 bg-gray-800 rounded-full mr-4 cursor-pointer");
        $(rounded_slider).addClass("w-10 h-4 bg-gray-500 rounded-full");

        // On click of the slider, the rounded slider should move to the other side.

        let trigger_data = {
            "Role_Name": on_or_off["Role_Name"],                             // The change is here.
            "power_description": on_or_off["PowerName"]
        }
        let url_to_call = "/api/v1/circle/user_moderation/update_circle_role_powers/" + $('#Circle_Name_MAINS').text()


        $(slider_wrapper).click(function () {
            if ($(rounded_slider).hasClass("ml-10") == false) {
                trigger_data["action"] = "add";
                new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(trigger_data)).then(function (data) {
                    $(rounded_slider).addClass("ml-10");
                    $(slider_wrapper).addClass("bg-green-500");
                    new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
                }).catch(function (error) {
                    console.log(error);
                    return false;
                });
            }
            else {
                trigger_data["action"] = "remove";
                new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(trigger_data)).then(function (data) {
                    $(rounded_slider).removeClass("ml-10");
                    $(slider_wrapper).removeClass("bg-green-500");
                    new circle_role_control_tools().refresh_role_list($('#widther_div_for_roles_for_rearrangement_and_stuff'));
                }).catch(function (error) {
                    console.log(error);
                    return false;
                });
            }
        }
        );
        if (on_or_off["PowerStatus"] == "Yes") {
            $(rounded_slider).addClass("ml-10");
            $(slider_wrapper).addClass("bg-green-500");
        }

        $(slider_wrapper).append(rounded_slider);

        return slider_wrapper;
    }



}

class circle_moderation_content_moderation_tools {
    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }
    scroll_percentager_discord_version(element) {
        const rect = element.getBoundingClientRect()
        const inView = rect.top + rect.height - window.innerHeight
        const inViewPerc = inView / rect.height
        return Math.max(0, Math.min(100, (inViewPerc) * 100 | 0))

    }
    // The card makers for the indvidual users
    report_card_complete(noofuserprofiles_currently, final_dat, first_time, trigger_data = "Yes") {
        let url_to_call = "/api/v1/circle/" + $('#Circle_Name_MAINS').text() + "/get_reported_posts"
        let number_of_reports_to_skip = '0';
        url_to_call = url_to_call + '?skip=' + number_of_reports_to_skip;

        let reports_div = $('#reports_div');
        if (trigger_data == "Yes") {
            let all_users_in_the_circle = new APICALLS().GenericAPICall(url_to_call, "GET", {}).then(function (data) {
                $(reports_div).empty();
                let len_of_reports = data["Reported_Posts"].length;
                for (let i = 0; i < len_of_reports; i++) {
                    console.log(data["Reported_Posts"][i]);
                    let report_card = new circle_moderation_content_moderation_tools().report_card_component(data["Reported_Posts"][i]);
                    $(reports_div).append(report_card);
                }
            });
        } else {
            let len_of_reports = final_dat["Reported_Posts"].length;
            $(reports_div).empty();
            for (let i = 0; i < len_of_reports; i++) {
                console.log(final_dat["Reported_Posts"][i]);
                let report_card = new circle_moderation_content_moderation_tools().report_card_component(final_dat["Reported_Posts"][i]);
                $(reports_div).append(report_card);
            }
        }

    }
    report_card_component(options) {
        let wrapper_div = document.createElement("div");
        let layer_2_url_linker = document.createElement("a");
        $(layer_2_url_linker).attr("href", options["url"]);
        // Post user details in layer 1
        let layer_1_wrapper = document.createElement("div");
        let post_user_displayname = document.createElement("span");
        let post_date_time = document.createElement("span");
        let current_status = document.createElement("span");
        let type_of_post = document.createElement("span");
        let total_number_of_reports = document.createElement("span");

        $(wrapper_div).addClass("w-full h-auto flex flex-col bg-gray-700 mb-1");
        $(layer_1_wrapper).addClass("w-full p-2 flex bg-black flex-row flex-start border-b-2 border-gray-700");
        $(post_user_displayname).addClass("text-base text-yellow-500 font-semibold");
        $(post_date_time).addClass("text-base text-gray-500 font-semibold pl-2");
        $(current_status).addClass("text-base text-yellow-300 font-semibold pl-2");
        $(type_of_post).addClass("text-base text-gray-500 font-semibold pl-2");
        $(total_number_of_reports).addClass("text-base text-red-500 font-semibold pr-2 ml-auto float-right");
        $(post_user_displayname).text(options["poster_displayname"]);
        $(post_date_time).text(options["time_difference"]);
        $(current_status).text(options["current_status"]);
        $(type_of_post).text(options["post_type"]);
        $(total_number_of_reports).text("Total Reports: " + options["number_of_reports"]);


        $(layer_1_wrapper).append(post_user_displayname);
        $(layer_1_wrapper).append(post_date_time);
        $(layer_1_wrapper).append(type_of_post);
        $(layer_1_wrapper).append(current_status);
        $(layer_1_wrapper).append(total_number_of_reports);
        $(wrapper_div).append(layer_1_wrapper);
        // Html content in layer 2
        let layer_2_wrapper = document.createElement("div");
        let post_html_content = document.createElement("div");
        $(layer_2_wrapper).addClass("w-full p-2 flex bg-black flex-row flex-start border-b-2 border-gray-700");
        $(post_html_content).addClass("text-base text-gray-200 font-semibold");
        $(post_html_content).html(options["html_content"]);

        $(layer_2_wrapper).append(post_html_content);
        $(layer_2_url_linker).append(layer_2_wrapper);
        $(wrapper_div).append(layer_2_url_linker);

        // Reasons in layer 3
        let layer_3_wrapper = document.createElement("div");
        $(layer_3_wrapper).addClass("w-full p-2 bg-black flex flex-row flex-start border-b-2 border-gray-700 overflow-x-auto");
        // For each reason a reasons_wrapper.
        let len_of_reasons = options["reasons"].length;
        for (let i = 0; i < len_of_reasons; i++) {
            let reason_card = new circle_moderation_content_moderation_tools().reason_card_component(options["reasons"][i], "w-80", "h-32");
            $(layer_3_wrapper).append(reason_card);
        }
        $(wrapper_div).append(layer_3_wrapper);

        // Actions in layer 4
        let layer_4_wrapper = document.createElement("div");
        $(layer_4_wrapper).addClass("w-full p-2 bg-black");
        let action_row = new circle_moderation_content_moderation_tools().action_row_component(options);
        $(layer_4_wrapper).append(action_row);
        $(wrapper_div).append(layer_4_wrapper);


        return wrapper_div;

    }
    reason_card_component(options, reason_width, reason_height) {
        let wrapper_div = document.createElement("div");
        let layer1_wrapper_div = document.createElement("div");
        let reason_name = document.createElement("span");
        let reason_time = document.createElement("span");
        let reason_description = document.createElement("span");

        $(wrapper_div).addClass(reason_height + " " + reason_width + " ml-2 flex flex-col bg-gray-800 rounded-md border-2 border-gray-700");

        $(layer1_wrapper_div).addClass("w-full p-1 flex flex-row justify-start border-b-2 border-gray-600");
        $(reason_name).addClass("text-base text-yellow-500 font-semibold");
        $(reason_time).addClass("text-base text-gray-400 font-semibold pl-2");

        $(reason_name).text(options["reporter_displayname"]);
        $(reason_time).text(options["time_difference"]);

        $(layer1_wrapper_div).append(reason_name);
        $(layer1_wrapper_div).append(reason_time);
        $(wrapper_div).append(layer1_wrapper_div);

        $(reason_description).addClass("text-sm text-gray-200 font-semibold w-full p-1");
        $(reason_description).text(options["reason"]);

        $(wrapper_div).append(reason_description);

        return wrapper_div;
    }
    action_row_component(options) {
        // Basically two buttons, one for delete - makes it invisible and deletes in 2 years and one for lock.
        let wrapper_div = document.createElement("div");
        let action_button = document.createElement("button");
        let action_button2 = document.createElement("button");

        $(wrapper_div).addClass("w-full flex flex-row");
        $(action_button).addClass("text-red-500  font-semibold rounded-md hover:text-red-600 p-2 bg-gray-800 hover:bg-gray-700 outline-none");
        $(action_button2).addClass("text-yellow-500 ml-2 font-semibold rounded-md hover:text-yellow-600 p-2 bg-gray-800 hover:bg-gray-700 outline-none");


        $(action_button).text("Delete 🛇");
        $(action_button2).text("Lock 🔒");


        $(action_button).click(function () {
            let floating_notif = new floating_notifications_orginal().custom_bg_security_popup("Are you sure you want to delete this " + options["post_type"] + " ?", ['Delete', 'Cancel'], 'bg-red-500 text-gray-200 hover:text-white font-semibold', 'bg-gray-800 text-gray-200 hover:text-white font-semibold');
            $('body').append(floating_notif[0]);
            $(floating_notif[2]).click(function () {
                $(floating_notif[0]).remove();
                return;
            });
            $(floating_notif[1]).click(function () {
                let data_to_send = {
                    "PostId": options["post_id"],
                    "action": "delete",
                    "type": options["post_type"]
                }
                new circle_moderation_content_moderation_tools().report_card_action_api_calls(data_to_send).then(function (data) {
                    console.log(data);
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Post deleted Successfully", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                    $(floating_notif[0]).remove();
                });

            });
        });

        $(action_button2).click(function () {
            let floating_notif = new floating_notifications_orginal().custom_bg_security_popup("Are you sure you want to close this " + options["post_type"] + " ?", ['Close', 'Cancel'], 'bg-red-500 text-gray-200 hover:text-white font-semibold', 'bg-gray-800 text-gray-200 hover:text-white font-semibold');
            $('body').append(floating_notif[0]);
            $(floating_notif[2]).click(function () {
                $(floating_notif[0]).remove();
                return;
            });
            $(floating_notif[1]).click(function () {
                let data_to_send = {
                    "PostId": options["post_id"],
                    "action": "close",
                    "type": options["post_type"]
                }
                new circle_moderation_content_moderation_tools().report_card_action_api_calls(data_to_send).then(function (data) {
                    console.log(data);
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Post closed Successfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                });
                $(floating_notif[0]).remove();
            });
        });

        $(wrapper_div).append(action_button);
        $(wrapper_div).append(action_button2);

        return wrapper_div;
    }
    async report_card_action_api_calls(options) {
        let url_to_call = '/api/v1/circle/admin_powers/' + $('#Circle_Name_MAINS').text() + '/close_or_delete_post'
        let data_to_send = {
            "PostId": options["PostId"],
            "action": options["action"],
            "type": options["type"]
        }
        let all_users_in_the_circle = await new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        });
        return all_users_in_the_circle;
    }
    // The card makers for the indvidual users


    search_bar_and_user_count(data) {
        let wrapper_div = document.createElement("div");
        let search_wrapper = document.createElement("div");
        let search_bar = document.createElement("input");
        let reset_button = document.createElement("button");
        let user_count = document.createElement("span");

        $(wrapper_div).addClass('w-full flex flex-row justify-between p-2');
        $(search_wrapper).addClass('flex flex-row justify-start');
        $(search_bar).addClass('w-52 text-base bg-gray-800 rounded-md p-2 text-gray-200 font-semibold outline-none');
        $(search_bar).attr("placeholder", "Search report by content");
        $(reset_button).addClass('text-base bg-gray-800 rounded-md ml-2 p-2 text-gray-200 font-semibold outline-none hover:text-white cursor-pointer');
        $(reset_button).text("Reset");

        $(user_count).addClass('bg-gray-800 rounded-md p-2 text-gray-200 font-semibold text-right');
        $(user_count).text("Total number of reports: " + '2');
        $(search_wrapper).append(search_bar);
        $(search_wrapper).append(reset_button);
        $(wrapper_div).append(search_wrapper);
        $(wrapper_div).append(user_count);


        $(search_bar).keyup(function () {
            // Start after 2 characters.
            if ($(search_bar).val().length > 2) {
                let calling = new circle_moderation_content_moderation_tools().search_api_call($(search_bar).val()).then(function (data) {
                    new circle_moderation_content_moderation_tools().report_card_complete(0, data, "No", "No");
                });
            }
        });

        $(reset_button).click(function () {
            $(search_bar).val('')
            new circle_moderation_content_moderation_tools().report_card_complete(0, "", "No", "Yes");
            feed_loader_counter_for_users = 0;

        });

        return wrapper_div;
    }

    async search_api_call(search_term) {
        let url_to_call = '/api/v1/circle/' + $('#Circle_Name_MAINS').text() + '/find_reported_post'
        search_term = DOMPurify.sanitize(search_term, { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        let data_to_send = {
            "html_content": search_term
        }
        let all_users_in_the_circle = await new APICALLS().GenericAPIJSON_CALL(url_to_call, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        });
        return all_users_in_the_circle;
    }
}

class flair_management_moderation_tools {
    async flair_management_get_all_flairs() {
        let url = '/api/v1/circle/user_moderation/get_all_flair_tags/' + $('#Circle_Name_MAINS').text();
        let all_flair_tags = await new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            return data;
        });
        return all_flair_tags["all_flairs"];
    }
    async flair_management_get_specific_role_flairs(roleName) {
        let url = '/api/v1/circle/user_moderation/get_specific_role_flairs/' + $('#Circle_Name_MAINS').text() + '?finding_flairs_for=' + roleName;
        let all_users_in_the_circle = await new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            return data;
        });
        return all_users_in_the_circle["specific_flairs"];
    }
    async flair_management_add_remove_flair(options) {
        let data_to_send = {
            "Flair_Name": options["Flair_Name"],
            "Role_Name": options["Role_Name"],
            "action": options["action"]
        }
        let url = '/api/v1/circle/user_moderation/update_circle_role_flair_tags/' + $('#Circle_Name_MAINS').text();
        let all_users_in_the_circle = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        }
        );
        return all_users_in_the_circle;

    }
    async delete_flair(delete_flair_name) {
        let url = '/api/v1/circle/tag_moderation/delete_flair_tag_from_general_pool/' + $('#Circle_Name_MAINS').text() + "?flair_tag_name=" + delete_flair_name;
        let all_users_in_the_circle = await new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            return data;
        }
        );
        return all_users_in_the_circle;
    }
    async flair_management_create_new_flair(data_to_send) {
        let url = '/api/v1/circle/tag_moderation/create_new_flair_tag/' + $('#Circle_Name_MAINS').text();
        let all_users_in_the_circle = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(data_to_send)).then(function (data) {
            return data;
        });
        return all_users_in_the_circle;
    }
    generic_div_creator(classer, texter) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass(classer);
        $(wrapper_div).text(texter);
        return wrapper_div;
    }
    generic_span_creator(classer, texter) {
        let wrapper_div = document.createElement("span");
        $(wrapper_div).addClass(classer);
        $(wrapper_div).text(texter);
        return wrapper_div;
    }
    generic_select_option_creator(classer, options_array) {
        let wrapper_div = document.createElement("select");
        $(wrapper_div).addClass(classer);
        for (let i = 0; i < options_array.length; i++) {
            let option = document.createElement("option");
            $(option).text(options_array[i]);
            $(wrapper_div).append(option);
        }
        return wrapper_div;
    }
    left_box_creator_all_flairs() {
        let allwrapper_div = document.createElement("div");
        $(allwrapper_div).addClass("w-1/2 h-full flex flex-col p-2 bg-gray-800 rounded-md");
        let top_wrapper_div = new flair_management_moderation_tools().generic_div_creator("w-full flex justify-start items-start p-2", "");
        let create_new_flair_button = new flair_management_moderation_tools().generic_div_creator(
            "p-2 bg-black cursor-pointer text-green-500 font-semibold hover:text-green-400 rounded-sm",
            "Create New Flair");
        $(create_new_flair_button).click(function () {
            new flair_management_moderation_tools().create_new_flair_popup();
        });
        $(top_wrapper_div).append(create_new_flair_button);
        let delete_flair_button = new flair_management_moderation_tools().generic_div_creator(
            "p-2 bg-black text-red-500 cursor-pointer rounded-sm font-semibold float-right ml-auto",
            "Delete mode");

        $(top_wrapper_div).append(delete_flair_button);
        let flairs_wrapper_div = new flair_management_moderation_tools().generic_div_creator("w-full bg-green-900 h-4/6 p-2 flex flex-row flex-wrap content-start justify-normal", "");

        let example_flairs = new flair_management_moderation_tools().flair_management_get_all_flairs().then(function (data) {
            example_flairs = data;
            for (let i = 0; i < example_flairs.length; i++) {
                let flair_div = new flair_management_moderation_tools().generic_span_creator("p-2 m-2 h-10 text-gray-200 font-semibold bg-black cursor-pointer", example_flairs[i]);
                $(flair_div).attr('data-flair_name', example_flairs[i]);
                $(flair_div).click(function () {
                    // Chack if the flair is already in the transferrable role flairs.
                    let flair_name = $(flair_div).attr('data-flair_name');
                    let current_flair_json = JSON.parse($('#transferrable_role_flairs').attr('data-original_list'));
                    let current_role_name = $('#transferrable_role_flairs').attr('data-role_name');
                    if (current_flair_json.includes(flair_name) == true) {
                        let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Flair already in the transferrable role flairs", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                        $('body').append(floating_notif);
                        return;
                    } else {
                        let data_to_send = {
                            "Flair_Name": flair_name,
                            "Role_Name": current_role_name,
                            "action": "add"
                        }
                        new flair_management_moderation_tools().flair_management_add_remove_flair(data_to_send).then(function (data) {
                            $('#role_select_for_specific_flairs').change();
                            $('#role_select_for_specific_flairs').select(current_role_name);
                            $('#transferrable_role_flairs').attr('data-original_list', JSON.stringify(current_flair_json));
                            let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Flair added to the transferrable role flairs", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                            $('body').append(floating_notif);
                        });
                    }
                });
                $(flairs_wrapper_div).append(flair_div);
            }
            $(allwrapper_div).append(top_wrapper_div);
            $(flairs_wrapper_div).attr('data-original_list', JSON.stringify(example_flairs))
            $(allwrapper_div).append(flairs_wrapper_div);

            $(delete_flair_button).click(function () {
                if ($(delete_flair_button).attr('data-delete_mode') == 'active') {
                    $('#circle_moderation_flair_management').click();
                } else {
                    $(delete_flair_button).attr('data-delete_mode', 'active');
                    let delete_flairs_wrapper_div = new flair_management_moderation_tools().generic_div_creator(
                        "w-full bg-red-900 h-4/6 p-2 flex flex-row flex-wrap content-start justify-normal",
                        "");
                    $(delete_flair_button).text("Exit Delete Mode");
                    $(delete_flairs_wrapper_div).attr('id', 'delete_flairs_wrapper_div')
                    $(flairs_wrapper_div).addClass("hidden");
                    $(allwrapper_div).append(delete_flairs_wrapper_div);
                    for (let i = 0; i < example_flairs.length; i++) {
                        let delete_flair_div = new flair_management_moderation_tools().generic_span_creator("p-2 m-2 h-10 text-gray-200 font-semibold bg-black cursor-pointer", example_flairs[i]);
                        $(delete_flair_div).attr('data-flair_name', example_flairs[i]);
                        $(delete_flair_div).click(function () {
                            // Chack if the flair is already in the transferrable role flairs.
                            let delete_flair_name = $(delete_flair_div).attr('data-flair_name');
                            let delete_call = new flair_management_moderation_tools().delete_flair(delete_flair_name).then(function (data) {
                                let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Flair deleted successfully", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                                $('body').append(floating_notif);
                                $(delete_flair_div).remove();
                            });
                        });
                        $(delete_flairs_wrapper_div).append(delete_flair_div);
                    }
                }
            });



        });
        return [allwrapper_div, flairs_wrapper_div];
    }
    righ_box_creator_role_specific_flairs() {
        let allwrapper_div = document.createElement("div");
        $(allwrapper_div).addClass("w-1/2 h-full flex flex-col p-2 bg-gray-800 rounded-md");
        let top_wrapper_div = new flair_management_moderation_tools().generic_div_creator("w-full flex justify-start items-start p-2", "");
        let flairs_wrapper_div = new flair_management_moderation_tools().generic_div_creator("w-full bg-green-900 h-4/6 p-2 flex flex-row flex-wrap content-start justify-normal", "");
        $(flairs_wrapper_div).attr('id', 'transferrable_role_flairs');
        function change_flairs_in_role_specific_box(role_name, role_select = null) {
            let example_flairs = new flair_management_moderation_tools().flair_management_get_specific_role_flairs(role_name).then(function (data) {
                for (let i = 0; i < data.length; i++) {
                    let flair_div = new flair_management_moderation_tools().generic_span_creator("p-2 m-2 h-10 text-gray-200 font-semibold bg-black cursor-pointer ", data[i]);
                    $(flairs_wrapper_div).append(flair_div);
                    $(flair_div).attr('data-flair_name', data[i]);
                    $(flair_div).click(function () {
                        let flair_name = $(flair_div).attr('data-flair_name');
                        let current_flair_json = JSON.parse($('#transferrable_role_flairs').attr('data-original_list'));
                        if (current_flair_json.includes(flair_name) == true) {
                            let data_to_send = {
                                "Flair_Name": flair_name,
                                "Role_Name": $('#transferrable_role_flairs').attr('data-role_name'),
                                "action": "remove"
                            }
                            new flair_management_moderation_tools().flair_management_add_remove_flair(data_to_send).then(function (data) {
                                current_flair_json.splice(current_flair_json.indexOf(flair_name), 1);
                                $('#transferrable_role_flairs').attr('data-original_list', JSON.stringify(current_flair_json));
                                $(flair_div).remove();
                                let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Flair removed from the transferrable role flairs", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                                $('body').append(floating_notif);
                            });
                        }
                    });
                }
                $(flairs_wrapper_div).attr('data-original_list', JSON.stringify(data));
                $(flairs_wrapper_div).attr('data-role_name', role_name);
                $(allwrapper_div).append(top_wrapper_div);
                $(allwrapper_div).append(flairs_wrapper_div);
            });
        }
        let example_roles2 = new circle_role_control_tools().get_all_roles_api_caller().then(function (data) {
            let example_roles = data;
            let role_select = new flair_management_moderation_tools().generic_select_option_creator("p-2 bg-black text-gray-200 font-bold outline-none", example_roles);
            $(top_wrapper_div).append(role_select);
            $(role_select).attr('id', 'role_select_for_specific_flairs')
            $(role_select).change(function () {
                $(flairs_wrapper_div).empty();
                change_flairs_in_role_specific_box($(role_select).val());
            });
            change_flairs_in_role_specific_box($(role_select).val(), role_select);
        });

        return [allwrapper_div, flairs_wrapper_div];
    }
    create_new_flair_popup() {
        let form_wrapper = document.createElement("form");
        $(form_wrapper).addClass("w-full h-full flex flex-col p-2 bg-gray-800 rounded-md mb-10");
        let title = document.createElement("span");
        $(title).addClass("text-lg border-b-2 border-green-500 text-green-500 font-semibold mb-2 p-2 text-center ");
        $(title).text("Create New Flair");
        $(form_wrapper).append(title);
        let flair_input = document.createElement("input");
        $(flair_input).addClass("w-full h-10 w-96 text-gray-200 font-semibold bg-black cursor-text p-2 outline-none");
        $(flair_input).attr("placeholder", "Flair Name");
        $(flair_input).attr("type", "text");
        $(flair_input).attr("maxlength", "50");
        $(flair_input).attr("minlength", "2");
        $(flair_input).attr("required", "true");
        $(flair_input).attr("pattern", "^[a-zA-Z0-9_ ]*$")
        $(flair_input).attr('name', 'flair_name')
        $(form_wrapper).append(flair_input);
        let button_wrapper = document.createElement("div");
        $(button_wrapper).addClass("w-full flex flex-row justify-end mt-2");
        let create_button = document.createElement("button");
        $(create_button).addClass("w-full h-10 mr-2 text-gray-200 font-semibold bg-green-700 cursor-pointer p-2 outline-none hover:bg-green-600");
        $(create_button).text("Create");
        let cancel_button = document.createElement("button");
        $(cancel_button).addClass("w-full h-10 text-gray-200 font-semibold bg-black cursor-pointer p-2 outline-none hover:bg-gray-700");
        $(cancel_button).text("Cancel");

        $(button_wrapper).append(create_button);
        $(button_wrapper).append(cancel_button);

        $(form_wrapper).append(button_wrapper);

        let floatin_pop = new floating_notifications_orginal().multi_col_div_ontop([form_wrapper], "", "")
        $(cancel_button).click(function () {
            $(floatin_pop).remove();
        });
        $(create_button).click(function (e) {
            e.preventDefault();
            form_wrapper.reportValidity();
            if (form_wrapper.checkValidity() == true) {
                let data_to_send = {
                    "flair_tag_name": $(flair_input).val()
                }
                new flair_management_moderation_tools().flair_management_create_new_flair(data_to_send).then(function (data) {
                    let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Flair created successfully", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floating_notif);
                    $(floatin_pop).remove();
                    $('#circle_moderation_flair_management').click();
                }).catch(function (data) {
                    let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Flair creation failed", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                    $('body').append(floating_notif);
                });
            }
        });
        $('body').append(floatin_pop);



    }


}





// Example data:
//     let example_user={
//     "DisplayName": "Viswajith",
//     "JoinDate": "12/05/2023",
//     "Muted":"No",
//     "Role":"Admin",
//     "Powers":[
//         {
//             "PowerName":"Posting and commenting in the circle",
//             "PowerStatus":"No"
//         },
//         {
//             "PowerName":"Supporting or Rejecting a post, Comments or information cards",
//             "PowerStatus":"Yes"
//         },
//         {
//             "PowerName":"The ability to update the circle- description, tags and related circles",
//             "PowerStatus":"Yes"
//         },
//         {
//             "PowerName":"The ability to update the content in Information cards - Title, profile cards ets",
//             "PowerStatus":"Yes"
//         }
//     ]
// }