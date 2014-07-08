
angular.module('OA.controllers.user', [])
    .controller('loginCtrl', ['$scope', '$http', '$location', '$cookies', 
        function ($scope, $http, $location, $cookies) {

            $scope.formData = {};

            $scope.login = function () {

                var username = this.formData.username,
                    password = this.formData.password;

                if(username == null || username == ""){
                    //alert("用户名不能为空");
                    return false;
                }

                if(password == null || password == ""){
                    //alert("密码不能为空");
                    return false;
                }
                $http({
                    method: 'POST',
                    url: '/api/user/login',
                    data: {"username":username,"password":password}
                }).success(function (data) {
                    if (data.status == "0") {
                        $cookies.token = data.result.access_token;
                        $cookies.username = data.result.userinfo.username;
                        $cookies.display_name = data.result.userinfo.display_name;
                        $cookies.navTab = "0";
                        $cookies.email = data.result.userinfo.email;
                        $cookies.isHr = data.result.userinfo.isHr.toString();
                        $cookies.isUserFull = data.result.isUserFull.toString();
                        $cookies.isLeader = data.result.isLeader.toString();
                        $cookies.department = data.result.department.toString();
                        if (data.result.isUserFull == "1") {
                            $location.url("/userinfo");
                        }else{
                            $location.url("/");
                        }
                    } else {
                        var errCode = data.status, errMsg = "";
                        switch (errCode) {
                            case "10002":;
                            case "10006" :
                                errMsg = "用户不存在";
                                break;
                            case "6" :
                                errMsg = "用户名或密码错误";
                                break;
                            case "1" :
                                errMsg = "cookie过期";
                                break;
                        }
                        alert(errMsg);
                    }
                });
            }
        }
    ])
    .controller('userInfoCtrl',['$scope','$http','$cookies','userService','$timeout','$filter',function($scope,$http,$cookies,userService,$timeout,$filter){
        $scope.sexOps = [
            {
                'id':0,
                'name':'男'
            },
            {
                'id':1,
                'name':'女'
            }
        ],
        userService.getProfile().then(function(data) {
            //获取部门列表
            $scope.departmentOps = data.departments;
            $scope.userProfile = {
                "sex": data.profile.sex == null ? $scope.sexOps[0]["id"] : Number(data.profile.sex),
                "phone": data.profile.phone == null ? "" : data.profile.phone,
                "birthday": data.profile.birthday,
                "entry_time": data.profile.entry_time,
                "department": data.profile.department == null ? $scope.departmentOps[0]['id'] : Number(data.profile.department),
                "position": data.profile.position,
            }
        });
        $scope.userinfo = {
            "username":$cookies.username,
            "display_name":$cookies.display_name,
            "email":$cookies.email,
        };
        $scope.datepckerBirthday = function($scope) {
            //生日时间选择控件 
            $scope.maxDate = new Date();
            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = true;
            };
            $scope.dateOptions = {
                formatYear: 'yyyy',
                startingDay: 1
            };
            $scope.minDate = '1900-01-01';
            $scope.maxDate = new Date();
            $scope.dateFormat = 'yyyy-MM-dd';
        };

        $scope.datepckerEntrytime = function($scope) {
            //入职时间时间选择控件
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
        $scope.save = function () {
            if($scope.userProfile.birthday.length==0){
                alert("生日不能为空");
                return false;
            }else{
                $scope.userProfile.birthday = $filter('date')($scope.userProfile.birthday, 'yyyy-MM-dd');
            };
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
            userService.saveProfile($scope.userProfile).then(function(data){
                $cookies.isUserFull = "0";
                location.href="/";
            });
        };
    }])
    .controller('logoutCtrl',['$scope','$http','$cookies',function($scope,$http,$cookies){
        $scope.logout = function(){
            $http.post(
                '/api/user/logout',
                {"access_token":$cookies.token}
            ).success(function(data){
                if(data.status == "0"){
                    $cookies.token = "";
                    location.href = "/index.html#/login";
                    if(isIE)
                        location.reload();//ie didn't work without refresh
                }else{
                    errorHandle(data);
                }
            });
        };

    }]);

