import * as monaco from 'monaco-editor';

import { Fixed, ModelWrapper } from './common';

// the Web Storage API is used to load/save graph definitions (1 per tab)
// - definitions are stored via ID using keys given by `webStorageKeyByID()
// - since non-empty definitions may have non-contiguous IDs, all possible 
// numeric IDs (i.e. positive integers) up to a maximum ID or `maxid; this is
// unlikely to cause performance issues but [todo]
// - `maxid is stored using a key given by `Fixed.WebStorageMaxidKey

function webStorageKeyByID(id: number): string {
    return `graphDef${ id }`;
}

export function loadWebStorage(ws: Storage): ModelWrapper[] {

    let mw: ModelWrapper[] = [];
    let wsMaxid = ws.getItem(Fixed.WebStorageMaxidKey);

    if (wsMaxid !== null) {
        const maxid = parseInt(wsMaxid);

        let nload = 0;  // ignore empty/null definitions when loading
        for (let id = 0; id <= maxid; id++) {
            let item = ws.getItem(webStorageKeyByID(id));
            if (item) {
                mw.push({
                    id: nload,
                    model: monaco.editor.createModel(item!, 
                        Fixed.MonacoLanguageID),
                });

                nload = nload + 1;
            }
        }
    }

    return mw;
}

export function saveWebStorage(ws: Storage, wrappers: ModelWrapper[]) {

    let maxid: number | null = null;

    wrappers.forEach((wrapper) => {
        if (wrapper.model) {
            if (maxid === null || wrapper.id > maxid) {
                maxid = wrapper.id;
            }

            ws.setItem(
                webStorageKeyByID(wrapper.id), 
                wrapper.model.getValue()
            );
        }
    });

    // store the highest ID, if available
    if (maxid !== null) {
        ws.setItem(Fixed.WebStorageMaxidKey, maxid);

        console.log(`maxid: ${ maxid }`);
    }
}