/**
 * Created by michael on 28/06/2015.
 */



$(document).ready(function() {

    getClientData();
    reloadData();

});

//reloads the table with data yikes this is .....
function reloadData(){
    setInterval(function(){
        $.ajax({
            url: 'http://remindme.nzhost.me/api/ClientData',
            type: 'GET',
            dataType: 'jsonp',
            cache: false,
            success: function (response) {

                $.map(response.data,function(thisPatient){
                    var patient = $('#patients tr #'+thisPatient.nhi_num).data('patient');

                    if (thisPatient.total_left != patient.total_left){
                        console.log("need to update table")
                        $('#total_left',$('#patients tr #NZ1881').parent().parent()).fadeOut().fadeIn().text(thisPatient.total_left)
                        $('#patients tr #'+thisPatient.nhi_num).data('patient',thisPatient);
                    }
                });
            }
        })
    },30000)
}
//Click event for send SMS button
function sendReminder(){
    //do not do this at home so bad bad bad bad
    var patient  = $(this).data('patient');
    console.log("patient",patient);

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
                    console.log("patient",patient);
                    var patient_name = (typeof patient.lname == "string") ? patient.fname + " " + patient.lname : patient.fname;
                    //this is really bad hack job yuck!
                    $('#patients tr:last').after('<tr>'+
                    '<td>'+patient.nhi_num+'</td>' +
                    '<td>'+patient_name +'</td>' +
                    '<td>'+patient.drug_name +'</td>' +
                    '<td>'+patient.pharmacy_name +'</td>' +
                    '<td>'+patient.mobile_number.slice(0, - 4)+"****" +'</td>' +
                    '<td>Daily</td>'+
                    '<td>3 Months</td>'+
                    '<td id="total_left">'+patient.total_left+'</td>'+
                        //d="'+patient.nhi_num+'"
                    '<td><span id="'+patient.nhi_num+'" class="btn btn-success send-sms-alert">Send SMS</span></td>'
                    +'</tr>');
                    $('#patients tr #'+patient.nhi_num).data('patient',patient);
                });
            $('.send-sms-alert').click(sendReminder)



        },
        error: function (response) {
            console.log('BACK OFF ');
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
            console.log('BACK OFF BITCH');
        }

    });
}
