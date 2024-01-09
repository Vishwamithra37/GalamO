// $(document).ready(function () {
//     var contextMenu = $('<div>').addClass('context-menu hidden absolute w-64 border border-gray-700 text-white bg-black hover:border-blue-200 border z-10 p-2 rounded-lg shadow-lg');
//     var downloadLink = $('<div>').addClass('context-menu-option download-link p-2 cursor-pointer text-white hover:bg-gray-500 rounded-full').text('Download Image');
//     var newTabLink = $('<div>').addClass('context-menu-option new-tab-link p-2 cursor-pointer text-white hover:bg-gray-500 rounded-full').text('Open in new tab');
//     var copyBtn = $('<div>').addClass('context-menu-option copy-btn p-2 cursor-pointer text-white hover:bg-gray-500 rounded-full').text('Copy Text');
//     contextMenu.append(downloadLink, newTabLink, copyBtn);
//     $('body').append(contextMenu);

//     $(document).on('contextmenu', function (e) {
//         e.preventDefault();

//         var target = $(e.target);
//         $('.context-menu').hide();
//         $('.context-menu-option').hide();

//         if (target.is('img')) {
//             $('.download-link').off('click').on('click', function () {
//                 var link = document.createElement('a');
//                 link.href = target.attr('src');
//                 link.download = 'Download.jpg';
//                 link.click();
//             });
//             $('.download-link').show();
//         } else if (target.is('a')) {
//             $('.new-tab-link').off('click').on('click', function () {
//                 window.open(target.attr('href'), '_blank');
//             });
//             $('.new-tab-link').show();
//         } else {
//             $('.copy-btn').off('click').on('click', function () {
//                 navigator.clipboard.writeText(target.text());
//             });
//             $('.copy-btn').show();
//         }

//         $('.context-menu').css({
//             display: 'block',
//             left: e.pageX,
//             top: e.pageY
//         });
//     });

//     $(document).on('click touchstart', function (e) {
//         if ($(e.target).closest('.context-menu').length === 0) {
//             $('.context-menu').hide();
//         }
//     });
//     $(window).on('scroll', function () {
//         $('.context-menu').hide();
//     });
// });
// Check if the cookie exists, if it does, set the theme accordingly.
let cookie_value;
try {

    cookie_value = document.cookie
        .split('; ')
        .find(row => row.startsWith('data_current_theme'))
        .split('=')[1];
} catch (error) {
    cookie_value = "light";
}

let top_nav_bar_script_favored_language = document.cookie.split(';').find(
    cookie => cookie.trim().startsWith('favoured_language='));
if (top_nav_bar_script_favored_language) {
    top_nav_bar_script_favored_language = top_nav_bar_script_favored_language.split('=')[1];
} else {
    top_nav_bar_script_favored_language = "english";
}



//
// alert(cookie_value);
if (cookie_value == "light" && !$('html').hasClass('dark')) {
    toggle_theme();
}
if (cookie_value == "dark" && $('html').hasClass('dark')) {
    toggle_theme();
}
function toggle_theme() {
    $('html').toggleClass('dark');
    let current_theme;
    if ($('html').hasClass('dark')) {
        $('.switch_theme').text('🌙');
        if (top_nav_bar_script_favored_language == "telugu") {
            $('#switch_theme').text('🌙 చీకటి లోకి మార్చండి')
        } else {
            $('#switch_theme').text('🌙 switch to dark');
        }

        $('#switch_theme, .switch_theme').attr('data-current_mode', 'light');
        current_theme = 'light';
    }
    else {
        $('.switch_theme').text('🌞');
        if (top_nav_bar_script_favored_language == "telugu") {
            $('#switch_theme').text('🌞 ప్రకాశంలోకి మార్చండి')
        } else {
            $('#switch_theme').text('🌞 switch to light');
        }
        $('#switch_theme, .switch_theme').attr('data-current_mode', 'dark');
        current_theme = 'dark';
    }
    // Store in cookie the data_current_theme. Permanent cookie.
    document.cookie = "data_current_theme=" + current_theme + ";path=/" + "; expires=Fri, 31 Dec 9999 23:59:59 GMT;";
}


