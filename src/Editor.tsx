import React, { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

// import { MyCompletionProvider } from './autocompletion';
import { Fixed, ModelWrapper } from './common';
import { KeyCommands } from './keycommands';

type EditorProps = {
    setGraphDef: React.Dispatch<React.SetStateAction<string>>;
    wrappers: ModelWrapper[];
    setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
    activeID: number | null;
    setActiveID: React.Dispatch<React.SetStateAction<number | null>>;
    webStorageLoaded: boolean;
    useDarkMode: boolean;
}

export default function Editor({ setGraphDef, wrappers, setWrappers, activeID, 
    setActiveID, webStorageLoaded, useDarkMode }: EditorProps) {

    const [ prevUseDarkMode, setPrevUseDarkMode ] = 
        useState<boolean | null>(null);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const editorContainerRef = useRef<HTMLDivElement>(null);

    if (prevUseDarkMode === null || prevUseDarkMode !== useDarkMode) {
        if (editorRef.current) {
            let nextTheme = useDarkMode ? 'vs-dark' : 'vs';
            editorRef.current.updateOptions({ theme: nextTheme });
        }

        setPrevUseDarkMode(useDarkMode);
    }

    // on component mount
    useEffect(() => {

        // enable autocompletion provider for registered langauge
        // monaco.languages.registerInlineCompletionsProvider(
        // // monaco.languages.registerCompletionItemProvider(
        //     Fixed.MonacoLanguageID, new MyCompletionProvider);

        // register keybindings/commands
        KeyCommands.forEach((kc) => {
            monaco.editor.addEditorAction(kc);
        });

    }, []);

    // on monaco editor load
    useEffect(() => {

        // do not load the editor until the web storage process has completed,
        // regardless of whether anything was retrieved; this makes syncing
        // between internal state and editor appearance easier
        if (editorContainerRef.current &&
            webStorageLoaded) {
            
            editorRef.current = monaco.editor.create(
                editorContainerRef.current, 
                {
                    model: null,
                    minimap: { 
                        enabled: false 
                    },
                    theme: useDarkMode ? 'vs-dark' : 'vs',
                }
            );
            // model set to null since all model creation is contained by ModelWrapper objects

            if (editorRef.current) {
                setActiveID(0);
                // setting activeID should trigger the Effect below
            }
            // [] else; editor creation fails?
        }

        return () => editorRef.current?.dispose();

    }, [ editorContainerRef, webStorageLoaded ]);

    // switch monaco models on active tab/ID change
    useEffect(() => {
        if (editorRef.current) {
            let activeWrapper = 
                wrappers.find(wrapper => wrapper.id == activeID);
            if (activeWrapper) {
                editorRef.current.setModel(activeWrapper.model);
                editorRef.current.onDidChangeModelContent(() => {

                    setGraphDef(editorRef.current!.getValue());
                    setWrappers(wrappers.map((wrapper) => {

                        if (wrapper.id === activeID) {
                            return { 
                                ...wrapper, 
                                model: editorRef.current!.getModel() 
                            };
                        } else {
                            return wrapper;
                        }
                    }));
                });
            }

            // sync visual text in editor and state
            setGraphDef(editorRef.current.getValue());
        }

    }, [ activeID ]);

    return (
        <>
            <div className="editor-container" ref={ editorContainerRef } />
        </>
    );
}