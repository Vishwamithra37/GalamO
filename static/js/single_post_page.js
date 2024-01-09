
var Main_Circle;
$(document).ready(function () {
   Main_Circle = $('#Main_Circle_In_Focus').find(":selected").text();
   new single_post_page_meta_tools().stuff_to_hide_when_scrolling_down_and_show_when_scrolling_up('#Bottom_Logo_Bar_Section');
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
      let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto dark:bg-white dark:text-black"
      let submit_button = new Add_Ons().add_submit_button(word_finder("Update Post"), "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
      let discard_changed_button = new Add_Ons().add_submit_button("Discard Changes", "p-2 text-center bg-red-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right hover:bg-red-800");
      let ed_options = { "Addons": [], "Bottombar": [discard_changed_button, submit_button] }

      let valve = post_details["html_content"]
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
         "type": "POST",
         "parent_post_id": post_details["sid"],

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
            $('body').append(notification);
            $(responder[0]).remove();
         }).catch(function (err) {
            // alert("Post Locking failed.")
            let notification = new floating_notifications_orginal().bottom_bar_notification(
               "Post Reporting failed.",
               "bg-red-500 text-gray-200 font-semibold hover:bg-red-700 hover:text-gray-100 rounded-md pl-2 pr-2 pt-1 pb-1 animate-pulse",
            )
            $('body').append(notification);
            $(responder[0]).remove();
         });
      });
      $(responder[2]).click(function (e) {
         $(responder[0]).remove();
      });

   });

   // This is the pin button
   $(card[7]).click(function (e) {
      let r1 = new gen_post_calls().toggle_pin_unpin_post(post_details["sid"], 'POST').then(function (data) {
         let notification = new floating_notifications_orginal().bottom_bar_notification("Post Pinned/unpinned Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
         $('body').append(notification);
         // Refresh the page
         location.reload();
      }).catch(function (err) {
         let notification = new floating_notifications_orginal().bottom_bar_notification("Post Pinned/unpinned failed!", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
         $('body').append(notification);
      });
   });

   // This is the follow button
   $(card[8]).click(function (e) {
      new gen_post_calls().follow_unfollow_toggle(card[8], post_details["sid"]);
   });

   // This is the name addon.
   $(card[9]).click(function (e) {
      let r1 = new feedcard_meta_functions_helper().complete_profile_description($(card[9]).attr('data-userID')).then(function (data) {
         $(card[9]).append(data);
      });
   });




   // let tester2=new floating_notifications_orginal().security_popup("Are you sure you want to delete this post?",["Delete Post","Cancel"],'bg-red-500 bg-green-500');
   // $('body').prepend(tester2[0]);


   // /////////////////////End of the code for main post ////////////////////////////////

   // ///////////////////////This is the code for the comment editor ////////////////////////////////

   let ed_class = "w-full h-14 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto dark:bg-white dark:text-black"
   let submit_button = new Add_Ons().add_submit_button("Add Comment", "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
   let imager_addon = new Add_Ons().add_image_addon();
   let pdf_addon = new Add_Ons().add_pdf_addon();
   let bottombars = new Add_Ons().image_pdf_tags_placeholder_div_bar_addon('bg-gray-800 bg-gray-900');
   new meta_functions().put_them_in_one_place(imager_addon[1], bottombars, "image")
   new meta_functions().put_them_in_one_place(pdf_addon[1], bottombars, "pdf")
   let ed_options;
   if (user_powers_list.includes("create_comment_privilaged")) {
      ed_options = { "Addons": [imager_addon[0], pdf_addon[0]], "Bottombar": [submit_button] }
   } else {
      ed_options = { "Addons": [], "Bottombar": [submit_button] }
   }
   let comment_editor = new GEditor().geditor(ed_class, ed_options, word_finder("Type your comment here..."))
   $('#Asker').append(comment_editor[0]);
   $(comment_editor[1]).after(bottombars);
   $(submit_button).click(function (e) {
      //   Disable clicking on the submit button
      $(submit_button).addClass('pointer-events-none');
      let finalizing_data = new meta_functions().sumbit_button_function_comment_version(comment_editor[1], bottombars);
      try {
         new comment_poster_calls().create_comment(finalizing_data, post_details["sid"], post_details["circle"])
      } catch (error) {
         $(submit_button).removeClass('pointer-events-none');
      }

   });
   $(comment_editor[0]).click(function (e) {
      // alert("Clicked")
      $(comment_editor[1]).removeClass('h-14').addClass('h-52');

   });
   // ////// End of the code for the comment editor ////////////////////////////////


   // /////// This is the code to get comments and render them ////////////////////////////////////////////////////////////
   let noofcomments = '0';
   // If the URL has comment_id then send it as an argument.
   let get_comm_url;
   let dataType = "COMMENT";
   if (window.location.href.includes("comment_id")) {
      let comment_id = window.location.href.split("comment_id=")[1];
      let wrapper_for_options = new single_post_page_meta_tools().comment_id_special_bar(comment_id);
      $(comment_editor[0]).replaceWith(wrapper_for_options);
      get_comm_url = '/api/v1/circle/' + post_details["circle"] +
         '/get_comments?post_id=' + post_details["sid"] +
         '&comments=' + noofcomments + '&comment_id=' + comment_id;
      dataType = window.location.href.split("comment_type=")[1];
   }
   else {
      get_comm_url = '/api/v1/circle/' + post_details["circle"] + '/get_comments?post_id=' + post_details["sid"] + '&comments=' + noofcomments + '&comment_id=0';
   }

   new APICALLS().GenericAPICall(get_comm_url, 'GET', {}).then(function (data) {
      console.log(data)
      data = data["Comments"];
      new comment_poster_calls().reply_cards(data, '#comments_starts_here', dataType)
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
         let get_comm_url = '/api/v1/circle/' + post_details["circle"] + '/get_comments?post_id=' + post_details["sid"] + '&comments=' + noofcomments + '&comment_id=0';
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
   async get_root_comment(comment_id) {
      let url = "/api/v1/circle/" + Main_Circle + "/get_root_comment"
      let data = {
         "comment_id": comment_id,
         "parent_post_id": post_details["sid"]
      }
      data = JSON.stringify(data)
      let response = await new APICALLS().GenericAPIJSON_CALL(url, 'POST', data).then(function (data) {
         return data
      }
      ).catch(function (err) {
         return err
      }
      )
      return response
   }
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
         comments[i]["comment_type"] = dataType;
         let comment_card = new MainFeed().common_user_commentcard(comments[i])
         $(attach_to_this_div).append(comment_card[0]);
         if (dataType == "REPLY_COMMENT") {
            $(comment_card[0]).addClass('border-l-2 border-green-500 rounded-l-none')
         }
         $(comment_card[0]).attr('data-comment_id', comments[i]["sid"])
         $(comment_card[1]).click(function (e) {
            new gen_post_calls().toggle_support_rejection(comments[i]["sid"], dataType, post_details["circle"], 'support', comment_card[1], comment_card[2])
         })
         $(comment_card[2]).click(function (e) {
            new gen_post_calls().toggle_support_rejection(comments[i]["sid"], dataType, post_details["circle"], 'reject', comment_card[1], comment_card[2])
         });
         // This is the Edit button
         $(comment_card[7]).click(function (e) {
            let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto dark:bg-white dark:text-black"
            let submit_button = new Add_Ons().add_submit_button("Update Comment", "p-2 text-center bg-green-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
            let discard_changed_button = new Add_Ons().add_submit_button(word_finder("Discard Changes"), "p-2 text-center bg-red-600 text-sm text-gray-200 cursor-pointer font-bold rounded float-right hover:bg-red-800");
            let ed_options = { "Addons": [], "Bottombar": [discard_changed_button, submit_button] }

            let valve = $(comment_card[6]).html();
            let comment_editor = new GEditor().geditor_give_in_the_edditable_div(valve, ed_class, ed_options, word_finder("Type your comment here..."))
            // add hidden to the comment card[6] and then add the editor to the comment card[6]
            $(comment_card[6]).replaceWith(comment_editor[0]);
            $(submit_button).click(function (e) {

               new comment_poster_calls().update_comment(comment_editor, comments[i]["sid"], post_details["circle"], comment_card[6], comment_editor[0], dataType)
            });
            $(discard_changed_button).click(function (e) {
               $(comment_editor[0]).replaceWith(comment_card[6]);
            });
         });


         // This is the report button
         $(comment_card[8]).click(function (e) {
            let report_post_url = '/api/v1/circle/' + post_details["circle"] + '/report_post';
            let report_post_data = {
               "PostId": comments[i]["sid"],
               "type": "COMMENT",
               "parent_post_id": post_details["sid"],
            }
            if (dataType == "REPLY_COMMENT") {
               report_post_data["type"] = "REPLY_COMMENT";
            }

            let responder = new floating_notifications_orginal().security_popup_post_page_with_option_to_input_text(
               "Are you sure you want to report this comment?",
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
                  $('body').append(notification);
                  $(responder[0]).remove();
               }).catch(function (err) {
                  // alert("Post Locking failed.")
                  let notification = new floating_notifications_orginal().bottom_bar_notification(
                     "Post Reporting failed.",
                     "bg-red-500 text-gray-200 font-semibold hover:bg-red-700 hover:text-gray-100 rounded-md pl-2 pr-2 pt-1 pb-1 animate-pulse",
                  )
                  $('body').append(notification);
                  $(responder[0]).remove();
               });
            });
            $(responder[2]).click(function (e) {
               $(responder[0]).remove();
            });
         });


         // This is the reply button
         $(comment_card[3]).click(function (e) {
            let ed_class = "w-full h-52 bg-gray-900 p-2 pl-4 outline-none text-gray-200 overflow-y-auto dark:bg-white dark:text-black"
            let submit_button = new Add_Ons().add_submit_button("Add Reply", "p-2 text-center bg-green-600 text-sm text-white cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
            let discard_changed_button = new Add_Ons().add_submit_button("Discard Reply", "p-2 text-center bg-red-600 text-sm text-white cursor-pointer font-bold rounded float-right hover:bg-red-800");
            let ed_options = { "Addons": [], "Bottombar": [discard_changed_button, submit_button] }

            let valve = ""
            let comment_editor = new GEditor().geditor_give_in_the_edditable_div(valve, ed_class, ed_options, word_finder("Type your reply here..."))

            $(comment_card[10]).after(comment_editor[0]);
            $(submit_button).click(function (e) {
               $(submit_button).addClass('pointer-events-none');
               try {
                  new comment_poster_calls().create_reply_comment(comment_editor, comments[i]["sid"], post_details["circle"], post_details["sid"])
               } catch (error) {
                  $(submit_button).removeClass('pointer-events-none');
               }
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

         // This is the user description
         $(comment_card[11]).click(function (e) {
            let r1 = new feedcard_meta_functions_helper().complete_profile_description($(comment_card[11]).attr('data-userID')).then(function (data22) {
               $(comment_card[11]).append(data22);
               console.log(data22)
            });
         });

      }
   }
   // //////////// End of This is also used for normal comments and their replies //////////////////////////////////
   create_comment(final_data,
      // editor_wrapper,
      post_id,
      circle) {
      // let final_data={}
      // final_data["html_content"] = new meta_functions().simple_sumbit_button_function(editor_wrapper[1])["html_content"];
      final_data["PostId"] = post_id;
      final_data["circle"] = circle;
      final_data = JSON.stringify(final_data);

      // if privelaged comment in user_powers_list then use the following url else use the one below it.
      let final_url_for_comment = '/api/v1/circle/' + circle + '/create_comment';
      if (user_powers_list.includes("create_comment_privilaged")) {
         final_url_for_comment = '/api/v1/circle/' + circle + '/create_comment_privilaged'
      }


      new APICALLS().GenericAPIJSON_CALL(final_url_for_comment, 'POST', final_data).then(function (data) {
         let floatin_notif = new floating_notifications().bottom_bar_notification("Comment Posted Succesfully!", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
         $('body').append(floatin_notif);
         // $(editor_wrapper).remove();
         // new comment_poster_calls().fresh_comment_refresh();
         window.location.href = window.location.href + "&comment_id=" + data["comment_id"] + "&comment_type=COMMENT";
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
         // new comment_poster_calls().fresh_comment_refresh();
         window.location.href = window.location.href + "&comment_id=" + parent_comment_id + "&comment_type=REPLY_COMMENT";
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

   follow_unfollow_toggle(follow_spanner, post_id) {
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
               new_text = new_text + ' | 🡅'
               $(support_button).text(new_text)
               $(support_button).attr('data-user_support', "Yes")
            }
            if ($(reject_button).attr('data-user_reject') == "Yes") {
               let reject_new_text = parseInt($(reject_button).attr('data-count')) - 1;
               $(reject_button).attr('data-count', reject_new_text)
               reject_new_text = reject_new_text + ' | 🡇'
               $(reject_button).text(reject_new_text)
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
               $(reject_button).attr('data-user_reject', "Yes")
            }
            if ($(support_button).attr('data-user_support') == "Yes") {
               let support_new_text = parseInt($(support_button).attr('data-count')) - 1;
               // alert(new_text)
               $(support_button).attr('data-count', support_new_text)
               support_new_text = support_new_text + ' | 🡅'
               $(support_button).text(support_new_text)
               $(support_button).attr('data-user_support', "No")
            }
         }

      })
   }

   async toggle_pin_unpin_post(post_id, post_type) {
      let url = '/api/v1/' + Main_Circle + '/toggle_pin_post'
      let data = {
         "post_id": post_id,
         "post_type": post_type
      }
      data = JSON.stringify(data)
      let response = await new APICALLS().GenericAPIJSON_CALL(url, 'POST', data).then(function (data) {
         return data
      }).catch(function (err) {
         return err
      })
      return response
   }

}

class single_post_page_meta_tools {
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

   comment_id_special_bar(comment_id2) {
      let url = new URL(window.location.href);
      let searchParams = new URLSearchParams(url.search);
      let comment_type = searchParams.get("comment_type");

      let wrapper_for_options = new single_post_page_meta_tools().Generic_div("w-full flex flex-row bg-black justify-between p-2 dark:bg-white dark:text-black dark:shadow-lg", "")
      let view_all_comments = new single_post_page_meta_tools().Generic_Button(
         "text-center text-sm text-gray-400 cursor-pointer font-bold rounded hover:text-gray-200  ml-auto float-right dark:text-black dark:hover:text-gray-900",
         "View All Comments");
      let view_root_comments = new single_post_page_meta_tools().Generic_Button(
         "text-center text-sm text-gray-400 cursor-pointer font-bold rounded  hover:text-gray-200 dark:text-black dark:hover:text-gray-900",
         "View Root Comment");
      if (comment_type == "COMMENT") {
      } else {
         $(wrapper_for_options).append(view_root_comments);
      }
      $(wrapper_for_options).append(view_all_comments);
      $(view_all_comments).click(function (e) {
         let url = window.location.href.split("?")[0] + "?circle_name=" + Main_Circle;
         window.location.href = url;
      });
      $(view_root_comments).click(function (e) {
         let url = new URL(window.location.href);
         let searchParams = new URLSearchParams(url.search);
         let comment_id = searchParams.get("comment_id");
         new comment_poster_calls().get_root_comment(comment_id).then(function (data) {
            let redirect_to = window.location.href.split("?")[0] + "?circle_name=" + Main_Circle + "&comment_id=" + data["Comment_ID"] + "&comment_type=COMMENT";
            location.href = redirect_to;
         });
      });
      return wrapper_for_options;
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
}