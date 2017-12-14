/*----------------------------------
Author: Dust Co.
Date created: 14/12/17 16:15
Last modified: 14/12/17 16:15
Comments: Main js file for denevents.
----------------------------------*/
var app=angular.module("denevents",[]);
app.controller("home",function($scope,$compile,$http){
    $scope.eventsArray=[];
    $scope.heroPosition=0;
    $scope.getEvents=function(){
        $http.get("events/getEvents")
        .then(function success(response){
            response=response.data;
            console.log(response);
            if(typeof response=="object"){
                $scope.eventsArray=response;
                // $scope.displayEvents();
                $scope.startHeroEvent();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while loading events on this page. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_EVENTS_FOUND":
                    messageBox("No Events Found","No events found.");
                    $("#eventlist").html('<p class="text-center">No events found.</p>');
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while loading events on this page. Please try again later.");
        });
    };
    $scope.startHeroEvent=function(){
        if(validate($scope.eventsArray)){
            var events=$scope.eventsArray;
            if(validate(events[$scope.heroPosition])){
                var event=events[$scope.heroPosition];
                var eventID=event.idevent_master;
                var eventName=stripslashes(event.event_name);
                var eventDesc=stripslashes(event.event_description);
                var eventImage=event.event_image;
                var eventType=event.event_type_master_idevent_type_master;
                var eventTypeName=eventType.type_name;
                var eventTimestamp=event.timestamp;
                var user=event.user_master_iduser_master;
                var userID=user.iduser_master;
                var userName=stripslashes(user.user_name);
                var userDP=user.user_dp;
                if(!validate(userDP)){
                    userDP='images/defaultm.jpg';
                }
                $("#hero-event").css({
                    "background":"#000000 url("+eventImage+") center",
                    "-webkit-background-size":"cover",
                    "-moz-background-size":"cover",
                    "background-size":"cover"
                });
                $scope.heroPosition+=1;
                if($scope.heroPosition>=$scope.eventsArray.length){
                    $scope.heroPosition=0;
                }
                setTimeout(function(){
                    $scope.heroPosition();
                },5000);
            }
        }
    }; 
});