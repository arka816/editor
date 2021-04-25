import React from 'react';
import Container from '../state/state.js';

const LineMarker = ({number, isContractible, isContracted}) => {
    const Store = Container.useContainer();
    var bgColor = Store.cursorLine === number ? "#272727" : "#2F3129";
    return (
        <div className="editor_line_marker" 
            style={{height: Store.lineHeight + "px", backgroundColor: bgColor}}
        >
            <span style={{marginRight: "5px"}}>{number + 1}</span>
            {isContractible ? 
                <i className="fa fa-caret-down" style={isContracted ? {color: "white"} : {color: "gray"}}></i> 
                : <i></i>}
        </div>
    );
}

export default LineMarker;