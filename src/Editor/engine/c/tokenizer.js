const datatypes = ["int", "float", "double", "char", "auto", "void"];
const qualifiers = ["long", "short", "signed", "unsigned"];
const keywords = ["for", "if", "else", "switch", "return", "goto", "register", "do", "while", "break", "continue", "struct", "enum", "union", "static", "case", "default", "sizeof", "typedef", "volatile", "extern"];
const operators = ["+", "-", "*", "/", "%", "=", "==", "++", "--", "+=", "-=", "*=", "/=", ">", "<", ">=", "<=", "!=", ">>", "<<", ">>=", "<<=", "~", "!", "&", "|", "^", "&=", "|=", "^=", "~=", "?", ":", "&&", "||"];
const punctuators = [",", ".", ";", "->", "#", "(", ")", "{", "}", "[", "]", "...", "\"", "'"];
const preprocessor_directives = ['define', 'include', 'undef', 'ifdef', 'ifndef', 'if', 'else', 'elif', 'endif', 'error', 'pragma'];
//const escapeseq = ["\n", "\r", "\t", "\b", "\\a", "\\'", "\"", "\\?", "\\", "\f", "\\v", "\\0", "\\nnn", "\\xhh"];
//const comments = ["//", "*/", "/*"];
const libraryFunctions = ["printf", "scanf", ""]

var tokens = [];

const isNumeric = (n) => {
    if (typeof n != "string") return false;
    return !isNaN(n) && !isNaN(parseFloat(n));
}

const isChar = (code) => {
    //needs revision
    let originalChar = code.slice(1, -1);
    if(originalChar.length > 1){
        if(originalChar.length === 2 && originalChar[0] === "\\") return true;
        return false;
    }
    return true;
}

const checkIdentifier = (token) => {
    var alphanumericRegExp = /^[0-9a-zA-Z_]+$/;
    return token.match(alphanumericRegExp);
}

const cleanseTokens = () => {
    for(let i = 0; i < tokens.length; i++){
        if(tokens[i] === "") tokens.splice(i, 1);
    }
}

const classify = () => {
    var indentedTokens = []
    var i = 0;
    while(i < tokens.length && tokens[i] === " "){
        i++;
    }
    
    let q = Math.floor(i/4);
    let r = i % 4;

    if(q > 0){
        for(let j = 0; j < q - 1; j++) indentedTokens.push(["    ", "indentation_guide_1"])
        if(r === 0) indentedTokens.push(["    ", "indentation_guide_2"])
        else indentedTokens.push(["    ", "indentation_guide_1"])
    }
    
    for(let i = 4*q; i < tokens.length; i++){
        indentedTokens.push([tokens[i], classifyToken(tokens[i])]);
    }
    tokens = indentedTokens;
}

const classifyToken = (code) => {
    code = code.trim();
    if(code === "") return "space";
    else{
        if(datatypes.indexOf(code) !== -1) return "type";
        else if(qualifiers.indexOf(code) !== -1) return "qualifier";
        else if(keywords.indexOf(code) !== -1) return "keyword";
        else if(code[0] === "\"") return "string_literal";
        else if (code[0] === "'") return (isChar(code) ? "char_literal" : "error");
        else if(isNumeric(code)) return "numeric_literal";
        else{
            //symbols or identifiers
            if(operators.indexOf(code) !== -1) return "operator";
            if(punctuators.indexOf(code) !== -1){
                if(code === '#') return 'operator';
                else return "punctuator";
            }
            
            if(code.substring(0, 2) === "//") return "single_line_comment";
            else if(code.substring(0, 2) === "/*"){
                if(code.substring(code.length - 2) === "*/") return "multi_line_comment";
                else return "multi_line_comment_start";
            }
            else if(code.substring(code.length - 2, 2) === "*/") return "multi_line_comment_end";

            if(checkIdentifier(code)){
                if(libraryFunctions.includes(code)) return "lib_func";
                else if(preprocessor_directives.includes(code)) return "preproc_dir";
                return "identifier";
            }
            else{
                return "error";
            }
        }
    }
}



