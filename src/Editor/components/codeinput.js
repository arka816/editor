import React, {useState} from 'react';
import Container from '../state/state.js';
var language = localStorage.getItem("language") || 'c';
const tokenizer = require("../engine/" + language + "/tokenizer.js");

const dualPunctuators = ["(", "{", "["];
const dualPunctuatorsCounterpart = [")", "}", "]"];

const CodeInput = () => {
    const Store = Container.useContainer();
	const [stringMode, setStringMode] = useState(false);
    const [charMode, setCharMode] = useState(false);
    const [lastIndex, setLastIndex] = useState(null);
    const [lastMovement, setLastMovement] = useState(null);

    const findWidthofChar = (c) => {
        c = c.replace(/ /g, "&nbsp");
        var elem = document.getElementById('text_width_finder');
        elem.innerHTML = c;
        let width = elem.getBoundingClientRect().width;
        return width;
    }

    const updateStorage = () => {
    	localStorage.setItem('contentArray', JSON.stringify(Store.contentArray));
    	localStorage.setItem('tokenArray', JSON.stringify(Store.tokenArray));
    }

    const inputHandler = (e) => {
    	let textarea = e.target;
        let newChar = textarea.value;
        textarea.value = "";

        let index = Store.cursorIndex;
		let content = Store.contentArray[Store.cursorLine];

        if(dualPunctuators.includes(newChar)){
        	let counterPunctuator = dualPunctuatorsCounterpart[dualPunctuators.indexOf(newChar)];
        	Store.setCursorIndex(index + 1);
        	Store.setCursorOffset(Store.cursorOffset + findWidthofChar(newChar));
        	content = content.slice(0, index) + newChar + counterPunctuator + content.slice(index);
    		let tokens = tokenizer.tokenize(content);
    		Store.contentArray[Store.cursorLine] = content;
    		Store.tokenArray[Store.cursorLine] = tokens;
    		updateStorage();
        }
        else if(newChar === "\"" && ((index > 1 && content[index - 2] !== "\\") || index <= 1)){
        	setStringMode(!stringMode);
        	Store.setCursorIndex(index + 1);
        	Store.setCursorOffset(Store.cursorOffset + findWidthofChar(newChar));
        	content = content.slice(0, index) + '""' + content.slice(index);
    		let tokens = tokenizer.tokenize(content);
    		Store.contentArray[Store.cursorLine] = content;
    		Store.tokenArray[Store.cursorLine] = tokens;
    		updateStorage();
        }
        else if(newChar === "'" && ((index > 1 && content[index - 2] !== "\\") || index <= 1)){
        	setCharMode(!charMode);
        	Store.setCursorIndex(index + 1);
        	Store.setCursorOffset(Store.cursorOffset + findWidthofChar(newChar));
        	content = content.slice(0, index) + "''" + content.slice(index);
    		let tokens = tokenizer.tokenize(content);
    		Store.contentArray[Store.cursorLine] = content;
    		Store.tokenArray[Store.cursorLine] = tokens;
    		updateStorage();
        }
        else{
        	Store.setCursorIndex(index + 1);
        	Store.setCursorOffset(Store.cursorOffset + findWidthofChar(newChar));
        	content = content.slice(0, index) + newChar + content.slice(index);
    		let tokens = tokenizer.tokenize(content);
    		Store.contentArray[Store.cursorLine] = content;
    		Store.tokenArray[Store.cursorLine] = tokens;
    		updateStorage();
        }
    }

    const insertNewLine = (line, content) => {
        Store.setLineCount(Store.lineCount + 1);
        Store.contentArray.splice(line, 0, content);
        Store.tokenArray.splice(line, 0, tokenizer.tokenize(content));
        Store.setCursorLine(line);
        Store.setCursorIndex(0);
        Store.setCursorOffset(0);
        updateStorage();
    }

    const keyHandler = async (e) => {
    	var key = e.keyCode || e.charCode;
    	var line = Store.cursorLine;
    	var content = Store.contentArray[line];
    	var index = Store.cursorIndex;
    	//var input = e.target;

    	if(key === 8){
    		// BACKSPACE
    		e.preventDefault();
    		
    	}
    	else if(key === 9){  
            // TAB
            e.preventDefault();
            let n = Store.tabWidth - (index % Store.tabWidth);
            let s = " ".repeat(n);
            content = content.slice(0, index) + s + content.slice(index);
            Store.setCursorIndex(index + n);
            Store.setCursorOffset(Store.cursorOffset + findWidthofChar(s));
            let tokens = tokenizer.tokenize(content);
            Store.contentArray[Store.cursorLine] = content;
    		Store.tokenArray[Store.cursorLine] = tokens;
    		updateStorage();
        }
        else if(key === 13){
        	// ENTER
        	e.preventDefault();
            e.stopPropagation();
            let s = content.substring(0, index);
            Store.contentArray[line] = s;
            Store.tokenArray[line] = tokenizer.tokenize(s);
            insertNewLine(line + 1, content.substring(index));
        }
    	else if(key === 37){
    		// LEFT ARROW
    		if(index > 0){
    			Store.setCursorIndex(index - 1);
    			Store.setCursorOffset(findWidthofChar(content.slice(0, index-1)));
    			setLastMovement('L');
    		}
    		else{
    			if(line - 1 >= 0){
    				Store.setCursorIndex(Store.contentArray[line - 1].length);
	    			Store.setCursorOffset(findWidthofChar(Store.contentArray[line - 1]));
	    			Store.setCursorLine(line - 1);
	    			setLastMovement('L');
    			}
    		}
    	}
    	else if(key === 38){
            // 	UP ARROW
            if(line > 0){
            	if(lastMovement === 'R' || lastMovement === 'L' || lastMovement === null){
	            	await setLastIndex(index);
	            }
            	setLastMovement('U');
                let i = Math.min(lastIndex || index, Store.contentArray[line - 1].length);
                Store.setCursorLine(line - 1);
                Store.setCursorIndex(i);
                Store.setCursorOffset(findWidthofChar(Store.contentArray[line - 1].substring(0, i)));
                //input.scrollIntoView();
            }
        }
        else if(key === 40){
            // 	DOWN ARROW
            if(line +1 < Store.lineCount){
            	if(lastMovement === 'R' || lastMovement === 'L' || lastMovement === null){
	            	await setLastIndex(index);
	            }
            	setLastMovement('U');
                let i = Math.min(lastIndex || index, Store.contentArray[line + 1].length);
                Store.setCursorLine(line + 1);
                Store.setCursorIndex(i);
                Store.setCursorOffset(findWidthofChar(Store.contentArray[line + 1].substring(0, i)));
                //input.scrollIntoView();
            }
        }
    	else if(key === 39){
    		// RIGHT ARROW
    		if(index < content.length){
    			Store.setCursorIndex(index + 1);
    			Store.setCursorOffset(findWidthofChar(content.slice(0, index+1)));
    			setLastMovement('R');
    		}
    		else{
    			if(line + 1 < Store.lineCount){
    				Store.setCursorIndex(0);
	    			Store.setCursorOffset(0);
	    			Store.setCursorLine(line + 1);
	    			setLastMovement('R');
    			}
    		}
    	}
    }

	return (
        <textarea
            id={"edit_textarea"}
            style={{
                height: Store.lineHeight + "px",
                top: (Store.lineHeight * (Store.cursorLine)) + "px",
                left: (Store.cursorOffset ? Store.cursorOffset : 0) + "px",
                lineHeight: Store.lineHeight + "px"
            }}
            autoFocus
            wrap="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            onInput={inputHandler}
            onKeyDown={keyHandler}
        >
        </textarea>    
    )
}

export default CodeInput;