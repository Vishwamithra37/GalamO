let home_script_favored_language = document.cookie.split(';').find(
    cookie => cookie.trim().startsWith('favoured_language='));
if (home_script_favored_language) {
    home_script_favored_language = home_script_favored_language.split('=')[1];
} else {
    home_script_favored_language = "english";
}
let home_script_language_dicts = {
    "telugu": {
        "Follow": "అనుసరించండి",
        "Unfollow": "అనుసరించకండి",
        "Edit": "సవరించండి",
        "Lock": "తాళం పెట్టండి",
        "Unlock": "తాళం తీసివేయండి",
        "Pin": "పైన పెట్టండి",
        "Unpin": "పైనించి తీసివేయండి",
        "options": "సూచనలు",
        "copy-link": "లింక్ కాపీ చేయండి",
    }
}
var title_bar = new bottom_bar().title_bar();
var Main_Circle;
var current_main_filter = "New";
var captcha_trigger = 0;
$(document).ready(function () {
    // A listener on the circle select box which changes Main_Circle variable.
    var post_counter = 0;
    let get_posts_data;
    let noofposts = 0;
    let feed_loader_counter = 0;
    // If a cookie exists, then select the Main_Circle from the dropdown of Main_circle_in_Focuse.

    Main_Circle = $('#Main_Circle_In_Focus').find(":selected").text();
    let optioner_original = document.createElement('option');
    $(optioner_original).text("No Cards Available");
    $('#InfoBoardTitle').append(optioner_original);
    $('#subtilteInfoBoard').text("Not Available")
    get_posts_data = {
        "noofposts": "0",
        "filters": []
    }
    if (optional_select_circle) {
        // Put this in the cookie.
        Main_Circle = optional_select_circle;
        // Persistent Cookie.
        document.cookie = "Main_Circle=" + Main_Circle + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    }

    $('#Main_Circle_In_Focus').change(function () {
        // Refreshing statistics.
        // Disable Main_Circle_In_Focus dropdown.
        $('#Main_Circle_In_Focus').attr('disabled', true);
        $('#Main_Circle_In_Focus_mobile').attr('disabled', true);
        new statistics_homepage().refresh_statistics();
        // Save the current circle in a cookie.
        feed_loader_counter = 0;
        Main_Circle = $('#Main_Circle_In_Focus').find(":selected").text();
        document.cookie = "Main_Circle=" + Main_Circle + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
        new post_calls().editor_refresh()
        get_posts_data["noofposts"] = "0";
        noofposts = 0;
        get_posts_data["filters"] = [];
        new post_calls().filter_refresh_posts(get_posts_data, true)
        filter_box_refill();
        //  Now for the information board.
        let info_board_url = '/api/v1/circle/get_information_and_announcement_board/' + Main_Circle;
        $('#InfoBoardTitle').empty();
        $('#subtilteInfoBoard').text('Not Available');
        $('#InfoBoardCards').empty();
        new APICALLS().GenericAPICall(info_board_url, 'GET', {}).then(function (data) {
            let len_of_info_board = data["Information_Board"].length;
            for (let i = 0; i < len_of_info_board; i++) {
                let optioner = document.createElement('option');
                $(optioner).text(data["Information_Board"][i]["title"]);
                $(optioner).attr('data-subtitle', data["Information_Board"][i]["subtitle"]);
                $(optioner).attr('data-content', JSON.stringify(data["Information_Board"][i]["Information_cards"]));
                $('#InfoBoardTitle').append(optioner);
            };
            let info_board_cookie = new meta_hooks().retrieve_info_board_cookie_for_current_circle();
            if (info_board_cookie) {
                $('#InfoBoardTitle').find('option').each(function () {
                    if ($(this).text() == info_board_cookie) {
                        $(this).attr('selected', true);
                    }
                }
                );
            }
            new meta_hooks().add_info_board_cookies();
            $('#subtilteInfoBoard').text($('#InfoBoardTitle').find(":selected").attr('data-subtitle'));
            let content_of_info_board = JSON.parse($('#InfoBoardTitle').find(":selected").attr('data-content'));
            for (let i = 0; i < content_of_info_board.length; i++) {
                let info_card = new MainFeed().Information_board_cards(content_of_info_board[i]);
                $('#InfoBoardCards').append(info_card);
            }
            $('#InfoBoardTitle').change(function () {
                $('#InfoBoardCards').empty();
                $('#subtilteInfoBoard').text($('#InfoBoardTitle').find(":selected").attr('data-subtitle'));
                let content_of_info_board = JSON.parse($('#InfoBoardTitle').find(":selected").attr('data-content'));
                for (let i = 0; i < content_of_info_board.length; i++) {
                    let info_card = new MainFeed().Information_board_cards(content_of_info_board[i]);
                    $('#InfoBoardCards').append(info_card);
                }
                let info_board_cookie = new meta_hooks().retrieve_info_board_cookie_for_current_circle();
                if (info_board_cookie) {
                    $('#InfoBoardTitle').find('option').each(function () {
                        if ($(this).text() == info_board_cookie) {
                            $(this).attr('selected', true);
                        }
                    }
                    );
                }
                new meta_hooks().add_info_board_cookies();
            });
            $('#InfoBoardTitle').change();
        });

    });

    let mainCircleCookie = document.cookie.match(/Main_Circle=([^;]+)/);
    if (mainCircleCookie) {
        var Main_Circle_Dropdown = document.getElementById("#Main_Circle_In_Focus");
        var Main_Circle_Dropdown_option = $("#Main_Circle_In_Focus option").toArray();
        for (let i = 0; i < Main_Circle_Dropdown_option.length; i++) {
            if (Main_Circle_Dropdown_option[i].text === mainCircleCookie[1]) {
                Main_Circle_Dropdown_option[i].selected = true;
                break;
            }
        }
    }
    // Change Main_Circle_In_Focus_mobile to the same as Main_Circle_In_Focus
    $('#Main_Circle_In_Focus_mobile').find('option').each(function () {
        if ($(this).text() == $('#Main_Circle_In_Focus').find(":selected").text()) {
            $(this).attr('selected', true);
        }
    });
    $('#Main_Circle_In_Focus').change();


    let info_board_url = '/api/v1/circle/get_information_and_announcement_board/' + Main_Circle;

    let feeder_div = $('#Content_Column')

    $(feeder_div).scroll(function (e) {
        let scroll_percentage = new meta_hooks().calculateScrollPercentage(feeder_div);

        if (scroll_percentage > 80 && feed_loader_counter == 0) {
            feed_loader_counter = 1;
            noofposts = parseInt(noofposts) + 10;
            noofposts = noofposts.toString();
            get_posts_data["noofposts"] = noofposts;
            let posters = new post_calls().filter_refresh_posts(get_posts_data).then(function (data) {
                if (data == false) {
                    feed_loader_counter = 1;
                } else {
                    feed_loader_counter = 0;
                }
            });

        }
    });
    new meta_hooks().stuff_to_hide_when_scrolling_down_and_show_when_scrolling_up('#Bottom_Logo_Bar_Section');
    function filter_box_refill() {
        var Filter_box_tags;
        new APICALLS().GenericAPICall('/api/v1/circle/get_all_flair_tags_for_editor/' + Main_Circle, 'GET', {}).then(function (data) {
            $('#Filter_Box').empty();
            Filter_box_tags = data["Flair_Tags"]
            let lensofarray = Filter_box_tags.length;
            for (let i = 0; i < lensofarray; i++) {
                // if(Filter_box_tags[i]["name"]=="Member"){
                let spanner = new meta_hooks().spanner_for_filter_box(Filter_box_tags[i]);
                $(spanner).attr('data-Selected_Filter', 'No').attr('data-Filter_value', Filter_box_tags[i])
                $(spanner).click(function () {
                    feed_loader_counter = 0;
                    noofposts = parseInt(0).toString();
                    if ($(this).attr('data-Selected_Filter') == 'No') {
                        $(this).removeClass('text-gray-200');
                        $(this).addClass('text-green-300 border-2 border-green-300 dark:text-black dark:shadow-lg dark:font-bold');
                        $(this).attr('data-Selected_Filter', 'Yes');
                        get_posts_data["noofposts"] = "0"
                        get_posts_data["filters"].push($(this).text());
                        new post_calls().filter_refresh_posts(get_posts_data, true);
                    } else {
                        $(this).removeClass('text-green-300 border-2 border-green-300 dark:text-black dark:shadow-lg dark:font-bold');
                        $(this).addClass('text-gray-200');
                        $(this).attr('data-Selected_Filter', 'No');
                        get_posts_data["noofposts"] = "0"
                        get_posts_data["filters"].splice(get_posts_data["filters"].indexOf($(this).text()), 1);
                        new post_calls().filter_refresh_posts(get_posts_data, true);
                    }
                });
                $('#Filter_Box').append(spanner);
            }
            // break;
            // }
        }
        );
    }
    filter_box_refill();

    // /////////////// This section belongs to the current active filters section. ///////////////
    let active_filter = ["#current_active_filter_new", "#current_active_filter_Rising", "#current_active_filter_Hot"];
    let active_filter_data_value = ["New", "Rising", "Hot"];
    // For click on any of the elements in the current active filters section. trigger a post refresh.
    for (let i = 0; i < active_filter.length; i++) {
        $(active_filter[i]).click(function () {
            feed_loader_counter = 0;
            noofposts = parseInt(0).toString();
            current_main_filter = active_filter_data_value[i];
            get_posts_data["noofposts"] = "0"
            let active_filter = new home_script_meta_function_calls().find_all_the_active_flairs();
            get_posts_data["filters"] = active_filter;
            new post_calls().filter_refresh_posts(get_posts_data, true);
        });
    }
    // /////////////// This section belongs to the current active filters section. ///////////////






});
// For first timers
$(document).ready(function () {
    // Now First layer for Official Circles and Open Circles.
    layer1_wrapper_div = new starting_screen_home_page().Generic_div("w-full flex flex-row justify-center pl-4 pr-4 border-b-2 border-green-500 hover:border-green-600", "");
    layer2_wrapper_div = new starting_screen_home_page().Generic_div("w-full flex flex-row justify-center pl-4 pr-4 border-b-2 border-green-500 hover:border-green-600", "");
    layer3_next_back_and_skip_wrapper_div = new starting_screen_home_page().Generic_div("w-full flex flex-col justify-center pl-4 pr-4", "");

    let official_circles = new starting_screen_home_page().Generic_div(
        "hidden text-white text-center p-2 border-r-0  mr-2 border-blcak rounded-sm cursor-pointer text-xl font-bold hover:text-green-500",
        "Join Official Circles"
    );
    let open_circles = new starting_screen_home_page().Generic_div(
        "hidden text-white text-center p-2 border-l-0 ml-2 border-black rounded-sm cursor-pointer text-xl font-bold hover:text-green-500",
        "Join Open Circles"
    );
    new starting_screen_home_page().meta_function_to_change_colors(
        [official_circles, open_circles],
        "text-white",
        "text-green-500"
    );

    let welcome_title = new starting_screen_home_page().Generic_div(
        "text-white text-center p-2 rounded-sm cursor-pointer text-xl font-bold",
        "Welcome to project GTSocial"
    );

    $(layer1_wrapper_div).append(official_circles);
    // $(layer1_wrapper_div).append(open_circles);
    $(layer1_wrapper_div).append(welcome_title);

    let video_iframe_from_youtube = new starting_screen_home_page().Generic_div(
        "w-full h-96",
        '<iframe class="w-full h-full" src="https://www.youtube.com/embed/2cyzCReoNgU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>');
    $(layer2_wrapper_div).append(video_iframe_from_youtube);

    let next_back_wrapper = new starting_screen_home_page().Generic_div("w-full flex flex-row justify-center mt-0 mb-4", "");
    let next_button = new starting_screen_home_page().Generic_Button(
        "text-green-400 text-center p-2 w-full bg-gray-800 rounded-sm cursor-pointer text-xl font-bold hover:text-green-500",
        "Next to selecting circles"
    );
    let back_button = new starting_screen_home_page().Generic_Button(
        "hidden text-green-400 text-center p-2 w-full bg-gray-800 rounded-sm cursor-pointer text-xl font-bold hover:text-green-500",
        "Back"
    );
    let skip_button = new starting_screen_home_page().Generic_Button(
        "text-gray-500 text-center p-2 bg-black rounded-sm cursor-pointer text-xl font-bold hover:text-gray-400",
        "Skip to Home"
    );
    $(skip_button).attr('id', 'skip_to_home_startup_screen_disabler')
    $(next_back_wrapper).append(back_button);
    $(next_back_wrapper).append(next_button);

    $(layer3_next_back_and_skip_wrapper_div).append(next_back_wrapper);
    $(layer3_next_back_and_skip_wrapper_div).append(skip_button);

    let aadhar_information_div = new starting_screen_home_page().Generic_div(
        "hidden w-full p-1 md:p-2 text-green-500 font-bold border border-green-500 text-sm rounded-sm mt-2 mb-2 overflow-y-auto",
        "Flow: Aadhar Number > Captcha > OTP > Done!<br/>"
        + "Aadhar data which shall be used: <br/>--> User Addresses (State, city/town/village and pincode), <br/> --> User Gender (Only for statistical purposes) <br/> --> Age (Only for statistical purposes)." +
        "<br/><span class='text-gray-200 font-bold'>What will be not used:<br/>-->  Your name <br/>--> Your mobile number<br/>--> any other information which can be used to identify you without your permission</span>");
    $(layer3_next_back_and_skip_wrapper_div).append(aadhar_information_div);

    $(next_button).click(function () {
        // Hide the title and the video. Replace it with the circles.
        $(welcome_title).addClass("hidden");
        $(video_iframe_from_youtube).addClass("hidden");
        $(official_circles).removeClass("hidden");
        $(open_circles).removeClass("hidden");
        // $(back_button).removeClass("hidden");
        $(next_button).addClass("hidden");
        $(official_circles).click();
        $(skip_button).text("Finish")
        $(skip_button).removeClass("text-gray-500 hover:text-gray-400");
        $(skip_button).addClass("text-blue-500 hover:text-blue-400");
    });
    $(back_button).click(function () {
        // Hide the title and the video. Replace it with the circles.
        $(welcome_title).removeClass("hidden");
        $(video_iframe_from_youtube).removeClass("hidden");
        $(official_circles).addClass("hidden");
        $(open_circles).addClass("hidden");
        $(back_button).addClass("hidden");
        $(next_button).removeClass("hidden");
        $(skip_button).text("Skip to Home")
        $(skip_button).removeClass("text-blue-500 hover:text-blue-400");
        $(skip_button).addClass("text-gray-500 hover:text-gray-400");
        // Information label.
    });

    $(official_circles).click(function () {
        $(layer2_wrapper_div).empty();
        let local_big_wrapper_layer = new starting_screen_home_page().Generic_div("w-full overflow-y-auto flex flex-col", "");
        let local_layer1_wrapper_div = new starting_screen_home_page().Generic_div("w-full overflow-y-auto mt-2 flex flex-row pl-2 pr-4 mb-2 hover:border-green-600", "");
        let country_label = new starting_screen_home_page().Generic_label("text-gray-200 pt-3 text-sm font-bold p-2", "Select Country", "Country");
        let country_dropdown = new starting_screen_home_page().Generic_Dropdown(
            "bg-gray-800 text-white p-2 font-semibold outline-none",
            ["India"]
        )
        $(country_dropdown).attr('id', 'Country');
        $(local_layer1_wrapper_div).append(country_label);
        $(local_layer1_wrapper_div).append(country_dropdown);
        $(local_big_wrapper_layer).append(local_layer1_wrapper_div);

        let local_layer2_wrapper_div = new starting_screen_home_page().Generic_div("w-full flex flex-row pl-2 pr-4 mb-2 hover:border-green-600", "");
        // On selecting a country, make an API call to get all the states of that country.
        $(country_dropdown).change(function () {
            let current_country = $(country_dropdown).find(":selected").text();
            if (current_country == "India") {
                if (user_powers_list.includes("aadhar_verification")) {
                    $(aadhar_information_div).removeClass("hidden");

                    let Aadhar_label = new starting_screen_home_page().Generic_label("text-gray-200 pt-3 text-sm font-bold p-2", "Aadhar Number", "Aadhar");
                    let Aadhar_input = new starting_screen_home_page().Generic_input("bg-gray-800 w-full text-base text-white pl-2 outline-none font-semibold", "Enter Aadhar Number for Verification", "");

                    $(Aadhar_input).attr('id', 'Aadhar');
                    $(local_layer2_wrapper_div).empty();
                    $(local_layer2_wrapper_div).append(Aadhar_label);
                    $(local_layer2_wrapper_div).append(Aadhar_input);
                    // If 12 digits are entered, then make an API call to get captcha and show it.
                    $(Aadhar_input).keyup(function () {
                        if ($(Aadhar_input).val().length == 12 && captcha_trigger == 0) {
                            let aadhar_captcha_url = '/api/v1/user/aadhar_verification_get_captcha?aadhar_id=' + $(Aadhar_input).val();
                            let notif = new floating_notifications().bottom_bar_notification("Getting Captcha...", 'bg-black p-2 text-gray-200 text-sm font-bold rounded', 3000)
                            $('body').append(notif);
                            captcha_trigger = 1;
                            let r1 = new APICALLS().GenericAPICall(aadhar_captcha_url, 'GET', {}).then(function (data) {
                                let local_layer3_wrapper_div = new starting_screen_home_page().Generic_div("w-full justify-center flex flex-row h-12 pl-2 pr-4 mb-2 hover:border-green-600", "");
                                let img_tag = document.createElement('img');
                                $(img_tag).attr('src', 'data:image/png;base64,' + data["captcha_base64"]);
                                $(img_tag).addClass("bg-gray-200");
                                let captcha_input = new starting_screen_home_page().Generic_input("bg-gray-800 w-14 text-base text-white p-2 ml-2 outline-none font-semibold", "Enter Result", "");
                                let submit_captcha_button = new starting_screen_home_page().Generic_Button("bg-gray-800 mb-2 w-full text-base text-white p-2 outline-none font-semibold hover:text-green-500 ", "Submit");
                                $(local_layer3_wrapper_div).append(img_tag);
                                $(local_layer3_wrapper_div).append(captcha_input);
                                $(local_big_wrapper_layer).append(local_layer3_wrapper_div);
                                $(local_big_wrapper_layer).append(submit_captcha_button);
                                console.log(data["captcha_id"]);
                                $(submit_captcha_button).click(function () {
                                    let data_to_be_submitted = {
                                        "captcha_id": data["captcha_id"],
                                        "captcha": $(captcha_input).val()
                                    }
                                    let aadhar_captcha_url = '/api/v1/user/aadhar_verification_validate_captcha_and_send_otp'
                                    let notif = new floating_notifications().bottom_bar_notification("Verifying Captcha...", 'bg-black p-2 text-gray-200 text-sm font-bold rounded', 3000)
                                    $('body').append(notif);
                                    let r2 = new APICALLS().GenericAPIJSON_CALL(aadhar_captcha_url, 'POST', JSON.stringify(data_to_be_submitted)).then(function (data2) {
                                        let notif = new floating_notifications().bottom_bar_notification("Captcha Verified! <br/> OTP Sent to Registered Mobile Number", 'bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                                        $('body').append(notif);
                                        let local_layer4_wrapper_div = new starting_screen_home_page().Generic_div("w-full justify-center flex flex-row h-12 pl-2 pr-4 mb-2 hover:border-green-600", "");
                                        let otp_input = new starting_screen_home_page().Generic_input("bg-gray-800 w-20 text-base text-white p-2 ml-2 outline-none font-semibold", "Enter OTP", "");
                                        let submit_otp_button = new starting_screen_home_page().Generic_Button("bg-gray-800 mb-2 w-full text-base text-white p-2 outline-none font-semibold hover:text-green-500 ", "Submit");
                                        $(local_layer4_wrapper_div).append(otp_input);
                                        $(local_big_wrapper_layer).append(local_layer4_wrapper_div);
                                        $(local_big_wrapper_layer).append(submit_otp_button);
                                        $(submit_otp_button).click(function () {
                                            let data_to_send = {
                                                "otp": $(otp_input).val(),
                                            }
                                            let aadhar_otp_url = '/api/v1/user/aadhar_verification_validate_mobile_otp'
                                            let notif = new floating_notifications().bottom_bar_notification("Verifying OTP...", 'bg-black p-2 text-gray-200 text-sm font-bold rounded', 3000)
                                            $('body').append(notif);
                                            let r3 = new APICALLS().GenericAPIJSON_CALL(aadhar_otp_url, 'POST', JSON.stringify(data_to_send)).then(function (data3) {
                                                let notif = new floating_notifications().bottom_bar_notification("Aadhar Verification Successful", 'bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                                                $('body').append(notif);

                                            }).catch(function (error) {
                                                let notif = new floating_notifications().bottom_bar_notification("Wrong OTP! <br/> please make sure you have entered the correct OTP", 'bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                                                $('body').append(notif);
                                            })
                                        });
                                    }).catch(function (error) {
                                        let notif = new floating_notifications().bottom_bar_notification("Error Verifying Captcha! <br/> please make sure you have entered the correct Captcha", '  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                                        $('body').append(notif);
                                    });
                                });
                            }).catch(function (error) {
                                captcha_trigger = 0;
                                let notif = new floating_notifications().bottom_bar_notification("Error Getting Captcha! <br/> please make sure you have entered the correct Aadhar Number", '  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                                $('body').append(notif);
                            });
                        }
                    });
                }
                else if (user_powers_list.includes("voter_id_verification")) {
                    let voter_section = new starting_screen_home_page().voter_id_verificaiton();
                    $(local_layer2_wrapper_div).empty();
                    $(local_layer2_wrapper_div).append(voter_section);
                    $(local_big_wrapper_layer).append(local_layer2_wrapper_div);
                    let aadhar_information_div = new starting_screen_home_page().Generic_div(
                        "hidden w-full p-1 md:p-2 text-green-500 font-bold border border-green-500 text-sm rounded-sm mt-2 mb-2 overflow-y-auto",
                        "Flow: VoterID > Done!<br/>"
                        + "Voter data which shall be used: <br/>-->Municipal ward (To assign you into that circle), <br/> --> Vidhan Sabha (To assign you into that circle) <br/> --> Lok Sabha (To assign you into that circle)."
                    );
                    $(local_big_wrapper_layer).append(aadhar_information_div);
                }
                else {
                    $(skip_button).click();
                }
            }
        });
        $(local_big_wrapper_layer).append(local_layer2_wrapper_div);
        $(layer2_wrapper_div).append(local_big_wrapper_layer);
        // Select India by default.
        $(country_dropdown).change();
    });
    $(open_circles).click(function () {
    });

    let wrappa = new floating_notifications_orginal().multi_col_stack_floater([layer1_wrapper_div, layer2_wrapper_div, layer3_next_back_and_skip_wrapper_div]);

    if (startup_screen_enabled) {
        $('body').append(wrappa);
    }

    $(skip_button).click(function () {
        // Remove the wrapper div.
        let starup_screen_caller_url = "/api/v1/user/close_startup_screen?action=" + "No"
        new APICALLS().GenericAPICall(starup_screen_caller_url, 'GET', {}).then(function (data) {
            console.log(data)
            $(wrappa).remove();
        }).catch(function (error) {
            let notif = new floating_notifications().bottom_bar_notification("Error disabling startup screen", '  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(notif);
            $(wrappa).remove();
        });
    });
});
// For getting geo location.
$(document).ready(function () {
    $('#mapper').click(function (e) {
        e.preventDefault();
        let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Checking circles in your area....", ' animate-pulse  bg-black p-2 text-yellow-200 text-sm font-bold rounded', 3000)
        $('body').append(floatin_notif);
        // If permission is not given, then show 
        // $(floatin_notif).remove();
        // floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Geolocation permission was not provided :(", 'bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
        // $('body').append(floatin_notif);
        if (navigator.geolocation) {
            let k1 = navigator.geolocation.getCurrentPosition(
                showPosition, error_function
            );
            function error_function() {
                $(floatin_notif).remove();
                floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Geolocation permission was not provided :(", 'bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
            }

        }


        let coordinates = [];
        function showPosition(
            position) {
            coordinates = [Object(position)["coords"]["longitude"], Object(position)["coords"]["latitude"]];
            let caller2 = new APICALLS().GenericAPIJSON_CALL(
                "/api/v1/user/get_circles_in_the_area",
                "POST",
                JSON.stringify({
                    "coordinates": coordinates
                })
            ).then(function (data) {
                $(floatin_notif).remove();
                floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Operation successful!", 'bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
                console.log(data);
                let len_of_circles = data["Circles"].length;
                let floater = new circle_floatin_circle_selector_home_page().the_carousel(data["Circles"], data["infostring"]);
                $('body').append(floater);

            }
            );
        }
    });

});
// For making the sides vanish if not hovered upon.
$(document).ready(function () {
    // If the user does not hover on the left or right side, then make their opacity 20 percent.
    // $('#Left_Column').hover(function () {
    //     $('#Right_Column').css('opacity', '100%');
    //     $('#Left_Column').css('opacity', '100%');
    // }, function () {
    //     $('#Right_Column').css('opacity', '20%');
    //     $('#Left_Column').css('opacity', '20%');
    // });
    // $('#Right_Column').hover(function () {
    //     $('#Right_Column').css('opacity', '100%');
    //     $('#Left_Column').css('opacity', '100%');
    // }, function () {
    //     $('#Right_Column').css('opacity', '20%');
    //     $('#Left_Column').css('opacity', '20%');
    // });


});

class statistics_homepage {
    async get_statistics_data() {
        let url = "/api/v1/circle/get_circle_statistics/" + $('#Main_Circle_In_Focus').find(":selected").text();
        let statistics_data = await new APICALLS().GenericAPICall(url, 'GET', {})
        return statistics_data
    }
    refresh_statistics() {
        let statista_data = new statistics_homepage().get_statistics_data().then(function (data) {
            // console.log(data)
            $('#ultra_basic_statistics_lifetime_user_traffic').text("⬤: " + data["All_Time_Member_Traffic"]);
            $('#ultra_basic_statistics_current_users').text("⬤: " + data["Current_Members"]);
            $('#homepage_circle_description').text(data["Description"]);
        });
    }
}
class starting_screen_home_page {
    voter_id_verificaiton() {
        let wrapper_div = new starting_screen_home_page().Generic_div("w-full flex flex-col", "");
        let label_voter_id = new starting_screen_home_page().Generic_label("text-gray-200 pt-3 text-sm font-bold p-2 mb-2", "Voter ID (EPIC Number):", "Voter_ID");
        let input_voter_id = new starting_screen_home_page().Generic_input("bg-gray-800 w-full text-base text-white p-2 outline-none font-semibold", "Enter Voter ID Number for Verification", "");
        let submit_button = new starting_screen_home_page().Generic_Button("bg-gray-800 mt-2 w-full text-base text-white p-2 outline-none font-semibold hover:text-green-500 ", "Submit");
        $(input_voter_id).attr('id', 'Voter_ID');
        $(wrapper_div).append(label_voter_id);
        $(wrapper_div).append(input_voter_id);
        $(wrapper_div).append(submit_button);
        $(submit_button).click(function () {
            if ($(input_voter_id).val().length != 10) {
                let notif = new floating_notifications().bottom_bar_notification("Voter ID should be 10 digits long", 'bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(notif);
                return;
            }
            let sec_box = new floating_notifications_orginal().custom_bg_security_popup(
                "Confirm Voter ID as " + $(input_voter_id).val() + "?",
                ["Confirm Voter ID", "Cancel"],
                "bg-black text-green-500 font-bold hover:text-green-600",
                "bg-black text-gray-200 font-bold hover:text-gray-400",
            )
            $('body').append(sec_box[0]);
            $(sec_box[1]).click(function () {
                let voter_url = '/api/v1/user/voter_id_verification/' + $(input_voter_id).val();
                let notif = new floating_notifications().bottom_bar_notification("Verifying Voter ID...", 'bg-black p-2 text-gray-200 text-sm font-bold rounded', 3000)
                $('body').append(notif);
                $(sec_box[0]).remove();
                $(submit_button).addClass('hidden');
                new APICALLS().GenericAPICall(voter_url, 'GET', {}).then(function (data) {
                    let notif = new floating_notifications().bottom_bar_notification("Voter ID Verified! <br/> You will be added to your registered Constituencies and municipalities in due time", 'bg-black p-2 text-green-500 text-sm font-bold rounded', 5000)
                    $('body').append(notif);
                    $(submit_button).remove();
                    $('#skip_to_home_startup_screen_disabler').click();
                }).catch(function (error) {
                    let notif = new floating_notifications().bottom_bar_notification("Error Verifying Voter ID! <br/> please make sure you have entered the correct Voter ID", '  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                    $('body').append(notif);
                    $(submit_button).removeClass('hidden');
                });
            });
            $(sec_box[2]).click(function () {
                $(sec_box[0]).remove();
            });
        });
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
                    $(this).attr('data-active', 'No');
                });
                $(this).removeClass(default_text_color);
                $(this).addClass(active_text_color);
                $(this).attr('data-active', 'Yes');
            });
        }
    }
    Generic_Dropdown(classer, options) {
        let dropdown = document.createElement("select");
        $(dropdown).addClass(classer);
        let len_of_options = options.length;
        for (let i = 0; i < len_of_options; i++) {
            let optioner = document.createElement('option');
            $(optioner).text(options[i]);
            $(dropdown).append(optioner);
        }
        return dropdown;
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
        $(div).html(text);
        return div;
    }
    Generic_iframe(classer, innerhtml) {
        let iframe = document.createElement("iframe");
        $(iframe).addClass(classer);
        $(iframe).html(innerhtml);
        return iframe;
    }
    Generic_input(classer, placeholder, value) {
        let input = document.createElement("input");
        $(input).addClass(classer);
        $(input).attr("placeholder", placeholder);
        $(input).val(value);
        return input;
    }
    Generic_label(classer, text, for_element_id) {
        let label = document.createElement("label");
        $(label).addClass(classer);
        $(label).text(text);
        $(label).attr('for', for_element_id);
        return label;
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

}

class circle_floatin_circle_selector_home_page {
    the_carousel(cards, card_count) {
        let layer1 = new starting_screen_home_page().Generic_div("w-full p-2 flex flex-row text-center text-white dark:text-black font-semibold", "");
        let layer1_span = new starting_screen_home_page().Generic_div("sm:text-sm text-base p-2 border-b-4 dark:border-green-700 border-gray-700 justify-center", card_count);
        let layer1_cancel_button = new starting_screen_home_page().Generic_div("p-2 border-b-0 text-white dark:text-black bg-gray-900 hover:bg-black dark:hover:bg-gray-300 dark:bg-gray-200 dark:border-green-700 border-gray-700 justify-center cursor-pointer hover:text-red-500 text-center", "Close the box and go to home");
        $(layer1).append(layer1_span);
        let layer2 = new starting_screen_home_page().Generic_div("w-full h-auto flex-wrap p-2 flex flex-row justify-evenly overflow-y-auto", "");
        for (let i = 0; i < cards.length; i++) {
            let thecard = new circle_floatin_circle_selector_home_page().circle_home_card(cards[i]);
            $(layer2).append(thecard);
        }
        let layers_array = [
            layer1,
            layer2,
            layer1_cancel_button,
        ]
        let classer = "bg-gray-800 dark:bg-white dark:text-black dark:shadow-lg dark:hover:shadow-2xl dark:hover:text-black p-2 flex flex-col  w-full md:w-5/12 h-5/6 bg-gray-900 rounded-lg bg-black shadow-lg p-2 border-0 border-gray-200"
        let floater = new floating_notifications_orginal().ultra_pure_multi_col_stack_floater(layers_array, classer);
        $(layer1_cancel_button).click(function () {
            $(floater).remove();
        });
        return floater;
    }
    circle_home_card(circle_details) {
        let wrapperdiv = document.createElement("div");
        wrapperdiv.setAttribute("class", "p-2 flex flex-col hover:shadow-md rounded-md bg-gray-900 ml-2 mb-2 w-60 h-72 justify-between hover:border border-gray-600 hover:bg-black dark:bg-white dark:text-black dark:shadow-lg dark:hover:shadow-2xl dark:hover:text-black");
        let circle_image = document.createElement("img");
        circle_image.setAttribute("class", "w-full h-32 object-cover rounded-t-md w-full cursor-pointer ");
        circle_image.setAttribute("src", circle_details["CircleImage"]);
        let circle_name = document.createElement("div");
        circle_name.setAttribute("class", " text-gray-200 font-bold text-xl cursor-pointer truncate hover:text-clip h-8 hover:h-auto overflow-x-auto dark:bg-white dark:text-black");
        circle_name.innerHTML = circle_details["DisplayName"];
        let circle_description = document.createElement("div");
        circle_description.setAttribute("class", " text-gray-200 text-sm cursor-pointer text-ellipsis h-12 hover:overflow-visible overflow-hidden hover:overflow-y-scroll dark:bg-white dark:text-black");
        circle_description.innerHTML = circle_details["Description"];
        let circle_tags = document.createElement("div");
        circle_tags.setAttribute("class", "flex flex-row overflow-x-auto flex-nowrap overflow-y-hidden dark:bg-white dark:text-black dark:shadow-md");

        for (let i = 0; i < circle_details["Circle_Tags"].length; i++) {
            let circle_tag_span = document.createElement("span");
            circle_tag_span.setAttribute("class", "font-semibold text-sm text-white bg-gray-600 hover:bg-gray-700 p-1 rounded-md m-1 h-8  hover:overflow-visible hover:h-auto dark:bg-gray-200 dark:shadow-md dark:text-black");
            circle_tag_span.innerHTML = circle_details["Circle_Tags"][i];
            circle_tags.appendChild(circle_tag_span);
        }
        wrapperdiv.appendChild(circle_image);
        wrapperdiv.appendChild(circle_name);
        wrapperdiv.appendChild(circle_description);
        wrapperdiv.appendChild(circle_tags);

        $(circle_tags).click(function (e) {
            e.preventDefault();
        });
        let join_button = document.createElement("button");
        $(join_button).addClass('text-base bg-green-700 rounded-md m-1 mt-2 p-2 text-gray-200 font-semibold outline-none hover:text-white hover:bg-green-800 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-md');
        $(join_button).text("Join");
        if (circle_details["isJoined"] == "Yes") {
            $(wrapperdiv).click(function (e) {
                e.preventDefault();
                // Clean content_board.

                window.location.href = window.location.origin + "/home" + "?circle_name=" + circle_details["DisplayName"];
            });
        } else {
            wrapperdiv.appendChild(join_button);
        }
        $(join_button).click(function (e) {
            e.preventDefault();
            let joiner = new circle_floatin_circle_selector_home_page().join_circle_api_call(circle_details["DisplayName"]).then((data) => {
                $(join_button).remove();
            }).catch((error) => {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Failed to join circle!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
            }
            );
        });


        return wrapperdiv;
    }
    async join_circle_api_call(circle_name) {
        let url = "/api/v1/circle/join_circle";
        let data_to_send = {
            "CircleName": circle_name
        }
        let data = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(data_to_send)).then((data) => {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Successfully joined circle!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return data;
        });
        return data;
    }
}



class meta_hooks {

    add_info_board_cookies() {
        const current_circle = $('#Main_Circle_In_Focus').find(":selected").text();
        const current_info_board_title = $('#InfoBoardTitle').find(":selected").text();
        // Persistent cookie.
        document.cookie = "Info_Board" + "_" + current_circle + "=" + current_info_board_title + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    }
    retrieve_info_board_cookie_for_current_circle() {
        const current_circle = $('#Main_Circle_In_Focus').find(":selected").text();
        const current_info_board_title = $('#InfoBoardTitle').find(":selected").text();
        let info_board_cookie_json = document.cookie.match(new RegExp('Info_Board' + "_" + current_circle + '=([^;]+)'));
        if (info_board_cookie_json) {
            return info_board_cookie_json[1];
        } else {
            return false;
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



    spanner_for_filter_box(span_text) {
        let spanner = document.createElement('span');
        $(spanner).addClass('bg-gray-700 text-center text-gray-200  rounded-sm p-2 m-2 cursor-pointer hover:bg-gray-800 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 dark:hover:text-gray-900 dark:hover:shadow-lg');
        $(spanner).text(span_text);
        return spanner;
    }

    hook_for_editor() {
        // $('#Asker').focus()
        // Focus on the second grandchild of #Asker div.
        $('#Asker').children().children().click();
        $(title_bar).focus();
    }

    // A function which takes in a div and triggers an action when 80% of the div is scrolled.

    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }


}

class post_calls {
    editor_refresh() {
        $('#Asker').empty();
        let Main_Circle = $('#Main_Circle_In_Focus').find(":selected").text();
        var editor = new GEditor();
        let ed_class = "w-full h-14 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto dark:text-gray-900 dark:bg-white dark:shadow-lg";
        let flairs = ["Discussion", "Question", "Administration", "Suggestion", "Other", "Proposal", "Tender"]
        let imager_addon = new Add_Ons().add_image_addon();
        let pdf_addon = new Add_Ons().add_pdf_addon();
        let forms_addon = new Add_Ons().forms_addon();
        let submit_button = new Add_Ons().add_submit_button("Create Post", "p-2 text-center bg-green-600 text-sm text-white cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
        // let flairs_button=new Add_Ons().add_flairs_addon(flairs);   
        let bottombars = new Add_Ons().image_pdf_tags_placeholder_div_bar_addon('bg-gray-800 bg-gray-900');
        new meta_functions().put_them_in_one_place(imager_addon[1], bottombars, "image")
        new meta_functions().put_them_in_one_place(pdf_addon[1], bottombars, "pdf")
        // new meta_functions().put_them_in_one_place(forms_addon[1], bottombars, "forms")
        let e_flairs;
        let editor_powers
        let flairs2_button = document.createElement('div');
        let e_flairs2 = new APICALLS().GenericAPICall('/api/v1/circle/get_flair_tags_for_editor/' + Main_Circle, 'GET', {}).then(function (data) {
            e_flairs = data["Flair_Tags"]
            editor_powers = data["Editor_Powers"]
            flairs2_button = new Add_Ons().add_role_flairs_addon(e_flairs);
            let tool_bar_options;
            if (editor_powers.includes("create_survey")) {
                tool_bar_options = { "Addons": [imager_addon[0], pdf_addon[0], flairs2_button, forms_addon[0]], "Bottombar": [submit_button] }
            } else {
                tool_bar_options = { "Addons": [imager_addon[0], pdf_addon[0], flairs2_button], "Bottombar": [submit_button] }
            }
            var editor_div;

            editor_div = editor.geditor(ed_class, tool_bar_options, 'Type your post here...');
            if (home_script_favored_language == "telugu") {
                editor_div = editor.geditor(ed_class, tool_bar_options, 'మీ పోస్ట్ ఇక్కడ టైప్ చేయండి...');
            }

            $(editor_div[1]).after(bottombars);
            $(editor_div[1]).before(title_bar);
            $('#Asker').append(editor_div[0]);
            $('#Asker').click(function () {
                $(editor_div[1]).removeClass('h-14');
                $(editor_div[1]).addClass('h-52');
            });
            $('#Asker').blur(function () {
                $(editor_div[1]).removeClass('h-52');
                $(editor_div[1]).addClass('h-14');
            });

            $(submit_button).click(function () {
                $(submit_button).addClass('hidden');
                let final_data = new meta_functions().sumbit_button_function_v2(editor_div[1], bottombars, flairs2_button, title_bar);
                final_data = JSON.stringify(final_data);
                if (final_data) {
                    new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + Main_Circle + '/create_post', 'POST', final_data).then(function (data) {
                        let notice = new floating_notifications().bottom_bar_notification("Added Post Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                        $('body').append(notice);
                        // Refresh the page
                        window.location.href = window.location.origin + "/post/" + data["post_id"] + "?circle_name=" + Main_Circle;
                        // location.reload();
                        // new post_calls().editor_refresh();
                    }).catch(function (error) {
                        let notice = new floating_notifications().bottom_bar_notification("Error Adding Post! <br/> please make sure you have some text in both description and title", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                        $('body').append(notice);
                        $(submit_button).removeClass('hidden');
                    });

                };
            });
        });
        $(forms_addon[2]).click(function () {
            function finalizing_data(the_wrapper_div) {
                let thefinal_data = {};
                thefinal_data["title"] = $(the_wrapper_div).find('[data-form_type="description"]').val();
                // Get all data from the options.
                let options = [];
                let options_divs = $(the_wrapper_div).find('[data-form_type="option"]');
                let options_divs_len = options_divs.length;
                for (let i = 0; i < options_divs_len; i++) {
                    options.push($(options_divs[i]).val());
                }
                thefinal_data["options"] = options;
                return thefinal_data;
            }
            $(forms_addon[2]).addClass('hidden');
            let fd = finalizing_data(forms_addon[1])
            console.log(fd)
            let survey_url = "/api/v1/circle/" + Main_Circle + "/create_survey";
            let c1 = new APICALLS().GenericAPIJSON_CALL(survey_url, 'POST', JSON.stringify(fd)).then(function (data) {

                let notice = new floating_notifications().bottom_bar_notification("Added Survey Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                $('body').append(notice);
                // Refresh the page
                location.reload();
            }).catch(function (error) {
                let notice = new floating_notifications().bottom_bar_notification("Error Adding Survey! <br/> please make sure you have some text in both description and title", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(notice);
                $(forms_addon[2]).removeClass('hidden');
            })
        }
        );
    }


    follow_unfollow_toggle(follow_spanner, post_id) {
        let Get_Url = '/api/v1/circle/' + Main_Circle + '/follow_unfollow_post' + '?post_id=' + post_id;
        new APICALLS().GenericAPICall(Get_Url, 'GET', {}).then(function (data) {
            if ($(follow_spanner).attr('follow_status') == "No") {
                // If they are not following, follow_status will be No. Then we will change it to Yes and change the text to Unfollow.
                $(follow_spanner).text(word_finder("Unfollow") + ' -')
                $(follow_spanner).attr('follow_status', "Yes");
                $(follow_spanner).addClass('text-red-500 hover:text-red-600');
                $(follow_spanner).removeClass('text-blue-500 hover:text-blue-600');
            }
            else if ($(follow_spanner).attr('follow_status') == "Yes") {
                // If they are following, follow_status will be Yes. Then we will change it to No and change the text to Follow.
                $(follow_spanner).text(word_finder("Follow") + ' +')
                $(follow_spanner).attr('follow_status', "No");
                $(follow_spanner).addClass('text-blue-500 hover:text-blue-600');
                $(follow_spanner).removeClass('text-red-500 hover:text-red-600');
            }
        });
    }
    go_to_post(post_id) {
        let a_element = document.createElement('a');
        let Get_Url = "/post/" + post_id + "?circle_name=" + Main_Circle;
        a_element.href = Get_Url;
        return a_element
    }

    get_posts(filter, skip) {
        new APICALLS().GenericAPICall('/api/v1/circle/' + Main_Circle + '/get_posts' + '?posts=' + skip + '&filter=nothing', 'GET', {}).then(function (data) {
            let cards_array = data["Posts"];
            for (let i = 0; i < cards_array.length; i++) {
                let post_card = new MainFeed().home_post_feed_card(cards_array[i]);
                $('#feed_starts_here').append(post_card[0]);
                $(post_card[2]).click(function (e) {
                    new post_calls().follow_unfollow_toggle(post_card[2], data["Posts"][i]["PostId"]);
                });
                let a_element = new post_calls().go_to_post(data["Posts"][i]["sid"]);
                $(post_card[3]).wrap(a_element);
                $(post_card[4]).wrap(a_element);
            }

        });
    }

    async filter_refresh_posts(get_posts_data_NOW, empy_out = false) {
        let refresh_screen = new home_script_meta_function_calls().full_div_loading_screen();
        if (empy_out) {
            $('#feed_starts_here').empty();
            $('#feed_starts_here').append(refresh_screen);
        }



        Main_Circle = $('#Main_Circle_In_Focus').find(":selected").text();
        get_posts_data_NOW["current_active_feed_filter"] = current_main_filter;
        if (get_posts_data_NOW["noofposts"] == "0") {
            let floating_notif = new floating_notifications().bottom_bar_notification("Loading Posts...", '  bg-black p-2 text-yellow-300 text-sm font-bold rounded', 1000)
            $('body').append(floating_notif);
        }
        // If a change in Main_Circle is detected, then we will abort the previous request.
        let awaited_data = await new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + Main_Circle + '/get_posts_multi_filter', 'POST', JSON.stringify(get_posts_data_NOW)).then(function (data) {
            // let awaited_data = await new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + Main_Circle + '/get_posts_multi_filter', 'POST', JSON.stringify(get_posts_data_NOW)).then(function (data) {
            // new APICALLS().GenericAPICall('/api/v1/circle/'+Main_Circle+'/get_posts'+'?posts='+post_counter+'&filter=nothing','GET',{}).then(function(data){

            $('#Main_Circle_In_Focus').attr('disabled', false);
            $('#Main_Circle_In_Focus_mobile').attr('disabled', false);
            if (empy_out) {
                $('#feed_starts_here').empty();
            }
            if (get_posts_data_NOW["noofposts"] == "0") {
                let floating_notif = new floating_notifications().bottom_bar_notification("Loaded successfully", ' bg-black p-2 text-green-500 text-sm font-bold rounded', 2500)
                $('body').append(floating_notif);
            }
            let cards_array = data["Posts"];
            let counter = 0;
            for (let i = 0; i < cards_array.length; i++) {
                counter = counter + 1;
                console.log(counter)
                console.log(cards_array[i])
                let post_card = new MainFeed().home_post_feed_card(cards_array[i]);
                $('#feed_starts_here').append(post_card[0]);
                $(post_card[2]).click(function (e) {
                    new post_calls().follow_unfollow_toggle(post_card[2], data["Posts"][i]["PostId"]);
                });
                let a_element = new post_calls().go_to_post(data["Posts"][i]["sid"]);
                $(post_card[3]).wrap(a_element);
                $(post_card[4]).wrap(a_element);
                // Clicking on name should show description. Use feedcard profile card meta functions.
                $(post_card[1]).click(function (e) {
                    let r1 = new feedcard_meta_functions_helper().complete_profile_description($(post_card[1]).attr('data-userID')).then(function (data) {
                        $(post_card[1]).append(data);
                    });
                });

            }

        }).catch(function (error) {
            $('#Main_Circle_In_Focus').attr('disabled', false);
            $('#Main_Circle_In_Focus_mobile').attr('disabled', false);
            let floating_notif = new floating_notifications().bottom_bar_notification("Error Loading Posts!", 'animate-pulse bg-black p-2 text-red-500 text-sm font-bold rounded', 2500)
            $('body').append(floating_notif);
            let no_new_posts_available = new home_script_meta_function_calls().no_new_posts_available();
            $(refresh_screen).remove();
            $('#feed_starts_here').append(no_new_posts_available);
            return false;
        });

        return awaited_data;
    }

}

class home_script_meta_function_calls {
    copy_invitation_link() {
        let circle_name = $('#Main_Circle_In_Focus').find(":selected").text();
        // Copy the link to clipboard.
        navigator.clipboard.writeText(window.location.origin + "/gboard/joining_page?circle_name=" + circle_name);
        let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Copied to clipboard!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
        $('body').append(floatin_notif);
    }
    full_div_loading_screen() {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('w-full h-full flex flex-col');
        let dummy_cards_len = 10;
        for (let i = 0; i < dummy_cards_len; i++) {
            let dummy_card = new MainFeed().generic_feed_loading_card();
            $(wrapper_div).append(dummy_card);
        }
        return wrapper_div;
    }
    no_new_posts_available() {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('w-full flex flex-col text-white font-bold text-center justify-center items-center pt-10 w-full dark:text-black');
        $(wrapper_div).text("No new posts available in the selected circle");
        return wrapper_div;
    }

    find_all_the_active_flairs() {
        let active_flairs = [];
        $('#Filter_Box').find('span').each(function () {
            if ($(this).attr('data-Selected_Filter') == 'Yes') {
                active_flairs.push($(this).text());
            }
        });
        return active_flairs;
    }
}


