﻿myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService, $q) {

  /*Start settings*/
  $scope.imgThumb = 'img/linkfire_logo.png';

//  Getting latest links on startup
  storageCheckService.getAuth(function(user){
    userData =
    {
      'token' : user.token,
      "user_id" : user.id
    };

    $scope.user = user.user;
    $scope.userImage = 'http://linkfire.test.dev.rocketlabs.dk' + user.image;
  });

  $scope.fetching = true;
  $scope.linkCreated = false;

    // checking storage for UI settings
    storageCheckService.getSettings(function(settings){
      // initiates extension behavior for default state autoCopy=true
      if(JSON.stringify(settings)){
        $scope.autoCopy = settings.copy;
      }else{
        $scope.autoCopy = false;
      }

			// gets browser tab info
      pageInfoService.getInfo(function (info) {
          $scope.newLink = "Fetching shortlink";
          // prepares data for api post in callback
          $scope.getScrapeData(info.url)
            .then(function(postData) {
              // queries api with callback postData
              apiService.getLinkfireData(postData)
                .then(function(data) {

                  $scope.fetching = false;

                  if(data.title == ''){
                    $scope.title = 'No title available';
                  }

                  else{
                    $scope.title = data.title;
                  }

                  if (data.description == ''){
                    $scope.description = 'No description available';
                  }

                  else{
                    $scope.description = data.description;
                  }


  /*                for (i = data.thumbnailsPending.length - 1; i >= 0; i++) {
                    console.log('Her')
                    var imgPlaceholder = new Image();
                    imgPlaceholder.src = data.thumbnailsPending[i];
                    console.log(imgPlaceholder.height)
                    if(imgPlaceholder.height > 150){
                      var img = data.thumbnailsPending[i];
                      $scope.imgThumb = imgPlaceholder.src;
                      break;
                    }
                  }*/

                  if (data.thumbnails) {
                    $scope.imgThumb = data.thumbnails[0];
                  }
                  else{
                    $scope.imgThumb = 'img/linkfire_logo.png'
                  }

                  storageCheckService.getLink(function(previous){
                    $scope.copied = false;
                    if(previous.original_url === data.url){
                      $scope.newLink = previous.shortlink;
                      $scope.getHistory(userData,2,3);
                    }
                    else{
                      apiService.createLinkfireLink(postData, data)
                        .then(function(data){
                          //  Get latest links
                          $scope.getHistory(userData, 2, 3);
                          storageCheckService.setLink(data.link.original_url, data.link.url);
                          $scope.newLink = data.link.url;
                          if($scope.autoCopy == true){
                            $scope.copyToClipboard($scope.newLink);
                          }
                        }, function(error){
                          console.log(error);
                          $scope.newLink = "Error handling your request!";
                        })
                    }
                  });
                },function(error){
                    console.log(error);
                    $scope.newLink = "Error handling your request!";
                });
            });
      });
  });

    // function for preparing data for api post in callback. uses storage checks and is therefore async
    $scope.getScrapeData = function(newUrl){
      var d = $q.defer();
      var postData = {};
      // storage check to get user data
      storageCheckService.getAuth(function(user){
        postData =
        {
          'token' : user.token,
          "user_id" : user.id,
          "url" : newUrl
        }
        d.resolve(postData);
      });
      return d.promise;
    };

    $scope.openSettings = function(){
      $scope.showPage = 'settings';
      //note: I have made a service that gets copy+url settings 'storageCheckService.getSettings(function(settings))'
      // checks chrome local storage for settings and sets variables accordingly
      chrome.storage.local.get(['copy'], function(result) {
        $scope.copy = result.copy;
        $scope.$apply();
      });
    };

    /*listener for close settings*/
    $scope.$on('closemodal', function(event) {
      $scope.showPage = '';
    });

    /*listener for close settings*/
    $scope.$on('toggleAutoCopy', function(event, copy) {
      $scope.autoCopy = copy;
      console.log('Vi lytter på toggleAutoCopy og sætter autoCopy til : ' + $scope.autoCopy);
    });

  // function for copying to the clipboard
    $scope.copyToClipboard = function(text){
      $scope.copied = true;
	    var copyDiv = document.createElement('div');
	    copyDiv.contentEditable = true;
	    document.body.appendChild(copyDiv);
	    copyDiv.innerHTML = text;
	    copyDiv.unselectable = "off";
	    copyDiv.focus();
	    document.execCommand('SelectAll');
	    document.execCommand("Copy", false, null);
	    document.body.removeChild(copyDiv);
	};

  $scope.getHistory = function (userdata, selector1, selector2) {
    //  Get latest links
    apiService.getAllLinkfireLinks(userData)
      .then(function(data){
//      Get 2 latest links
        apiService.getLatestLinkfireLinks(userData,data.links[data.links.length - selector1])
          .then(function(data){
            $scope.firstLink = data.link.url;
            $scope.firstLinkClick = data.link.stats.clicks;
            $scope.firstLinkShares = data.link.stats.shares;
            if(data.link.image.default){
              $scope.firstLinkImage = 'http://linkfire.test.dev.rocketlabs.dk' + data.link.image.default;
            }
            else{
              $scope.firstLinkImage = 'img/default_link.png'
            }

          }, function(error){
            $scope.firstLink = "Error handling your request!";
          });

        apiService.getLatestLinkfireLinks(userData,data.links[data.links.length - selector2])
          .then(function(data){
            $scope.secondLink = data.link.url;
            $scope.secondLinkClick = data.link.stats.clicks;
            $scope.secondLinkShares = data.link.stats.shares;
            if(data.link.image.default){
              $scope.secondLinkImage = 'http://linkfire.test.dev.rocketlabs.dk' + data.link.image.default;
            }
            else{
              $scope.secondLinkImage = 'img/default_link.png'
            }
          }, function(error){
            $scope.secondLink = "Error handling your request!";
          });
      }, function(error){
        console.log = "Error handling your request!";
      });
  }
});



