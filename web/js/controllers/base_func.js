
var RegTool = {
    specialChar: /[`~!@#！￥\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/,//特殊字符
    intReg: /^[1-9]\d*$/, //正整数
    ftTwoDecimal: /^[1-9]\d*\.\d{1,2}$|^[0]\.[1-9][0]{0,1}$|^[0]\.[0-9][1-9]$|^[1-9]\d*$/,//两位小数的正浮点数,正整数、1位或2位小数
    telReg: /^[0-9]{7,18}$/, //电话号码
    mobileReg: /^0?(13|14|15|18)[0-9]{9}$/, //手机号码
    emailReg: /\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/, //电子邮箱
    qqReg: /^[1-9]*[1-9][0-9]*$/,   //qq号码
    ipReg: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]|\*)$/,  //IP地址
    lastCommaReg: /\,$/, //最后以为以逗号结束
    urlReg: /http+:\/\/[^\s]+/ //验证网址
};

var isIE = /msie/.test(navigator.userAgent.toLowerCase());

//在数组中获取指定值的元素索引，第一个匹配值
Array.prototype.getIndexByValue = function (value) {
    var index = -1;
    for (var i = 0; i < this.length; i++) {
        if (this[i] == value) {
            index = i;
            break;
        }
    }
    return index;
};

/*
 * 删除数组中指定值，不支持元素为对象的删除
 */
Array.prototype.removeByValue = function (value) {
    var len = this.length;
    for (var i = 0, n = 0; i < len; i++) {//把出了要删除的元素赋值给新数组
        if (this[i] != value) {
            this[n++] = this[i];
        }
    }
    this.length = n;
};

/*
 * 删除数组中指定索引的元素
 */
Array.prototype.removeByIndex = function (index) {
    if (isNaN(index) || index > this.length) {
        return false;
    }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[index]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1;
};

/*
 * 判断数组是否有重复元素,true不重复，false代表有重复
 */
function arrayRepeat(currentArray,item) {
    var repeatArray = currentArray.sort(),
        len = repeatArray.length;

    for (var i = 0; i < len; i++) {
        for (var k = i + 1; k < len; k++) {
            if (item == ''||item == null){
                if (currentArray[i] == repeatArray[k]) {
                    return false;
                }
            }else{
                if (currentArray[i][item] == repeatArray[k][item]) {
                    return false;
                }
            }
        }
    }
    return true;
}


function errorHandle(data) {
    var errCode = data.status, errMsg = "";
    switch (errCode) {
        case "1":
            errMsg = "cookie过期";
            $.cookie("token","");
            location.href = "/index.html#/login";//调转登录页
            break;
        case "11"://delete db
            errMsg = "删除数据库ID为空";
            alert(errMsg);
            break;
    }
}

function removeEditable(e){
    var target = angular.element(e.target) || e; //如果e.target=''则是当前元素

    if(target.is("a.name.editable") || target.is("a.rename")){
        return;
    }
    angular.element(".slide-content").find("li.slide-li").find(".name").attr("contenteditable",false).removeClass("editable");
}

function isNull(str){ //字符串为空检查,false为非空,true为空
    if (str==""||str==null){
        return true;
    }else{
        return false;
    }
}

function getToday() {
    var Year = new Date().getFullYear(),
        Month = new Date().getMonth(),
        Day = new Date().getDate();
    return new Date(Year,Month,Day);
}

function timeToStr(time) {
    var Year = time.getFullYear(),
        Month = time.getMonth() + 1,
        Day = time.getDate();
    return Year+'-'+Month+'-'+Day;
}

