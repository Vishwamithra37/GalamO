$(document).ready(function () {
    let controls_for_circle_customization = [
        "Details",
        "Information_Board",
        "Title_Manager",
    ]

    for (let i = 0; i < controls_for_circle_customization.length; i++) {
        let card = new CardMakers().control_board2_card_maker(controls_for_circle_customization[i]);
        $("#control_board2").prepend(card);
    }
    $('#control_board2').on('click', ':not(#Information_Board, #Title_Manager)', function () {

        $('#Preview_Right_Column').addClass("hidden");
        $('#content_board').removeClass('w-8/12 w-6/12')
        $('#content_board').addClass('w-8/12')
    });

    $("#Details").click(function () {
        $("#content_board").empty();
        let details = new APICALLS().GenericAPICall("/api/v1/circle/get_specific_circle_details/" + DisplayName, "GET", {}).then(function (details) {
            $("#content_board").empty();
            let wrap = new CardMakers().details_all_wrapper_card(details["Circle_Details"]);
            $("#content_board").append(wrap);
            // $('#save_preview').addClass("hidden");
        });
    });
    $("#Information_Board").click(function () {
        $("#content_board").empty();
        $('#Preview_Right_Column').removeClass("hidden");
        $('#content_board').removeClass('w-8/12 w-6/12')
        $('#content_board').addClass('w-6/12')
        let info_board = new Information_Board().top_bar_options_Inforamtion_Board();
        $("#content_board").append(info_board);
    });

    $("#Title_Manager").click(function () {
        $("#content_board").empty();
        $('#content_board').removeClass('w-8/12 w-6/12')
        $('#content_board').addClass('w-6/12')
        $('#Preview_Right_Column').removeClass("hidden");
        new Title_Manager_card().main_calling();

    });


    $('#information_board_Card_column').on('DOMSubtreeModified', function () {
        $('#save_preview').removeClass("hidden");
    });

    $('#save_preview').click(function () {
        let confirmer = new floating_notifications_orginal().security_popup(
            "Are you sure you want to update the cards?",
            ["Confirm Update", "Cancel"],
        );
        $('body').append(confirmer[0]);
        // The discard button.
        $(confirmer[2]).click(function () {
            return $(confirmer[0]).remove();
        });
        // The confirm button.
        $(confirmer[1]).click(function () {
            let array_of_cards = [];
            $('#information_board_Card_column').children().each(function () {
                let serialized_data = $(this).attr("data-card_data");
                serialized_data = JSON.parse(serialized_data);
                array_of_cards.push(serialized_data);
            });
            console.log(array_of_cards);
            console.log($("#information_board_preview_select").val());
            let url = "/api/v1/circle/create_information_and_announcement_board/" + DisplayName + "?information_board_title=" + $("#information_board_preview_select").val()
            let method = "POST";
            let data = { "information_board": array_of_cards };
            let progress_notice = new floating_notifications_orginal().bottom_bar_notification('Card Update in progress', ' animate-pulse  bg-black p-2 text-white bg-yellow-400 text-sm font-bold rounded', 5000);
            $('body').append(progress_notice);
            let response = new APICALLS().GenericAPIJSON_CALL(url, method, JSON.stringify(data)).then(function (response) {
                $(progress_notice).remove();
                let notice = new floating_notifications_orginal().bottom_bar_notification('Successfully Updated cards', ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000);
                $('body').append(notice);
            }).catch(function (error) {
                $(progress_notice).remove();
                let notice = new floating_notifications_orginal().bottom_bar_notification('Error in updating cards <br/> No update deteted or Error in data', ' animate-pulse text-center bg-black p-2 text-red-500 text-sm font-bold rounded', 3000);
                $('body').append(notice);
            });
            return $(confirmer[0]).remove();
        });
    });

    new preview_board().title_subtitle_refresh2();



});

