define([
  'angular',
  'config',
  'underscore',
  'timezonejs',

  'services/all'
],
function (angular, config, _, timezoneJS) {
  "use strict";

  var module = angular.module('kibana.controllers');

  module.controller('DashCtrl', function(
    $scope, $route, ejsResource, fields, dashboard, alertSrv, panelMove, esVersion) {

    $scope.requiredElasticSearchVersion = ">=0.20.5";

    $scope.editor = {
      index: 0
    };

    // For moving stuff around the dashboard.
    $scope.panelMoveDrop = panelMove.onDrop;
    $scope.panelMoveStart = panelMove.onStart;
    $scope.panelMoveStop = panelMove.onStop;
    $scope.panelMoveOver = panelMove.onOver;
    $scope.panelMoveOut = panelMove.onOut;


    $scope.init = function() {
      $scope.config = config;
      // Make stuff, including underscore.js available to views
      $scope._ = _;
      timezoneJS.timezone.zoneFileBasePath = config.timezone_path;
      timezoneJS.timezone.defaultZoneFile = config.default_zone_file;
      timezoneJS.timezone.init();
      $scope.timezoneJS = timezoneJS;
      $scope.dashboard = dashboard;
      $scope.dashAlerts = alertSrv;
      $scope.esVersion = esVersion;

      // Clear existing alerts
      alertSrv.clearAll();

      // Provide a global list of all seen fields
      $scope.fields = fields;
      $scope.reset_row();

      $scope.ejs = ejsResource(config.elasticsearch);
    };

    $scope.isPanel = function(obj) {
      if(!_.isNull(obj) && !_.isUndefined(obj) && !_.isUndefined(obj.type)) {
        return true;
      } else {
        return false;
      }
    };

    $scope.add_row = function(dash,row) {
      dash.rows.push(row);
    };

    $scope.reset_row = function() {
      $scope.row = {
        title: '',
        height: '150px',
        editable: true,
      };
    };

    $scope.row_style = function(row) {
      return { 'min-height': row.collapse ? '5px' : row.height };
    };

    $scope.edit_path = function(type) {
      if(type) {
        return 'app/panels/'+type+'/editor.html';
      } else {
        return false;
      }
    };

    $scope.setEditorTabs = function(panelMeta) {
      $scope.editorTabs = ['General','Panel'];
      if(!_.isUndefined(panelMeta.editorTabs)) {
        $scope.editorTabs =  _.union($scope.editorTabs,_.pluck(panelMeta.editorTabs,'title'));
      }
      return $scope.editorTabs;
    };

    // This is whoafully incomplete, but will do for now
    $scope.parse_error = function(data) {
      var _error = data.match("nested: (.*?);");
      return _.isNull(_error) ? data : _error[1];
    };

    $scope.init();
  });
});