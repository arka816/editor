import Container from './state/state.js';
import Editor from "./editor";

const Wrapper = () => {
    return (
    	<Container.Provider>
	        <Editor />
	    </Container.Provider>
    )
}

export default Wrapper;