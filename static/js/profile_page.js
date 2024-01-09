// Need to implement infinite scroll for the posts.
var request_data = {
    "myposts": {},
    "mydetails": {},
    "supports": {},
    "rejects": {},
    "comments": {},
    "commentreplies": {}
};
request_data["myposts"]["noofposts"] = "0";
request_data["comments"]["noofposts"] = "0";
request_data["commentreplies"]["noofposts"] = "0";
request_data["supports"]["noofposts"] = "0";
request_data["rejects"]["noofposts"] = "0";

var scroll_safety = {
    "myposts": true,
    "comments": true,
    "commentreplies": true,
    "supports": true,
    "rejects": true
}


$(document).ready(function () {
    let mydivs = ["#my_details", "#my_posts", "#my_supports", "#my_rejects", "#my_comments", "#comment_replies"];
    new profile_page_meta_functions().meta_function_to_change_colors(mydivs, "text-white-500 hover:text-yellow-500", "text-yellow-500");
    $('#my_details').click(function (e) {
        e.preventDefault();
        new profile_page_mydetails().reload_my_data('#Profile_Section').then(function (data) {
            $('#Profile_Section').append(data);
        });
    });
    $('#my_details').click();
    $('#my_posts').click(function (e) {
        e.preventDefault();
        $('#Profile_Section').attr('data-filter', 'MyPosts');
        request_data["myposts"]["noofposts"] = "0";
        scroll_safety["myposts"] = true;
        $('#Profile_Section').unbind('scroll');
        new profile_page_meta_functions().scroll_load_binder('#Profile_Section', 'myposts');
        new profile_page_myposts().reload_my_posts('#Profile_Section').then(function (data) {
            // Find and append to Data-Filter = MyPosts
            $(document).find('[data-filter="MyPosts"]').append(data);

        });
    });
    $('#my_comments').click(function (e) {
        e.preventDefault();
        $('#Profile_Section').unbind('scroll');
        $('#Profile_Section').attr('data-filter', 'MyComments');
        request_data["comments"]["noofposts"] = "0";
        scroll_safety["comments"] = true;
        new profile_page_meta_functions().scroll_load_binder('#Profile_Section', 'comments');
        new profile_page_comments().reload_my_comments('#Profile_Section').then(function (data) {
            $(document).find('[data-filter="MyComments"]').append(data);
        });
    }
    );
    $('#comment_replies').click(function (e) {
        e.preventDefault();
        $('#Profile_Section').unbind('scroll');
        $('#Profile_Section').attr('data-filter', 'MyCommentReplies');
        request_data["commentreplies"]["noofposts"] = "0";
        scroll_safety["commentreplies"] = true;
        new profile_page_meta_functions().scroll_load_binder('#Profile_Section', 'commentreplies');
        new profile_page_comment_replies().reload_my_comments('#Profile_Section').then(function (data) {
            $(document).find('[data-filter="MyCommentReplies"]').append(data);
        });
    });
});

// Testing Notifications.
$(document).ready(function () {
});