class preview_board {
    title_subtitle_refresh2() {
        let info_board_url = '/api/v1/circle/get_information_and_announcement_board/' + DisplayName;
        new APICALLS().GenericAPICall(info_board_url, 'GET', {}).then(function (data) {
            $('#information_board_preview_select').empty();
            let len_of_info_board = data["Information_Board"].length;
            for (let i = 0; i < len_of_info_board; i++) {
                let optioner = document.createElement('option');
                $(optioner).text(data["Information_Board"][i]["title"]);
                $(optioner).attr('data-subtitle', data["Information_Board"][i]["subtitle"]);
                $(optioner).attr('data-content', JSON.stringify(data["Information_Board"][i]["Information_cards"]));
                $('#information_board_preview_select').append(optioner);
            };
            $('#Information_board_preview_subtitle').text($('#information_board_preview_select').find(":selected").attr('data-subtitle'));
            let content_of_info_board = JSON.parse($('#information_board_preview_select').find(":selected").attr('data-content'));
            for (let i = 0; i < content_of_info_board.length; i++) {
                content_of_info_board[i]["preview"] = "Yes"
                let info_card = new MainFeed().Information_board_cards(content_of_info_board[i]);
                $('#information_board_Card_column').append(info_card);
            }
            $('#information_board_preview_select').change(function () {
                $('#Information_board_preview_subtitle').text($('#information_board_preview_select').find(":selected").attr('data-subtitle'));
                let content_of_info_board = JSON.parse($('#information_board_preview_select').find(":selected").attr('data-content'));
                $('#information_board_Card_column').empty();
                for (let i = 0; i < content_of_info_board.length; i++) {
                    content_of_info_board[i]["preview"] = "Yes"
                    let info_card = new MainFeed().Information_board_cards(content_of_info_board[i]);
                    $('#information_board_Card_column').append(info_card);
                }
            });
        });
    }
    title_subtitle_refresh() {
        let url = "/api/v1/circle/get_information_board_title_and_subtitle/" + DisplayName;
        let method = "GET";
        let data = {};
        let title_subtitle = new APICALLS().GenericAPICall(url, method, data).then(function (title_subtitle) {
            title_subtitle = title_subtitle["Information_Board_title_and_subtitle"];
            // let i=title_subtitle.length;
            $("#information_board_preview_select").empty();
            for (let i = 0; i < title_subtitle.length; i++) {
                let selecter = document.createElement("option");
                $(selecter).text(title_subtitle[i]["title"]);
                $('#information_board_preview_select').append(selecter);
                $("#Information_board_preview_subtitle").text(title_subtitle[i]["subtitle"]);
            }

            // On change in '#information_board_preview_select' search through title_subtitle and get the subtitle of the selected title.
            $("#information_board_preview_select").change(function () {
                for (let i = 0; i < title_subtitle.length; i++) {
                    if (title_subtitle[i]["title"] == $("#information_board_preview_select").val()) {
                        $("#Information_board_preview_subtitle").text(title_subtitle[i]["subtitle"]);
                        break;
                    }

                }

            }
            );
            $("#information_board_preview_select").change();


        });
    }
    profile_card_preview(profile_card_data) {
        // This is a function creates the profile preview card which goes inside 'information_board_Card_column'.

        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full relative flex rounded-md flex-col justify-between items-center cursor-pointer mt-2 bg-gray-900 border-2");
        profile_card_data["card_type"] = "profile_card";
        $(wrapper_div).attr("data-card_data", JSON.stringify(profile_card_data));

        let image_div = document.createElement("div");
        $(image_div).addClass("w-full h-52 text-white font-semibold bg-gray-500 flex flex-col justify-center items-center cursor-pointer hover:border-blue-400 mt-2");
        $(image_div).css("background-image", "url(" + profile_card_data["card_image"] + ")");
        $(image_div).css("background-size", "cover");
        $(image_div).css("background-position", "center");

        let title_div = document.createElement("div");
        $(title_div).addClass("w-full  font-bold border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(title_div).text(profile_card_data["card_title"]);

        let description_div = document.createElement("div");
        $(description_div).addClass("w-full  h-20 overflow-y-scroll border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none placeholder-gray-400 hover:placeholder-gray-300");
        $(description_div).text(profile_card_data["card_description"]);

        let stars_div = document.createElement("div");
        $(stars_div).addClass("w-full flex flex-row justify-between items-center text-yellow-400 text-center p-1");
        $(stars_div).text("Stars ★ : " + profile_card_data["card_rating"]);


        let post_details = {
            "Supports": "25",
            "Rejects": "10",
            "Supported": "Yes",
            "Rejected": "No"
        }
        if (profile_card_data["card_image"] == "" || profile_card_data["card_image"] == undefined || profile_card_data["card_image"] == "none") {
            $(image_div).addClass("hidden");
            $(description_div).toggleClass("h-20 h-auto");
            $(description_div).addClass('p-2')
        }

        let support_reject_option_wrapper = document.createElement("div");
        $(support_reject_option_wrapper).addClass("w-full flex flex-row justify-center items-center text-center p-1 border-t-2 border-blue-500");

        let support_text = post_details["Supports"] + ' | 🡅';
        let reject_text = post_details["Rejects"] + ' | 🡇';
        let cancel_text = " 🛇 ";

        let Support_span_addon = new AddOns().GenericSpan_Addon('text-green-500 bg-black p-2 rounded font-semibold cursor-pointer cursor-pointer hover:text-green-600', support_text);
        $(support_reject_option_wrapper).append(Support_span_addon);
        let reject_span_addon = new AddOns().GenericSpan_Addon('text-red-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-red-600', reject_text);
        $(support_reject_option_wrapper).append(reject_span_addon);
        let cancel_span_addon = new AddOns().GenericSpan_Addon('text-gray-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-gray-600', cancel_text);
        $(support_reject_option_wrapper).append(cancel_span_addon);

        if (post_details['Rejected'] == "Yes") {
            $(reject_span_addon).addClass('border-2 border-red-500');
        }
        if (post_details['Supported'] == "Yes") {
            $(Support_span_addon).addClass('border-2 border-green-500');
        }
        // $(wrapper_div).click(function(e){
        //     e.preventDefault();
        //     // Go to profile_card_data["link"].
        //     location.href=profile_card_data["card_link"];
        // });
        $(wrapper_div).css("border-color", profile_card_data["card_color"]);

        $(wrapper_div).append(image_div);
        $(wrapper_div).append(title_div);
        $(wrapper_div).append(description_div);
        // $(wrapper_div).append(stars_div);
        if (profile_card_data["support_reject_buttons"] == "on") {
            $(wrapper_div).append(support_reject_option_wrapper);
        }
        // Context Menu.
        let context_menu_div = new preview_board().context_menu_delete_div(wrapper_div);
        // On context menu click, the context menu is shown.
        $(wrapper_div).contextmenu(function (e) {
            e.preventDefault();
            $(context_menu_div).removeClass("hidden");
        });
        // On mouse moving away from the context menu, the context menu is hidden.
        $(context_menu_div).mouseleave(function (e) {
            e.preventDefault();
            $(context_menu_div).addClass("hidden");
        });
        $(wrapper_div).append(context_menu_div);
        return wrapper_div;
    }
    Title_card_preview(title_card_data) {
        // This is a simple function which creates a title card, which is a wrapper div of height h-14 and width w-full with 
        // a text inside it. The background color being title_card_data["card_color"].
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full relative flex p-2 flex-col justify-between items-center  mt-2 bg-gray-900 border-b-2");
        title_card_data["card_type"] = "title_card";
        $(wrapper_div).attr("data-card_data", JSON.stringify(title_card_data));

        let title_div = document.createElement("div");
        $(title_div).addClass("w-full font-bold bg-transparent text-white text-center outline-none text-center placeholder-gray-400 hover:placeholder-gray-300");

        $(title_div).text(title_card_data["card_title"]);

        $(wrapper_div).css("border-color", title_card_data["card_color"]);
        $(wrapper_div).append(title_div);


        // Context Menu.
        let context_menu_div = new preview_board().context_menu_delete_div(wrapper_div);
        // On context menu click, the context menu is shown.
        $(wrapper_div).contextmenu(function (e) {
            e.preventDefault();
            $(context_menu_div).removeClass("hidden");
        });
        // On mouse moving away from the context menu, the context menu is hidden.
        $(context_menu_div).mouseleave(function (e) {
            e.preventDefault();
            $(context_menu_div).addClass("hidden");
        });
        $(wrapper_div).append(context_menu_div);
        return wrapper_div;
    }

    context_menu_delete_div(element_to_be_deleted) {
        // This function returns a div which is a context menu for deleting the element_to_be_deleted. The context menu has a
        // delete button in red color which on hover turns to red-600 and on click deletes the element_to_be_deleted.
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("hidden mt-2 absolute flex flex-col justify-center items-center text-center p-1 border-blue-500");

        let delete_text = "🗑️ Delete";
        let delete_span_addon = new AddOns().GenericSpan_Addon('text-red-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-red-600', delete_text);

        $(delete_span_addon).click(function () {
            $(element_to_be_deleted).remove();
        });

        let edit_text = "✎ Edit";
        let edit_span_addon = new AddOns().GenericSpan_Addon('text-green-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-green-400', edit_text);

        $(edit_span_addon).click(function () {
            let card_data = JSON.parse($(element_to_be_deleted).attr("data-card_data"));
            let card_type = card_data["card_type"];
            let form_card;
            if (card_type == "profile_card") {
                form_card = new forms().profile_card_form(card_data);
            }
            if (card_type == "title_card") {
                form_card = new Information_Board().pureTextCardMaker_Information_Board(card_data);

            }
        });

        $(wrapper_div).append(delete_span_addon);
        // $(wrapper_div).append(edit_span_addon);


        return wrapper_div;
    }

    context_menu_edit_div(element_to_be_edited) {
        // This function returns a div which is a context menu for editing the element_to_be_edited. The context menu has a
        // edit button in blue color which on hover turns to blue-600 and on click edits the element_to_be_edited.
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("hidden mt-2 absolute flex flex-col justify-center items-center text-center p-1 border-blue-500");

        let edit_text = "✎ Edit";
        let edit_span_addon = new AddOns().GenericSpan_Addon('text-blue-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-blue-600', edit_text);
        $(wrapper_div).append(edit_span_addon);

        $(edit_span_addon).click(function () {
            $(element_to_be_edited).remove();
        });

        return wrapper_div;
    }



}

class forms {
    preview_create_bar() {
        let wrapper_div = document.createElement("div");
        let preview_button = document.createElement("button");
        let create_button = document.createElement("button");

        $(wrapper_div).addClass("w-full flex flex-row justify-between items-center");
        $(preview_button).addClass("p-2 rounded-md text-white font-semibold bg-gray-500 flex flex-col justify-center items-center border-2 border-blue-500 cursor-pointer hover:border-blue-400");
        $(create_button).addClass("p-2 rounded-md text-white font-semibold bg-gray-500 flex flex-col justify-center items-center border-2 border-blue-500 cursor-pointer hover:border-blue-400");

        $(preview_button).text("Preview");
        $(create_button).text("Create");

        $(wrapper_div).append(preview_button);
        $(wrapper_div).append(create_button);

        return [wrapper_div, preview_button, create_button];
    }
    split_tags_by_comma(tags) {
        let tags_array = tags.split(",");
        return tags_array;
    }
    profile_card_form(editer_mode_card_details) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full h-full flex flex-col justify-between items-center");
        $(wrapper_div).attr("data-form_type", "profile_card_input_data_form");

