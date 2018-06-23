requirejs(["router", "helpers"], function(router, helpers) {
	const checkVersion = (version) => {
		if (!version){
			return false;
		}
		const versions = ["1.0."];
		for (var i = 0;i < versions.length;i++){
			if (version.startsWith(versions[i])){
				return true;
			}
		}
		return false;
	}
	const initApp = (config) => {
		if (!checkVersion(config.version)){
			return false;
		}
		window.appConfig = config;
		document.querySelector("title").appendChild(document.createTextNode("🦓 " + config.name));
		document.querySelector("#instance-name a").appendChild(document.createTextNode(config.name));
		document.querySelector("header").style.background = config.color;
		if (config.email) {
			document.querySelector("#email-data").appendChild(document.createTextNode(config.email));
			document.querySelector("#email-paragraph").style.display = "block";
		}
		return true;
	}
	const loadAPIUrl = () => {
		var apiURL = document.location.search || "?";
		apiURL = (apiURL !== "?") ? apiURL.substr(1) : "";
		if (apiURL.length === 0){
			apiURL = sessionStorage.getItem('api-url');
			if (apiURL === null){
				apiURL = prompt("Please, input URL of Zebra API to work with");
				apiURL = apiURL.replace(/\/+$/, "");
				sessionStorage.setItem('api-url', apiURL);
			}
		}
		return apiURL;
	};
	window.apiURL = (window.location.protocol !== "https:") ? loadAPIUrl() : window.location.origin;
	helpers.ajax("GET", window.apiURL + "/config", {}, [], (response) => {
		if (initApp(response)){
			document.querySelector("body").classList.remove("not-initialized");
			window.addEventListener("hashchange", router, false);
			router();
		} else {
			if (window.location.protocol !== "https:"){
				alert("Version problem. Update your Zebra client's files.");
			} else {
				alert("Version problem. Try to clear your browser's chache.");
			}
		}
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