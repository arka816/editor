import React, { useEffect, useState } from 'react';
import LineMarker from "./components/linemarker";
import CodeLine from "./components/codeline.js";
import Container from './state/state.js';
import CodeInput from "./components/codeinput.js";
import TextSearch from "./components/textsearch";
import "../css/editor.css";

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


const Editor = () => {
    const [findMode, setFindMode] = useState(false);
    const Store = Container.useContainer();
    useEffect(() => {
        if(Store.contentArray === null){
            initiateState(Store);
        }
    }, [Store, Store.contentArray, Store.tokenArray])

    const copyToClipboard = (e) => {
        e.preventDefault();
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

            //console.log(anchor_line, anchor_index);
            //console.log(focus_line, focus_index);

            let copiedText = "";
            copiedText += Store.tokenArray[anchor_line][anchor_index][0].slice(anchor_offset);
            for(var i = anchor_index + 1; i < Store.tokenArray[anchor_line].length; i++){
                copiedText += Store.tokenArray[anchor_line][i][0];
            }
            copiedText += "\n";
            for(let i = anchor_line + 1; i < focus_line; i++){
                copiedText += Store.contentArray[i];
                copiedText += "\n";
            }
            for(let i = 0; i < focus_index; i++){
                copiedText += Store.tokenArray[focus_line][i][0];
            }
            copiedText += Store.tokenArray[focus_line][focus_index][0].slice(0, focus_offset);
            //console.log(copiedText);
            e.clipboardData.setData('text/plain', copiedText);
        }
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
            setFindMode(true);
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

            setFindMode(false);
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
    }

    var lines = Array.from({length: Store.lineCount}, (_, i) => i)
    return (
        <div className="editor_wrapper" id="editor_wrapper">
            <div className="editor_line_marker_wrapper">
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
            <div className="editor_code_wrapper" onCopy={copyToClipboard} onKeyDown={keyHandler}>
                {findMode ? <TextSearch setFindMode={setFindMode} /> : ""}
                <CodeInput />
                {lines.map((val, index) => {
                    return (
                        <CodeLine 
                            key={index}
                            line={index}
                        />
                    )
                })}
            </div>
            <canvas id="search_overview" width="6" height="400">
            </canvas>
            <button onClick={verbose} style={{display: "none"}}>Verbose</button>
        </div>
    )
}


export default Editor;