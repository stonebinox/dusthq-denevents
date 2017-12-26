<?php
ini_set('display_errors', 1);
function validate($object)
{
    if(($object!="")&&($object!=NULL))
    {
        return true;
    }
    return false;
}
function secure($string)
{
    return addslashes(htmlentities($string));
}
require_once __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../src/app.php';
require __DIR__.'/../config/prod.php';
require __DIR__.'/../src/controllers.php';
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;
$s3Client = new S3Client([
    'region' => 'us-east-2',
    'version' => 'latest'
]);
$app->register(new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => 'php://stderr',
));
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views',
));
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
      'driver' => 'pdo_mysql',
      'dbname' => 'heroku_8eeaf2b3ee2d258',
      'user' => 'bd077256ef5d4c',
      'password' => '4189a909',
      'host'=> "us-cdbr-iron-east-05.cleardb.net",
    )
));
$app->register(new Silex\Provider\SessionServiceProvider, array(
    'session.storage.save_path' => dirname(__DIR__) . '/tmp/sessions'
));
$app->before(function(Request $request) use($app){
    return $request->getSession()->start();
});
$app->get("/",function() use($app){
    return $app['twig']->render("index.html.twig");
});
$app->get("/home",function() use($app){
    return $app['twig']->render("index2.html.twig");
});
$app->get("/events/getEvents",function(Request $request) use($app){
    require("../classes/adminMaster.php");
    require("../classes/userMaster.php");
    require("../classes/eventTypeMaster.php");
    require("../classes/eventMaster.php");
    $event=new eventMaster;
    $offset=0;
    $eventTypeID=NULL;
    $userID=NULL;
    if($request->get("offset"))
    {
        $offset=$request->get("offset");
    }
    if($request->get("event_type_id"))
    {
        $eventTypeID=$request->get("event_type_id");
    }
    if(($request->get("user_id"))&&($app['session']->get("uid")))
    {
        $userID=$app['session']->get("uid");
    }
    $events=$event->getEvents($offset,$eventTypeID,$userID);
    if(is_array($events))
    {
        return json_encode($events);
    }
    return $events;
});
$app->get("/events/getEventTypes",function() use($app){
    require("../classes/adminMaster.php");
    require("../classes/userMaster.php");
    require("../classes/eventTypeMaster.php");
    $eventType=new eventTypeMaster;
    $eventTypes=$eventType->getEventTypes();
    if(is_array($eventTypes))
    {
        return json_encode($eventTypes);
    }
    return $eventTypes;
});
$app->get("/login",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app->redirect("/dashboard");
    }
    return $app['twig']->render("login.html.twig");
});
$app->post("/login_action",function(Request $request) use($app){
    if(($request->get("email"))&&($request->get("password")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster;
        $auth=$user->authenticateUser($request->get("email"),$request->get("password"));
        if($auth=="AUTHENTICATE_USER")
        {
            if($app['session']->get("event_id"))
            {
                return $app->redirect("/event/".$app['session']->get("event_id"));
            }
            return $app->redirect("/");
        }
        else
        {
            return $app->redirect("/login?err=".$auth);
        }
    }
    else
    {
        return $app->redirect("/login?err=INVALID_CREDENTIALS");
    }
});
$app->get("/getLoginStatus",function() use($app){
    if($app['session']->get("uid"))
    {
        return "USER_AUTHENTICATED";
    }
    else
    {
        return "USER_NOT_AUTHENTICATED";
    }
});
$app->get("/profile",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app['twig']->render("profile.html.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("/registration",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app->redirect("/profile");
    }
    else
    {
        return $app['twig']->render("registration.html.twig");
    }
});
$app->post("/create_action",function(Request $request) use($app){
    if(($request->get("email"))&&($request->get("name"))&&($request->get("password"))&&($request->get("rpassword")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster;
        $response=$user->createAccount($request->get("name"),$request->get("email"),$request->get("password"),$request->get("rpassword"));
        if($response=="ACCOUNT_CREATED")
        {
            return $app->redirect("/login?suc=".$response);
        }
        else
        {
            return $app->redirect("/registration?err=".$response);
        }
    }
    else
    {
        return $app->redirect("/registration");
    }
});
$app->get("/user/getUser",function() use($app){
    if($app['session']->get("uid"))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster($app['session']->get("uid"));
        $userData=$user->getUser();
        if(is_array($userData))
        {
            return json_encode($userData);
        }
        return $userData;
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/logout",function() use($app){
    if($app['session']->get("uid"))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        $user=new userMaster($app['session']->get("uid"));
        $response=$user->logout();
        return $app->redirect("/");
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/createEvent",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app['twig']->render("event.html.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->post("/events/createEvent",function(Request $request) use($app){
    if(($request->get("title"))&&($request->get("eventtype")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        $event=new eventMaster;
        $response=$event->createEvent($app['session']->get("uid"),$request->get("title"),$request->get("address"),$request->get("city"),$request->get("zip"),$request->get("estart"),$request->get("eend"),$request->files->get("eventimg"),$request->get("edesc"),$request->get("organizer"),$request->get("eventtype"),$request->get("eventtopic"),$request->get("privacy"));
        if(strpos($response,"EVENT_ADDED")!==false){
            $e=explode("EVENT_ADDED_",$response);
            $eventID=trim($e[1]);
            return $app->redirect("/createTickets/".$eventID);
        }
        else{
            return $app->redirect("/createEvent?err=".$response);
        }
    }
    else
    {
        return $app->redirect("/createEvent?err=INVALID_PARAMETERS");
    }
});
$app->get("/createTickets/{eventID}",function($eventID) use($app){
    if($app['session']->get("uid"))
    {
        $app['session']->set("event_id",$eventID);
        return $app['twig']->render("tickets.html.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->post("/events/addTickets",function(Request $request) use($app){
    if(($app['session']->get("event_id"))&&($request->get("tname")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        require("../classes/ticketMaster.php");
        $ticket=new ticketMaster;
        $response=$ticket->addTicket($app['session']->get("event_id"),$request->get("tname"),$request->get("quan"),1,$request->get("price"));
        if($response=="TICKET_ADDED")
        {
            return $app->redirect("/createTickets/".$app['session']->get("event_id")."?suc=TICKETS_ADDED");
        }
        else
        {
            return $app->redirect("/createTickets/".$app['session']->get("event_id")."?err=".$response);
        }
    }
    else
    {
        return $app->redirect("/createTickets/".$app['session']->get("event_id")."?err=INVALID_PARAMETERS");
    }
});
$app->get("/events/getTickets",function() use($app){
    if($app['session']->get("event_id"))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        require("../classes/ticketMaster.php");
        $ticket=new ticketMaster;
        $tickets=$ticket->getTickets($app['session']->get("event_id"));
        if(is_array($tickets))
        {
            return json_encode($tickets);
        }
        return $tickets;
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/dashboard",function() use($app){
    if($app['session']->get("uid"))
    {
        return $app['twig']->render("dashboard.html.twig");
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->get("/event/{eventID}",function($eventID) use($app){
    $app['session']->set("event_id",$eventID);
    return $app['twig']->render("eventview.html.twig");
});
$app->get("/events/getEvent",function() use($app){
    if($app['session']->get("event_id"))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        $event=new eventMaster($app['session']->get("event_id"));
        $eventData=$event->getEvent();
        if(is_array($eventData))
        {
            return json_encode($eventData);
        }
        return $eventData;
    }
    else
    {
        return "INVALID_PARAMETERS";
    }
});
$app->get("/events/publish",function(Request $request) use($app){
    if($app['session']->get("event_id"))
    {
        $eventID=$app['session']->get("event_id");
    }
    elseif($request->get("event_id"))
    {
        $eventID=$request->get("event_id");
    }
    if(validate($eventID))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        $event=new eventMaster($eventID);
        $response=$event->publishEvent($app['session']->get("uid"));
        if($response=="EVENT_PUBLISHED")
        {
            return $app->redirect("/dashboard?suc=".$response);
        }
        else
        {
            return $app->redirect("/dashboard?err=".$response);
        }
    }
    else
    {
        return $app->redirect("/dashboard");
    }
});
$app->get("/events/delete",function(Request $request) use($app){
    if($app['session']->get("event_id"))
    {
        $eventID=$app['session']->get("event_id");
    }
    elseif($request->get("event_id"))
    {
        $eventID=$request->get("event_id");
    }
    if(validate($eventID))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        $event=new eventMaster($eventID);
        $response=$event->deleteEvent($app['session']->get("uid"));
        if($response=="EVENT_DELETED")
        {
            return $app->redirect("/dashboard?suc=".$response);
        }
        else
        {
            return $app->redirect("/dashboard?err=".$response);
        }
    }
    else
    {
        return $app->redirect("/dashboard");
    }
});
$app->post("/book/purchaseTickets",function(Request $request) use($app){
    if(($app['session']->get("uid"))&&($request->get("tickets"))&&($request->get("total")))
    {
        require("../classes/adminMaster.php");
        require("../classes/userMaster.php");
        require("../classes/eventTypeMaster.php");
        require("../classes/eventMaster.php");
        require("../classes/ticketMaster.php");
        require("../classes/bookingMaster.php");
        $booking=new bookingMaster;
        $response=$booking->processPayment();
        if($response=="PAYMENT_PROCESSED")
        {
            $tickets=json_decode($request->get("tickets"),true);
            foreach($tickets as $ticket)
            {
                $response=$booking->addBooking($app['session']->get("uid"),$ticket[0],$ticket[1]);
            }
            return $app->redirect("/dashboard?suc=BOOKING_DONE");
        }
        else
        {
            return $app->redirect("/?err=".$response);
        }
    }
    else
    {
        return $app->redirect("/login");
    }
});
$app->run();
?>