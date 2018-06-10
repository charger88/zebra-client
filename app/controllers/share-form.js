define(['helpers'], function (helpers) {
	const submitForm = (e) => {
		e.preventDefault();
		var data = {};
		data["data"] = e.target.querySelector('textarea[name="data"]').value;
		data["burn"] = e.target.querySelector('input[name="burn"]').checked;
		data["password"] = e.target.querySelector('input[name="password"]').value;
		data["expiration"] = parseInt(e.target.querySelector('input[name="expiration"]').value);
		data["expiration"] = data["expiration"] ? data["expiration"] : 3600;
		data["mode"] = e.target.querySelector('input[name="mode"]:checked').value;
		helpers.ajax("POST", window.apiURL + "/stripe", data, [], (response) => {
			window.lastSharedStripe = response;
			window.lastSharedStripe['data'] = data["data"];
			window.location.hash = "#open/" + response.key + (false ? "/password" : "");
		});
	};
    return {
    	el: "main",
    	template: "tpl-share-form",
	    render: (context) => {
	    	context.$el.querySelector('#share-form').addEventListener("submit", submitForm, false);
	    }
	};
});