/* Services */

angular.module('OA.services', ['ngResource'], function ($httpProvider) {
})
    .service('userService',['$http',function($http){
        this.getProfile = function () {
            return $http.post('/api/user/getprofile').then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result
                }else {
                    errorHandle(data);
                }
            });
        };
        this.saveProfile = function (userProfile) {
            return $http.post('/api/user/saveprofile',userProfile).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data;
                }else {
                    errorHandle(data);
                }
            });
        };
    }])

    .service('eqpService',['$http',function($http){
        this.getEqpInfo = function () {
            return $http.post('/api/eqp/getinfo').then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result.eqpInfo;
                }else {
                    errorHandle(data);
                }
            });
        };
    }])

    .service('leaveService',['$http',function($http){
        this.getLeaveInfo = function () {
            return $http.post('/api/leave/getleaveinfo').then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.getLeaveAll = function (year) {
            return $http.post('/api/leave/getleaveall?year='+year).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.getType = function () {
            return $http.post('/api/leave/gettype').then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result.leaveType;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.getOrderInfo = function (orderId) {
            return $http.post('/api/leave/getorderinfo?orderid='+orderId).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.orderChange = function (action,orderId,leaderNote) {
            return $http.post('/api/leave/orderchange?action='+action+'&orderid='+orderId,{"leaderNote":leaderNote}).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.save = function (saveData) {
            return $http.post('/api/leave/save',saveData).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.rm = function (orderId) {
            return $http.post('/api/leave/rm?orderid='+orderId).then(function (response){
                var data = response.data;
                    return data;
            });
        };
    }])
    .service('adminService',['$http',function($http){
        this.getUsers = function (dpId) {
            return $http.post('/api/user/getusers?dpid='+dpId).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.userStat = function (userId) {
            return $http.post('/api/leave/userstat?userid='+userId).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.addTx = function (saveData) {
            return $http.post('/api/leave/addtx',saveData).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.leaveStat = function () {
            return $http.post('/api/leave/stat').then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data.result;
                }else {
                    errorHandle(data);
                }
            });
        };
        this.saveProfile = function (userProfile) {
            return $http.post('/api/user/saveprofile',userProfile).then(function (response){
                var data = response.data;
                if(data.status == "0"){
                    return data;
                }else {
                    errorHandle(data);
                }
            });
        };
    }])

