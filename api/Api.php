<?php
/**
 * Created by PhpStorm.
 * User: Luke Hardiman
 * Date: 27/06/2015
 * Time: 10:55 PM
 * @description : basic hack job for an api sooo wrong...
 */
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);
class Api {
    private $db_host = "localhost";
    private $db_username = "remind_me";
    private $db_name = "remind_me";
    private $db_password = "ESHeRGEACDacb5rC";
    private $allowed_calls = array();
    private $call = null;
    private $db_connect = null;
    function __construct($calls = array(),$cron_job = false) {

       //if we are called from a cron job then let us be
        if (!$cron_job){
            //if no get request die
            if (!isset($_GET) || empty($_GET))$this->sendResponse("Failed Call");

            $this->allowed_calls = $calls;
        }

    }

    public function getRequest(){
        //first get request as action we need to get the key value
        $this->call = array_keys($_GET)[0];
        //check call to me
        if (!in_array($this->call,$this->allowed_calls)){
            $this->sendResponse($this->call." is a invalid action" , false);
        }
        //we end here with valid call so lets return it
        //return $this->call;
        if (method_exists($this, $this->call))
            return $this->call;
        else
            $this->sendResponse(" Failed to call ".$this->call , false);

    }
    public function notified($drug_id){
        $sql = "UPDATE `remind_me`.`drugs` SET `notified` = '1' WHERE `drugs`.`drug_id` = $drug_id";
        $this->db()->query($sql);
    }
    public function ClientData(){
        $results = $this->db()->query("SELECT patient.* ,  drugs.drug_id, drugs.drug_name, drugs.daily_amount, drugs.total_left ,  drugs.order, drugs.notified FROM remind_me.patient INNER JOIN remind_me.drugs ON patient.nhi_num = drugs.patient_nhi_num");

        $patients = array();
        while($p = $results->fetch_assoc())
            $patients[] = $p;
        return $patients;
    }
    //resets a clients
    public function resetClient($nhi_number){
        //
        $results = $this->db()->query("UPDATE `remind_me`.`drugs` SET `total_left` = '11', `order` = '0', `notified` = '0' WHERE `drugs`.`patient_nhi_num` = '$nhi_number';");
        if ($results)
            return true;
        else
            return false;
    }

    public function getClient($nhi){
        $sql = "SELECT patient.* ,  drugs.drug_id, drugs.drug_name, drugs.daily_amount, drugs.total_left ,  drugs.order, drugs.notified FROM remind_me.patient INNER JOIN remind_me.drugs ON patient.nhi_num = drugs.patient_nhi_num WHERE patient.nhi_num = '$nhi'";

        $results = $this->db()->query($sql);


        return $results->fetch_assoc();
    }
    //make a call to db
    public function db(){
        //singleton
        if ($this->db_connect == null)
            $this->db_connect = new mysqli($this->db_host, $this->db_username, $this->db_password, $this->db_name);

        return $this->db_connect;
    }
    //send response back to caller
    public function sendResponse($data,$success=true){
        $response['data'] = $data;
        $response['success'] = $success;

        $response = json_encode($response);

        header('Access-Control-Allow-Origin: *');
        header('Content-Type:  application/json');

        echo isset($_GET['callback'])
            ? "{$_GET['callback']}($response)"
            : $response;

        exit; //kill from other processing
    }

}





