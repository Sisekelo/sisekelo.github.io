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
    var company = document.getElementById("signUpCompany").value;
    var cellphone = "+"+document.getElementById("signUpCellphone").value;
    var pass = encrypt(document.getElementById("signUpPass").value);
    var amount = 0;
    
    var db = firebase.firestore();
    
    db.collection("users").doc(cellphone).set({
        id: id,
        name: name,
        surname: surname,
        company: company,
        cellphone: cellphone,
        pass: pass,
        amount: 0,
        timestamp: Date.now()
    })
        .then(function() {
            console.log("Document successfully written!");
            alert('You have successfully been registered!');
            window.location.href="login.html"
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
        });
}

function login() {
    toggleLoader();
    
    var loginCellphone = document.getElementById("loginCellphone").value;
    var loginPassword = document.getElementById("loginPass").value;
    
    var accounts = getInfo("https://api.airtable.com/v0/appJOob43N8wFb0Xh/Accounts?api_key=keynre40bTqHjQ7AD");
    
    var counter = 0;
    
    
    accounts.records.map( account => {
        
        var phone = account.fields.Phone;
        var name = account.fields.Name;
        var surname = account.fields.Surname;
        var location = account.fields.Location;
        var password = account.fields.Password;
        
        if(phone == loginCellphone && password == loginPassword){
            counter++;
            localStorage.umbilaPhone = phone;
            localStorage.umbilaName = name;
            localStorage.umbilaSurname = surname;
            localStorage.umbilaLocation = location;
            
            alert(`Welcome back ${name}`);
            window.location.href = 'home.html';
            }
        
        }
    )
    
    toggleLoader();
    
    if(counter == 0){
        alert('Looks like this user does not exit');
    }
    
    
    
}

function toggleLoader(){
    
    var loader = document.getElementById("loader").style.display;
    
    if(loader == "block"){
        document.getElementById("loader").style.display = "none";
    }
    else{
        document.getElementById("loader").style.display = "block";
    }
}

function confirmOrder() {
    
    var amount = document.getElementById("totalAmount").innerHTML;
    var umbilaAmount = document.getElementById("umbilaNumber").value;
    var nutsAmount = document.getElementById("nutsNumber").value;
    
    //get confirmation library
    
    if(umbilaAmount == 0 && nutsAmount == 0){
        alert('Please choose something below!')
    }
    else{
        
        var txt = `Confirm \n${umbilaAmount} Umbila \n ${nutsAmount} Nuts \n TOTAL :${amount}`
    
        if (confirm(txt)) {
            
            var data = JSON.stringify({
                      "records": [
                        {
                          "fields": {
                            "Phone": localStorage.umbilaPhone,
                            "Name": localStorage.umbilaName,
                            "Surname": localStorage.umbilaSurname,
                            "Location": localStorage.umbilaLocation,
                            "Item": `${umbilaAmount} Umbila & ${nutsAmount} Nuts`,
                            "Delivered": "No",
                            "Price": amount
                          }
                        }
                      ]
                    });
            
            
            
            
            sendConfirmedOrder(data)
          } else {
            window.reload();
          }
    }
    
    
    
    
}

function sendConfirmedOrder(data){
    //get relevant details
    //send those details
    //send those details per item
    
    
    var xhr = new XMLHttpRequest();

                xhr.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {
                        console.log(this.responseText);
                        window.location.reload();
                    }
                });

                xhr.open("POST", "https://api.airtable.com/v0/appJOob43N8wFb0Xh/Order?api_key=keynre40bTqHjQ7AD", false);
                xhr.setRequestHeader("Content-Type", "application/json");

                xhr.send(data);
    
}

function updatePrice(){
    
    var amount = document.getElementById("totalAmount");
    var umbilaAmount = document.getElementById("umbilaNumber").value;
    var nutsAmount = document.getElementById("nutsNumber").value;
    
    var totalAmount = (umbilaAmount*30)+(nutsAmount*15);
    
    amount.innerHTML = totalAmount;
    
}