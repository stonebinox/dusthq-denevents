<?php
/*----------------------------------
Author: Anoop Santhanam
Date created: 13/12/17 20:05
Last modified: 13/12/17 20:05
Comments: Main class file for
event_type_master table.
----------------------------------*/
class eventTypeMaster extends userMaster
{
    public $app=NULL;
    private $event_type_id=NULL;
    public $eventTypeValid=false;
    function __construct($eventTypeID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if($eventTypeID!=NULL)
        {
            $this->event_type_id=addslashes(htmlentities($eventTypeID));
            $this->eventTypeValid=$this->verifyEventType();
        }
    }
    function verifyEventType()
    {
        if($this->event_type_id!=NULL)
        {
            $app=$this->app;
            $eventTypeID=$this->event_type_id;
            $etm="SELECT idevent_type_master FROM event_type_master WHERE stat='1' AND idevent_type_master='$eventTypeID'";
            $etm=$app['db']->fetchAssoc($etm);
            if(($etm!="")&&($etm!=NULL))
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
    function getEventType()
    {
        if($this->eventTypeValid)
        {
            $app=$this->app;
            $eventTypeID=$this->event_type_id;
            $etm="SELECT * FROM event_type_master WHERE stat='1' AND idevent_type_master='$eventTypeID'";
            $etm=$app['db']->fetchAssoc($etm);
            if(($etm!="")&&($etm!=NULL))
            {
                return $etm;
            }
            else
            {
                return "INVALID_EVENT_TYPE_ID";
            }
        }
        else
        {
            return "INVALID_EVENT_TYPE_ID";
        }
    }
    function getEventTypes()
    {
        $app=$this->app;
        $etm="SELECT idevent_type_master FROM event_type_master WHERE stat='1' ORDER BY type_name ASC";
        $etm=$app['db']->fetchAll($etm);
        $eventTypeArray=array();
        for($i=0;$i<count($etm);$i++)
        {
            $eventTypeRow=$eventTypeArray[$i];
            $eventTypeID=$eventTypeRow['idevent_type_master'];
            $this->__construct($eventTypeID);
            $eventType=$this->getEventType();
            if(is_array($eventType))
            {
                array_push($eventTypeArray,$eventType);
            }
        }
        if(count($eventTypeArray)>0)
        {
            return $eventTypeArray;
        }
        else
        {
            return "NO_EVENT_TYPES_FOUND";
        }
    }
}
?>