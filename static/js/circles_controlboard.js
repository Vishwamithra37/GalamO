var current_number_of_circles_for_joining = 0;
// var skip_number_of_my_circles = 0;
var scroll_safety = {
    "MyCircles": {
        "scroll_safety": 1,
        "feed_loader_counter": 0,
    }
}
$(document).ready(function () {
    new general_circle_control_tools_meta_funcitons().stuff_to_hide_when_scrolling_down_and_show_when_scrolling_up('#Bottom_Logo_Bar_Section');
    $('#create_circle').click(function (e) {
        e.preventDefault();
        // Clean content_board.
        $('#content_board').empty();
        // Create card.
        let card = new CardMakers().circle_creation_card();
        $('#content_board').append(card);
    });
    let divers = ["#Manage_circle", "#join_circle", "#create_circle"]
    new join_circle_tools().meta_function_to_change_colors(divers, "text-white dark:text-black", "text-yellow-500");
    $('#Manage_circle').click(function (e) {
        e.preventDefault();
        // Clean content_board.
        $('#content_board').empty();
        scroll_safety["MyCircles"]["scroll_safety"] = 1;
        scroll_safety["MyCircles"]["feed_loader_counter"] = 0;
        // Clean option board.
        $('#Circle_Creation_Options').empty();
        let g1 = new CardMakers().circle_home_all_cards().then((data) => {
            $('#content_board').append(data);
        });
        new general_circle_control_tools_meta_funcitons().scroll_load_binder(
            '#content_board',
            'MyCircles',
            'my_circles'
        )

    });

    // $('#Manage_circle').click();

    $('#join_circle').click(function (e) {
        e.preventDefault();
        // Unbind scroll load.
        $('#content_board').unbind('scroll');

        // Clean content_board.
        $('#content_board').empty();
        let searcch_div = new join_circle_tools().join_circle_click_action();
        $('#content_board').append(searcch_div);
    });


    $('#join_circle').click();
});

class CardMakers {
    circle_creation_card() {
        let wrapperdiv = document.createElement("div");
        wrapperdiv.setAttribute("class", "w-full p-2");
        let form1 = new forms().circle_creation_form();
        wrapperdiv.appendChild(form1);
        return wrapperdiv;
    }
    async circle_options_card(url, the_element, comma_ON) {
        let option_array = []
        let tags = await new APICALLS().GenericAPICall(url, "GET", null).then((data) => {

            for (let i = 0; i < data["circle_tags"].length; i++) {
                let span_option = document.createElement("span");
                span_option.setAttribute("class", "font-semibold text-base text-white bg-gray-600 hover:bg-gray-700 cursor-pointer p-1 rounded-md mt-1 h-8 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-md");
                span_option.innerHTML = data["circle_tags"][i]
                $(span_option).click(function (e) {
                    // Transfer the value to the input field of the_element.
                    e.preventDefault();
                    if (comma_ON == "ON") {
                        // Replace the last value after the last comma.
                        let last_comma_index = $(the_element).val().lastIndexOf(",");
                        let new_value = $(the_element).val().substring(0, last_comma_index + 1);
                        $(the_element).val(new_value + span_option.innerText + ",");
                    } else {
                        $(the_element).val($(the_element).val() + span_option.innerText);
                    }
                    // Remove the card.
                    span_option.remove();
                });
                option_array.push(span_option);
            }
        });
        return option_array
    }

    async circle_home_all_cards() {
        let wrapperdiv = document.createElement("div");
        wrapperdiv.setAttribute("class", "w-full flex flex-wrap p-2");
        let circle_details_array = [];
        let url = "/api/v1/circle/get_circles" + "?skip=" + scroll_safety["MyCircles"]["feed_loader_counter"];
        let re1 = await new APICALLS().GenericAPICall(url, "GET", null).then((circle_details) => {
            circle_details = circle_details["Circle_Details"]
            // console.log(circle_details);
            for (let i = 0; i < circle_details.length; i++) {
                let card = new CardMakers().circle_home_card(circle_details[i]);
                wrapperdiv.appendChild(card);
            }
            scroll_safety["MyCircles"]["scroll_safety"] = 1;
            scroll_safety["MyCircles"]["feed_loader_counter"] = scroll_safety["MyCircles"]["feed_loader_counter"] + 20;
        });
        return wrapperdiv;
    }

