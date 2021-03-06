<?php
/*------------------------------------------
Author: Anoop Santhanam
Date created: 13/12/17 20:13
Last modified: 18/12/17 10:50
Comments: Main class file for event_master
table.
------------------------------------------*/
class eventMaster extends eventTypeMaster
{
    public $app=NULL;
    private $event_id=NULL;
    public $eventValid=false;
    function __construct($eventID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($eventID!=NULL)
        {
            $this->event_id=addslashes(htmlentities($eventID));
            $this->eventValid=$this->verifyEvent();
        }
    }
    function verifyEvent()
    {
        if($this->event_id!=NULL)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $em="SELECT event_type_master_idevent_type_master,user_master_iduser_master FROM event_master WHERE stat!='0' AND idevent_master='$eventID'";
            $em=$app['db']->fetchAssoc($em);
            if(($em!="")&&($em!=NULL))
            {
                $eventTypeID=$em['event_type_master_idevent_type_master'];
                eventTypeMaster::__construct($eventTypeID);
                if($this->eventTypeValid)
                {
                    $userID=$em['user_master_iduser_master'];
                    userMaster::__construct($userID);
                    if($this->userValid)
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return false;
            }

        }
        else
        {
            return false;
        }
    }
    function getEvent()
    {
        if($this->eventValid)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $em="SELECT * FROM event_master WHERE idevent_master='$eventID'";
            $em=$app['db']->fetchAssoc($em);
            if(($em!="")&&($em!=NULL))
            {
                $eventTypeID=$em['event_type_master_idevent_type_master'];
                eventTypeMaster::__construct($eventTypeID);
                $eventType=$this->getEventType();
                if(is_array($eventType))
                {
                    $em['event_type_master_idevent_type_master']=$eventType;
                }
                $userID=$em['user_master_iduser_master'];
                userMaster::__construct($userID);
                $user=$this->getUser();
                if(is_array($user))
                {
                    $em['user_master_iduser_master']=$user;
                }
                return $em;
            }
            else
            {
                return "INVALID_EVENT_ID";
            }
        }  
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function getEvents($offset=0,$eventTypeID=NULL,$userID=NULL)
    {
        $app=$this->app;
        $offset=addslashes(htmlentities($offset));
        if(($offset!="")&&($offset!=NULL)&&(is_numeric($offset))&&($offset>=0))
        {
            if($eventTypeID!=NULL)
            {
                $eventTypeID=addslashes(htmlentities($eventTypeID));
                eventTypeMaster::__construct($eventTYpeID);
                if(!$this->eventTypeValid)
                {
                    return "INVALID_EVENT_TYPE_ID";
                }
            }
            if($userID!=NULL)
            {
                $userID=addslashes(htmlentities($userID));
                userMaster::__construct($userID);
                if(!$this->userValid)
                {
                    return "INVALID_USER_ID";
                }
            }
            $em="SELECT idevent_master FROM event_master WHERE stat!='0' ";
            if($eventTypeID!=NULL)
            {
                $em.="AND event_type_master_idevent_type_master='$eventTypeID' ";
            }
            if($userID!=NULL)
            {
                $em.="AND user_master_iduser_master='$userID' ";
            }
            $em.="ORDER BY idevent_master DESC LIMIT $offset,20";
            $em=$app['db']->fetchAll($em);
            $eventArray=array();
            for($i=0;$i<count($em);$i++)
            {
                $eventRow=$em[$i];
                $eventID=$eventRow['idevent_master'];
                $this->__construct($eventID);
                $event=$this->getEvent();
                if(is_array($event))
                {
                    array_push($eventArray,$event);
                }
            }
            if(count($eventArray)>0)
            {
                return $eventArray;
            }
            return "NO_EVENTS_FOUND";
        }
        else
        {
            return "INVALID_OFFSET_VALUE";
        }
    }
    function randomizeString($string)
    {
        $letters='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        $random='';
        for($i=0;$i<strlen($string);$i++)
        {
            $random.=$letters[rand(0,strlen($letters))];
        }
        return $random;
    }
    function createEvent($userID,$title,$address,$city,$zip,$eStart,$eEnd,$image,$description,$orgName,$eventTypeID,$eventTopic,$privacy=0)
    {
        $app=$this->app;
        $userID=secure($userID);
        userMaster::__construct($userID);
        if($this->userValid)
        {
            $title=trim(secure($title));
            if(($title!="")&&($title!=NULL))
            {
                $address=trim(secure($address));
                if(validate($address))
                {
                    $city=trim(secure($city));
                    if(validate($city))
                    {
                        $zip=trim(secure($zip));
                        if(validate($zip))
                        {
                            $eStart=trim(secure($eStart));
                            if(validate($eStart))
                            {
                                $eEnd=trim(secure($eEnd));
                                if(validate($eEnd))
                                {
                                    $description=trim(secure($description));
                                    if(validate($description))
                                    {
                                        $orgName=trim(secure($orgName));
                                        if(validate($orgName))
                                        {
                                            $eventTypeID=secure($eventTypeID);
                                            eventTypeMaster::__construct($eventTypeID);
                                            if($this->eventTypeValid)
                                            {
                                                $eventTopic=trim(secure($eventTopic));
                                                if(validate($eventTopic))
                                                {
                                                    $s3Client=$GLOBALS['s3Client'];
                                                    $file=$image->getRealPath();
                                                    $itemName=secure($image->getClientOriginalName());
                                                    $rev=strrev($itemName);
                                                    $e=explode(".",$rev);
                                                    $ext=strrev(trim(strtolower($e[0])));
                                                    if(($ext=="jpg")||($ext=="jpeg")||($ext=="bmp")||($ext=="png"))
                                                    {
                                                        $filename=strrev($e[1]);
                                                        $random=$this->randomizeString($filename).'.'.$ext;
                                                        try{
                                                            $result = $s3Client->putObject([
                                                                'ACL'        => 'public-read',
                                                                'Bucket'     => "denevents",
                                                                'Key'        => $random,
                                                                'SourceFile' => $file,
                                                            ]);
                                                        } catch (Exception $e) {
                                                            return $e->getMessage();
                                                        }
                                                        $path=$result->get('ObjectURL');
                                                        $in="INSERT INTO event_master (timestamp,user_master_iduser_master,event_name,event_description,event_image,event_type_master_idevent_type_master,event_start,event_end,event_organizer,event_address,event_city,event_privacy,event_topic,stat) VALUES (NOW(),'$userID','$title','$description','$path','$eventTypeID','$eStart','$eEnd','$orgName','$address','$city','$privacy','$eventTopic','2')";
                                                        $in=$app['db']->executeQuery($in);
                                                        $em="SELECT idevent_master FROM event_master WHERE stat='2' AND user_master_iduser_master='$userID' ORDER BY idevent_master DESC LIMIT 1";
                                                        $em=$app['db']->fetchAssoc($em);
                                                        $eventID=$em['idevent_master'];
                                                        return "EVENT_ADDED_".$eventID;
                                                    }
                                                    else
                                                    {
                                                        return "INVALID_EVENT_IMAGE_TYPE";
                                                    }
                                                }
                                                else
                                                {
                                                    return "INVALID_EVENT_TOPIC";
                                                }
                                            }
                                            else
                                            {
                                                return "INVALID_EVENT_TYPE_ID";
                                            }
                                        }
                                        else
                                        {
                                            return "INVALID_EVENT_ORGANIZER";
                                        }
                                    }
                                    else
                                    {
                                        return "INVALID_EVENT_DESCRIPTION";
                                    }
                                }
                                else
                                {
                                    return "INVALID_EVENT_END_DATE";
                                }
                            }
                            else
                            {
                                return "INVALID_EVENT_START_DATE";
                            }
                        }
                        else
                        {
                            return "INVALID_EVENT_ZIP";
                        }
                    }
                    else
                    {
                        return "INVALID_EVENT_CITY";
                    }
                }
                else
                {
                    return "INVALID_EVENT_ADDRESS";
                }
            }
            else
            {
                return "INVALID_EVENT_TITLE";
            }
        }
    }
    function publishEvent($userID)
    {
        if($this->eventValid)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $userID=secure($userID);
            userMaster::__construct($userID);
            if($this->userValid)
            {
                $eventOwner=$this->getEventOwner();
                if($eventOwner==$userID)
                {
                    $em="UPDATE event_master SET stat='1' WHERE idevent_master='$eventID'";
                    $em=$app['db']->executeUpdate($em);
                    return "EVENT_PUBLISHED";
                }
                else
                {
                    return "NO_PERMISSION";
                }
            }
            else
            {
                return "INVALID_USER_ID";
            }
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function getEventOwner()
    {
        if($this->eventValid)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $em="SELECT user_master_iduser_master FROM event_master WHERE idevent_master='$eventID'";
            $em=$app['db']->fetchAssoc($em);
            if(validate($em))
            {
                return $em['user_master_iduser_master'];
            }
            else
            {
                return "INVALID_EVENT_ID";
            }
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function deleteEvent($userID)
    {
        if($this->eventValid)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $userID=secure($userID);
            userMaster::__construct($userID);
            if($this->userValid)
            {
                $eventOwner=$this->getEventOwner();
                if($eventOwner==$userID)
                {
                    $em="UPDATE event_master SET stat='0' WHERE idevent_master='$eventID'";
                    $em=$app['db']->executeUpdate($em);
                    return "EVENT_DELETED";
                }
                else
                {
                    return "NO_PERMISSION";
                }
            }
            else
            {
                return "INVALID_USER_ID";
            }
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function searchEvents($search)
    {
        $app=$this->app;
        $search=trim(secure($search));
        $em="SELECT idevent_master FROM event_master WHERE stat!='0' AND (";
        $e=explode(" ",$search);
        foreach($e as $word)
        {
            $word=trim($word);
            $em.="event_name LIKE '%$word%' OR event_description LIKE '%$word%' OR event_organizer LIKE '%$word%' OR event_address LIKE '%$word%' OR event_city LIKE '%$word%' OR event_topic LIKE '%$word%' OR ";
        }
        $em=rtrim($em,"OR ");
        $em.=") ORDER BY hits DESC LIMIT 10";
        $em=$app['db']->fetchAll($em);
        $eventArray=array();
        foreach($em as $eventRow)
        {
            $eventID=$eventRow['idevent_master'];
            $this->__construct($eventID);
            $event=$this->getEvent();
            if(is_array($event))
            {
                array_push($eventArray,$event);
            }
        }
        if(count($eventArray)>0)
        {
            return $eventArray;
        }
        else
        {
            return "NO_EVENTS_FOUND";
        }
    }
    function getEventHits()
    {
        if($this->eventValid)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $em="SELECT hits FROM event_master WHERE idevent_master='$eventID'";
            $em=$app['db']->fetchAssoc($em);
            if(validate($em))
            {
                return $em['hits'];
            }
            else
            {
                return "INVALID_EVENT_ID";
            }
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function hitEvent()
    {
        if($this->eventValid)
        {
            $app=$this->app;
            $eventID=$this->event_id;
            $hits=$this->getEventHits()+1;
            $up="UPDATE event_master SET hits='$hits' WHERE idevent_master='$eventID'";
            $up=$app['db']->executeUpdate($up);
            return "EVENT_HITS_UPDATED";
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
}
?>