$(document).ready(function () {
    try {

        if (isAnonymous) {
            document.getElementById('Top_Logo_Bar_Section_anonymous').classList.remove('hidden');
            document.getElementById('Top_Logo_Bar_Section').classList.add('hidden');
        }
    } catch (error) {

    }
    // document.addEventListener('contextmenu', event => event.preventDefault());


    $('#profile_Button').click(function () {
        $('#profile_wrapper').addClass('');
        $('#profile_Dropdown').removeClass('hidden');
    });
    $('#profile_Button_mobile').click(function () {

        $('#profile_wrapper_mobile').addClass('');
        $('#profile_Dropdown_mobile').removeClass('hidden');
    });
    // On moving the mouse out of the profile dropdown, hide it after 1 second
    $('#profile_wrapper').mouseleave(function (e) {
        setTimeout(function () {
            $('#profile_Dropdown').addClass('hidden');
            $('#profile_wrapper').removeClass('');
        }, 500);
    });
    $('#logout_Button').click(function (e) {
        e.preventDefault();
        // alert('Logging out');
        let test1 = new floating_notifications_orginal().custom_bg_security_popup(
            "Are you sure you want to logout?",
            ['Yes, Log me out', 'Cancel'],
            'bg-red-600 text-white font-bold p-2 rounded-lg hover:bg-red-700',
            'bg-gray-700 text-white font-bold p-2 rounded-lg hover:bg-gray-800'
        )
        $('body').append(test1[0]);
        $(test1[1]).click(function () {
            new APICALLS().GenericAPICall('/api/v1/user/logout', 'GET', null).then(async function (response) {
                // set favoured language cookie to english.
                document.cookie = "favoured_language=english;path=/" + "; expires=Fri, 31 Dec 9999 23:59:59 GMT;";
                window.location = '/login2';
            });
        });
        $(test1[2]).click(function () {
            $(test1[0]).remove();
        }
        );
    });

    $('#profile_wrapper_mobile').mouseleave(function (e) {
        setTimeout(function () {
            $('#profile_Dropdown_mobile').addClass('hidden');
            $('#profile_wrapper_mobile').removeClass('');
        }, 500);
    });

    $('#switch_theme, .switch_theme').click(function (e) {
        toggle_theme();
    });
    var notification_wrapper2;
    var noofnotifications = 0;

    let notification_url = '/api/v1/user/notifications';
    notification_url = notification_url + '?skip=' + noofnotifications;
    var feed_loader_counter_for_notifications = 1;
    let error_card = {
        "message": "No notifications",
        "Error": "Yes"
    }
    new APICALLS().GenericAPICall(notification_url, 'GET', null).then(function (response) {
        let error_card = {
            "message": "No notifications",
            "Error": "Yes"
        }
        let notification_card_maker = new notification_card_maker_for_top_nav_bar();
        notification_wrapper2 = notification_card_maker.notification_wrapper(response["Notifications"]);
        $('#Notifications_go_her').append(notification_wrapper2[0]);
        //  On clicking or touchstart outside the notification wrapper, hide it
        $(document).click(function (e) {
            if (!$(e.target).closest('#notification_wrapper').length) {
                $(notification_wrapper2[0]).addClass('hidden');
            }
        });

        feed_loader_counter_for_notifications = 0;
        let feeder_div = $(notification_wrapper2[0])
        $(feeder_div).scroll(function (e) {
            let scroll_percentage = new notification_card_maker_for_top_nav_bar().calculateScrollPercentage(feeder_div);
            if (scroll_percentage > 80 && feed_loader_counter_for_notifications == 0) {
                noofnotifications = noofnotifications + 10;
                let notification_url2 = '/api/v1/user/notifications';
                notification_url2 = notification_url2 + '?skip=' + noofnotifications;
                function testing_infinite_scroll_notifs() {
                    feed_loader_counter_for_notifications = 1;
                    new APICALLS().GenericAPICall(notification_url2, 'GET', null).then(function (response) {
                        let notification_card_maker = new notification_card_maker_for_top_nav_bar();
                        for (let i = 0; i < response["Notifications"].length; i++) {
                            $(feeder_div).append(notification_card_maker.each_notification_card(response["Notifications"][i]));
                        }
                        // Push error card at the end of the notification list
                        feed_loader_counter_for_notifications = 0;
                    }
                    ).catch(function (error) {
                        let Final_error_card = $(feeder_div).append(notification_card_maker.each_notification_card(error_card));
                        $(feeder_div).append(Final_error_card);
                        feed_loader_counter_for_notifications = 1;
                    });
                } // End of function testing_infinite_scroll_notifs
                testing_infinite_scroll_notifs();
            } // End of if scroll_percentage>80
        }); // End of scroll function
    }
    ).catch(function (error) {
        let error_card = {
            "message": "No notifications",
            "Error": "Yes"
        }
        let notification_card_maker = new notification_card_maker_for_top_nav_bar();
        notification_wrapper2 = notification_card_maker.notification_wrapper([error_card]);
        $('#Notifications_go_her').append(notification_wrapper2[0]);
        $(document).click(function (e) {
            if (!$(e.target).closest('#notification_wrapper').length) {
                $(notification_wrapper2[0]).addClass('hidden');
            }
        });


        feed_loader_counter_for_notifications = 1;
    });
    // End of try try catch block which is responsible for loading notifications.

    $('#notification_wrapper').click(function () {
        $(notification_wrapper2[0]).removeClass('hidden');
    });

    function slideInLeftRight(leftDiv, rightDiv, sensitivity) {
        const SWIPE_SENSITIVITY = sensitivity || 50;
        const HIDDEN_CLASS = 'hidden';
        let isSwiping = false;
        let touchStartX = 0;
        let activeColumn = null;

        function handleTouchStart(e) {
            isSwiping = true;
            touchStartX = e.touches[0].clientX;
        }

        function handleTouchMove(e) {
            if (!isSwiping) {
                return;
            }

            const touchCurrentX = e.touches[0].clientX;
            const touchDiff = touchCurrentX - touchStartX;

            if (touchDiff > SWIPE_SENSITIVITY && activeColumn !== 'left') {
                $(leftDiv).removeClass(HIDDEN_CLASS);
                $(rightDiv).addClass(HIDDEN_CLASS);
                activeColumn = 'left';
            } else if (touchDiff < -SWIPE_SENSITIVITY && activeColumn !== 'right') {
                if (activeColumn === 'left') {
                    $(leftDiv).addClass(HIDDEN_CLASS);
                }
                $(rightDiv).removeClass(HIDDEN_CLASS).css('right', 0);
                activeColumn = 'right';
            }
        }

        function handleTouchEnd() {
            isSwiping = false;
        }

        $(document).on('touchstart', handleTouchStart);
        $(document).on('touchmove', handleTouchMove);
        $(document).on('touchend', handleTouchEnd);

        // Use jQuery to add and remove classes
        $(leftDiv).addClass('fixed').addClass(HIDDEN_CLASS);
        $(rightDiv).addClass('fixed').addClass(HIDDEN_CLASS).css('right', '-100%');
    }

    let searchbar = $('.SearchBar');

    // On typing 2 charecters send out a json.
    searchbar.on('input', function () {
        // Choose the selected circle.
        Main_selected = $('#Main_Circle_In_Focus').find(':selected').val();
        let data_to_send = {
            "noofposts": "0",
            "filter": "POST",
            "search_string": searchbar.val()
        }
        data_to_send = JSON.stringify(data_to_send);
        if (searchbar.val().length > 2) {
            new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + Main_selected + '/search_engine', 'POST', data_to_send).then(function (response) {
                console.log(response);
                let search_bar_card_maker = new search_bar_card();
                let wrapper_card = search_bar_card_maker.card_holder_wrapper();
                let len_of_number_of_suggestions = response["Posts"].length;
                for (let i = 0; i < len_of_number_of_suggestions; i++) {
                    response["Posts"][i]["link"] = '/post/' + response["Posts"][i]["sid"] + '?circle_name=' + Main_selected;
                    let card = search_bar_card_maker.search_bar_card_maker(response["Posts"][i]);
                    $(wrapper_card).append(card);
                }
                $('.SearchBarHolder').empty();
                $('.SearchBarHolder').append(wrapper_card);
            });
        }
        if (searchbar.val().length == 0) {
            $('.SearchBarHolder').empty();
        }
    });

    let dummy_notification = {
        "title": "New notification",
        "body": "This is a new notification",
        "icon": "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
        "url": "https://www.google.com"
    }
    // if (Notification.permission == "granted") {
    //     new simple_browser_push_notifications().new_notification(
    //         dummy_notification["title"],
    //         dummy_notification["body"],
    //         dummy_notification["icon"],
    //         dummy_notification["url"]
    //     );
    // }
    // new simple_browser_push_notifications().request_permission().then(function (result) {
    //     if (result == "granted") {
    //         new simple_browser_push_notifications().new_notification(
    //             dummy_notification["title"],
    //             dummy_notification["body"],
    //             dummy_notification["icon"],
    //             dummy_notification["url"]
    //         );
    //     }
    // });
    $(document).on('click touchstart', function (event) {
        if (!$(event.target).closest('#mobile_searcher').length && !$(event.target).closest('.SearchBarHolder').length && !$(event.target).is('#mobile_searchbar')) {
            var $mobileSearchbar = $('#mobile_searchbar');
            if (!$mobileSearchbar.hasClass('hidden')) {
                $mobileSearchbar.addClass('hidden');
            }
        }
    });

    // Close the profile dropdown if it is open on touching or clicking or scrolling anywhere on the screen.





}); // End of document.ready


