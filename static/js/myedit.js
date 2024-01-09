
$(document).ready(function () {
    var editor = new GEditor();
    let ed_class="w-full h-2/6 bg-gray-900 p-2 pl-4 outline-none text-gray-200"
    let tool_bar_options={};
    var editor_div = editor.geditor(ed_class,tool_bar_options);
    document.body.appendChild(editor_div[0]);
});

class GEditor{
    geditor(editable_div_class,tool_bar_options){
        let wrapper_div = document.createElement("div");
        let Editable_Div = document.createElement("div");
        Editable_Div.setAttribute("contenteditable", "true");
        Editable_Div.setAttribute("class", editable_div_class);

        let tool_bar = new Tool_Bar(Editable_Div);
        let tool_bar_main = tool_bar.tool_bar(tool_bar_options);
        let bottom_bar2= new bottom_bar().main_div();

        wrapper_div.appendChild(tool_bar_main);
        wrapper_div.appendChild(Editable_Div);
        wrapper_div.appendChild(bottom_bar2[0]);

        return [wrapper_div,Editable_Div]
    }

}

class Tool_Bar{

    constructor(Editable_Div_Area){
        this.Editable_Div_Area=Editable_Div_Area;
    }


    tool_bar(options){
        console.log(this.Editable_Div_Area);
        let tool_bar = document.createElement("div");
        tool_bar.setAttribute("class", "flex flex-row bg-gray-900 p-2 border-b-2 border-gray-700");
        let bold_button = this.tool_bar_bold();
        let italics_button = this.tool_bar_italics();
        let underline_button = this.tool_bar_underline();
        let unordered_list_button = this.tool_bar_unordered_list();
        let ordered_list_button = this.tool_bar_ordered_list();
        tool_bar.appendChild(bold_button);
        tool_bar.appendChild(italics_button);
        tool_bar.appendChild(underline_button);
        tool_bar.appendChild(unordered_list_button);
        tool_bar.appendChild(ordered_list_button);
        return tool_bar;
    }

    tool_bar_bold(){
        let button = document.createElement("button");
        button.setAttribute("class", "bg-gray-500 hover:bg-gray-800 text-white font-bold p-2 mr-2 rounded");
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
                button.style.backgroundColor = "green";
            }
            else {
                button.style.backgroundColor = "gray";
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('bold', false, null);
        });
        return button;
    }

    tool_bar_italics(){
        let button = document.createElement("button");
        button.setAttribute("class", "bg-gray-500 hover:bg-gray-700 text-white font-bold p-2 mr-2 rounded");
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
                button.style.backgroundColor = "green";
            }
            else {
                button.style.backgroundColor = "gray";
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('italic', false, null);
        });
        return button;
    }

    tool_bar_underline(){
        let button = document.createElement("button");
        button.setAttribute("class", "bg-gray-500 hover:bg-gray-700 text-white font-bold p-2 mr-2  rounded");
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
                button.style.backgroundColor = "green";
            }
            else {
                button.style.backgroundColor = "gray";
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('underline', false, null);
        });
        return button;
    }

    tool_bar_unordered_list(){
        let button = document.createElement("button");
        button.setAttribute("class", "bg-gray-500 hover:bg-gray-700 text-white font-bold  p-2 mr-2 rounded");
        button.innerHTML = "UL";
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
                button.style.backgroundColor = "green";
            }
            else {
                button.style.backgroundColor = "gray";
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('insertUnorderedList', false, null);
        });
        return button;
    }

    tool_bar_ordered_list(){
        let button = document.createElement("button");
        button.setAttribute("class", "bg-gray-500 hover:bg-gray-700 text-white font-bold p-2 mr-2 rounded");
        button.innerHTML = "OL";
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
                button.style.backgroundColor = "green";
            }
            else {
                button.style.backgroundColor = "gray";
            }
        });
        $(button).click(function () {
            $(guDiv).focus();
            document.execCommand('insertOrderedList', false, null);
        });
        return button;
    }

    tool_bar_bold2(){
        let button = document.createElement("button");
        button.setAttribute("class", "bg-gray-500 hover:bg-gray-700 text-white font-bold p-2  rounded");
        button.innerHTML = "B";
        const guDiv = this.Editable_Div_Area;
        guDiv.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === 'b') {
                        e.preventDefault();
                        const selection = window.getSelection();
                        let spaner = document.createElement('span');
                        if (selection.anchorNode.parentNode.classList.contains('!font-bold')) {
                            // alert("Already Bold");
                            let range = selection.getRangeAt(0);
                            // 
                        }else if (selection.toString().length) {
                            let range = selection.getRangeAt(0);
                            spaner.setAttribute("class", "!font-bold");
                            range.surroundContents(spaner);
                        }
                    }
        });

        return button;
    }


} // End of class GU_Editor Tools

class bottom_bar{
    main_div(){
        let wrapperdiv = document.createElement("div");
        wrapperdiv.setAttribute("class", "flex flex-row  p-2 border-t-2 border-gray-700 bg-gray-900");
        let right_div= document.createElement("div");
        right_div.setAttribute("class", "p-2 text-center bg-green-500 text-base text-gray-200 font-bold rounded float-right ml-auto hover:bg-green-700");
        right_div.innerHTML = "Submit";
        wrapperdiv.appendChild(right_div);
        return [wrapperdiv, right_div];
    }


}

// Tailwind cheaters. -- "list-disc"