let feed_card_favored_language = document.cookie.split(';').find(
    cookie => cookie.trim().startsWith('favoured_language='));
if (feed_card_favored_language) {
    feed_card_favored_language = feed_card_favored_language.split('=')[1];
} else {
    feed_card_favored_language = "english";
}
let feed_cards_language_dicts = {
    "telugu": {
        "Follow": "గమనించండి",
        "Unfollow": "గమనించకండి",
        "Edit": "సవరించండి",
        "Lock": "తాళం పెట్టండి",
        "Unlock": "తాళం తీసివేయండి",
        "Pin": "పైన పెట్టండి",
        "Unpin": "పైనించి తీసివేయండి",
        "options": "సూచనలు",
        "share": "లింక్ కాపీ చేయండి",
        "Report": "హెచ్చరించండి",
        "Discard Changes": "మార్పులను విస్మరించండి",
        "Update Post": "పోస్ట్ నవీకరించండి",
        "Add Reply": "జవాబును చేర్చండి",
        "Discard Reply": "జవాబును విస్మరించండి",
        "Add Comment": "వ్యాఖ్యను చేర్చండి",
        "Discard Comment": "వ్యాఖ్యను విస్మరించండి",
        "Type your comment here...": "మీ వ్యాఖ్యను ఇక్కడ టైప్ చేయండి...",
        "Type your reply here...": "మీ జవాబును ఇక్కడ టైప్ చేయండి...",
    }
}
function word_finder(word) {
    let language = feed_card_favored_language;
    if (feed_cards_language_dicts[language] && feed_cards_language_dicts[language][word]) {
        return feed_cards_language_dicts[language][word];
    } else {
        return word;
    }
}

