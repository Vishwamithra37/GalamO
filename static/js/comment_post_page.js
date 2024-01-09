
var Main_Circle;
$(document).ready(function () {
    Main_Circle = $('#Main_Circle_In_Focus').find(":selected").text();

    // ///////////////////////This is the code for main post ////////////////////////////////
    let card = new MainFeed().single_post_feed_card(post_details)
    $('#Asker').append(card[0]);
    $(card[1]).click(function (e) {
        new gen_post_calls().toggle_support_rejection(post_details["sid"], 'POST', post_details["circle"], 'support', card[1], card[2])
    })
    $(card[2]).click(function (e) {
        new gen_post_calls().toggle_support_rejection(post_details["sid"], 'POST', post_details["circle"], 'reject', card[1], card[2])
    });

    //This is the Edit button.   
    $(card[3]).click(function (e) {
        let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto"
        let submit_button = new Add_Ons().add_submit_button("Update Post", "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
        let discard_changed_button = new Add_Ons().add_submit_button("Discard Changes", "p-2 text-center bg-red-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right hover:bg-red-800");
        let ed_options = { "Addons": [], "Bottombar": [discard_changed_button, submit_button] }

        let valve = $(card[6]).html();
        let post_editor = new GEditor().geditor_give_in_the_edditable_div(valve, ed_class, ed_options, 'Type your post here...')
        // add hidden to the card[6] and then add the editor to the card[6]
        $(card[6]).replaceWith(post_editor[0]);
        $(submit_button).click(function (e) {
            new comment_poster_calls().update_post(post_editor, post_details["sid"], post_details["circle"], card[6], post_editor[0])
        });
        $(discard_changed_button).click(function (e) {
            $(post_editor[0]).replaceWith(card[6]);
        });
    });

    $(card[4]).click(function (e) {
        // This is the delete button--which links to locking of the post.
        let lock_post_url = '/api/v1/circle/' + post_details["circle"] + '/close_post';
        let lock_post_data = {
            "PostId": post_details["sid"],
            "type": "POST"
        }
        lock_post_data = JSON.stringify(lock_post_data);
        let responder = new floating_notifications_orginal().security_popup_post_page(
            "Are you sure you want to lock this post? This will stop any new comments from appearing.",
            ["Lock-Post", "Don't Lock"],
            'bg-red-600 text-gray-200 font-semibold hover:bg-red-700 hover:text-gray-100 rounded-md',
            'bg-gray-500 text-gray-200 font-semibold hover:bg-gray-700 hover:text-gray-100 rounded-md');
        $('body').prepend(responder[0]);
        $(responder[1]).click(function (e) {
            new APICALLS().GenericAPIJSON_CALL(lock_post_url, 'POST', lock_post_data).then(function (data) {
                let notification = new floating_notifications_orginal().bottom_bar_notification(
                    "Post Locked away successfully.",
                    "bg-green-500 text-gray-200 font-semibold hover:bg-green-700 hover:text-gray-100 rounded-md pt-1 pb-1 pl-2 pr-2",
                )
                $('body').prepend(notification);
            }).catch(function (err) {
                // alert("Post Locking failed.")
                let notification = new floating_notifications_orginal().bottom_bar_notification(
                    "Post Locking failed.",
                    "bg-red-500 text-gray-200 font-semibold hover:bg-red-700 hover:text-gray-100 rounded-md pl-2 pr-2 pt-1 pb-1 animate-pulse",
                )
                $('body').prepend(notification);
                $(responder[0]).remove();
            });
        });
        $(responder[2]).click(function (e) {
            $(responder[0]).remove();
        });

    });

    // This is the report button
    $(card[5]).click(function (e) {
        let report_post_url = '/api/v1/circle/' + post_details["circle"] + '/report_post';
        let report_post_data = {
            "PostId": post_details["sid"],
            "type": "POST"
        }

        let responder = new floating_notifications_orginal().security_popup_post_page_with_option_to_input_text(
            "Are you sure you want to report this post?",
            "Reason for reporting...(minimum of 10 characters is)",
            ["Report-Post", "Don't Report"],
            'bg-red-600 text-gray-200 font-semibold hover:bg-red-700 hover:text-gray-100 rounded-md',
            'bg-gray-500 text-gray-200 font-semibold hover:bg-gray-700 hover:text-gray-100 rounded-md');
        $('body').prepend(responder[0]);

        $(responder[1]).click(function (e) {
            report_post_data["reason"] = $(responder[3]).val();
            report_post_data = JSON.stringify(report_post_data);
            new APICALLS().GenericAPIJSON_CALL(report_post_url, 'POST', report_post_data).then(function (data) {
                let notification = new floating_notifications_orginal().bottom_bar_notification(
                    "Post Reported successfully.",
                    "bg-green-500 text-gray-200 font-semibold hover:bg-green-700 hover:text-gray-100 rounded-md pt-1 pb-1 pl-2 pr-2",
                )
                $('body').prepend(notification);
                $(responder[0]).remove();
            }).catch(function (err) {
                // alert("Post Locking failed.")
                let notification = new floating_notifications_orginal().bottom_bar_notification(
                    "Post Reporting failed.",
                    "bg-red-500 text-gray-200 font-semibold hover:bg-red-700 hover:text-gray-100 rounded-md pl-2 pr-2 pt-1 pb-1 animate-pulse",
                )
                $('body').prepend(notification);
                $(responder[0]).remove();
            });
        });
        $(responder[2]).click(function (e) {
            $(responder[0]).remove();
        });

    });


    // let tester2=new floating_notifications_orginal().security_popup("Are you sure you want to delete this post?",["Delete Post","Cancel"],'bg-red-500 bg-green-500');
    // $('body').prepend(tester2[0]);


    // /////////////////////End of the code for main post ////////////////////////////////

    // ///////////////////////This is the code for the comment editor ////////////////////////////////

    let ed_class = "w-full h-14 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto"
    let submit_button = new Add_Ons().add_submit_button("Add Comment", "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
    let ed_options = { "Addons": [], "Bottombar": [submit_button] }

    let comment_editor = new GEditor().geditor(ed_class, ed_options, 'Type your comment here...')
    $('#Asker').append(comment_editor[0]);
    $(submit_button).click(function (e) {
        new comment_poster_calls().create_comment(comment_editor, post_details["sid"], post_details["circle"])
    });

    // ////// End of the code for the comment editor ////////////////////////////////


    // /////// This is the code to get comments and render them ////////////////////////////////////////////////////////////
    let noofcomments = '0';
    let get_comm_url = '/api/v1/circle/' + post_details["circle"] + '/get_comments?post_id=' + post_details["sid"] + '&comments=' + noofcomments;
    new APICALLS().GenericAPICall(get_comm_url, 'GET', {}).then(function (data) {
        console.log(data)
        data = data["Comments"];
        new comment_poster_calls().reply_cards(data, '#comments_starts_here', "COMMENT")
    });
    // /////// End of Comments Section ///////////////////////////////////////////////////////////////////////////////////////

    let feed_loader_counter = 0;
    let feeder_div = $('#Content_Column')
    $(feeder_div).scroll(function (e) {
        let scroll_percentage = new gen_post_calls().calculateScrollPercentage(feeder_div);
        //  console.log(`Scroll percentage: ${ scroll_percentage }%`)
        if (scroll_percentage > 80 && feed_loader_counter == 0) {
            console.log("Loading more posts");
            feed_loader_counter = 1;
            noofcomments = parseInt(noofcomments) + 10;
            noofcomments = noofcomments.toString();
            let get_comm_url = '/api/v1/circle/' + post_details["circle"] + '/get_comments?post_id=' + post_details["sid"] + '&comments=' + noofcomments;
            new APICALLS().GenericAPICall(get_comm_url, 'GET', {}).then(function (data) {
                data = data["Comments"];
                new comment_poster_calls().reply_cards(data, '#comments_starts_here', "COMMENT")
                feed_loader_counter = 0;
            }).catch(function (err) {
                feed_loader_counter = 1;
            })
        }
    });







    let info_board_url = '/api/v1/circle/get_information_and_announcement_board/' + Main_Circle;
    new APICALLS().GenericAPICall(info_board_url, 'GET', {}).then(function (data) {
        let len_of_info_board = data["Information_Board"].length;
        if (len_of_info_board > 0) {
            $('#InfoBoardTitle').empty();
        }
        for (let i = 0; i < len_of_info_board; i++) {
            let optioner = document.createElement('option');
            $(optioner).text(data["Information_Board"][i]["title"]);
            $(optioner).attr('data-subtitle', data["Information_Board"][i]["subtitle"]);
            $(optioner).attr('data-content', JSON.stringify(data["Information_Board"][i]["Information_cards"]));
            $('#InfoBoardTitle').append(optioner);
        };
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
        });



    });



});

