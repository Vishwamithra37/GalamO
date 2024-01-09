
// $(document).ready(function () {
//     var editor = new GEditor();
//     let ed_class="w-full h-2/6 bg-gray-900 p-2 pl-4 outline-none text-gray-200"
//     let tool_bar_options={};
//     var editor_div = editor.geditor(ed_class,tool_bar_options);
//     document.body.appendChild(editor_div[0]);
// });

// Try to check if there is a variable called favored language from cookies or local storage.
let favored_language = document.cookie.split(';').find(
    cookie => cookie.trim().startsWith('favoured_language='));
if (favored_language) {
    favored_language = favored_language.split('=')[1];
} else {
    favored_language = "english";
}
let GT_EDITOR_language_dicts = {
    "telugu": {
        "Follow": "గమనించండి",
        "Unfollow": "గమనించకండి",
        "Edit": "సవరించండి",
        "Lock": "తాళం పెట్టండి",
        "Unlock": "తాళం తీసివేయండి",
        "Pin": "పైన పెట్టండి",
        "Unpin": "పైనించి తీసివేయండి",
        "options": "సూచనలు",
        "copy-link": "లింక్ కాపీ చేయండి",
        "Report": "హెచ్చరించండి",
        "Discard Changes": "మార్పులను విస్మరించండి",
        "Update Post": "పోస్ట్ నవీకరించండి",
        "Add Reply": "జవాబును చేర్చండి",
        "Discard Reply": "జవాబును విస్మరించండి",
        "Add Comment": "వ్యాఖ్యను చేర్చండి",
        "Discard Comment": "వ్యాఖ్యను విస్మరించండి",
        "Create Post": "పోస్ట్ సృష్టించండి",
        "Type in a nice title for your post": "ఒక మంచి ప్రారంభ వాక్యం రాయండి...",
    }
}

function GT_editor_word_finder(word) {

    let language = favored_language;
    if (GT_EDITOR_language_dicts[language] && GT_EDITOR_language_dicts[language][word]) {
        return GT_EDITOR_language_dicts[language][word];
    } else {
        return word;
    }
}




class GEditor {
    geditor(editable_div_class, tool_bar_options, placeholder_text) {
        let wrapper_div = document.createElement("div");
        let Editable_Div = document.createElement("div");
        Editable_Div.setAttribute("contenteditable", "true");
        Editable_Div.setAttribute("class", editable_div_class);
        Editable_Div.setAttribute('placeholder', placeholder_text);

        Editable_Div.addEventListener('paste', function (e) {
            e.preventDefault()
            let text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)
        })

        let tool_bar = new Tool_Bar(Editable_Div);
        let tool_bar_main = tool_bar.tool_bar(tool_bar_options);
        let bottom_bar2 = new bottom_bar().main_div(tool_bar_options);

        wrapper_div.appendChild(tool_bar_main);
        wrapper_div.appendChild(Editable_Div);
        wrapper_div.appendChild(bottom_bar2);

        // On entering https:// in the editable div, make it a link.
        // Editable_Div.addEventListener('input', function (e) {
        //     let selection = window.getSelection();
        //     let range = selection.getRangeAt(0);
        //     let text = range.startContainer.data;
        //     let text_len = text.length;
        //     let text_start = text.slice(0, 8);
        //     let text_end = text.slice(text_len - 1, text_len);
        //     if (text_start == "https://" && text_end == " ") {
        //         let link = document.createElement("a");
        //         link.setAttribute("href", text);
        //         link.setAttribute("target", "_blank");
        //         link.innerHTML = text;
        //         range.deleteContents();
        //         range.insertNode(link);
        //         range.setStartAfter(link);
        //         range.setEndAfter(link);
        //         range.collapse(false);
        //         selection.removeAllRanges();
        //         selection.addRange(range);
        //     }
        // });

        return [wrapper_div, Editable_Div, bottom_bar2]

    }


    geditor_give_in_the_edditable_div(Editable_Div_value, editable_div_class, tool_bar_options, placeholder_text) {
        let wrapper_div = document.createElement("div");
        let Editable_Div = document.createElement("div");
        Editable_Div.setAttribute("contenteditable", "true");
        Editable_Div.setAttribute("class", editable_div_class);
        Editable_Div.setAttribute('placeholder', placeholder_text);
        Editable_Div.innerHTML = Editable_Div_value;

        Editable_Div.addEventListener('paste', function (e) {
            e.preventDefault()
            let text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)
        })

        let tool_bar = new Tool_Bar(Editable_Div);
        let tool_bar_main = tool_bar.tool_bar(tool_bar_options);
        let bottom_bar2 = new bottom_bar().main_div(tool_bar_options);

        wrapper_div.appendChild(tool_bar_main);
        wrapper_div.appendChild(Editable_Div);
        wrapper_div.appendChild(bottom_bar2);

        return [wrapper_div, Editable_Div, bottom_bar2]
    }



}

class Tool_Bar {

    constructor(Editable_Div_Area) {
        this.Editable_Div_Area = Editable_Div_Area;
    }


    tool_bar(options) {
        console.log(this.Editable_Div_Area);
        let tool_bar = document.createElement("div");
        tool_bar.setAttribute("class", "flex flex-row z-0 bg-gray-900 pl-2 border-b-2 border-gray-700 relative md:static dark:bg-white dark:text-black dark:border-gray-200 darl:shadow-lg");
        let bold_button = this.tool_bar_bold();
        let italics_button = this.tool_bar_italics();
        let underline_button = this.tool_bar_underline();
        let unordered_list_button = this.tool_bar_unordered_list();
        let ordered_list_button = this.tool_bar_ordered_list();
        let text_counter = this.tool_bar_text_counter();
        // This div encompasses the extra addons that the user wants to add. It is only visible when the user clicks on the button. and 
        // Its children show up when the user clicks on the button. and vanishes when the user clicks on the button again.
        let extra_addons_div = new Add_Ons().extra_buttons_hider_div_addon(options);
        tool_bar.appendChild(bold_button);
        tool_bar.appendChild(italics_button);
        tool_bar.appendChild(underline_button);
        tool_bar.appendChild(unordered_list_button);
        tool_bar.appendChild(ordered_list_button);

        tool_bar.appendChild(extra_addons_div[0]);
        tool_bar.appendChild(extra_addons_div[1]);
        tool_bar.appendChild(text_counter[0]);


        return tool_bar;
    }

