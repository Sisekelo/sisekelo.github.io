(function ($) {
    "use strict";


    /*==================================================================
    [ Validate after type ]*/
    $('.validate-input .input100').each(function () {
        $(this).on('blur', function () {
            if (validate(this) == false) {
                showValidate(this);
            } else {
                $(this).parent().addClass('true-validate');
            }
        })
    })


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function () {
        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
            $(this).parent().removeClass('true-validate');
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');

        $(thisAlert).append('<span class="btn-hide-validate">&#xf136;</span>')
        $('.btn-hide-validate').each(function () {
            $(this).on('click', function () {
                hideValidate(this);
            });
        });
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();
        $(thisAlert).removeClass('alert-validate');
        $(thisAlert).find('.btn-hide-validate').remove();
    }



})(jQuery);

function sendMoney() {
    
    var senderName = document.getElementById("senderName").value;
    var senderID = encrypt(document.getElementById("senderID").value).toString();
    var senderNumber = document.getElementById("senderNumber").value;
    var receiverName = document.getElementById("receiverName").value;
    var receiverID = encrypt(document.getElementById("receiverID").value).toString();
    var receiverNumber = document.getElementById("receiverNumber").value;
    var amount = document.getElementById("amount").value;
    var reference = Math.floor(Math.random()*90000) + 10000;

   var data = JSON.stringify({
      "fields": {
        "SenderName": senderName,
        "ReceiverName": receiverName,
        "SenderNumber": senderNumber,
        "SenderID": senderID,
        "ReceiverID": receiverID,
        "ReceiverNumber": receiverNumber,
        "Amount": parseFloat(amount),
        "Retrieved": "false",
        "Reference": reference.toString()
      }
    });

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            
            //send sms to person with ID
            var id = JSON.parse(this.responseText).id;
            
            var senderText = `Hi ${senderName}, \n You just sent ${amount} to ${receiverName}. \n Reference number:\n\n ${id}. \n\n MAKE SURE ${receiverName} BRINGS AND ID TO COLLECT MONEY!`
            
            var receiverText = `Hi ${receiverName}, \n You have received ${amount} from ${senderName}. \n Reference: \n\n ${id}\n\n Collect it from any Zuka station. Make sure to bring your ID`
            
            sendSMS(senderNumber, senderText);
            
            sendSMS(receiverNumber, receiverText);
            
            alert("Money sent: unique id is: "+reference);
        }
    });

    xhr.open("POST", "https://api.airtable.com/v0/appn8TIzmT0d92L4k/transactions?api_key=keynre40bTqHjQ7AD", false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);

}

function sendSMS(number,message){
    
    
    var data = new FormData();
    data.append("text", message);

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
      }
    });

    xhr.open("POST", `https://rest.nexmo.com/sms/json?api_key=d6726b9a&api_secret=005e2f3453ccb56c&to=${number}&from=NEXMO&text=${message}`);

    xhr.send(data);
}

function getDetails(){
    
    var number = document.getElementById("referenceNumber").value;
    
    var transactions = getInfo("https://api.airtable.com/v0/appn8TIzmT0d92L4k/transactions?api_key=keynre40bTqHjQ7AD");
    
    transactions.records.map(transaction =>{
        console.log(transaction.id);
        
        var id = transaction.id;
        
        var reference = transaction.fields.Reference;
        
        console.log(id == number.trim(), id,number);
        
        if(reference == number.trim()){
            localStorage.transactionID = id;
            document.getElementById("receiveDetails").style.display = "block";
            document.getElementById("senderDetails").value = `${transaction.fields.SenderName} | ${decrypt(transaction.fields.SenderID)}` ;
            document.getElementById("receiverDetails").value = `${transaction.fields.ReceiverName} | ${decrypt(transaction.fields.ReceiverID)}`;
            document.getElementById("amount").value = transaction.fields.Amount;
        }
    })
    
    
    
    
}

function getInfo(url){
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    
    console.log(xmlHttp.responseText);
    
    return JSON.parse(xmlHttp.responseText);
}

function approve(){
    
    var id = localStorage.transactionID;
    
    var data = JSON.stringify({
        "records": [
            {
                "id": id,
                "fields": {
                    "Retrieved": "true"
                }
        }
      ]
    });

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    xhr.open("PATCH", "https://api.airtable.com/v0/appn8TIzmT0d92L4k/transactions?api_key=keynre40bTqHjQ7AD", false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
}

function encrypt(message){
    
    var encrypted = CryptoJS.AES.encrypt(message, "SwaziPuppies");
    //U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy+bu0=
    
    return encrypted.toString()
    
}

function decrypt(message){
    var decrypted = CryptoJS.AES.decrypt(message, "SwaziPuppies");
    
    return decrypted.toString(CryptoJS.enc.Utf8)
}

function signup(){
    var id = encrypt(document.getElementById("signUpId").value);
    var name = document.getElementById("signUpName").value;
    var surname = document.getElementById("signUpSurname").value;
    var company = "+"+document.getElementById("signUpCompany").value;
    var cellphone = document.getElementById("signUpCellphone").value;
    var pass = encrypt(document.getElementById("signUpPass").value);
    var amount = 0;

    $.post("https://api.airtable.com/v0/appn8TIzmT0d92L4k/merchants?api_key=keynre40bTqHjQ7AD", {
            "fields": {
                "Name": name,
                "Surname": surname,
                "ID": id,
                "Company": company,
                "Cellphone": cellphone,
                "Pass": pass,
                "Amount" : amount
            }
        },
        function (data, status) {
            console.log("Data: " + data + "\nStatus: " + status);
            alert("Your registration was "+status);
            window.location.reload();
        });
}

function login() {
    
    var cellphone = document.getElementById("loginCellphone").value;
    var pass = document.getElementById("loginPass").value;

    var merchants = getInfo("https://api.airtable.com/v0/appn8TIzmT0d92L4k/merchants?api_key=keynre40bTqHjQ7AD");
    
    var counter = 0;

    merchants.records.map(merchant => {

        var merchantCellphone = merchant.fields.Cellphone;
        var merchantPass = decrypt(merchant.fields.Pass)

        if (merchantCellphone == cellphone && merchantPass == pass) {
            counter++;
            localStorage.name = merchant.fields.Name;
            localStorage.surname = merchant.fields.Surname;
            localStorage.company = merchant.fields.Company;
            localStorage.amount = merchant.fields.Amount;
            alert(`Welcome back ${localStorage.name}`);
            console.log(`This user has ${localStorage.amount} Emalangeni`)
            window.location.href = "send.html";
        }

        return console.log(user)
    })
    
    if(counter == 0){
       alert("Looks like this user doesnt exist!"); 
    }
    
    toggleLoader();
}

function setUpHome(){
    document.getElementById("title").innerHTML = `this user has ${localStorage.amount}`;
}