    circle_home_card(circle_details) {
        let wrapperdiv = document.createElement("div");
        wrapperdiv.setAttribute("class", "relative p-2 flex flex-col hover:shadow-md rounded-md bg-gray-900 mr-2 w-full md:mr-0  ml-2 mb-2  md:w-60 h-72 justify-between hover:border border-gray-600 hover:bg-black dark:bg-white dark:text-black dark:shadow-lg dark:hover:shadow-2xl dark:hover:text-black");
        let circle_image = document.createElement("img");
        circle_image.setAttribute("class", "z-10 w-full h-32 object-cover rounded-t-md w-full cursor-pointer ");
        circle_image.setAttribute("src", circle_details["CircleImage"]);
        circle_image.setAttribute('loading', 'lazy')
        let circle_name = document.createElement("div");
        circle_name.setAttribute("class", " text-gray-200 font-bold text-xl cursor-pointer truncate hover:text-clip h-8 hover:h-auto overflow-x-auto dark:bg-white dark:text-black");
        circle_name.innerHTML = circle_details["DisplayName"];
        let circle_description = document.createElement("div");
        circle_description.setAttribute("class", " text-gray-200 text-sm cursor-pointer text-ellipsis h-12 hover:overflow-visible overflow-hidden hover:overflow-y-scroll dark:bg-white dark:text-black");
        circle_description.innerHTML = circle_details["Description"];
        let circle_tags = document.createElement("div");
        circle_tags.setAttribute("class", "flex flex-row overflow-x-auto flex-nowrap overflow-y-hidden");
        let card_copy_visit_div = document.createElement("div");
        card_copy_visit_div.setAttribute("class", "flex flex-row justify-between w-full z-20 absolute");
        let copy_clipboard = new CardMakers().fixed_link_to_join_circle(circle_details["DisplayName"]);
        let visit_anonymous_circle_card = new CardMakers().visit_anonymous_circle_card(circle_details["DisplayName"]);


        for (let i = 0; i < circle_details["Circle_Tags"].length; i++) {

            let circle_tag_span = document.createElement("span");
            circle_tag_span.setAttribute("class", "font-semibold text-sm text-white bg-gray-600 hover:bg-gray-700 p-1 rounded-md m-1 h-8  hover:overflow-visible hover:h-auto dark:bg-gray-200 dark:shadow-md dark:text-black");
            circle_tag_span.innerHTML = circle_details["Circle_Tags"][i];
            circle_tags.appendChild(circle_tag_span);

        }
        card_copy_visit_div.appendChild(copy_clipboard);
        card_copy_visit_div.appendChild(visit_anonymous_circle_card);
        wrapperdiv.appendChild(card_copy_visit_div);
        wrapperdiv.appendChild(circle_image);
        wrapperdiv.appendChild(circle_name);
        wrapperdiv.appendChild(circle_description);
        wrapperdiv.appendChild(circle_tags);

        if (circle_details["isAdmin"] == "Yes") {
            let admin_card = new CardMakers().im_the_admin_card();
            wrapperdiv.appendChild(admin_card);

        } else {
            let leave_circle_card = new CardMakers().leave_circle_card(circle_details["DisplayName"]);
            wrapperdiv.appendChild(leave_circle_card);
        }

        //  On clicking on circle image or name or description, go to the circle page. And not the whole wrapper div.
        $(wrapperdiv).click(function (e) {
            e.preventDefault();
            if (e.target == circle_image || e.target == circle_name || e.target == circle_description) {
                window.location.href = "/circles/" + circle_details["DisplayName"];
            }
        });



        $(circle_tags).click(function (e) {
            e.preventDefault();
        });
        return wrapperdiv;
    }