const tokenize = (string) => {
    tokens = [];
    var stringMode = false;
    var charMode = false;
    var symbolMode = false;
    var commentMode = false;
    var currentToken = "";
    var c;

    for(let i = 0; i < string.length; i++){
        c = string[i];
        if(commentMode){
            //part of a multiline comment
            currentToken += c;
            if(c === "/" && i > 0 && string[i-1] === "*"){
                //multi line comment ended
                commentMode = false;
                tokens[tokens.length - 1] += currentToken;
                currentToken = "";
            }
        }
        else{
            if(c >= 'a' && c <= 'z'){
                //identifier or datatype or qualifier or keyword
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                currentToken += c;
                symbolMode = false;
            }
            else if(c === "_"){
                //string or character or identifier
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                currentToken += c;
                symbolMode = false;
            }
            else if(c >= 'A' && c <= 'Z'){
                //identifier
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                currentToken += c;
                symbolMode = false;
            }
            else if(c >= '0' && c <= '9'){
                //identifier or numeric
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                currentToken += c;
                symbolMode = false;
            }
            else if(c === " "){
                if(!stringMode && !charMode){
                    tokens.push(currentToken);
                    currentToken = "";
                    tokens.push(" ");
                }
                else{
                    currentToken += c;
                }
                symbolMode = false;
            }
            else if(c === '"'){
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                if(i > 0 && string[i-1] !== "\\"){
                    if(!stringMode){
                        //string is starting
                        tokens.push(currentToken);
                        currentToken = "\"";
                    }
                    else{
                        //string is ending
                        currentToken += c;
                        tokens.push(currentToken);
                        currentToken = "";
                    }
                    stringMode = !stringMode;
                }
                else{
                    currentToken += c;
                }
                symbolMode = false;
            }
            else if(c === "'"){
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                if(i > 0 && string[i-1] !== "\\"){
                    if(!charMode){
                        //character is starting
                        tokens.push(currentToken);
                        currentToken = "'";
                    }
                    else{
                        //character is ending
                        currentToken += c;
                        tokens.push(currentToken);
                        currentToken = "";
                    }
                    charMode = !charMode;
                }
                else{
                    currentToken += c;
                }
                symbolMode = false;
            }
            else if(punctuators.includes(c)){
                //valid punctuator
                if(symbolMode){
                    tokens.push(currentToken);
                    currentToken = "";
                }
                if(!stringMode && !charMode){
                    tokens.push(currentToken);
                    currentToken = "";
                    tokens.push(c);
                }
                else{
                    currentToken += c;
                }
                symbolMode = false;
            }
            else if(c === "\\"){
                currentToken += c;
            }
            else{
                //symbols
                if(operators.includes(c)){
                    //valid operator symbol
                    if(stringMode || charMode){
                        //part of a string
                        currentToken += c;
                    }
                    else{
                        //not part of string or character
                        //which means it is an individual symbol
                        //or part of the previous symbol if any
                        if(c === "/" && i > 0 && string[i-1] === "/"){
                            //single line comment started
                            //
                            tokens[tokens.length - 1] += "/" + string.substring(i);
                            cleanseTokens();
                            classify();
                            return tokens;
                        }
                        if(c === "*" && i > 0 && string[i-1] === "/"){
                            //mutliline comment started
                            currentToken += c;
                            commentMode = true;
                        }
                        if(!commentMode){
                            if(symbolMode){
                                //last character was symbol too
                                currentToken += c;
                            }
                            else{
                                //last character was not symbol
                                tokens.push(currentToken);
                                currentToken = c;
                            }
                            symbolMode = true;
                        }
                    }
                }
                else{
                    if(stringMode || charMode){
                        //part of string
                        //so no problem
                    }
                    else{
                        tokens.push(currentToken);
                        tokens.push(c);
                        currentToken = "";
                    }
                    symbolMode = false;
                }
            }
        }
    }

    tokens.push(currentToken);
    cleanseTokens();
    classify();
    return tokens;
}

module.exports = {tokenize};