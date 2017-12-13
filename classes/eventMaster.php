<?php
/*------------------------------------------
Author: Anoop Santhanam
Date created: 13/12/17 20:13
Last modified: 13/12/17 20:13
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
            $em="SELECT event_type_master_idevent_type_master,user_master_iduser_master FROM event_master WHERE stat='1' AND idevent_master='$eventID'";
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
    function getEvents($offset=0,$eventTypeID=NULL)
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
            $em="SELECT idevent_master FROM event_master WHERE stat='1' ";
            if($eventTypeID!=NULL)
            {
                $em.="AND event_type_master_idevent_type_master='$eventTypeID' ";
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
}
?>