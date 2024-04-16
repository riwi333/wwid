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

    useEffect(() => {

		if (mermaidDivRef.current &&
            webStorageLoaded) {
            
			mermaid.render('viz', graphDef, mermaidDivRef.current)
				.then((res) => {

                    // [todo] sanitize SVG? or set mermaid security options?
					setGraphSVG(res.svg);
				})
				.catch((err) => { 
                   
                    // [watch]
                    console.log(err);
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