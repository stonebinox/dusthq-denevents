<?php
/*-----------------------------
Author: Anoop Santhanam
Date created: 19/12/17 15:19
Last modified: 19/12/17 15:19
Comments: Main class file for
bill_master table.
----------------------------*/
class billMaster extends bookingMaster
{
    public $app=NULL;
    private $bill_id=NULL;
    public $billValid=false;
    function __construct($billID=NULL)
    {
        $this->app=$GLOBALS['app'];
        if(validate($billID))
        {
            $this->bill_id=secure($billID);
            $this->billValid=$this->verifyBill();
        }
    }
    function verifyBill()
    {
        if(validate($this->bill_id))
        {
            $app=$this->app;
            $billID=$this->bill_id;
            $bm="SELECT booking_master_idbooking_master FROM bill_master WHERE stat='1' AND idbill_master='$billID'";
            $bm=$app['db']->fetchAssoc($bm);
            if(validate($bm))
            {
                $bookingID=$bm['booking_master_idbooking_master'];
                bookingMaster::__construct($bookingID);
                if($this->bookingValid)
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
    function getBill()
    {
        if($this->billValid)
        {
            $app=$this->app;
            $billID=$this->bill_id;
            $bm="SELECT * FROM bill_master WHERE idbill_mastet='$billID'";
            $bm=$app['db']->fetchAssoc($bm);
            if(validate($bm))
            {
                $bookingID=$bm['booking_master_idbooking_master'];
                bookingMaster::__construct($bookingID);
                $booking=$this->getBooking();
                if(is_array($booking))
                {
                    $bm['booking_master_idbooking_master']=$bookingID;
                }
                return $bm;
            }
            else
            {
                return "INVALID_BILL_ID";
            }
        }
        else
        {
            return "INVALID_BILL_ID";
        }
    }
    function addBill($bookingID,$amount=0)
    {
        $bookingID=secure($bookingID);
        bookingMaster::__construct($bookingID);
        if($this->bookingValid)
        {
            $amount=secure($amount);
            if((validate($amount))&&(is_numeric($amount))&&($amount>=0))
            {
                $app=$this->app;
                $bm="SELECT idbill_master FROM bill_master WHERE stat='1' AND booking_master_idbooking_master='$bookingID'";
                $bm=$app['db']->fetchAssoc($bm);
                if(!validate($bm))
                {
                    $in="INSERT INTO bill_master (timestamp,booking_master_idbooking_master,bill_ammount) VALUES (NOW(),'$bookingID','$amount')";
                    $in=$app['db']->executeQuery($in);
                    return "BILL_ADDED";
                }
                else
                {
                    return "BILL_ALREADY_ADDED";
                }
            }
            else
            {
                return "INVALID_BILL_AMOUNT";
            }
        }
        else
        {
            return "INVALID_BOOKING_ID";
        }
    }
}
?>