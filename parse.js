const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const mkdirp = require('mkdirp');

const docPath = path.resolve('./css-handbook');
const docsetPath = path.resolve('css.docset/Contents/Resources');

let files = ['index.htm'];
let filesName = ['首页'];
let notFound = [];
let counter = 0;

// 匹配页面的正则
let regexp = /<a href="(?!https?:\/\/|#|mailto:|\?)([^"#]+?)(?:#[^"]+)?">(.*?)<\/a>/ig;

// 获取所有链接地址
while (counter < files.length) {
	let htmlDoc, filePath = path.resolve(docPath, files[counter]);
	try {
		htmlDoc = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
		notFound.push(filePath +'   ' +files[counter]);
		counter++;
		continue;
    }
    counter++;

	// 分析文件中的链接
	let regexpRes;
	while ( regexpRes = regexp.exec(htmlDoc) ){
		let regFilePath = path.relative(docPath, path.resolve(path.dirname(filePath), regexpRes[1]));
		let title = entities.decode( regexpRes[2] );

		// 已经加入 || 语言API || 简介
		if(files.indexOf(regFilePath) !== -1 || /properties\/speech\/(?!index.htm)/i.test(regFilePath) ||regFilePath.indexOf('introduction/') === 0) continue;

		console.log(regFilePath, title, regexpRes[0]);
		files.push(regFilePath);
		filesName.push(title);
	}
}


console.log(`---------> 共分析出 ${files.length} 个页面, 载入出错${notFound.length}个 <--------`);
/* if(notFound.length){
	console.log(`======> Error: 以下地址打开出错：\n\t${notFound.join('\n\t')}`);
} */

// 复制页面文件
files.forEach((filePath, index) => {
	if(fs.existsSync(`${docPath}/${filePath}`) && filePath !== 'index.htm'){
		let htmlDoc = fs.readFileSync(`${docPath}/${filePath}`, 'utf-8');

		// 删除不要的内容
		htmlDoc = htmlDoc.replace(/<!--\[if lte IE 8\]>\s*<script src=".*?js\/html5\.js"><\/script>\s*<!\[endif\]-->\s*\n/i, '')
			.replace(/<nav id="guide" class="g-mod">[\s\S]+?<\/nav>\s*\n/i, '')
			.replace(/<script src="(.*?)js\/inner\.js"><\/script>/i, '<script src="$1skin/inner.js"></script>')
			.replace(/<script src=".*?js\/jquery\.js"><\/script>\s*\n/i, '')

		mkdirp.sync(path.dirname(`${docsetPath}/Documents/${filePath}`));
		fs.writeFileSync(`${docsetPath}/Documents/${filePath}`, htmlDoc, 'utf-8');
	}
});




// 复制静态文件
mkdirp.sync(`${docsetPath}/Documents/skin`);
fs.createReadStream(`${docPath}/skin/ico.png`).pipe(fs.createWriteStream(`${docsetPath}/Documents/skin/ico.png`));
fs.createReadStream(`${docPath}/skin/global.css`).pipe(fs.createWriteStream(`${docsetPath}/Documents/skin/global.css`));
fs.createReadStream(`${docPath}/skin/article.css`).pipe(fs.createWriteStream(`${docsetPath}/Documents/skin/article.css`));
// 例子预览功能
fs.writeFileSync(`${docsetPath}/Documents/skin/inner.js`, `
var $example = document.getElementById('example');
var $exampleIframe = document.createElement('iframe');
$exampleIframe.setAttribute('src', 'about:blank');
$exampleIframe.setAttribute('style', 'display:none;margin: 10px;border: 1px solid #ddd;width:95vw;height:60vh;max-width:100%;');
$example.appendChild($exampleIframe);
var $btn = $example.querySelector('#example .g-btn');
$btn.addEventListener('click', function(e){
	$exampleIframe.style.display = 'block';
	var $txtarea = $example.querySelector('#example textarea');
	var $iframeDoc = $exampleIframe.contentWindow.document;
	$iframeDoc.write($txtarea.value);
	$iframeDoc.close();
}, false);
`, 'utf-8');




// 写入Dash数据库
console.log(`${docsetPath}/docSet.dsidx`);
let seq = new Sequelize('database', 'username', 'password', {
	dialect: 'sqlite',
	storage: `${docsetPath}/docSet.dsidx`
});
SearchIndex = seq.define('searchIndex', {
	// id: {type: Sequelize.INTEGER, autoIncrement: true},
	name: {type: Sequelize.STRING},
	type: {type: Sequelize.STRING},
	path: {type: Sequelize.STRING}
}, {
	freezeTableName: true,
	timestamps: false
});
SearchIndex.sync({force: true}).then(function(){
	// console.log(files.length, files);
	files.forEach((filePath, index) => {
		let title = filesName[index];
		let type = getType(filePath, title);
		if(!type || !fs.existsSync(`${docPath}/${filePath}`) ) return;
		var si = SearchIndex.build({
			name: title,
			type: type,
			path: filePath
		});
		si.save()
	});
});

function getType(path, title){
	if(path == 'index.htm'){
	   	return;
	}else if(path.indexOf('/') == -1 || /\/index\.htm$/i.test(path) || /^experience\//.test(path) ){
		// 顶级页面、所有小首页、常见问题总结 放入Namespace
		return 'Namespace'
	}else if(path.indexOf('functional') > -1 || /\(\)\.htm/.test(path) || /^@/.test(title) ) {
		return 'Function'
	}else if(title.indexOf('E:') == 0 || path.indexOf('selectors') > -1 || /^@/.test(title)){ // DOM选择器
		return 'cl';
	}else if(path.indexOf('properties') != -1){
		return 'Property';
	}else{
		return 'Guide'
	}


	/* var type = /^(?:\.{1,2}\/)?([^\/]+)\//g.exec(path);
	return type && type[1].replace(/^\S/, (s)=>{ //首字母大写
		return s.toUpperCase();
	}) */
}
