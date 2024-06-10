import * as monaco from 'monaco-editor';

import { generateNodeID } from './common';

// custom autocompletion provider
// class MyCompletionProvider implements monaco.languages.CompletionItemProvider {
export class MyCompletionProvider implements monaco.languages.InlineCompletionsProvider {

    public provideInlineCompletions(model: monaco.editor.ITextModel, 
        position: monaco.Position, 
        context: monaco.languages.InlineCompletionContext, 
        token: monaco.CancellationToken)
        : monaco.languages.ProviderResult<monaco.languages.InlineCompletions> {
    // public provideCompletionItems(model: monaco.editor.ITextModel, 
    // 	position: monaco.Position, context: monaco.languages.CompletionContext, 
    // 	token: monaco.CancellationToken)
    // 	: monaco.languages.ProviderResult<monaco.languages.CompletionList> {

        // determine what to insert based on current position/content

        // console.log(position);

        // activate autocomplete after TAB-ing a new line
        let lineContent = model.getLineContent(position.lineNumber);
        let match = lineContent.match(/^\s+$/);
        if (match) {
            // node ID + open brackets/escape quote
            let insert = generateNodeID() + '["';

            // // close brackets/escape quote
            // let closeBracketEdit: monaco.editor.ISingleEditOperation = {
            // 	text: '"]',
            // 	range: {} as monaco.Range,
            // };

            // let word = model.getWordUntilPosition(position);
        
            // return {
                // suggestions: [
                // 	{
                // 		label: "new node",
                // 		kind: monaco.languages.CompletionItemKind.Function,
                // 		documentation: "new line, new node",
                // 		commitCharacters: [ "\t" ],
                // 		insertText: '${1:' + insert + '}["${2:}"',
                // 		insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                // 		range: {
                // 			startLineNumber: position.lineNumber,
                // 			endLineNumber: position.lineNumber,
                // 			startColumn: word.startColumn,
                // 			endColumn: word.endColumn
                // 		}
                // 	}
                // ]
            // };
            return {
                items: [
                    {
                        insertText: insert,
                    }
                ]
            }
        }

        // return { suggestions: [] };
        return { items: [] };
    }

    // public handleItemDidShow(completions: monaco.languages.InlineCompletions<monaco.languages.InlineCompletion>, item: monaco.languages.InlineCompletion, updatedInsertText: string): void {
    // 	console.log(updatedInsertText);	
    // }

    public freeInlineCompletions(completions: 
        monaco.languages.InlineCompletions<monaco.languages.InlineCompletion>)
            : void {}
}