
angular.module('OA.controllers.leave', [])
    .controller('leaveViewCtrl', ['$scope', '$http', '$cookies', '$window','$location','leaveService','$modal','$filter',function ($scope, $http, $cookies,$window,$location,leaveService,$modal,$filter) {

        $scope.navTab = 0;
        leaveService.getLeaveInfo().then(function(data){
            $scope.leaveTypesBase = data.leaveType;
            $scope.daysSum = data.daysSum;
            $scope.myLeaveOrder = data.myLeaveOrder;
            $scope.allLeave = data.allLeave;
            $scope.orderForMe = data.orderForMe;
            //$scope.userinfo =  {
            //    "username":$cookies.username,
            //    "display_name":$cookies.display_name,
            //    "email":$cookies.email,
            //    "isLeader":data.isLeader
            //};
        });
        $scope.translate = function (src) {
            if(src=="AM"){return "上午";}
            if(src=="PM"){return "下午";}
        }
        $scope.orderRm = function (orderId) { //删除申请按钮
            r=confirm("确定要删除此条记录吗?");
            if(r){
                leaveService.rm(orderId).then(function(data){
                    if(data.status==0){
                        location.reload();
                    }else if (data.status==10004){
                        alert("申请已经审批通过，无法删除");
                        location.reload();
                    }
                });
            }
        }
        $scope.orderInfo = function (size,type,orderInfo) { //查看详情按钮
            leaveService.getOrderInfo(orderInfo.id).then(function(data){
                var resolveData = {
                    "type": type,
                    "orderInfo": orderInfo,
                    "translate": $scope.translate,
                    "orderTypes": data.orderTypes,
                    "leaderName": data.leaderName,
                }
                var modalInstance = $modal.open({
                    templateUrl: 'partials/leave/orderInfoLayer.html',
                    controller: $scope.orderInfoModal,
                    size: size,
                    resolve: {
                        "resolveData": function() {
                            return resolveData;
                        },
                    }
                });
            });
        };
        $scope.orderInfoModal = function($scope,$modalInstance,resolveData) {
            $scope.orderInfoType = resolveData.type;
            $scope.orderInfo = resolveData.orderInfo;
            $scope.orderTypes = resolveData.orderTypes;
            $scope.translate = resolveData.translate;
            $scope.leaderName = resolveData.leaderName;
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.agree = function (orderId,leaderNote) {
                r=confirm("确定通过此条申请吗?")
                if(r){
                    leaveService.orderChange('agree',orderId,leaderNote).then(function(data){
                        location.reload();
                    });
                }
            };
            $scope.reject = function (orderId,leaderNote) {
                r=confirm("确定驳回此条申请吗?")
                if(r){
                    leaveService.orderChange('reject',orderId,leaderNote).then(function(data){
                        location.reload();
                    });
                }
            };
        }
        $scope.createLeaveBtn = function(size) { //休假申请按钮
            var modalInstance = $modal.open({
                templateUrl: 'partials/leave/createLayer.html',
                controller: $scope.createLeaveModal,
                size: size,
                resolve: {
                    "leaveType": function () {
                        return $scope.daysSum.daysAva;
                    }
                }
            });
        };
        $scope.createLeaveModal = function($scope,$modalInstance,leaveType) {
            $scope.leaveType = leaveType;
            $scope.errFlag = { //错误标记
                "item": false,
                "errMsg": "",
            };
            $scope.order = { //申请表数据初始化
                "begin": getToday(),
                "beginHalf": "AM",
                "end": getToday(),
                "endHalf": "PM",
                "days": 1,
                "typeList": [
                    { "id": 0,"type_id": 1,"days": 1},
                ],
                "note":""
            };
            function errALert(rep,flag,errMsg){ //错误提示框
                if(rep){
                    $scope.errFlag.errMsg = errMsg;
                    $scope.errFlag.item = flag;
                }else{
                    $scope.errFlag.item = false;
                }
                return $scope.errFlag.item;
            }
            $scope.dateDaysSum = function () { //日期选择天数和
                dateDaysSum = ($scope.order.end-$scope.order.begin)/(24*3600*1000)+1;
                if($scope.order.beginHalf=="PM"){
                    dateDaysSum = dateDaysSum - 0.5;
                };
                if($scope.order.endHalf=="AM"){
                    dateDaysSum = dateDaysSum - 0.5;
                };
                return dateDaysSum;
            };
            $scope.beginChange = function() { //开始日期改变状态监控
                if(errALert(isNull($scope.order.begin),'begin','开始日期不能为空')){return false;}
                $scope.order.days = $scope.dateDaysSum() ;
                return true;
            }
            $scope.endChange = function() { //结束日期改变状态监控
                if(errALert(isNull($scope.order.end),'end','结束日期不能为空')){return false;}
                $scope.order.days = $scope.dateDaysSum() ;
                return true;
            };
            $scope.halfCheck = function (a,b) { //上午下午选择
                a == "begin" ? $scope.order.beginHalf = b : $scope.order.endHalf = b;
                $scope.order.days = $scope.dateDaysSum();
            };
            $scope.typeDaysSum = function() { //各类型天数和
                var totalDays = 0
                $.each($scope.order.typeList,function(n,value) {
                    totalDays = totalDays + value.days;
                });
                return totalDays;
            };
            $scope.typeListAdd = function () { //添加类型
                var surDays = $scope.order.days - $scope.typeDaysSum();
                if(errALert($scope.order.typeList.length>=$scope.leaveType.length,'other','没有更多类型了')){return false;}
                if(errALert(surDays<=0,'other','剩余天数不足')){return false;}
                var typeTmp = {
                    "id": "",
                    "type_id": "",
                    "days": 1
                };
                var id = $scope.order.typeList.push(typeTmp) - 1;
                $scope.order.typeList[id].id = id;
                $scope.order.typeList[id].type_id = id + 1;
            };
            $scope.typeListRm = function (id) { //删除类型
                for(i=0,length=$scope.order.typeList.length;i<length;i++){
                    if($scope.order.typeList[i].id == id){
                        var arryId = i;
                    };
                }
                $scope.order.typeList.splice(arryId,1);
            };
            $scope.typeDaysChange = function (typeId,days) { //天数选择改变监控
                var re = new RegExp(RegTool.ftTwoDecimal);
                if(errALert(isNull(typeId)||isNull(days),'typeList','天数不能为空')){return false;}
                if(errALert(!re.test(days),'typeList','必须是数字')){return false;}
                for(i in $scope.leaveType){
                    if($scope.leaveType[i].id == typeId){ 
                        var typeMaxDays=$scope.leaveType[i].days;
                        var typeName = $scope.leaveType[i].name;
                    }
                }
                if(errALert(days>typeMaxDays,'typeList','您现在最多可申请'+typeName+'的最大天数为: '+typeMaxDays)){return false;}
                if(errALert($scope.typeDaysSum()>$scope.dateDaysSum(),'typeList','不能超过日期选择天数')){return false;}
                return true;
            };
            $scope.noteChange = function() { //理由框输入监控
                if(errALert(isNull($scope.order.note),'note','理由不能为空')){return false;}
                return true;
            };
            $scope.datepcker = function($scope) { //时间选择控件
                $scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.opened = true;
                };
                $scope.dateOptions = {
                    formatYear: 'yyyy',
                    startingDay: 1
                };
                $scope.minDate = new Date();
                $scope.dateFormat = 'yyyy-MM-dd';
            };
            $scope.ok = function () { // 提交按钮
                if(!$scope.beginChange()){return false;}
                if(!$scope.endChange()){return false;}
                if(!$scope.noteChange()){return false;}
                if(errALert(!arrayRepeat($scope.order.typeList,'type_id'),'typeList','类型不能重复')){return false;}
                for(i=0,l=$scope.order.typeList.length;i<l;i++){
                    if(!$scope.typeDaysChange($scope.order.typeList[i]['type_id'],$scope.order.typeList[i]['days'])){
                        return false;
                    };
                }
                if(errALert($scope.typeDaysSum()!=$scope.dateDaysSum(),'typeList','类型天数与日期选择天数不符')){return false;}
                saveData = $scope.order
                saveData.begin = timeToStr(saveData.begin);
                saveData.end = timeToStr(saveData.end);
                leaveService.save(saveData).then(function(data){
                    location.reload();
                });
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
    }])

    .controller('leaveAllViewCtrl', ['$scope', '$http', '$cookies', '$window','$location','leaveService','$modal','$filter',function ($scope, $http, $cookies,$window,$location,leaveService,$modal,$filter) {
        now = new Date();
        thisYear = now.getFullYear();
        $scope.thisYear = thisYear;
        $scope.yearOps = [thisYear-4,thisYear-3,thisYear-2,thisYear-1,thisYear];
        $scope.thisStatus = '';
        $scope.statusOps = [ 
            {"id":'',"name":"全部"},
            {"id":{'status':0},"name":"未审核"},
            {"id":{'status':1},"name":"通过"},
            {"id":{'status':2},"name":"驳回"},
        ];
        $scope.statusFt = {'status':1};
        leaveService.getLeaveAll(thisYear).then(function(data){
            $scope.leaves = data.myLeaveOrder;
        });
        $scope.translate = function (src) {
            if(src=="AM"){return "上午";}
            if(src=="PM"){return "下午";}
        };
        $scope.yearChange = function() {
            leaveService.getLeaveAll($scope.thisYear).then(function(data){
                $scope.leaves = data.myLeaveOrder;
            });
        };
        $scope.orderInfo = function (size,type,orderInfo) { //查看详情按钮
            leaveService.getOrderInfo(orderInfo.id).then(function(data){
                var resolveData = {
                    "type": type,
                    "orderInfo": orderInfo,
                    "translate": $scope.translate,
                    "orderTypes": data.orderTypes,
                    "leaderName": data.leaderName,
                }
                var modalInstance = $modal.open({
                    templateUrl: 'partials/leave/orderInfoLayer.html',
                    controller: $scope.orderInfoModal,
                    size: size,
                    resolve: {
                        "resolveData": function() {
                            return resolveData;
                        },
                    }
                });
            });
        };
        $scope.orderInfoModal = function($scope,$modalInstance,resolveData) {
            $scope.orderInfoType = resolveData.type;
            $scope.orderInfo = resolveData.orderInfo;
            $scope.orderTypes = resolveData.orderTypes;
            $scope.translate = resolveData.translate;
            $scope.leaderName = resolveData.leaderName;
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.agree = function (orderId,leaderNote) {
                r=confirm("确定通过此条申请吗?")
                if(r){
                    leaveService.orderChange('agree',orderId,leaderNote).then(function(data){
                        location.reload();
                    });
                }
            };
            $scope.reject = function (orderId,leaderNote) {
                r=confirm("确定驳回此条申请吗?")
                if(r){
                    leaveService.orderChange('reject',orderId,leaderNote).then(function(data){
                        location.reload();
                    });
                }
            };
        }
    }])
