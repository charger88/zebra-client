define(['helpers'], function (helpers) {
    return {
    	el: "main",
    	template: "tpl-shared-text",
    	init: (context, renderCallback) => {
			if (window.lastSharedStripe && window.lastSharedStripe.key === context.request.key){
				context.data = window.lastSharedStripe;
    			renderCallback(context);
    		} else {
	    		var data = [];
	    		data.push("key=" + encodeURIComponent(context.request.key));
				helpers.ajax("GET", window.apiURL + "/stripe?" + data.join('&'), {}, [], (response) => {
					context.data = response;
					renderCallback(context);
				});
			}
    	},
	    render: (context) => {
  			context.$el.querySelector("#shared-text").appendChild(document.createTextNode(context.data.data));
  			context.$el.querySelector("#shared-text-url").value = window.appConfig.url + "#open/" + context.data.key;
	    }
	};
});