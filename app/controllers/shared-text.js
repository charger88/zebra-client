define(['helpers'], function (helpers) {
	const copyValue = (e) => {
		var input = document.getElementById(e.target.getAttribute("for"));
		input.classList.add("copying");
		input.setSelectionRange(0, input.value.length);
		document.execCommand("copy");
		input.setSelectionRange(0, 0);
		setTimeout(function(){
			input.classList.remove("copying");
		}, 500);
	};
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
	    		if (context.request.password){
	    			var p = prompt("Password required");
	    			data.push("password=" + encodeURIComponent(p));
	    		}
	    		var headers = [];
	    		if (window.appConfig && window.appConfig['require-api-key'] && !window.appConfig['require-api-key-for-post-only']){
	    			headers.push({
	    				"name": "X-Api-Key",
	    				"value": helpers.getXAPIKey()
	    			});
				}
				helpers.ajax("GET", window.apiURL + "/stripe?" + data.join('&'), {}, headers, (response) => {
					context.data = response;
					renderCallback(context);
				}, helpers.renderErrorCallbackInMain);
			}
    	},
	    render: (context) => {
  			context.$el.querySelector("#shared-text").appendChild(document.createTextNode(context.data.data));
			context.$el.querySelector("#shared-text-key").value = helpers.formatCode(context.data.key);
  			context.$el.querySelector('label[for="shared-text-key"]').addEventListener("click", copyValue, false);
  			context.$el.querySelector("#shared-text-url").value = window.appConfig.url + "#open/" + context.data.key + (context.data.password ? "/p" : "");
	    	context.$el.querySelector('label[for="shared-text-url"]').addEventListener("click", copyValue, false);
  			context.$el.querySelector("#shared-text-countdown").setAttribute("data-countdown", context.data.expiration);
  			var countdownObj = context.$el.querySelector("#shared-text-countdown");
  			var countdown = helpers.countdownString(context.data.expiration);
			countdownObj.querySelector('span').innerHTML = countdown.clock;
			if (countdown.status == 'warning' && !countdownObj.classList.contains("warning")){
				countdownObj.classList.add("warning");
			} else if (countdown.status == 'gone' && !countdownObj.classList.contains("gone")){
				countdownObj.classList.remove("warning");
				countdownObj.classList.add("gone");
			}
	    }
	};
});