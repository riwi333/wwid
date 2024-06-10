import * as monaco from 'monaco-editor';

import { generateNodeID } from './common';

// insert brackets + escape quotes needed for valid mermaidJS flowchart syntax
function nodeInsert(editorInstance: monaco.editor.ICodeEditor, insert1: string) {

    let selectBefore = editorInstance.getSelection();
    if (selectBefore !== null) {
        let insert2 = "\"]";
        let edits: monaco.editor.IIdentifiedSingleEditOperation[] = [
            {
                forceMoveMarkers: true,
                range: selectBefore.collapseToStart(),      // collapsed range = insert operation
                text: insert1 + insert2,
            }
        ];
        // position the cursor within the node text for easy editing
        let selectAfterColumn = selectBefore.startColumn + insert1.length;
        let selectAfter = [
            new monaco.Selection(selectBefore.startLineNumber, selectAfterColumn, 
                selectBefore.endLineNumber, selectAfterColumn),
        ];
        editorInstance.executeEdits("nodeInsert", edits, selectAfter);
    }
    else {
        console.log("editor instance has no primary selection, so text could not be inserted");
    }
}

function autonode(editorInstance: monaco.editor.ICodeEditor) {

    let nodeID = generateNodeID();
    let insert1 = nodeID + "[\"";
    nodeInsert(editorInstance, insert1);
}

function endnode(editorInstance: monaco.editor.ICodeEditor) {
    
    nodeInsert(editorInstance, "[\"");
}

function nextline(editorInstance: monaco.editor.ICodeEditor) {

    let model = editorInstance.getModel();
    let positionBefore = editorInstance.getPosition();
    if (model !== null && positionBefore !== null) {
        // move to the "end" of the current line (past the last non-whitespace
        // character column)
        let endColumn = 
            model.getLineLastNonWhitespaceColumn(positionBefore.lineNumber);
        editorInstance.setPosition(new monaco.Position(
            positionBefore.lineNumber, endColumn));

        // move to next line by simulating the user typing a newline
        // [todo] this might not be the best solution (robust?), but by default
        // the editor maintains indentation on newlines, so this solution does
        // as well with no further code
        editorInstance.trigger('keyboard', 'type', { text: "\n" });
    }
    else {
        // [todo] more specific error message
        console.log("keycommand failed: nextline");
    }
}

export const KeyCommands: monaco.editor.IActionDescriptor[] = [
    // insert { auto-generated nodeID }[""] to make typing node labels flow
    {
        id: "autonode",
        label: "auto-node",
        keybindings: [ monaco.KeyMod.Shift | monaco.KeyCode.BracketLeft ],
        run: (editorInstance) => {

            console.log("activate keycommand: autonode");
            autonode(editorInstance);
        }
    },
    // insert [""] as above
    // the node ID is assumed to be in-line; i.e. has been typed prior to
    // activating the keycommand 
    {
        id: "endnode",
        label: "end-node",
        keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.BracketLeft ],
        run: (editorInstance) => {

            console.log("activate keycommand: endnode");
            endnode(editorInstance);
        }
    },
    // advance to the start of the next line in the editor, regardless of current cursor position
    // [todo] maintain indentation of above line
    {
        id: "nextline",
        "label": "next-line",
        keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
        run: (editorInstance) => {

            console.log("activate keycommand: nextline");
            nextline(editorInstance);
        }
    }
];