// ==UserScript==
// @name         Block button in dropdown
// @version      2024-10-19
// @description  because going to the profile takes too long.
// @author       Tanza3D
// @updateUrl    https://raw.githubusercontent.com/Tanza3D/bluesky-quick-block/refs/heads/main/blockbutton.user.js
// @match        https://bsky.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bsky.app
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const TL = {
        en: "Are you sure you want to block {handle} ({did})? You will have to refresh the page to reflect this change.",
        // Machine-translated; please verify
        ca: "Estàs cert que vols bloquejar {handle} ({did})? Haureu d'actualitzar la pàgina per reflectir aquest canvi.",
        // official translation uses du/deine
        // Machine-translated; please verify
        de: "Bist du sicher, dass du {handle} ({did}) blockieren willst? Du musst die Seite aktualisieren, um diese Änderung zu berücksichtigen.",
        // official translation uses tuteo
        es: "¿Estás cierto de que quieres bloquear a {handle} ({did})? Tendrás que actualizar la página para reflejar este cambio.",
        // Machine-translated; please verify
        fi: "Halautko varmasti estää {handle} ({did})? Sinun on päivitettävä sivu, jotta tämä muutos näkyy.",
        // official translation uses vouvoyer
        // Machine-translated; please verify
        fr: "Êtes-vous sûr de vouloir bloquer {handle} ({did})\u202F? Vous devrez actualiser la page pour refléter ce changement.",
        // I know nothing about Irish Gaelic
        // Machine-translated; please verify
        ga: "An bhfuil tú cinnte gur mhaith leat {handle} ({did}) a bhlocáil? Beidh ort an leathanach a athnuachan chun an t-athrú seo a léiriú.",
        // Machine-translated; please verify
        hi: "क्या आप वाकई {handle} ({did}) को ब्लॉक करना चाहते हैं? इस परिवर्तन को दर्शाने के लिए आपको पृष्ठ को ताज़ा करना होगा।",
        // Machine-translated; please verify
        id: "Apakah Anda yakin ingin memblokir {handle} ({did})? Anda perlu menyegarkan halaman untuk mencerminkan perubahan ini.",
        // Machine-translated; please verify
        it: "Sei sicuro di voler bloccare {handle} ({did})? Sarà necessario aggiornare la pagina per riflettere questa modifica.",
        ja: "本当に{handle}（{did}）をブロックしますか？ 反映させるにはページを再読み込みする必要があります。",
        // Machine-translated; please verify
        ko: "정말 {handle} ({did})을 차단하시겠습니까? 반영하려면 페이지를 다시 로드해야 합니다.",
        // Machine-translated; please verify
        'pt-BR': "Tem certeza de deseja bloquear {handle} ({did})? Você precisará atualizar a página para refletir esta alteração.",
        // Machine-translated; please verify
        ru: "Вы уверены, что хотите заблокировать {handle} ({did})? Вам нужно будет обновить страницу, чтобы отразить это изменение.",
        // Machine-translated; please verify
        tr: "{handle} ({did})'ı engellemek istediğinizden emin misiniz? Bu değişikliğin yansıtılması için sayfayı yenilemeniz gerekecektir.",
        // Machine-translated; please verify
        uk: "Ви впевнені, що бажаєте заблокувати {handle} ({did})? Вам потрібно буде оновити сторінку, щоб відобразити цю зміну.",
        // Machine-translated; please verify
        "zh-CN": "您确定要阻止 {handle} ({did}) 吗？您将需要刷新页面以反映此更改。",
        // Machine-translated; please verify
        "zh-TW": "您確定要封鎖 {handle} ({did}) 嗎？您將需要刷新頁面以反映此更改。",
        // Machine-translated; please verify
        "zh-HK": "你確定要阻止{handle}（{did}）嗎？ 您需要重新加載頁面才能使其生效。",
    }

    (function() {
        'use strict';

        function addButtonToDropdown(menu) {
            if (!menu.classList.contains('new-dropdown-button')) {
                menu.classList.add("new-dropdown-button");
                menu.addEventListener('click', () => {
                    var account = JSON.parse(localStorage.getItem('BSKY_STORAGE')).session.currentAccount;
                    setTimeout(() => {
                        var list = document.querySelector('[role="menu"][data-state="open"]').querySelector(".css-175oi2r");
                        var buttonToClone = list.querySelector('[data-testid="postDropdownMuteWordsBtn"');
                        var button = buttonToClone.cloneNode(true)
                        list.appendChild(button);
                        button.querySelector(".css-146c3p1").innerText = "Block User";
                        list.insertBefore(button, buttonToClone);

                        var postItem = menu.closest('[data-testid^="feedItem-by-"]');
                        if(postItem == null) postItem = menu.closest('[data-testid^="postThreadItem-by-"]');

                        console.log(postItem);

                        var handle = "";

                        var tmp = postItem.querySelectorAll('a');
                        console.log(tmp);
                        for(var i of tmp) {
                            if(i.querySelector("span") == null) continue;
                            console.log(i.querySelector("span").innerText)
                            if(i.querySelector("span").innerText.trim().startsWith("@") && i.href.includes("/profile")) handle = i.querySelector("span").innerText.trim();
                        }

                        var pfp = postItem.querySelector('[data-testid="userAvatarImage"]').querySelector("img").src;
                        var did = pfp.split("/");
                        for(var v of did) {
                            if(v.startsWith("did:")) {
                                did = v.split("@")[0];
                            }
                        }

                        button.style.background = "#ff000022";

                        button.addEventListener("click", async () => {
                            let locale = TL.hasOwnProperty(document.getElementsByTagName("HTML")[0].lang) ? document.getElementsByTagName("HTML")[0].lang : "en";
                            if (window.confirm(TL[locale].replace("{handle}", handle).replace("{did}", did)) {
                                await fetch(account.pdsUrl+"xrpc/com.atproto.repo.createRecord", {
                                    method: "POST",
                                    headers: {
                                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0",
                                        "Accept": "*/*",
                                        "Content-Type": "application/json",
                                        "Authorization": "Bearer " + account.accessJwt,
                                        "Origin": "https://bsky.app",
                                    },
                                    body: JSON.stringify({
                                        collection: "app.bsky.graph.block",
                                        repo: account.did,
                                        record: {
                                            subject: did,
                                            createdAt: new Date().toISOString(),
                                            $type: "app.bsky.graph.block"
                                        }
                                    })
                                });
                            }
                        });
                    }, 30)
                });


            }
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const dropdowns = document.querySelectorAll('[data-testid="postDropdownBtn"]');
                for (var dropdown of dropdowns) {
                    addButtonToDropdown(dropdown);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    })();

})();
