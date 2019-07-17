# 【API文件】
> 本文檔內範例皆以Vue做解說

## 安裝
- 下載壓縮包，將其解壓縮後放置在專案目錄下

- 接下來，在含有廣告的組件中引入 `ads.min.css`
```
<style>    
    @import url("[你的檔案路徑]/ads.min.css");

    ...其他的css樣式
</style>
```

- 或是直接在單頁應用的入口文件引入
```
在`main.js`中

import Vue from 'vue'
import App from './App.vue'
import "[你的檔案路徑]/ads.min.css"
```


- 接下來在需要的地方引入 `ads.min.js` 文件。 `ads.min.js` 使用default export，因此你可以自由命名變數的名稱
```
<script>
    import ads from "[你的檔案路徑]/ads.min.js";
    export default {

    }
</script>
```


## 使用方式
#### 定義廣告id
- 首先在需要顯示廣告的位置給予一個 `data-ad="[廣告id]"` 屬性。注意，`[廣告id]`不可重複，重複時只有第一個有效
```
<template>
	<div>
		<div data-id="my-ad-id"></div>
    </div>
</template>
```

#### 關於尺寸
- 廣告適宜顯示尺寸比例為100:57，並且適宜顯示寬度不小於500px，例如
```
[data-ad="my-ad-id"] {
    width: 500px;
    height: 285px;
}
```


#### 初始化
- 再來，你需要利用上面定義好的`[廣告id]`進行初始化動作
```
<template>
	<div>
    	<div data-id="my-ad-id"></div>
    </div>
</template>

<script>
    import ads from "[你的檔案路徑]/ads.min.js";
    export default {
        created(){
            const myAd = ads("my-ad-id");
        }
    }
</script>
```


#### 初始化參數
- `ads` 接受兩個參數：`[廣告id(必須)]`及`[廣告類型(可選)]`
```
const myAd = ads("my-ad-id", "BANNER");
```

- 可使用的廣告類型
    - "BANNER"
    - "VIDEO"



#### 事件監聽器
- `ads` 提供三個事件供監聽

| key                | 說明                          |
|--------------------|-------------------------------|
| "on-ad-loaded"     | 廣告載入成功                   |
| "on-ad-failed"     | 廣告載入失敗                   |
| "on-ad-impression" | 廣告出現在畫面上超過 50%至少一秒 |

- 使用 `.listen()` 註冊監聽函數。`.listen()` 可接受一個物件作為參數。例如
```
myAd.listen({
    `on-ad-loaded`: () => {
        console.log("廣告載入成功");
    },

    `on-ad-failed`: (err) => {
        console.log("廣告載入失敗。失敗原因：" + err);
    },

    `on-ad-impression`: () => {
        console.log("廣告載入過半超過一秒");
    }
});
```


#### 獲取廣告內容
- 使用 `.load()` 在你準備好後開始獲取廣告內容並顯示到DOM上。注意使用 `.load()` 時DOM必須為可取用狀態
```
myAd.load();
```


## 完整範例
```
<template>
	<div>
    	<div data-id="my-ad-id"></div>
    </div>
</template>

<script>
    import ads from "[你的檔案路徑]/ads.min.js";
    export default {
        data(){
            return {
                myAd: null
            }
        },

        created(){
            const myAd = ads("my-ad-id", "BANNER");
            myAd.listen({
                `on-ad-loaded`: () => {
                    console.log("廣告載入成功");
                },

                `on-ad-failed`: (err) => {
                    console.log("廣告載入失敗。失敗原因：" + err);
                },

                `on-ad-impression`: () => {
                    console.log("廣告載入過半");
                },
            });

            this.myAd = myAd;
        },

        mounted(){
            this.myAd.load();
        }
    }
</script>
```



## 串接函數
- `ads()`及`.listen()`會回傳相同實例，因此，你也可以直接把它們串在一起使用
```
<template>
	<div>
    	<div data-id="my-ad-id"></div>
    </div>
</template>

<script>
    import ads from "[你的檔案路徑]/ads.min.js";
    export default {
        mounted(){
            ads("my-ad-id", "BANNER")
            .listen({
                `on-ad-loaded`: () => {
                    console.log("廣告載入成功");
                },

                `on-ad-failed`: (err) => {
                    console.log("廣告載入失敗。失敗原因：" + err);
                },

                `on-ad-impression`: () => {
                    console.log("廣告載入過半");
                },
            })
            .load();
        }
    }
</script>
```


## API參考
### ads()

Returns new Ad Object

| 參數          | 類型   | 說明                                         |
|---------------|--------|---------------------------------------------|
| 廣告id(必選)   | String | HTML屬性data-id的值，用來指定插入廣告的位置    |
| 廣告類型(可選) | String | 指定要插入的廣告類型。可選擇"BANNER"或是"VIDEO" |


### .listen()

Returns Ad Object

| 參數       | 類型   | 說明                                                                              |
|-----------|--------|-----------------------------------------------------------------------------------|
| 事件監聽器 | Object | 可自定義生命週期函數。支援的事件有`on-ad-loaded`, `on-ad-failed`, `on-ad-impression` |

| key                | 說明                          |
|--------------------|-------------------------------|
| "on-ad-loaded"     | 廣告載入成功                   |
| "on-ad-failed"     | 廣告載入失敗                   |
| "on-ad-impression" | 廣告出現在畫面上超過 50%至少一秒 |


### .load()

No return value

| 參數 | 類型 | 說明 |
|------|-----|------|
| 無   | -   | -    |



# 【上線計畫書】
## 我們要還需要經過哪些測試，才可以正式上線?
1. 同源政策下的可開放網域測試

    現階段server的Access-Control-Allow-Origin為"*"，且沒有設定Access-Control-Allow-Header
    產品若需正式上線，不應開放無限制的存取，應該要提供開發者註冊並申請一個合法的身分驗證，驗證通過	才可存取廣告資源
    這部分的身分驗證還需要繼續開發及測試

2. 主流SPA框架下是否都可以正常運行

    目前只有使用Vue測試，若要正式上線React和Angular也必須納入

3. 先釋出測試版請開發者試用

    若有可能也可以先開放測試版本，或是直接請認識的有在合作的開發者使用看看是否沒問題


## 有什麼方式可以搜集在使用者瀏覽器上遇到的錯誤?
### 關於收集錯誤

收集可以在兩個地方進行

1. 每次需要調用on-ad-failed前先呼叫一個回報錯誤函數
2. 定義一個中介層類別繼承自Ad類別，該中介層類別有和Ad類別一樣的API及回傳值，只不過會包裹在一個try catch裡面。例如
```
listen(){
    try{
    	return this.__proto__.__proto__.listen.call(this, ...arguments);
    } catch(e){this._report(e)};
}
```

### 關於回報錯誤

可以利用圖片的src，在後端開放一個專用的回報端口，把錯誤代號夾帶進網址傳送。例如
```
_report(e){
    const reportUrl = "http://report.com/error/";
    const reporter = document.createElement("img");
    reporter.src = reportUrl + e;
}
```