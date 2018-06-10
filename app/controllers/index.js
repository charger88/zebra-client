define([], function () {
    return {
    	el: "main",
    	template: "tpl-index",
	    render: (context) => {
	    	context.$el.querySelector("#index-instance-name").appendChild(document.createTextNode(window.appConfig.name));
	    }
	};
});