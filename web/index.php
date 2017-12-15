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
$app->get("/events/getEvents",function() use($app){
    require("../classes/adminMaster.php");
    require("../classes/userMaster.php");
    require("../classes/eventTypeMaster.php");
    require("../classes/eventMaster.php");
    $event=new eventMaster;
    $events=$event->getEvents();
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
        return $app->redirect("/profile");
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
        $response=$event->createEvent($app['session']->get("uid"),$request->get("title"),$request->get("address"),$request->get("city"),$request->get("zip"),$request->get("estart"),$request->get("eend"),$request->files->get("eventimg"),$request->get("desc"),$request->get("organizer"),$request->get("eventtype"),$request->get("eventtopic"),$request->get("privacy"));
        return $response;
    }
    else
    {
        return $app->redirect("/createEvent?err=INVALID_PARAMETERS");
    }
});
$app->run();
?>