class profile_page_meta_functions {
    async get_my_posts(request_data) {
        let url = "/api/v1/user/get_posts_single_filter";
        let k1 = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(request_data)).then(function (data) {
            return data;
        }
        );
        return k1;
    }
    go_to_post(post_id, circle_name) {
        let a_element = document.createElement('a');
        let Get_Url = "/post/" + post_id + "?circle_name=" + circle_name;
        a_element.href = Get_Url;
        return a_element
    }



    to_redirect_and_click_on_asker() {
        $('#Asker').removeClass('hidden');
        $('#Asker').children().find('textarea').click().focus();
    }
    mobile_drag_left_menu_into_view(column_id, direction) {
        let timeout_time = 400;
        if ($(column_id).hasClass('hidden')) {
            $(column_id).removeClass('hidden');
            if (direction == 'left') {
                $(column_id).animate({ left: '0px' }, timeout_time);
            } else {
                $(column_id).animate({ right: '0px' }, timeout_time);
            }

        } else {
            if (direction == 'left') {
                $(column_id).animate({ left: '-100%' }, timeout_time);
            } else {
                $(column_id).animate({ right: '-100%' }, timeout_time);
            }
            // Timeout for the animation to complete.
            setTimeout(function () {
                $(column_id).addClass('hidden');
            }, timeout_time);
        }
    }

    stuff_to_hide_when_scrolling_down_and_show_when_scrolling_up(id_of_div) {
        let startY = null;
        window.addEventListener('touchstart', function (e) {
            const touch = e.touches[0];
            startY = touch.clientY;
        });

        window.addEventListener('touchmove', function (e) {
            if (!startY) {
                return;
            }
            const touch = e.touches[0];
            const diffY = startY - touch.clientY;

            if (diffY > 0) {
                $(id_of_div).addClass('hidden')
            } else {
                $(id_of_div).removeClass('hidden')
            }
            startY = null;
        });
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
                    $(this).attr('data-active', 'No');
                });
                $(this).removeClass(default_text_color);
                $(this).addClass(active_text_color);
                $(this).attr('data-active', 'Yes');
            });
        }
    }
    Generic_Button(classer, text) {
        let button = document.createElement("button");
        $(button).addClass(classer);
        $(button).text(text);
        return button;
    }
    Generic_div(classer, text) {
        let div = document.createElement("div");
        $(div).addClass(classer);
        $(div).text(text);
        return div;
    }
    Generic_input(classer, placeholder, value) {
        let input = document.createElement("input");
        $(input).addClass(classer);
        $(input).attr("placeholder", placeholder);
        $(input).val(value);
        return input;
    }
    Generic_textarea(classer, placeholder) {
        let textarea = document.createElement("textarea");
        $(textarea).addClass(classer);
        $(textarea).attr("placeholder", placeholder);
        return textarea;
    }
    wrap_me_in_link(element, url) {
        let a_element = document.createElement('a');
        $(a_element).attr('href', url);
        $(element).wrap(a_element);
    }

    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }


    scroll_load_binder(feeder_div, feed_loader_name) {
        feeder_div = $(feeder_div);
        $(feeder_div).scroll(function (e) {
            let scroll_percentage = new profile_page_meta_functions().calculateScrollPercentage(feeder_div);
            if (scroll_percentage > 20 && scroll_safety[feed_loader_name]) {
                scroll_safety[feed_loader_name] = false;
                let feed_loader_counter = parseInt(request_data[feed_loader_name]["noofposts"]);
                request_data[feed_loader_name]["noofposts"] = (feed_loader_counter + 10).toString();
                if (feed_loader_name == "myposts") {
                    new profile_page_myposts().reload_my_posts().then(function (data) {
                        $('#Profile_Section').append(data);
                        scroll_safety[feed_loader_name] = true;
                    });
                } else if (feed_loader_name == "comments") {
                    new profile_page_comments().reload_my_comments().then(function (data) {
                        $('#Profile_Section').append(data);
                        scroll_safety[feed_loader_name] = true;
                    });
                } else if (feed_loader_name == "commentreplies") {
                    new profile_page_comment_replies().reload_my_comments().then(function (data) {
                        $('#Profile_Section').append(data);
                        scroll_safety[feed_loader_name] = true;
                    });
                }
            }
        });


    }





}
class profile_page_verification {
    async reset_startup_screen_and_redirect_to_home() {
        let url = "/api/v1/user/close_startup_screen?action=" + "Yes"
        let r1 = await new APICALLS().GenericAPICall(url, 'GET', {}).then(function (data) {
            console.log(data);
            document.location.href = '/home';
        }).catch(function (error) {
            console.log(error);
            let notif = new floating_notifications_orginal().bottom_bar_notification("An unknown error occured!", 'bg-red-700 hover:bg-red-800 text-white font-bold p-2 m-2 mt-4 rounded cursor-pointer');
            $('body').append(notif);
        });
    }
}
class profile_page_mydetails {
    async update_my_description(description) {
        let url = "/api/v1/user/create_my_description";
        let k1 = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(description)).then(function (data) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Description Updated Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return data;
        }).catch(function (error) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Description Update Failed!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        });
        return k1;
    }
    async get_my_details() {
        let self_user = "self_user=Yes";
        let url = "/api/v1/user/get_user_details" + "?" + self_user;
        let k1 = await new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            return data;
        });
        return k1;
    }
    async reload_my_data(clear_this_div) {
        let wrapper_div = document.createElement("div");
        $(clear_this_div).empty();
        $(wrapper_div).addClass('w-full flex flex-row justify-center items-center mt-2 flex-wrap')
        let c1 = await new profile_page_mydetails().get_my_details().then(function (data) {
            $(clear_this_div).empty();
            console.log(data);
            let basic_details_banner = new profile_page_meta_functions().Generic_div('text-white p-2 text-xl  border-b-2 border-green-500 text-center font-bold w-full bg-black', 'Basic Details');
            let user_name = new profile_page_mydetails().title_value_cards("User Name: ", data["DisplayName"], "user_name");
            $(user_name).addClass('m-2');
            let email_address = new profile_page_mydetails().title_value_cards("Email Address: ", data["UserEmail"], "email_address");
            $(email_address).addClass('m-2');
            let aadhar_number = new profile_page_mydetails().title_value_cards("Aadhar Number: ", data["Aadhar_Number"], "aadhar_number");
            $(aadhar_number).addClass('m-2');
            let voter_id = new profile_page_mydetails().title_value_cards("Voter ID: ", data["Voter_Number"], "voter_id");
            $(voter_id).addClass('m-2');
            let description_banner = new profile_page_meta_functions().Generic_div('text-white p-2 text-xl border-b-2 border-green-500 text-center font-bold w-full bg-black', 'Description');
            let description = new profile_page_meta_functions().Generic_textarea('text-gray-300 w-full p-2 m-2 h-24 font-semibold text-base text-start bg-gray-900 outline-none mt-2 rounded-md', 'Your Description');
            $(description).text(data["Description"]);
            $(description).attr('disabled', true);
            let buttons_wrapper = new profile_page_meta_functions().Generic_div('w-full flex flex-row justify-center items-center mt-2 flex-wrap', '');
            let edit_button = new profile_page_meta_functions().Generic_Button('bg-black hover:bg-gray-900 hover:text-yellow-500 text-white font-bold py-2 px-4 rounded-md', 'Edit your details');
            $(buttons_wrapper).append(edit_button);

            $(edit_button).click(function (e) {
                e.preventDefault();
                if ($(edit_button).attr('data-save_mode') == 'Yes') {
                    $(description).attr('disabled', true).toggleClass('bg-black bg-gray-900');
                    $(edit_button).text('Edit your details');
                    $(edit_button).attr('data-save_mode', 'No');


                    let finaldata = {
                        "html_content": $(description).val(),
                        "username": $(user_name).find('input').val(),
                    }

                    if (data["Available_username"] == "Yes") {
                        $(user_name).find('input').attr('disabled', true).toggleClass('bg-gray-800 bg-gray-700');
                        if (finaldata["username"].length < 4 || finaldata["username"].length > 12 || finaldata["username"].trim().length == 0) {
                            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("New User Name should be minimum 4 and max 12 charecters!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                            $('body').append(floatin_notif);
                            return;
                        }
                        // Pull out username from the input box.
                    }
                    // Check if the user_name is minimum four charecters. Else raise a notification. And make sure it's not spaces.

                    new profile_page_mydetails().update_my_description(finaldata).then(function (data) {
                        console.log(data);
                    });
                } else {
                    $(description).attr('disabled', false).toggleClass('bg-black bg-gray-900');
                    $(edit_button).text('Save your details');
                    $(description).focus();
                    $(edit_button).attr('data-save_mode', 'Yes');
                    if (data["Available_username"] == "Yes") {
                        $(user_name).find('input').attr('disabled', false).toggleClass('bg-gray-800 bg-gray-700');
                        $(user_name).find('input').focus();
                    }
                }
            });

            $(wrapper_div).append(basic_details_banner);
            $(wrapper_div).append(user_name);
            $(wrapper_div).append(email_address);
            // $(wrapper_div).append(aadhar_number);
            // $(wrapper_div).append(voter_id);
            $(wrapper_div).append(description_banner);
            $(wrapper_div).append(description);
            $(wrapper_div).append(buttons_wrapper);

            return wrapper_div;
        });
        return c1;
    }
    title_value_cards(title, value, id_value) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass('bg-black p-2 flexx flex-col rounded-md w-5/12')
        let title_span = new profile_page_meta_functions().Generic_div('text-white text-base text-start font-bold', title);
        let value_span = new profile_page_meta_functions().Generic_input('text-gray-300 w-full p-2 text-base text-start bg-gray-800 outline-none mt-2 rounded-md', title, value);
        $(value_span).attr('disabled', true);
        $(value_span).attr('type', 'text');
        $(value_span).attr('placeholder', id_value);
        $(value_span).attr('data-title', id_value);
        $(value_span).attr('id', 'my_details_' + id_value)
        $(wrapper_div).append(title_span);
        $(wrapper_div).append(value_span);
        return wrapper_div;
    }
}
class profile_page_myposts {
    async reload_my_posts(clear_this_div) {
        let wrapper_div = document.createElement("div");
        $(clear_this_div).empty();
        $(wrapper_div).addClass('w-full')
        request_data["myposts"]["filter"] = "MyPosts";
        let c1 = await new profile_page_meta_functions().get_my_posts(request_data["myposts"]).then(function (data) {
            $(clear_this_div).empty();
            let post_len = data["Posts"].length;
            for (let i = 0; i < post_len; i++) {
                let post_card = new MainFeed().home_post_feed_card(data["Posts"][i]);
                $(wrapper_div).append(post_card[0]);
                $(post_card[2]).click(function (e) {
                    new post_calls().follow_unfollow_toggle(post_card[2], data["Posts"][i]["PostId"], data["Posts"][i]["circle"]);
                });
                let a_element = new profile_page_meta_functions().go_to_post(data["Posts"][i]["sid"], data["Posts"][i]["circle"]);
                $(post_card[3]).wrap(a_element);
                $(post_card[4]).wrap(a_element);
            }
            return wrapper_div;
        }).catch(function (error) {
            $(clear_this_div).empty();
        });
        return c1;
    }
}
class profile_page_comments {
    async reload_my_comments(clear_this_div) {
        let wrapper_div = document.createElement("div");
        $(clear_this_div).empty();
        $(wrapper_div).addClass('w-full')
        request_data["comments"]["filter"] = "Comments";
        let c1 = await new profile_page_meta_functions().get_my_posts(request_data["comments"]).then(function (data) {
            console.log(data);
            let comments = data["Posts"];
            let dataType = "COMMENT";
            $(clear_this_div).empty();
            let post_len = data["Posts"].length;
            for (let i = 0; i < post_len; i++) {
                let comment_card = new MainFeed().common_user_commentcard(comments[i])
                $(wrapper_div).append(comment_card[0]);
                $(comment_card[0]).attr('data-comment_type', dataType);
                $(comment_card[0]).attr('data-comment_id', comments[i]["sid"]);
                new profile_page_meta_functions().wrap_me_in_link(
                    comment_card[0], '/post/' +
                    comments[i]["parent_post_id"] +
                    '?circle_name=' + comments[i]["circle"] +
                    '&comment_id=' + comments[i]["sid"] +
                '&comment_type=COMMENT'
                );
                comment_card[1].remove();
                comment_card[2].remove();
                // This is the Edit button
                $(comment_card[7]).remove();
                // This is the reply button
                $(comment_card[3]).remove();
                // Replies List Button
                $(comment_card[9]).remove();
            }
            return wrapper_div;
        }).catch(function (error) {
            $(clear_this_div).empty();
        });
        return c1;
    }
    toggle_support_rejection(post_id, post_type, circle, action, support_button, reject_button) {
        let url = '/api/v1/circle/' + circle + '/support_reject_post?post_id=' + post_id + '&action=' + action + '&post_type=' + post_type;
        new APICALLS().GenericAPICall(url, 'GET', {}).then(function (data) {
            if (action == 'support') {
                if ($(support_button).attr('data-user_support') == "No") {
                    $(support_button).addClass('border-2 border-green-500')
                    $(reject_button).removeClass('border-2 border-red-500')
                    let new_text = parseInt($(support_button).attr('data-count')) + 1;
                    $(support_button).attr('data-count', new_text)
                    new_text = new_text + ' | Support 🡅'
                    $(support_button).text(new_text)
                    $(support_button).attr('data-user_support', "Yes")
                }
                if ($(reject_button).attr('data-user_reject') == "Yes") {
                    let reject_new_text = parseInt($(reject_button).attr('data-count')) - 1;
                    $(reject_button).attr('data-count', reject_new_text)
                    reject_new_text = reject_new_text + ' | Reject 🡇'
                    $(reject_button).text(reject_new_text)
                    $(reject_button).attr('data-user_reject', "No")
                }

            } else if (action == 'reject') {
                if ($(reject_button).attr('data-user_reject') == "No") {
                    $(reject_button).addClass('border-2 border-red-500 ')
                    $(support_button).removeClass('border-2 border-green-500')
                    let new_text = parseInt($(reject_button).attr('data-count')) + 1;
                    $(reject_button).attr('data-count', new_text)
                    new_text = new_text + ' | Reject 🡇'
                    $(reject_button).text(new_text)
                    $(reject_button).attr('data-user_reject', "Yes")
                }
                if ($(support_button).attr('data-user_support') == "Yes") {
                    let support_new_text = parseInt($(support_button).attr('data-count')) - 1;
                    // alert(new_text)
                    $(support_button).attr('data-count', support_new_text)
                    support_new_text = support_new_text + ' | Support 🡅'
                    $(support_button).text(support_new_text)
                    $(support_button).attr('data-user_support', "No")
                }
            }

        })
    }
}
class profile_page_comment_replies {
    async reload_my_comments(clear_this_div) {
        let wrapper_div = document.createElement("div");
        $(clear_this_div).empty();
        $(wrapper_div).addClass('w-full')
        request_data["commentreplies"]["filter"] = "Replies";
        let c1 = await new profile_page_meta_functions().get_my_posts(request_data["commentreplies"]).then(function (data) {
            console.log(data);
            let comments = data["Posts"];
            let dataType = "REPLY_COMMENT";
            $(clear_this_div).empty();
            let post_len = data["Posts"].length;
            for (let i = 0; i < post_len; i++) {
                let comment_card = new MainFeed().common_user_commentcard(comments[i])
                if (dataType == "REPLY_COMMENT") {
                    $(comment_card[0]).addClass('border-l-2 border-green-500 rounded-l-none')
                }
                $(wrapper_div).append(comment_card[0]);
                $(comment_card[0]).attr('data-comment_type', dataType);
                $(comment_card[0]).attr('data-comment_id', comments[i]["sid"]);
                new profile_page_meta_functions().wrap_me_in_link(
                    comment_card[0], '/post/' +
                    comments[i]["parent_post_id"] +
                    '?circle_name=' + comments[i]["circle"] +
                    '&comment_id=' + comments[i]["sid"]
                );
                comment_card[1].remove();
                comment_card[2].remove();
                // This is the Edit button
                $(comment_card[7]).remove();
                // This is the reply button
                $(comment_card[3]).remove();
                // Replies List Button
                $(comment_card[9]).remove();
            }
            return wrapper_div;
        }).catch(function (error) {
            $(clear_this_div).empty();
        });
        return c1;
    }
}
class profile_page_supports {


}
class profile_page_rejects { }



