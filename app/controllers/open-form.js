define([], function () {
	const submitForm = (e) => {
		e.preventDefault();
		var key = e.target.querySelector('input[name="key"]').value;
		window.location.hash = "#open/" + key + (false ? "/password" : "");
	};
    return {
    	el: "main",
    	template: "tpl-open-form",
	    render: (context) => {
	    	context.$el.querySelector('#open-form').addEventListener("submit", submitForm, false);
	    }
	};
});