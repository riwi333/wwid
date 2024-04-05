import React from 'react';
import ReactDOM from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.min.css';

import './index.css';
import App from './App';

const container = document.getElementById("root");
if (container) {
	const root = ReactDOM.createRoot(container);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);
}