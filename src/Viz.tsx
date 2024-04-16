import React, { useEffect, useRef, useState } from 'react';

import mermaid from 'mermaid';

type VizProps = {
    graphDef: string;
    webStorageLoaded: boolean;
}

export default function Viz({ graphDef, webStorageLoaded }: VizProps) {

    const [ graphSVG, setGraphSVG ] = useState<string>("");

    const mermaidDivRef = useRef<HTMLDivElement>(null);

    // on component mount
	useEffect(() => {

		mermaid.initialize({
			startOnLoad: false,
			wrap: true,
		});

	}, []);

    // [todo] on initial render, mermaid render fails with "node is null";
    // need to be able to undo edits to DOM that mermaid.render does; as a
    // consequence the stored graph does not appear until graphDef changes
    useEffect(() => {

		if (mermaidDivRef.current &&
            webStorageLoaded) {
            
			mermaid.render('viz', graphDef, mermaidDivRef.current)
				.then((res) => {

                    // [todo] sanitize SVG? or set mermaid security options?
					setGraphSVG(res.svg);
				})
				.catch((err) => { 
                   
                    // [] removing for now since the vast majority of "errors"
                    // are mid-typing syntax errors; idk if mermaid has full
                    // independent syntax checking yet [todo]
                    // console.log(err);
                });
        }

	}, [ graphDef, webStorageLoaded ]);

    return (
        <>
            <div
                dangerouslySetInnerHTML={{ __html: graphSVG }} 
                ref={ mermaidDivRef } 
            />
        </>
    );
}