import React from 'react';

import * as monaco from 'monaco-editor';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { ModelWrapper, previewModelText } from './common';

export type ToolbarProps = {
    wrappers: ModelWrapper[];
    setWrappers: React.Dispatch<React.SetStateAction<ModelWrapper[]>>;
    activeID: number;
    setActiveID: React.Dispatch<React.SetStateAction<number>>;
}

// [todo] resize tabs, etc. once toolbar fills 100% width
export default function Toolbar({ wrappers, setWrappers, activeID, setActiveID }
    : ToolbarProps) {

    const addTabClickHandler = () => {

        const id1 = wrappers.length;                    // ID is 0-indexed
        const model1 = monaco.editor.createModel("");

        setWrappers([ 
            ...wrappers,
            { 
                id: id1,
                model: model1,
            } 
        ]);
    }

    const tabs: React.ReactElement[] = wrappers.map((wrapper) => {
        return (
            <Button 
                key={ wrapper.id }
                onClick={ () => setActiveID(wrapper.id) }
                variant={ wrapper.id == activeID ? "primary" : "light" }
            >
                { previewModelText(wrapper.model) }
            </Button>
        );
    });
    tabs.push(
        <Button
            key="add"
            onClick={ addTabClickHandler }
            variant="secondary"
        >
            Add
        </Button>
    )

    return (
        <>
            <ButtonGroup>
                { tabs }
            </ButtonGroup>
        </>
    );
}