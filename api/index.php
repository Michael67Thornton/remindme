<?php
/**
 * Created by PhpStorm.
 * User: Luke Hardiman
 * Date: 28/06/2015
 * Time: 2:11 AM
 */
include "Api.php";
$api = new Api(array("ClientData","getClient","resetClient"));
$request = $api->getRequest();

//switch our request
switch($request)
{
    case "ClientData":
        $api->sendResponse($api->ClientData());
        break;
    case "getClient":
        if (!isset($_GET['nhi']) | empty($_GET['nhi']))
            $api->sendResponse("need NHI number",false);

        $api->sendResponse($api->getClient($_GET['nhi']));
        break;

    case "resetClient":
        if (!isset($_GET['nhi']) | empty($_GET['nhi']))
            $api->sendResponse("need NHI number",false);

        $api->sendResponse($api->resetClient($_GET['nhi']));
        break;

}