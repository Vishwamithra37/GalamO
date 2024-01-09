class floating_notifications_orginal {
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

    security_popup(message, choose_message) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('bg-green-500 text-white rounded-lg p-2 m-2');
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('bg-red-500 text-white rounded-lg p-2 m-2 cursor-pointer ');
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        choose_div.appendChild(no_button);
        notification_div.appendChild(message_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button];
    }

    small_custom_title_div_onclick(message, classer, binding_element) {
        // This needs to appear when clicked upon a certain element.
        let wrapperdiv = document.createElement('div');
        $(binding_element).addClass('relative');
        $(wrapperdiv).addClass('absolute z-50 top-0 flex justify-center items-center pointer-events-none');
        let notification_div = document.createElement('div');
        $(notification_div).addClass(classer);
        notification_div.innerHTML = message;
        wrapperdiv.appendChild(notification_div);
        binding_element.appendChild(wrapperdiv);
        // On clicking or touchstart, the div will vanish.
        $(document).on('click touchstart', function () {
            $(wrapperdiv).remove();
        }
        );
        return wrapperdiv;
    }


    custom_bg_security_popup(message, choose_message, bg_of_yes, bg_of_no) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-50 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('rounded-lg p-2 m-2 cursor-pointer');
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('rounded-lg p-2 m-2 cursor-pointer ');
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        $(yes_button).addClass(bg_of_yes);
        choose_div.appendChild(no_button);
        $(no_button).addClass(bg_of_no);
        notification_div.appendChild(message_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button];
    }

    security_popup_post_page(message, choose_message, bg_of_yes, bg_of_no) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2 border-2 border-gray-200');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('p-2 m-2 cursor-pointer');
        $(yes_button).addClass(bg_of_yes);
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('p-2 m-2 cursor-pointer ');
        $(no_button).addClass(bg_of_no);
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        choose_div.appendChild(no_button);
        notification_div.appendChild(message_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button];
    }

    security_popup_post_page_with_option_to_input_text(message, placeholder, choose_message, bg_of_yes, bg_of_no) {
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-50 h-full top-0  flex justify-center items-center');
        let notification_div = document.createElement('div');
        $(notification_div).addClass('flex flex-col justfy-center items-center bg-gray-900 rounded-lg shadow-lg p-2 border-2 border-gray-200');
        let message_div = document.createElement('div');
        $(message_div).addClass('text-white text-center');
        message_div.innerHTML = message;
        let input_div = document.createElement('div');
        $(input_div).addClass('flex justify-center items-center');
        let input_box = document.createElement('textarea');
        $(input_box).addClass('p-2 m-2 cursor-text outline-none text-center h-20 w-96');
        $(input_box).addClass('bg-black text-white');
        input_box.placeholder = placeholder;
        $(input_div).append(input_box);

        let choose_div = document.createElement('div');
        $(choose_div).addClass('flex justify-center items-center');
        let yes_button = document.createElement('button');
        $(yes_button).addClass('p-2 m-2 cursor-pointer');
        $(yes_button).addClass(bg_of_yes);
        yes_button.innerHTML = choose_message[0];
        let no_button = document.createElement('button');
        $(no_button).addClass('p-2 m-2 cursor-pointer ');
        $(no_button).addClass(bg_of_no);
        no_button.innerHTML = choose_message[1];
        choose_div.appendChild(yes_button);
        choose_div.appendChild(no_button);
        notification_div.appendChild(message_div);
        notification_div.appendChild(input_div);
        notification_div.appendChild(choose_div);
        wrapperdiv.appendChild(notification_div);

        return [wrapperdiv, yes_button, no_button, input_box];
    }

    multi_col_div_ontop(options, yes_button, no_button) {
        // Options is an array of Elements. Each specifying the content of each column.
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed w-full z-60 h-full top-0  flex flex-col justify-center items-center bg-black bg-opacity-50 border-gray-700');
        let wrapper_2 = document.createElement('div');
        $(wrapper_2).addClass('flex flex-col justify-center items-center bg-gray-900 rounded-lg shadow-lg p-2 border border-gray-200');
        $(wrapperdiv).append(wrapper_2);
        let len_of_options = options.length;
        for (let i = 0; i <= len_of_options; i++) {
            $(wrapper_2).append(options[i]);
        }
        $(wrapper_2).append(yes_button);
        $(wrapper_2).append(no_button);

        return wrapperdiv;
    }

    multi_col_stack_floater(stacks) {
        // Options is an array of Elements. Each specifying the content of each column.
        let wrapperdiv = document.createElement('div');
        $(wrapperdiv).addClass('fixed z-40 w-full h-full top-0 flex justify-center items-center bg-black bg-opacity-50 border-gray-700');
        let wrapper_2 = document.createElement('div');
        $(wrapper_2).addClass('flex flex-col w-full   md:w-2/6 h-5/6 bg-gray-900 rounded-lg bg-black shadow-lg p-2 border-0 border-gray-200');
        let len_of_options = stacks.length;
        for (let i = 0; i <= len_of_options; i++) {
            $(wrapper_2).append(stacks[i]);
        }
        $(wrapperdiv).append(wrapper_2);
        return wrapperdiv;
    }

    ultra_pure_multi_col_stack_floater(stacks, classer) {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('fixed z-40 w-full h-full top-0 flex justify-center items-center bg-black bg-opacity-50 border-gray-700');
        let wrapper_2 = document.createElement('div');
        $(wrapper_2).addClass(classer);
        let len_of_options = stacks.length;
        for (let i = 0; i <= len_of_options; i++) {
            $(wrapper_2).append(stacks[i]);
        }
        $(wrapper_div).append(wrapper_2);
        return wrapper_div;
    }

}


// Examples Implementations.
// 1) Green notification at the top middle of the screen.
// let floatin_notif=new floating_notifications_orginal().bottom_bar_notification("Comment Posted Succesfully!",' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded',3000)
// $('body').append(floatin_notif);

// 2) Security Popup.
// let floatin_notif=new floating_notifications_orginal().security_popup("Are you sure you want to delete this comment?",['Yes','No'],'bg-red-500','bg-green-500');
// $('body').append(floatin_notif[0]);
