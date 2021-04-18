const datatypes = ["int", "float", "double", "char", "auto", "void"];
const qualifiers = ["long", "short", "signed", "unsigned"];
const keywords = ["for", "if", "else", "switch", "return", "goto", "register", "do", "while", "break", "continue", "struct", "enum", "union", "static", "case", "default", "sizeof", "typedef", "volatile", "extern"];
const operators = ["+", "-", "*", "/", "%", "=", "==", "++", "--", "+=", "-=", "*=", "/=", ">", "<", ">=", "<=", "!=", ">>", "<<", ">>=", "<<=", "~", "!", "&", "|", "^", "&=", "|=", "^=", "~=", "?", ":"];
const punctuators = [",", ".", ";", "->", "#", "(", ")", "{", "}", "[", "]", "..."];
const escapeseq = ["\n", "\r", "\t", "\b", "\\a", "\\'", "\"", "\\?", "\\", "\f", "\\v", "\\0", "\\nnn", "\\xhh"];

const isNumeric = (n) => {
    if (typeof n != "string") return false;
    return !isNaN(n) && !isNaN(parseFloat(n));
}

const classifyCode = (code) => {
    code = code.trim();
    if(code === "") return "space";
    else{
        if(datatypes.indexOf(code) !== -1) return "type";
        else if(qualifiers.indexOf(code) !== -1) return "qualifier";
        else if(keywords.indexOf(code) !== -1) return "keyword";
        else if(operators.indexOf(code) !== -1) return "operator";
        else if(punctuators.indexOf(code) !== -1) return "punctuator";
        //else if(escapeseq.indexOf(code) !== -1) return "escapeseq";
        else if(code[0] === "\"") return "string_literal";
        else if (code[0] === "\'") return "char_literal";
        else if(isNumeric(code)) return "numeric_literal";
        else return "identifier";
    }
}

module.exports = {classifyCode}