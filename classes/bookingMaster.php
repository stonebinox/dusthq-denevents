<?php
/*------------------------------
Author: Anoop Santhanam
Date created: 14/12/17 14:45
Last modified: 14/12/17 14:45
Comments: Main class file for
booking_master table.
------------------------------*/
class bookingMaster extends ticketMaster
{
    public $app=NULL;
    private $booking_id=NULL;
    public $bookingValid=false;
    function __construct($bookingID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if(validate($bookingID))
        {
            $this->bookingID=secure($bookingID);
            $this->bookingValid=$this->verifyBooking();
        }
    }
    function verifyBooking()
    {
        if(validate($this->booking_id))
        {
            $app=$this->app;
            $bookingID=$this->booking_id;
            $bm="SELECT user_master_iduser_master,ticket_master_idticket_master FROM booking_master WHERE stat='1' AND idbooking_master='$bookingID'";
            $bm=$app['db']->fetchAssoc($bm);
            if(validate($bm))
            {
                $userID=$bm['user_master_iduser_master'];
                userMaster::__construct($userID);
                if($this->userValid)
                {
                    $ticketID=$bm['ticket_master_idticket_master'];
                    ticketMaster::__construct($ticketID);
                    if($this->ticketValid)
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
}
?>