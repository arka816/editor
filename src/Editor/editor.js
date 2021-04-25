import React, { useEffect, useState } from 'react';
import LineMarker from "./components/linemarker.jsx";
import CodeLine from "./components/codeline.jsx";
import Container from './state/state.js';
import CodeInput from "./components/codeinput.jsx";
import TextSearch from "./components/textsearch.jsx";
import Suggestion from "./components/suggestion.jsx";
import TST from "./suggestion-engine/tst";
import "../css/editor.css";
var language = localStorage.getItem("language") || 'c';
const tokenizer = require(`./engine/${language}/tokenizer.js`);
const vocabulary = require(`./engine/${language}/language.json`);


function objectToArray(p){
    var keys = Object.keys(p);
    keys.sort(function(a, b) {
        return a - b;
    });

    var arr = [];
    for (var i = 0; i < keys.length; i++) {
        arr.push(p[keys[i]]);
    }
    return arr;
}

const initiateState = (Store) => {
    var contentArray, tokenArray;

    localStorage.setItem("language", "c");

    if(localStorage.getItem("contentArray") === null){
        contentArray = Array.from({length: Store.lineCount}, (_, i) => "");
        localStorage.setItem("contentArray", JSON.stringify(contentArray));
    }
    else{
        Store.setLineCount(Object.keys(JSON.parse(localStorage.getItem("contentArray"))).length)
    }
    if(localStorage.getItem("tokenArray") === null){
        tokenArray = Array.from({length: Store.lineCount}, (_, i) => []);
        localStorage.setItem("tokenArray", JSON.stringify(tokenArray));
    }
    
    contentArray = JSON.parse(localStorage.getItem("contentArray"));
    tokenArray = JSON.parse(localStorage.getItem("tokenArray"));

    Store.setContentArray(objectToArray(contentArray));
    Store.setTokenArray(objectToArray(tokenArray));
}

