import React, { Component, useEffect } from 'react';
import LineMarker from "./components/linemarker";
import CodeLine from "./components/codeline.js";
import Container from './state/state.js';
import CodeInput from "./components/codeinput.js";
import "../css/editor.css";

const initiateState = (Store) => {
    var offsetArray, contentArray, tokenArray;

    localStorage.setItem("language", "c");

    if(localStorage.getItem("contentArray") === null){
        contentArray = Array.from({length: Store.lineCount}, (_, i) => "");
        localStorage.setItem("contentArray", JSON.stringify(contentArray));
    }
    else{
        Store.setLineCount(JSON.parse(localStorage.getItem("contentArray")).length)
    }
    if(localStorage.getItem("tokenArray") === null){
        tokenArray = Array.from({length: Store.lineCount}, (_, i) => []);
        localStorage.setItem("tokenArray", JSON.stringify(tokenArray));
    }
    
    contentArray = JSON.parse(localStorage.getItem("contentArray"));
    tokenArray = JSON.parse(localStorage.getItem("tokenArray"));

    Store.setContentArray(contentArray);
    Store.setTokenArray(tokenArray);
}


const Editor = () => {
    const Store = Container.useContainer();
    useEffect(() => {
        if(Store.contentArray === null){
            initiateState(Store);
        }
    }, [Store.contentArray, Store.tokenArray])

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

            console.log(anchor_line, anchor_index);
            console.log(focus_line, focus_index);

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
            console.log(copiedText);
            e.clipboardData.setData('text/plain', copiedText);
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
            <div className="editor_code_wrapper" onCopy={copyToClipboard}>
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
        </div>
    )
}


export default Editor;