class search_bar_card {
    card_holder_wrapper() {
        let wrapper_card = document.createElement('div');
        $(wrapper_card).addClass('relative flex flex-col h-96 rounded-b-lg bg-black overflow-y-auto mt-12 border-gray-600 border-2 pt-2');
        // On clicking outside the notification wrapper, remove wrapper.

        $(document).on('click touchstart', function (e) {
            // If the targer is not in the .SearchBarHolder, remove the wrapper.
            if (!$(e.target).closest('.SearchBarHolder').length) {
                $('.SearchBarHolder').empty();
                // if ($('#mobile_searchbar').hasClass('hidden') == false) {
                //     $('#mobile_searchbar').addClass('hidden');
                // }
            }

        });


        return wrapper_card;
    }
    search_bar_card_maker(details) {
        let carwrapper = document.createElement('div');
        let link_wrapper = document.createElement('a');
        $(carwrapper).addClass('bg-gray-900 mb-2 p-2 pb-1 border-blue-500 border-r-4 hover:border-blue-700 hover:shadow-lg')
        $(carwrapper).attr('title', details["flair_tags"])


        $(link_wrapper).attr('href', details['link']);
        $(link_wrapper).addClass('flex flex-col border-gray-900 hover:border-opacity-50 hover:shadow-lg rounded-lg');
        let layer_1_wrapper = document.createElement('div');
        let layer_2_wrapper = document.createElement('div');
        let layer_3_wrapper = document.createElement('div');

        $(layer_1_wrapper).addClass('flex flex-row mb-1');
        $(layer_3_wrapper).addClass('flex flex-row mt-1  text-blue-500 hover:text-blue-400 font-semibold');

        let name_addon = new navigation_bar_meta_functions_top_bar().GenericSpan_Addon('text-xs text-yellow-500', details["CreatorName"])
        let time_difference_addon = new navigation_bar_meta_functions_top_bar().GenericSpan_Addon('text-xs text-yellow-500 ml-auto float-right', details["time_difference"])

        let number_of_comments_addon;
        if (parseInt(details['numberofcomments']) > 0) {
            number_of_comments_addon = new navigation_bar_meta_functions_top_bar().GenericSpan_Addon('text-xs text-white ml-1', '💬 ' + details['numberofcomments']);
            $(number_of_comments_addon).attr('title', 'Number of comments on this post')
        }
        let symbol_addon = new navigation_bar_meta_functions_top_bar().GenericSpan_Addon('text-xs ml-1 text-yellow-500', details['Creator_Symbol']);
        $(symbol_addon).attr('title', details['Creator_Role']);



        $(layer_1_wrapper).append(name_addon);
        $(layer_1_wrapper).append(symbol_addon);
        $(layer_1_wrapper).append(number_of_comments_addon);

        $(layer_1_wrapper).append(time_difference_addon);

        $(layer_2_wrapper).text(details['title']);
        $(layer_2_wrapper).addClass('text-white font-semibold text-base overflow-y-auto max-h-16');

        let flars_length = details["flair_tags"].length;
        for (let i = 0; i < flars_length; i++) {
            let flair_addon = new navigation_bar_meta_functions_top_bar().Generic_div('text-xs bg-black p-1', details["flair_tags"][i])
            $(layer_3_wrapper).append(flair_addon);
        }

        $(carwrapper).append(link_wrapper);

        $(link_wrapper).append(layer_1_wrapper);
        $(link_wrapper).append(layer_2_wrapper);
        $(link_wrapper).append(layer_3_wrapper);



        return carwrapper;
    }
}

