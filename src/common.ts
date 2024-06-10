import * as monaco from 'monaco-editor';

export type ModelWrapper = {
    id: number;
    model: monaco.editor.ITextModel | null;
};

export const Fixed = {
    MaxPreviewLength: 15,
    ToastAutohideDelay_ms: 3000,
    WebStorageMaxidKey: "maxid#",
    WebStorageDirtyTimeout_ms: 5000,
    MonacoLanguageID: "mylang",
    DarkModeBackgroundColor: "#1e1e1e",     // see the vs code 'dark' theme
}

// [todo] not unique with multiple page loads/web storage
export function generateNodeID(): string {

    // use a UUID generator but only the first few bytes
    // [todo] window.crypto is only available in certain web contexts (localhost is fine)
    // [todo] deal with collisions (shorter UUID => more likely collisions)
    let uuid = window.crypto.randomUUID();
    let suuid = uuid.toString().slice(0, 4);

    let id = "_" + suuid;

    return id;
}

// get a short preview of the given graph description to display on its tab
export function previewModelText(model: monaco.editor.ITextModel | null)
    : string {

    if (model == null) return "...";

    const text = model.getValue();

    if (text.length < Fixed.MaxPreviewLength) {
        return text + "...";
    }

    const index0 = 0; // Math.random() * (text.length - Fixed.MaxPreviewLength);
    const preview = text.substring(index0, index0 + Fixed.MaxPreviewLength);
    
    return preview + "...";
}