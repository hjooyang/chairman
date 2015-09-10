(function() {
	'use strict';

	angular.module('memory.controllers', [])

	.controller('AppCtrl', ['$scope', '$ionicModal', '$ionicPopup', '$state', '$cookieStore', '$window', 'Settings', function($scope, $ionicModal, $ionicPopup, $state, $cookieStore, $window, Settings) {
		Settings.set('gameOn','false');
		$scope.settings = Settings.getSettings();
		/*** Settings modal ***/
		$scope.showSettings = function() {
			if(!$scope.settingsModal) {
				// Load the modal from the given template URL
				$ionicModal.fromTemplateUrl('templates/settings.html', function(modal) {
					$scope.settingsModal = modal;
					$scope.settingsModal.show();
				}, {
					// The animation we want to use for the modal entrance
					animation: 'slide-in-up'
				});
			} else {
				$scope.settingsModal.show();
			}
		};
		/*** Info modal ***/
		$scope.showInfo = function() {
			if(!$scope.infoModal) {
				// Load the modal from the given template URL
				$ionicModal.fromTemplateUrl('templates/info.html', function(modal) {
					$scope.infoModal = modal;
					$scope.infoModal.show();
				}, {
					// The animation we want to use for the modal entrance
					animation: 'slide-in-up'
				});
			} else {
				$scope.infoModal.show();
			}
		};
		/*** Check if a game is in progress ***/
		$scope.checkGame = function() {
			var stateName = $state.current.name.substring(0, 4);
			var gameState = Settings.get('gameOn');
			console.log('checkGame: ',stateName, gameState);
			if (stateName === 'game' && gameState) {
				$scope.showConfirm();
			} else {
				$state.go('home');
			}
		};
		/*** Game Quit Confirmation popup ***/
		$scope.showConfirm = function() {
			console.log('showConfirm');
			var confirmPopup = $ionicPopup.confirm({
				title: 'Are you sure you want to quit?',
				cancelText: 'Yes',
				cancelType: 'button-outline',
				okText: 'No',
				okType: 'button-positive',
	  			scope: $scope,

			});
			confirmPopup.then(function(res) {
				if(res) {
					$state.go($state.current, {}, { reload: false });
				} else {
					Settings.set('gameOn','false');
					$state.go('home');
				}
			});
		};

		// Logout user
	    $scope.logout = function () {
	        $cookieStore.remove("userInfo");
	        $state.go('welcome');
	        $window.location.reload();
	    };
	}])

	.controller('HomeCtrl', ['$scope', 'Settings', function($scope, Settings) {
		$scope.settings = Settings.getSettings();
		$scope.theme = Settings.get('theme');
	}])

	.controller('GameCtrl', ['$scope', '$state', '$ionicPopup', 'icons', 'Settings', function($scope, $state, $ionicPopup, icons, Settings) {
		//	Retrieve tile icons and save to $scope & local settings
		$scope.icons = icons;
		Settings.set('icons', icons);

	  	$scope.settings = Settings.getSettings();

		// Listeners for game events triggered by angular-memory-game
		$scope.$on('memoryGameUnmatchedPairEvent', function() {
			$scope.message = 'Try again!';
			console.log($scope.message);
		});
		$scope.$on('memoryGameMatchedPairEvent', function() {
			$scope.message = 'Good match!';
			console.log($scope.message);
		});
		$scope.$on('memoryGameCompletedEvent', function() {
			$scope.message = 'Success!';
			$scope.showFinale();
			console.log($scope.message);
		});
		$scope.$on('memoryGameIconErrorEvent', function() {
			$scope.message = 'ERROR: # of available tiles is less than the grid requires';
			$scope.showIconError();
			console.log($scope.message);
		});

		/*** Game Over popup ***/
		$scope.showFinale = function() {
			var finalePopup = $ionicPopup.confirm({
				title: '<h2>Congratulations!</h2><h4>You matched all the tiles!</h4>',
				cancelText: 'Main Menu',
				cancelType: 'button-dark',
				okText: 'Play Again',
				okType: 'button-balanced',
	  			scope: $scope,
			});
			finalePopup.then(function(res) {
				if(res) {
					console.log('Play Again');
					$state.go($state.current, {}, { reload: true });
				} else {
					console.log('Main Menu');
					$state.go('home');
				}
			});
		};

		/*** Error popup ***/
		$scope.showIconError = function() {
			var errorPopup = $ionicPopup.confirm({
				title: '<h2>ERROR:</h2><h4>there was a problem loading the icons.</h4>',
				cancelText: 'Main Menu',
				cancelType: 'button-dark',
				okText: 'Try Again?',
				okType: 'button-balanced',
	  			scope: $scope,
			});
			errorPopup.then(function(res) {
				if(res) {
					console.log('Try Again?');
					$state.go($state.current, {}, { reload: true });
				} else {
					console.log('Main Menu');
					$state.go('home');
				}
			});
		};

	}])

	.controller('FinaleCtrl', ['$scope', '$state', 'Settings', function($scope, $state, Settings) {
		$scope.settings = Settings.getSettings();
		$scope.restartBtn = function() {
			console.log('restartBtn');
			$state.go($state.current, {}, { reload: false });
			$scope.modal.hide();
		};

		$scope.closeInfo = function() {
			$scope.modal.hide();
		};
	}])

	.controller('InfoCtrl', ['$scope', 'Settings', function($scope, Settings) {
		$scope.settings = Settings.getSettings();
		$scope.closeInfo = function() {
			$scope.modal.hide();
		};
	}])

	.controller('SettingsCtrl', ['$scope', 'Settings', function($scope, Settings) {
		$scope.settings = Settings.getSettings();
	    $scope.themes = Settings.getAllThemes();

		// Watch deeply for settings changes, and save them if necessary
		$scope.$watch('settings', function(v) {
			Settings.save();
			console.log('settings.change', Settings.get('theme'));
		}, true);

		$scope.closeSettings = function() {
			$scope.modal.hide();
		};
	}])
	.controller('WelcomeCtrl', function ($scope, $state, $cookieStore) {
		
	    /**
	     * SOCIAL LOGIN
	     * Facebook and Google
	     */
	    // FB Login
	    $scope.fbLogin = function () {
                alert("before login");
	        FB.login(function (response) {
                     alert("login");
	            if (response.authResponse) {
	                getUserInfo();
	            } else {
	                console.log('User cancelled login or did not fully authorize.');
	            }
	        }, {scope: 'email,user_photos,user_videos'});

	        function getUserInfo() {
	            // get basic info
	            FB.api('/me', function (response) {
	                console.log('Facebook Login RESPONSE: ' + angular.toJson(response));
	                // get profile picture
	                FB.api('/me/picture?type=normal', function (picResponse) {
	                    console.log('Facebook Login RESPONSE: ' + picResponse.data.url);
	                    response.imageUrl = picResponse.data.url;
	                    // store data to DB - Call to API
	                    // Todo
	                    // After posting user data to server successfully store user data locally
	                    var user = {};
	                    user.name = response.name;
	                    user.email = response.email;
	                    if(response.gender) {
	                        response.gender.toString().toLowerCase() === 'male' ? user.gender = 'M' : user.gender = 'F';
	                    } else {
	                        user.gender = '';
	                    }
	                    user.profilePic = picResponse.data.url;
	                    $cookieStore.put('userInfo', user);
	                    // $state.go('dashboard');
	                    $state.go('home');

	                });
	            });
	        }
	    };
	    // END FB Login
	})
	.controller('LoginCtrl', ['$rootScope', '$scope', 'LoginService','$ionicPopup', '$state', 'InitBluemix', function ($rootScope, $scope, LoginService,$ionicPopup, $state, InitBluemix) {
		$scope.data = {};

		    // Init Mobile Cloud SDK and wait for it to configure itself
		    // Once complete keep a reference to it so we can talk to it later
		    if (!$rootScope.IBMBluemix) {
		    	console.log('IBMBluemix exists!');
		        InitBluemix.init().then(function() {
		            $rootScope.IBMBluemix = IBMBluemix;
		            // $scope.loadItems();
		        });
		    } else {
				console.log('No IBMBluemix ');
		        // load a refresh from the cloud
		        // $scope.list = ListService.allCache();
		    }
 
	    $scope.login = function() {
	        LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
	            $state.go('home');
	        }).error(function(data) {
	            var alertPopup = $ionicPopup.alert({
	                title: 'Login failed!',
	                template: 'Please check your credentials!'
	            });
	        });
	    }

	    $scope.join = function() {
	    	LoginService.joinUser($scope.data.username, $scope.data.password).success(function(data) {
	    		console.log('joinuser successful');
	    		$state.go('home');
	    	}).error(function(data) {
	    		var alertPopup = $ionicPopup.alert({
	    			title: 'Login failed!',
	    			template: 'Please check your credentials!'
	    		});
	    	})
	    }

	    // $scope.login = function() {
	    //     LoginService.joinUser($scope.data.username, $scope.data.password).success(function(data) {
	    //         $state.go('home');
	    //     }).error(function(data) {
	    //         var alertPopup = $ionicPopup.alert({
	    //             title: 'Join failed!',
	    //             template: 'Please check your credentials!'
	    //         });
	    //     });
	    // }
	}])
	.controller('MainCtrl', ['$scope', '$state','Settings', function($scope, $state, Settings) {
		$scope.settings = Settings.getSettings();
		$scope.theme = Settings.get('theme');

		$scope.createRoom = function() {
			console.log("create a room");
			$state.go('room-creation');
		}
	}])
	.controller('RoomCtrl', ['$scope', '$state','Settings', function($scope, $state, Settings) {
		$scope.settings = Settings.getSettings();
		$scope.theme = Settings.get('theme');

	}])
	// .controller('LoginCtrl', function($scope, LoginService) {
	//     $scope.data = {};
	 
	//     $scope.login = function() {

	//     	 LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
	//             $state.go('tab.dash');
	//         }).error(function(data) {
	//             var alertPopup = $ionicPopup.alert({
	//                 title: 'Login failed!',
	//                 template: 'Please check your credentials!'
	//             });
	//         });

	//         console.log("LOGIN user: " + $scope.data.username + " - PW: " + $scope.data.password);
	//     }
	// });
}());