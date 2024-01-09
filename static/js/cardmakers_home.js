class Card_Makers {
    ClickSearchDropDown(datalist2, select_id, option_div_to_replace) {
        let wrapper_div = document.createElement('div');
        $(wrapper_div).addClass('flex flex-col w-full rounded-md');
        let the_top_selected_option = document.createElement('div');
        $(the_top_selected_option).addClass('hidden md:block appearance-none cursor-pointer w-full p-2 font-bold text-lg text-yellow-500 text-center outline-none rounded-md bg-black hover:bg-gray-900 dark:text-black dark:bg-gray-100 dark:hover:bg-gray-200')
        let len_of_datalist2 = datalist2.length;
        for (let i = 0; i < len_of_datalist2; i++) {
            let dropdown_option = document.createElement('div');
            $(dropdown_option).addClass('cursor-pointer w-full p-2 font-bold text-lg text-yellow-500 text-center outline-none rounded-md bg-black hover:bg-gray-900 dark:text-black dark:bg-gray-100 dark:hover:bg-gray-200')
            dropdown_option.setAttribute('data-value', datalist2[i]);
            dropdown_option.setAttribute('data-index', i);
            dropdown_option.setAttribute('selected', 'false');
        }
    }



}