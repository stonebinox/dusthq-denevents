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
    function getBooking()
    {
        if($this->bookingValid)
        {
            $app=$this->app;
            $bookingID=$this->booking_id;
            $bm="SELECT * FROM booking_master WHERE idbooking_master='$bookingID'";
            $bm=$app['db']->fetchAssoc($bm);
            if(validate($bm))
            {
                $userID=$bm['user_master_iduser_master'];
                userMaster::__construct($userID);
                $user=$this->getUser();
                if(is_array($user))
                {
                    $bm['user_master_iduser_master']=$user;
                }
                $ticketID=$bm['ticket_master_idticket_master'];
                ticketMaster::__construct($ticketID);
                $ticket=$this->getTicket();
                if(is_array($ticket))
                {
                    $bm['ticket_master_idticket_master']=$ticket;
                }
                return $bm;
            }
            else
            {
                return "INVALID_BOOKING_ID";
            }
        }
        else
        {
            return "INVALID_BOOKING_ID";
        }
    }
    function getBookings($userID,$offset=0)
    {
        $userID=secure($userID);
        userMaster::__construct($userID);
        if($this->userValid)
        {
            $offset=secure($offset);
            if((validate($offset))&&(is_numeric($offset))&&($offset>=0))
            {
                $app=$this->app;
                $bm="SELECT idbooking_master FROM booking_master WHERE stat='1' AND user_master_iduser_master='$userID' ORDER BY idbooking_master DESC";
                $bm=$app['db']->fetchAll($bm);
                $bookingArray=array();
                foreach($bm as $booking)
                {
                    $bookingID=$booking['idbooking_master'];
                    $this->__construct($bookingID);
                    $bookingData=$this->getBooking();
                    if(is_array($bookingData))
                    {
                        array_push($bookingArray,$bookingData);
                    }
                }
                if(count($bookingArray)>0)
                {
                    return $bookingArray;
                }
                return "NO_BOOKINGS_FOUND";
            }
            else
            {
                return "INVALID_OFFSET_VALUE";
            }
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
    function getBookingCount($ticketID)
    {
        $ticketID=secure($ticketID);
        ticketMaster::__construct($ticketID);
        if($this->ticketValid)
        {
            $app=$this->app;
            $bm="SELECT COUNT(idbooking_master) FROM booking_master WHERE stat='1' AND ticket_master_idticket_master='$ticketID'";
            $bm=$app['db']->fetchAssoc($bm);
            foreach($bm as $booking)
            {
                return $booking;
            }
        }
        else
        {
            return "INVALID_TICKET_ID";
        }
    }
    function processPayment($amount=0)
    {
        $amount=secure($amount);
        if((validate($amount))&&(is_numeric($amount))&&($amount>=0))
        {
            if($amount>0)
            {
                $app=$this->app;
                \Stripe\Stripe::setApiKey("pk_test_AaNN3vmVBn3clhgdqGa9CMXX");
                $amount=$amount*100;
                $token = $_POST['stripeToken'];
                $charge = \Stripe\Charge::create(array(
                "amount" => $amount,
                "currency" => "usd",
                "description" => "Ticket purchase",
                "source" => $token,
                ));
                if($charge->failure_code!=NULL)
                {
                    return "ERROR_".$charge->failure_message;
                }
            }
            return "PAYMENT_PROCESSED";
        }
        else
        {
            return "INVALID_PAYMENT_AMOUNT";
        }
    }
    function addBooking($userID,$ticketID,$quantity=1)
    {
        $userID=secure($userID);
        userMaster::__construct($userID);
        if($this->userValid)
        {
            $ticketID=secure($ticketID);
            ticketMaster::__construct($ticketID);
            if($this->ticketValid)
            {
                $quantity=secure($quantity);
                if((validate($quantity))&&(is_numeric($quantity))&&($quantity>=1))
                {
                    $eventID=ticketMaster::getEventID();
                    $ticketCount=ticketMaster::getTicketCount($eventID);
                    if((is_numeric($ticketCount))&&($ticketCount>0))
                    {
                        $bookingCount=$this->getBookingCount($ticketID);
                        $availableTickets=$ticketCount-$bookingCount;
                        echo $ticketCount.'<br>'.$bookingCount.'<br>'.$availableTickets.'<br>';
                        if(($availableTickets>0)&&($quantity<=$availableTickets))
                        {
                            $app=$this->app;
                            $in="INSERT INTO booking_master (timestamp,user_master_iduser_master,ticket_master_idticket_master,ticket_quantity) VALUES (NOW(),'$userID','$eventID','$quantity')";
                            $in=$app['db']->executeQuery($in);
                            $bm="SELECT idbooking_master FROM booking_master WHERE stat='1' AND user_master_iduser_master='$userID' AND ticket_master_idticket_master='$ticketID' ORDER BY idbooking_master DESC LIMIT 1";
                            $bm=$app['db']->fetchAssoc($bm);
                            $bookingID=$bm['idbooking_master'];
                            return "BOOKING_ADDED_".$bookingID;
                        }
                        else
                        {
                            return "NO_TICKETS_AVAILABLE";
                        }
                    }
                    else
                    {
                        return "NO_TICKETS_FOUND";
                    }
                }
                else
                {
                    return "INVALID_TICKET_QUANTITY";
                }
            }
            else
            {
                return "INVALID_TICKET_ID";
            }
        }
        else
        {
            return "INVALID_USER_ID";
        }
    }
}
?>