
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
