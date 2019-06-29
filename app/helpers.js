define([], function () {
    return {
    	'formatCode': (code) => {
    		const blockSize = code.length > 9 ? 4 : 3;
            let chunks = [];
            let chunkSize;
    		if (code.length > 4){
                let l;
	    		while (l = code.length){
	    			chunkSize = l % blockSize;
	    			chunkSize = chunkSize == 0 ? blockSize : (chunkSize == 1 ? 2 : chunkSize);
	    			chunks.push(code.substr(0, chunkSize));
	    			code = code.substr(chunkSize);
	    		}
	    	} else {
	    		chunks.push(code);
	    	}
    		return chunks.join("-");
    	},
    	'deFormatCode': (code) => {
			return code.split("-").join("");
    	},
    	'getXAPIKey': () => {
            let xApiKey = sessionStorage.getItem('x-api-key');
			if ((xApiKey === null) || (xApiKey === "null")){
				xApiKey = prompt("Please, provide you X-API-Key");
				if (xApiKey){
					if (xApiKey.substr(0, 2) === 'G_') {
            xApiKey = xApiKey.substr(2);
          } else {
            sessionStorage.setItem("x-api-key", xApiKey);
					}
				}
			}
			return xApiKey;
    	},
    	'renderErrorCallbackInMain': (response, status) => {
    		document.getElementById("main").classList.remove("loading");
    		document.getElementById("main").classList.add("error");
    		document.getElementById("main").innerHTML = document.getElementById("tpl-error").innerHTML;
    		if (response['error-message'] && (response['error-message'].length > 0)){
    			document.getElementById("error-message").innerHTML = response['error-message'].charAt(0).toUpperCase() + response['error-message'].substr(1) + ".";
    		}
    	},
    	'countdownString': (countdown) => {
			if (countdown){
				const timestamp = Math.ceil(Date.now() / 1000) + window.timeDiff;
				const diff = countdown > timestamp ? (countdown - timestamp) : 0;
				const h = Math.floor(diff / 3600);
                const m = Math.floor(diff % 3600 / 60);
                const s = Math.floor(diff % 60);
				return {
					"clock": (h + ":" + (m >= 10 ? m : "0" + m) + ":" + (s >= 10 ? s : "0" + s)),
					"status": (diff < 60) ? ((diff > 0) ? "warning" : "gone") : "normal"
				};
			}
			return {
				"clock": "",
				"status": "normal"
			};
    	},
    	'ajax': (method, uri, data, headers, successCallback, errorCallback, anywayCallback) => {
    		method = method || 'GET';
    		uri = uri || '';
    		data = data || {};
    		headers = headers || [];
    		successCallback = successCallback || ((response, status) => {});
    		errorCallback = errorCallback || ((response, status) => {
    			alert(`Error (${status}): ${response['error-message']}`);
    		});
    		anywayCallback = anywayCallback || ((response) => {});
			let xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (!((this.readyState == 1) || (this.readyState == 2) || (this.readyState == 3))) {
					let response;
					try {
						response = JSON.parse(this.response);
					} catch (e){
						response = {"response": this.response};
					}
					if ((this.readyState == 4) && (this.status >= 200) && (this.status < 300)) {
						successCallback(response, this.status);
					} else {
						errorCallback(response, this.status);
					}
					anywayCallback(response);
				}
			};
			xhttp.open(method, uri, true);
		    xhttp.setRequestHeader('Content-type', 'application/json');
		    headers.forEach(function (header) {
		    	if (header['value'] !== null){
		        	xhttp.setRequestHeader(header['name'], header['value']);
		    	}
		    });
			xhttp.send(data ? JSON.stringify(data) : null);
    	}
	};
});