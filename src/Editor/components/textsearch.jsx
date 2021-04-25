import React, {useState} from "react";
import Container from '../state/state.js';
import SearchIcon from '@material-ui/icons/Search';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import CloseIcon from '@material-ui/icons/Close';

const TextSearch = () => {
    const [found, setFound] = useState(false);
    const [searchIndex, setSearchIndex] = useState(0);
    const [highlightElems, setHighlightElems] = useState([]);
    const Store = Container.useContainer();


    const findWidthofChar = (c) => {
        c = c.replaceAll(" ", "\u00a0");
        var elem = document.getElementById('text_width_finder');
        elem.innerText = c;
        let width = elem.getBoundingClientRect().width;
        return width;
    }

    const close = () => {
        let highlights = document.getElementsByClassName('text_search_highlight');
        while(highlights.length > 0){
            highlights[0].remove();
        }

        let canvas = document.getElementById('search_overview');
        canvas.style.display="none";
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        setHighlightElems([]);
        let search = document.getElementById('text_search');
        search.classList.remove('text_search_animation');
        search.classList.add('text_search_animation_rev');
    }

    const search = () => {
        let highlights = document.getElementsByClassName('text_search_highlight');
        while(highlights.length > 0){
            highlights[0].remove();
        }

        let canvas = document.getElementById('search_overview');
        canvas.style.display="block";
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let input = document.getElementById('text_search_input');
        let searchString = input.value;
        var l = searchString.length;
        if (l === 0) {
            return;
        }
        var i;
        var locations = []
        for(i in Store.contentArray){
            let line = Store.contentArray[i];
            var startIndex = 0, index, indices = [];
            while ((index = line.indexOf(searchString, startIndex)) > -1) {
                indices.push(index);
                startIndex = index + l;
            }
            locations[i] = indices;
        }
        let line;
        var w = findWidthofChar(searchString);
        
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "rgba(16, 161, 21, 0.5)";

        if(locations.length > 0) setFound(true);
        else setFound(false);

        let elems = [];

        for(line in locations){
            var codeline = document.getElementById('editor_code_line_' + line);
            
            if(locations[line].length > 0){
                ctx.moveTo(3, 20*line);
                ctx.lineTo(3, 20 + 20*line);
                ctx.stroke();
            }

            for(index of locations[line]){
                let span = document.createElement('span');
                span.classList.add('text_search_highlight');
                span.style.left = findWidthofChar(Store.contentArray[line].slice(0, index)) + "px";
                span.style.width = w + "px";
                codeline.appendChild(span);
                elems.push(span);
            }
        }

        setHighlightElems(elems);
        setSearchIndex(0);

        elems[0].style.backgroundColor = "rgba(81, 109, 120, 0.5)";
    }

    const keyHandler = (e) => {
        e.stopPropagation();
        var key = e.keyCode || e.charCode;
        if(key === 13){
            search();
        }
    }

    const prevHighlight = () => {
        highlightElems[searchIndex].style.backgroundColor = "rgba(8, 135, 8, 0.3)";
        let nextIndex = (highlightElems.length + searchIndex - 1)%(highlightElems.length);
        highlightElems[nextIndex].style.backgroundColor = "rgba(81, 109, 120, 0.5)";
        setSearchIndex(nextIndex);
    }

    const nextHighlight = () => {
        highlightElems[searchIndex].style.backgroundColor = "rgba(8, 135, 8, 0.3)";
        let nextIndex = (searchIndex + 1)%(highlightElems.length);
        highlightElems[nextIndex].style.backgroundColor = "rgba(81, 109, 120, 0.5)";
        setSearchIndex(nextIndex);
    }

    const searchNavHandler = (e) => {
        e.preventDefault();
        var key = e.keyCode || e.charCode;

        if(key === 39 || key === 40){
            nextHighlight();
            e.stopPropagation();
        }
        else if(key === 37 || key === 38){
            prevHighlight();
            e.stopPropagation();
        }
    }

    return (
        <div className="text_search" id="text_search" onKeyDown={searchNavHandler}>
            <div className="text_input_container">
                <input autoFocus placeholder="Find" id="text_search_input" onKeyDown={keyHandler} />
                <SearchIcon style={{color: "white", position: "absolute", right: "4px", width: "20px"}} onClick={search} />
            </div>
            <div style={{position: "absolute", right: "4px", height: "24px", top: "4px"}}>
                <KeyboardArrowUpIcon style={{color: found ? "white" : "#636360", width: "20px"}} onClick={prevHighlight} />
                <KeyboardArrowDownIcon style={{color: found ? "white" : "#636360", width: "20px"}} onClick={nextHighlight} />
                <CloseIcon style={{color: "white", width: "20px"}} onClick={close} />
            </div>
        </div>
    )
}

export default TextSearch;