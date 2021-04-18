import {useState} from 'react';
import { createContainer } from "unstated-next";

function useStore(){
	const [tabWidth, setTabWidth] = useState(4);
    const [lineHeight, setLineHeight] = useState(20);
    const [lineCount, setLineCount] = useState(30);
    const [contentArray, setContentArray] = useState(null);
    const [tokenArray, setTokenArray] = useState(null);
    const [cursorLine, setCursorLine] = useState(0);
    const [cursorIndex, setCursorIndex] = useState(0);
    const [cursorOffset, setCursorOffset] = useState(0);

    return {tabWidth, setTabWidth, lineHeight, setLineHeight, lineCount, setLineCount, cursorOffset, setCursorOffset, contentArray, setContentArray, tokenArray, setTokenArray, cursorLine, setCursorLine, cursorIndex, setCursorIndex};
}

let Container = createContainer(useStore);

export default Container;