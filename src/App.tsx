import React, { useEffect, useRef, useState } from 'react';

import * as monaco from 'monaco-editor';

import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
// import Toast from 'react-bootstrap/Toast';

import { Fixed, ModelWrapper } from './common';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Viz from './Viz';

function webStorageKeyByID(id: number): string {
	return `graphDef${ id }`;
}

function loadWebStorageModels(ws: Storage): ModelWrapper[] {

	let mw: ModelWrapper[] = [];
	let maxIdStore = ws.getItem(Fixed.WebStorageMaxIDKey);

	// get the highest ID of the graph definitions potentially in Web Storage;
	// since non-null definitions may not have contiguous IDs, search for
	// stored data up to `maxId
	// if the highest ID is not present in Web Storage, nothing has been stored
	if (maxIdStore !== null) {
		const maxId = parseInt(maxIdStore);
		let id = 0;
		for (let storeId = 0; storeId <= maxId; storeId++) {
			let item = ws.getItem(webStorageKeyByID(storeId));
			if (item) {
				mw.push({
					id: id,
					model: monaco.editor.createModel(item!),
				});

				id = id + 1;
			}
		}
	}

	return mw;
}

function saveModelsToWebStorage(ws: Storage, wrappers: ModelWrapper[]) {

	let maxId: number | null = null;

	wrappers.forEach((wrapper) => {
		if (wrapper.model) {
			if (maxId === null || wrapper.id > maxId) {
				maxId = wrapper.id;
			}

			ws.setItem(
				webStorageKeyByID(wrapper.id), 
				wrapper.model.getValue()
			);
		}
	});

	// store the highest ID, if available
	if (maxId !== null) {
		ws.setItem(Fixed.WebStorageMaxIDKey, maxId);

		// [debug]
		// console.log(`${ Fixed.WebStorageMaxIDKey }: ${ maxId }`);
	}
}

const wrappers0 = [{
	id: 0,
	model: monaco.editor.createModel(""),
}];

// [todo] get/set all tabs; currently only store definition from active tab
export default function App() {

	const [ graphDef, setGraphDef ] = useState<string>("");
	const [ wrappers, setWrappers ] = useState<ModelWrapper[]>(wrappers0);
	const [ activeID, setActiveID ] = useState<number | null>(null);
	const [ webStorageLoaded, setWebStorageLoaded ] = useState<boolean>(false);

	const webStorageRef = useRef<Storage>();
	const timeoutRef = useRef<NodeJS.Timeout>();

	// on component mount
	useEffect(() => {

		webStorageRef.current = localStorage;
		// itemRef.current = webStorageRef.current.getItem("graphDef");
		// if (itemRef.current) {
		// 	console.log(`Retrieving stored graphDef: ${ itemRef.current }`);
		// 	setGraphDef(itemRef.current);
		// }

		const tmp = loadWebStorageModels(webStorageRef.current);
		if (tmp.length > 0) {
			// [debug]
			// const wraps = tmp.map((wrapper) => {
			// 	if (wrapper.model) {
			// 		return {
			// 			id: wrapper.id,
			// 			body: wrapper.model.getValue(),
			// 		}
			// 	}
			// });
			// console.log("Retrieved:");
			// console.log(wraps);

			setWrappers(tmp);
		}
		// default (no web storage) = `wrappers0 (above)
		else {
			console.log("Nothing loaded from Web Storage");
		}

		setWebStorageLoaded(true);

	}, []);

	useEffect(() => {

		// clear previous timeout; only write to storage if the full duration
		// has passed without changes to `graphDef so storage isn't 
		// overwritten every keystroke
		clearTimeout(timeoutRef.current);

		if (webStorageLoaded) {
			timeoutRef.current = setTimeout(() => {

				if (webStorageRef.current) {
					// [debug]
					// const wraps = wrappers.map((wrapper) => {
					// 	if (wrapper.model) {
					// 		return {
					// 			id: wrapper.id,
					// 			body: wrapper.model.getValue(),
					// 		}
					// 	}
					// });
					// console.log("Saving...");
					// console.log(wraps);

					saveModelsToWebStorage(webStorageRef.current, wrappers);
				}
			}, 5000);
		}

		return () => clearTimeout(timeoutRef.current);

	}, [ graphDef ]);

	return (
		<>
			<Container fluid>
				<Row>
					<Toolbar
						wrappers={ wrappers }
						setWrappers={ setWrappers }
						activeID={ activeID }
						setActiveID={ setActiveID }
					/>
				</Row>
				<Row className="primary-row">
					<Col>
						<Editor
							graphDef={ graphDef }
							setGraphDef={ setGraphDef }
							wrappers={ wrappers }
							setWrappers={ setWrappers }
							activeID={ activeID }
							setActiveID={ setActiveID }
							webStorageLoaded={ webStorageLoaded }
						/>
					</Col>
					<Col>
						<Viz 
							graphDef={ graphDef } 
							webStorageLoaded={ webStorageLoaded }
						/>
					</Col>
				</Row>
			</Container>
		</>
	);
} 