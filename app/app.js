requirejs(["router", "helpers"], function(router, helpers) {
	const initApp = (config) => {
		window.appConfig = config;
		document.querySelector("title").appendChild(document.createTextNode(config.name));
		document.querySelector("#instance-name a").appendChild(document.createTextNode(config.name));
	}
	const loadAPIUrl = () => {
		var apiURL = sessionStorage.getItem('api-url');
		if (apiURL === null){
			apiURL = prompt("Please, input URL of Zebra API to work with");
			sessionStorage.setItem('api-url', apiURL);
		}
		return apiURL;
	};
	window.apiURL = (window.location.protocol !== "https:") ? loadAPIUrl() : window.location.origin;
	helpers.ajax("GET", window.apiURL + "/config", {}, [], (response) => {
		initApp(response)
		window.addEventListener("hashchange", router, false);
		router();
	});
});