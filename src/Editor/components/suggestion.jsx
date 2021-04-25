import React from 'react';

const Suggestion = ({suggestions}) => {
    return (
        <div id="suggestion_container">
            {
                suggestions.map((suggestion, index) => {
                    return (
                        <span key={index}>{suggestion}</span>
                    )
                })
            }
        </div>
    )
}

export default Suggestion;