    async leave_circle_api_call(circle_name) {
        let url = '/api/v1/circle/leave_circle/' + circle_name;
        let data = await new APICALLS().GenericAPIJSON_CALL(url, "POST", null).then((data) => {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Successfully left circle!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return data;
        }).catch((error) => {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Failed to leave circle!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            return error;
        });
        return data;
    }

    leave_circle_card(circle_name) {
        let wrapper_div = document.createElement("div");
        let leave_button = document.createElement("button");

        $(wrapper_div).addClass('w-full mt-4 bg-black border-2 border-dashed border-gray-500 text-gray-200 text-center rounded-md dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black');
        $(leave_button).addClass('text-xs p-2 text-gray-200 font-semibold outline-none hover:text-red-500 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-red-500');
        $(leave_button).text("Leave Circle");
        $(wrapper_div).append(leave_button);

        $(leave_button).click(function (e) {
            e.preventDefault();
            let floatin_notif = new floating_notifications_orginal().custom_bg_security_popup(
                "Are you sure you want to leave " + circle_name + "?",
                ['Yes, leave!', "No, don't leave"],
                'bg-red-500 text-white hover:bg-red-600 font-bold rounded',
                'bg-gray-700 text-white hover:bg-gray-800 font-bold rounded',
            )
            $('body').append(floatin_notif[0]);
            $(floatin_notif[1]).click(function (e) {
                e.preventDefault();
                let leaver = new CardMakers().leave_circle_api_call(circle_name).then((data) => {
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Successfully left circle!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                    $('#Manage_circle').click();
                });
                $(floatin_notif[0]).remove();
            });
            $(floatin_notif[2]).click(function (e) {
                e.preventDefault();
                $(floatin_notif[0]).remove();
            });
        });
        return wrapper_div;

    }
    fixed_link_to_join_circle(circle_name) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass('z-20 w-8 text-xs p-2 bg-gray-800 text-gray-200 text-center rounded-md hover:bg-gray-700 hover:text-white cursor-pointer dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-md');
        $(wrapper_div).text('🔗');
        $(wrapper_div).attr('title', 'Copy Invite to join circle')
        $(wrapper_div).click(function (e) {
            let current_domain = window.location.origin;
            let url = current_domain + "/api/v1/circle/join_circle" + "?CircleName=" + circle_name;
            navigator.clipboard.writeText(url);
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Successfully copied link to clipboard!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            // For 3 seconds change the bg color to green and a tick mark.
            $(wrapper_div).addClass('bg-green-500 text-white hover:bg-green-600 cursor-default');
            $(wrapper_div).text('✅');
            setTimeout(function () {
                $(wrapper_div).removeClass('bg-green-500 text-white hover:bg-green-600 cursor-default');
                $(wrapper_div).text('🔗');
            }, 3000);
        });
        return wrapper_div;
    }
    visit_anonymous_circle_card(circle_name) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass('z-20 w-8 text-xs p-2 mr-4 bg-gray-800 text-gray-200 text-center rounded-md hover:bg-gray-700 hover:text-white cursor-pointer dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-md');
        $(wrapper_div).text('👁');
        $(wrapper_div).attr('title', 'Visit without joining')
        $(wrapper_div).click(function (e) {
            let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Redirecting to circle anonymously...", ' animate-pulse  bg-black p-2 text-yellow-200 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            new APICALLS().GenericAPICall('/api/v1/user/logout', 'GET', null).then(function (response) {
                let current_domain = window.location.origin;
                let url = current_domain + "/home" + "?circle_name=" + circle_name;
                window.location.href = url;
                // For 3 seconds change the bg color to green and a tick mark.
                $(wrapper_div).addClass('bg-green-500 text-white hover:bg-green-600 cursor-default');
                $(wrapper_div).text('✅');
            }).catch(function (error) {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Failed to redirect to circle anonymously!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
            });

            setTimeout(function () {
                $(wrapper_div).removeClass('bg-green-500 text-white hover:bg-green-600 cursor-default');
                $(wrapper_div).text('👁');
            }, 1000);
        });
        return wrapper_div;
    }



    im_the_admin_card() {
        let wrapper_div = document.createElement("div");
        let admin_text = document.createElement("span");
        $(wrapper_div).addClass('w-full pb-2 pl-0 pr-0 pt-2 mt-4 bg-black border-2 border-dashed border-gray-500 text-gray-200 text-center rounded-md dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-md');
        $(admin_text).addClass('text-xs   p-2  font-semibold outline-none hover:text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black');
        $(admin_text).text("You are the admin of this circle");
        $(wrapper_div).append(admin_text);
        return wrapper_div;
    }

}
class forms {
    circle_creation_form() {
        let form = document.createElement("form");
        form.setAttribute("class", "w-full p-2 flex flex-col");
        form.setAttribute("id", "circle_creation_form");
        // Set form title.
        let label_array = []
        let input_array = []


        let circle_create_display_name = document.createElement("input");
        input_array.push(circle_create_display_name);
        let circle_create_description = document.createElement("input");
        input_array.push(circle_create_description);
        let circle_create_image_upload = document.createElement("input");
        input_array.push(circle_create_image_upload);
        let circle_create_related_tags = document.createElement("input");
        input_array.push(circle_create_related_tags);
        let circle_create_related_circles = document.createElement("input");
        input_array.push(circle_create_related_circles);

        for (let i = 0; i < input_array.length; i++) {
            input_array[i].setAttribute("class", "w-full p-2 border border-gray-400 rounded text-gray-200 bg-gray-900 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-md dark:hover:text-black dark:hover:bg-gray-200 dark:hover:border-gray-200 dark:focus:border-gray-200 dark:focus:shadow-md dark:focus:text-black dark:focus:bg-gray-200 dark:focus:outline-none dark:outline-none");
        }

        let circle_create_display_name_label = document.createElement("label");
        label_array.push(circle_create_display_name_label);
        let circle_create_description_label = document.createElement("label");
        label_array.push(circle_create_description_label);
        let circle_create_image_upload_label = document.createElement("label");
        label_array.push(circle_create_image_upload_label);
        let circle_create_related_tags_label = document.createElement("label");
        label_array.push(circle_create_related_tags_label);
        let circle_create_related_circles_label = document.createElement("label");
        label_array.push(circle_create_related_circles_label);
        let circle_create_submit_label = document.createElement("label");
        // label_array.push(circle_create_submit_label);

        for (let i = 0; i < label_array.length; i++) {
            label_array[i].setAttribute("class", "w-full p-2 pl-0 text-gray-200 font-bold dark:bg-white dark:text-black");
        }
        circle_create_submit_label.setAttribute("class", "p-2  hover:text-green-500 cursor-pointer rounded-md text-gray-200 font-bold bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:hover:text-black dark:shadow-md dark:focus:border-gray-200 dark:focus:shadow-md dark:focus:text-black dark:focus:bg-gray-200 dark:focus:outline-none dark:outline-none");

        let circle_create_display_name_wrapper = document.createElement("div");
        let circle_create_description_wrapper = document.createElement("div");
        let circle_create_image_upload_wrapper = document.createElement("div");
        let circle_create_related_tags_wrapper = document.createElement("div");
        let circle_create_related_circles_wrapper = document.createElement("div");
        let circle_create_submit_wrapper = document.createElement("div");

        circle_create_display_name_label.setAttribute("for", "circle_create_display_name");
        circle_create_description_label.setAttribute("for", "circle_create_description");
        circle_create_image_upload_label.setAttribute("for", "circle_create_image_upload");
        circle_create_related_tags_label.setAttribute("for", "circle_create_related_tags");
        circle_create_related_circles_label.setAttribute("for", "circle_create_related_circles");
        circle_create_submit_label.setAttribute("for", "circle_create_submit");

        circle_create_display_name_label.innerHTML = "Display Name";
        circle_create_description_label.innerHTML = "Description";
        circle_create_image_upload_label.innerHTML = "Image Upload";
        circle_create_related_tags_label.innerHTML = "Related Tags";
        circle_create_related_circles_label.innerHTML = "Related Circles";
        circle_create_submit_label.innerHTML = "Create Circle";

        circle_create_display_name.setAttribute("type", "text");
        circle_create_description.setAttribute("type", "text");
        circle_create_image_upload.setAttribute("type", "file");
        circle_create_related_tags.setAttribute("type", "text");
        circle_create_related_circles.setAttribute("type", "text");


        circle_create_display_name.setAttribute("id", "circle_create_display_name");
        circle_create_description.setAttribute("id", "circle_create_description");
        circle_create_image_upload.setAttribute("id", "circle_create_image_upload");
        circle_create_related_tags.setAttribute("id", "circle_create_related_tags");
        circle_create_related_circles.setAttribute("id", "circle_create_related_circles");

        circle_create_display_name.setAttribute("name", "circle_create_display_name");
        circle_create_display_name.setAttribute("placeholder", "Display Name (This will be the name of the circle)");
        circle_create_display_name.setAttribute("required", "true");
        circle_create_description.setAttribute("name", "circle_create_description");
        circle_create_description.setAttribute("placeholder", "Description (This will be the description of the circle)");
        circle_create_description.setAttribute("required", "true");
        circle_create_image_upload.setAttribute("name", "circle_create_image_upload");
        circle_create_image_upload.setAttribute("placeholder", "Image Upload (This will be the image of the circle)");
        circle_create_related_tags.setAttribute("name", "circle_create_related_tags");
        circle_create_related_tags.setAttribute("placeholder", "Related Tags");
        circle_create_related_circles.setAttribute("name", "circle_create_related_circles");
        circle_create_related_circles.setAttribute("placeholder", "Related Circles");

        circle_create_display_name_wrapper.setAttribute("class", "w-full p-2");
        circle_create_description_wrapper.setAttribute("class", "w-full p-2");
        circle_create_image_upload_wrapper.setAttribute("class", "w-full p-2");
        circle_create_related_tags_wrapper.setAttribute("class", "w-full p-2");
        circle_create_related_circles_wrapper.setAttribute("class", "w-full p-2");
        circle_create_submit_wrapper.setAttribute("class", "flex justify-center mt-4");

        circle_create_display_name_wrapper.appendChild(circle_create_display_name_label);
        circle_create_description_wrapper.appendChild(circle_create_description_label);
        circle_create_image_upload_wrapper.appendChild(circle_create_image_upload_label);
        circle_create_related_tags_wrapper.appendChild(circle_create_related_tags_label);
        circle_create_related_circles_wrapper.appendChild(circle_create_related_circles_label);
        circle_create_submit_wrapper.appendChild(circle_create_submit_label);

        circle_create_display_name_wrapper.appendChild(circle_create_display_name);
        circle_create_description_wrapper.appendChild(circle_create_description);
        circle_create_image_upload_wrapper.appendChild(circle_create_image_upload);
        circle_create_related_tags_wrapper.appendChild(circle_create_related_tags);
        circle_create_related_circles_wrapper.appendChild(circle_create_related_circles);

        form.appendChild(circle_create_display_name_wrapper);
        form.appendChild(circle_create_description_wrapper);
        // form.appendChild(circle_create_image_upload_wrapper);
        form.appendChild(circle_create_related_tags_wrapper);
        form.appendChild(circle_create_related_circles_wrapper);
        form.appendChild(circle_create_submit_wrapper);




        $(circle_create_related_tags).click(function (e) {
            e.preventDefault();
            let upper = new CardMakers().circle_options_card("/api/v1/circle/get_circle_tags/CircleTags",
                circle_create_related_tags,
                "ON").then((upper) => {
                    $('#Circle_Creation_Options').empty();
                    let current_tags = new forms().split_tags_by_comma(circle_create_related_tags.value);
                    for (let i = 0; i < upper.length; i++) {
                        if (current_tags.includes(upper[i].innerText)) {
                        } else {
                            $('#Circle_Creation_Options').append(upper[i]);
                        }
                    }
                });
        });

        $(circle_create_related_circles).keyup(function (e) {
            e.preventDefault();
            $('#Circle_Creation_Options').empty();
            let inpuvalue = circle_create_related_circles.value;
            // Split the value by comma and get the last value.
            let splitvalue = inpuvalue.split(",");
            let lastvalue = splitvalue[splitvalue.length - 1];
            let upper = new CardMakers().circle_options_card("/api/v1/circle/get_circle_tags/RelatedCircleTags?query=" + lastvalue, circle_create_related_circles, "ON").then((upper) => {
                let current_tags = new forms().split_tags_by_comma(circle_create_related_tags.value);
                for (let i = 0; i < upper.length; i++) {
                    if (current_tags.includes(upper[i].innerText)) {
                    } else {
                        $('#Circle_Creation_Options').append(upper[i]);
                    }
                }
            });
        });






        $(circle_create_submit_wrapper).click(function (e) {
            $(circle_create_submit_wrapper).addClass('hidden')
            let floatin_notif_progressing = new floating_notifications_orginal().bottom_bar_notification("Creating circle please wait...", ' animate-pulse  bg-yellow-800 p-2 text-white text-sm font-bold rounded', 10000)
            $('body').append(floatin_notif_progressing);
            e.preventDefault();
            form.reportValidity();
            if (form.checkValidity()) {
                let subber = new APICALLS().GenericAPICall("/api/v1/circle/create_circle", "POST", $(form).serialize()).then((data) => {
                    // If data is not successful then give the user feedback.
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Successfully created circle!", ' bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                    $(floatin_notif_progressing).remove();
                    $(circle_create_submit_wrapper).removeClass('hidden')
                    // $('#Manage_circle').click();
                }).catch((error) => {
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Circle creation failed, Please check for duplicate name or contact founder!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                    $(floatin_notif_progressing).remove();
                    $(circle_create_submit_wrapper).removeClass('hidden')
                });
            } else {
                let floating_notif = new floating_notifications_orginal().bottom_bar_notification("Circle creation failed", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floating_notif);
                $(floatin_notif_progressing).remove();
                $(circle_create_submit_wrapper).removeClass('hidden')
            }
        });
        return form;
    }
    split_tags_by_comma(tags) {
        let tags_array = tags.split(",");
        return tags_array;
    }
}
class join_circle_tools {