class profile_page_base_cards {
    simple_title_value_card(title, value) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full p-1 pl-3 pr-3 flex flex-row justify-between  bg-gray-800 mt-2");

        let title_div = document.createElement("span");
        $(title_div).addClass("w-full text-base text-blue-200 font-bold");
        $(title_div).text(title);

        let value_div = document.createElement("span");
        $(value_div).addClass("w-full text-center text-base text-white font-bold");
        $(value_div).text(value);

        $(wrapper_div).append(title_div);
        $(wrapper_div).append(value_div);

        return wrapper_div;
    }
}

class profile_page_reset_password {
    async reset_password() {
        let url = "/api/v1/user/start_reset_password_otp";
        let r1 = new APICALLS().GenericAPICall(url, "GET", {}).then(function (data) {
            console.log(data);
            let notif = new floating_notifications_orginal().bottom_bar_notification("OTP sent to your email! redirecting...", 'bg-green-700 hover:bg-green-800 text-white font-bold p-2 m-2 mt-4 rounded cursor-pointer');
            $('body').append(notif);
            setTimeout(function () {
                document.location.href = data
            }, 2000);
        }
        ).catch(function (error) {
            let notif = new floating_notifications_orginal().bottom_bar_notification("An unknow error Occured!", 'bg-red-700 hover:bg-red-800 text-white font-bold p-2 m-2 mt-4 rounded cursor-pointer');
            $('body').append(notif);
        });
    }
    security_popup() {
        let sec_pop = new floating_notifications_orginal().custom_bg_security_popup("Are you sure, you want to reset your password?",
            ['Yes, reset password', 'do not reset password'],
            'bg-red-700 hover:bg-red-800 text-white font-bold p-2 m-2 mt-4 rounded cursor-pointer',
            'bg-gray-700 hover:bg-gray-800 text-gray-100 hover:text-gray-200 font-bold p-2 m-2 mt-4 rounded cursor-pointer');
        $('body').append(sec_pop[0]);
        $(sec_pop[1]).click(function (e) {
            $(sec_pop[0]).remove();
            new profile_page_reset_password().reset_password();
        });
        $(sec_pop[2]).click(function (e) {
            $(sec_pop[0]).remove();
        });
    }
}


