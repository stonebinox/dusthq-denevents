/*----------------------------------
Author: Dust Co.
Date created: 14/12/17 16:15
Last modified: 14/12/17 16:15
Comments: Main js file for denevents.
----------------------------------*/
var app = angular.module("denevents", []);
app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
});
app.controller("home", function($scope, $compile, $http) {
    $scope.eventsArray = [];
    $scope.heroPosition = 0;
    $scope.heroes = ["ardian-lumi-364255.jpg","billetto-editorial-334676.jpg","daniel-hansen-262514.jpg","jens-johnsson-121807.jpg","marjorie-teo-390948.jpg","mona-eendra-339456.jpg","shane-rounce-205195.jpg","sladjana-karvounis-469267.jpg"];
    $scope.eventTypeArray = [];
    $scope.getEvents = function() {
        $http.get("events/getEvents")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        $scope.eventsArray = response;
                        $scope.displayEvents();
                        $scope.startHeroEvent();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while loading events on this page. Please try again later. This is the error we see: " + response);
                                break;
                            case "NO_EVENTS_FOUND":
                                messageBox("No Events Found", "No events found.");
                                $("#eventlist").html('<p class="text-center">No events found.</p>');
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while loading events on this page. Please try again later.");
                });
    };
    $scope.displayEvents = function() {
        if (validate($scope.eventsArray)) {
            var events = $scope.eventsArray;
            var text = '<div class="row">';
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var eventID = event.idevent_master;
                var eventName = event.event_name;
                var stat = event.stat;
                var eventType = event.event_type_master_idevent_type_master;
                var typeName = eventType.type_name;
                var eventImage = event.event_image;
                var user=event.user_master_iduser_master;
                var userID=user.iduser_master;
                var userName=stripslashes(event.user_name);
                var userDP=event.user_dp;
                if(!validate(userDP)){
                    userDP='images/defaultm.jpg';
                }
                var orgName=stripslashes(event.event_organizer);
                var eventAddress=stripslashes(nl2br(event.event_address));
                // text += '<div class="col-md-4"><div class="thumbnail"><a href="event/' + eventID + '"><img src="' + eventImage + '" alt="' + eventName + '" class="img-responsive" style="width:250px;"><div class="caption"><p class="text-center"><strong>' + eventName + '</strong><br><span class="text-info">' + typeName + '</span></p></div></a></div></div>';
                text += '<div class="col-12 col-md-6 col-lg-6 col-xl-4 wow fadeInUp mb-4">'
                +'<div class="card lis-brd-light text-center text-lg-left"><a href="event/'+eventID+'"><div class="lis-grediant grediant-tb-light2 lis-relative modImage rounded-top"><img src="'+eventImage+'" alt="'+eventName+'" class="img-fluid rounded-top w-100" /> </div><div class="lis-absolute lis-right-20 lis-top-20"><div class="lis-post-meta border border-white text-white rounded lis-f-14">';
                if(stat==2){
                    text+='Coming soon';
                }
                else{
                    text+='Open';
                }
                text+='</div></div></a><div class="card-body pt-0"><div class="media d-block d-lg-flex lis-relative"> <img src="'+userDP+'" alt="'+userName+'" class="lis-mt-minus-15 img-fluid d-lg-flex mx-auto mr-lg-3 mb-4 mb-lg-0 border lis-border-width-2 rounded-circle border-white" width="80" /><div class="media-body align-self-start mt-2"><h6 class="mb-0 lis-font-weight-600"><a href="#" class="lis-dark">'+eventName+'</a></h6></div></div><ul class="list-unstyled my-4 lis-line-height-2"><li><i class="fa fa-user-o pr-2"></i> '+orgName+'</li><li><i class="fa fa-map-o pr-2"></i> '+eventAddress+'</li></ul><div class="clearfix"><div class="float-none float-lg-left mb-3 mb-lg-0 mt-1"><A href="#" class="text-white"><i class="icofont icofont-travelling px-2 lis-bg5 py-2 lis-rounded-circle-50 lis-f-14"></i></A> <A href="#" class="lis-id-info lis-light p-2 lis-rounded-circle-50 lis-f-14">1 More...</A> </div><div class="float-none float-lg-right mt-1"><A href="#" class="lis-light lis-f-14"><i class="fa fa-envelope-o lis-id-info  lis-rounded-circle-50 text-center"></i></A> <A href="#" class="lis-light lis-f-14"><i class="fa fa-heart-o lis-id-info  lis-rounded-circle-50 text-center"></i></A> <A href="#" class="lis-green-light text-white p-2 lis-rounded-circle-50 lis-f-14"><i class="fa fa-star"></i> 4.0</A> </div></div></div></div></div>';
            }
            text += '</div>';
            $("#eventlist").html(text);
        }
    };
    $scope.getEventTypes = function() {
        $http.get("events/getEventTypes")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        $scope.eventTypeArray = response;
                        $scope.displayEventTypes();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while trying to get event categories. Please try again later. This is the error we see: " + response);
                                break;
                            case "NO_EVENT_TYPES_FOUND":
                                $("#categorylist").html('<p class="text-center">No categories found.</p>');
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while performing this action. Please try again later.");
                });
    };
    $scope.displayEventTypes = function() {
        if (validate($scope.eventTypeArray)) {
            var eventTypes = $scope.eventTypeArray;
            // var text = '<div class="row">';
            var text='<div class="fullwidth-carousel-container center2 slider">';
            var dropdown='<select class="form-control border-top-0 border-left-0 border-right-0 rounded-0 pl-4"><option value="0" selected>All Categories</option>';
            for (var i = 0; i < eventTypes.length; i++) {
                var eventType = eventTypes[i];
                var eventTypeID = eventType.idevent_type_master;
                var typeName = stripslashes(eventType.type_name);
                var typeImage = eventType.type_image;
                if (!validate(typeImage)) {
                    typeImage = 'images/no-image.png';
                }
                text+='<div><div class="card lis-brd-light text-center text-lg-left lis-info lis-relative"><a href="#"><div class="lis-grediant grediant-tb-light lis-relative modImage rounded"><img src="'+typeImage+'" alt="'+typeName+'" class="img-fluid rounded" style="background-color:#ffffff;" /></div></a><div class="hover-text lis-absolute lis-left-20 lis-bottom-20 lis-font-roboto text-white text-left"><h6 class="text-white mb-0">'+typeName+'</h6><span class="lis-font-roboto">15 events</span></div></div></div>';
                dropdown+='<option value="'+eventTypeID+'">'+typeName+'</option>';
            }
            text += '</div>';
            dropdown+='</select><div class="lis-search"> <i class="fa fa-tags lis-primary"></i> </div>';
            $("#categorydropdown").html(dropdown);
            $("#categorylist").html(text);
            $(".fullwidth-carousel-container").slick({
                infinite: true,
                dots: false,
                autoplay: true,
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: false
            });
        }
    };
    $scope.startHeroEvent = function() {
        if (validate($scope.heroes)) {
            var heroes = $scope.heroes;
            if (validate(heroes[$scope.heroPosition])) {
                var hero = "images/heroes/"+heroes[$scope.heroPosition];
                $(".background-image-maker").css({
                    "background":"#000000 url("+hero+")",
                    "-webkit-background-size":"cover",
                    "-moz-background-size":"cover",
                    "background-size":"cover"
                });
                // $("#hero-event").html('<img src="'+eventImage+'" alt="Denevents" class="img-fluid d-none">');
                $scope.heroPosition += 1;
                if ($scope.heroPosition >= $scope.eventsArray.length) {
                    $scope.heroPosition = 0;
                }
                var nextImage = new Image();
                nextImage.src = heroes[$scope.heroPosition];
                setTimeout(function() {
                    $scope.startHeroEvent();
                }, 5000);
            }
        }
    };
});
app.controller("profile", function($scope, $compile, $http) {
    $scope.userArray = [];
    $scope.getUser = function() {
        $http.get("user/getUser")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        $scope.userArray = response;
                        $scope.changeHeader();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while performing this action. Please try again later. This is the error we see: " + response);
                                break;
                            case "INVALID_USER_ID":
                                window.location = 'https://dusthq-denevents.herokuapp.com/';
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while performing this action. Please try again later.");
                });
    };
    $scope.changeHeader = function() {
        if (validate($scope.userArray)) {
            var user = $scope.userArray;
            var userName = stripslashes(user.user_name);
            var userDP = user.user_dp;
            if (!validate(userDP)) {
                userDP = 'images/defaultm.jpg';
            }
            $("#accountheader").html('<img src="' + userDP + '" class="img-circle" width=17 height=17>&nbsp;' + userName + ' <span class="caret"></span>');
            $("#accountheader").attr("href", "#");
            $("#accountheader").addClass("dropdown-toggle");
            $("#accountheader").attr("data-toggle", "dropdown");
            $("#accountheader").parent().attr("ng-init", 'savedCount=0;ticketCount=0;');
            $("#accountheader").parent().addClass("active");
            $("#accountheader").parent().append('<ul class="dropdown-menu"><li><a href="#">Tickets <span class="badge">{[{ticketCount}]}</span></a></li><li><a href="#">Saved <span class="badge">{[{savedCount}]}</span></a></li><li><a href="dashboard">Manage events</a></li><li><a href="#">Contacts</a></li><li class="active"><a href="profile">Account settings</a></li><li><a href="logout">Log out</a></li></ul>');
            $compile($("#accountheader").parent())($scope);
        }
    }
});
app.controller("event", function($scope, $http, $compile) {
    $scope.validateEvent = function() {
        var title = $.trim($("#title").val());
        if (validate(title)) {
            $("#title").parent().removeClass("has-error");
            var address = $.trim($("#address").val());
            if (validate(address)) {
                $("#address").parent().removeClass("has-error");
                var city = $.trim($("#city").val());
                if (validate(city)) {
                    $("#city").parent().removeClass("has-error");
                    var zip = $.trim($("#zip").val());
                    if (validate(zip)) {
                        $("#zip").parent().removeClass("has-error");
                        var eStart = $("#estart").val();
                        if (validate(eStart)) {
                            $("#estart").parent().removeClass("has-error");
                            var eEnd = $("#eend").val();
                            if (validate(eEnd)) {
                                $("#eend").parent().removeClass("has-error");
                                var img = document.eventcreate.eventimg.files[0];
                                if (validate(img)) {
                                    $("#eventimg").parent().removeClass("has-error");
                                    var eDesc = $.trim($("#edesc").val());
                                    if (validate(eDesc)) {
                                        $("#edesc").parent().removeClass("has-error");
                                        var orgName = $.trim($("#organizer").val());
                                        if (validate(orgName)) {
                                            $("#organizer").parent().removeClass("has-error");
                                            var eventTypeID = $("#eventtype").val();
                                            if ((validate(eventTypeID)) && (eventTypeID != -1)) {
                                                var eventTopic = $("#eventtopic").val();
                                                if ((validate(eventTopic)) && (eventTopic != -1)) {
                                                    document.eventcreate.submit();
                                                } else {
                                                    $("#eventtopic").parent().addClass("has-error");
                                                    $("#eventtopic").focus();
                                                }
                                            } else {
                                                $("#eventtype").parent().addClass("has-error");
                                                $("#eventtype").focus();
                                            }
                                        } else {
                                            $("#organizer").parent().addClass("has-error");
                                            $("#organizer").focus();
                                        }
                                    } else {
                                        $("#edesc").parent().addClass("has-error");
                                        $("#edesc").focus();
                                    }
                                } else {
                                    $("#eventimg").parent().addClass("has-error");
                                }
                            } else {
                                $("#eend").parent().addClass("has-error");
                                $("#eend").focus();
                            }
                        } else {
                            $("#estart").parent().addClass("has-error");
                            $("#estart").focus();
                        }
                    } else {
                        $("#zip").parent().addClass("has-error");
                        $("#zip").focus();
                    }
                } else {
                    $("#city").parent().addClass("has-error");
                    $("#city").focus();
                }
            } else {
                $("#address").parent().addClass("has-error");
                $("#address").focus();
            }
        } else {
            $("#title").parent().addClass("has-error");
            $("#title").focus();
        }
    };
    $scope.getEventTypes = function() {
        $http.get("events/getEventTypes")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        var eventTypes = response;
                        var text = '<select name="eventtype" id="eventtype" class="form-control"><option value="-1">Select ...</option>';
                        for (var i = 0; i < eventTypes.length; i++) {
                            var eventType = eventTypes[i];
                            var eventTypeID = eventType.idevent_type_master;
                            var eventTypeName = stripslashes(eventType.type_name);
                            text += '<option value="' + eventTypeID + '">' + eventTypeName + '</option>';
                        }
                        text += '</select>';
                        $("#eventtypes").html(text);
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while getting event types. Please try again later. This is the error we see: " + response);
                                break;
                            case "NO_EVENT_TYPES_FOUND":
                                $("#eventtypes").html('No event types found.');
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while getting event types. Please try again later.");
                });
    };
    $scope.event = null;
    $scope.event_id=null;
    $scope.getEvent = function() {
        $http.get("../events/getEvent")
            .then(function success(response) {
                    response = response.data;                    
                    if (typeof response == "object") {
                        $scope.event = response;
                        $scope.displayEvent();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while getting information about this event. Please try again later. This is the error we see: " + response);
                                break;
                            case "INVALID_EVENT_ID":
                                messageBox("Invalid Event", "This is an invalid event and doesn't exist any more.");
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while getting information about this event. Please try again later.");
                });
    };
    $scope.displayEvent = function() {
        if (validate($scope.event)) {
            var event = $scope.event;
            var eventID = event.idevent_master;
            $scope.event_id=eventID;
            var eventName = stripslashes(event.event_name);
            var eventImage = event.event_image;
            var stat = event.stat;
            var start = event.event_start;
            var end = event.event_end;
            var sp = start.split(" ");
            var sdate = dateFormat(sp[0]);
            var eventType = event.event_type_master_idevent_type_master;
            var eventPrice = event.event_price;
            var typeName = stripslashes(eventType.type_name);
            var eventTopic = event.event_topic;
            var eDesc = nl2br(stripslashes(event.event_description));
            var address = nl2br(stripslashes(event.event_address));
            var user = event.user_master_iduser_master;
            var userID = user.iduser_master;
            var userEmail=user.user_email;
            var userDP=user.user_dp;
            var userName=stripslashes(user.user_name);
            var orgName=event.event_organizer;
            var eventCity=event.event_city;
            var hits=event.hits;
            if(hits==1){
                hits=hits+' view';
            }
            else{
                hits=hits+' views';
            }
            if(!validate(userDP)){
                userDP='../images/defaultm.jpg';
            }
            $(".background-image-maker").css({
                "background": "#000000 url(" + eventImage + ") center",
                "-webkit-background-size": "cover",
                "-moz-background-size": "cover",
                "background-size": "cover"
            });
            var text='<img src="'+userDP+'" class="img-fluid d-md-flex mr-4 border border-white lis-border-width-4 rounded mb-4 mb-md-0" alt="'+eventName+'" style="width:100px;" /><div class="media-body align-self-center"><h2 class="text-white font-weight-bold lis-line-height-1">'+eventName+'</h2><p class="mb-0">'+eventTopic+'&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i> '+hits+'</p></div>';
            // var text = '<h1>' + eventName + '</h1><strong>' + typeName + '&nbsp;&bull;&nbsp;' + eventTopic + '</strong><br><small>' + sdate + ' at ' + sp[1] + '</small><div id="ticketdetails"></div>';
            $("#eventdetails").html(text);
            $("#orgdetails").html('<i class="fa fa-user-o pr-2"></i> '+orgName);
            $("#orgemail").html('<a href="#" class="text-white"><i class="fa fa-envelope pr-2"></i> '+userEmail+'</a>');
            $("#eventcity").html('<a href="#" class="text-white"><i class="fa fa-map-o pr-2"></i> '+eventCity+'</a>');
            if (stat == 1) {
                $scope.getTickets();
            } else {
                $("#ticketdetails").html('<span class="text-warning">Coming soon</span>');
            }
            $("#eventdesc").html('<p>'+eDesc+'</p>');
            var dateSpan='<dt class="col-sm-6 font-weight-normal">'+sdate+'</dt> <dd class="col-sm-6">'+sp[1]+'</dd>';
            // var dateSpan = '<span class="text-info">' + sdate + ' at ' + sp[1] + ' to ';
            sp = end.split(" ");
            var edate = dateFormat(sp[0]);
            dateSpan += '<dt class="col-sm-6 font-weight-normal">'+edate+'</dt> <dd class="col-sm-6">'+sp[1]+'</dd>';
            $("#eventdate").html(dateSpan);
            $("#ownerdetails").html('<a href="#"><img src="'+userDP+'" class="img-fluid d-flex mr-4 rounded-circle" alt="" width="70" /></a><div class="media-body align-self-center"><h6 class="mb-0"><a href="#" class="lis-dark">'+userName+'</a></h6></div>');
            $("#owneremail").html('<i class="fa fa-envelope pr-2"></i> '+userEmail);
        }
    };
    $scope.tickets = [];
    $scope.getTickets = function() {
        $http.get("../events/getTickets")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        $scope.tickets = response;
                        $("#eventreview").removeClass("disabled");
                        $("#eventreview").click(function() {
                            window.location = '../events/publish';
                        });
                        $scope.displayTickets();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while trying to load ticket information. Please try again later. This is the error we see: " + response);
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
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while trying to load ticket information. Please try again later.");
                });
    };
    $scope.displayTickets = function() {
        if (validate($scope.tickets)) {
            var tickets = $scope.tickets;
            // var text = '<table class="table"><thead><tr><th>Ticket name</th><th>Price</th></tr></thead><tbody>';
            var text='<div class="card-body p-4">';
            for (var i = 0; i < tickets.length; i++) {
                var ticket = tickets[i];
                var ticketID = ticket.idticket_master;
                var ticketName = stripslashes(ticket.ticket_name);
                var price = ticket.ticket_cost;
                // text += '<tr><td>' + ticketName + '</td><td>' + price + '</td></tr>';
                text += '<div class="media d-block d-md-flex text-left"><div class="media-body align-self-center mt-sm-0 mt-3"><div class="float-none float-sm-right"> <a href="javascript:void(0)" class="btn btn-primary btn-default mb-1"> Book Now</a><p class="mb-0 mt-sm-0 mt-3">Entry Pass: <span class="lis-font-weight-500 lis-dark lis-font-poppins lis-font-weight-600">kr. '+price+'</span></p></div><p class="lis-dark mb-0 mt-2 mt-md-0">'+ticketName+'</div></div><div class="lis-devider my-4"></div>';
            }
            // text += '</tbody></table>';
            text += '</div>';
            $("#ticketdetails").html(text);
        }
    };
    $scope.showTicketList = function() {
        if ($scope.tickets.length > 0) {
            var text = '<table class="table"><thead><tr><th>Type</th><th>Price</th><th>Quantity</th></tr></thead><tbody>';
            for (var i = 0; i < $scope.tickets.length; i++) {
                var ticket = $scope.tickets[i];
                console.log(ticket);
                var ticketID = ticket.idticket_master;
                var ticketName = stripslashes(ticket.ticket_name);
                var quantity = parseInt(ticket.ticket_count);
                var cost = ticket.ticket_cost;
                text += '<tr><td>' + ticketName + '</td><td>' + cost + '</td><td><select id="ticket' + ticketID + '">';
                for (var j = 0; j <= quantity; j++) {
                    text += '<option value="' + j + '">' + j + '</option>';
                }
                text += '</select></td></tr>';
            }
            text += '</tbody></table><hr><button type="button" class="btn btn-primary" id="paybut" ng-click="purchaseTickets()">Buy</button><div id="ticketform"></div>';
            messageBox("Tickets", text);
            $compile("#myModal")($scope);
        } else {
            messageBox("Coming Soon", "This event hasn't been published yet.");
        }
    };
    $scope.getLoginStatus=function(){
        $http.get("/getLoginStatus")
        .then(function success(response){
            response=$.trim(response.data);
            switch(response){
                case "INVALID_PARAMETERS":
                default:
                messageBox("Problem","Something went wrong while loading some information. Please try again later. This is the error we see: "+response);
                break;
                case "USER_AUTHENTICATED":
                $scope.loginFlag=true;
                break;
                case "USER_NOT_AUTHENTICATED":
                $scope.loginFlag=false;
                break;
            }
        },
        function error(response){
            console.log(response);
            messageBox("Problem","Something went wrong while trying to load some information. Please try again later.");
        });
    };
    $scope.loginFlag=false;
    $scope.purchaseTickets = function() {
        if($scope.loginFlag){
            if ($scope.tickets.length > 0) {
                var ticketToBuy = [];
                var total = 0;
                for (var i = 0; i < $scope.tickets.length; i++) {
                    var ticket = $scope.tickets[i];
                    var ticketID = ticket.idticket_master;
                    var ticketCount = parseInt($("#ticket" + ticketID).val());
                    if (ticketCount > 0) {
                        var tick = [parseInt(ticketID), ticketCount];
                        ticketToBuy.push(tick);
                    }
                    var price = parseFloat(ticket.ticket_cost)*ticketCount;
                    total += price;
                }
                if (ticketToBuy.length > 0) {
                    var json = JSON.stringify(ticketToBuy);
                    $("#paybut").css("display", "none");
                    $("#ticketform").html('<form name="ticketform" method="post" action="../book/purchaseTickets"><input type="hidden" name="tickets" value="' + json + '"><input type="hidden" name="total" value="' + total + '"><script src="https://checkout.stripe.com/checkout.js" class="stripe-button" data-key="pk_test_AaNN3vmVBn3clhgdqGa9CMXX" data-amount="' + (total * 100) + '" data-name="Denevents" data-description="Widget" data-image="https://stripe.com/img/documentation/checkout/marketplace.png" data-locale="auto"> </script></form>');
                }
                // document.ticketform.submit();
            }
        }
        else{
            window.location='../login';
        }
    };
    $scope.validateTicket = function() {
        var tname = $.trim($("#tname").val());
        if (validate(tname)) {
            $("#tname").parent().removeClass("has-error");
            var tcount = $("#quan").val();
            if ((validate(tcount)) && (tcount > 0)) {
                $("#quan").parent().removeClass("has-error");
                var price = $("#price").val();
                if ((validate(price)) && (price >= 0)) {
                    $("#price").parent().removeClass("has-error");
                    document.ticketcreate.submit();
                } else {
                    $("#price").parent().addClass("has-error");
                }
            } else {
                $("#quan").parent().addClass("has-error");
            }
        } else {
            $("#tname").parent().addClass("has-error");
        }
    };
});
app.controller("dashboard", function($scope, $compile, $http) {
    $scope.eventArray = [];
    $scope.getEvents = function() {
        $http.get("events/getEvents?user_id=1")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        $scope.eventArray = response;
                        $scope.eventCount = $scope.eventArray.length;
                        $scope.displayEvents();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while getting the list of events you've created. Please try again later. This is the error we see: " + response);
                                break;
                            case "NO_EVENTS_FOUND":
                                $("#eventlist").html('<p>No events created.</p>');
                                break;
                            case "INVALID_USER_ID":
                                window.location = "logout";
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while getting list of events you've created. Please try again later.");
                });
    };
    $scope.displayEvents = function() {
        if (validate($scope.eventArray)) {
            var events = $scope.eventArray;
            var text = '<div class="row">';
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var eventID = event.idevent_master;
                var eventName = stripslashes(event.event_name);
                var eventImage = event.event_image;
                var eventType = event.event_type_master_idevent_type_master;
                var typeName = stripslashes(eventType.type_name);
                var stat = event.stat;
                text += '<div class="col-md-4"><div class="thumbnail"><a href="#"><img src="' + eventImage + '" alt="' + eventName + '" class="img-responsive" style="width:250px;"><div class="caption"><p class="text-center"><strong>' + eventName + '</strong><br><span class="text-info">' + typeName + '</span><br><div class="text-center"><div class="btn-group"><button type="button" class="btn btn-primary btn-xs" onclick="window.location=\'createTickets/' + eventID + '\';">View tickets</button>';
                if (stat == 2) {
                    text += '<button type="button" class="btn btn-warning btn-xs" onclick="window.location=\'events/publish?event_id=' + eventID + '\';">Publish event</button>';
                }
                text += '<button type="button" class="btn btn-danger btn-xs" ng-click="deleteEvent(' + eventID + ')">Delete</button></div></div></p></div></a></div></div>';
            }
            text += '</div>';
            $("#eventlist").html(text);
            $compile("#eventlist")($scope);
        }
    };
    $scope.deleteEvent = function(eventID) {
        if (confirm("Are you sure you want to delete this event?")) {
            window.location = 'events/delete?event_id=' + eventID;
        }
    };
    $scope.userArray = [];
    $scope.getUser = function() {
        $http.get("user/getUser")
            .then(function success(response) {
                    response = response.data;
                    if (typeof response == "object") {
                        $scope.userArray = response;
                        $scope.changeHeader();
                    } else {
                        response = $.trim(response);
                        switch (response) {
                            case "INVALID_PARAMETERS":
                            default:
                                messageBox("Problem", "Something went wrong while performing this action. Please try again later. This is the error we see: " + response);
                                break;
                            case "INVALID_USER_ID":
                                window.location = 'https://dusthq-denevents.herokuapp.com/';
                                break;
                        }
                    }
                },
                function error(response) {
                    console.log(response);
                    messageBox("Problem", "Something went wrong while performing this action. Please try again later.");
                });
    };
    $scope.changeHeader = function() {
        if (validate($scope.userArray)) {
            var user = $scope.userArray;
            var userName = stripslashes(user.user_name);
            var userDP = user.user_dp;
            if (!validate(userDP)) {
                userDP = 'images/defaultm.jpg';
            }
            $("#accountheader").html('<img src="' + userDP + '" class="img-circle" width=17 height=17>&nbsp;' + userName + ' <span class="caret"></span>');
            $("#accountheader").attr("href", "#");
            $("#accountheader").addClass("dropdown-toggle");
            $("#accountheader").attr("data-toggle", "dropdown");
            $("#accountheader").parent().attr("ng-init", 'savedCount=0;ticketCount=0;');
            $("#accountheader").parent().addClass("active");
            $("#accountheader").parent().append('<ul class="dropdown-menu"><li><a href="#">Tickets <span class="badge">{[{ticketCount}]}</span></a></li><li><a href="#">Saved <span class="badge">{[{savedCount}]}</span></a></li><li><a href="dashboard">Manage events</a></li><li><a href="#">Contacts</a></li><li><a href="profile">Account settings</a></li><li><a href="logout">Log out</a></li></ul>');
            $compile($("#accountheader").parent())($scope);
        }
    }
});

function loadImagePreview() {
    var image = document.eventcreate.eventimg.files[0];
    if (validate(image)) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#imgpreview').css({
                "background": "#ffffff url(" + e.target.result + ") center",
                "-webkit-background-size": "cover",
                "-moz-background-size": "cover",
                "background-size": "cover"
            });
        };
        reader.readAsDataURL(image);
    }
}