    async search_circle_api_call(search_query, skip) {
        let url = "/api/v1/circle/general/find_circles";
        let data_to_send = {
            "search_string": search_query,
            "skip": skip
        }
        let data = await new APICALLS().GenericAPIJSON_CALL(url, "POST", JSON.stringify(data_to_send)).then((data) => {
            return data;
        });
        return data;
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
                window.location.href = "/circles/" + circle_details["DisplayName"];
            });
        } else {
            wrapperdiv.appendChild(join_button);
        }
        $(join_button).click(function (e) {
            e.preventDefault();
            let joiner = new join_circle_tools().join_circle_api_call(circle_details["DisplayName"]).then((data) => {
                $(join_button).remove();
            }).catch((error) => {
                let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Failed to join circle!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                $('body').append(floatin_notif);
            }
            );
        });


        return wrapperdiv;
    }
    join_circle_click_action() {
        let join_circle_wrapper_div = document.createElement("div");
        $(join_circle_wrapper_div).addClass('w-full flex flex-col p-2');
        let card_wrapper_section_div = document.createElement("div");
        $(card_wrapper_section_div).addClass('w-full flex flex-row flex-wrap');
        $(card_wrapper_section_div).attr("id", "card_wrapper_section_div_for_searched_circles")
        let search_bar_wrapper = document.createElement("div");
        $(search_bar_wrapper).addClass('w-full flex flex-row');
        let search_bar = new join_circle_tools().search_bar_and_user_count();
        $(search_bar_wrapper).append(search_bar);
        $(join_circle_wrapper_div).append(search_bar_wrapper);
        $(join_circle_wrapper_div).append(card_wrapper_section_div);
        return join_circle_wrapper_div;
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
    search_bar_and_user_count(data) {
        let wrapper_div = document.createElement("div");
        let search_wrapper = document.createElement("div");
        let search_bar = document.createElement("input");
        let reset_button = document.createElement("button");
        let user_count = document.createElement("span");

        $(wrapper_div).addClass('w-full flex flex-row justify-between p-2');
        $(search_wrapper).addClass('flex w-full flex-row justify-start');
        $(search_bar).addClass('w-full text-base bg-gray-900 rounded-md p-2 text-gray-200 font-semibold outline-none dark:bg-white dark:text-black dark:shadow-md');
        $(search_bar).attr("placeholder", "Search for a circles by name or tags");
        $(reset_button).addClass('text-base bg-gray-900 rounded-md ml-2 p-2 text-gray-200 font-semibold outline-none hover:text-white cursor-pointer dark:bg-white dark:text-black dark:shadow-md dark:hover:bg-gray-200 dark:hover:text-black');
        $(reset_button).text("Reset");
        let filters = new join_circle_tools().generic_select_option_creator("text-base bg-gray-900 rounded-md ml-2 p-2 text-gray-200 font-semibold outline-none hover:text-white cursor-pointer dark:bg-white dark:text-black dark:shadow-md", ["Name"]);

        $(user_count).addClass('bg-gray-900 rounded-md p-2 text-gray-200 font-semibold text-right dark:bg-white dark:text-black dark:shadow-md');
        // $(user_count).text("Users involved with the circle: " + data["Total_Users"]);

        $(search_wrapper).append(search_bar);
        $(search_wrapper).append(filters);
        $(search_wrapper).append(reset_button);
        $(wrapper_div).append(search_wrapper);

        // $(wrapper_div).append(user_count);


        $(search_bar).keyup(function () {
            // Start after 2 characters.
            if ($(search_bar).val().length > 2) {
                let skipper = current_number_of_circles_for_joining.toString();
                let calling = new join_circle_tools().search_circle_api_call($(search_bar).val(), skipper).then(function (data) {
                    // new circle_moderation_user_moderation_tools().User_Card_Complete2("No", "No", "Yes", data);
                    $('#card_wrapper_section_div_for_searched_circles').empty();
                    $(wrapper_div).siblings().remove();
                    let card_lens = data["Circles"].length;
                    if (card_lens == 0) {
                        let empty_div = document.createElement("div");
                        $(empty_div).addClass('w-full flex flex-col justify-center items-center p-2');
                        let empty_text = document.createElement("span");
                        $(empty_text).addClass('text-gray-200 font-semibold text-xl dark:text-black');
                        $(empty_text).text("No circles found");
                        $(empty_div).append(empty_text);
                        $('#card_wrapper_section_div_for_searched_circles').append(empty_div);
                    }
                    for (let i = 0; i < card_lens; i++) {
                        let card = new join_circle_tools().circle_home_card(data["Circles"][i]);
                        $('#card_wrapper_section_div_for_searched_circles').append(card);
                    }
                }
                );

            }
        });

        $(reset_button).click(function () {
            $(search_bar).val('');
            // new circle_moderation_user_moderation_tools().User_Card_Complete2("No", "Yes", "No", {});
            $('#card_wrapper_section_div_for_searched_circles').empty();
        });

        return wrapper_div;
    }
}
class general_circle_control_tools_meta_funcitons {
    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
    }
    scroll_load_binder(feeder_div, feed_loader_name, load_name) {
        feeder_div = $(feeder_div);
        $(feeder_div).scroll(function (e) {
            let scroll_percentage = new general_circle_control_tools_meta_funcitons().calculateScrollPercentage(feeder_div);
            if (scroll_percentage > 40 && scroll_safety[feed_loader_name]["scroll_safety"]) {
                scroll_safety[feed_loader_name]["scroll_safety"] = 0;
                if (load_name == "my_circles") {
                    let new_stuff = new CardMakers().circle_home_all_cards().then((new_stuff2) => {
                        // append each child of new_stuff2 to the feeder_div.
                        $(feeder_div).children().append($(new_stuff2).children());
                    });
                }
            }
        });
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

}