class comment_poster_calls {
    fresh_comment_refresh() {
        // $('#comments_starts_here').empty();
        // let get_comm_url='/api/v1/circle/'+post_details["circle"]+'/get_comments?post_id='+post_details["sid"]+'&comments=0'
        // new APICALLS().GenericAPICall(get_comm_url,'GET',{}).then(function(data){
        //    console.log(data)
        //       let comments=data["Comments"];
        //       for(let i=0;i<comments.length;i++){
        //          let comment_card=new MainFeed().common_user_commentcard(comments[i])
        //          $('#comments_starts_here').append(comment_card[0]);
        //          $(comment_card[1]).click(function(e){
        //             new gen_post_calls().toggle_support_rejection(comments[i]["sid"],'COMMENT',post_details["circle"],'support',comment_card[1],comment_card[2])
        //          })
        //          $(comment_card[2]).click(function(e){
        //             new gen_post_calls().toggle_support_rejection(comments[i]["sid"],'COMMENT',post_details["circle"],'reject',comment_card[1],comment_card[2])
        //          });
        //       }
        // });
        // Refresh the page
        location.reload();
    }

    get_replies(parent_comment_id, circle, parent_post_id, counter, parent_comment_card) {
        let url = '/api/v1/circle/' + circle + '/get_replies?parent_comment_id=' + parent_comment_id + '&parent_post_id=' + parent_post_id + '&replies=' + counter
        new APICALLS().GenericAPICall(url, 'GET', {}).then(function (data) {
            console.log(data)
            data = data["Replies"];
            new comment_poster_calls().reply_cards(data, parent_comment_card, 'REPLY_COMMENT')
        });
    }

