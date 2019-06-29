define(['helpers', 'controllers/controller', 'crypto/sha256'], function (helpers, Controller) {
  return class extends Controller {
    el() {
      return "main";
    }

    template() {
      return "tpl-shared-text";
    }

    init(context, renderCallback) {
      if (window.lastSharedStripe && window.lastSharedStripe.key === context.request.key) {
        context.data = window.lastSharedStripe;
        window.lastSharedStripe = {};
        renderCallback(context);
      } else {
        let data = [];
        let p = null;
        data.push("key=" + encodeURIComponent(context.request.key));
        if (context.request.password) {
          p = window.ofsKey === context.request.key ? window.ofsPassword : prompt("Password required");
          data.push("password=" + encodeURIComponent(window.CryptoJS.SHA256("ZEBRA-CLIENT:" + p).toString()));
        }
        let headers = [];
        if (window.appConfig && window.appConfig['require-api-key'] && !window.appConfig['require-api-key-for-post-only']) {
          headers.push({
            "name": "X-Api-Key",
            "value": helpers.getXAPIKey()
          });
        }
        helpers.ajax("GET", window.apiURL + "/stripe?" + data.join('&'), {}, headers, (response) => {
          context.data = response;
          let validation = null;
          let correct_decryption = false;
          let data;
          let hash;
          do {
            data = context.data.data;
            if (context.data["encrypted-with-client-side-password"]) {
              p = window.ofsKey === response.key ? window.ofsEncryptionPassword : prompt("Decryption password required");
              if (p === null) {
                window.location.hash = "#open";
                return;
              }
              data = context.data.data.split("|");
              validation = [data.shift(), data.shift()];
              data = data.join("|");
            }
            if ((p !== null) && (p.length > 0)) {
              try {
                data = window.CryptoJS.AES.decrypt(data, String(p)).toString(window.CryptoJS.enc.Utf8)
              } catch (e) {
                data = null;
              }
            }
            if (data !== null) {
              if (validation) {
                hash = window.CryptoJS.SHA256(validation[0] + data).toString(window.CryptoJS.enc.Base64);
                if (validation[1] === hash) {
                  correct_decryption = true;
                  context.data.data = data;
                  renderCallback(context);
                } else {
                  window.ofsKey = null;
                }
              } else {
                correct_decryption = true;
                context.data.data = data;
                renderCallback(context);
              }
            } else {
              window.ofsKey = null;
            }
          } while (!correct_decryption);
          window.ofsKey = null;
          window.ofsPassword = null;
          window.ofsEncryptionPassword = null;
        }, helpers.renderErrorCallbackInMain);
      }
    }

    render(context) {
      const copyValue = (e) => {
        const elem = document.getElementById(e.target.getAttribute("for"));
        elem.classList.add("copying");
        let newElement = false;
        let input;
        if (elem.tagName.toUpperCase() === 'INPUT') {
          input = elem;
        } else {
          input = document.createElement('textarea');
          input.value = elem.innerHTML;
          input.style.margin = "-10000px 0 0 0";
          elem.appendChild(input);
          newElement = true;
        }
        if (navigator.userAgent.match(/ipad|iphone/i)){
          const range = document.createRange();
          range.selectNodeContents(input);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          input.setSelectionRange(0, 999999);
        } else {
          input.select();
        }
        document.execCommand("copy");
        input.setSelectionRange(0, 0);
        !newElement || elem.removeChild(input);
        setTimeout(function () {
          elem.classList.remove("copying");
        }, 500);
      };
      const ownerKey = localStorage.getItem("OWNER:" + context.data.key);
      context.$el.querySelector("#shared-text-data").appendChild(document.createTextNode(context.data.data));
      context.$el.querySelector('label[for="shared-text-data"]').addEventListener("click", copyValue, false);
      context.$el.querySelector("#shared-text-key").value = helpers.formatCode(context.data.key);
      context.$el.querySelector('label[for="shared-text-key"]').addEventListener("click", copyValue, false);
      context.$el.querySelector("#shared-text-url").value = window.appConfig.url + "#open/" + context.data.key + (context.data.password ? "/p" : "");
      context.$el.querySelector('label[for="shared-text-url"]').addEventListener("click", copyValue, false);
      context.$el.querySelector("#shared-text-countdown").setAttribute("data-countdown", context.data.expiration);
      if (ownerKey) {
        const $st = context.$el.querySelector('#shared-text-delete');
        $st.querySelector('a').addEventListener("click", (e) => {
          e.preventDefault();
          const countdown = context.$el.querySelector("#shared-text-countdown");
          let data = [];
          data.push("key=" + encodeURIComponent(context.request.key));
          data.push("owner-key=" + encodeURIComponent(ownerKey));
          let headers = [];
          if (window.appConfig && window.appConfig['require-api-key']) {
            headers.push({
              "name": "X-Api-Key",
              "value": helpers.getXAPIKey()
            });
          }
          helpers.ajax("DELETE", window.apiURL + "/stripe?" + data.join('&'), {}, headers, (response) => {
            let data = [];
            data.push("key=" + encodeURIComponent(context.request.key));
            data.push("check-key=" + encodeURIComponent(response["check-key"]));
            helpers.ajax("GET", window.apiURL + "/stripe?" + data.join('&'), {}, headers, (response) => {
              alert("Error! Text was not deleted. Please, try again.");
            }, (response, status) => {
              if (status === 404) {
                countdown.setAttribute("data-countdown", "0");
                while ($st.firstChild) {
                  $st.removeChild($st.firstChild);
                }
                $st.remove();
                alert("Text was successfully deleted");
              } else if (status === 403) {
                alert("Error! Text was not deleted. Please, try again.");
              } else {
                alert("Error! Text probably was deleted, but something went wrong. Try to refresh the page to make sure that text was deleted.");
              }
            });
          });
        }, false);
        $st.style.display = "block";
      }
      const countdownObj = context.$el.querySelector("#shared-text-countdown");
      const countdown = helpers.countdownString(context.data.expiration);
      countdownObj.querySelector('span').innerHTML = countdown.clock;
      if (countdown.status === 'warning' && !countdownObj.classList.contains("warning")) {
        countdownObj.classList.add("warning");
      } else if (countdown.status === 'gone' && !countdownObj.classList.contains("gone")) {
        countdownObj.classList.remove("warning");
        countdownObj.classList.add("gone");
      }
    }
  }
});