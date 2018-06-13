define(['helpers'], function (helpers) {
	const submitForm = (e) => {
		e.preventDefault();
		var data = {};
		data["data"] = e.target.querySelector('textarea[name="data"]').value;
		data["burn"] = e.target.querySelector('input[name="burn"]').checked;
		if (e.target.querySelector('input[name="password"]')){
			data["password"] = e.target.querySelector('input[name="password"]').value;
		}
		data["expiration"] = parseInt(e.target.querySelector('input[name="expiration"]').value);
		data["mode"] = e.target.querySelector('input[name="mode"]:checked').value;
		localStorage.setItem("share-form-burn", data["burn"] ? 1 : 0);
	    localStorage.setItem("share-form-mode", data["mode"]);
    	localStorage.setItem("share-form-expiration", data["expiration"]);
    	data["expiration"] = data["expiration"] ? data["expiration"] : 3600;
		helpers.ajax("POST", window.apiURL + "/stripe", data, [], (response) => {
			window.lastSharedStripe = response;
			window.lastSharedStripe['data'] = data["data"];
			window.location.hash = "#open/" + helpers.deFormatCode(response.key) + (data["password"] ? "/p" : "");
		}, helpers.renderErrorCallbackInMain);
	};
	const shareFormMode = (e) => {
		if (e.target.checked){
			document.getElementById('share-form-mode-example').innerHTML = helpers.formatCode(e.target.getAttribute('data-example'));
		}
	};
    return {
    	el: "main",
    	template: "tpl-share-form",
	    render: (context) => {
	    	context.$el.querySelector('#share-form').addEventListener("submit", submitForm, false);
	    	context.$el.querySelectorAll('#share-form-mode input').forEach(function(item) {
	    		item.addEventListener("click", shareFormMode, false);
	    	});
	    	document.getElementById('share-form-mode-example').innerHTML = helpers.formatCode(
	    		context.$el.querySelector('#share-form-mode input:checked').getAttribute('data-example')
	    	);
	    	if (parseInt(localStorage.getItem("share-form-burn"))){
	    		context.$el.querySelector('#share-form-burn').checked = true;
	    	}
	    	if (localStorage.getItem("share-form-mode")){
	    		context.$el.querySelector('#share-form-mode input[value="' + localStorage.getItem("share-form-mode") + '"]').checked = true;
	    	}
	    	if (localStorage.getItem("share-form-expiration")){
	    		context.$el.querySelector('#share-form-expiration').value = localStorage.getItem("share-form-expiration");
	    	}
	    	const passwordPolicy = window.appConfig['password-policy'];
	    	if (passwordPolicy === "disabled"){
	    		var obj = context.$el.querySelector("#share-form-password-wrapper");
	    		while (obj.firstChild) {
				    obj.removeChild(obj.firstChild);
				}
				obj.remove();
	    	} else if (passwordPolicy === "required"){
	    		context.$el.querySelector("#share-form-password-optional").style.display = "none";
	    	}
	    }
	};
});