    tool_bar_text_counter() {
        let wrapper_div = document.createElement('div')
        let counter = 0;
        $(wrapper_div).addClass('text-white font-bold p-2 rounded border-r-2 border-gray-700 float-right ml-auto pt-3 dark:bg-white dark:text-black dark:border-0 dark:shadow-lg')
        $(wrapper_div).text(counter + "/10000")
        // Basically count the text in editable div nad then increment the charecters as necessary.
        let guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('input', (e) => {
            let child_Text_length = $(guDiv).text().length;
            if (child_Text_length > 10000) {
                $(wrapper_div).removeClass('text-white dark:text-black');
                $(wrapper_div).addClass('text-red-500 dark:text-red-500');
                $(wrapper_div).text(child_Text_length + "/10000");
            } else {
                $(wrapper_div).removeClass('text-red-500 dark:text-red-500');
                $(wrapper_div).addClass('text-white dark:text-black');
                $(wrapper_div).text(child_Text_length + "/10000");
            }
        });
        return [wrapper_div, counter]

    }

    tool_bar_bold() {
        let button = document.createElement("button");
        button.setAttribute("class", "text-white font-bold p-2  rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-0 dark:shadow-lg");
        button.innerHTML = "B";
        const guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold', false, null);
            }
        });
        // COnstantly check if the content is bold or not.
        guDiv.addEventListener('input', (e) => {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let bold = document.queryCommandState('bold');
            if (bold) {
                $(button).addClass('text-yellow-500 dark:text-yellow-500');
                $(button).removeClass('text-white dark:text-black');

            }
            else {

                $(button).addClass('text-white dark:text-black');
                $(button).removeClass('text-yellow-500 dark:text-yellow-500');
            }

        });

        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('bold', false, null);
        });
        return button;
    }

    tool_bar_italics() {
        let button = document.createElement("button");
        button.setAttribute("class", "text-white font-bold p-2  rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-0 dark:shadow-lg");
        button.innerHTML = "I";
        const guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic', false, null);
            }
        });
        // COnstantly check if the content is bold or not.
        guDiv.addEventListener('input', (e) => {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let bold = document.queryCommandState('italic');
            if (bold) {
                $(button).addClass('text-yellow-500 dark:text-yellow-500');
                $(button).removeClass('text-white dark:text-black');
            }
            else {
                $(button).addClass('text-white dark:text-black');
                $(button).removeClass('text-yellow-500 dark:text-yellow-500');
            }

        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('italic', false, null);
        });
        return button;
    }

    tool_bar_underline() {
        let button = document.createElement("button");
        button.setAttribute("class", "text-white font-bold p-2   rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-0 dark:shadow-lg");
        button.innerHTML = "U";
        const guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline', false, null);
            }
        });
        // COnstantly check if the content is bold or not.
        guDiv.addEventListener('input', (e) => {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let bold = document.queryCommandState('underline');
            if (bold) {
                $(button).addClass('text-yellow-500 dark:text-yellow-500');
                $(button).removeClass('text-white dark:text-black');
            }
            else {
                $(button).addClass('text-white dark:text-black');
                $(button).removeClass('text-yellow-500 dark:text-yellow-500');
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('underline', false, null);
        });
        return button;
    }

    tool_bar_unordered_list() {
        let button = document.createElement("button");
        button.setAttribute("class", "text-white font-bold  p-2  rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-0 dark:shadow-lg");
        let unorderedlist_png = document.createElement("img");
        unorderedlist_png.setAttribute("src", "/static/EditorImages/unorderedlist.png");
        unorderedlist_png.setAttribute("loading", "lazy");
        unorderedlist_png.setAttribute("class", "w-8 h-8 bg-white rounded ");
        $(button).append(unorderedlist_png);

        // button.innerHTML = "UL";
        const guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                document.execCommand('insertUnorderedList', false, null);
            }
        });

        // COnstantly check if the content is bold or not.
        guDiv.addEventListener('input', (e) => {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let bold = document.queryCommandState('insertUnorderedList');
            if (bold) {
                $(unorderedlist_png).addClass('bg-yellow-500');
                $(orderedlist_png).removeClass('bg-white');
            } else {
                $(unorderedlist_png).addClass('bg-white');
                $(unorderedlist_png).removeClass('bg-yellow-500');
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('insertUnorderedList', false, null);
        });
        return button;
    }

    tool_bar_ordered_list() {
        let button = document.createElement("button");
        button.setAttribute("class", " text-white font-bold p-2  rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-0 dark:shadow-lg");
        let orderedlist_png = document.createElement("img");
        orderedlist_png.setAttribute("src", "/static/EditorImages/orderedlist.png");
        orderedlist_png.setAttribute("loading", "lazy");
        orderedlist_png.setAttribute("class", "w-8 h-8 bg-white rounded ");
        $(button).append(orderedlist_png);
        const guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                document.execCommand('insertOrderedList', false, null);
            }
        });
        // COnstantly check if the content is bold or not.
        guDiv.addEventListener('input', (e) => {
            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let bold = document.queryCommandState('insertOrderedList');
            if (bold) {
                $(orderedlist_png).addClass('bg-yellow-500');
                $(orderedlist_png).removeClass('bg-white');
            } else {
                $(orderedlist_png).addClass('bg-white');
                $(orderedlist_png).removeClass('bg-yellow-500');
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('insertOrderedList', false, null);
        });
        return button;
    }


} // End of class GU_Editor Tools

