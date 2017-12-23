<?php
/*------------------------------
Author: Anoop Santhanam
Date created: 14/12/17 14:29
Last modified: 14/12/17 14:29
Comments: Main class file for
ticket_master table.
------------------------------*/
class ticketMaster extends eventMaster
{
    public $app=NULL;
    private $ticket_id=NULL;
    public $ticketValid=false;
    function __construct($ticketID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if(validate($ticketID))
        {
            $this->ticket_id=secure($ticketID);
            $this->ticketValid=$this->verifyTicket();
        }
    }
    function verifyTicket()
    {
        if(validate($this->ticket_id))
        {
            $app=$this->app;
            $ticketID=$this->ticket_id;
            $tm="SELECT event_master_idevent_master FROM ticket_master WHERE stat='1' AND idticket_master='$ticketID'";
            $tm=$app['db']->fetchAssoc($tm);
            if(validate($tm))
            {
                $eventID=$tm['event_master_idevent_master'];
                eventMaster::__construct($eventID);
                if($this->eventValid)
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
    function addTicket($eventID,$ticketName,$ticketCount,$ticketType,$ticketCost=0)
    {
        $app=$this->app;
        $eventID=secure($eventID);
        eventMaster::__construct($eventID);
        if($this->eventValid)
        {
            $ticketName=trim(secure($ticketName));
            if(validate($ticketName))
            {
                $ticketCount=trim(secure($ticketCount));
                if((validate($ticketCount))&&(is_numeric($ticketCount))&&($ticketCount>0))
                {
                    $ticketType=secure($ticketType);
                    if(($ticketType==1)||($ticketType==2))
                    {
                        $ticketCost=secure($ticketCost);
                        if((validate($ticketCost))&&(is_numeric($ticketCost))&&($ticketCost>=0))
                        {
                            $tm="SELECT idticket_master FROM ticket_master WHERE stat='1' AND event_master_idevent_master='$eventID' AND ticket_type='$ticketType'";
                            $tm=$app['db']->fetchAssoc($tm);
                            if(!validate($tm))
                            {
                                $in="INSERT INTO ticket_master (timestamp,event_master_idevent_master,ticket_count,ticket_type,ticket_cost,ticket_name) VALUES (NOW(),'$eventID','$ticketCount','$ticketType','$ticketCost','$ticketName')";
                                $in=$app['db']->executeQuery($in);
                                return "TICKET_ADDED";
                            }
                            else
                            {
                                return "TICKET_TYPE_ALREADY_ADDED";
                            }
                        }
                        else
                        {
                            return "INVALID_TICKET_COST";
                        }
                    }
                    else
                    {
                        return "INVALID_TICKET_TYPE";
                    }
                }
                else
                {
                    return "INVALID_TICKET_COUNT";
                }
            }
            else
            {
                return "INVALID_TICKET_NAME";
            }
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function getTicket()
    {
        if($this->ticketValid)
        {
            $app=$this->app;
            $ticketID=$this->ticket_id;
            $tm="SELECT * FROM ticket_master WHERE idticket_master='$ticketID'";
            $tm=$app['db']->fetchAssoc($tm);
            if(validate($tm))
            {
                $eventID=$tm['event_master_idevent_master'];
                eventMaster::__construct($eventID);
                $event=$this->getEvent();
                if(is_array($event))
                {
                    $tm['event_master_idevent_master']=$event;
                }
                return $tm;
            }
            else
            {
                return "INVALID_TICKET_ID";
            }
        }
        else
        {
            return "INVALID_TICKET_ID";
        }
    }
    function getTickets($eventID)
    {
        $app=$this->app;
        $eventID=secure($eventID);
        eventMaster::__construct($eventID);
        if($this->eventValid)
        {
            $tm="SELECT idticket_master FROM ticket_master WHERE stat='1' AND event_master_idevent_master='$eventID'";
            $tm=$app['db']->fetchAll($tm);
            $ticketArray=array();
            foreach($tm as $ticketRow)
            {
                $ticketID=$ticketRow['idticket_master'];
                $this->__construct($ticketID);
                $ticket=$this->getTicket();
                if(is_array($ticket))
                {
                    array_push($ticketArray,$ticket);
                }
            }
            if(count($ticketArray)>0)
            {
                return $ticketArray;
            }
            return "NO_TICKETS_FOUND";
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function getTicketCount($eventID)
    {
        $eventID=secure($eventID);
        eventMaster::__construct($eventID);
        if($this->eventValid)
        {
            $app=$this->app;
            $tm="SELECT COUNT(idticket_master) FROM ticket_master WHERE stat='1' AND event_master_idevent_master='$eventID'";
            $tm=$app['db']->fetchAssoc($tm);
            foreach($tm as $count)
            {
                return $count;
            }
        }
        else
        {
            return "INVALID_EVENT_ID";
        }
    }
    function getEventID()
    {
        if($this->ticketValid)
        {
            $app=$this->app;
            $ticketID=$this->ticket_id;
            $tm="SELECT event_master_idevent_master FROM ticket_master WHERE idticket_master='$ticketID'";
            $tm=$app['db']->fetchAssoc($tm);
            if(validate($tm))
            {
                return $tm['event_master_idevent_master'];
            }
            else
            {
                return "INVALID_TICKET_ID";
            }
        }
        else
        {
            return "INVALID_TICKET_ID";
        }
    }
}
?>