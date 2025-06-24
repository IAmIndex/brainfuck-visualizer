const memoryBlocksContainer = document.getElementById("memory-blocks");
const outputEl = document.getElementById("output");
const limiterEl = document.getElementById("limiter");
const interpretEl = document.getElementById("interpret");
const inputEl = document.getElementById("stdin");
const codeEl = document.getElementById("code");
const previewEl = document.getElementById("preview")

const memoryBlocks = new Array(30000).fill(0)

let limiter = 10

let pointer = 0;
let prevPointer = pointer;

let delay = 500; // ms

let stdin = inputEl.innerText;
let stdinTracker = 0;

let stopped = false;
let paused = false;

showMemoryBlocks(limiter);

/**
 * Creates a new memory block and adds it to the webpage
 * @param {number} id The ID to the current memory block
 * @returns The newly instanced node
 */
function createNewMemoryBlock(id) {
    const currentNode = document.createElement("div");
    currentNode.id = "block" + id.toString();
    currentNode.classList.add("memory-block");
    currentNode.innerText = "[" + memoryBlocks[id] + "]";
    
    memoryBlocksContainer.append(currentNode);

    return currentNode;
}

/**
 * Updates the memory blocks being shown to the user
 * @param {number} newLimiter The new limit to exhibit the memory values
 * @returns 
 */
function showMemoryBlocks(newLimiter = limiter) {
    if (newLimiter < 1)
        newLimiter = 1;

    if (newLimiter > 30000)
        newLimiter = 30000;

    memoryBlocksContainer.innerHTML = '';

    limiter = newLimiter;
    
    for (let i = 0; i<limiter; i++) {
        createNewMemoryBlock(i);
    }
    
    updatePointer();
}

/**
 * Updates the pointer to the new memory block
 * @param {number} newPointer The address the pointer moved to
 */
function updatePointer(newPointer = pointer) {
    if (newPointer < 0) {
        newPointer = pointer
    } else if (newPointer > 30000) {
        newPointer = pointer
    }
    
    const prevSelected = document.getElementById("block"+prevPointer.toString());
    let newSelected = document.getElementById("block"+newPointer.toString());
    
    prevSelected.classList.remove("selected");
    
    if (newSelected) {
        newSelected.classList.add("selected");
    } else {
        newSelected = createNewMemoryBlock(newPointer);

        newSelected.classList.add("selected");
    }

    pointer = newPointer;
    prevPointer = newPointer;
}

/**
 * 
 * @param {string} prevText The text previous to the current character to be highlighted
 * @param {string} char The current character to highlight
 * @param {string} postText The text after the highlighted character
 */
function highlightCodeSection(prevText, char, postText) {
    const prevHighlighted = document.getElementsByClassName("caret");

    for (const element of prevHighlighted) {
        previewEl.removeChild(element);
    }

    const spanElement = document.createElement("span");
    spanElement.classList.add("caret");
    spanElement.innerText = char;

    previewEl.innerHTML = '';
    previewEl.append(prevText, spanElement, postText);
}

/**
 * 
 * @param {string} code The code to have its loops indexed
 * @returns {number[]} An array with the position of the loops
 */
function indexLoops(code) {
    const stack = [];
    const loopIndices = [];

    for (let i = 0; i<code.length; i++) {
        const char = code[i];

        if (char === '[') {
            stack.push(i);
        } else if (char === ']') {
            if (stack.length === 0) {
                alert(`Syntax error: Unmatched closing bracket ']' at index ${i}`);
                haltInterpreter();
            }
            
            const start = stack.pop();
            loopIndices[start] = i;
            loopIndices[i] = start;
        }
    }

    if (stack.length > 0) {
        alert(`Syntax error: Unmatched opening bracket '[' at index ${stack[0]}`);
        haltInterpreter();
    }

    return loopIndices;
}

/**
 * Interprets the brainfuck code
 * @param {string} code The brainfuck code
 */
async function interpret(code) {
    updatePointer(0);
    memoryBlocks.fill(0);
    showMemoryBlocks(limiter);

    let loopIndices = indexLoops(code);

    outputEl.innerHTML = '';

    limiterEl.readOnly = true;
    codeEl.hidden = true;
    interpretEl.disabled = true;
    previewEl.hidden = false;

    previewEl.innerHTML = code;

    stdin = inputEl.value;
    stdinTracker = 0;

    for (let i = 0; i < code.length; i++) {
        if (stopped)
            break;

        while (paused) {
            if (stopped)
                break;
            await wait(20);
        }

        const prevText = code.slice(0, i);
        const char = code[i];
        const postText = code.slice(i+1);

        const currentBlock = document.getElementById('block' + pointer.toString());
        const numberStored = memoryBlocks[pointer];

        highlightCodeSection(prevText, char, postText);

        switch (char) {
            case '+':
                memoryBlocks[pointer] = (parseInt(numberStored) + 1)>255 ? 0: parseInt(numberStored) + 1;
                currentBlock.innerText = "[" + memoryBlocks[pointer] + "]";
                
                break;
            
            case '-':
                memoryBlocks[pointer] = (parseInt(numberStored) - 1)<0 ? 255: parseInt(numberStored) - 1;
                currentBlock.innerText = "[" + memoryBlocks[pointer] + "]";
                
                break;
            
            case '>':
                updatePointer(pointer+1);
                
                break;
            
            case '<':
                updatePointer(pointer-1);

                break;
            
            case '[':
                if (numberStored != 0) {
                    continue;
                } else {
                    // Jump
                    i = loopIndices[i];
                }

                break;
            
            case ']':
                if (numberStored != 0) {
                    i = loopIndices[i];
                    continue;
                }

                break;
            
            case '.':
                outputEl.innerHTML += String.fromCharCode(memoryBlocks[pointer]);

                break;
            
            case ',':
                if (stdinTracker === stdin.length) 
                    break;

                memoryBlocks[pointer] = stdin.charCodeAt(stdinTracker);
                stdinTracker++;
                currentBlock.innerText = "[" + memoryBlocks[pointer] + "]";

                break;
            
            default:
                continue;
        }

        await wait(delay)
    }

    limiterEl.readOnly = false;
    codeEl.hidden = false;
    interpretEl.disabled = false;
    previewEl.hidden = true;
}

/**
 * Waits for a determined number of milliseconds
 * @param {number} milliseconds The time to halt the execution in milliseconds
 * @returns The promise that halts the execution
 */
function wait(milliseconds = delay) {
    return new Promise(r => setTimeout(r, milliseconds));
}

/**
 * Stops the interpreter 
 */
async function haltInterpreter() {
    stopped = true;
    await wait(delay + 20);
    stopped = false;
    paused = false;
}
