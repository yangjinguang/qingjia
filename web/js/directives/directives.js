angular.module('OA.directives',[])
    .directive('hzNav', ['$location','$cookies', function ($location,$cookies) {
        return {
            restrict:'A',
            templateUrl: 'partials/layout/header.html',
            link: function (scope, element, attrs) {
            },
            controller: function ($scope,$cookies) {

                $scope.userinfo =  {
                    "username":$cookies.username,
                    "display_name":$cookies.display_name,
                    "email":$cookies.email,
                    "isHr":$cookies.isHr,
                    "isLeader":$cookies.isLeader,
                };

                $scope.selectNav = function (tab) {
                    if (tab == "0") {
                        $location.path("/leave");
                        if(isIE)
                            location.reload();
                    }else if (tab == "1") {
                        $location.path("/eqp");
                        if(isIE)
                            location.reload();
		            }
                    $scope.navTab = tab;
                };
            }
        }
    }])
    .directive('adminNav', ['$location','$cookies', function ($location,$cookies) {
        return {
            restrict:'A',
            templateUrl: 'partials/layout/admin_nav.html',
            link: function (scope, element, attrs) {
            },
            controller: function ($scope,$cookies) {
                $scope.selectAdminNav = function(tab) {
                    $scope.adminNavTab = tab;
                };
            }
        }
    }])
