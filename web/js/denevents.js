/*----------------------------------
Author: Dust Co.
Date created: 14/12/17 16:15
Last modified: 14/12/17 16:15
Comments: Main js file for denevents.
----------------------------------*/
var app=angular.module("denevents",[]);
app.config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});
app.controller("home",function($scope,$compile,$http){
    $scope.eventsArray=[];
    $scope.heroPosition=0;
    $scope.eventTypeArray=[];
    $scope.getEvents=function(){
        $http.get("events/getEvents")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.eventsArray=response;
                $scope.displayEvents();
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
    $scope.displayEvents=function(){
        if(validate($scope.eventsArray)){
            var events=$scope.eventsArray;
            var text='<div class="row">';
            for(var i=0;i<events.length;i++){
                var event=events[i];
                var eventID=event.idevent_master;
                var eventName=event.event_name;
                var stat=event.stat;
                var eventType=event.event_type_master_idevent_type_master;
                var typeName=eventType.type_name;
                var eventImage=event.event_image;
                text+='<div class="col-md-4"><div class="thumbnail"><a href="event/'+eventID+'"><img src="'+eventImage+'" alt="'+eventName+'" class="img-responsive" style="width:250px;"><div class="caption"><p class="text-center"><strong>'+eventName+'</strong><br><span class="text-info">'+typeName+'</span></p></div></a></div></div>';
            }
            text+='</div>';
            $("#eventlist").html(text);
        }
    };
    $scope.getEventTypes=function(){
        $http.get("events/getEventTypes")
        .then(function success(response){
            response=response.data;
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
            var eventTypes=$scope.eventTypeArray;
            var text='<div class="row">';
            for(var i=0;i<eventTypes.length;i++){
                var eventType=eventTypes[i];
                var eventTypeID=eventType.idevent_type_master;
                var typeName=stripslashes(eventType.type_name);
                var typeImage=eventType.type_image;
                if(!validate(typeImage)){
                    typeImage='images/no-image.png';
                }
                text+='<div class="col-sm-4"><div class="category" style="background:#ffffff url('+typeImage+') center;-webkit-background-size:cover;-moz-background-size:cover;background-size:cover;"><h2 class="categoryHeading text-center" style="position:relative;top:60px;">'+typeName+'</h2></div></div>';
            }
            text+='</div>';
            $("#categorylist").html(text);
        }
    };
    $scope.startHeroEvent=function(){
        if(validate($scope.eventsArray)){
            var events=$scope.eventsArray;
            if(validate(events[$scope.heroPosition])){
                var event=events[$scope.heroPosition];
                var stat=event.stat;
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
                var text='<br><br><br><br><br><br><div class="row"><div class="col-sm-6 col-sm-offset-1"><h3 class="heroHeading" class="text-left">'+eventName+'</h3>';
                if(stat==1){
                    text+='<button type="button" class="btn btn-primary" btn-lg">Book tickets</button>';
                }
                else{
                    text+='<button type="button" class="btn btn-info btn-lg">Coming soon</button>';
                }
                text+='</div></div>';
                $("#hero-event").html(text);
                $scope.heroPosition+=1;
                if($scope.heroPosition>=$scope.eventsArray.length){
                    $scope.heroPosition=0;
                }
                var nextImage=new Image();
                nextImage.src=events[$scope.heroPosition].event_image;
                setTimeout(function(){
                    $scope.startHeroEvent();
                },30000);
            }
        }
    }; 
    $scope.getTickets=function(){
        console.log("here");
        $http.get("events/getTickets")
        .then(function success(response){
            response=response.data;
            console.log(response);
            if(typeof response=="object"){
                $("#eventreview").removeClass("disabled");
                $("#eventreview").click(function(){
                    window.location='dashboard';
                });
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while getting some information. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_TICKETS_FOUND":
                    $("#eventreview").addClass("disabled");
                    $("#eventreview").click(null);
                    break;
                    case "INVALID_EVENT_ID":
                    messageBox("Invalid Event","The event you're trying to add tickets to is invalid.");
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while loading some events. Please try again later.");
        });
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
            $("#accountheader").parent().addClass("active");
            $("#accountheader").parent().append('<ul class="dropdown-menu"><li><a href="#">Tickets <span class="badge">{[{ticketCount}]}</span></a></li><li><a href="#">Saved <span class="badge">{[{savedCount}]}</span></a></li><li><a href="dashboard">Manage events</a></li><li><a href="#">Contacts</a></li><li class="active"><a href="profile">Account settings</a></li><li><a href="logout">Log out</a></li></ul>');
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
    $scope.event=null;
    $scope.getEvent=function(){
        $http.get("../events/getEvent")
        .then(function success(response){
            response=response.data;
            console.log(response);
            if(typeof response=="object"){
                $scope.event=response;
                $scope.displayEvent();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while getting information about this event. Please try again later. This is the error we see: "+response);
                    break;
                    case "INVALID_EVENT_ID":
                    messageBox("Invalid Event","This is an invalid event and doesn't exist any more.");
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while getting information about this event. Please try again later.");
        });
    };
    $scope.displayEvent=function(){
        if(validate($scope.event)){
            var event=$scope.event;
            var eventID=event.idevent_master;
            var eventName=stripslashes(event.event_name);
            var eventImage=event.event_image;
            var stat=event.stat;
            var start=event.event_start;
            var end=event.event_end;
            var sp=start.split(" ");
            var sdate=dateFormat(sp[0]);
            var eventType=event.event_type_master_idevent_type_master;
            var eventPrice=event.event_price;
            var typeName=stripslashes(eventType.type_name);
            var eventTopic=event.event_topic;
            var eDesc=nl2br(stripslashes(event.event_description));
            var address=nl2br(stripslashes(event.event_address));
            var user=event.user_master_iduser_master;
            var userID=user.iduser_master;
            $("#eventimg").css({
                "background":"#000000 url("+eventImage+") center",
                "-webkit-background-size":"cover",
                "-moz-background-size":"cover",
                "background-size":"cover",
                "width":"100%",
                "min-height":"300px"
            });
            var text='<h1>'+eventName+'</h1><strong>'+typeName+'&nbsp;&bull;&nbsp;'+eventTopic+'</strong><br><small>'+sdate+' at '+sp[1]+'</small><div id="ticketdetails"></div>';
            $("#eventdetails").html(text);
            if(stat==1){
                $scope.getTickets();
            }
            else{
                $("#ticketdetails").html('<span class="text-warning">Coming soon</span>');
            }
            $("#eventdesc").html(eDesc);
            var dateSpan='<span class="text-info">'+sdate+' at '+sp[1]+' to ';
            sp=end.split(" ");
            var edate=dateFormat(sp[0]);
            dateSpan+=edate+' at '+sp[1]+'</span><br><p>'+address+'</p>';
            $("#eventadd").html(dateSpan);
        }
    };
    $scope.tickets=[];
    $scope.getTickets=function(){
        $http.get("../events/getTickets")
        .then(function success(response){
            response=response.data;
            console.log(response);
            if(typeof response=="object"){
                $scope.tickets=response;
                $("#eventreview").removeClass("disabled");
                $("#eventreview").click(function(){
                    window.location='dashboard';
                });
                $scope.displayTickets();
            } 
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while trying to load ticket information. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_TICKETS_FOUND":
                    $("#ticketdetails").html('No ticket types found');
                    $("#eventreview").addClass("disabled");
                    $("#eventreview").click(null);
                    break;
                    case "USER_IS_OWNER":
                    $("#ticketdetails").html('<button type="button" class="btn btn-default">View tickets</button>');
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while trying to load ticket information. Please try again later.");
        });
    };
    $scope.displayTickets=function(){
        if(validate($scope.tickets)){
            var tickets=$scope.tickets;
            var text='<table class="table"><thead><tr><th>Ticket name</th><th>Price</th></tr></thead><tbody>';
            for(var i=0;i<tickets.length;i++){
                var ticket=tickets[i];
                var ticketID=ticket.idticket_master;
                var ticketName=stripslashes(ticket.ticket_name);
                var price=ticket.ticket_cost;
                text+='<tr><td>'+ticketName+'</td><td>'+price+'</td></tr>';
            }
            text+='</tbody></table>';
            $("#ticketdetails").html(text);
        }
    };
    $scope.validateTicket=function(){
        var tname=$.trim($("#tname").val());
        if(validate(tname)){
            $("#tname").parent().removeClass("has-error");
            var tcount=$("#quan").val();
            if((validate(tcount))&&(tcount>0)){
                $("#quan").parent().removeClass("has-error");
                var price=$("#price").val();
                if((validate(price))&&(price>=0)){
                    $("#price").parent().removeClass("has-error");
                    document.ticketcreate.submit();
                }
                else{
                    $("#price").parent().addClass("has-error");
                }
            }
            else{
                $("#quan").parent().addClass("has-error");
            }
        }
        else{
            $("#tname").parent().addClass("has-error");
        }
    };
});
app.controller("dashboard",function($scope,$compile,$http){
    $scope.eventArray=[];
    $scope.getEvents=function(){
        $http.get("events/getEvents?user_id=1")
        .then(function success(response){
            response=response.data;
            if(typeof response=="object"){
                $scope.eventArray=response;
                $scope.eventCount=$scope.eventArray.length;
                $scope.displayEvents();
            }
            else{
                response=$.trim(response);
                switch(response){
                    case "INVALID_PARAMETERS":
                    default:
                    messageBox("Problem","Something went wrong while getting the list of events you've created. Please try again later. This is the error we see: "+response);
                    break;
                    case "NO_EVENTS_FOUND":
                    $("#eventlist").html('<p>No events created.</p>');
                    break;
                    case "INVALID_USER_ID":
                    window.location="logout";
                    break;
                }
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while getting list of events you've created. Please try again later.");
        });
    };
    $scope.displayEvents=function(){
        if(validate($scope.eventArray)){
            var events=$scope.eventArray;
            var text='<div class="row">';
            for(var i=0;i<events.length;i++){
                var event=events[i];
                var eventID=event.idevent_master;
                var eventName=stripslashes(event.event_name);
                var eventImage=event.event_image;
                var eventType=event.event_type_master_idevent_type_master;
                var typeName=stripslashes(eventType.type_name);
                text+='<div class="col-md-4"><div class="thumbnail"><a href="event/'+eventID+'"><img src="'+eventImage+'" alt="'+eventName+'" class="img-responsive" style="width:250px;"><div class="caption"><p class="text-center"><strong>'+eventName+'</strong><br><span class="text-info">'+typeName+'</span></p></div></a></div></div>';
            }
            text+='</div>';
            $("#eventlist").html(text);
        }
    };
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
            $("#accountheader").parent().addClass("active");
            $("#accountheader").parent().append('<ul class="dropdown-menu"><li><a href="#">Tickets <span class="badge">{[{ticketCount}]}</span></a></li><li><a href="#">Saved <span class="badge">{[{savedCount}]}</span></a></li><li><a href="dashboard">Manage events</a></li><li><a href="#">Contacts</a></li><li class="active"><a href="profile">Account settings</a></li><li><a href="logout">Log out</a></li></ul>');
            $compile($("#accountheader").parent())($scope);
        }
    }
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