// @TODO: centralize treasure data
const treasures = [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 30, 10, 30, 30, 30, 30, 30, 30, 30, 100, 600, 1500, 300, 100, 30, 300, 300, 300, 300, 100];

class ConfigHandler {
	get unit() {
		return localStorage.getItem('unit') ?? 'S';
	}
	set unit(value) {
		if (value === null)
			localStorage.removeItem('unit');
		else
			localStorage.setItem('unit', value);
	}
	get prec() {
		let value = localStorage.getItem('prec');
		return (value !== null) ? parseInt(value, 10) : 2;
	}
	set prec(value) {
		if (value === null)
			localStorage.removeItem('prec');
		else
			localStorage.setItem('prec', value);
	}
	get stagel() {
		let value = localStorage.getItem('stagel');
		return (value !== null) ? parseInt(value, 10) : 0;
	}
	set stagel(value) {
		if (value === null)
			localStorage.removeItem('stagel');
		else
			localStorage.setItem('stagel', value);
	}
	get stagef() {
		return localStorage.getItem('stagef') ?? 'F';
	}
	set stagef(value) {
		if (value === null)
			localStorage.removeItem('stagef');
		else
			localStorage.setItem('stagef', value);
	}
	get layout() {
		let value = localStorage.getItem('layout');
		return (value !== null) ? parseInt(value, 10) : 1;
	}
	set layout(value) {
		if (value === null)
			localStorage.removeItem('layout');
		else
			localStorage.setItem('layout', value);
	}
	get colorTheme() {
		return localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	}
	set colorTheme(value) {
		if (value === null)
			localStorage.removeItem('theme');
		else
			localStorage.setItem('theme', value);
	}
	get starCats() {
		let value = localStorage.getItem('star-cats');
		return (value !== null) ? JSON.parse(value) : [];
	}
	set starCats(list) {
		if (Array.isArray(list)) {
			const value = JSON.stringify(list);
			localStorage.setItem('star-cats', value);
		} else if (list === null) {
			localStorage.removeItem('star-cats');
		} else {
			throw new Error(`Unexpected value of cats: ${JSON.stringify(list)}`);
		}
	}
	getTreasure(i) {
		let value = localStorage.getItem("t$" + i);
		return (value !== null) ? parseInt(value, 10) : treasures[i];
	}
	setTreasure(i, value) {
		if (value === null)
			localStorage.removeItem('t$' + i);
		else
			localStorage.setItem('t$' + i, value);
	}
	getTreasures() {
		return treasures.map((_, i) => {
			return this.getTreasure(i);
		});
	}
	setTreasures(values) {
		values.map((value, i) => {
			this.setTreasure(i, value);
		});
	}
	getDefaultTreasures() {
		return structuredClone(treasures);
	}
}

function toggleTheme(newValue) {
	if (!newValue) {
		newValue = (config.colorTheme === 'dark') ? 'light' : 'dark';
	}
	document.documentElement.classList[newValue === 'dark' ? 'add' : 'remove']('dark');
	config.colorTheme = newValue;
}

function resetTheme() {
	config.colorTheme = null;
	toggleTheme(config.colorTheme);
}

function getNumFormatter(prec = config.prec) {
	return new Intl.NumberFormat(undefined, {
		'maximumFractionDigits': prec,
	});
}

function numStr(num) {
	const formatter = getNumFormatter();
	const fn = numStr = num => formatter.format(num);
	return fn(num);
}

function numStrT(num) {
	const fn = numStrT = (config.unit === 'F') ?
		num => num.toString() + ' F' :
		num => numStr(num / 30) + ' 秒';
	return fn(num);
}

function numStrX(num) {
	const fn = numStrT = (config.unit === 'F') ?
		num => num.toString() + ' F' :
		num => numStr(num / 30);
	return fn(num);
}

function round(num, decimals = 0) {
	const mul = 10 ** decimals;
	return Math.round((num + Number.EPSILON) * mul) / mul;
}

/**
 * Strip out the non-integer part of a number.
 *
 * This only floors a positive number and works more like parseInt(x), except
 * that this also casts NaN to 0.
 *
 * @example:
 * ~~(4.7) === parseInt(4.7) === Math.floor(4.7) === 4
 * ~~(4.3) === parseInt(4.3) === Math.floor(4.3) === 4
 * ~~(-3.4) === parseInt(-3.4) === Math.floor(-3.4) === -3
 * ~~(-3.7) === parseInt(-3.7) === -3; Math.floor(-3.7) === -4
 * ~~("") === 0; Math.floor("") === parseInt("") === NaN
 * ~~(undefined) === 0; Math.floor(undefined) === parseInt(undefined) === NaN
 * ~~(NaN) === 0; Math.floor(NaN) === parseInt(NaN) === NaN
 *
 * @TODO: rename to int() or toInt()?
 */
function floor(x) {
	return ~~x;
}

async function fetchUrl(url, options) {
	const response = await fetch(url, options).catch(ex => {
		throw new Error(`Unable to fetch "${url}": ${ex.message}`);
	});
	if (!response.ok) {
		throw new Error(`Bad rsponse when fetching "${url}": ${response.status} ${response.statusText}`, {cause: response});
	}
	return response;
}

async function loadDomToImage() {
	if (typeof globalThis.domtoimage === 'undefined') {
		await new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.onload = resolve;
			script.onerror = reject;
			script.src = '/dom-to-image.min.js';
			document.head.appendChild(script);
			script.remove();
		});
	}
	return globalThis.domtoimage;
}

function saveBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	if (filename) {
		a.download = filename;
	}
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

async function savePng(elem, filename, options) {
	const domtoimage = await loadDomToImage();
	const blob = await domtoimage.toBlob(elem, options);
	saveBlob(blob, filename);
}

async function copyPng(elem, options) {
	const domtoimage = await loadDomToImage();
	const blob = await domtoimage.toBlob(elem, options);
	await navigator.clipboard.write([
		new ClipboardItem({
			'image/png': blob
		})
	]);
}

const config = new ConfigHandler();

export {
	config,
	toggleTheme,
	resetTheme,
	fetchUrl as fetch,
	saveBlob,
	savePng,
	copyPng,
	getNumFormatter,
	numStr,
	numStrT,
	numStrX,
	round,
	floor,
};
