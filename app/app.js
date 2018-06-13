requirejs(["router", "helpers"], function(router, helpers) {
	const initApp = (config) => {
		window.appConfig = config;
		if (window.appConfig['require-api-key']){
			var xApiKey = sessionStorage.getItem('x-api-key');
			if (xApiKey === null){
				xApiKey = prompt("Please, provide you X-API-Key");
				sessionStorage.setItem("x-api-key", xApiKey);
			}
			window.appConfig['x-api-key'] = xApiKey;
		}
		document.querySelector("title").appendChild(document.createTextNode("🦓 " + config.name));
		document.querySelector("#instance-name a").appendChild(document.createTextNode(config.name));
		document.querySelector("header").style.background = config.color;
	}
	const loadAPIUrl = () => {
		var apiURL = document.location.search || "?";
		if (apiURL !== "?"){
			apiURL = apiURL.substr(1);
		}
		if (apiURL.length === 0){
			apiURL = sessionStorage.getItem('api-url');
			if (apiURL === null){
				apiURL = prompt("Please, input URL of Zebra API to work with");
				sessionStorage.setItem('api-url', apiURL);
			}
		}
		return apiURL;
	};
	window.apiURL = (window.location.protocol !== "https:") ? loadAPIUrl() : window.location.origin;
	helpers.ajax("GET", window.apiURL + "/config", {}, [], (response) => {
		initApp(response)
		window.addEventListener("hashchange", router, false);
		router();
	});
	setInterval(() => {
		document.querySelectorAll(".countdown").forEach((item) => {
			var countdown = helpers.countdownString(item.getAttribute("data-countdown"));
			item.querySelector('span').innerHTML = countdown.clock;
			if ((countdown.status == "warning") && !item.classList.contains("warning")){
				item.classList.add("warning");
			} else if ((countdown.status == "gone") && !item.classList.contains("gone")){
				item.classList.remove("warning");
				item.classList.add("gone");
			}
		});
	}, 1000);
});