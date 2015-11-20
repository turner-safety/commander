angular.module('starter.controllers', ['ngCordova', 'ui.router', 'underscore'])

.controller('DashCtrl', function($rootScope, $scope, $ionicPlatform, $cordovaPreferences, $cordovaBluetoothSerial, $state, Button, Trigger, DeviceState, $cordovaToast) {
  var deviceState = new DeviceState(2, 8, true);
  $rootScope.deviceState = deviceState;
  $ionicPlatform.ready(function() {
    $cordovaPreferences.fetch('deviceState')
      .success(function(value) {
        if(value != null) {
          $rootScope.deviceState.firstPortPinNumber = value.firstPortPinNumber;
          $rootScope.deviceState.numberOfPorts = value.numberOfPorts;
          $rootScope.deviceState.reverseLogic = value.reverseLogic;
          $rootScope.deviceState.bluetoothDevice = value.bluetoothDevice;
        }
      })
      .error(function(error) {
        console.log(error);
      }
    );
  });
  var buttons;
  var buttonTriggerChangedCallback = function(button) {
    deviceState.setPortsWithTrigger(button.trigger);
    _.each(button.trigger.activateButtons, function(buttonToActivate) {
      buttons[buttonToActivate].trigger.isActive = button.trigger.isActive;
      buttons[buttonToActivate].callback;
      deviceState.setPortsWithTrigger(buttons[buttonToActivate].trigger);
    });
    _.each(button.trigger.deactivateButtons, function(buttonToDeactivate) {
      buttons[buttonToDeactivate].trigger.isActive = !button.trigger.isActive;
      buttons[buttonToActivate].callback;
      deviceState.setPortsWithTrigger(buttons[buttonToDeactivate].trigger);
    });
    console.log(deviceState.toString());
  };
  buttons = [
    new Button("Head Light Flashers", new Trigger(["2"], [], [], true, false), buttonTriggerChangedCallback),
    new Button("Brake Light Flashers", new Trigger(["3"], [], [], true, false), buttonTriggerChangedCallback),
    new Button("License Plate Amber", new Trigger(["5"], [], [], true, false), buttonTriggerChangedCallback),
    new Button("License Plate Red", new Trigger(["6"], [], [], true, false), buttonTriggerChangedCallback),
    new Button("Rear Emergency", new Trigger([], [3, 1], [], true, false), buttonTriggerChangedCallback),
    new Button("Front Emergency", new Trigger([], [0], [], true, false), buttonTriggerChangedCallback),
    new Button("Emergency", new Trigger([], [0, 1, 3, 4, 5], [], true, false), buttonTriggerChangedCallback)
  ];
  deviceState.setPortsWithTriggers(_.map(buttons, function(val) { return val.trigger; }));
  $scope.buttons = buttons;
//  $scope.$watch('buttons', function(newObject, oldObject) {
//    deviceState.setPortsWithTriggers(_.map(newObject, function(val) { return val.trigger; }));
//    console.log(deviceState.toString());
//  }, true);
  $scope.listSettings = {
    canSwipe: true,
    showReorder: false,
    showDelete: false
  };
  $scope.connectButton = {
    text: "Connect",
    isDisabled: false,
    click: function() {
      $cordovaBluetoothSerial.isConnected().then(
        function() {
          $cordovaBluetoothSerial.disconnect().then(
            function(success) {
              $cordovaToast.showShortBottom("Disconnected!", 400)
              $scope.connectButton.text = "Connect";
              $scope.connectButton.isDisabled = false;
            },
            function(error) {
              $cordovaToast.showShortBottom(error, 400)
              $scope.connectButton.isDisabled = false;
            }
          );
        },
        function() {
          $scope.connectButton.text = "Connecting...";
          $scope.connectButton.isDisabled = true;
          $cordovaBluetoothSerial.connect($rootScope.deviceState.bluetoothDevice).then(
            function(success) {
              $cordovaToast.showShortBottom("Connected!", 400);
              $scope.connectButton.text = "Disconnect";
              $scope.connectButton.isDisabled = false;
            }, 
            function(error) {
              $cordovaToast.showShortBottom(error, 400);
              $scope.connectButton.text = "Connect";
              $scope.connectButton.isDisabled = false;
            }
          );
        }
      )
    }
  };
})

.controller('AccountCtrl', function($rootScope, $scope, $ionicPlatform, $cordovaBluetoothSerial, $cordovaPreferences) {
  $scope.bluetoothDevices = [""];

  $ionicPlatform.ready(function() {
    if(ionic.Platform.platform() !== "linux") {
      $cordovaBluetoothSerial.list().then(function(result){
        $scope.bluetoothDevices = result;
      },
      function(error) {
        console.log(error);
      });
    }
  });
  $scope.$on('$ionicView.beforeLeave', function(){
    $cordovaPreferences.store('deviceState', $rootScope.deviceState);
  });
});
