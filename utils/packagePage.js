
const CONFIG = require('../config.js');
const fs = require('fs');

function getComponent(component) {
	const fileName = component.fileName;
	if (component.asyn) {
		return `
		import('${fileName}');`;
	}
	return `
	import '${fileName}';`;
}

function writwFile(path, content) {

	return new Promise((resolve, reject) => {
		fs.writeFile(path, content, (err) => {
			if (err) {
				return reject(err);
			}

			resolve();
		})
	})

}

// function newEnteryFileByComponents(fileName, data) {
// 	if (data.length < 1) {
// 		return;
// 	}
// 	// console.log(data);
// 	let jsContent = '';
// 	data.forEach((item) => {
// 		jsContent += getComponent(item);
// 	});

// 	return new Promise((resolve, reject) => {
// 		fs.writeFile(`${CONFIG.COMPath}/${fileName}.js`, jsContent, (err) => {
// 			if (err) {
// 				return reject(err);
// 			}

// 			resolve();
// 		})
// 	})
// }

// function newTemplateFile(fileName, html) {
// 	return new Promise((resolve, reject) => {
// 		fs.writeFile(`${CONFIG.COMPath}/${fileName}.html`, html, (err) => {
// 			if (err) {
// 				return reject(err);
// 			}

// 			resolve();
// 		})
// 	});

// }

async function package(js, html) {
	let result = null;
	// console.log(data, html);
	await writwFile(js.path, js.content);
	await writeFile(html.path, html.content);

	return true;
}

module.exports = {
	newEnteryFileByComponents,
	newTemplateFile,
	package,
}