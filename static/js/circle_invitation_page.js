var isAnonymous;
var cookie_value;
try {

    cookie_value = document.cookie
        .split('; ')
        .find(row => row.startsWith('data_current_theme'))
        .split('=')[1];
} catch (error) {
    cookie_value = "light";
}
if (cookie_value == "dark") {

    $('html').removeClass('dark')
} else {
    $('html').addClass('dark')

}
$(document).ready(function () {
    if (cookie_value == "dark") {
        $('#switch_theme').text('🌙 switch to light')
        $('#switch_theme').attr('data-current_mode', 'dark')
    } else {
        $('#switch_theme').text('🌞 switch to dark')
        $('#switch_theme').attr('data-current_mode', 'light')
    }
    // Check if user is logged in or not. Ante.
    // Get the circle name from the query string circle_name in the URL.
    new circle_invitation_page_hooks_and_calls().circle_check_and_add_hook()
    // Hooking the search bar.
    let searchbar = document.getElementById('SearchBar');
    let mobile_searchbar = document.getElementById('mobile_searchbar');

    $(searchbar, mobile_searchbar).on('input', function () {
        let number_of_characters = searchbar.value.length;
        if (number_of_characters >= 2) {
            let c1 = new circle_invitation_page_hooks_and_calls().searchbar_call(searchbar.value).then(function (data) {
                let search_results = data['Circles'];
                let main_area = $('#Main_Section_Joining_Card')
                $(main_area).empty().removeClass('').addClass('p-2 pt-10 flex-wrap')
                for (let i = 0; i < search_results.length; i++) {
                    let circle_name = search_results[i]['DisplayName'];
                    let circle_description = search_results[i]['Description'];
                    let circle_tags = search_results[i]['Circle_Tags'];
                    let related_circles = search_results[i]['Related_Circles'];
                    let circle_image = search_results[i]['CircleImage'];
                    let isJoined = search_results[i]['isJoined'];
                    let circle_card = new circle_invitation_page_hooks_and_calls().search_circle_card_maker(circle_name, circle_description, circle_tags, related_circles, isJoined, circle_image);
                    console.log(circle_card)
                    $(main_area).append(circle_card);
                }

            });
        }
    });
    // Switch theme
    let switch_theme_button = document.getElementById('switch_theme');
    $(switch_theme_button).on('click', function () {
        if ($('html').hasClass('dark')) {
            $(switch_theme_button).attr('data-current_mode', 'dark')
        } else {
            $(switch_theme_button).attr('data-current_mode', 'light')
        }
        new circle_invitation_page_hooks_and_calls().switch_theme(switch_theme_button)
    })
});

