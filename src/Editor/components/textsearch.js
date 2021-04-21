import React, {useState} from "react";
import Container from '../state/state.js';
import SearchIcon from '@material-ui/icons/Search';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import CloseIcon from '@material-ui/icons/Close';

const TextSearch = ({setFindMode}) => {
    const [found, setFound] = useState(false);
    const Store = Container.useContainer();

    const findWidthofChar = (c) => {
        c = c.replace(/ /g, "&nbsp");
        var elem = document.getElementById('text_width_finder');
        elem.innerHTML = c;
        let width = elem.getBoundingClientRect().width;
        return width;
    }

    const close = () => {
        let highlights = document.getElementsByClassName('text_search_highlight');
        console.log(highlights);
        var element;
        while(highlights.length > 0){
            highlights[0].remove();
        }

        let canvas = document.getElementById('search_overview');
        canvas.style.display="none";
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        setFindMode(false);
    }

    const search = () => {
        let input = document.getElementById('text_search_input');
        let searchString = input.value;
        var l = searchString.length;
        if (l == 0) {
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

        let canvas = document.getElementById('search_overview');
        canvas.style.display="block";
        let ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = "#10a115";

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
            }
        }
    }

    const keyHandler = (e) => {
        var key = e.keyCode || e.charCode;
        if(key === 13){
            search();
        }
    }

    return (
        <div className="text_search">
            <div className="text_input_container">
                <input autoFocus placeholder="Find" id="text_search_input" onKeyDown={keyHandler} />
                <SearchIcon style={{color: "white", position: "absolute", right: "4px", width: "20px"}} onClick={search} />
            </div>
            <div style={{position: "absolute", right: "4px", height: "24px", top: "4px"}}>
                <KeyboardArrowUpIcon style={{color: "white", width: "20px"}} />
                <KeyboardArrowDownIcon style={{color: "white", width: "20px"}} />
                <CloseIcon style={{color: "white", width: "20px"}} onClick={close} />
            </div>
        </div>
    )
}

export default TextSearch;