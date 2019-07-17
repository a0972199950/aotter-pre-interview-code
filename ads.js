export default (id, type) => {
    class Ad {
        constructor(id, type) {
            this.id = id;
            this.type = type;
            this.timerId = null;
            this.calledImpressionApi = false;
        }

        // 外部Api: 註冊自定義lifecycle函數
        listen(customFuncs){
            if(customFuncs["on-ad-loaded"]){
                this.onAdLoaded = customFuncs["on-ad-loaded"];
            };

            if(customFuncs["on-ad-failed"]){
                this.onAdFailed = customFuncs["on-ad-failed"];
            };

            if(customFuncs["on-ad-impression"]){
                this.onAdImpression = customFuncs["on-ad-impression"];
            };

            return this;
        }

        // 外部Api: 開始載入廣告
        load(){
            const origin = this;            
            const request = new XMLHttpRequest();
            
            request.addEventListener("load", function () {
                const ad = JSON.parse(this.response);

                // 請求成功且有拿到廣告資訊
                if(
                    Math.floor(this.status / 100) === 2 && // http request成功
                    ad.success // 有拿到廣告資訊
                ){
                    // 插入廣告內容到DOM，成功回傳true，失敗回傳false
                    const insertSuccess = origin._insertAd(ad);                    

                    if(insertSuccess){
                        origin.impressionUrl = ad.impression_url; // 儲存廣告顯示過半後的呼叫端點
                        origin._listenScroll(); // 開始監聽廣告是否顯示超過一半
                        origin.onAdLoaded ? (origin.onAdLoaded()) : false; // 呼叫自定義事件on-ad-loaded
                    } else {
                        const error = {
                            code: 101,
                            msg: "Failed to insert ad to DOM. Did you resgist 'data-ad' correctly?"
                        };
                        origin._report(error.code);
                        origin.onAdFailed ? (origin.onAdFailed(error.msg)) : false; // 呼叫自定義事件on-ad-failed
                    }
                    

                // 請求成功但沒有廣告資訊
                } else if(
                    Math.floor(this.status / 100) === 2 && // http request成功
                    !ad.success // 沒有拿到廣告資訊
                ) {
                    const error = {
                        code: 102,
                        msg: "No ad exists now"
                    };
                    origin._report(error.code);
                    origin.onAdFailed ? (origin.onAdFailed(error.msg)) : false; // 呼叫自定義事件on-ad-failed

                // 請求失敗
                } else {
                    const error = {
                        code: 103,
                        msg: `Server returned: ${this.status}`
                    };
                    origin._report(error.code);
                    origin.onAdFailed ? (origin.onAdFailed(error.msg)) : false; // 呼叫自定義事件on-ad-failed
                }
                
            });

            
            request.addEventListener("error", function () {
                const error = {
                    code: 104,
                    msg: `Request failed or blocked`
                };
                origin._report(error.code);
                origin.onAdFailed ? (origin.onAdFailed(error.msg)) : false; // 呼叫自定義事件on-ad-failed
            });


            request.open("GET", "http://localhost:3000/ads" + (this.type ? "?type="+this.type : ""));
            request.send();
        }

        _insertAd(ad){
            const adSpace = document.querySelector(`[data-ad="${this.id}"]`);
            if(!adSpace) return false; // 廣告顯示區塊不存在，抓不到元素

            switch(ad.type){
                case "BANNER":
                    adSpace.innerHTML = this._createBannerHTML(ad);
                    break;

                case "VIDEO":
                    adSpace.innerHTML = this._createVideoHTML(ad);
                    break;
            };

            return true;
        }

        _createBannerHTML(ad){
            return `
            <a href="${ad.url}" target="_blank" class="ad-banner">
                <img class="ad-banner__img" src="${ad.image}">
                <div class="ad-banner__content">
                    <p class="ad-banner__domain">${ad.url.split("//")[1].split("/")[0].toUpperCase()}</p>
                    <h3 class="ad-banner__title">${ad.title}</h3>
                    <div class="ad-banner__icon">i</div>
                </div>
            </a>
            `;
        }

        _createVideoHTML(ad){
            return `
            <div class="ad-video">
                <img class="ad-video__img" src="${ad.image}">

                <h3 class="ad-video__title">${ad.title}</h3>

                <a href="${ad.video_url}" target="_blank">
                    <div class="ad-video__btn">
                        <svg x="0px" y="0px" viewBox="0 0 232.153 232.153" xml:space="preserve" class="ad-video__icon">
                            <path
                            d="M203.791,99.628L49.307,2.294c-4.567-2.719-10.238-2.266-14.521-2.266   c-17.132,0-17.056,13.227-17.056,16.578v198.94c0,2.833-0.075,16.579,17.056,16.579c4.283,0,9.955,0.451,14.521-2.267   l154.483-97.333c12.68-7.545,10.489-16.449,10.489-16.449S216.471,107.172,203.791,99.628z" fill="#FFFFFF" />
                        </svg>
                    </div>
                </a>

                <div class="ad-video__social">
                    <div>
                        <svg x="0px" y="0px" viewBox="0 0 511.999 511.999" xml:space="preserve">
                            <path
                                d="M83.578,167.256H16.716C7.524,167.256,0,174.742,0,183.971v300.881c0,9.225,7.491,16.713,16.716,16.713h66.862    c9.225,0,16.716-7.489,16.716-16.713V183.971C100.294,174.742,92.769,167.256,83.578,167.256z"
                                data-original="#ffffff" data-old_color="#ffffff" fill="#ffffff" />
                            <path
                                d="M470.266,167.256c-2.692-0.456-128.739,0-128.739,0l17.606-48.032c12.148-33.174,4.283-83.827-29.424-101.835    c-10.975-5.864-26.309-8.809-38.672-5.697c-7.09,1.784-13.321,6.478-17.035,12.767c-4.271,7.233-3.83,15.676-5.351,23.696    c-3.857,20.342-13.469,39.683-28.354,54.2c-25.952,25.311-106.571,98.331-106.571,98.331v267.45h278.593    c37.592,0.022,62.228-41.958,43.687-74.749c22.101-14.155,29.66-43.97,16.716-66.862c22.102-14.155,29.66-43.97,16.716-66.862    C527.572,235.24,514.823,174.792,470.266,167.256z"
                                data-original="#ffffff" data-old_color="#ffffff" fill="#ffffff" />
                        </svg>
                        195
                    </div>

                    <div>
                        <svg x="0px" y="0px" viewBox="0 0 60 60" style="enable-background:new 0 0 60 60;" xml:space="preserve">
                            <path
                                d="M6,2h48c3.252,0,6,2.748,6,6v33c0,3.252-2.748,6-6,6H25.442L15.74,57.673C15.546,57.885,15.276,58,15,58  c-0.121,0-0.243-0.022-0.361-0.067C14.254,57.784,14,57.413,14,57V47H6c-3.252,0-6-2.748-6-6L0,8C0,4.748,2.748,2,6,2z"
                                data-original="#000000" data-old_color="#000000" fill="#FFFFFF" />
                        </svg>
                        14
                    </div>
                </div>
            </div>
            `;
        }

        _listenScroll(){
            const origin = this;
            const adSpace = document.querySelector(`[data-ad="${this.id}"]`);
            const getElementTop = (element) => {
                let actualTop = element.offsetTop
                let current = element.offsetParent
                while (current !== null) {
                    let parentTopBorderWidth = document.defaultView.getComputedStyle(current, null).borderTopWidth
                    actualTop += current.offsetTop
                    if (parentTopBorderWidth) {
                        actualTop += parseFloat(parentTopBorderWidth)
                    }
            
                    current = current.offsetParent
                }
                return actualTop;
            };


            const calculateShowedProportion = () => {
                // 顯示過半Api只呼叫一次
                if(origin.calledImpressionApi){
                    window.removeEventListener("scroll", calculateShowedProportion);
                    return;
                };

                const windowTopHeight = window.pageYOffset;
                const windowBottomHeight = window.pageYOffset + window.innerHeight;
                const adSpaceMiddleHeight = getElementTop(adSpace) + adSpace.clientTop + (adSpace.clientHeight/2);


                if(windowBottomHeight > adSpaceMiddleHeight && windowTopHeight < adSpaceMiddleHeight){
                    origin._setTimer();
                } else {
                    origin._clearTimer();
                }
            };
            
            calculateShowedProportion(); // 初期呼叫第一次計算廣告顯示百分比
            window.addEventListener("scroll", calculateShowedProportion); // 當視窗滾動就呼叫計算廣告顯示百分比
        }

        _setTimer(){
            if(this.timerStarting) return;            

            const origin = this;
            this.timerId = setTimeout(() => {
                origin._adShowed();
            }, 1000);

            this.timerStarting = true;
        }

        _clearTimer(){
            if(!this.timerStarting) return;

            clearTimeout(this.timerId);
            this.timerStarting = false;
        }

        _adShowed(){
            this.calledImpressionApi = true; // 成功呼叫過一次廣告顯示過半api

            const request = new XMLHttpRequest();
            request.addEventListener("load", () => {
                this.onAdImpression ? (this.onAdImpression()) : false; // 呼叫自定義事件on-ad-impression
            });

            request.addEventListener("error", () => {
                // impression_url未開放跨域請求，因此這邊即使請求失敗也先執行onAdImpression
                this.onAdImpression ? (this.onAdImpression()) : false; // 呼叫自定義事件on-ad-impression
            });            

            request.open("GET", this.impressionUrl);
            request.send();            
        }
        
    };

    // 用於收集使用者端錯誤的中介層
    // 把 Ad.prototype下的所有方法包在一個try catch中，並在catch裡呼叫報錯函數
    class AdBugReport extends Ad{
        constructor(){
            try{
                super(...arguments);
            } catch(e){this._report(e)};
        }

        listen(){
            try{
                return this.__proto__.__proto__.listen.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        load(){
            try{
                return this.__proto__.__proto__.load.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        _insertAd(){
            try{
                return this.__proto__.__proto__._insertAd.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        _createBannerHTML(){
            try{
                return this.__proto__.__proto__._createBannerHTML.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        _listenScroll(){
            try{
                return this.__proto__.__proto__._listenScroll.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        _setTimer(){
            try{
                return this.__proto__.__proto__._setTimer.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        _clearTimer(){
            try{
                return this.__proto__.__proto__._clearTimer.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        _adShowed(){
            try{
                return this.__proto__.__proto__._adShowed.call(this, ...arguments);
            } catch(e){this._report(e)};
        }

        // 報錯函數
        // reportUrl為後端開放的報錯端口，利用<img>的src夾帶錯誤訊息後傳出
        _report(e){
            const reportUrl = "http://report.com/error/";
            const reporter = document.createElement("img");
            reporter.src = reportUrl + e;
        }
    };

    type = type ? type.toUpperCase() : null;

    // 回傳包含報錯中介層的Ad實例
    return new AdBugReport(id, type);
}