const downloadFile = (codeString, filename) => {
    codeString = codeString.trimRight("\n") + "\n";
    var codeBlob = new Blob([codeString], {
        type: "text/plain"
    });
    var url = URL.createObjectURL(codeBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const findWidthofChar = (c) => {
    c = c.replaceAll(" ", "\u00a0");
    var elem = document.getElementById('text_width_finder');
    elem.innerText = c;
    let width = elem.getBoundingClientRect().width;
    return width;
}




const Editor = () => {
    const [selected, setSelected] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const Store = Container.useContainer();

    useEffect(() => {
        if(Store.contentArray === null){
            initiateState(Store);
        }
    }, [Store.contentArray])

    useEffect(() => {
        if(Store.tst === null){
            createSuggestionEngine();
        }
    }, [Store.tst]);

    const createSuggestionEngine = () => {
        Store.tst = new TST();
        for(var key in vocabulary){
            for(var word of vocabulary[key]){
                Store.tst.insert(word, key);
            }
        }
    }

    document.onselectionchange = () => {
        if(window.getSelection().toString().length > 0){
            setSelected(true);
            document.getElementById("editor_code_wrapper").focus();
        }
    }


    const updateStorage = () => {
    	localStorage.setItem('contentArray', JSON.stringify(Store.contentArray));
    	localStorage.setItem('tokenArray', JSON.stringify(Store.tokenArray));
    }

    document.addEventListener("keydown", (e) => {
        var key = e.keyCode || e.charCode;
        var selection = window.getSelection();

        if(selection.toString().length > 0 && Store.contentArray){
            try{
                if(key === 46 || key === 8){
                    // BACKSPACE OR DELETE TO CLEAR SELECTION
                    let anchor_line = parseInt(selection.anchorNode.parentElement.parentElement.dataset.line);
                    let anchor_index = parseInt(selection.anchorNode.parentElement.dataset.index);
                    let anchor_offset = selection.anchorOffset;
                    let focus_line = parseInt(selection.focusNode.parentElement.parentElement.dataset.line);
                    let focus_index = parseInt(selection.focusNode.parentElement.dataset.index);
                    let focus_offset = selection.focusOffset;
        
                    if(focus_line < anchor_line) [anchor_line, focus_line] = [focus_line, anchor_line];

                    let i1 = 0;
                    for(let i = 0; i < anchor_index; i++){
                        i1 += Store.tokenArray[anchor_line][i][0].length;
                    }
                    i1 += anchor_offset;
        
                    let i2 = 0;
                    for(let i = 0; i < focus_index; i++){
                        i2 += Store.tokenArray[focus_line][i][0].length;
                    }
                    i2 += focus_offset;
        
                    clearSelection(anchor_line, i1, focus_line, i2);
                    Store.setCursorLine(anchor_line);
                    Store.setCursorIndex(i1);
                    Store.setCursorOffset(findWidthofChar(Store.contentArray[anchor_line].slice(0, i1)));
                    e.stopImmediatePropagation();
                }
                else if(key === 9){
                    if(e.shiftKey){
                        // Shift + Tab TO BACK INDENT SELECTION
                        let anchor_line = parseInt(selection.anchorNode.parentElement.parentElement.dataset.line);
                        let focus_line = parseInt(selection.focusNode.parentElement.parentElement.dataset.line);
                        let focus_index = parseInt(selection.focusNode.parentElement.dataset.index);
                        let focus_offset = selection.focusOffset;

                        if(focus_line < anchor_line) [anchor_line, focus_line] = [focus_line, anchor_line];
        
                        let i2 = 0;
                        for(let i = 0; i < focus_index; i++){
                            i2 += Store.tokenArray[focus_line][i][0].length;
                        }
                        i2 += focus_offset;
    
                        var content, count, s, l;
    
                        for(let line = anchor_line; line <= focus_line; line++){
                            content = Store.contentArray[line];
                            l = content.length;
                            content = content.trimLeft();
                            count = (l - content.length);
                            if(count % Store.tabWidth === 0) count -= 4;
                            else count = count - (count % Store.tabWidth);
                            s = " ".repeat(count);
                            Store.tokenArray[line] = tokenizer.tokenize(s + content);
                            Store.contentArray[line] = s + content;
                        }
        
                        Store.setCursorLine(focus_line);
                        i2 -= (l - content.length);
                        Store.setCursorIndex(i2);
                        Store.setCursorOffset(findWidthofChar(Store.contentArray[focus_line].slice(0, i2)));
                    }
                    else{
                        // Tab TO INDENT SELECTION
                        let anchor_line = parseInt(selection.anchorNode.parentElement.parentElement.dataset.line);
                        let focus_line = parseInt(selection.focusNode.parentElement.parentElement.dataset.line);
                        let focus_index = parseInt(selection.focusNode.parentElement.dataset.index);
                        let focus_offset = selection.focusOffset;

                        if(focus_line < anchor_line) [anchor_line, focus_line] = [focus_line, anchor_line];
        
                        let i2 = 0;
                        for(let i = 0; i < focus_index; i++){
                            i2 += Store.tokenArray[focus_line][i][0].length;
                        }
                        i2 += focus_offset;
        
                        let s = " ".repeat(Store.tabWidth);
                        for(let line = anchor_line; line <= focus_line; line++){
                            Store.tokenArray[line] = tokenizer.tokenize(s + Store.contentArray[line]);
                            Store.contentArray[line] = s + Store.contentArray[line];
                        }
        
                        Store.setCursorLine(focus_line);
                        Store.setCursorIndex(i2 + Store.tabWidth);
                        Store.setCursorOffset(findWidthofChar(s + Store.contentArray[focus_line].slice(0, i2)));
                    }
                    if (window.getSelection().empty) {  
                        // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  
                        // Firefox
                        window.getSelection().removeAllRanges();
                    }
            
                    updateStorage();
                    e.stopImmediatePropagation();
                }
            }catch{
                //console.log("corrupted selection");
            }
        }
    })

    const clearSelection = (x1, y1, x2, y2) => {
        let c1 = Store.contentArray[x1].slice(0, y1);
        let c2 = Store.contentArray[x2].slice(y2);

        Store.contentArray.splice(x1+1, x2 - x1);
        Store.tokenArray.splice(x1+1, x2 - x1);
        Store.setLineCount(Store.lineCount - x2 + x1);

        Store.contentArray[x1] = c1 + c2;
        Store.tokenArray[x1] = tokenizer.tokenize(c1 + c2);

        if (window.getSelection().empty) {  
            // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  
            // Firefox
            window.getSelection().removeAllRanges();
        }

        updateStorage();
    }

    const cutToClipboard = (e) => {
        const [anchor_line, anchor_content_index, focus_line, focus_content_index] = copyToClipboard(e);
        clearSelection(anchor_line, anchor_content_index, focus_line, focus_content_index);
        Store.setCursorLine(anchor_line);
        Store.setCursorIndex(anchor_content_index);
        Store.setCursorOffset(findWidthofChar(Store.contentArray[anchor_line].slice(0, anchor_content_index)));
        document.getElementById('edit_textarea').focus();
    }

    const copyToClipboard = (e) => {
        e.preventDefault();
        e.stopPropagation();
        let selection = window.getSelection();
        if(selection.toString().length > 0){
            let anchor_line = parseInt(selection.anchorNode.parentElement.parentElement.dataset.line);
            let anchor_index = parseInt(selection.anchorNode.parentElement.dataset.index);
            let anchor_offset = selection.anchorOffset;
            let focus_line = parseInt(selection.focusNode.parentElement.parentElement.dataset.line);
            let focus_index = parseInt(selection.focusNode.parentElement.dataset.index);
            let focus_offset = selection.focusOffset;

            if((focus_line < anchor_line) || (focus_line === anchor_line && focus_index < anchor_index)){
                [anchor_line, focus_line] = [focus_line, anchor_line];
                [anchor_index, focus_index] = [focus_index, anchor_index];
                [anchor_offset, focus_offset] = [focus_offset, anchor_offset];
            }

            let copiedText = "";
            copiedText += Store.tokenArray[anchor_line][anchor_index][0].slice(anchor_offset);
            for(var i = anchor_index + 1; i < Store.tokenArray[anchor_line].length; i++){
                copiedText += Store.tokenArray[anchor_line][i][0];
            }
            let anchor_content_index = Store.contentArray[anchor_line].length - copiedText.length;
            copiedText += "\n";
            for(let i = anchor_line + 1; i < focus_line; i++){
                copiedText += Store.contentArray[i];
                copiedText += "\n";
            }
            let focus_content_index = 0;
            for(let i = 0; i < focus_index; i++){
                focus_content_index += Store.tokenArray[focus_line][i][0].length;
                copiedText += Store.tokenArray[focus_line][i][0];
            }
            copiedText += Store.tokenArray[focus_line][focus_index][0].slice(0, focus_offset);
            focus_content_index += focus_offset;

            e.clipboardData.setData('text/plain', copiedText);
            return [anchor_line, anchor_content_index, focus_line, focus_content_index];
        }
        return null;
    }

    const verbose = () => {
        console.log(Store.cursorIndex);
        console.log(Store.cursorOffset);
        console.log(Store.cursorLine);
    }

    const keyHandler = (e) => {
        var key = e.keyCode || e.charCode;

        if(key === 70 && e.ctrlKey){
            // Ctrl + F FIND FUNCTIONALITY
            e.preventDefault();
            e.stopPropagation();
            let search = document.getElementById('text_search');
            search.classList.remove('text_search_animation_rev');
            search.classList.add('text_search_animation');
            setSuggestions([]);
        }
        else if(key === 27){
            // ESC
            e.preventDefault();
            e.stopPropagation();
            let highlights = document.getElementsByClassName('text_search_highlight');
            while(highlights.length > 0){
                highlights[0].remove();
            }

            let canvas = document.getElementById('search_overview');
            canvas.style.display="none";
            let context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height)

            let search = document.getElementById('text_search');
            search.classList.remove('text_search_animation');
            search.classList.add('text_search_animation_rev');

            setSuggestions([]);
        }
        else if(key === 83 && e.ctrlKey){
            // Ctrl + S FOR SAVE
            e.preventDefault();
            e.stopPropagation();
            var codeString = "";
            var line;
            for(line of Store.contentArray){
                codeString += line + "\n";
            }
            downloadFile(codeString, "sush.c");
        }
        else if(key === 46 && e.ctrlKey){
            // Ctrl + Del FOR CLEARING
            e.preventDefault();
            e.stopPropagation();
            localStorage.removeItem('contentArray');
            localStorage.removeItem('tokenArray');
            initiateState(Store);
            Store.setCursorLine(0);
            Store.setCursorLine(0);
        }
        else if(key === 32 && e.ctrlKey){
            // Ctrl + Space FOR SUGGESTION
            e.preventDefault();
            e.stopPropagation();
            var index = 0, l = 0, line = Store.cursorLine;
            while(l < Store.cursorIndex){
                l += Store.tokenArray[line][index][0].length;
                index += 1;
            }
            index -= 1;
            var offset = Store.tokenArray[line][index][0].length - (l - Store.cursorIndex);
            var word = Store.tokenArray[line][index][0].slice(0, offset);
            
            if(Store.tst === null){
                createSuggestionEngine();
            }
            let matches = Store.tst.partialSearch(word);
            setSuggestions(matches);
            let elem = document.getElementById('suggestion_container');
            elem.style.top = (Store.lineHeight * (line + 1)) + "px";
            elem.style.left = document.getElementById('edit_textarea').style.left;
        }
    }

    const scrollX = (e) => {
        let lineMarker = document.getElementById('editor_line_marker_wrapper');
        lineMarker.style.left = e.target.scrollLeft + "px";
    }

    var lines = Array.from({length: Store.lineCount}, (_, i) => i)
    return (
        <div className="editor_wrapper" id="editor_wrapper" onScroll={scrollX}>
            <div className="editor_line_marker_wrapper" id="editor_line_marker_wrapper">
                {lines.map((val, index) => {
                    return (
                        <LineMarker 
                            key={index} 
                            number={val} 
                            isContractible={false} 
                            isContracted= {false}
                        />
                    )
                })}
            </div>
            <div className="editor_scroll_wrapper">
                <div 
                    id="editor_code_wrapper"
                    className="editor_code_wrapper" 
                    onCopy={copyToClipboard} 
                    onCut={cutToClipboard} 
                    onKeyDown={keyHandler}
                >
                    <Suggestion suggestions={suggestions} />
                    <TextSearch />
                    <CodeInput setSuggestions={setSuggestions} />
                    {lines.map((val, index) => {
                        return (
                            <CodeLine 
                                key={index}
                                line={index}
                                setSuggestions={setSuggestions}
                            />
                        )
                    })}
                </div>
            </div>
            <canvas id="search_overview" width="6" height="400">
            </canvas>
            <button onClick={verbose} style={{display: "none"}}>Verbose</button>
        </div>
    )
}


export default Editor;