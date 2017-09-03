
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


function newEnteryFileByComponents(data) {
	const outPutName = 'tmq';

	if (data.length < 1) {
		return;
	}
	// console.log(data);
	let jsContent = '';
	data.forEach((item) => {
		jsContent += getComponent(item);
	});

	return new Promise((resolve, reject) => {
		fs.writeFile(`${CONFIG.COMPath}/enterys_${outPutName}.js`, jsContent, (err) => {
			if (err) {
				return reject(err);
			}

			resolve();
		})
	})
}

function newTemplateFile(html) {
	const outPutName = 'tmq';
	return new Promise((resolve, reject) => {
		fs.writeFile(`${CONFIG.COMPath}/template_${outPutName}.html`, html, (err) => {
			if (err) {
				return reject(err);
			}

			resolve();
		})
	});

}

async function package(data, html) {
	let result = null;
	// console.log(data, html);
	await newEnteryFileByComponents(data);
	await newTemplateFile(html);

	return true;
}

module.exports = {
	newEnteryFileByComponents,
	newTemplateFile,
	package,
}