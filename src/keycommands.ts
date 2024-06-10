import * as monaco from 'monaco-editor';

import { generateNodeID } from './common';

function autonode(editorInstance : monaco.editor.ICodeEditor) {

    let selectBefore = editorInstance.getSelection();
    if (selectBefore !== null) {
        let nodeID = generateNodeID();
        let insert1 = nodeID + "[\"";
        let insert2 = "\"]";
        let edits: monaco.editor.IIdentifiedSingleEditOperation[] = [
            {
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
        editorInstance.executeEdits("autonode", edits, selectAfter);
    }
    else {
        console.log("editor instance has no primary selection, so text could not be inserted");
    }
}

export const KeyCommands: monaco.editor.IActionDescriptor[] = [
    // insert { auto-generated nodeID }[""] to make typing node labels flow
    {
        id: "autonode",
        label: "auto-node",
        keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
        run: (editorInstance) => {

            console.log("activate keycommand: autonode");
            autonode(editorInstance);
        }
    },
];