    // //////////// This is also used for normal comments and their replies //////////////////////////////////
    reply_cards(comments, attach_to_this_div, dataType) {

        for (let i = 0; i < comments.length; i++) {

            let comment_card = new MainFeed().common_user_commentcard(comments[i])
            $(attach_to_this_div).append(comment_card[0]);
            if (dataType == "REPLY_COMMENT") {
                $(comment_card[0]).addClass('border-l-2 border-green-500 rounded-l-none')
            }
            $(comment_card[1]).click(function (e) {
                new gen_post_calls().toggle_support_rejection(comments[i]["sid"], dataType, post_details["circle"], 'support', comment_card[1], comment_card[2])
            })
            $(comment_card[2]).click(function (e) {
                new gen_post_calls().toggle_support_rejection(comments[i]["sid"], dataType, post_details["circle"], 'reject', comment_card[1], comment_card[2])
            });
            // This is the Edit button
            $(comment_card[7]).click(function (e) {
                let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto"
                let submit_button = new Add_Ons().add_submit_button("Update Comment", "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
                let discard_changed_button = new Add_Ons().add_submit_button("Discard Changes", "p-2 text-center bg-red-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right hover:bg-red-800");
                let ed_options = { "Addons": [], "Bottombar": [discard_changed_button, submit_button] }

                let valve = $(comment_card[6]).html();
                let comment_editor = new GEditor().geditor_give_in_the_edditable_div(valve, ed_class, ed_options, 'Type your comment here...')
                // add hidden to the comment card[6] and then add the editor to the comment card[6]
                $(comment_card[6]).replaceWith(comment_editor[0]);
                $(submit_button).click(function (e) {
                    new comment_poster_calls().update_comment(comment_editor, comments[i]["sid"], post_details["circle"], comment_card[6], comment_editor[0], dataType)
                });
                $(discard_changed_button).click(function (e) {
                    $(comment_editor[0]).replaceWith(comment_card[6]);
                });
            });


            // This is the reply button
            $(comment_card[3]).click(function (e) {
                let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto"
                let submit_button = new Add_Ons().add_submit_button("Add Reply", "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
                let discard_changed_button = new Add_Ons().add_submit_button("Discard Reply", "p-2 text-center bg-red-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right hover:bg-red-800");
                let ed_options = { "Addons": [], "Bottombar": [discard_changed_button, submit_button] }

                let valve = ""
                let comment_editor = new GEditor().geditor_give_in_the_edditable_div(valve, ed_class, ed_options, 'Type your reply here...')

                $(comment_card[10]).after(comment_editor[0]);
                $(submit_button).click(function (e) {
                    new comment_poster_calls().create_reply_comment(comment_editor, comments[i]["sid"], post_details["circle"], post_details["sid"])
                });
                $(discard_changed_button).click(function (e) {
                    $(comment_editor[0]).remove();
                    $(comment_card[3]).removeClass('hidden');
                });
                $(comment_editor[0]).focus();
                $(comment_card[3]).addClass('hidden');

            });


            // Replies List Button
            $(comment_card[9]).click(function (e) {
                let replies_list = new comment_poster_calls().get_replies(
                    comments[i]["sid"],
                    post_details["circle"],
                    post_details["sid"],
                    0,
                    comment_card[0],
                )
                $(comment_card[9]).addClass('hidden');
            });

        }
    }
    // //////////// End of This is also used for normal comments and their replies //////////////////////////////////





    create_comment(editor_wrapper, post_id, circle) {
        let final_data = {}
        final_data["html_content"] = new meta_functions().simple_sumbit_button_function(editor_wrapper[1])["html_content"];
        final_data["PostId"] = post_id;
        final_data["circle"] = circle;
        console.log(circle)
        console.log(final_data)
        final_data = JSON.stringify(final_data);

        new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + circle + '/create_comment', 'POST', final_data).then(function (data) {

            // alert("Success") 

            let floatin_notif = new floating_notifications().bottom_bar_notification("Comment Posted Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            $(editor_wrapper).remove();
            new comment_poster_calls().fresh_comment_refresh();
        })
    }

    create_reply_comment(editor_wrapper, parent_comment_id, circle, parent_post_id) {
        let final_data = {}
        final_data["html_content"] = new meta_functions().simple_sumbit_button_function(editor_wrapper[1])["html_content"];
        final_data["parent_post_id"] = parent_post_id;
        final_data["circle"] = circle;
        final_data["type"] = "COMMENT_REPLY";
        final_data["parent_comment_id"] = parent_comment_id;
        let final_data2 = JSON.stringify(final_data);
        new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + circle + '/reply_comment', 'POST', final_data2).then(function (data) {
            let floatin_notif = new floating_notifications().bottom_bar_notification("Reply Posted Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            $(editor_wrapper).remove();
            new comment_poster_calls().fresh_comment_refresh();
        })
    }


    update_comment(editor_wrapper, comment_id, circle, comment_card, commenteditor, commentType) {
        let final_data = {}
        final_data["html_content"] = new meta_functions().simple_sumbit_button_function(editor_wrapper[1])["html_content"];
        final_data["PostId"] = comment_id;
        final_data["circle"] = circle;
        final_data["type"] = commentType;
        final_data["comment_id"] = comment_id;
        let final_data2 = JSON.stringify(final_data);

        new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + circle + '/update_comment', 'POST', final_data2).then(function (data) {
            let floatin_notif = new floating_notifications().bottom_bar_notification("Comment Updated Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            // $(editor_wrapper).remove();
            // console.log(final_data)
            $(comment_card).html(final_data["html_content"]);
            console.log("The following is the comment card")
            console.log(comment_card)
            $(commenteditor).replaceWith(comment_card);
        })
    }
    update_post(editor_wrapper, comment_id, circle, comment_card, commenteditor) {
        let final_data = {}
        final_data["html_content"] = new meta_functions().simple_sumbit_button_function(editor_wrapper[1])["html_content"];
        final_data["PostId"] = comment_id;
        final_data["circle"] = circle;
        final_data["type"] = "POST";
        final_data["comment_id"] = comment_id;
        let final_data2 = JSON.stringify(final_data);

        new APICALLS().GenericAPIJSON_CALL('/api/v1/circle/' + circle + '/update_comment', 'POST', final_data2).then(function (data) {
            let floatin_notif = new floating_notifications().bottom_bar_notification("Post Updated Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
            $('body').append(floatin_notif);
            // $(editor_wrapper).remove();
            // console.log(final_data)
            $(comment_card).html(final_data["html_content"]);
            console.log("The following is the comment card")
            console.log(comment_card)
            $(commenteditor).replaceWith(comment_card);
        })
    }



}

class gen_post_calls {

    calculateScrollPercentage(element) {
        const document_Height = $(document).height();
        const scrolledAmount = $(element).scrollTop() + $(window).height() - document_Height;
        const totalHeight = $(element).height();
        // Generally varies from 0 to 82%.
        return Math.round((scrolledAmount / totalHeight) * 100);
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