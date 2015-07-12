
/*
 Please note this was a prototype n
 */
$(document).ready(function() {
    //this is just a basic login not secure its just for prototype example username and password is admin admin :)

        if ($.cookie('logged') == null ){
            // set cookie
            getClientData();

            $(".container-fluid").css('opacity',"0.3")

            $('#login-modal').modal({
                backdrop: 'static',
                keyboard: false
            });
        }else{
            getClientData();
            reloadData();

        }


    //$('#login-modal').modal('toggle');
});

$("#login-modal .login").click(function(e){
    e.preventDefault();
    var login = $("#login-modal");
    var username = $("#username",login).val(), password = $("#password",login).val()
   if (username == "admin123" && password == "admin123"){
       var date = new Date();
       var m = 30;
       date.setTime(date.getTime() + (m * 60 * 1000));
       $.cookie('logged', "admin", { expires: date });
       $('#login-modal').modal('toggle');
       $(".container-fluid").css('opacity',"1");
       reloadData();
   }
    else{
       $("#login-modal :input").val('');
       $(".login-help",login).text("Failed incorrect account details")
   }
});
var theTimer;
//reloads the table with data yikes this is shite.....
function reloadData(){
        clearTimeout(theTimer)
        $.ajax({
            url: 'http://remindme.nzhost.me/api/ClientData',
            type: 'GET',
            dataType: 'jsonp',
            cache: false,
            success: function (response) {

                $.map(response.data,function(thisPatient){
                    var patient = $('#patients tr #'+thisPatient.nhi_num).data('patient');
                    var patient_tr = $('#patients tr #'+thisPatient.nhi_num).parent().parent();
                    var updated = false;
                    if (thisPatient.total_left != patient.total_left){
                        console.log("need to update table")
                        $('#total_left',patient_tr).fadeOut("slow").fadeIn("slow").text(thisPatient.total_left)
                        updated = true;
                    }
                    if (thisPatient.order != patient.order){
                        var order_class = (thisPatient.order == 1) ? "Yes":"";
                        $('#order',patient_tr).fadeOut("slow").fadeIn("slow").text(order_class);

                        if (thisPatient.order == 1)
                            $('.order',patient_tr).fadeIn("slow").addClass("glyphicon glyphicon-envelope")
                        else
                            $('.order',patient_tr).fadeOut("slow").removeClass("glyphicon glyphicon-envelope")
                        updated = true;
                    }
                    //update the data
                    if(updated = true)
                    $('#patients tr #'+thisPatient.nhi_num).data('patient',thisPatient);


                });
                startTimer();
            }
        })

}

function startTimer(){
    theTimer = setTimeout(reloadData,20000)
}

//Click event for send SMS button
function sendReminder(){
    //do not do this at home so bad bad bad bad
    var patient  = $(this).data('patient');
    //console.log("patient",patient);

    //create sms message
    var message = "Hi "+ patient.fname+ " this is a reminder to take " + patient.drug_name + "\n Reply OKAY or K when taken"

   sendSMS(message,patient.mobile_number)
   $(this).text("SENT!").removeClass("btn-success").addClass("btn-default")
}

/**
 * Gets clients data adds into table
 */
function getClientData(){
    $.ajax({
        url: 'http://remindme.nzhost.me/api/ClientData',
        type: 'GET',
        dataType: 'jsonp',
        success: function (response) {
                if (response.success == true)
                    $.map(response.data,function(patient){
                        //console.log("patient",patient);
                        //var patient_name = (typeof patient.lname == "string") ? patient.fname + " " + patient.lname : patient.fname;
                        var order = (patient.order == 1) ? "Yes":"";
                        var order_class = (patient.order == 1 ) ? "glyphicon glyphicon-envelope" : ""
                        //this is really bad hack job yuck!
                        $('#patients tr:last').after('<tr>'+

                            '<td>'+patient.nhi_num+'</td>' +
                            '<td>'+patient.fname +'</td>' +
                            '<td>'+patient.drug_name +'</td>' +
                            '<td>'+patient.pharmacy_name +'</td>' +
                            '<td>'+patient.mobile_number.slice(0, - 4)+"****" +'</td>' +
                            '<td>Daily</td>'+
                            '<td>3 Months</td>'+
                            '<td><span id="total_left">'+patient.total_left+'</span></td>'+

                            '<td><i class="order '+order_class+'" title="Requires ORDER SMS"><span id="order">'+order+'</span></i></td>' +
                            //d="'+patient.nhi_num+'"
                            '<td><span id="'+patient.nhi_num+'" class="btn btn-success send-sms-alert">Send SMS</span>' +
                            '<span nhi="'+patient.nhi_num+'" class="reset_order btn btn-warning" title="Reset order back to default" >Reset</span>'+
                        '</td>'

                        +'</tr>');
                        $('#patients tr #'+patient.nhi_num).data('patient',patient);
                    });
                    //update bindings
                    $('.send-sms-alert').click(sendReminder);
                    $('.reset_order').click(reset_order)


        },
        error: function (response) {

        }

    });
}

//Resets the limit back to 10
function reset_order(){
    $(this).fadeOut("slow").fadeIn("slow")
    var thisPatient = $('#patients tr #' +$(this).attr('nhi')).data('patient')


    var n = {
        nhi: thisPatient.nhi_num

    }
    $.ajax({
        url: 'http://remindme.nzhost.me/api/resetClient',
        type: 'GET',
        data: n,
        dataType: 'jsonp',

        success: function (response) {
            if (response.success == true) {
                reloadData();
            }
            if (response.success == false) {
                console.log("failed message :", response);
            }

        },
        error: function (response) {

        }

    });
}

/**
 *
 * @param message | SMS message
 * @param number  | SMS number
 */
function sendSMS(message, number) {
    //basic pass check
    if (typeof number == "undefined" | typeof message == "undefined" | (/\d{5,15}/.test(number) == false)) {
        console.log("Failed prams test");
        return;
    }
    //@type {{api_key: string, text: string, dest: string}}
    var sms_message = {
        api_key: "a1O3k07N21",
        text: message,
        dest: number
    }
    $.ajax({
        url: 'http://home.lukes-server.com/sms/',
        type: 'GET',
        data: sms_message,
        dataType: 'jsonp',

        success: function (response) {
            if (response.success == true) {
                console.log("success message sent", response.data);
            }
            if (response.success == false) {
                console.log("failed message :", response.data);
            }

        },
        error: function (response) {

        }

    });
}