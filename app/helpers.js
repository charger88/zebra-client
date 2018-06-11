define([], function () {
    return {
    	'formatCode': (code) => {
    		const blockSize = code.length > 9 ? 4 : 3;
    		var chunks = [];
    		var chunkSize;
    		if (code.length > 4){
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
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (!((this.readyState == 1) || (this.readyState == 2) || (this.readyState == 3))) {
					var response;
					try {
						response = JSON.parse(this.response)
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
		        xhttp.setRequestHeader(header['name'], header['value']);
		    });
			xhttp.send(data ? JSON.stringify(data) : null);
    	}
	};
});