
angular.module('OA.controllers.eqp', [])
.controller('eqpViewCtrl', ['$scope', '$http', '$cookies', '$timeout','$window','$location','eqpService',function ($scope, $http, $cookies,$timeout,$window,$location,eqpService) {

    $scope.navTab = 1;
    eqpService.getEqpInfo().then(function(data) {
        $scope.eqpInfo = data;
    });
    $scope.eqpEdit = function (eqpId) {
        alert(eqpId);
    };
    $scope.eqpAdd = function () {
        alert("new");
    };
}])
.controller('addEqpModalCtrl',['$scope','$modal',
    function ($scope,$modal,$log) {
        $scope.open = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/eqp/add.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    leaveList: function () {
                        return $scope.leaveList;
                    }
                }
            });
        };
    }
])
.controller('ModalInstanceCtrl',['$scope','$modalInstance',
    function ($scope,$modalInstance) {
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);
