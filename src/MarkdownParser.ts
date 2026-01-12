let mode: "normal" | "inline" | "block" = "normal";
let backtickBuffer = "";
let currentNode: HTMLElement | Text | null = null;
let blockLanguage: string | null = null;
let lineBuffer = "";
const blogpostMarkdown = `# Testing Header

This is a paragraph with *italic text* and **bold text** together.

\`inline code\`

Inline code was written above by the program.

## Subheading Example

Another paragraph with **bold** and *italic* mixed.
`;

let currentContainer: HTMLElement | null = null; 
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }

    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        } else {
            clearInterval(toCancel);
        }
    }, 20);
}


/* 
Please edit the addToken method to support at least inline codeblocks and codeblocks. Feel free to add any other methods you need.
This starter code does token streaming with no styling right now. Your job is to write the parsing logic to make the styling work.

Note: don't be afraid of using globals for state. For this challenge, speed is preferred over cleanliness.
 */
function addToken(token: string) {
    if(!currentContainer) return;

    for(let i = 0; i < token.length; i++) {
        const char = token[i];
        if(char === '`') {
            backtickBuffer+= "`";
            continue;
        }
        if (backtickBuffer.length > 0) {
            handleBackTicks(backtickBuffer);
            backtickBuffer = "";
        }
        if (char === '\n') {
            flushLineBuffer();
            continue;
        }
        if (mode == "normal"){
            lineBuffer += char;
        } 
        else{
            writeChar(char);
        }
        
        }
}

function handleBackTicks(backticks : string) {
    const n = backticks.length;

    if (n===1) {
        if (mode === "normal") {
            mode = "inline";
            currentNode = document.createElement('code');
            currentContainer!.appendChild(currentNode);
        } else if (mode === "inline") {
            mode = "normal";
            currentNode = null;
        }
    }
    else if (n>=3) {
        if (mode === "normal") {
            mode = "block";
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            pre.appendChild(code);
            currentContainer!.appendChild(pre);
            currentNode = code;
            blockLanguage = "";
        } else if (mode === "block") {
            mode = "normal";
            currentNode = null;
            blockLanguage = null;
        }
    }
}

function writeChar(char: string) {
    if (currentNode) {
        currentNode.textContent += char;
    }
}

function flushLineBuffer() {
    if (lineBuffer.trim() === "") {
        lineBuffer = "";
        return;
    }
    const headingMatch = lineBuffer.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const heading = document.createElement(`h${level}`);
        parseInlineStyles(content, heading);
        currentContainer!.appendChild(heading);
        lineBuffer = "";
        return;
    }
    const paragraph = document.createElement('p');
    parseInlineStyles(lineBuffer, paragraph);
    currentContainer!.appendChild(paragraph);
    lineBuffer = "";
}

function parseInlineStyles(text: string, container: HTMLElement) {
    let i = 0;
    while (i < text.length) {
        if (text[i] === '*' || text[i] === '_') {
            const delimiter = text[i];
            let j = 1;
            if (text[i + 1] === delimiter) {
                j = 2;
            }
            let endIndex = i + j;
            while (endIndex < text.length) {
                if (text[endIndex] === delimiter) {
                    if (j === 2 && text[endIndex + 1] === delimiter) {
                        break;
                    } else if (j === 1) {
                        break;
                    }
                }
                endIndex++;
            }
            if (endIndex < text.length) {
                const styledText = text.slice(i + j, endIndex);
                const span = document.createElement('span');
                span.textContent = styledText;
                if (j === 2) {
                    span.style.fontWeight = 'bold';
                } else {
                    span.style.fontStyle = 'italic';
                }
                container.appendChild(span);
                i = endIndex + j;
                continue;
            }
        }
        const normalTextNode = document.createTextNode(text[i]);
        container.appendChild(normalTextNode);
        i++;
    }
}
