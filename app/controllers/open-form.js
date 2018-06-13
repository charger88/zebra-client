define(['helpers'], function (helpers) {
	const submitForm = (e) => {
		e.preventDefault();
		var key = e.target.querySelector('input[name="key"]').value;
		window.location.hash = "#open/" + helpers.deFormatCode(key) + (false ? "/p" : "");
	};
    return {
    	el: "main",
    	template: "tpl-open-form",
	    render: (context) => {
	    	context.$el.querySelector('#open-form').addEventListener("submit", submitForm, false);
	    	const passwordPolicy = window.appConfig['password-policy'];
	    	if (passwordPolicy === "disabled"){
	    		var obj = context.$el.querySelector("#open-form-password-wrapper");
	    		while (obj.firstChild) {
				    obj.removeChild(obj.firstChild);
				}
				obj.remove();
	    	} else if (passwordPolicy === "required"){
	    		context.$el.querySelector("#open-form-password-optional").style.display = "none";
	    	}
	    }
	};
});