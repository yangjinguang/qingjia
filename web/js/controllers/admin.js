
angular.module('OA.controllers.admin', [])
.controller('adminUserCtrl', ['$scope', '$http', '$cookies', '$timeout','$window','$location','$modal','$filter','adminService',function ($scope, $http, $cookies,$timeout,$window,$location,$modal,$filter,adminService) {
    $scope.adminNavTab = 0;
    $scope.dpId = $cookies.department;
    $scope.dpDropOpen = false;
    adminService.getUsers($scope.dpId).then(function(data){
        $scope.users = data.users;
        $scope.departments = data.departments;
        $scope.departmentsDic = {}
        for (i=0;i<$scope.departments.length;i++){
            $scope.departmentsDic[$scope.departments[i].id] = $scope.departments[i].name;
        }
        $scope.departmentsDic[0] = '全部';
        $scope.thisDpId = $scope.dpId;
        $scope.showWell = data.users[0];
    });
    $scope.dpChange = function(dpId) {
        adminService.getUsers(dpId).then(function(data){
            $scope.thisDpId = dpId;
            $scope.users = data.users;
        });
        $scope.dpDropOpen = false;
    };
    $scope.selectBlock = function (userId) {
        for (var i=0;i<$scope.users.length;i++) {
            if($scope.users[i].user_id==userId){
                var index = i;
            }
        }
        $scope.users[index].userSelect = $scope.users[index].userSelect == 1 ? 0:1;
    };
    $scope.selectAll = function(x) {
        for (var i=0;i<$scope.users.length;i++) {
            $scope.users[i].userSelect = x;
            $scope.selectAllSt = x
        }
    }
    $scope.userClick = function (userId) {
        if($scope.showWell.user_id == userId) {return false;}
        if($scope.userEdit){alert("请先保存后在切换用户");return false;}
        adminService.userStat(userId).then(function(data){
            $scope.daysSum = data.daysSum;
            for (var i=0;i<$scope.users.length;i++) {
                if($scope.users[i].user_id==userId){
                    var index = i;
                }
            }
            $scope.showWell = $scope.users[index];
        });
    };
    $scope.userChange = function() {
        $scope.userEdit = true;
        $scope.sexOps = [
            {"id":0,"name":"男"},
            {"id":1,"name":"女"}
        ];
        $scope.userProfile = $scope.showWell;
    }
    $scope.datepckerEntrytime = function($scope) { //入职时间时间选择控件
        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            startingDay: 1
        };
        $scope.minDate = '2013-01-01';
        $scope.maxDate = new Date();
        $scope.dateFormat = 'yyyy-MM-dd';
    };
    $scope.userSave = function() {
        if($scope.userProfile.entry_time.length==0){
            alert("入职时间不能为空");
            return false;
        }else{
            $scope.userProfile.entry_time = $filter('date')($scope.userProfile.entry_time, 'yyyy-MM-dd');
        };
        if($scope.userProfile.position.length==0){
            alert("职位不能为空");
            return false;
        };
        if($scope.userProfile.phone.length==0){
            alert("手机号不能为空");
            return false;
        };
        adminService.saveProfile($scope.userProfile).then(function(data){
           // location.reload()
            $scope.showWell = $scope.userProfile;
            adminService.getUsers($scope.thisDpId).then(function(data){
                $scope.users = data.users;
            });
            $scope.userEdit = false;
        });
    }
    $scope.addTx = function(size) {
        selectUsers = [];
        for (i in $scope.users) {
            data = $scope.users[i]
            if (data.userSelect) {
                selectUsers.push({"id":data.user_id,"display_name":data.display_name});
            };
        }
        if (selectUsers.length <= 0) {
            alert("请先选择用户");
            return false;
        }
        var modalInstance = $modal.open({
            templateUrl: 'partials/admin/addtx.html',
            controller: $scope.addTxModal,
            size: size,
            resolve: {
                "selectUsers": function () {
                    return selectUsers;
                }
            }
        });
        
    };
    $scope.addTxModal = function($scope,$modalInstance,selectUsers) {
        $scope.selectUsers = selectUsers;
        $scope.data = {
            "txDays":1,
            "selectUsers":$scope.selectUsers
        };
        $scope.errFlag = { //错误标记
            "item": false,
            "errMsg": "",
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
        $scope.txDaysCheck = function() {
            if(errALert($scope.data.txDays==null,'txDays','必须是数字')){return false;}
            if(errALert($scope.data.txDays<=0,'txDays','最小为1天')){return false;}
            return true;
        }
        $scope.ok = function() {
            if($scope.errFlag.item){return false;}
            adminService.addTx($scope.data).then(function(data){
                alert("添加成功");
                location.reload();
            })
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };
}])
.controller('adminLeaveCtrl', ['$scope', '$http', '$cookies', '$timeout','$window','$location','adminService',function ($scope, $http, $cookies,$timeout,$window,$location,adminService) {
    $scope.adminNavTab = 1;
    adminService.leaveStat().then(function(data){
        $scope.leaveStat = data.leaveStat;
        $scope.types = data.types;
    });
}])