class Add_Ons {
    extra_buttons_hider_div_addon(options) {
        let extra_addons_div = document.createElement("div");
        let labeller = document.createElement("div");
        $(extra_addons_div).addClass('hidden absolute flex flex-row justify-center w-full mt-12 md:mt-0 md:bg-transparent md:block md:flex md:flex-row md:static md:justify-start');
        $(labeller).text('⚙️')
        for (let i = 0; i < options["Addons"].length; i++) {
            extra_addons_div.appendChild(options["Addons"][i]);
            $(options["Addons"][i]).addClass('bg-gray-900 md:bg-transparent  md:relative dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg');
        }
        $(labeller).click(function (e) {
            $(extra_addons_div).toggleClass('hidden');

        });
        $(extra_addons_div).mouseleave(function (e) {
            $(extra_addons_div).addClass('hidden');
        });
        $(labeller).addClass('p-2 pt-3 border-r-2 border-gray-700 cursor-pointer flex flex-col md:hidden');

        // On clicking outside extra_addons_div, it's decendants or labeller, hide the extra_addons_div.
        $(document).click(function (e) {
            if (!$(e.target).is(extra_addons_div) && !$(e.target).is($(extra_addons_div).find('*')) && !$(e.target).is(labeller)) {
                $(extra_addons_div).addClass('hidden');
            }
        });
        // hide it even on touch events in other parts of the screen.
        $(document).on('touchstart', function (e) {
            if (!$(e.target).is(extra_addons_div) && !$(e.target).is($(extra_addons_div).find('*')) && !$(e.target).is(labeller)) {
                $(extra_addons_div).addClass('hidden');
            }
        });
        return [labeller, extra_addons_div];
    }

    forms_addon() {
        function multi_col_stack_floater(stacks) {
            // Options is an array of Elements. Each specifying the content of each column.
            let wrapperdiv = document.createElement('div');
            $(wrapperdiv).addClass('fixed w-full h-full top-0 flex justify-center items-center bg-black dark:bg-white bg-opacity-50 border-gray-700');
            let wrapper_2 = document.createElement('div');
            $(wrapper_2).addClass('flex flex-col w-full  md:w-2/6 rounded-md bg-gray-900 rounded-lg bg-black dark:bg-white shadow-lg p-2 border-0 border-gray-200 overflow-y-auto');
            let len_of_options = stacks.length;
            for (let i = 0; i <= len_of_options; i++) {
                $(wrapper_2).append(stacks[i]);
            }
            $(wrapperdiv).append(wrapper_2);
            return wrapperdiv;
        }
        function the_stack() {
            let title_bar = document.createElement("div");
            $(title_bar).addClass('w-full flex flex-row border-b-2 border-green-500 p-2 pb-0');
            let stack_title_bar = document.createElement("div");
            $(stack_title_bar).addClass('text-green-500 font-bold text-xl text-center');
            $(stack_title_bar).text("Create Survey");
            let stack_input_description_bar = new bottom_bar().forms_input_bar(
                "Enter a description for your form",
                "w-full mt-2 h-auto bg-gray-900 text-white text-lg font-semibold p-2 pl-3  border-2 border-gray-700 outline-none dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg",
                "1",
                ["2", "3"]
            );
            $(stack_input_description_bar).attr("data-form_type", "description");
            let cancel_button = document.createElement("div");
            $(cancel_button).addClass('text-gray-500 ml-auto float-right font-bold p-2 pt-1 text-base text-center cursor-pointer hover:text-gray-400');
            $(cancel_button).text("Cancel");
            $(title_bar).append(stack_title_bar);
            $(title_bar).append(cancel_button);
            return [title_bar, stack_input_description_bar, cancel_button];
        }
        function option_addon_stack() {
            let wrapper_div = document.createElement("div");
            $(wrapper_div).addClass('flex flex-row w-full mt-2');
            let option_input_bar = new bottom_bar().forms_input_bar(
                "Enter an option",
                "resize-none w-11/12 mt-0 h-auto bg-gray-900 text-white text-lg font-semibold p-2 pl-3  border-2 border-gray-700 outline-none dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg",
                "1",
                ["2", "2"]

            );
            $(option_input_bar).attr("data-form_type", "option");
            let delete_option_form = document.createElement("div");
            $(delete_option_form).addClass('text-red-500 font-bold cursor-pointer ml-auto float-right p-2 pt-3 hover:text-yellow-500');
            $(delete_option_form).text('X')
            $(delete_option_form).click(function (e) {
                e.preventDefault();
                $(wrapper_div).remove();
            });
            $(wrapper_div).append(option_input_bar);
            $(wrapper_div).append(delete_option_form);
            return wrapper_div;
        }
        function add_option_button() {
            let wrapper_div = document.createElement("div");
            $(wrapper_div).addClass('text-gray-500 font-bold p-2 pt-1 text-xl w-full text-right cursor-pointer hover:text-gray-400');
            $(wrapper_div).text("Add an option");
            $(wrapper_div).click(function (e) {
                e.preventDefault();
                let option_addon_stack_div = option_addon_stack();
                $(wrapper_div).before(option_addon_stack_div);
            });
            return wrapper_div;
        }
        function final_submit_box() {
            let wrapper_div = document.createElement("div");
            $(wrapper_div).addClass('w-full text-green-400 cursor-pointer hover:text-green-500 flex-row mt-2 bg-black dark:bg-white p-2 flex justify-center hover:text-green-500 border-0 border-gray-400 items-center');
            let submit_button = document.createElement("div");
            $(submit_button).addClass('font-bold text-xl text-center  ');
            $(submit_button).text("Submit");
            $(wrapper_div).append(submit_button);
            return [wrapper_div, submit_button];
        }
        let spanner_div = document.createElement("div");
        let spanner_div_wraper = document.createElement("div");
        $(spanner_div_wraper).addClass('font-bold bg-black dark:bg-white cursor-pointer  p-2 pt-3 border-l-2 border-l border-gray-700')
        $(spanner_div).addClass(' bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 text-transparent hover:text-yellow-500 ')
        $(spanner_div).text("Survey");
        let wrapperdiv22;
        let final_submit_box2 = final_submit_box();
        $(spanner_div_wraper).attr("data-form_type", "hidden");

        let the_stacker = []
        let thetitle_stack = the_stack();
        the_stacker.push(thetitle_stack[0]);
        the_stacker.push(thetitle_stack[1]);
        the_stacker.push(option_addon_stack());
        the_stacker.push(add_option_button());

        the_stacker.push(final_submit_box2[0]);
        wrapperdiv22 = multi_col_stack_floater(the_stacker);
        $(wrapperdiv22).addClass('hidden');
        document.body.appendChild(wrapperdiv22);
        // This is the cancel button.
        $(thetitle_stack[2]).click(function (e) {
            e.preventDefault();
            $(wrapperdiv22).toggleClass('hidden');
            $(spanner_div_wraper).attr("data-form_type", "hidden");
        });
        $(spanner_div).click(function (e) {
            e.preventDefault();
            if ($(spanner_div_wraper).attr("data-form_type") == "hidden") {
                $(spanner_div_wraper).attr("data-form_type", "shown");
                $(wrapperdiv22).toggleClass('hidden');
                return;
            }
            // On hover or touch, get all the data from the form and send it to the server.
        });
        $(spanner_div_wraper).append(spanner_div);
        //                     0                  1                2
        return [spanner_div_wraper, wrapperdiv22, final_submit_box2[1]];
    }