class circle_invitation_page_hooks_and_calls {
    circle_check_and_add_hook() {
        let circle_name = decodeURIComponent(window.location.search.split('=')[1]);


        let payload = {
            "circle_name": circle_name
        }
        new APICALLS().GenericAPIJSON_CALL('/gboard/user_circle_test', 'POST', JSON.stringify(payload)).then(function (data) {
            if (data["Status"] == "Positive") {
                $('#Join_Circle_Button').text('Already a member or banned').addClass('p-2 bg-gray-500').attr('disabled', true).removeClass('dark:hover:bg-green-600  hover:bg-green-600 cursor-pointer hover:text-white');

            } else if (data["Status"] == "Negative") {
                $('#Join_Circle_Button').text('Join Circle').addClass('p-2 dark:hover:bg-green-600  hover:bg-green-600 cursor-pointer hover:text-white')
            } else if (data["Status"] == "Error") {
                $('#Join_Circle_Button').text('Login/Register').addClass('p-2 text-black dark:text-black bg-yellow-300 dark:hover:bg-yellow-400 hover:bg-yellow-400 ').attr('href', '/login2').removeClass('hover:text-white bg-gray-dark:hover:bg-green-600 hover:bg-green-600 dark:bg-gray-200 bg-gray-800 cursor-pointer ')
                $('#Join_Circle_linker').attr('href', '/login2')
                $('#visiter_text').removeClass('hidden')
            }
        }).catch(function (error) {

        });
    }
    searchbar_hooker() {

    }
    async searchbar_call(search_string) {
        let payload = {
            "search_string": search_string,
            "skip": '0',
        }
        let url = '/api/v1/circle/general/find_circles'
        let r1 = await new APICALLS().GenericAPIJSON_CALL(url, 'POST', JSON.stringify(payload)).then(function (data) {
            return data;

        }).catch(function (error) {
            console.log(error)
        })
        if (r1["isAnonymous"] == "Yes") {
            isAnonymous = "Yes"
        }
        return r1;
    }
    async searchbar_special_call(search_string, special_filter = '') {
        let payload = {
            "search_string": search_string,
            "skip": '0',
            'special_filter': special_filter
        }
        let url = '/api/v1/circle/general/find_circles'
        let r1 = await new APICALLS().GenericAPIJSON_CALL(url, 'POST', JSON.stringify(payload)).then(function (data) {
            return data;

        }).catch(function (error) {
            console.log(error)
        })
        if (r1["isAnonymous"] == "Yes") {
            isAnonymous = "Yes"
        }
        return r1;
    }
    search_circle_card_maker(circle_name, circle_description, circle_tags, related_circles, isJoined, circle_image = '') {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('bg-gray-700 m-2 text-white dark:text-black dark:bg-white dark:eshadow-lg md:w-96 md:h-auto w-full h-auto rounded-md flex flex-col justify-between ');
        // The title of the circle
        let title_span = document.createElement('span');
        $(title_span).addClass('flex flex-col justify-center items-center w-full border-b-2 border-green-400 mb-2');
        let title_h1 = document.createElement('h1');
        title_h1.innerText = circle_name;
        title_h1.setAttribute('class', 'text-2xl p-2 pb-1 font-semibold text-center ');

        // Circle Base64 Image
        let image_span = document.createElement('span');
        $(image_span).addClass('flex flex-col justify-center items-center w-full');
        let image = document.createElement('img');
        image.setAttribute('loading', 'lazy');
        if (circle_image == '') {
            circle_image = '/static/images/logo.png'
        }
        image.setAttribute('src', circle_image);
        image.setAttribute('alt', 'Circle Image');
        image.setAttribute('class', 'w-40 h-40 rounded-lg');

        // The description of the circle
        let description_span = document.createElement('span');
        $(description_span).addClass('flex flex-col justify-center items-center w-full overflow-y-auto p-2 text-ellipsis max-h-40');
        let description_p = document.createElement('p');
        description_p.setAttribute('class', 'text-base p-2 font-semibold text-center text-clip overflow-y-auto');
        description_p.innerText = circle_description;

        // A jinja for loop for circle_tags array.
        let tags_span = document.createElement('span');
        $(tags_span).addClass('flex flex-row justify-center items-center w-full');
        $(tags_span).attr('title', 'related tags list');
        for (let i = 0; i < circle_tags.length; i++) {
            let tag_span = document.createElement('span');
            tag_span.setAttribute('class', 'bg-green-700 p-2 m-1 rounded-md text-sm font-semibold text-white');
            tag_span.innerText = circle_tags[i];
            $(tags_span).append(tag_span);
        }

        // Another jinja for loop for related_circles array with a different color schema and background.
        let related_circles_span = document.createElement('span');
        $(related_circles_span).addClass('flex flex-row justify-center items-center w-full bg-blend-screen');
        $(related_circles_span).attr('title', 'Related circles list');
        for (let i = 0; i < related_circles.length; i++) {
            let circle_span = document.createElement('span');
            circle_span.setAttribute('class', 'bg-blue-700 p-2 m-1 rounded-md text-sm font-semibold text-white');
            circle_span.innerText = related_circles[i];
            $(related_circles_span).append(circle_span);
        }

        // Join button
        let join_button_wrapper = document.createElement('a')
        let join_button = document.createElement('button');
        join_button.setAttribute('id', 'Join_Circle_Button');
        join_button.setAttribute('class', 'dark:bg-gray-200 w-full h-auto bg-gray-800 mt-2 rounded-md dark:hover:bg-green-600  hover:bg-green-600 hover:text-white font-bold cursor-pointer');

        // Visiter text
        let visiter_text = document.createElement('a');
        visiter_text.setAttribute('href', '/home?circle_name=' + circle_name);
        visiter_text.setAttribute('target', '_blank');
        visiter_text.setAttribute('class', 'w-full text-center mt-2 pb-1 text-blue-400  hidden ');
        let visiter_span = document.createElement('span');
        visiter_span.setAttribute('class', ' ');
        visiter_span.innerText = 'Give the circle a visit 👁';

        if (isJoined == "Yes") {
            $(join_button).text('Joined').addClass('p-2 bg-gray-500').attr('disabled', true).removeClass('dark:hover:bg-green-600  hover:bg-green-600 cursor-pointer hover:text-white');
            console.log("We cards fine")
        } else {
            $(join_button).text('Join Circle').addClass('p-2 dark:hover:bg-green-600  hover:bg-green-600 cursor-pointer hover:text-white')
            $(join_button).click(function () {
                let joining_url = '/api/v1/circle/join_circle'
                let payload = {
                    "CircleName": circle_name
                }
                let c1 = new APICALLS().GenericAPIJSON_CALL(joining_url, 'POST', JSON.stringify(payload)).then(function (data) {
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Circle Joined Successfully", ' animate-pulse  bg-black p-2 text-green-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);
                    window.location = '/home?circle_name=' + circle_name
                }).catch(function (error) {
                    console.log(error)
                    let floatin_notif = new floating_notifications_orginal().bottom_bar_notification("Error Joining Circle", ' animate-pulse  bg-black p-2 text-red-500 text-sm font-bold rounded', 3000)
                    $('body').append(floatin_notif);

                })

            })
            if (isAnonymous == "Yes") {
                $(join_button).text('Login/Register').addClass('p-2 bg-yellow-300 text-black dark:text-black dark:hover:bg-yellow-400 hover:bg-yellow-400 ').attr('href', '/login2').removeClass('hover:text-white bg-gray-dark:hover:bg-green-600 hover:bg-green-600 dark:bg-gray-200 bg-gray-800 cursor-pointer ')
                $(join_button).attr('href', '/login2')
                $(visiter_text).removeClass('hidden')
            }
        }
        $(title_span).append(title_h1);
        $(wrapper_div).append(title_span);
        $(image_span).append(image);
        $(wrapper_div).append(image_span);
        $(description_span).append(description_p);
        $(wrapper_div).append(description_span);
        $(wrapper_div).append(tags_span);
        $(wrapper_div).append(related_circles_span);
        $(wrapper_div).append(join_button);
        $(visiter_text).append(visiter_span);
        $(wrapper_div).append(visiter_text);

        return wrapper_div;
    }


    switch_theme(elementor) {
        let current_theme = $(elementor).attr('data-current_mode')
        if ($(elementor).attr('data-current_mode') == 'dark') {
            $(elementor).attr('data-current_mode', 'light')
            $('html').removeClass('dark')
            $(elementor).text('🌞 switch to light')
            current_theme = 'dark'
        } else {
            $(elementor).attr('data-current_mode', 'dark')
            $(elementor).text('🌙 switch to dark')
            $('html').addClass('dark')
            current_theme = 'light'
        }
        document.cookie = "data_current_theme=" + current_theme + ";path=/" + "; expires=Fri, 31 Dec 9999 23:59:59 GMT;";
    }



}