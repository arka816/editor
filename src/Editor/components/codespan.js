import React from 'react';
import Container from '../state/state.js';

const CodeSpan = ({code, category, line, index}) => {
    const Store = Container.useContainer();
    code = code.replaceAll(" ", "\u00a0");
    var colorCode = {
        type: "#5CD9EF",
        qualifier: "#5CD9EF",
        keyword: "#F92665",
        operator: "#F92665",
        punctuator: "#FFFFFF",
        escapeseq: "#7C75FF",
        error: "#FFFFFF",
        identifier: "#FFFFFF",
        string_literal: "#E6DB74",
        char_literal: "#E6DB74",
        numeric_literal: "#7C75FF",
        single_line_comment: "#1e9104",
        multi_line_comment: "#1e9104",
        multi_line_comment_start: "#1e9104",
        multi_line_comment_end: "#1e9104",
        indentation_guide_1: "transparent",
        indentation_guide_2: "transparent"
    };

    var color = colorCode[category];

    const findWidthofChar = (c) => {
        c = c.replace(/ /g, "&nbsp");
        var elem = document.getElementById('text_width_finder');
        elem.innerHTML = c;
        let width = elem.getBoundingClientRect().width;
        return width;
    }

    const handleChange = (e) => {
        var x = e.offsetX || e.nativeEvent.offsetX;
        x = e.clientX - e.target.getBoundingClientRect().left;
        e.stopPropagation();
        e.preventDefault();
        Store.setCursorLine(line);
        var l = Store.tokenArray[line].slice(0, index).reduce(function(a, b){
            if(Array.isArray(a)) return a[0].length + b[0].length;
            return a + b[0].length
        }, 0);
        var w = 0;
        var i = 0;
        for(i = 0; i < code.length; i++){
            w += findWidthofChar(code[i]);
            if(w > x){
                if((w-x) < (x - w + findWidthofChar(code[i]))) i = i + 1;
                break;
            }
        }
        Store.setCursorIndex(l + i);
        Store.setCursorOffset(findWidthofChar(Store.contentArray[line].slice(0, l + i)))
        document.getElementById("edit_textarea").focus();
    }
    
    return (
        <span 
            data-index={index}
            contentEditable="false" 
            spellCheck="false"
            className={category === "indentation_guide_1" ? "editor_code_span editor_code_span_indentation" : "editor_code_span"}
            style={{color: color, fontStyle: category === "type" || category === "qualifier" ? "italic" : "normal"}}
            onClick = {handleChange}
            suppressContentEditableWarning={true}
        >
            {code}
        </span>    
    )
}

export default CodeSpan;