        let form = document.createElement("form");
        $(form).addClass("w-full flex flex-col justify-between h-full items-center");

        let image_input = document.createElement("input");
        $(image_input).attr("type", "file");
        $(image_input).attr("name", "card_image");
        $(image_input).attr("id", "card_image");
        $(image_input).addClass("hidden");



        // Create a label for the image input on a w-54 h-54 div.
        let image_input_label = document.createElement("label");
        $(image_input_label).addClass("w-52 h-52 rounded-md text-white font-semibold bg-gray-500 flex flex-col justify-center items-center border-2 border-blue-500 cursor-pointer hover:border-blue-400 mt-2");
        $(image_input_label).attr("for", "card_image");
        $(image_input_label).text("Click and upload image");
        // Accept only jped, png and gif files.
        $(image_input).attr("accept", "image/jpeg,image/png,image/gif,image/jpg");
        //  Convert the input into base64 and keep at as src of the image_input_label.
        $(image_input).change(function (e) {
            e.preventDefault();
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                $(image_input_label).css("background-image", "url(" + reader.result + ")");
                $(image_input_label).css("background-size", "cover");
                $(image_input_label).css("background-position", "center");
                $(image_input_label).text("");
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        });



        image_input_label.addEventListener('paste', function (event) {
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;

            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    var blob = items[i].getAsFile();
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        // Access the image data as e.target.result
                        var imageData = e.target.result;
                        // Display the image data in the input field
                        $(image_input_label).css("background-image", "url(" + imageData + ")");
                        $(image_input_label).css("background-size", "cover");
                        $(image_input_label).css("background-position", "center");
                        $(image_input_label).text("");
                    };

                    reader.readAsDataURL(blob);
                }
            }
        });



        // Create an input with transparent background and bottom border with blue color as title input.
        let title_input = document.createElement("input");
        $(title_input).attr("type", "text");
        $(title_input).attr("name", "card_title");
        $(title_input).addClass("w-full  font-bold border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(title_input).attr("placeholder", "Title (max 25 characters)");



        // Create an input with transparent background and bottom border with blue color as description input.
        let description_input = document.createElement("textarea");
        $(description_input).attr("type", "text");
        $(description_input).attr("name", "card_description");
        $(description_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-1 text-center text-white outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(description_input).attr("placeholder", "Description (max 300 characters - can cut off if too long)");

        // Add a counter input for upto 10 numbers only as a rating input. Matching the current theme.
        let rating_input = document.createElement("input");
        $(rating_input).attr("type", "number");
        $(rating_input).attr("name", "card_rating");
        $(rating_input).attr("max", "10");
        $(rating_input).attr("min", "0");
        $(rating_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(rating_input).attr("placeholder", "Rating (0-10) - Optional");



        // Create an input for https links to add to the card.
        let link_input = document.createElement("input");
        $(link_input).attr("type", "text");
        $(link_input).attr("name", "card_link");
        $(link_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-1 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(link_input).attr("placeholder", "Link (https://) - Optional");


        // Create a color input for the card.
        let color_input_wrapper = document.createElement("div");
        $(color_input_wrapper).addClass("w-full flex flex-row justify-center items-center");
        let color_input_span = document.createElement("span");
        $(color_input_span).addClass("text-gray-400 mr-2 hover:text-gray-300");
        $(color_input_span).text("Color for border- Optional");
        $(color_input_wrapper).append(color_input_span);

        let color_input = document.createElement("input");
        $(color_input).attr("type", "color");
        $(color_input).attr("name", "card_color");
        $(color_input).addClass("w-20 h-12  bg-transparent mt-1 text-white text-center outline-none p-2 placeholder-gray-400");
        $(color_input).attr("placeholder", "Color - Optional");
        $(color_input).attr("id", "card_color");
        $(color_input_wrapper).append(color_input);

        // create a nice looking submit button.
        let submit_button = document.createElement("button");
        $(submit_button).addClass("w-1/4 rounded-md p-2 border-2 mt-0 border-blue-500 bg-blue-500 text-white cursor-pointer hover:bg-blue-700");
        $(submit_button).text("Preview");

        let preview_submitter = new forms().preview_create_bar();
        // $(wrapper_div).append(preview_submitter[0]);



        // A single optional tick box to enable or disable support/reject buttons.

        let support_reject_option_wrapper = document.createElement("div");
        $(support_reject_option_wrapper).addClass("flex flex-row justify-center items-center mt-2");
        let support_reject_buttons = document.createElement("input");
        $(support_reject_buttons).attr("type", "checkbox");
        $(support_reject_buttons).attr("name", "support_reject_buttons");
        $(support_reject_buttons).attr("id", "support_reject_buttons");
        $(support_reject_buttons).addClass("mt-1 bg-gray-800 hover:bg-gray-700 text-blue-500 rounded-md cursor-pointer h-6 w-6");
        let support_reject_buttons_label = document.createElement("label");
        $(support_reject_buttons_label).attr("for", "support_reject_buttons");
        $(support_reject_buttons_label).text("Support/Reject Buttons");
        $(support_reject_buttons_label).addClass("ml-2 mr-2 text-gray-400 hover:text-gray-300 cursor-pointer");




        // A single optional tick box to enable or disable voterID verification.

        // let voterID_option_wrapper=document.createElement("div");
        // $(voterID_option_wrapper).addClass("flex flex-row justify-center items-center mt-2");
        let voterID_buttons = document.createElement("input");
        $(voterID_buttons).attr("type", "checkbox");
        $(voterID_buttons).attr("name", "voterID");
        $(voterID_buttons).attr("id", "voterID");
        $(voterID_buttons).addClass("mt-1 bg-gray-800 hover:bg-gray-700 text-blue-500 rounded-md cursor-pointer h-6 w-6");
        let voterID_buttons_label = document.createElement("label");
        $(voterID_buttons_label).attr("for", "voterID");
        $(voterID_buttons_label).text("Require VoterID Verification");
        $(voterID_buttons_label).addClass("mr-2 text-gray-400 hover:text-gray-300 cursor-pointer");

        $(support_reject_option_wrapper).append(voterID_buttons_label);
        $(support_reject_option_wrapper).append(voterID_buttons);
        // Set default values to off.
        $(support_reject_buttons).prop("checked", false);

        $(support_reject_option_wrapper).append(support_reject_buttons_label);
        $(support_reject_option_wrapper).append(support_reject_buttons);
        // Set default values to off.
        $(support_reject_buttons).prop("checked", false);

        // A single optional tick box to enable or disable voterID verification.

        let comment_option_wrapper = document.createElement("div");
        $(comment_option_wrapper).addClass("flex flex-row justify-center items-center mt-2");
        let comment_buttons = document.createElement("input");
        $(comment_buttons).attr("type", "checkbox");
        $(comment_buttons).attr("name", "comment");
        $(comment_buttons).attr("id", "comment");
        $(comment_buttons).addClass("mt-1 bg-gray-800 hover:bg-gray-700 text-blue-500 rounded-md cursor-pointer h-6 w-6");
        let comment_buttons_label = document.createElement("label");
        $(comment_buttons_label).attr("for", "comment");
        $(comment_buttons_label).text("Allow Comments");
        $(comment_buttons_label).addClass("mr-2 text-gray-400 hover:text-gray-300 cursor-pointer");

        $(comment_option_wrapper).append(comment_buttons_label);
        $(comment_option_wrapper).append(comment_buttons);

        // Append all the elements to the form.
        $(form).append(image_input);
        $(form).append(image_input_label);
        $(form).append(title_input);
        $(form).append(description_input);
        $(form).append(link_input);
        // $(form).append(rating_input);
        $(form).append(support_reject_option_wrapper);
        // $(form).append(voterID_option_wrapper);
        $(form).append(color_input_wrapper)
        $(form).append(submit_button);
        // $(form).append(preview_submitter[0]);

        $(submit_button).click(function (e) {
            e.preventDefault();
            // show form as json.
            let serialized = $(form).serializeArray();
            serialized = Object.fromEntries(serialized.map(({ name, value }) => [name, value]));


            if ("support_reject_buttons" in serialized) {
                serialized["support_reject_buttons"] = "on";
            } else {
                serialized["support_reject_buttons"] = "off";
            }
            if ("voterID" in serialized) {
                serialized["voterID"] = "on";
            } else {
                serialized["voterID"] = "off";
            }

            serialized["card_image"] = $(image_input_label).css("background-image").replace("url(", "").replace(")", "").replace(/\"/gi, "");

            console.log(serialized);

            let preview_card = new preview_board().profile_card_preview(serialized);
            $('#information_board_Card_column').append(preview_card);
            $(preview_card).focus();

            // Find all data under the information board. and log it.

            $('#information_board_Card_column').children().each(function () {
                console.log("Information Board Data ")
                console.log($(this).data());
            });


        });

        if (editer_mode_card_details) {
            // Set the default values. For the forms.
            console.log(editer_mode_card_details);

        }



        $(wrapper_div).append(form);
        return wrapper_div;
    }

    Image_card_form() {
        // Unsused card.
        let wrapper_div = new Information_Board().simple_bar_div_Inforamtion_Board('w-full h-full');
        let form = document.createElement("form");
        $(form).addClass("w-full h-full flex flex-col justify-center items-center");

        // Create an input for the image.
        let image_input = document.createElement("input");
        $(image_input).attr("type", "file");
        $(image_input).attr("name", "card_image");
        $(image_input).attr("id", "card_image");
        $(image_input).addClass("hidden");

        // Create a label for the image input on a w-54 h-54 div.
        let image_input_label = document.createElement("label");
        $(image_input_label).addClass("w-52 h-52 rounded-md text-white font-semibold bg-gray-500 flex flex-col justify-center items-center border-2 border-blue-500 cursor-pointer hover:border-blue-400 mt-2");
        $(image_input_label).attr("for", "card_image");
        $(image_input_label).text("Click and upload image");
        // Accept only jped, png and gif files.
        $(image_input).attr("accept", "image/jpeg,image/png,image/gif,image/jpg");

        // Create an input with transparent background and bottom border with blue color as title input.
        let title_input = document.createElement("input");
        $(title_input).attr("type", "text");
        $(title_input).attr("name", "card_title");
        $(title_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(title_input).attr("placeholder", "Title (max 25 characters)");

        // Create an input for https links to add to the card.
        let link_input = document.createElement("input");
        $(link_input).attr("type", "text");
    }



}

class Title_Manager_card {
    main_calling() {

        let wrapper = $("<div class='w-full h-full flex flex-row  border-b-2 border-blue-600'></div>");
        let the_list;
        let end;
        let url = '/api/v1/circle/get_information_board_title_and_subtitle/' + DisplayName;
        let inputer = input_for_changes();
        let get_call = new APICALLS().GenericAPICall(url, "GET", "").then(function (data) {
            console.log(data);
            the_list = data["Information_Board_title_and_subtitle"];
            end = createCircleList(the_list);
            wrapper.append(end);
            $(end).find("span").change(function () {
                $(inputer[4]).val($(this).attr("data-title"));
                $(inputer[5]).val($(this).attr("data-subtitle"));
            });
            wrapper.append(inputer[0]);
        }).catch(function (error) {
            the_list = [];
            end = createCircleList(the_list);
            wrapper.append(end);
            $(end).find("span").change(function () {
                $(inputer[4]).val($(this).attr("data-title"));
                $(inputer[5]).val($(this).attr("data-subtitle"));
            });
            wrapper.append(inputer[0]);

        });







        // We manage the buttons here.

        // Constantly check if the user has selected a title and subtitle. By keeping a listener for change in data-selected attribute in span under inputer[0].




        $(inputer[1]).click(function () {
            // This is the Update button.
            // Find span under end and if data-selected is Yes then update the title and subtitle.
            let selected = $(end).find("span[data-selected='Yes']");
            let values = {
                "old_title": $(selected).attr("data-title"),
                "old_subtitle": $(selected).attr("data-subtitle"),
                "title": $(inputer[4]).val(),
                "subtitle": $(inputer[5]).val(),
            }
            let url = '/api/v1/circle/update_circle_information_board/' + DisplayName;
            let update_call = new APICALLS().GenericAPIJSON_CALL(
                url,
                "POST",
                JSON.stringify(values),
            ).then(function (data) {
                let notice = new floating_notifications_orginal().bottom_bar_notification('Successfully Updated the title and subtitle.', ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000);
                $('body').append(notice);
                $('#Title_Manager').click();
                new preview_board().title_subtitle_refresh();
            });

        });
        $(inputer[2]).click(function () {
            // This is the unselct button.
            end.find("span").removeClass("bg-indigo-800 text-gray-100").attr("data-selected", "No");
            $(inputer[4]).val("");
            $(inputer[5]).val("");
            new preview_board().title_subtitle_refresh();
        });

        $(inputer[3]).click(function () {
            // This is the create button.
            let values = {
                "title": $(inputer[4]).val(),
                "subtitle": $(inputer[5]).val(),
            }
            let url = '/api/v1/circle/create_title_and_subtitle/' + DisplayName
            let update_call = new APICALLS().GenericAPIJSON_CALL(
                url,
                "POST",
                JSON.stringify(values),
            ).then(function (data) {
                let notice = new floating_notifications_orginal().bottom_bar_notification('Successfully created the title and subtitle.', ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000);
                $('body').append(notice);
                $("#Title_Manager").click();
                new preview_board().title_subtitle_refresh();

            });
        });
        $(inputer[6]).click(function () {
            // This is the delete button.
            let values = {
                "title": $(inputer[4]).val(),
                "subtitle": $(inputer[5]).val(),
            }
            let url = '/api/v1/circle/get_information_board_title_and_subtitle/' + DisplayName;
            let update_call = new APICALLS().GenericAPIJSON_CALL(
                url,
                "POST",
                JSON.stringify(values),
            ).then(function (data) {
                let notice = new floating_notifications_orginal().bottom_bar_notification('Successfully deleted the title and subtitle.', ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000);
                $('body').append(notice);
                $("#Title_Manager").click();
                new preview_board().title_subtitle_refresh();
            });

        });
        // End of managing the buttons.


        $('#content_board').append(wrapper);

        function createCircleList(Circle_List) {
            let wrapper = $("<div class='flex w-1/2 flex-col bg-gray-800'></div>");
            let title = genericspanTitle("Information Board");
            wrapper.append(title);
            for (let i = 0; i < Circle_List.length; i++) {
                console.log(Circle_List[i]["title"]);
                let spanner = $("<span class='p-2 text-center border-b cursor-pointer border-gray-400 font-medium text-gray-300'></span>").text(Circle_List[i]["title"]);
                $(spanner).attr('data-subtitle', Circle_List[i]["subtitle"])
                $(spanner).attr('data-title', Circle_List[i]["title"])
                spanner.click(function () {
                    wrapper.find("span").removeClass("bg-indigo-800 text-gray-100").attr("data-selected", "No");
                    $(this).addClass("bg-indigo-800 text-gray-100").attr("data-selected", "Yes");
                    $(this).trigger("change")
                });
                wrapper.append(spanner);
            }
            return wrapper;
        }

        function genericspanTitle(title, subtitle) {
            // A simple wrapper with span with bold text for title.
            let wrapper = $("<div class='text-center border-b-2 mb-2 border-green-600 shadow-xl'></div>");
            let spanner = $("<span class='font-bold text-yellow-500 text-xl text-center'></span>").text(title);
            $(spanner).attr('data-subtitle', subtitle)
            $(spanner).attr('data-title', title)
            wrapper.append(spanner);
            return wrapper;
        }


        function input_for_changes() {
            // A wrapper for the input and the submit button. It returns [wrapper,saver,unselecter,Add_New,title_input,subtitler];
            let wrapper = document.createElement("div");
            $(wrapper).addClass("w-1/2 bg-gray-800 border-l-2 border-gray-700 h-full flex flex-col justify-start pt-7 ");
            let title_input = document.createElement("input");
            $(title_input).attr("type", "text");
            $(title_input).attr("name", "card_title");
            $(title_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
            $(title_input).attr("placeholder", "Title (max 25 characters)");
            let subtitler = document.createElement("input");
            $(subtitler).attr("type", "text");
            $(subtitler).attr("name", "card_subtitle");
            $(subtitler).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-1 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
            $(subtitler).attr("placeholder", "Subtitle (max 25 characters)");
            let saver_wrapper = document.createElement("div");
            $(saver_wrapper).addClass("w-full flex flex-row justify-center");
            let saver = document.createElement("button");
            $(saver).addClass("p-2 bg-blue-600 hover:bg-blue-700 rounded-md mr-2  border-blue-500  mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
            $(saver).text("Update");
            let unselecter = document.createElement("button");
            $(unselecter).addClass("p-2 bg-gray-600 hover:bg-gray-700 rounded-md border-red-500  mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
            $(unselecter).text("Unselect");
            let Add_New = document.createElement("button");
            $(Add_New).addClass("p-2 bg-green-600 hover:bg-green-700 mr-2 rounded-md border-red-500  mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
            $(Add_New).text("Add New");
            let delete_button = document.createElement("button");
            $(delete_button).addClass("p-2 bg-red-600 hover:bg-red-700 ml-2 rounded-md border-red-500  mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
            $(delete_button).text("Delete 🗑");

            wrapper.append(title_input);
            wrapper.append(subtitler);
            wrapper.append(saver_wrapper);

            saver_wrapper.append(Add_New);
            saver_wrapper.append(saver);
            saver_wrapper.append(unselecter);
            saver_wrapper.append(delete_button);
            //          0      1      2          3           4        5        6
            return [wrapper, saver, unselecter, Add_New, title_input, subtitler, delete_button];
        }


    }
}



class Information_Board {
    ProfileCardMaker_Information_Board() {
        let wrapper_div = new Information_Board().simple_bar_div_Inforamtion_Board('w-full p-2 flex flex-col justify-between bg-gray-800 p-2 border-b-2 border-blue-500');

        let profile_card_form = new forms().profile_card_form();
        $(wrapper_div).append(profile_card_form);


        return wrapper_div;
    }
    StatisticsCardMaker_Information_Board(name, profile_pic, description, link, classer) {
    }
    PlainTextSpanCardMaker_Information_Board(name, classer) {
        let wrapper_div = new Information_Board().simple_bar_div_Inforamtion_Board('w-full h-full');
        let form = document.createElement("form");
        $(form).addClass("w-full h-full flex flex-col items-center");

        // Create an input for title.
        let title_input = document.createElement("input");
        $(title_input).attr("type", "text");
        $(title_input).attr("name", "card_title");
        $(title_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(title_input).attr("placeholder", "Title (max 25 characters)");

        // Create an input for description.
        let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto"
        let ed_options = { "Addons": [], "Bottombar": [] }
        let valve = ""
        let post_editor = new GEditor().geditor_give_in_the_edditable_div(valve, ed_class, ed_options, 'Type your post here...')

        // Create an input for https links to add to the card.
        let link_input = document.createElement("input");
        $(link_input).attr("type", "text");
        $(link_input).attr("name", "card_link");
        $(link_input).addClass("w-full border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(link_input).attr("placeholder", "Link (max 25 characters)");
        // Create a submit button.
        let submit_button = document.createElement("button");
        $(submit_button).addClass("w-1/4 bg-blue-500 text-white p-2 rounded-md mt-2 hover:bg-blue-600");
        $(submit_button).text("Preview");

        $(form).append(title_input);
        $(form).append(post_editor);
        $(form).append(link_input);
        $(form).append(submit_button);

        $(form).submit(function (e) {
            e.preventDefault();
            let serialized = $(this).serializeArray();
            console.log(serialized);
        });
        $(wrapper_div).append(form);

        return wrapper_div;


    }
    pureTextCardMaker_Information_Board(editable_card_data) {
        let wrapper_div = new Information_Board().simple_bar_div_Inforamtion_Board('w-full h-full');
        let form = document.createElement("form");

        $(form).addClass("w-full h-full flex flex-col items-center");

        let title_input = document.createElement("input");
        $(title_input).attr("type", "text");
        $(title_input).attr("name", "card_title");
        $(title_input).addClass("w-full border-b-2 font-bold border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300");
        $(title_input).attr("placeholder", "Title (max 25 characters)");
        // Color swatch for background color.
        let color_input_wrapper = document.createElement("div");
        $(color_input_wrapper).addClass("w-full flex flex-row justify-center items-center");
        let colot_input_span = document.createElement("span");
        $(colot_input_span).addClass("w-1/4 text-gray-400 font-semibold");
        $(colot_input_span).text("Background Color - Optional ");
        $(color_input_wrapper).append(colot_input_span);

        let color_swatch = document.createElement("input");
        $(color_swatch).attr("type", "color");
        $(color_swatch).attr("name", "card_color");
        $(color_swatch).addClass("w-1/4 mt-2 h-12 bg-gray-900 p-2 rounded-md outline-none text-gray-200 overflow-y-auto");
        $(color_input_wrapper).append(color_swatch);


        let submit_button = document.createElement("button");
        $(submit_button).addClass("w-1/4 bg-blue-500  text-white p-2 rounded-md mt-2 hover:bg-blue-600");
        $(submit_button).text("Preview");


        $(form).append(title_input);
        $(form).append(color_input_wrapper);
        $(form).append(submit_button);

        $(form).submit(function (e) {
            e.preventDefault();
            let serialized = $(this).serializeArray();
            console.log(serialized);
            // Convert to object.
            serialized = Object.fromEntries(serialized.map(({ name, value }) => [name, value]));
            let preview_card = new preview_board().Title_card_preview(serialized);
            $('#information_board_Card_column').append(preview_card);
        });



        $(wrapper_div).append(form);


        return wrapper_div;
    }

    top_bar_options_Inforamtion_Board() {
        // Enabling draggability.
        $("#information_board_Card_column").sortable({
            revert: true
        });
        $("#information_board_Card_column").draggable({
            connectToSortable: "#information_board_Card_column",
            helper: "clone",
            revert: "invalid"
        });
        let wrapper_div = new Information_Board().simple_bar_div_Inforamtion_Board('w-full h-full');
        let option_bar = new Information_Board().simple_bar_div_Inforamtion_Board("w-full flex flex-row justify-between bg-black p-1 border-b-2 border-blue-500");
        let profile_card_option = new Information_Board().simple_div_Inforamtion_Board("Profile Card", "w-1/4 p-2 border-r border-gray-600  bg-slate-800 text-center text-white cursor-pointer hover:bg-gray-700");
        let statistics_card_option = new Information_Board().simple_div_Inforamtion_Board("Image Card", "w-1/4 border-l border-r border-gray-600  p-2 bg-slate-800 text-center text-white cursor-pointer hover:bg-gray-700");
        let plain_text_card_option = new Information_Board().simple_div_Inforamtion_Board("Plain Text Card", "w-1/4  border-l border-r border-gray-600  p-2 bg-slate-800 text-center text-white cursor-pointer hover:bg-gray-700");
        let pure_text_card_option = new Information_Board().simple_div_Inforamtion_Board("Title Card", "w-1/4 p-2 bg-slate-800 border-l   border-gray-600 text-center text-white cursor-pointer hover:bg-gray-700");
        let content_div = new Information_Board().simple_bar_div_Inforamtion_Board("w-full h-full");






        $(option_bar).append(profile_card_option);
        // $(option_bar).append(statistics_card_option);
        // $(option_bar).append(plain_text_card_option);
        $(option_bar).append(pure_text_card_option);
        $(wrapper_div).append(option_bar);
        $(wrapper_div).append(content_div);


        // $(option_bar).click(function(){
        //     $(profile_card_option).removeClass("bg-gray-700");
        //     $(statistics_card_option).removeClass("bg-gray-700");
        //     $(plain_text_card_option).removeClass("bg-gray-700");
        //     $(pure_text_card_option).removeClass("bg-gray-700");
        // });
        $(profile_card_option).click(function () {
            let profile_card = new Information_Board().ProfileCardMaker_Information_Board();
            $(content_div).empty();
            $(content_div).append(profile_card);
            $(profile_card_option).addClass("bg-gray-700");
            $(profile_card_option).removeClass("bg-slate-800");
            $(statistics_card_option).removeClass("bg-gray-700");
            // If bg-slate-800 does not exist, add it.
            if (!$(plain_text_card_option).hasClass("bg-slate-800")) {
                $(plain_text_card_option).addClass("bg-slate-800");
            }
            $(plain_text_card_option).removeClass("bg-gray-700");
            if (!$(pure_text_card_option).hasClass("bg-slate-800")) {
                $(pure_text_card_option).addClass("bg-slate-800");
            }
            $(pure_text_card_option).removeClass("bg-gray-700");
            if (!$(statistics_card_option).hasClass("bg-slate-800")) {
                $(statistics_card_option).addClass("bg-slate-800");
            }
        });


        $(plain_text_card_option).click(function () {
            let plain_text_card = new Information_Board().PlainTextSpanCardMaker_Information_Board();
            $(content_div).empty();
            $(content_div).append(plain_text_card);
            console.log("Plain text card clicked");
            console.log(plain_text_card)
            $(plain_text_card_option).addClass("bg-gray-700");
            $(plain_text_card_option).removeClass("bg-slate-800");
            $(statistics_card_option).removeClass("bg-gray-700");
            if (!$(profile_card_option).hasClass("bg-slate-800")) {
                $(profile_card_option).addClass("bg-slate-800");
            }
            $(profile_card_option).removeClass("bg-gray-700");
            if (!$(pure_text_card_option).hasClass("bg-slate-800")) {
                $(pure_text_card_option).addClass("bg-slate-800");
            }
            $(pure_text_card_option).removeClass("bg-gray-700");
            if (!$(statistics_card_option).hasClass("bg-slate-800")) {
                $(statistics_card_option).addClass("bg-slate-800");
            }

        });

        $(pure_text_card_option).click(function () {
            let pure_text_card = new Information_Board().pureTextCardMaker_Information_Board();
            $(content_div).empty();
            $(content_div).append(pure_text_card);
            console.log("Pure text card clicked");
            console.log(pure_text_card)
            $(pure_text_card_option).addClass("bg-gray-700");
            $(pure_text_card_option).removeClass("bg-slate-800");
            $(statistics_card_option).removeClass("bg-gray-700");
            if (!$(profile_card_option).hasClass("bg-slate-800")) {
                $(profile_card_option).addClass("bg-slate-800");
            }
            $(profile_card_option).removeClass("bg-gray-700");
            if (!$(plain_text_card_option).hasClass("bg-slate-800")) {
                $(plain_text_card_option).addClass("bg-slate-800");
            }
            $(plain_text_card_option).removeClass("bg-gray-700");
            if (!$(statistics_card_option).hasClass("bg-slate-800")) {
                $(statistics_card_option).addClass("bg-slate-800");
            }
        });
        $(profile_card_option).click()
        return wrapper_div;
    }
    simple_div_Inforamtion_Board(name, classer) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass(classer);
        $(wrapper_div).text(name);
        return wrapper_div;
    }
    simple_bar_div_Inforamtion_Board(classer) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass(classer);
        return wrapper_div;
    }
}

class CardMakers {


    control_board2_card_maker(name) {
        let spanner = document.createElement("span");
        $(spanner).addClass("w-full p-2 text-center font-semibold text-white rounded-md bg-gray-900 hover:bg-gray-800 cursor-pointer border-b-2 border-gray-700 dark:bg-white dark:text-black dark:shadow-lg dark:hover:bg-gray-200");
        $(spanner).text(name);
        $(spanner).attr("id", name);
        return spanner;
    }

    async circle_options_card(url, the_element, comma_ON) {
        let option_array = []
        let tags = await new APICALLS().GenericAPICall(url, "GET", null).then((data) => {

            for (let i = 0; i < data["circle_tags"].length; i++) {
                let span_option = document.createElement("span");
                span_option.setAttribute("class", "font-semibold text-base text-white bg-gray-600 hover:bg-gray-700 cursor-pointer p-1 rounded-md mt-1 h-8");
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


    details_all_wrapper_card(circle_details) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("w-full p-2 flex flex-row justify-center items-center bg-gray-900 rounded-md");
        let r1 = new CardMakers().details_customization_card(circle_details);
        $(wrapper_div).append(r1);
        return wrapper_div;
    }

    details_customization_card(circle_details, update_url) {
        console.log(circle_details);
        let wrapper_form = document.createElement("form");
        $(wrapper_form).addClass("w-full flex flex-row justify-center items-center");

        let wrapper_div_for_image = document.createElement("div");
        $(wrapper_div_for_image).addClass("w-1/3 h-full flex flex-col justify-center items-center mr-2");
        let image = document.createElement("img");
        $(image).addClass("w-full h-32 border-1 border-gray-700 rounded-md");
        $(image).attr("src", circle_details["CircleImage"]);

        let input_for_image_change = document.createElement("input");
        $(input_for_image_change).addClass("w-full rounded-md bg-gray-900 text-white mb-2 outline-none border-2 border-gray-700 p-1 mt-2");
        $(input_for_image_change).attr("type", "file");
        $(input_for_image_change).attr("accept", "image/png, image/jpeg");
        $(input_for_image_change).attr("multiple", "false");

        let dummy_image_input_base64 = document.createElement("input");
        $(dummy_image_input_base64).val($(image).attr("src"));
        $(dummy_image_input_base64).addClass("invisible");
        $(dummy_image_input_base64).attr("type", "text");
        $(dummy_image_input_base64).attr("name", "CircleImage");

        // On upload, convert it into base64 and display it on the image tag.
        $(input_for_image_change).change(function () {
            let file = this.files[0];
            let reader = new FileReader();
            reader.onloadend = function () {
                $(image).attr("src", reader.result);
                $(dummy_image_input_base64).val($(image).attr("src"));
            }
            reader.readAsDataURL(file);
        });


        wrapper_div_for_image.addEventListener('paste', function (event) {
            var items = (event.clipboardData || event.originalEvent.clipboardData).items;

            for (var i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    var blob = items[i].getAsFile();
                    var reader = new FileReader();

                    reader.onload = function (e) {
                        // Access the image data as e.target.result
                        var imageData = e.target.result;
                        // Display the image data in the input field
                        $(image).attr("src", imageData);
                    };
                    reader.readAsDataURL(blob);
                }
            }
        });




        let wrapper_div_for_name_description_tags = document.createElement("div");
        $(wrapper_div_for_name_description_tags).addClass("w-2/3 h-full flex flex-col justify-center items-center ");
        let description = document.createElement("textarea");
        $(description).addClass("w-full h-32  rounded-md bg-gray-900 text-white mb-2 outline-none border-b-2 border-gray-700 p-2");
        $(description).attr("placeholder", "Description");
        $(description).attr("name", "Description");
        $(description).text(circle_details["Description"]);

        let name = document.createElement("input");
        $(name).addClass("w-full  rounded-md bg-gray-700 font-bold text-white mb-2 outline-none border-b-2 border-gray-700 p-1 text-center");
        $(name).attr("placeholder", "Name");
        $(name).attr("disabled", "true");
        $(name).val(circle_details["DisplayName"]);

        let related_tags = document.createElement("input");
        $(related_tags).addClass("w-full h-10 rounded-md bg-gray-900 text-white mb-2 outline-none border-b-2 border-gray-700 p-2");
        $(related_tags).attr("placeholder", "Tags");
        $(related_tags).attr("name", "Circle_Tags");
        let related_tags_of_circle;
        console.log(circle_details["Circle_Tags"]);
        for (let i = 0; i < circle_details["Circle_Tags"].length; i++) {
            if (i == 0) {
                related_tags_of_circle = circle_details["Circle_Tags"][i] + ",";
            }
            else {
                related_tags_of_circle += circle_details["Circle_Tags"][i] + ",";
            }
        }
        $(related_tags).val(related_tags_of_circle);


        let related_circles = document.createElement("input");
        $(related_circles).addClass("w-full h-10 rounded-md bg-gray-900 text-white mb-2 outline-none border-b-2 border-gray-700 p-2");
        $(related_circles).attr("placeholder", "Related Circles");
        $(related_circles).attr("name", "Related_Circles");
        let related_circles_of_circle;
        for (let i = 0; i < circle_details["Related_Circles"].length; i++) {
            if (i == 0) {
                related_circles_of_circle = circle_details["Related_Circles"][i] + ",";
            }
            else {
                related_circles_of_circle += circle_details["Related_Circles"][i] + ",";
            }
        }
        $(related_circles).val(related_circles_of_circle);

        let submitbutton_div = document.createElement("div");
        $(submitbutton_div).addClass("w-full text-center text-white font-semibold bg-black rounded-md mt-2 hover:bg-gray-800 cursor-pointer p-2 border-2 border-green-500 hover:border-green-600");
        // $(submitbutton_div).attr("id","submitbutton_div");
        $(submitbutton_div).text("Update");



        $(wrapper_form).append(wrapper_div_for_image);
        $(wrapper_div_for_image).append(image);
        $(wrapper_div_for_image).append(input_for_image_change);
        $(wrapper_div_for_image).append(dummy_image_input_base64);
        $(wrapper_form).append(wrapper_div_for_name_description_tags);
        $(wrapper_div_for_name_description_tags).append(name);
        $(wrapper_div_for_name_description_tags).append(description);
        $(wrapper_div_for_name_description_tags).append(related_tags);
        $(wrapper_div_for_name_description_tags).append(related_circles);
        $(wrapper_div_for_name_description_tags).append(submitbutton_div);


        $(related_tags).click(function (e) {
            e.preventDefault();
            let upper = new CardMakers().circle_options_card("/api/v1/circle/get_circle_tags/CircleTags",
                related_tags,
                "ON").then((upper) => {
                    $('#Circle_Creation_Options').empty();
                    let current_tags = new forms().split_tags_by_comma(related_tags.value);
                    for (let i = 0; i < upper.length; i++) {
                        if (current_tags.includes(upper[i].innerText)) {
                        } else {
                            $('#Circle_Creation_Options').append(upper[i]);
                        }
                    }
                });
        });

        $(related_circles).keyup(function (e) {
            e.preventDefault();
            $('#Circle_Creation_Options').empty();
            let inpuvalue = related_circles.value;
            // Split the value by comma and get the last value.
            let splitvalue = inpuvalue.split(",");
            let lastvalue = splitvalue[splitvalue.length - 1];
            let upper = new CardMakers().circle_options_card("/api/v1/circle/get_circle_tags/RelatedCircleTags?query=" + lastvalue, related_circles, "ON").then((upper) => {
                let current_tags = new forms().split_tags_by_comma(related_circles.value);
                for (let i = 0; i < upper.length; i++) {
                    if (current_tags.includes(upper[i].innerText)) {
                    } else {
                        $('#Circle_Creation_Options').append(upper[i]);
                    }
                }
            });
        });

        $(submitbutton_div).click(function (e) {
            e.preventDefault();
            let final_data = $(wrapper_form).serialize();
            let apiCall = new APICALLS().GenericAPICallv2("/api/v1/circle/update_circle_details/" + DisplayName, "POST", final_data).then((data) => {
                alert("Circle Updated");
                $('#Details').click();
            }).catch((error) => {
                alert("Circle Update Failed");

            });
        });



        return wrapper_form;
    }



}