    add_image_addon() {
        let lavel = document.createElement("div");
        lavel.setAttribute("class", "text-white font-bold p-2 pt-2.5  rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        let image_png = document.createElement("img");
        image_png.setAttribute("src", "/static/EditorImages/image.png");
        image_png.setAttribute("loading", "lazy");
        image_png.setAttribute("class", "w-7 h-7 bg-gray-400 hover:bg-gray-300 cursor-pointer rounded dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        let image_text = document.createElement("span");
        image_text.innerHTML = "🖼";
        image_text.setAttribute("class", "text-white text-lg font-bold text-white hover:text-yellow-500 cursor-pointer font-sans");
        $(lavel).append(image_text);
        let file_input = document.createElement("input");
        file_input.setAttribute("type", "file");
        file_input.setAttribute("accept", "image/*");
        file_input.setAttribute("class", "hidden");
        $(lavel).append(file_input);
        let image_base64;
        $(image_text).click(function (e) {
            e.preventDefault();
            $(file_input).click();
        });
        return [lavel, file_input]
    }

    add_pdf_addon() {
        let lavel = document.createElement("div");
        lavel.setAttribute("class", "text-white font-bold p-2  rounded border-r-2 border-gray-700 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        let pdf_png = document.createElement("img");
        pdf_png.setAttribute("src", "/static/EditorImages/pdf_image.png");
        pdf_png.setAttribute("loading", "lazy");
        pdf_png.setAttribute("class", "w-8 h-8 bg-gray-900 hover:bg-gray-700 cursor-pointer rounded dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        $(lavel).append(pdf_png);
        let file_input = document.createElement("input");
        file_input.setAttribute("type", "file");
        file_input.setAttribute("accept", "application/pdf");
        file_input.setAttribute("class", "hidden");
        $(lavel).append(file_input);
        let pdf_base64;

        $(pdf_png).click(function (e) {
            e.preventDefault();
            $(file_input).click();
        });
        return [lavel, file_input]
    }

    add_submit_button() {
        let right_div = document.createElement("div");
        right_div.setAttribute("class", "p-2 text-center bg-green-600 text-sm text-white cursor-pointer font-bold rounded float-right ml-auto hover:bg-green-800");
        right_div.innerHTML = GT_editor_word_finder('Create Post')


        return right_div;
    }

    add_submit_button(title, classer) {
        let right_div = document.createElement("div");
        right_div.setAttribute("class", classer);
        right_div.innerHTML = title;
        return right_div;
    }

    add_dropdown_flairs_addon(flairs_name_list_list) {
        let wrapper_div = document.createElement("div");
        let dropdown_fixed_div = document.createElement("div");
        let options_fixed_div = document.createElement("div");
        let labeler = document.createElement("label");

        $(wrapper_div).addClass("text-center pt-3");
        $(labeler).addClass("font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 pt-3 text-center cursor-pointer hover:text-yellow-500 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        $(labeler).html("Flairs*");
        $(wrapper_div).append(labeler);
        let counter = 0;

        $(dropdown_fixed_div).addClass('hidden inset-x-0.5 md:inset-auto mt-2  fixed flex flex-col bg-gray-900 border-2 border-gray-700 rounded max-h-52 max-w-52 overflow-y-auto');

        function top_option_bar(flair_names) {
            let top_option_bar_wrapper = document.createElement("div");
            $(top_option_bar_wrapper).addClass("flex justify-center md:w-full flex-row md:justify-between");

            let flair_names_len = flair_names.length;
            for (let i = 0; i < flair_names_len; i++) {
                let flair_name = flair_names[i]["name"]
                let flair_name_div = document.createElement("div");
                $(flair_name_div).addClass("text-white text-left font-semibold p-2 border-b-2 border-r-2 border-l-2 border-gray-700 cursor-pointer hover:text-yellow-500");
                $(flair_name_div).html(flair_name);
                $(flair_name_div).attr("data-option_name", flair_name);
                $(top_option_bar_wrapper).append(flair_name_div);
            }
            return top_option_bar_wrapper;
        }

        function bottom_options_box(bottom_options_box_object, flair_name) {
            let bottom_options_box_wrapper = document.createElement("div");
            $(bottom_options_box_wrapper).addClass("flex flex-row justify-between flex-wrap p-2");
            let bottom_options_box_len = bottom_options_box_object.length;
            let counter = 0;
            for (let i = 0; i < bottom_options_box_len; i++) {
                if (bottom_options_box_object[i]["name"] == flair_name) {
                    let flairs_len = bottom_options_box_object[i]["tags"].length;
                    for (let j = 0; j < flairs_len; j++) {
                        let flair_div = document.createElement("span");
                        $(flair_div).addClass("bg-gray-900 border-2 border-gray-700 rounded p-2 m-1 text-white cursor-pointer hover:bg-gray-700 hover:text-green-500");
                        flair_div.innerHTML = bottom_options_box_object[i]["tags"][j];
                        let checker = check_if_flair_in_data(bottom_options_box_object[i]["tags"][j]);

                        if (checker == true) {
                            $(flair_div).addClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500");
                            $(flair_div).removeClass("bg-gray-900 hover:text-green-500 text-white border-gray-700");
                            $(flair_div).attr("data-chosen", "Yes");
                            counter++;
                        } else {
                            $(flair_div).attr("data-chosen", "No");
                        }

                        $(flair_div).click(function (e) {

                            e.preventDefault();
                            if (check_if_flair_in_data($(flair_div).html()) == false) {
                                $(flair_div).addClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500");
                                $(flair_div).removeClass("bg-gray-900 hover:text-green-500 text-white border-gray-700");
                                $(flair_div).attr("data-chosen", "Yes");
                                // Remove the start in Flairs* and replace with Flairs(counter).
                                counter++;
                                // $(labeler).html("Flairs-"+counter);
                                labeler_array_check_and_add($(flair_div).html());
                            } else {
                                $(flair_div).removeClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500");
                                $(flair_div).addClass("bg-gray-900 hover:text-green-500 text-white border-gray-700");
                                $(flair_div).attr("data-chosen", "No");
                                counter--;
                                // $(labeler).html("Flairs-"+counter);
                                labeler_array_check_and_add($(flair_div).html());
                            }

                            change_the_text_of_flairs_on_change();
                        });
                        $(bottom_options_box_wrapper).append(flair_div);
                    }
                    break;
                }
            }

            // On clicking outside of the bottom_options_box_wrapper, close the bottom_options_box_wrapper.

            return bottom_options_box_wrapper;
        }

        function check_if_flair_in_data(flair_value) {
            // Check if flair_value is in the labeler_array which is in data-Flair_array in labeler. Return true if it is.
            let labeler_array = $(labeler).attr("data-Flair_array");
            if (labeler_array == undefined) {
                labeler_array = [];
            } else {
                labeler_array = JSON.parse(labeler_array);
            }
            let flair_value_index = labeler_array.indexOf(flair_value);
            if (flair_value_index == -1) {
                return false;
            }
            return true;
        }

        function labeler_array_check_and_add(flair_value) {
            // Check if flair_value is in the labeler_array which is in data-Flair_array in labeler.
            let labeler_array = $(labeler).attr("data-Flair_array");
            if (labeler_array == undefined) {
                labeler_array = [];
            } else {
                labeler_array = JSON.parse(labeler_array);
            }
            let flair_value_index = labeler_array.indexOf(flair_value);
            if (flair_value_index == -1) {
                labeler_array.push(flair_value);
            } else {
                labeler_array.splice(flair_value_index, 1);
            }
            $(labeler).attr("data-Flair_array", JSON.stringify(labeler_array));
        }

        function change_the_text_of_flairs_on_change() {
            // Count the number of strings in data-Flair_array in labeler and change the text of Flairs* to Flairs-(counter).
            let labeler_array = $(labeler).attr("data-Flair_array");
            labeler_array = JSON.parse(labeler_array);
            let counter = labeler_array.length;
            $(labeler).html("Flairs-" + counter);
        }


        let top_option_bar_wrapper = top_option_bar(flairs_name_list_list);
        $(dropdown_fixed_div).append(top_option_bar_wrapper);

        $(top_option_bar_wrapper).children().each(function (index, element) {
            $(element).click(function (e) {
                e.preventDefault();
                $(options_fixed_div).empty();
                let flair_name = $(element).attr("data-option_name");
                let bottom_options_box_wrapper = bottom_options_box(flairs_name_list_list, flair_name);
                console.log(bottom_options_box_wrapper);
                // Add text-yellow-500 to the clicked element and remove it from the rest.
                $(top_option_bar_wrapper).children().each(function (index, element) {
                    $(element).removeClass("text-yellow-500");
                });
                $(element).addClass("text-yellow-500");
                $(options_fixed_div).append(bottom_options_box_wrapper);
                $(options_fixed_div).removeClass("hidden");
            });
        });


        $(labeler).click(function (e) {
            e.preventDefault();
            $(dropdown_fixed_div).toggleClass("hidden");
            // $(options_fixed_div).addClass("hidden");
            if ($(top_option_bar_wrapper).children().length == 1) {
                $(top_option_bar_wrapper).children().first().click();
            }
        });

        $(labeler).change(function (e) {
            change_the_text_of_flairs_on_change();
        });

        // On Change in the data-Flair_array in labeler, change the title attribute of labeler.
        $(labeler).attr('title', 'Click to choose Flairs which will be displayed on your post')



        $(options_fixed_div).addClass("hidden  md:w-52 overflow-y-auto");
        $(dropdown_fixed_div).append(options_fixed_div);

        // If not clicking on the children of labeler or dropdown_fixed_div or options_fixed_div, close the dropdown_fixed_div.
        $(document).mouseup(function (e) {
            if (!$(labeler).is(e.target) && !$(dropdown_fixed_div).is(e.target) && !$(options_fixed_div).is(e.target) && $(dropdown_fixed_div).has(e.target).length === 0) {
                $(dropdown_fixed_div).addClass("hidden");
            }
        });


        $(wrapper_div).append(dropdown_fixed_div);
        return [wrapper_div, labeler];
    }


    add_flairs_addon(flairs) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("text-center pt-3");
        let labeler = document.createElement("label");
        $(labeler).addClass("font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 pt-3 text-center cursor-pointer hover:text-yellow-500 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        $(labeler).html("Flairs*");
        let counter = 0;

        let encompassing_div = document.createElement("div");
        $(encompassing_div).addClass("hidden absolute flex flex-row flex-wrap h-auto bg-gray-800 border-2 border-gray-700 rounded p-2 max-h-52 max-w-52 w-72 overflow-y-auto overflow-x-auto");

        for (let i = 0; i < flairs.length; i++) {
            let flair_div = document.createElement("span");
            $(flair_div).addClass("bg-gray-800 border-2 border-gray-700 rounded p-2 m-1 text-white cursor-pointer hover:bg-gray-700 hover:text-green-500");
            flair_div.innerHTML = flairs[i];
            $(flair_div).attr("data-chosen", "No");
            $(flair_div).click(function (e) {
                e.preventDefault();
                if ($(flair_div).attr("data-chosen") == "No") {
                    $(flair_div).addClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500");
                    $(flair_div).removeClass("bg-gray-800 hover:text-green-500 text-white border-gray-700");
                    $(flair_div).attr("data-chosen", "Yes");
                    // Remove the start in Flairs* and replace with Flairs(counter).
                    counter++;
                    $(labeler).html("Flairs-" + counter);
                } else {
                    $(flair_div).removeClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500");
                    $(flair_div).addClass("bg-gray-800 hover:text-green-500 text-white border-gray-700");
                    $(flair_div).attr("data-chosen", "No");
                    counter--;
                    if (counter == 0) {
                        $(labeler).html("Flairs*");
                    } else {
                        $(labeler).html("Flairs-" + counter);
                    }
                }
            });


            $(encompassing_div).append(flair_div);
        }

        $(wrapper_div).append(encompassing_div);

        $(labeler).click(function (e) {
            e.preventDefault();
            $(encompassing_div).toggleClass("hidden");
        });
        // On hovering out of the encompassing div, hide it.
        $(encompassing_div).mouseleave(function (e) {
            e.preventDefault();
            $(encompassing_div).addClass("hidden");
        });


        $(wrapper_div).append(labeler);
        return wrapper_div;
    }

    add_role_flairs_addon(flairs) {
        let wrapper_div = document.createElement("div");
        $(wrapper_div).addClass("text-center pt-3");
        let labeler = document.createElement("label");
        $(labeler).addClass("font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 pt-3 text-center cursor-pointer hover:text-yellow-500 dark:bg-white dark:border-gray-200");
        $(labeler).text("Flairs*");
        let counter = 0;
        $(wrapper_div).append(labeler);
        let flair_encompassing_div = document.createElement("div");
        $(wrapper_div).append(flair_encompassing_div);
        let list_of_flair_len = flairs.length;
        $(wrapper_div).attr('data-flair_array', JSON.stringify([]));
        $(flair_encompassing_div).addClass("hidden mt-4 md:mr-0 w-full  inset-x-0.5 md:inset-auto flex flex-row flex-wrap h-auto bg-gray-800 border-2 border-gray-700 rounded p-2 max-h-52 max-w-52 w-72 overflow-y-auto overflow-x-auto absolute dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
        for (let i = 0; i < list_of_flair_len; i++) {
            let flair_span = document.createElement("span");
            $(flair_span).addClass("bg-gray-800 border-2 border-gray-700 rounded p-2 m-1 text-white cursor-pointer hover:bg-gray-700 hover:text-green-500 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg dark:hover:bg-gray-200 dark:hover:font-bold dark:hover:text-green-500");
            $(flair_span).text(flairs[i]);
            $(flair_span).attr('data-flair_name', flairs[i]);
            $(flair_span).attr("data-chosen", "No");
            $(flair_encompassing_div).append(flair_span);
            $(flair_span).click(function (e) {
                let current_flairs = JSON.parse($(wrapper_div).attr('data-Flair_array'));
                if ($(flair_span).attr("data-chosen") == "No") {
                    $(flair_span).addClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg ");
                    $(flair_span).removeClass("bg-gray-800 hover:text-green-500 text-white border-gray-700 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
                    $(flair_span).attr("data-chosen", "Yes");
                    // Remove the start in Flairs* and replace with Flairs(counter).
                    counter++;
                    current_flairs.push($(flair_span).attr('data-flair_name'));
                    $(wrapper_div).attr('data-flair_array', JSON.stringify(current_flairs));
                    $(labeler).html("Flairs-" + counter);
                } else {
                    $(flair_span).removeClass("border-green-500 hover:border-red-500 text-green-500 hover:text-red-500 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
                    $(flair_span).addClass("bg-gray-800 hover:text-green-500 text-white border-gray-700 dark:bg-white dark:text-black dark:border-gray-200 dark:shadow-lg");
                    $(flair_span).attr("data-chosen", "No");
                    counter--;
                    current_flairs.splice(current_flairs.indexOf($(flair_span).attr('data-flair_name')), 1);
                    $(wrapper_div).attr('data-flair_array', JSON.stringify(current_flairs));
                    if (counter == 0) {
                        $(labeler).html("Flairs*");
                    } else {
                        $(labeler).html("Flairs-" + counter);
                    }
                }
            });
        }
        $(labeler).click(function (e) {
            if ($(flair_encompassing_div).hasClass("hidden")) {
                $(flair_encompassing_div).removeClass("hidden");
            } else {
                $(flair_encompassing_div).addClass("hidden");
            }
        });

        // If not clicking on the children of labeler or dropdown_fixed_div or options_fixed_div, close the dropdown_fixed_div.
        $(document).mouseup(function (e) {
            if (!$(labeler).is(e.target) && !$(flair_encompassing_div).is(e.target) && $(flair_encompassing_div).has(e.target).length === 0) {
                $(flair_encompassing_div).addClass("hidden");
            }
        });
        return wrapper_div;
    }

    add_announcement_button() {
        let button = document.createElement("button");
        button.setAttribute("class", "text-white font-bold p-2 bg-blue-700  rounded border-l-2  border-gray-700");
        let announcement_png = document.createElement("img");
        announcement_png.setAttribute("src", "/static/EditorImages/Announcement.png");
        announcement_png.setAttribute("loading", "lazy");
        announcement_png.setAttribute("class", "w-8 h-8 rounded ");
        announcement_png.setAttribute("title", "Announcement for the whole circle");
        $(button).append(announcement_png);

        return button;
    }



    image_pdf_tags_placeholder_div_bar_addon(optional_classes) {
        let diver = document.createElement("div");
        diver.setAttribute("class", "flex w-full flex-row border-t-2 h-auto border-gray-700 bg-gray-800 dark:bg-white dark:shadow-lg");
        $(diver).toggleClass(optional_classes);
        return diver;
    }




}

class bottom_bar {
    main_div(options) {
        let wrapperdiv = document.createElement("div");
        wrapperdiv.setAttribute("class", "flex flex-row border-t-2 border-gray-700 bg-gray-900 overflow-x-auto flex-nowrap dark:bg-white dark:shadow-lg");
        for (let i = 0; i < options["Bottombar"].length; i++) {
            $(wrapperdiv).append(options["Bottombar"][i]);
        }
        return wrapperdiv;
    }
    title_bar() {
        let wrapperdiv = document.createElement("textarea");
        wrapperdiv.setAttribute("class", " resize-none w-full h-auto bg-gray-900 dark:bg-white dark:text-black text-white text-lg font-semibold p-2 pl-3  border-b-2 border-gray-700 outline-none");

        $(wrapperdiv).attr("placeholder", GT_editor_word_finder('Type in a nice title for your post'))

        $(wrapperdiv).attr("resize", "none");
        $(wrapperdiv).attr("rows", "1");
        $(wrapperdiv).click(function (e) {
            e.preventDefault();
            $(wrapperdiv).attr("rows", "2");
        });
        $(wrapperdiv).blur(function (e) {
            e.preventDefault();
            $(wrapperdiv).attr("rows", "1");
        });

        return wrapperdiv;
    }

    forms_input_bar(placeholder, classer, rows, changer_array = ["1", "2"]) {
        let wrapperdiv = document.createElement("textarea");
        wrapperdiv.setAttribute("class", classer);
        $(wrapperdiv).attr("placeholder", placeholder);
        $(wrapperdiv).attr("resize", "none");
        $(wrapperdiv).attr("rows", rows);
        $(wrapperdiv).click(function (e) {
            e.preventDefault();
            $(wrapperdiv).attr("rows", changer_array[1]);
        });
        $(wrapperdiv).blur(function (e) {
            e.preventDefault();
            $(wrapperdiv).attr("rows", changer_array[0]);
        });
        return wrapperdiv;
    }
}

class meta_functions {
    image_div_function(title, image_base64, classer) {
        let wrapper_div = document.createElement("div");
        let delete_div = document.createElement("div");
        delete_div.setAttribute("class", "w-full h-5 text-center text-red-400 hover:text-red-600 cursor-pointer");
        delete_div.innerHTML = "Remove";
        let imager = document.createElement("img");
        imager.setAttribute("src", image_base64);
        imager.setAttribute("title", title);
        imager.setAttribute('data-title', title);
        imager.setAttribute("class", 'w-24 h-24');
        imager.setAttribute('data-image', 'Yes')
        wrapper_div.setAttribute("class", classer);
        $(wrapper_div).append(imager);
        $(wrapper_div).append(delete_div);
        $(delete_div).click(function (e) {
            e.preventDefault();
            $(wrapper_div).remove();
        });
        return wrapper_div;
    }

    pdf_div_function(title, pdf_base64, classer) {
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
        pdf_image.setAttribute('loading', 'lazy');
        wrapper_div.setAttribute("class", classer);

        // On click of pdf_linker, open the pdf in new tab.
        $(pdf_linker).click(function (e) {
            e.preventDefault();
            // Convert base64 to blob.
            let byteCharacters = atob(pdf_base64.split(',')[1]);
            let byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            let blob = new Blob([byteArray], { type: 'application/pdf' });
            let blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl);

        });

        $(pdf_linker).append(pdf_image);
        $(wrapper_div).append(pdf_linker);
        $(wrapper_div).append(delete_div);
        $(delete_div).click(function (e) {
            e.preventDefault();
            $(wrapper_div).remove();
        });
        return wrapper_div;
    }

    put_them_in_one_place(file_input, mybar, type) {
        $(file_input).change(function () {
            let base64;
            console.log(file_input)
            // Convert to base64 and store.
            let file = file_input.files[0];
            console.log(file);
            // const reader = new FileReader();
            let dummy = document.createElement("img");
            let reader = new FileReader();
            reader.addEventListener('load', (event) => {
                dummy.src = event.target.result;
                base64 = dummy.src;
                if (type == "image") {
                    let card = new meta_functions().image_div_function(file.name, base64, "w-24 h-24 bg-gray-400 rounded m-2 mb-6 cursor-pointer");
                    $(mybar).append(card)
                    function expand_onto_the_screen(image_src) {
                        let image_viewer = document.createElement('div');
                        $(image_viewer).addClass('fixed z-50 top-0 left-0 w-screen h-screen bg-black dark:bg-white bg-opacity-70 flex flex-col justify-center items-center');
                        let image_viewer_image = document.createElement('img');
                        $(image_viewer_image).addClass('object-contain border-0 border-blue-600 border-dashed');
                        $(image_viewer_image).attr('src', image_src);
                        $(image_viewer).append(image_viewer_image);
                        $('body').append(image_viewer);
                        $(image_viewer).click(function (e) {
                            $(image_viewer).remove();
                        });
                    }
                    $(card).click(function (e) {
                        e.preventDefault();
                        expand_onto_the_screen(base64);
                    });
                } else if (type == "pdf") {
                    let card = new meta_functions().pdf_div_function(file.name, base64, "w-24 h-24 bg-gray-400 rounded m-2 mb-6 cursor-pointer");
                    $(mybar).append(card);
                }
            });
            reader.readAsDataURL(file);
        });
    }

    sumbit_button_function(editable_div, bottom_bar, flair_div, title_bar = null) {
        let html_content = $(editable_div).html();
        // Santize and remove all the unwanted tags.
        let sanitized_html = DOMPurify.sanitize(html_content, { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        // Find all the image tags in bottom bar.
        let image_tags = $(bottom_bar).find("img");
        let pdf_tags = $(bottom_bar).find("a");
        let image_tags_array = [];
        let pdf_tags_array = [];

        for (let i = 0; i < image_tags.length; i++) {
            if (image_tags[i].getAttribute("data-image") == "Yes") {
                let image_data = {
                    "title": image_tags[i].getAttribute("data-title"),
                    "base64": image_tags[i].getAttribute("src")
                }
                image_tags_array.push(image_data);
            }
        }
        for (let i = 0; i < pdf_tags.length; i++) {
            let pdf_data = {
                "title": pdf_tags[i].getAttribute("data-title"),
                "base64": pdf_tags[i].getAttribute("src")
            }
            pdf_tags_array.push(pdf_data);
        }
        // Find all the flair tags in flair div.
        let flair_tags = $(flair_div).find("span");
        let flair_tags_array = [];

        for (let i = 0; i < flair_tags.length; i++) {
            if (flair_tags[i].getAttribute("data-chosen") == "Yes") {
                flair_tags_array.push($(flair_tags[i]).text());
            }
        }
        if (flair_tags_array.length > 3) {
            alert("You can only select 3 flair tags.");
            return;
        } else if (flair_tags_array.length == 0) {
            alert("You must select atleast 1 flair tag.");
            return;
        }
        let title = "";
        if (title_bar != null) {
            title = $(title_bar).val();
        }
        let final_data = {
            "title": title,
            "html_content": sanitized_html,
            "image_tags": image_tags_array,
            "pdf_tags": pdf_tags_array,
            "flair_tags": flair_tags_array
        }
        console.log(final_data);
        return final_data;
    }


    sumbit_button_function_v2(editable_div, bottom_bar, flair_div, title_bar = null) {
        let html_content = $(editable_div).html();
        // Santize and remove all the unwanted tags.
        let sanitized_html = DOMPurify.sanitize(html_content, { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        // Find all the image tags in bottom bar.
        let image_tags = $(bottom_bar).find("img");
        let pdf_tags = $(bottom_bar).find("a");
        let image_tags_array = [];
        let pdf_tags_array = [];

        for (let i = 0; i < image_tags.length; i++) {
            if (image_tags[i].getAttribute("data-image") == "Yes") {
                let image_data = {
                    "title": image_tags[i].getAttribute("data-title"),
                    "base64": image_tags[i].getAttribute("src")
                }
                image_tags_array.push(image_data);
            }
        }
        for (let i = 0; i < pdf_tags.length; i++) {
            let pdf_data = {
                "title": pdf_tags[i].getAttribute("data-title"),
                "base64": pdf_tags[i].getAttribute("src")
            }
            pdf_tags_array.push(pdf_data);
        }
        // Find all the flair tags in flair div.
        let flair_tags_array;
        if ($(flair_div).attr('data-flair_array')) {
            flair_tags_array = JSON.parse($(flair_div).attr('data-flair_array'));
        } else {
            alert("You must select atleast 1 flair tag.");
            return;
        }

        // for(let i=0; i<flair_tags.length; i++){
        //     if(flair_tags[i].getAttribute("data-chosen")=="Yes"){
        //         flair_tags_array.push($(flair_tags[i]).text());
        //     }
        // }

        if (flair_tags_array.length > 3) {
            alert("You can only select 3 flair tags.");
            return;
        } else if (flair_tags_array.length == 0) {
            flair_tags_array = ["No Flair"];
        }
        let title = "";
        if (title_bar != null) {
            title = $(title_bar).val();
        }
        let final_data = {
            "title": title,
            "html_content": sanitized_html,
            "image_tags": image_tags_array,
            "pdf_tags": pdf_tags_array,
            "flair_tags": flair_tags_array
        }
        console.log(final_data);
        return final_data;
    }



    sumbit_button_function_comment_version(editable_div, bottom_bar) {
        let html_content = $(editable_div).html();
        // Santize and remove all the unwanted tags.
        let sanitized_html = DOMPurify.sanitize(html_content, { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        // Find all the image tags in bottom bar.
        let image_tags = $(bottom_bar).find("img");
        let pdf_tags = $(bottom_bar).find("a");
        let image_tags_array = [];
        let pdf_tags_array = [];
        for (let i = 0; i < image_tags.length; i++) {
            if (image_tags[i].getAttribute("data-image") == "Yes") {
                let image_data = {
                    "title": image_tags[i].getAttribute("data-title"),
                    "base64": image_tags[i].getAttribute("src")
                }
                image_tags_array.push(image_data);
            }
        }
        for (let i = 0; i < pdf_tags.length; i++) {
            let pdf_data = {
                "title": pdf_tags[i].getAttribute("data-title"),
                "base64": pdf_tags[i].getAttribute("src")
            }
            pdf_tags_array.push(pdf_data);
        }
        let final_data = {
            "html_content": sanitized_html,
            "image_tags": image_tags_array,
            "pdf_tags": pdf_tags_array,
        }
        return final_data;
    }

    simple_sumbit_button_function(editor_div) {
        let html_content = $(editor_div).html();
        // Santize and remove all the unwanted tags.
        let sanitized_html = DOMPurify.sanitize(html_content, { ALLOWED_TAGS: ['p', 'b', 'i', 'u', 's', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'th', 'tr', 'td', 'strong', 'em', 'strike', 'figure', 'figcaption', 'div', 'span'] });
        let final_data = {
            "html_content": sanitized_html
        }
        console.log(final_data);
        return final_data;
    }

}
