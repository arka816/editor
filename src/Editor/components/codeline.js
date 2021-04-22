import React from 'react';
import CodeSpan from "./codespan";
import Container from '../state/state.js';

const Codeline = ({line}) => {
    const Store = Container.useContainer();
    const findWidthofChar = (c) => {
        c = c.replaceAll(" ", "\u00a0");
        var elem = document.getElementById('text_width_finder');
        elem.innerText = c;
        let width = elem.getBoundingClientRect().width;
        return width;
    }
    const focusLine = () => {
        Store.setCursorLine(line);
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
                Store.tokenArray === null ? "" : 
                Store.tokenArray[line].map((value, index) => (
                    <CodeSpan 
                        key={index}
                        index={index}
                        code={value[0]}
                        category={value[1]}
                        line={line}
                    />
                ))
            }
        </div>
    )
}

export default Codeline;