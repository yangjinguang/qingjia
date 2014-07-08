/**
 * ng-context-menu - An AngularJS directive to display a context menu when a right-click event is triggered
 *
 * @author Ian Kennington Walter (http://ianvonwalter.com)
 */
angular
  .module('ng-context-menu', [])
  .directive('contextMenu', ['$window','$document', '$parse', function($window,$document, $parse) {
    return {
      restrict: 'A',
      link: function($scope, element, attrs) {
        var opened = false,
            openTarget,
            disabled = $scope.$eval(attrs.contextMenuDisabled),
            win = angular.element($window),
            menuElement,
            fn = $parse(attrs.contextMenu);

        function open(event, element) {
          angular.element(".dropdown").addClass("hidden");//hide other menu
          element.removeClass('hidden');
//          element.css('top', event.pageY + 'px');
          element.css('top', event.pageY-64 + 'px');
          element.css('left', event.pageX + 'px');
          opened = true;
        }

        function close(element) {
          opened = false;
          element.addClass('hidden');
        }

//        menuElement.css('position', 'absolute');
//        menuElement.css('position', 'fixed');

        element.bind('contextmenu', function(event) {
          if (!disabled) {
            openTarget = event.currentTarget;
            if(!angular.element(openTarget).find("a.name").hasClass("editable")){
                removeEditable(event)
            }
            event.preventDefault();
            event.stopPropagation();
            $scope.$apply(function() {
              fn($scope, { $event: event });
              menuElement = angular.element(document.getElementById(attrs.target));
              open(event, menuElement);
            });
          }
        });

        win.bind('keyup', function(event) {
          if (!disabled && opened && event.keyCode === 27) {
            $scope.$apply(function() {
              close(menuElement);
            });
          }
        });

        //按下enter键等于提交重命名，更改成不可编辑状态
        $document.bind("keydown",function(event){
          var e = event ? event : window.event,
              target = angular.element(e.currentTarget.activeElement);
          if((e.keyCode || e.which) == 13){
              if(target.is("a.name.editable")){
                  removeEditable(e.currentTarget.activeElement);
              }
          }
        });

        function handleWindowClickEvent(event) {

            //右键时如果不是当前编辑则直接取消所有编辑状态
            var target = angular.element(event.target);
//            console.log(target.is("a.name.editable"));
            if(!target.is("a.name.editable")){
                removeEditable(event)
            }

          if (!disabled && opened && (event.button !== 2 || event.target !== openTarget)) {
            $scope.$apply(function() {
              close(menuElement);
            });
          }
        }

        // Firefox treats a right-click as a click and a contextmenu event while other browsers
        // just treat it as a contextmenu event
        win.bind('click', handleWindowClickEvent);
        win.bind('contextmenu', handleWindowClickEvent);
      }
    };
  }]);