class notification_card_maker_for_top_nav_bar {
    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }
    notification_wrapper(notiffication_list, total_count) {
        var notification_count_div = $('#notification_count');
        var notification_image = $('#notification_image');
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('bg-black  border-2 border-gray-800 rounded-lg p-2 flex flex-col relative right-32 w-full md:w-96 hidden h-96 overflow-y-auto dark:bg-white dark:text-black dark:shadow-lg')

        let notification_header = document.createElement('div');
        $(notification_header).addClass('flex flex-row')

        let notification_header_text = document.createElement('p');
        $(notification_header_text).text('Notifications')
        $(notification_header_text).addClass('text-white font-bold mt-2 dark:text-black')
        $(notification_header).append(notification_header_text);

        let right_wrapper = document.createElement('div');
        $(right_wrapper).addClass('flex flex-row justify-end ml-auto float-right')

        let notification_read_all_button = document.createElement('button');
        $(notification_read_all_button).addClass('whitespace-nowrap ml-8 bg-gray-900 text-white rounded-lg p-1 text-sm hover:bg-gray-800 mr-2 mt-1 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-lg dark:rounded-lg dark:border-black dark:border-2 dark:border-opacity-50')
        $(notification_read_all_button).text('👁 Mark as read')
        $(right_wrapper).append(notification_read_all_button);

        let notification_header_close_button = document.createElement('button');
        $(notification_header_close_button).addClass('bg-gray-900 text-white rounded-lg p-1 hover:bg-gray-800 mt-1 dark:text-black dark:bg-white dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-lg dark:rounded-lg dark:border-black dark:border-2 dark:border-opacity-50')
        $(notification_header_close_button).text('X')
        // $(right_wrapper).append(notification_header_close_button);

        $(notification_header).append(right_wrapper);

        $(wrapper_div).append(notification_header);
        for (let i = 0; i < notiffication_list.length; i++) {
            $(wrapper_div).append(this.each_notification_card(notiffication_list[i]));
        }

        $(notification_read_all_button).click(function () {
            let fil = {
                "notification_id": "all",
                "notification_all": "Yes",
                "circle": "all"
            }
            let url = '/api/v1/user/read_notification';
            new APICALLS().GenericAPIJSON_CALL(url, 'POST', JSON.stringify(fil)).then(function (response) {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("All comments are marked as read", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);

                //  Remove font-bold border-l-4 border-gray-500 from all notification cards.
                $(wrapper_div).find('[data-seen="No"]').each(function () {
                    $(this).removeClass('font-bold border-l-4 border-gray-500')
                    $(this).attr('data-seen', 'Yes')
                });
                $(wrapper_div).removeClass('hidden');
            });
            $(notification_count_div).addClass('hidden');
            $(notification_count_div).text('0');

        });

        $(wrapper_div).find('[data-seen="No"]').each(function () {
            $(notification_count_div).text(parseInt($(notification_count_div).text()) + 1);
        });
        if ($(notification_count_div).text() != "0") {
            // alert($(notification_count_div).text())
            $(notification_count_div).removeClass('hidden');
        }

        return [wrapper_div, notification_header_close_button, notification_read_all_button];
    }
    each_notification_card(notification) {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('bg-gray-900 cursor-pointer text-white p-2 mt-2 hover:bg-gray-800 border border-gray-800 dark:bg-white dark:text-black dark:shadow-lg dark:rounded-lg dark:border-black dark:border-2 dark:border-opacity-50')
        let notification_text = document.createElement('p');
        console.log(notification)
        if (notification["Error"] == "Yes") {

            $(notification_text).text(notification["message"])
            $(notification_text).addClass('border border-gray-500 p-2 text-center text-gray-500 font-bold ')
            $(wrapper_div).append(notification_text);
            return wrapper_div;
        }

        $(notification_text).text(notification["description"])
        $(wrapper_div).append(notification_text);

        let timestamp = document.createElement('p');
        $(timestamp).text(notification["time_difference"])
        $(timestamp).addClass('text-gray-500 text-xs')
        $(wrapper_div).append(timestamp);

        if (notification["seen"] == "No") {
            $(wrapper_div).addClass('font-bold border-l-4 border-gray-500')
            $(wrapper_div).attr('data-seen', 'No')
        }

        $(wrapper_div).click(function () {
            let url = '/api/v1/user/read_notification'
            let fil = {
                "notification_id": notification["sid"],
                "notification_all": "No",
                "circle": notification["circle"]
            }
            new APICALLS().GenericAPIJSON_CALL(url, 'POST', JSON.stringify(fil)).then(function (response) {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Redirecting..", ' animate-pulse  bg-black p-2 text-yellow-300 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
                //  Remove font-bold border-l-4 border-gray-500 from all notification cards.
                $(wrapper_div).removeClass('font-bold border-l-4 border-gray-500')
                window.location = notification["url"]
            });
        });

        return wrapper_div;
    }
}

class simple_browser_push_notifications {
    async request_permission() {
        let r1 = await Notification.requestPermission().then(function (result) {
            console.log(result);
            return result;
        });
        return r1;
    }
    new_notification(title, body, icon, url) {
        let new_note = new Notification(title, {
            body: body,
            icon: icon,
            url: url
        });
        new_note.onclick = function () {
            window.open(url);
        }
    }

}

class navigation_bar_meta_functions_top_bar {
    GenericSpan_Addon(classer, name, font_family) {
        let wrapperdiv = document.createElement('span');
        $(wrapperdiv).addClass(classer);
        $(wrapperdiv).text(name);
        if (font_family != undefined) {
            $(wrapperdiv).attr('style', 'font-family: ' + font_family + ';');
        }
        return wrapperdiv;
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

}