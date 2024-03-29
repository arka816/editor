import React from 'react';
import CodeSpan from "./codespan.jsx";
import Container from '../state/state.js';

const Codeline = ({line, setSuggestions}) => {
    const Store = Container.useContainer();
    const findWidthofChar = (c) => {
        c = c.replaceAll(" ", "\u00a0");
        var elem = document.getElementById('text_width_finder');
        elem.innerText = c;
        let width = elem.getBoundingClientRect().width;
        return width;
    }
    const focusLine = () => {
        if(line !== Store.cursorLine) setSuggestions([]);
        Store.setLine(line);
        Store.setCursorIndex(Store.contentArray[line].length);
        Store.setCursorOffset(findWidthofChar(Store.contentArray[line]));
        document.getElementById("edit_textarea").focus();
    }
    return (
        <div 
            data-line={line}
            id={"editor_code_line_" + line}
            className="editor_code_line" 
            style={{height: Store.lineHeight + "px", backgroundColor: line === Store.cursorLine ? "#202020" : "#272822", top: (Store.lineHeight * (line)) + "px"}}
            onClick={focusLine}
        >
            {
                Store.tokenArray === null || Store.tokenArray === undefined ? "" : 
                (
                    Store.tokenArray[line] === null || Store.tokenArray[line] === undefined ? "" :
                    Store.tokenArray[line].map((value, index) => (
                        <CodeSpan 
                            key={index}
                            index={index}
                            code={value[0]}
                            category={value[1]}
                            line={line}
                            setSuggestions={setSuggestions}
                        />
                    ))
                )
            }
        </div>
    )
}

export default Codeline;