async function meta_tag_crawler_displayer(link) {
    let wrapper_anchor = document.createElement('a');
    let wrapper_div = document.createElement('div');
    $(wrapper_anchor).attr('href', link).attr('target', '_blank').attr('data-card_type', 'meta_tag_crawler_displayer');
    $(wrapper_anchor).append(wrapper_div);
    $(wrapper_div).addClass('w-full flex flex-col justify-center overflow-y-auto items-center bg-gray-900 mt-2 dark:bg-white dark:shadow-xl dark:text-gray-900 hover:border-blue-400 cursor-pointer');
    // Create elements for the image, title, and description.
    let image_div = document.createElement('img');
    $(image_div).addClass('w-full h-auto text-white font-semibold bg-gray-500 flex flex-col max-h-56 justify-center items-center cursor-pointer hover:border-blue-400 dark:bg-white dark:text-gray-900');
    $(image_div).attr('loading', 'lazy').attr('onerror', "this.src='/static/images/nounage.png'")
    let title_div = document.createElement('div');
    $(title_div).addClass('w-full  font-bold border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 dark:bg-white dark:shadow dark:text-gray-900');
    let description_div = document.createElement('div');
    $(description_div).addClass('w-full  h-20 overflow-y-scroll hover:border-blue-600 border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none placeholder-gray-400  dark:bg-white dark:shadow dark:text-gray-900');
    let data = {
        "link": link
    }
    let top_banner_source_mention = document.createElement('div');
    $(top_banner_source_mention).addClass('w-full hover:border-blue-600 font-semibold flex flex-row justify-between items-center text-center p-1 border-t-2 border-blue-500');
    let type_mentioner = document.createElement('div');
    $(type_mentioner).addClass('ml-auto float-right mr-2 text-sm text-gray-400 dark:text-gray-900 font-normal');



    let r1 = await new APICALLS().GenericAPIJSON_CALL(
        "/api/v1/get_meta_data_of_link",
        "POST",
        JSON.stringify(data),
    ).then(function (r1) {
        let meta_data = r1;
        console.log(meta_data);
        $(top_banner_source_mention).text(meta_data['site_name']);
        $(type_mentioner).text(meta_data['type']);
        $(image_div).attr('src', meta_data['image']);
        $(title_div).text(meta_data['title']);
        meta_data['description'] = DOMPurify.sanitize(meta_data['description'], { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        $(description_div).html(meta_data['description']);
        $(wrapper_div).append(top_banner_source_mention);
        $(top_banner_source_mention).append(type_mentioner);
        $(wrapper_div).append(image_div);
        // if (meta_data["type"] == "video.other") {
        //     let video_player = document.createElement('iframe');
        //     $(video_player).attr('width', '560').attr('height', '315'); // Set the width and height as per your requirements
        //     $(video_player).attr('src', meta_data['url']);
        //     $(video_player).attr('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
        //     $(video_player).attr('allowfullscreen', 'allowfullscreen');
        //     $(video_player).addClass('w-full h-auto');
        //     $(image_div).addClass('hidden');
        //     $(wrapper_div).append(video_player);
        // }
        $(wrapper_div).append(title_div);

        $(wrapper_div).append(description_div);

        return wrapper_anchor;


    }
    ).catch(function (error) {
        return '';
    }
    );
    console.log(r1);
    return r1;




}















let unfilled_uparrow = '<svg height="21" data-arrow="Yes" viewBox="0 -960 960 960" width="26" class=""> <path fill="currentColor"  d="M320-120v-310H120l360-450 360 450H640v310H320Zm60-60h200v-310h133L480-786 247-490h133v310Zm100-310Z" /> </svg>';
let filled_uparrow = '<svg height="21" data-arrow="Yes" viewBox="0 -960 960 960" width="26"><path fill="currentColor" d="M320-120v-310H120l360-450 360 450H640v310H320Z"  /></svg>'
let downward_unfilled_arrow = '<svg height="21" data-arrow="Yes" style="transform: scaleY(-1)" viewBox="0 -960 960 960" width="26" class=""> <path fill="currentColor"  d="M320-120v-310H120l360-450 360 450H640v310H320Zm60-60h200v-310h133L480-786 247-490h133v310Zm100-310Z" /> </svg>';
let downwar_filled_arrow = '<svg height="21" data-arrow="Yes" style="transform: scaleY(-1)" viewBox="0 -960 960 960" width="26"><path fill="currentColor" d="M320-120v-310H120l360-450 360 450H640v310H320Z"  /></svg>'




class MainFeed {
    Information_board_cards(card_details) {
        function preview_properties(wrapper_div) {
            $(wrapper_div).addClass("relative");
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

        if (card_details["card_type"] == "title_card") {
            function Title_card_preview(title_card_data) {
                let wrapper_div = document.createElement("div");
                $(wrapper_div).addClass("w-full flex p-2 flex-col justify-between items-center  mt-2 bg-gray-900 border-b-2 dark:bg-white dark:shadow-xl dark:text-gray-900");
                title_card_data["card_type"] = "title_card";
                $(wrapper_div).attr("data-card_data", JSON.stringify(title_card_data));

                let title_div = document.createElement("div");
                $(title_div).addClass("w-full font-bold bg-transparent text-white text-center outline-none text-center placeholder-gray-400 hover:placeholder-gray-300 dark:bg-white dark:shadow-xl");

                $(title_div).text(title_card_data["card_title"]);

                $(wrapper_div).css("border-color", title_card_data["card_color"]);
                $(wrapper_div).append(title_div);

                if (card_details["preview"] == "Yes") {
                    preview_properties(wrapper_div);
                }

                return wrapper_div;
            }
            return Title_card_preview(card_details);
        }
        else if (card_details["card_type"] == "profile_card") {
            function profile_card_preview(profile_card_data) {
                // This is a function creates the profile preview card which goes inside 'information_board_Card_column'.

                let wrapper_div = document.createElement("div");
                $(wrapper_div).addClass("w-full flex rounded-md flex-col justify-between items-center cursor-pointer mt-2 bg-gray-900 border-2 dark:bg-white dark:shadow-xl dark:text-gray-900");
                profile_card_data["card_type"] = "profile_card";
                $(wrapper_div).attr("data-card_data", JSON.stringify(profile_card_data));



                let image_div = document.createElement("img");
                $(image_div).addClass("w-full h-52 text-white font-semibold bg-gray-500 flex flex-col justify-center items-center cursor-pointer hover:border-blue-400 mt-2 dark:bg-white dark:text-gray-900");
                $(image_div).attr("src", profile_card_data["card_image"]);
                // $(image_div).css("background-size", "cover");
                // $(image_div).css("background-position", "center");
                $(image_div).attr('loading', 'lazy')


                let title_div = document.createElement("div");
                $(title_div).addClass("w-full  font-bold border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none p-2 placeholder-gray-400 hover:placeholder-gray-300 dark:bg-white dark:shadow dark:text-gray-900");
                $(title_div).text(profile_card_data["card_title"]);

                let description_div = document.createElement("div");
                $(description_div).addClass("w-full  h-20 overflow-y-scroll border-b-2 border-blue-500 bg-transparent mt-2 text-white text-center outline-none placeholder-gray-400 hover:placeholder-gray-300 dark:bg-white dark:shadow dark:text-gray-900");
                $(description_div).text(profile_card_data["card_description"]);

                let stars_div = document.createElement("div");
                $(stars_div).addClass("w-full flex flex-row justify-between items-center text-yellow-400 text-center p-1 dark:bg-white dark:shadow dark:text-gray-900");
                $(stars_div).text("Stars ★ : " + profile_card_data["card_rating"]);

                if (profile_card_data["card_image"] == "" || profile_card_data["card_image"] == undefined) {
                    $(image_div).addClass("hidden");
                    $(description_div).toggleClass("h-20 h-auto");
                    $(description_div).addClass('p-2')
                }

                let post_details = {
                    "Supports": "25",
                    "Rejects": "10",
                    "Supported": "Yes",
                    "Rejected": "No"
                }
                if (profile_card_data["support_reject_buttons"] == "on") {
                    post_details["Supports"] = profile_card_data["support_count"];
                    post_details["Rejects"] = profile_card_data["reject_count"];
                    if (profile_card_data["user_support_reject_status"] == "support") {
                        post_details["Supported"] = "Yes";
                        post_details["Rejected"] = "No";
                    } else if (profile_card_data["user_support_reject_status"] == "reject") {
                        post_details["Supported"] = "No";
                        post_details["Rejected"] = "Yes";
                    } else {
                        post_details["Supported"] = "No";
                        post_details["Rejected"] = "No";
                    }
                }
                let support_reject_option_wrapper = document.createElement("div");
                $(support_reject_option_wrapper).addClass("w-full flex flex-row justify-center items-center text-center p-1 border-t-2 border-blue-500");

                let support_text = post_details["Supports"] + ' | ';
                let reject_text = post_details["Rejects"] + ' | ';
                let cancel_text = " 🛇 ";

                let Support_span_addon = new AddOns().GenericButton_Addon('text-base flex flex-row text-center text-green-500 bg-black dark:bg-white p-2 rounded font-semibold cursor-pointer cursor-pointer hover:text-green-600', support_text);
                $(Support_span_addon).append(unfilled_uparrow);
                $(support_reject_option_wrapper).append(Support_span_addon);
                $(Support_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";');
                let reject_span_addon = new AddOns().GenericButton_Addon('text-base flex flex-row text-center text-red-500 bg-black dark:bg-white p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-red-600', reject_text);
                $(reject_span_addon).append(downward_unfilled_arrow);
                $(support_reject_option_wrapper).append(reject_span_addon);
                $(reject_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";');
                let cancel_span_addon = new AddOns().GenericButton_Addon('text-base text-gray-500 bg-black dark:bg-white p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-gray-600', cancel_text);
                $(support_reject_option_wrapper).append(cancel_span_addon);
                $(cancel_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";');

                if (profile_card_data["support_reject_buttons"] == "on") {
                    $(Support_span_addon).attr('data-count', profile_card_data["support_count"])
                    $(reject_span_addon).attr('data-count', profile_card_data["reject_count"])
                    if (profile_card_data["user_support_reject_status"] == "support") {
                        $(Support_span_addon).attr('data-user_support', "Yes")
                        $(reject_span_addon).attr('data-user_reject', "No")
                    } else if (profile_card_data["user_support_reject_status"] == "reject") {
                        $(Support_span_addon).attr('data-user_support', "No")
                        $(reject_span_addon).attr('data-user_reject', "Yes")
                    } else {
                        $(Support_span_addon).attr('data-user_support', "No")
                        $(reject_span_addon).attr('data-user_reject', "No")
                    }
                }



                if (post_details['Rejected'] == "Yes") {
                    $(reject_span_addon).addClass('border-2 border-red-500');
                    // Find data-arrow in the reject_span_addon and replace it with downward_filled_arrow.
                    $(reject_span_addon).find('[data-arrow="Yes"]').replaceWith(downwar_filled_arrow)

                }
                if (post_details['Supported'] == "Yes") {
                    $(Support_span_addon).addClass('border-2 border-green-500');
                    // Find data-arrow in the support_span_addon and replace it with filled_uparrow.
                    $(Support_span_addon).find('[data-arrow="Yes"]').replaceWith(filled_uparrow)
                }

                $(Support_span_addon).click(function () {
                    let action_url = "/api/v1/circle/" + card_details["circle"] + "/support_reject_info_card";
                    action_url = action_url + "?action=support";
                    action_url = action_url + "&post_id=" + profile_card_data["sid"];
                    action_url = action_url + "&post_type=" + profile_card_data["card_type"];
                    let caller = new gen_post_calls_feedcards().toggle_support_rejection_info_card(
                        "support",
                        Support_span_addon,
                        reject_span_addon,
                        action_url
                    )
                });
                $(reject_span_addon).click(function () {
                    let action_url = "/api/v1/circle/" + card_details["circle"] + "/support_reject_info_card";
                    action_url = action_url + "?action=reject";
                    action_url = action_url + "&post_id=" + profile_card_data["sid"];
                    action_url = action_url + "&post_type=" + profile_card_data["card_type"];
                    let caller = new gen_post_calls_feedcards().toggle_support_rejection_info_card(
                        "reject",
                        Support_span_addon,
                        reject_span_addon,
                        action_url
                    )
                });
                $(cancel_span_addon).click(function () {
                    let action_url = "/api/v1/circle/" + card_details["circle"] + "/support_reject_info_card";
                    action_url = action_url + "?action=nullify";
                    action_url = action_url + "&post_id=" + profile_card_data["sid"];
                    action_url = action_url + "&post_type=" + profile_card_data["card_type"];
                    let caller = new gen_post_calls_feedcards().toggle_support_rejection_info_card(
                        "nullify",
                        Support_span_addon,
                        reject_span_addon,
                        action_url
                    )
                });





                $(wrapper_div).css("border-color", profile_card_data["card_color"]);
                let card_url_a = document.createElement("a");
                $(card_url_a).addClass("w-full flex flex-col");
                $(card_url_a).append(image_div);
                $(card_url_a).append(title_div);
                $(wrapper_div).append(card_url_a);
                $(wrapper_div).append(description_div);
                // $(wrapper_div).append(stars_div);
                if (profile_card_data["support_reject_buttons"] == "on") {
                    $(wrapper_div).append(support_reject_option_wrapper);
                }
                if (card_details["preview"] == "Yes") {
                    wrapper_div = preview_properties(wrapper_div);
                }
                if (card_details["preview"] != "Yes" && (profile_card_data["card_link"] != "" || profile_card_data["card_link"] != undefined)) {
                    $(card_url_a).attr("href", profile_card_data["card_link"]);
                    // $(card_url_a).append(wrapper_div);
                    return wrapper_div;
                } else {
                    return wrapper_div;
                }
            }
            return profile_card_preview(card_details);
        }
    }

    home_post_feed_card(post_details) {
        if (post_details['type2'] == "SURVEY") {
            return this.generic_post_survey_card(post_details);
        }
        let wrapperdiv = document.createElement('div');
        let layer1_user_details = new Bars().GenericBar('flex relative flex-row w-full p-1 pr-2 text-center text-sm bg-gray-900 pl-2 md:text-base outline-none text-gray-200 dark:bg-white dark:shadow dark:text-gray-900');
        let layer2_post_title_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-base text-gray-200 md:text-base border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer3_post_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-gray-200 text-sm border-t-0 md:text-base border-gray-700 dark:bg-white dark:text-gray-900');
        let layer4_post_footer = new Bars().GenericBar('w-full bg-gray-900  p-2 pl-1 outline-none text-gray-200 border-t-0 text-sm md:text-base border-gray-700 overflow-y-auto flex flex-row dark:bg-white dark:shadow-xl dark:text-gray-900');
        let layer5_post_attachments = new Bars().GenericBar('w-full bg-gray-900 p-0 pb-2 pl-0 flex flex-row border-t-0 border-gray-70 dark:bg-white dark:text-gray-900');

        let name_addon = new AddOns().GenericSpan_Addon('text-xs  whitespace-nowrap md:text-base text-yellow-500 font-semibold cursor-pointer', post_details['CreatorName']);
        $(name_addon).attr('data-userID', post_details['creatorID']);
        let symbol_addon = new AddOns().GenericSpan_Addon('text-xs ml-1 whitespace-nowrap md:text-base text-yellow-500 font-semibold cursor-pointer', post_details['Creator_Symbol']);
        $(symbol_addon).attr('title', post_details['Creator_Role']);


        let time_addon = new AddOns().GenericSpan_Addon('text-xs  md:text-base md:block text-gray-500 font-semibold ml-2', post_details['time_difference']);

        let image_counter_addon;
        if (parseInt(post_details['NumberOfImages']) > 0) {
            image_counter_addon = new AddOns().GenericSpan_Addon(' whitespace-nowrap text-gray-500 font-semibold ml-2', '🖼 ' + post_details['NumberOfImages']);
        }
        let pdf_counter_addon;
        if (parseInt(post_details['NumberOfPDFs']) > 0) {
            pdf_counter_addon = new AddOns().GenericSpan_Addon(' whitespace-nowrap text-gray-500 font-semibold ml-2', '📄 ' + post_details['NumberOfPDFs']);
        }



        let number_of_comments_addon;
        if (parseInt(post_details['numberofcomments']) > 0) {
            number_of_comments_addon = new AddOns().GenericSpan_Addon(' whitespace-nowrap text-gray-500 font-semibold ml-2', '💬 ' + post_details['numberofcomments']);
            $(number_of_comments_addon).attr('title', 'Number of comments on this post')
        }

        let follow_span_addon;

        if (post_details["Following"] == "Yes") {
            follow_span_addon = new AddOns().GenericSpan_Addon('text-xs md:text-base ml-auto whitespace-nowrap text-red-500 font-semibold md:ml-auto float-right cursor-pointer cursor-pointer hover:text-red-600', word_finder('Unfollow') + ' -');
            $(follow_span_addon).attr('follow_status', 'Yes')
        } else {
            follow_span_addon = new AddOns().GenericSpan_Addon('text-xs md:text-base ml-auto whitespace-nowrap text-blue-500 font-semibold md:ml-auto float-right cursor-pointer cursor-pointer hover:text-blue-600', word_finder('Follow') + ' +');
            $(follow_span_addon).attr('follow_status', 'No')
        }

        if (post_details["isPinned"] == "Yes") {
            $(wrapperdiv).addClass('border-2 border-yellow-500 dark:bg-white dark:shadow-xl dark:shadow-xl dark:text-gray-900 hover:border-yellow-600');
            $(wrapperdiv).attr('title', 'This post is pinned');
        }

        $(layer1_user_details).append(name_addon);
        $(layer1_user_details).append(symbol_addon);
        $(layer1_user_details).append(time_addon);
        $(layer1_user_details).append(image_counter_addon);
        $(layer1_user_details).append(pdf_counter_addon);
        $(layer1_user_details).append(number_of_comments_addon);
        $(layer1_user_details).append(follow_span_addon);

        let title_addon = new AddOns().GenericSpan_Addon('text-white font-semibold cursor-pointer dark:text-black dark:font-semibold', post_details['title']);
        $(layer2_post_title_details).append(title_addon);

        let post_addon = new AddOns().GenericDiv_Addon('text-gray-200 text-base overflow-y-auto cursor-pointer max-h-32 dark:text-black', post_details['html_content']);
        $(layer3_post_details).append(post_addon);
        let filter_box = $('#Filter_Box')
        for (let i = 0; i < post_details['flair_tags'].length; i++) {
            let flair_addon = new AddOns().GenericSpan_Addon('text-blue-500 rounded-lg font-semibold p-1 dark:bg-white dark:shadow-xl bg-gray-800 mr-2 whitespace-nowrap cursor-pointer hover:bg-black dark:hover:bg-gray-100', post_details['flair_tags'][i]);
            $(layer4_post_footer).append(flair_addon);
            // Find the flair in filter_box and if user clicks on flair_addon, then click the flair in filter_box.
            $(flair_addon).click(function (e) {
                e.preventDefault();
                $(filter_box).find('[data-Filter_value="' + post_details['flair_tags'][i] + '"]').click();
            });

        }

        let len_of_image_attachments = post_details['attachment_store']['images'].length;
        let len_of_pdf_attachments = post_details['attachment_store']['pdfs'].length;
        let final_image_array = []
        for (let i = 0; i < len_of_pdf_attachments; i++) {
            let pdfs_addon = new AddOns().pdfDiv_Addon_from_GTEditor('PDF_Attachment', post_details['attachment_store']['pdfs'][i], 'p-2 h-24 w-24 cursor-pointer');
            $(layer5_post_attachments).append(pdfs_addon);
        }
        for (let i = 0; i < len_of_image_attachments; i++) {
            let image_addon = new AddOns().ImageDiv_Addon_from_GTEditor('Image_Attachment', post_details['attachment_store']['images'][i], 'p-2');
            final_image_array.push(image_addon)
        }
        let image_carosel = new AddOns().Carosel_for_Images_div_Addon('max-h-28 w-full dark:bg-white overflow-y-clip bg-gray-900 p-0 pl-2 flex flex-row border-t-0 border-gray-700 items-center text-center justify-center', final_image_array);
        $(layer5_post_attachments).append(image_carosel);

        // if (len_of_pdf_attachments == 0) {
        //     $(image_carosel).toggleClass('w-full')
        // }

        $(wrapperdiv).addClass('w-full h-auto bg-gray-900 outline-none text-gray-200 mt-2 max-h-96 dark:bg-white dark:shadow-xl dark:text-gray-900 hover:border-gray-600 border border-transparent');
        $(wrapperdiv).append(layer1_user_details);
        $(wrapperdiv).append(layer2_post_title_details);
        $(wrapperdiv).append(layer3_post_details);

        $(wrapperdiv).append(layer5_post_attachments);
        $(wrapperdiv).append(layer4_post_footer);

        $(wrapperdiv).click(function (e) {
            // Remove all height limits on the post.
            $(wrapperdiv).removeClass('max-h-96');
            $(post_addon).removeClass('max-h-32');
            $(image_carosel).removeClass('max-h-28');
        });
        // On click on layer 5 if not on carosel, then click the post_addon.
        // $(layer5_post_attachments).click(function (e) {
        //     if (e.target != image_carosel) {
        //         $(post_addon).click();
        //     }
        // });


        //         0          1              2               3           4    
        return [wrapperdiv, name_addon, follow_span_addon, title_addon, post_addon];
    }

    generic_feed_loading_card() {
        // A card to show when the feed is loading.
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('w-full h-auto bg-gray-900 outline-none text-gray-200 mt-2 h-96 dark:bg-white dark:shadow-xl dark:text-gray-900');
        let layer1_user_details = new Bars().GenericBar('flex flex-row w-full p-1 pr-2 text-center text-sm bg-gray-900 pl-2 md:text-base outline-none text-gray-200 dark:bg-white dark:shadow dark:text-gray-900');
        let layer2_post_title_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-base text-gray-200 md:text-base border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer3_post_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-gray-200 text-sm border-t-0 md:text-base border-gray-700 dark:bg-white dark:text-gray-900');

        function gray_line() {
            let gray_line = document.createElement('div');
            $(gray_line).addClass('w-full bg-gray-700 h-2 animate-pulse dark:bg-gray-200 dark:shadow-xl');
            return gray_line;
        }
        $(layer1_user_details).append(gray_line());
        $(layer2_post_title_details).append(gray_line());
        $(layer3_post_details).append(gray_line());

        $(wrapperdiv).append(layer1_user_details);
        $(wrapperdiv).append(layer2_post_title_details);
        $(wrapperdiv).append(layer3_post_details);
        return wrapperdiv;
    }

    generic_post_survey_card(post_details) {
        let wrapperdiv = document.createElement('div');
        let layer1_user_details = new Bars().GenericBar('flex flex-row w-full p-1 pr-2 text-center text-sm bg-gray-900 pl-2 md:text-base outline-none text-gray-200 dark:bg-white dark:shadow dark:text-gray-900');
        let layer2_post_title_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-base text-gray-200 md:text-base border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer3_survey_options = new Bars().GenericBar('w-full bg-gray-900 flex flex-col p-2 pl-2 outline-none text-gray-200 text-sm border-t-0 md:text-base border-gray-700 dark:bg-white dark:text-gray-900');
        let layer3_5_survey_stats = new Bars().GenericBar('w-full bg-gray-900 flex flex-row p-2 pl-2 outline-none text-gray-200 text-sm border-t-0 md:text-base border-gray-700 dark:bg-white dark:text-gray-900');
        let layer4_post_footer = new Bars().GenericBar('w-full bg-gray-900  p-2 pl-1 outline-none text-gray-200 border-t-0 text-sm md:text-base border-gray-700 overflow-y-auto flex flex-row dark:bg-white dark:shadow-xl dark:text-gray-900');
        // let layer5_post_attachments = new Bars().GenericBar('w-full bg-gray-900 p-0 pl-0 flex flex-row border-t-0 border-gray-70');

        let name_addon = new AddOns().GenericSpan_Addon('text-xs  whitespace-nowrap md:text-base text-yellow-500 font-semibold cursor-pointer', post_details['CreatorName']);
        $(name_addon).attr('data-userID', post_details['creatorID']);
        let symbol_addon = new AddOns().GenericSpan_Addon('text-xs ml-1 whitespace-nowrap md:text-base text-yellow-500 font-semibold cursor-pointer', post_details['Creator_Symbol']);
        $(symbol_addon).attr('title', post_details['Creator_Role']);

        let time_addon = new AddOns().GenericSpan_Addon('text-xs  md:text-base md:block text-gray-500 font-semibold ml-2', post_details['time_difference']);


        let number_of_comments_addon;
        if (parseInt(post_details['numberofcomments']) > 0) {
            number_of_comments_addon = new AddOns().GenericSpan_Addon(' whitespace-nowrap text-gray-500 font-semibold ml-2', '💬 ' + post_details['numberofcomments']);
            $(number_of_comments_addon).attr('title', 'Number of comments on this post')
        }

        let follow_span_addon;

        if (post_details["Following"] == "Yes") {
            follow_span_addon = new AddOns().GenericSpan_Addon('text-xs md:text-base ml-auto whitespace-nowrap text-red-500 font-semibold md:ml-auto float-right cursor-pointer cursor-pointer hover:text-red-600', word_finder('Unfollow') + ' -');
            $(follow_span_addon).attr('follow_status', 'Yes')
        } else {
            follow_span_addon = new AddOns().GenericSpan_Addon('text-xs md:text-base ml-auto whitespace-nowrap text-blue-500 font-semibold md:ml-auto float-right cursor-pointer cursor-pointer hover:text-blue-600', word_finder('Follow') + ' +');
            $(follow_span_addon).attr('follow_status', 'No')
        }

        $(layer1_user_details).append(name_addon);
        $(layer1_user_details).append(symbol_addon);
        $(layer1_user_details).append(time_addon);
        $(layer1_user_details).append(number_of_comments_addon);
        $(layer1_user_details).append(follow_span_addon);

        let title_addon = new AddOns().GenericSpan_Addon('text-white font-semibold pointer-events-none dark:text-black', post_details['title']);
        $(layer2_post_title_details).append(title_addon);
        let dummy_title_addon = new AddOns().GenericSpan_Addon('text-white font-semibold pointer-events-none dark:text-black', post_details['title']);

        let optionsarray_length = post_details['options'].length;
        for (let i = 0; i < optionsarray_length; i++) {
            let option_addon = new AddOns().GenericSpan_Addon(
                'relative text-white font-semibold cursor-pointer p-2 bg-gray-700 mr-2 mt-2 hover:bg-gray-800 dark:bg-white dark:shadow-xl dark:text-gray-900 dark:hover:bg-gray-200',
                post_details['options'][i]
            );
            $(option_addon).attr('data-option_details', post_details['options'][i]);
            $(layer3_survey_options).append(option_addon);
            $(option_addon).click(function (e) {
                let caller = new gen_post_calls_feedcards().vote_in_a_survey(
                    post_details['sid'],
                    post_details['circle'],
                    $(this).attr('data-option_details'),
                ).then((survey_data) => {
                    //   Now find the appropriate option_details from layer 3 and add the vote count to it. survey_data["survey_stats"] has keys with data-option_details and values in percentage.
                    console.log(survey_data);
                    let returned_data_len = Object.keys(survey_data["survey_stats"]).length;
                    // Find the highest and add green border to it.
                    let highest_percentage = 0;
                    // Clear all divs with bg_background_for_surveys class in this wrapper.
                    $(layer3_survey_options).find('.bg_background_for_surveys').remove();
                    for (let k = 0; k < returned_data_len; k++) {
                        let option_details = Object.keys(survey_data["survey_stats"])[k];
                        let option_percentage = survey_data["survey_stats"][option_details];
                        let option_addon = $('[data-option_details="' + option_details + '"]');
                        let pure_percentage_span = $('<span>' + survey_data["survey_stats"][option_details] + '%</span>')
                        $(pure_percentage_span).addClass('text-xs md:text-base text-green-500 font-semibold ml-auto float-right')
                        $(pure_percentage_span).attr('title', 'Percentage of votes for this option')
                        $(pure_percentage_span).attr('data-vote_percentage_span', option_percentage);
                        // Clear any previous pure_percentage_span and add the new one.
                        $(option_addon).find('[data-vote_percentage_span]').remove();
                        $(option_addon).append(pure_percentage_span);
                        // Add graded background color to that percentage and add the number of votes to it. Which is at survey_data["survey_stats_absolute_numbers"][option_details]
                        $(option_addon).attr('title', 'Number of votes for this option - ' + survey_data["survey_stats_absolute_numbers"][option_details])
                        $(option_addon).attr('data-vote_count', survey_data["survey_stats_absolute_numbers"][option_details])
                        let bg_bacground_color_div = $('<div></div>');
                        $(bg_bacground_color_div).addClass('bg_background_for_surveys absolute top-0 left-0 h-full bg-green-500 opacity-25 z-0 dark:opacity-25 pt-3 text-center dark:text-black');
                        $(bg_bacground_color_div).css('width', option_percentage + '%');
                        $(bg_bacground_color_div).attr('title', 'Number of votes for this option - ' + survey_data["survey_stats_absolute_numbers"][option_details])
                        $(option_addon).append(bg_bacground_color_div);
                        // $(option_addon).text(option_details + ' - ' + option_percentage + '%');
                        $(option_addon).attr('data-vote_percentage', option_percentage);
                        if (option_percentage > highest_percentage) {
                            highest_percentage = option_percentage;
                        }
                        $(option_addon).removeClass('bg-gray-700')
                        $(option_addon).addClass('bg-black')

                        // $(option_addon).toggleClass('hover:bg-gray-800 hover:bg-gray-700')
                    }
                    for (let k = 0; k < returned_data_len; k++) {
                        let option_details = Object.keys(survey_data["survey_stats"])[k];
                        let option_percentage = survey_data["survey_stats"][option_details];
                        let option_addon = $('[data-option_details="' + option_details + '"]');
                        if (option_percentage == highest_percentage) {
                            $(option_addon).addClass('border-2 border-green-500');
                        } else {
                            $(option_addon).removeClass('border-2 border-green-500');
                        }
                    }
                    // $(layer3_5_survey_stats).empty();
                    $(layer3_5_survey_stats).text('Total votes - ' + survey_data["total_votes"]);
                    // alert('Your vote has been recorded.');
                });
            });
        }
        if (post_details["voted"] != "No") {
            // Find the option in layer 3 and click it.
            let voted_option_addon = $(layer3_survey_options).find('[data-option_details="' + post_details["voted"] + '"]')
            $(voted_option_addon).click();
        }



        // post_details["flair_tags"] = ["Survey"]
        let tagsarray_length = post_details['flair_tags'].length;
        for (let i = 0; i < tagsarray_length; i++) {
            let flair_addon = new AddOns().GenericSpan_Addon('text-blue-500 rounded-lg font-semibold p-1 bg-gray-800 mr-2 whitespace-nowrap dark:bg-white dark:shadow-lg', post_details['flair_tags'][i]);
            $(layer4_post_footer).append(flair_addon);
        }

        $(wrapperdiv).addClass('w-full h-auto bg-gray-900 outline-none text-gray-200 mt-2 dark:bg-white dark:shadow-xl dark:text-gray-900');
        $(wrapperdiv).append(layer1_user_details);
        $(wrapperdiv).append(layer2_post_title_details);
        $(wrapperdiv).append(layer3_survey_options);
        $(wrapperdiv).append(layer3_5_survey_stats);
        $(wrapperdiv).append(layer4_post_footer);

        // return [wrapperdiv, name_addon, follow_span_addon, dummy_title_addon];
        //          0           1             2                 3               4                 5                        6                      7                      8
        return [wrapperdiv, name_addon, follow_span_addon, title_addon, dummy_title_addon, layer1_user_details, layer2_post_title_details, layer3_survey_options, layer4_post_footer];
    }


    single_post_feed_card(post_details) {

        let wrapperdiv = document.createElement('div');
        let layer1_user_details = new Bars().GenericBar('flex flex-row w-full p-1 pr-2 text-center bg-gray-900 pl-2 outline-none text-gray-200 dark:bg-white dark:shadow dark:text-gray-900');
        let layer2_post_title_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-gray-200 border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer3_post_details = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-gray-200 border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer4_post_attachments = new Bars().GenericBar('w-full bg-gray-900 p-0 pl-0 flex flex-row border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer5_post_footer = new Bars().GenericBar('w-full bg-gray-900  p-2  pl-1 outline-none text-gray-200 border-t-0 border-gray-700 dark:bg-white dark:shadow-xl dark:text-gray-900');
        let layer6_post_actions = new Bars().GenericBar('w-full bg-gray-900 flex flex-row p-2 pl-1 outline-none text-gray-200 border-t-0 border-gray-700 dark:bg-white dark:shadow-xl dark:text-gray-900');

        let name_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base text-yellow-500 font-semibold cursor-pointer', post_details['CreatorName']);
        $(name_addon).attr('data-userID', post_details['creatorID']);
        let role_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base text-yellow-500 font-semibold cursor-pointer', post_details['Creator_Symbol']);
        $(role_addon).attr('title', post_details['Creator_Role']);
        let time_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base text-gray-500 font-semibold ml-2', post_details['time_difference']);


        let image_counter_addon;
        if (parseInt(post_details['NumberOfImages']) > 0) {
            image_counter_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base whitespace-nowrap text-gray-500 font-semibold ml-2', '🖼 ' + post_details['NumberOfImages']);
        }
        let pdf_counter_addon;
        if (parseInt(post_details['NumberOfPDFs']) > 0) {
            pdf_counter_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base whitespace-nowrap text-gray-500 font-semibold ml-2', '📄' + post_details['NumberOfPDFs']);
        }

        let number_of_comments_addon;
        if (parseInt(post_details['numberofcomments']) > 0) {
            number_of_comments_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base whitespace-nowrap text-gray-500 font-semibold ml-2', '💬 ' + post_details['numberofcomments']);
            $(number_of_comments_addon).attr('title', 'Number of comments on this post')
        }


        let follow_span_addon;

        if (post_details["Following"] == "Yes") {
            follow_span_addon = new AddOns().GenericSpan_Addon('border-b border-gray-500 p-1 text-start text-xs md:text-base whitespace-nowrap text-red-500 font-semibold cursor-pointer cursor-pointer hover:text-red-600', word_finder('Unfollow') + ' -');
            $(follow_span_addon).attr('follow_status', 'Yes')
        } else {
            follow_span_addon = new AddOns().GenericSpan_Addon('border-b border-gray-500 p-1 text-start text-xs md:text-base whitespace-nowrap text-blue-500 font-semibold cursor-pointer cursor-pointer hover:text-blue-600', word_finder('Follow') + '+');
            $(follow_span_addon).attr('follow_status', 'No')
        }

        let pin_post_span_addon = new AddOns().GenericSpan_Addon('text-yellow-500 text-xs md:text-base rounded p-1  border-b border-gray-500 w-full text-start font-semibold cursor-pointer cursor-pointer hover:text-yellow-600', word_finder('Pin') + ' 📌');
        let edit_span_addon;
        let delete_span_addon;
        let report_span_addon;

        if (post_details["isClosed"] == "Yes") {
            $(wrapperdiv).addClass('border-2 border-red-500')
            $(wrapperdiv).attr('title', 'This post is closed');
        }
        $(layer1_user_details).append(name_addon);
        $(layer1_user_details).append(role_addon);
        $(layer1_user_details).append(time_addon);
        $(layer1_user_details).append(image_counter_addon);
        $(layer1_user_details).append(pdf_counter_addon);
        $(layer1_user_details).append(number_of_comments_addon);

        if (post_details["Self"] == "Yes" && post_details["isClosed"] == "No") {
            edit_span_addon = new AddOns().GenericSpan_Addon('text-green-500 text-xs md:text-base font-semibold p-1 border-b border-gray-500 w-full text-start cursor-pointer cursor-pointer hover:text-green-600',
                word_finder('Edit'));
            if (post_details["isClosed"] == "No") {
                delete_span_addon = new AddOns().GenericSpan_Addon('text-red-500 text-xs md:text-base text-start p-1 font-semibold border-b border-gray-500 w-full cursor-pointer cursor-pointer hover:text-red-600',
                    word_finder('Lock'));
            }
        } else if (post_details["isClosed"] == "No") {
            report_span_addon = new AddOns().GenericSpan_Addon('text-red-500 text-xs md:text-base font-semibold p-1 text-start border-b border-gray-500 w-full cursor-pointer cursor-pointer hover:text-red-600',
                word_finder('Report'));
            $(layer1_user_details).append(report_span_addon);
        }
        // $(layer1_user_details).append(pin_post_span_addon);
        let options_generic_layer1_addon = new AddOns().DropDown_Elemental_Addon(
            'text-gray-400 font-semibold ml-auto float-right relative cursor-pointer hover:text-gray-500',
            word_finder('options') + ' ▼',
            [edit_span_addon, follow_span_addon, delete_span_addon, report_span_addon, pin_post_span_addon],
            "w-40 bg-gray-900 text-gray-200 rounded-lg shadow-lg text-sm font-semibold cursor-pointer hover:text-yellow-500 dark:bg-white dark:shadow-xl dark:text-gray-900"
        )
        if (post_details["isPinned"] == "Yes") {
            $(wrapperdiv).addClass('border-2 border-yellow-500')
            $(wrapperdiv).attr('title', 'This post is pinned');
            $(pin_post_span_addon).text(word_finder('Unpin') + ' 📌');
        }
        $(layer1_user_details).append(options_generic_layer1_addon);




        let title_addon = new AddOns().GenericSpan_Addon('text-white font-semibold cursor-pointer dark:text-black', post_details['title']);
        $(layer2_post_title_details).append(title_addon);

        let post_addon = new AddOns().GenericDiv_Addon('text-gray-200 text-base overflow-clip cursor-pointer dark:text-black', post_details['html_content']);
        $(layer3_post_details).append(post_addon);

        for (let i = 0; i < post_details['flair_tags'].length; i++) {
            let flair_addon = new AddOns().GenericSpan_Addon('text-blue-500 mt-1 rounded-lg font-semibold p-2 bg-black mr-2 dark:bg-white dark:shadow-lg', post_details['flair_tags'][i]);
            $(layer5_post_footer).append(flair_addon);
        }

        let len_of_image_attachments = post_details['attachment_store']['images'].length;
        let final_image_array = []
        for (let i = 0; i < len_of_image_attachments; i++) {
            let image_addon = new AddOns().ImageDiv_Addon_from_GTEditor('Image_Attachment', post_details['attachment_store']['images'][i], 'p-2');
            final_image_array.push(image_addon)
        }
        let image_carosel = new AddOns().Carosel_for_Images_div_Addon('w-full justify-center items-center text-center bg-gray-900 p-0 pl-2 flex flex-row border-t-0 border-gray-700 dark:bg-white', final_image_array);
        $(layer4_post_attachments).append(image_carosel);
        let len_of_pdf_attachments = post_details['attachment_store']['pdfs'].length;
        // if (len_of_pdf_attachments == 0) {
        //     $(image_carosel).toggleClass('w-10/12 w-full')
        // }
        for (let i = 0; i < len_of_pdf_attachments; i++) {
            let pdfs_addon = new AddOns().pdfDiv_Addon_from_GTEditor('PDF_Attachment', post_details['attachment_store']['pdfs'][i], 'p-2 h-24 w-24 cursor-pointer');
            $(layer4_post_attachments).append(pdfs_addon);
        }
        let support_text = post_details["Supports"] + ' | ';
        let reject_text = post_details["Rejects"] + ' | ';

        let Support_span_addon = new AddOns().GenericButton_Addon('text-xs flex flex-row text-center md:text-sm text-green-500 bg-black p-2 rounded font-semibold cursor-pointer cursor-pointer hover:text-green-600 dark:bg-white dark:shadow-lg', support_text);
        $(layer6_post_actions).append(Support_span_addon);
        $(Support_span_addon).append(unfilled_uparrow)
        $(Support_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";');
        let reject_span_addon = new AddOns().GenericButton_Addon('text-xs flex flex-row text-center md:text-sm text-red-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-red-600 dark:bg-white dark:shadow-lg', reject_text);
        $(layer6_post_actions).append(reject_span_addon);
        $(reject_span_addon).append(downward_unfilled_arrow)
        $(reject_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";');
        $(Support_span_addon).attr('data-count', post_details['Supports']);
        $(Support_span_addon).attr('data-user_support', post_details['Supported']);
        $(reject_span_addon).attr('data-count', post_details['Rejects']);
        $(reject_span_addon).attr('data-user_reject', post_details['Rejected']);

        if (post_details['Rejected'] == "Yes") {
            $(reject_span_addon).addClass('border-2 border-red-500');
            $(reject_span_addon).find('[data-arrow="Yes"]').replaceWith(downwar_filled_arrow)
        }
        if (post_details['Supported'] == "Yes") {
            $(Support_span_addon).addClass('border-2 border-green-500');
            $(Support_span_addon).find('[data-arrow="Yes"]').replaceWith(filled_uparrow)
        }








        let share_span_addon = new AddOns().GenericSpan_Addon('text-yellow-500 bg-black p-2 rounded font-semibold ml-auto float-right  cursor-pointer cursor-pointer hover:text-yellow-600 dark:bg-white dark:shadow-lg dark:text-black dark:hover:font-bold', word_finder('share') + ' 🔗')
        $(layer6_post_actions).append(share_span_addon);
        $(share_span_addon).click(function (e) {
            let message = "Successfully copied the link to clipboard";
            let url = window.location.href;
            // Copy the url to clipboard
            navigator.clipboard.writeText(url).then(function () {
                // alert(message || 'Async: Copying to clipboard was successful!');
                let floater = new floating_notifications().bottom_bar_notification(message, 'animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000);
                $('body').append(floater);
            })
        });





        $(wrapperdiv).append(layer1_user_details);
        $(wrapperdiv).append(layer2_post_title_details);
        $(wrapperdiv).append(layer3_post_details);
        $(wrapperdiv).append(layer4_post_attachments);
        $(wrapperdiv).append(layer5_post_footer);
        $(wrapperdiv).append(layer6_post_actions);

        $(wrapperdiv).addClass('w-full bg-gray-900 rounded-lg shadow-lg mb-2');
        $(wrapperdiv).attr('data-postID', post_details['postID']);

        let survey_style_card;
        if (post_details['type2'] == "SURVEY") {
            survey_style_card = this.generic_post_survey_card(post_details);
            console.log(survey_style_card);
            // Replace layer3 with layer3_survey_options
            $(layer3_post_details).replaceWith(survey_style_card[7]);
        }



        //            0              1                 2                  3                  4                  5             6              7                  8                9
        return [wrapperdiv, Support_span_addon, reject_span_addon, edit_span_addon, delete_span_addon, report_span_addon, post_addon, pin_post_span_addon, follow_span_addon, name_addon];
    }

    common_user_commentcard(post_details) {
        let wrapperdiv = document.createElement('div');
        let layer1_user_details = new Bars().GenericBar('w-full bg-gray-900 p-1 pl-2 pr-2 outline-none text-gray-200 border-t-0 border-gray-700 relative dark:bg-white dark:shadow-xl dark:text-gray-900');
        let layer2_html_content = new Bars().GenericBar('w-full bg-gray-900 p-2 pl-2 outline-none text-gray-200 border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer2_5_attachments = new Bars().GenericBar('w-full bg-gray-900 p-0 pl-0 flex flex-row border-t-0 border-gray-700 dark:bg-white dark:text-gray-900');
        let layer3_comment_actions = new Bars().GenericBar('w-full bg-gray-900 flex flex-row p-1 pl-1 outline-none text-gray-200 border-t-0 border-gray-700 dark:bg-white dark:shadow-xl dark:text-gray-900');
        let layer4_replies_section = new Bars().GenericBar('w-full bg-black flex flex-row outline-none text-gray-200 border-t-0 border-gray-800 dark:bg-white dark:shadow-xl dark:text-gray-900');

        let name_addon = new AddOns().GenericSpan_Addon('text-yellow-500 font-semibold cursor-pointer relative', post_details['CreatorName']);
        $(name_addon).attr('data-userID', post_details['creatorID']);
        let role_addon = new AddOns().GenericSpan_Addon('text-yellow-500 font-semibold cursor-pointer', post_details['Creator_Symbol']);
        $(role_addon).attr('title', post_details['Creator_Role']);
        let time_addon = new AddOns().GenericSpan_Addon('text-gray-500 font-semibold ml-2', post_details['time_difference']);
        let edit_span_addon;
        let report_span_addon

        $(layer1_user_details).append(name_addon);
        $(layer1_user_details).append(role_addon);
        $(layer1_user_details).append(time_addon);


        let image_counter_addon;
        if (parseInt(post_details['NumberOfImages']) > 0) {
            image_counter_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base whitespace-nowrap text-gray-500 font-semibold ml-2', '🖼 ' + post_details['NumberOfImages']);
        }
        let pdf_counter_addon;
        if (parseInt(post_details['NumberOfPDFs']) > 0) {
            pdf_counter_addon = new AddOns().GenericSpan_Addon('text-sm md:text-base whitespace-nowrap text-gray-500 font-semibold ml-2', '📄' + post_details['NumberOfPDFs']);
        }
        $(layer1_user_details).append(image_counter_addon);
        $(layer1_user_details).append(pdf_counter_addon);


        // If attachement_store key is present then only add the attachments
        if (post_details['attachment_store'] != undefined) {

            let len_of_image_attachments = post_details['attachment_store']['images'].length;
            let final_image_array = []
            for (let i = 0; i < len_of_image_attachments; i++) {
                let image_addon = new AddOns().ImageDiv_Addon_from_GTEditor('Image_Attachment', post_details['attachment_store']['images'][i], 'p-2');
                final_image_array.push(image_addon)
            }
            let image_carosel = new AddOns().Carosel_for_Images_div_Addon('w-10/12 bg-gray-900 p-0 pl-2 flex flex-row border-t-0 border-gray-700', final_image_array);
            $(layer2_5_attachments).append(image_carosel);
            let len_of_pdf_attachments = post_details['attachment_store']['pdfs'].length;
            if (len_of_pdf_attachments == 0) {
                $(image_carosel).toggleClass('w-10/12 w-full')
            }
            for (let i = 0; i < len_of_pdf_attachments; i++) {
                let pdfs_addon = new AddOns().pdfDiv_Addon_from_GTEditor('PDF_Attachment', post_details['attachment_store']['pdfs'][i], 'p-2 h-24 w-24 cursor-pointer');
                $(layer2_5_attachments).append(pdfs_addon);
            }
        }


        if (post_details["Self"] == "Yes") {
            edit_span_addon = new AddOns().GenericSpan_Addon('text-green-500 font-semibold ml-auto float-right cursor-pointer cursor-pointer hover:text-green-600', word_finder('Edit'));
            $(layer1_user_details).append(edit_span_addon);
        } else {
            report_span_addon = new AddOns().GenericSpan_Addon('text-red-500 font-semibold ml-auto float-right cursor-pointer cursor-pointer hover:text-red-600', word_finder('Report'));
            $(layer1_user_details).append(report_span_addon);
        }

        let post_addon = new AddOns().GenericDiv_Addon('text-gray-200 text-base overflow-clip cursor-pointer dark:text-black', post_details['html_content']);
        $(layer2_html_content).append(post_addon);

        let support_text = post_details["Supports"] + ' | ';
        let reject_text = post_details["Rejects"] + ' | ';

        let Support_span_addon = new AddOns().GenericButton_Addon('text-xs flex flex-row text-center md:text-sm text-green-500 bg-black p-2 rounded font-semibold cursor-pointer cursor-pointer hover:text-green-600 dark:bg-white dark:shadow-lg', support_text);
        $(Support_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";')
        $(Support_span_addon).append(unfilled_uparrow)
        $(layer3_comment_actions).append(Support_span_addon);
        let reject_span_addon = new AddOns().GenericButton_Addon('text-xs flex flex-row text-center md:text-sm text-red-500 bg-black p-2 rounded font-semibold ml-2 cursor-pointer cursor-pointer hover:text-red-600 dark:bg-white dark:shadow-lg', reject_text);
        $(reject_span_addon).attr('style', 'font-family: "Noto Sans Symbols 2";');
        $(reject_span_addon).append(downward_unfilled_arrow)
        $(layer3_comment_actions).append(reject_span_addon);

        $(Support_span_addon).attr('data-count', post_details['Supports']);
        $(Support_span_addon).attr('data-user_support', post_details['Supported']);
        $(reject_span_addon).attr('data-count', post_details['Rejects']);
        $(reject_span_addon).attr('data-user_reject', post_details['Rejected']);


        if (post_details['Rejected'] == "Yes") {
            $(reject_span_addon).addClass('border-2 border-red-500');
            $(reject_span_addon).find('[data-arrow="Yes"]').replaceWith(downwar_filled_arrow)
        }
        if (post_details['Supported'] == "Yes") {
            $(Support_span_addon).addClass('border-2 border-green-500');
            $(Support_span_addon).find('[data-arrow="Yes"]').replaceWith(filled_uparrow)
        }

        let share_reply_div = new AddOns().GenericDiv_Addon('flex justify-evenly float-right ml-auto')
        let share_span_addon = new AddOns().GenericSpan_Addon('text-yellow-500 mr-2 bg-black p-2 rounded font-semibold ml-auto float-right  cursor-pointer cursor-pointer hover:text-yellow-600 dark:bg-white dark:shadow-lg dark:text-black dark:hover:font-bold', word_finder('share') + ' 🔗')
        $(share_reply_div).append(share_span_addon);
        $(share_span_addon).click(function (e) {
            let message = "Successfully copied the link to clipboard";
            let url = window.location.href;
            // If url arguments include comment_id else add &comment_id=sid&comment_type=type of comment
            if (url.includes('comment_id')) {
            } else {
                url = url + '&comment_id=' + post_details['sid'] + '&comment_type=' + post_details['comment_type']
            }
            // Copy the url to clipboard
            navigator.clipboard.writeText(url).then(function () {
                // alert(message || 'Async: Copying to clipboard was successful!');
                let floater = new floating_notifications().bottom_bar_notification(message, 'animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000);
                $('body').append(floater);
            })
        });

        let reply_span_addon = new AddOns().GenericSpan_Addon('text-yellow-500 bg-black dark:bg-white dark:shadow-lg p-2 rounded font-semibold ml-auto float-right  cursor-pointer cursor-pointer hover:text-yellow-600', 'Reply');
        $(share_reply_div).append(reply_span_addon);
        $(layer3_comment_actions).append(share_reply_div);

        //  Convert to int
        post_details['replies'] = parseInt(post_details['replies']);
        let replies_count_addon;
        if (post_details['replies'] > 0) {
            replies_count_addon = new AddOns().GenericSpan_Addon('text-gray-500 font-semibold ml-2 p-2 cursor-pointer', post_details['replies'] + ' Replies');
            $(layer4_replies_section).append(replies_count_addon);
            $(replies_count_addon).attr('data-parent_commentID', post_details['sid']);
        }
        $(wrapperdiv).append(layer1_user_details);
        $(wrapperdiv).append(layer2_html_content);
        $(wrapperdiv).append(layer2_5_attachments);
        $(wrapperdiv).append(layer3_comment_actions);
        $(wrapperdiv).append(layer4_replies_section);

        $(wrapperdiv).addClass('w-full bg-gray-900 dark:bg-white dark:shadow-lg rounded-lg shadow-lg mt-2');
        $(wrapperdiv).attr('data-commentID', post_details['commentID']);


        if (post_details["isClosed"] == "Yes") {
            $(wrapperdiv).addClass('border-t-4 border-l-0 border-red-500')
            $(wrapperdiv).attr('title', 'Immediate replies from here are closed');
            $(reply_span_addon).addClass('hidden');
        }

        //        0               1                   2                   3              4                 5               6            7                  8                       9                 10                     11
        return [wrapperdiv, Support_span_addon, reject_span_addon, reply_span_addon, edit_span_addon, reply_span_addon, post_addon, edit_span_addon, report_span_addon, layer4_replies_section, layer3_comment_actions, name_addon];
    }

}

class AddOns {

    GenericSpan_Addon(classer, name, font_family) {
        let wrapperdiv = document.createElement('span');
        $(wrapperdiv).addClass(classer);
        $(wrapperdiv).text(name);
        if (font_family != undefined) {
            $(wrapperdiv).attr('style', 'font-family: ' + font_family + ';');
        }
        return wrapperdiv;
    }
    GenericButton_Addon(classer, name) {
        let wrapperdiv = document.createElement('button');
        $(wrapperdiv).addClass(classer);
        $(wrapperdiv).text(name);
        return wrapperdiv;
    }
    GenericDiv_Addon(classer, details) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass(classer);
        details = DOMPurify.sanitize(details, { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        $(wrapperdiv).html(details)
        // If there's a https link, then make it clickable. Which starts with 'https://' which is in text format.
        if (details.includes('https://')) {

            let split_text = details.split('https://');
            // If theres more than one link, only show the first one and the secondd one as a link.
            // Now seperate the link  from any other text such as '<' or '>' or ' ' or '\n'

            let link = split_text[1].split(/<|>|\n| /)[0];
            // Now replace the link with the anchor tag
            let anchor_tag = '<a class="text-blue-400 hover:text-blue-600" href="https://' + link + '" target="_blank">' + link + '</a>';
            let final_text = split_text[0] + anchor_tag + split_text[1].replace(link, '');  // Replace the link with the anchor tag
            $(wrapperdiv).html(final_text);
            link = "https://" + link
            let meta_fletcher = meta_tag_crawler_displayer(link).then(function (data) {
                $(wrapperdiv).append(data);
            });


        }
        return wrapperdiv;
    }

    Genericimgspan_Addon(classer, name, src) {
        let wrapperdiv = document.createElement('span');
        $(wrapperdiv).addClass(classer);
        $(wrapperdiv).text(name);
        let img = document.createElement('img');
        $(img).attr('src', src);
        $(img).addClass('w-6 h-6 rounded-full ml-2');
        wrapperdiv.appendChild(img);
        return wrapperdiv;
    }
    GenericIframe_addon(classer, src) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass(classer);
        let iframe = document.createElement('iframe');
        $(iframe).attr('src', src);
        $(iframe).addClass('w-full h-full');
        wrapperdiv.appendChild(iframe);
        return wrapperdiv;
    }

    Carosel_for_Images_div_Addon(classer, image_array) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass(classer);
        let len = image_array.length;
        let left_button = new AddOns().GenericButton_Addon('h-full w-10 bg-gray-900 hover:bg-black text-gray-200 rounded-l-lg cursor-pointer hover:text-yellow-500 opacity-50 hover:opacity-100', '<');
        let right_button = new AddOns().GenericButton_Addon('h-full w-10 bg-gray-900 hover:bg-black text-gray-200 rounded-r-lg cursor-pointer hover:text-yellow-500 opacity-50 hover:opacity-100', '>');
        for (let i = 0; i < len; i++) {
            let img = image_array[i];
            wrapperdiv.appendChild(img);
            img.setAttribute('data-index', i)
            $(img).find('img').attr('data-index', i)
            if (i == 0) {
                $(img).addClass('block');
            } else {
                $(img).addClass('hidden');
            }
        }
        if (len > 1) {
            $(wrapperdiv).prepend(left_button);
            $(wrapperdiv).append(right_button);
        }
        $(left_button).click(function (e) {
            e.preventDefault();
            let current_index = parseInt($(wrapperdiv).attr('data-current_index'));
            let next_index = current_index - 1;
            if (next_index < 0) {
                return;
            }
            $(wrapperdiv).attr('data-current_index', next_index);
            $(wrapperdiv).find('img').addClass('hidden').removeClass('block').parent().addClass('hidden').removeClass('block');
            $(wrapperdiv).find('img[data-index="' + next_index + '"]').removeClass('hidden').addClass('block').parent().removeClass('hidden').addClass('block');
            if (next_index == 0) {
                $(left_button).addClass('hidden');
            }
            $(right_button).removeClass('hidden');
        });
        $(right_button).click(function (e) {
            e.preventDefault();
            let current_index = parseInt($(wrapperdiv).attr('data-current_index'));
            let next_index = current_index + 1;
            if (next_index >= len) {
                return;
            }
            $(wrapperdiv).attr('data-current_index', next_index);
            $(wrapperdiv).find('img').addClass('hidden').removeClass('block').parent().addClass('hidden').removeClass('block');
            $(wrapperdiv).find('img[data-index="' + next_index + '"]').removeClass('hidden').addClass('block').parent().removeClass('hidden').addClass('block');
            if (next_index == len - 1) {
                $(right_button).addClass('hidden');
            }
            $(left_button).removeClass('hidden');
        });
        $(wrapperdiv).attr('data-current_index', 0);
        $(left_button).addClass('hidden');

        // On hover on wrapperdiv, bind left and right button to left and right arrow keys.
        $(wrapperdiv).hover(function () {
            $(document).keydown(function (e) {
                if (e.keyCode == 37) {
                    $(left_button).click();
                } else if (e.keyCode == 39) {
                    $(right_button).click();
                }
            });
        }, function () {
            $(document).unbind('keydown');
        });
        return wrapperdiv;
    }

    ImageDiv_Addon_from_GTEditor(title, image_base64, classer) {
        let wrapper_div = document.createElement("div");
        let delete_div = document.createElement("div");
        delete_div.setAttribute("class", "w-full h-5 text-center text-red-400 hover:text-red-600 cursor-pointer");
        delete_div.innerHTML = "Remove";
        let imager = document.createElement("img");
        imager.setAttribute("src", image_base64);
        imager.setAttribute("loading", "lazy");
        imager.setAttribute("title", title);
        imager.setAttribute('data-title', title);
        imager.setAttribute("class", 'max-h-60 overflow-y-auto');
        imager.setAttribute('data-image', 'Yes')
        wrapper_div.setAttribute("class", classer);
        $(wrapper_div).append(imager);
        // $(wrapper_div).append(delete_div);
        $(delete_div).click(function (e) {
            e.preventDefault();
            $(wrapper_div).remove();
        });

        function expand_onto_the_screen(image_src) {
            let image_viewer = document.createElement('div');
            $(image_viewer).addClass('fixed z-50 top-0 left-0 w-screen h-screen bg-black bg-opacity-70 flex flex-col justify-center items-center');
            let image_viewer_image = document.createElement('img');
            $(image_viewer_image).addClass('object-contain border-0 border-blue-600 border-dashed');
            $(image_viewer_image).attr('src', image_src);
            $(image_viewer).append(image_viewer_image);
            $('body').append(image_viewer);
            $(image_viewer).click(function (e) {
                $(image_viewer).remove();
            });
        }
        $(imager).click(function (e) {
            e.preventDefault();
            expand_onto_the_screen(image_base64);
        });

        return wrapper_div;
    }
    pdfDiv_Addon_from_GTEditor(title, pdf_base64, classer) {
        let wrapper_div = document.createElement("div");
        let delete_div = document.createElement("div");
        delete_div.setAttribute("class", "w-full h-5 text-center text-red-400 hover:text-red-600 cursor-pointer");
        delete_div.innerHTML = "Remove";
        let pdf_linker = document.createElement("a");
        pdf_linker.setAttribute("src", pdf_base64);
        pdf_linker.setAttribute("title", title);
        pdf_linker.setAttribute('data-title', title);
        let pdf_image = document.createElement("img");
        pdf_image.setAttribute("src", "/static/EditorImages/pdf_image.png");
        wrapper_div.setAttribute("class", classer);

        // On click of pdf_linker, open the pdf in new tab.
        $(pdf_linker).click(function (e) {
            // Prevent all click actions on the pdf_linker.

            e.stopPropagation();
            window.open(pdf_base64, '_blank');

        });

        $(pdf_linker).append(pdf_image);
        $(wrapper_div).append(pdf_linker);
        // $(wrapper_div).append(delete_div);
        $(delete_div).click(function (e) {
            e.preventDefault();
            $(wrapper_div).remove();
        });
        return wrapper_div;
    }
    DropDown_Addon(classer, name, dropdown_options, dropdown_class) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass(classer);
        $(wrapperdiv).text(name);
        let dropdowner = document.createElement('div');
        $(dropdowner).addClass('absolute hidden flex flex-col border-gray-400 pl-1 pr-1 ' + classer);
        let option_len = dropdown_options.length;
        for (let i = 0; i < option_len; i++) {
            let option = document.createElement('div');
            $(option).addClass(dropdown_class);
            $(option).text(dropdown_options[i]);
            dropdowner.appendChild(option);
        }
        $(wrapperdiv).hover(function () {
            $(dropdowner).removeClass('hidden');
        }, function () {
            $(dropdowner).addClass('hidden');
        });
        wrapperdiv.appendChild(dropdowner);
        return wrapperdiv;
    }
    DropDown_Addon2(classer, name, dropdown_options, dropdown_class) {
        let wrapperdiv0 = document.createElement('div');
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv0).addClass(classer);
        $(wrapperdiv).text(name);
        let dropdowner = document.createElement('div');
        $(dropdowner).addClass('hidden flex flex-row' + classer);
        let option_len = dropdown_options.length;
        for (let i = 0; i < option_len; i++) {
            let option = document.createElement('div');
            $(option).addClass(dropdown_class);
            $(option).text(dropdown_options[i]);
            dropdowner.appendChild(option);
        }
        let x_button = document.createElement('div');
        $(x_button).addClass('text-center text-red-400 hover:text-red-600 hover:font-bold');
        $(x_button).text('X');
        dropdowner.appendChild(x_button);
        $(x_button).click(function (e) {
            $(dropdowner).addClass('hidden');
            $(wrapperdiv).removeClass('hidden')
        });

        $(wrapperdiv).click(function (e) {
            $(dropdowner).removeClass('hidden');
            $(wrapperdiv).addClass('hidden');
        });

        wrapperdiv0.appendChild(dropdowner);
        wrapperdiv0.appendChild(wrapperdiv);
        return wrapperdiv0;
    }
    DropDown_Elemental_Addon(classer, name, dropdown_options) {
        // A drop down which has dropdown_options (array) of elements. And it closes when clicked outside of it.
        let wrapperdiv0 = document.createElement('div');
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv0).addClass(classer);
        $(wrapperdiv).text(name);
        $(wrapperdiv).addClass(' w-full text-center')
        let dropdowner = document.createElement('div');
        $(dropdowner).addClass('hidden fixed absolute flex flex-col border border-gray-600 hover:border-gray-500 bg-black mt-1 mr-2 w-24 translate-x-[-30px] dark:bg-white dark:border-gray-900 dark:text-black dark:shadow-lg dark:hover:border-gray-800 dark:hover:text-gray-900 dark:hover:font-bold');
        let lenr = dropdown_options.length;
        for (let i = 0; i < lenr; i++) {
            $(dropdowner).append(dropdown_options[i]);
        }
        $(wrapperdiv).click(function (e) {
            $(dropdowner).removeClass('hidden');
        });
        // On click on anything outside of wrapperdiv0, close the dropdowner.
        $(document).mouseup(function (e) {
            if (!wrapperdiv0.contains(e.target)) {
                $(dropdowner).addClass('hidden');
            }
        });
        $(wrapperdiv0).append(wrapperdiv);
        $(wrapperdiv).append(dropdowner);
        return wrapperdiv0;
    }

}

class Bars {
    GenericBar(classer) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass(classer);
        return wrapperdiv;
    }

}
class floating_notifications {
    bottom_bar_notification(message, classer, timeout = 3000) {
        let wrapperdiv = document.createElement('div');
        // This needs to appear at the top middle of the screen.
        $(wrapperdiv).addClass('fixed w-full top-0 z-50 flex justify-center items-center pointer-events-none mt-2');
        let notification_div = document.createElement('div');
        $(notification_div).addClass(classer);
        notification_div.innerHTML = message;
        wrapperdiv.appendChild(notification_div);

        // Wrapperdiv will vanish after timeout.
        setTimeout(function () {
            $(wrapperdiv).remove();
        }, timeout);


        return wrapperdiv;
    }
}

class gen_post_calls_feedcards {
    toggle_support_rejection(post_id, post_type, circle, action, support_button, reject_button) {
        let url = '/api/v1/circle/' + circle + '/support_reject_post?post_id=' + post_id + '&action=' + action + '&post_type=' + post_type;
        new APICALLS().GenericAPICall(url, 'GET', {}).then(function (data) {
            if (action == 'support') {
                if ($(support_button).attr('data-user_support') == "No") {
                    $(support_button).addClass('border-2 border-green-500')
                    $(reject_button).removeClass('border-2 border-red-500')

                    let new_text = parseInt($(support_button).attr('data-count')) + 1;
                    $(support_button).attr('data-count', new_text)
                    new_text = new_text + ' | 🡅'
                    $(support_button).text(new_text)
                    $(support_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(support_button).attr('data-user_support', "Yes")
                }
                if ($(reject_button).attr('data-user_reject') == "Yes") {
                    let reject_new_text = parseInt($(reject_button).attr('data-count')) - 1;
                    $(reject_button).attr('data-count', reject_new_text)
                    reject_new_text = reject_new_text + ' | 🡇'
                    $(reject_button).text(reject_new_text)
                    $(reject_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(reject_button).attr('data-user_reject', "No")
                }

            } else if (action == 'reject') {
                if ($(reject_button).attr('data-user_reject') == "No") {
                    $(reject_button).addClass('border-2 border-red-500 ')
                    $(support_button).removeClass('border-2 border-green-500')
                    let new_text = parseInt($(reject_button).attr('data-count')) + 1;
                    $(reject_button).attr('data-count', new_text)
                    new_text = new_text + ' | 🡇'
                    $(reject_button).text(new_text)
                    $(reject_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(reject_button).attr('data-user_reject', "Yes")
                }
                if ($(support_button).attr('data-user_support') == "Yes") {
                    let support_new_text = parseInt($(support_button).attr('data-count')) - 1;
                    // alert(new_text)
                    $(support_button).attr('data-count', support_new_text)
                    support_new_text = support_new_text + ' | 🡅'
                    $(support_button).text(support_new_text)
                    $(support_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(support_button).attr('data-user_support', "No")
                }
            }

        })
    }


    toggle_support_rejection_info_card(action, support_button, reject_button, url) {
        new APICALLS().GenericAPICall(url, 'GET', {}).then(function (data) {
            if (action == 'support') {
                if ($(support_button).attr('data-user_support') == "No") {
                    $(support_button).addClass('border-2 border-green-500')
                    $(reject_button).removeClass('border-2 border-red-500')
                    $(reject_button).find('[data-arrow="Yes"]').replaceWith(downward_unfilled_arrow)
                    let new_text = parseInt($(support_button).attr('data-count')) + 1;
                    $(support_button).attr('data-count', new_text)
                    new_text = new_text + ' | '
                    $(support_button).text(new_text)
                    $(support_button).append(filled_uparrow)
                    $(support_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(support_button).attr('data-user_support', "Yes")
                }
                if ($(reject_button).attr('data-user_reject') == "Yes") {
                    let reject_new_text = parseInt($(reject_button).attr('data-count')) - 1;
                    $(reject_button).attr('data-count', reject_new_text)
                    reject_new_text = reject_new_text + ' | '
                    $(reject_button).text(reject_new_text)
                    $(reject_button).append(downward_unfilled_arrow)
                    $(reject_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(reject_button).attr('data-user_reject', "No")
                }

            } else if (action == 'reject') {
                if ($(reject_button).attr('data-user_reject') == "No") {
                    $(reject_button).addClass('border-2 border-red-500 ')
                    $(support_button).removeClass('border-2 border-green-500')
                    $(support_button).find('[data-arrow="Yes"]').replaceWith(unfilled_uparrow)
                    let new_text = parseInt($(reject_button).attr('data-count')) + 1;
                    $(reject_button).attr('data-count', new_text)
                    new_text = new_text + ' | '
                    $(reject_button).text(new_text)
                    $(reject_button).append(downwar_filled_arrow)
                    $(reject_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(reject_button).attr('data-user_reject', "Yes")
                }
                if ($(support_button).attr('data-user_support') == "Yes") {
                    let support_new_text = parseInt($(support_button).attr('data-count')) - 1;
                    // alert(new_text)
                    $(support_button).attr('data-count', support_new_text)
                    support_new_text = support_new_text + ' | '
                    $(support_button).text(support_new_text)
                    $(support_button).append(unfilled_uparrow)
                    $(support_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(support_button).attr('data-user_support', "No")
                }
            } else if (action == 'nullify') {
                if ($(reject_button).attr('data-user_reject') == "Yes") {
                    let reject_new_text = parseInt($(reject_button).attr('data-count')) - 1;
                    $(reject_button).attr('data-count', reject_new_text)
                    reject_new_text = reject_new_text + ' | '
                    $(reject_button).text(reject_new_text)
                    $(reject_button).append(downward_unfilled_arrow)
                    $(reject_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(reject_button).attr('data-user_reject', "No")
                    $(reject_button).removeClass('border-2 border-red-500')
                }
                if ($(support_button).attr('data-user_support') == "Yes") {
                    let support_new_text = parseInt($(support_button).attr('data-count')) - 1;
                    // alert(new_text)
                    $(support_button).attr('data-count', support_new_text)
                    support_new_text = support_new_text + ' | '
                    $(support_button).text(support_new_text)
                    $(support_button).append(unfilled_uparrow)
                    $(support_button).attr('style', 'font-family: "Noto Sans Symbols 2";');
                    $(support_button).attr('data-user_support', "No")
                    $(support_button).removeClass('border-2 border-green-500')
                }
            }

        })
    }

    async vote_in_a_survey(post_id, circle, option_details) {
        let url = "/api/v1/circle/" + circle + "/survey_vote";
        let field_data = {
            'post_id': post_id,
            'vote_option': option_details
        }
        field_data = JSON.stringify(field_data)
        let the_call = await new APICALLS().GenericAPIJSON_CALL(url, 'POST', field_data).then(function (data2) {
            console.log(data2)
            return data2;

        });
        return the_call
    }

    async get_get_user_details(user_id) {
        let url = "/api/v1/user/get_user_details?self_user=No&UserData=" + user_id;
        let the_call = await new APICALLS().GenericAPICall(url, 'GET', {}).then(function (data) {
            return data;
        });
        return the_call;
    }
}

class feedcard_meta_functions_helper {
    async complete_profile_description(user_id, binder_div) {
        let current_data = await new gen_post_calls_feedcards().get_get_user_details(user_id);
        let user_status = current_data['Status'];
        let user_description = current_data['Description'];
        let profile_card = new feedcard_meta_functions_helper().profile_floating_card(current_data);

        // On hover on binder_div, show the profile_card. On hovering out from binder div or profile_card, remove the profile_card.
        $(binder_div).hover(function () {
            $(profile_card).removeClass('hidden');
        }, function () {
            $(profile_card).remove();
        });
        $(profile_card).hover(function () {
            $(profile_card).removeClass('hidden');
        }, function () {
            $(profile_card).remove();
        });
        // On clicking outside of profile_card, remove the profile_card.
        $(document).mouseup(function (e) {
            if (!profile_card.contains(e.target)) {
                $(profile_card).remove();
            }
        });
        // On touching outside of profile_card, remove the profile_card.
        $(document).on('touchstart', function (e) {
            if (!profile_card.contains(e.target)) {
                $(profile_card).remove();
            }
        });
        return profile_card;

    }
    profile_role_circle_box(role, circle) {
    }
    profile_floating_card(user_details) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('max-w-xs p-2  bg-gray-800 border-l-2 overflow-y-auto max-h-36 border-green-500 shadow-lg mt-2 absolute dark:bg-white dark:border-gray-100 dark:shadow-lg');
        // let layer1_user_description = new Bars().GenericBar('w-full text-ellipsis h-full outline-none text-gray-200 border-t-0 border-gray-700 p-2');
        let description_addon = new AddOns().GenericSpan_Addon('h-full w-full   text-white text-sm p-2 dark:text-black', user_details['Description'], 'Noto Sans Symbols 2');
        // $(layer1_user_description).append(description_addon);
        $(wrapperdiv).append(description_addon);

        // let layer2_user_circle_role_data = new Bars().GenericBar('w-full bg-gray-900 outline-none text-gray-200 border-t-0 border-gray-700');
        return wrapperdiv;
    }
}
