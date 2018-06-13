define([
	"controllers/index",
	"controllers/open-form",
	"controllers/share-form",
	"controllers/shared-text"
], function (
	index,
	openForm,
	shareForm,
	sharedText
) {
	const processController = (controller, request) => {
		context = {};
		context.request = request || {};
		context.$el = document.getElementById(controller.el);
		context.$el.classList.add("loading");
		const initCallback = controller.init || ((context, renderCallback) => {
			renderCallback(context);
		});
		const renderCallback = controller.render || ((context) => {
			console.log('Default render callback was invoked', data);
		});
	    initCallback(context, (context) => {
			var selected = document.querySelector("nav a.selected");
			if (selected !== null){
				selected.classList.remove('selected');
			}
			while (context.$el.firstChild) {
			    context.$el.removeChild(context.$el.firstChild);
			}
			if (controller.template){
				context.$el.innerHTML = document.getElementById(controller.template).innerHTML;
			}
	    	renderCallback(context);
	    	context.$el.classList.remove("loading");
	    	context.$el.classList.remove("error");
	    	selected = document.querySelector(`nav a[href="${window.location.hash}"]`);
			if (selected !== null){
				selected.classList.add('selected');
			}
	    });
	};
    return () => {
    	const route = window.location.hash.split('/');
    	if (route[0] == "#share"){
			return processController(shareForm);
    	} else if (route[0] == "#open") {
    		if (route[1]){
				return processController(sharedText, {
					"key": route[1],
					"password": route[2] == "p"
				});
    		} else {
				return processController(openForm);
			}
    	} else {
    		return processController(index);
    	}
	};
});