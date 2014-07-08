
/* App Module */

var hzApp = angular.module('OA', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
    'OA.services',
    'OA.directives',
    'OA.controllers.user',
    'OA.controllers.leave',
    'OA.controllers.admin',
    'OA.controllers.eqp',
]);

hzApp.run(function ($rootScope, $cookies, $location) {
    $rootScope.$on('$routeChangeStart', function () {
        if ($location.path() != "/login" && $location.path() != "/register" ) {
            if ((+!!$cookies.token) === 0) {
                $location.path("/login");
            };
            if ($cookies.isUserFull == "1") {
                $location.path("/userinfo");
            }
        }
    });
});

hzApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'view/login.html',
            controller: 'loginCtrl'
        }).when('/register', {
            templateUrl: 'view/register.html',
            controller: 'registerCtrl'
        }).when('/leave', {
            templateUrl: 'view/leave.html',
            controller: 'leaveViewCtrl'
        }).when('/leaveall', {
            templateUrl: 'view/leave_all.html',
            controller: 'leaveAllViewCtrl'
        }).when('/admin', {
            templateUrl: 'view/admin/user.html',
            controller: 'adminUserCtrl'
        }).when('/admin/user', {
            templateUrl: 'view/admin/user.html',
            controller: 'adminUserCtrl'
        }).when('/admin/leave', {
            templateUrl: 'view/admin/leave.html',
            controller: 'adminLeaveCtrl'
        }).when('/userinfo', {
            templateUrl: 'view/userinfo.html',
            controller: 'userInfoCtrl'
        }).when('/eqp', {
            templateUrl: 'view/eqp.html',
            controller: 'eqpViewCtrl'
        }).otherwise({
            redirectTo: '/leave'
        });
    }
]);

