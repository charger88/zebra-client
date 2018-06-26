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
				localStorage.setItem("share-form-burn", data["burn"] ? 1 : 0);
				localStorage.setItem("share-form-mode", data["mode"]);
				localStorage.setItem("share-form-expiration", expiration);
				localStorage.setItem("share-form-expiration-mode", expirationMode);
				let encryptionPassword = e.target.querySelector('input[name="encryption-password"]').value;
				data["expiration"] = expiration * expirationMode;
				data["encrypted-with-client-side-password"] = encryptionPassword.length > 0;
				var dataText = data["data"];
				if (e.target.querySelector('input[name="password"]')){
					data["password"] = e.target.querySelector('input[name="password"]').value;
					if (data["encrypted-with-client-side-password"]){
						data["data"] = CryptoJS.AES.encrypt(dataText, String(encryptionPassword)).toString();
					} else if (data["password"].length > 0){
						data["data"] = CryptoJS.AES.encrypt(dataText, String(data["password"])).toString();
					}
					if (data["password"].length > 0){
						data["password"] = CryptoJS.SHA256("ZEBRA-CLIENT:" + data["password"]).toString();
					}
				}
				data["expiration"] = data["expiration"] ? data["expiration"] : 3600;
				var headers = [];
				if (window.appConfig && window.appConfig['require-api-key']){
					headers.push({
						"name": "X-Api-Key",
						"value": helpers.getXAPIKey()
					});
				}
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