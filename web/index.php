<?php

ini_set('display_errors', 1);
require_once __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../src/app.php';
require __DIR__.'/../config/prod.php';
require __DIR__.'/../src/controllers.php';
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
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
        $auth=$user->authenticateUser($request->get("user"),$request->get("password"));
        if($auth=="AUTHENTICATE_USER")
        {
            return $app->redirect("/profile");
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
$app->run();
?>