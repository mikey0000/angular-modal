/*
 * @license
 * angular-modal v0.5.0
 * (c) 2013 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.modal', []).
    factory('btfModal', ['$animate', '$compile', '$rootScope', '$controller', '$q', '$http', '$templateCache', modalFactoryFactory]);

function modalFactoryFactory($animate, $compile, $rootScope, $controller, $q, $http, $templateCache) {
  return function modalFactory (config) {
    if (!(!config.template ^ !config.templateUrl)) {
      throw new Error('Expected modal to have exacly one of either `template` or `templateUrl`');
    }

    var template      = config.template,
        controller    = config.controller || null,
        controllerAs  = config.controllerAs,
        container     = angular.element(config.container || document.body),
        element       = null,
        html,
        scope         = config.scope || null;

    if (config.template) {
      html = $q.when(config.template);
    } else {
      html = $http.get(config.templateUrl, {
        cache: $templateCache
      }).
      then(function (response) {
        return response.data;
      });
    }

    function open (locals) {
      return html.then(function (html) {
        if (!element) {
          attach(html, locals);
        }
      });
    }

    function close () {
      if (!element) {
        return $q.when();
      }
      return $animate.leave(element).then(function () {
        // scope.$destroy(); // don't do this
        // scope = null;
        element.remove();
        element = null;
      });
    }

    function active () {
      return !!element;
    }


    function attach (html, locals) {
      element = angular.element(html);
      if (element.length === 0) {
        throw new Error('The template contains no elements; you need to wrap text nodes')
      }
      if(!scope) {
        scope = $rootScope.$new();
      }
      if (controller) {
        if (!locals) {
          locals = {};
        }
        locals.$scope = scope;
        var ctrl = $controller(controller, locals);
        if (controllerAs) {
          scope[controllerAs] = ctrl;
        }
      } else if (locals) {
        for (var prop in locals) {
          scope[prop] = locals[prop];
        }
      }
      $compile(element)(scope);
      return $animate.enter(element, container);
    }

    

    return {
      open: open,
      close: close,
      active: active
    };
  };
}