class post_calls {
    follow_unfollow_toggle(follow_spanner, post_id, Main_Circle) {
        let Get_Url = '/api/v1/circle/' + Main_Circle + '/follow_unfollow_post' + '?post_id=' + post_id;
        new APICALLS().GenericAPICall(Get_Url, 'GET', {}).then(function (data) {
            if ($(follow_spanner).attr('follow_status') == "No") {
                // If they are not following, follow_status will be No. Then we will change it to Yes and change the text to Unfollow.
                $(follow_spanner).text("Unfollow -");
                $(follow_spanner).attr('follow_status', "Yes");
                $(follow_spanner).addClass('text-red-500 hover:text-red-600');
                $(follow_spanner).removeClass('text-blue-500 hover:text-blue-600');
            }
            else if ($(follow_spanner).attr('follow_status') == "Yes") {
                // If they are following, follow_status will be Yes. Then we will change it to No and change the text to Follow.
                $(follow_spanner).text("Follow +");
                $(follow_spanner).attr('follow_status', "No");
                $(follow_spanner).addClass('text-blue-500 hover:text-blue-600');
                $(follow_spanner).removeClass('text-red-500 hover:text-red-600');
            }
        });
    }
    go_to_post(post_id, Main_Circle) {
        let Get_Url = "/post/" + post_id + "?circle_name=" + Main_Circle;
        window.location.href = Get_Url;
    }
}