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
    $scope.eventTypeArray=[];
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
    $scope.getEventTypes=function(){
        $http.get("events/getEventTypes")
        .then(function success(response){
            response=response.data;
            console.log(response);
            if(typeof response=="object"){
                $scope.eventTypeArray=response;
                $scope.displayEventTypes();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while trying to get event categories. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_EVENT_TYPES_FOUND":
                    $("#categorylist").html('<p class="text-center">No categories found.</p>');
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while performing this action. Please try again later.");
        });
    }; 
    $scope.displayEventTypes=function(){
        if(validate($scope.eventTypeArray)){

        }
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
                var text='<div class="row"><div class="col-sm-6"><h2 class="text-center">'+eventName+'</h2></div></div>';
                $("#hero-event").html(text);
                $scope.heroPosition+=1;
                if($scope.heroPosition>=$scope.eventsArray.length){
                    $scope.heroPosition=0;
                }
                var nextImage=new Image();
                nextImage.src=events[$scope.heroPosition].event_image;
                setTimeout(function(){
                    $scope.startHeroEvent();
                },10000);
            }
        }
    }; 
});
app.controller("profile",function($scope,$compile,$http){
    $scope.userArray=[];
    $scope.getUser=function(){
        $http.get("user/getUser")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.userArray=response;
                $scope.changeHeader();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while performing this action. Please try again later. This is the error we see: "+response);
                    break;
                    case "INVALID_USER_ID":
                    window.location='https://dusthq-denevents.herokuapp.com/';
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while performing this action. Please try again later.");
        });
    };
    $scope.changeHeader=function(){
        if(validate($scope.userArray)){
            var user=$scope.userArray;
            var userName=stripslashes(user.user_name);
            var userDP=user.user_dp;
            if(!validate(userDP)){
                userDP='images/defaultm.jpg';
            }
            $("#accountheader").html('<img src="'+userDP+'" class="img-circle" width=17 height=17>&nbsp;'+userName+' <span class="caret"></span>');
            $("#accountheader").attr("href","#");
            $("#accountheader").addClass("dropdown-toggle");
            $("#accountheader").attr("data-toggle","dropdown");
            $("#accountheader").parent().attr("ng-init",'savedCount=0;ticketCount=0;');
            $("#accountheader").parent().append('<ul class="dropdown-menu"><li><a href="#">Tickets <span class="badge">{{ticketCount}}</span></a></li><li><a href="#">Saved <span class="badge">{{savedCount}}</span></a></li><li><a href="#">Manage events</a></li><li><a href="#">Contacts</a></li><li class="active"><a href="profile">Account settings</a></li><li><a href="logout">Log out</a></li></ul>');
            $compile($("#accountheader").parent())($scope);
        }
    }
});
app.controller("event",function($scope,$http,$compile){
    $scope.validateEvent=function(){
        var title=$.trim($("#title").val());
        if(validate(title)){
            $("#title").parent().removeClass("has-error");
            var address=$.trim($("#address").val());
            if(validate(address)){
                $("#address").parent().removeClass("has-error");
                var city=$.trim($("#city").val());
                if(validate(city)){
                    $("#city").parent().removeClass("has-error");
                    var zip=$.trim($("#zip").val());
                    if(validate(zip)){
                        $("#zip").parent().removeClass("has-error");
                        var eStart=$("#estart").val();
                        if(validate(eStart)){
                            $("#estart").parent().removeClass("has-error");
                            var eEnd=$("#eend").val();
                            if(validate(eEnd)){
                               $("#eend").parent().removeClass("has-error");
                                var img=document.eventcreate.eventimg.files[0];
                                if(validate(img)){
                                    $("#eventimg").parent().removeClass("has-error");
                                    var eDesc=$.trim($("#edesc").val());
                                    if(validate(eDesc)){
                                        $("#edesc").parent().removeClass("has-error");
                                        var orgName=$.trim($("#organizer").val());
                                        if(validate(orgName)){
                                            $("#organizer").parent().removeClass("has-error");
                                            var eventTypeID=$("#eventtype").val();
                                            if((validate(eventTypeID))&&(eventTypeID!=-1)){
                                                var eventTopic=$("#eventtopic").val();
                                                if((validate(eventTopic))&&(eventTopic!=-1)){
                                                    document.eventcreate.submit();
                                                }
                                                else{
                                                    $("#eventtopic").parent().addClass("has-error");
                                                    $("#eventtopic").focus();    
                                                }
                                            }
                                            else{
                                                $("#eventtype").parent().addClass("has-error");
                                                $("#eventtype").focus();
                                            }
                                        }
                                        else{
                                            $("#organizer").parent().addClass("has-error");
                                            $("#organizer").focus();
                                        }
                                    }
                                    else{
                                        $("#edesc").parent().addClass("has-error");
                                        $("#edesc").focus();
                                    }
                                }
                                else{
                                    $("#eventimg").parent().addClass("has-error");
                                }
                            }
                            else{
                                $("#eend").parent().addClass("has-error");
                                $("#eend").focus();
                            }
                        }
                        else{
                            $("#estart").parent().addClass("has-error");
                            $("#estart").focus();
                        }
                    }
                    else{
                        $("#zip").parent().addClass("has-error");
                        $("#zip").focus();
                    }
                }
                else{
                    $("#city").parent().addClass("has-error");
                    $("#city").focus();
                }
            }
            else{
                $("#address").parent().addClass("has-error");
                $("#address").focus();
            }
        }
        else{
            $("#title").parent().addClass("has-error");
            $("#title").focus();
        }
    };
    $scope.getEventTypes=function(){
        $http.get("events/getEventTypes")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                var eventTypes=response;
                var text='<select name="eventtype" id="eventtype" class="form-control"><option value="-1">Select ...</option>';
                for(var i=0;i<eventTypes.length;i++){
                    var eventType=eventTypes[i];
                    var eventTypeID=eventType.idevent_type_master;
                    var eventTypeName=stripslashes(eventType.type_name);
                    text+='<option value="'+eventTypeID+'">'+eventTypeName+'</option>';
                }
                text+='</select>';
                $("#eventtypes").html(text);
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while getting event types. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_EVENT_TYPES_FOUND":
                    $("#eventtypes").html('No event types found.');
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while getting event types. Please try again later.");
        });
    };
});
function loadImagePreview(){
    var image=document.eventcreate.eventimg.files[0];
    if(validate(image)){
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#imgpreview').css({
                "background":"#ffffff url("+e.target.result+") center",
                "-webkit-background-size":"cover",
                "-moz-background-size":"cover",
                "background-size":"cover"
            }); 
        };
        reader.readAsDataURL(image);
    }
}