define(['helpers', 'controllers/controller', 'crypto/aes', 'crypto/sha256'], function (helpers, Controller) {
	return class extends Controller {
		el(){
			return "main";
		}
		template(){
			return "tpl-share-form";
		}
		render(context) {
			if (window.appConfig && window.appConfig['require-api-key'] && !sessionStorage.getItem('x-api-key')){
				if (!confirm("System will ask you for API Key to proceed. If you don't have one press \"Cancel\".")){
					window.location.hash = "#";
					return null;
				}
			}
			context.$el.querySelector('#share-form').addEventListener("submit", (e) => {
				e.preventDefault();
				var data = {};
				data["data"] = e.target.querySelector('textarea[name="data"]').value;
				data["burn"] = e.target.querySelector('input[name="burn"]').checked;
				let expiration = parseInt(e.target.querySelector('input[name="expiration"]').value);
				let expirationMode = parseInt(e.target.querySelector('input[name="expiration-mode"]:checked').value);
				data["mode"] = e.target.querySelector('input[name="mode"]:checked').value;
				var dataText = data["data"];
				let encryptionPasswordInput = e.target.querySelector('input[name="encryption-password"]');
				let encryptionPassword = encryptionPasswordInput ? String(encryptionPasswordInput.value) : "";
				data["expiration"] = expiration * expirationMode;
				data["encrypted-with-client-side-password"] = encryptionPassword.length > 0;
				let passwordInput = e.target.querySelector('input[name="password"]');
				let password = passwordInput ? String(passwordInput.value) : "";
				if (password.length > 0) {
					data["password"] = CryptoJS.SHA256("ZEBRA-CLIENT:" + password).toString();
				}
				if (data["encrypted-with-client-side-password"]) {
					let salt = Math.floor(Math.random() * Math.pow(256, 4)).toString(16);
					if (salt.length > 8) {
						salt = "0".repeat(8 - salt.length) + salt;
					}
					let hash = CryptoJS.SHA256(salt + data["data"]).toString(CryptoJS.enc.Base64);
					data["data"] = salt + "|" + hash + "|" + CryptoJS.AES.encrypt(data["data"], encryptionPassword).toString();
				} else if (password.length > 0) {
					data["data"] = CryptoJS.AES.encrypt(data["data"], password).toString();
				}
				if ((new Blob([data["data"]])).size > window.appConfig["max-text-length"]){
					alert("Text is longer than allowed");
					return;
				}
				data["expiration"] = data["expiration"] ? data["expiration"] : 3600;
				var headers = [];
				if (window.appConfig && window.appConfig['require-api-key']){
					headers.push({
						"name": "X-Api-Key",
						"value": helpers.getXAPIKey()
					});
				}
				localStorage.setItem("share-form-burn", data["burn"] ? 1 : 0);
				localStorage.setItem("share-form-mode", data["mode"]);
				localStorage.setItem("share-form-expiration", expiration);
				localStorage.setItem("share-form-expiration-mode", expirationMode);
				helpers.ajax("POST", window.apiURL + "/stripe", data, headers, (response) => {
					localStorage.setItem("OWNER:" + response['key'], response['owner-key']);
					window.lastSharedStripe = response;
					window.lastSharedStripe['data'] = dataText;
					window.location.hash = "#open/" + helpers.deFormatCode(response.key) + (data["password"] ? "/p" : "");
				}, helpers.renderErrorCallbackInMain);
			}, false);
			context.$el.querySelectorAll('#share-form-mode input').forEach(function(item) {
				item.addEventListener("click", (e) => {
					if (e.target.checked){
						document.getElementById('share-form-mode-example').innerHTML = helpers.formatCode(e.target.getAttribute('data-example'));
					}
				}, false);
			});
			document.getElementById('share-form-mode-example').innerHTML = helpers.formatCode(
				context.$el.querySelector('#share-form-mode input:checked').getAttribute('data-example')
			);
			if (parseInt(localStorage.getItem("share-form-burn"))){
				context.$el.querySelector('#share-form-burn').checked = true;
			}
			if (localStorage.getItem("share-form-mode")){
				context.$el.querySelector('#share-form-mode input[value="' + localStorage.getItem("share-form-mode") + '"]').checked = true;
			}
			if (localStorage.getItem("share-form-expiration")){
				context.$el.querySelector('#share-form-expiration').value = localStorage.getItem("share-form-expiration");
			}
			if (localStorage.getItem("share-form-expiration-mode")){
				let period = parseInt(localStorage.getItem("share-form-expiration-mode") || 86400);
				context.$el.querySelector('#share-form-expiration-mode input[value="' + period + '"]').checked = true;
				context.$el.querySelector("#share-form-expiration").setAttribute("min", Math.ceil(10.0 / period));
				context.$el.querySelector("#share-form-expiration").setAttribute("max", Math.floor(window.appConfig["max-expiration-time"] / period));
			}
			context.$el.querySelectorAll('#share-form-expiration-mode input[name="expiration-mode"]').forEach(($element) => {
				$element.addEventListener("click", (e) => {
					let period = parseInt(e.target.value);
					context.$el.querySelector("#share-form-expiration").setAttribute("min", Math.ceil(10.0 / period));
					context.$el.querySelector("#share-form-expiration").setAttribute("max", Math.floor(window.appConfig["max-expiration-time"] / period));
				}, false);
			});
			const passwordPolicy = window.appConfig['password-policy'];
			if (passwordPolicy === "disabled"){
				var obj = context.$el.querySelector("#share-form-password-wrapper");
				while (obj.firstChild) {
					obj.removeChild(obj.firstChild);
				}
				obj.remove();
			} else if (passwordPolicy === "required"){
				context.$el.querySelector("#share-form-password").setAttribute("required", "required");
				context.$el.querySelector("#share-form-password-optional").style.display = "none";
			}
			const encryptionPasswordPolicy = window.appConfig['encryption-password-policy'];
			if (encryptionPasswordPolicy === "disabled"){
				var obj = context.$el.querySelector("#share-form-encryption-password-wrapper");
				while (obj.firstChild) {
					obj.removeChild(obj.firstChild);
				}
				obj.remove();
			} else if (encryptionPasswordPolicy === "required"){
				context.$el.querySelector("#share-form-encryption-password").setAttribute("required", "required");
				context.$el.querySelector("#share-form-encryption-password-optional").style.display = "none";
			}
		}
	}
});