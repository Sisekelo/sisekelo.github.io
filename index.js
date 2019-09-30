function showSignup() {
    var signupform = document.getElementById("signUpForm");

    var loginform = document.getElementById("loginForm");

    signupform.style.display = "block";
    loginform.style.display = "none";
}

function submitSignup() {
    var name = document.getElementById("signupname").value;
    var password = document.getElementById("signuppassword").value;
    var email = document.getElementById("signupemail").value;

    $.post("https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/users?api_key=keynre40bTqHjQ7AD", {
            "fields": {
                "Name": name,
                "Password": password,
                "Email": email
            }
        },
        function (data, status) {
            alert("Data: " + data + "\nStatus: " + status);
        });

    localStorage.name = name;
    localStorage.email = email;
}

function loginUserIn() {
    var email = document.getElementById("loginemail").value;
    var password = document.getElementById("loginpassword").value;

    var users = getInfo("https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/users?api_key=keynre40bTqHjQ7AD");

    users.records.map(user => {

        var useremail = user.fields.Email;
        var userpassword = user.fields.Password;
        var username = user.fields.Name;

        if (useremail == email && userpassword == password) {
            localStorage.email = useremail;
            localStorage.name = username;
            window.location.href = "index.html";
        }

        return console.log(user)
    })
}

function getInfo(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);

    localStorage.number = xmlHttp.responseText;

    return JSON.parse(xmlHttp.responseText);

}

function setUpHomePage() {
    document.getElementById("titleHeader").innerHTML += localStorage.name;

    localStorage.userLoggedIn = true;
    localStorage.contactsToBeUpdated = "";

    var lists = [];

    //load contacts
    var contacts = getInfo("https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/contact?api_key=keynre40bTqHjQ7AD");

    contacts.records.map(contact => {


        var name = contact.fields.Name;
        var number = contact.fields.Number;
        var list = contact.fields.List.split(",");

        var parentDiv = document.getElementById("allContacts");

        createContactCard(name, number, list, parentDiv);

        list.map(item => {
            if (!lists.includes(item)) {
                lists.push(item);
            }
        })

    })
    
    localStorage.lists = lists;
    
    lists.map(list =>{
        var parentDiv = document.getElementById("subList");
        createListCard(list,parentDiv);
    })

}

function createListCard(list,parentDiv){
    //create a name
    var divNode = document.createElement("DIV");
    var pNode = document.createElement("P");
    var inputNode = document.createElement("INPUT");
    var textnode = document.createTextNode(list);

    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("onclick", "checkSubList(this)");
    pNode.appendChild(inputNode);
    pNode.appendChild(textnode);

    divNode.appendChild(pNode);

    parentDiv.appendChild(divNode);
}

function createContactCard(name, number, list, parentDiv) {
    //create a name
    var divNode = document.createElement("DIV");
    var pNode = document.createElement("P");
    var inputNode = document.createElement("INPUT");
    var textnode = document.createTextNode(`${name} (${number})`);

    inputNode.setAttribute("type", "checkbox");
    inputNode.setAttribute("onclick", "checker(this)");
    pNode.appendChild(inputNode);
    pNode.appendChild(textnode);

    divNode.appendChild(pNode);

    parentDiv.appendChild(divNode);
}

function sendMessage() {

    var message = document.getElementById("sendMessageText").value;

    var contactList = document.getElementById("contactHolder").childNodes;
    
    var contactHolder = [];

    for (i = 1; i < contactList.length; i++) {

        var contact = contactList[i].innerText;

        var number = contact.slice(contact.length - 13, contact.length - 1)

        console.log(contact);

        contactHolder.push(number);   

        send(number, message);
    }
    
    //addToSchedule(contactHolder,message);
}

function send(number, message) {

    var form = new FormData();
    form.append("Body", message);
    form.append("To", `whatsapp:${number}`);
    form.append("From", "whatsapp:+14155238886");
    /*form.append("MediaUrl", "https://images.unsplash.com/photo-1545093149-618ce3bcf49d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80");*/

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.twilio.com/2010-04-01/Accounts/ACd39a50f2581980a42fa759d2a587253b/Messages.json",
        "method": "POST",
        "beforeSend": function (xhr) {
            /* Authorization header */
            xhr.setRequestHeader("Authorization", "Basic " + btoa("ACd39a50f2581980a42fa759d2a587253b" + ":" + "d957747df68438d2db18896dc8305901"))
        },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": form
    };

    $.ajax(settings).done(function (response) {
        console.log(response);
        
    });
}

function addToSchedule() {
    
    var message = document.getElementById("sendMessageText").value;

    var contactList = document.getElementById("contactHolder").childNodes;
    
    var contacts = [];
    
    console.log(contacts);

    for (i = 1; i < contactList.length; i++) {

        var contact = contactList[i].innerText;

        var number = contact.slice(contact.length - 13, contact.length - 1)

        console.log(contact);

        contacts.push(number); 
    }
    
    console.log(contacts);
    
    var datelocal = document.getElementById("date").value;
    
    var data = JSON.stringify({
      "fields": {
        "Message": message,
        "Contacts": contacts.toString(),
        "Date": datelocal
      }
    });

    var xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
            alert("your message has been scheduled!")
        }
    });

    xhr.open("POST", "https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/schedule?api_key=keynre40bTqHjQ7AD", false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
    
}

function checker(item) {

    console.log(item.parentNode.childNodes);
    var name = item.parentNode.childNodes[1].nodeValue.trim();

    if (item.checked) {
        var node = document.createElement("LI");
        var textnode = document.createTextNode(name);

        node.appendChild(textnode);
        document.getElementById("contactHolder").appendChild(node);
    } else {

        var contactList = document.getElementById("contactHolder").childNodes;

        for (i = 0; i < contactList.length; i++) {

            var contact = contactList[i].innerText;

            console.log(contact);

            console.log(name);

            console.log(name == contact);

            if (contact == name) {
                contactList[i].remove()
                break;
            }

        }

    }

}

function displayCreateList() {
    var holder = document.getElementById("addToList");
    holder.style.display = "block";

    //add input
    var input = document.createElement("INPUT");
    input.setAttribute("type", "text");
    input.setAttribute("id", "listTitle");
    input.setAttribute("placeholder", "insert name of list");

    holder.appendChild(input);

    //add CREATE Button

    //load contacts
    var contacts = getInfo("https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/contact?api_key=keynre40bTqHjQ7AD");

    contacts.records.map(contact => {
        console.log(contact.fields);

        var name = contact.fields.Name;
        var number = contact.fields.Number;
        var list = contact.fields.List;

        var divNode = document.createElement("DIV");
        var pNode = document.createElement("P");
        var inputNode = document.createElement("INPUT");
        var textnode = document.createTextNode(`${name} (${number})`);

        inputNode.setAttribute("type", "checkbox");
        inputNode.setAttribute("onclick", "updateNewList(this)");
        pNode.appendChild(inputNode);
        pNode.appendChild(textnode);

        divNode.appendChild(pNode);

        holder.appendChild(divNode);
    })


}

function createList() {
    var newlist = document.getElementById("listTitle").value;

    //get added contacts from localstorage.newContactList

    console.log("New list is: " + newlist);

    var contacts = JSON.parse(localStorage.number);

    var numbers = localStorage.contactsToBeUpdated.split(";");

    contacts.records.map(contact => {
        //if number is the same update!

        if (numbers.includes(contact.fields.Number)) {
            console.log(contact.fields.Number + " should be updated with id " + contact.id);

            var oldlist = contact.fields.List;

            var mixList;

            if (oldlist == undefined) {
                mixList = newlist;
            } else {
                mixList = oldlist + "," + newlist;
            }

            updateContact(contact.fields.Number, contact.id, mixList);

            localStorage.contactsToBeUpdated = "";
            location.reload();
        }
    })

}

function updateNewList(item) {
    var contact = item.parentNode.childNodes[1].nodeValue.trim();

    var number = contact.slice(contact.length - 13, contact.length - 1);
    //add these to a list for contacts to be updated
    localStorage.contactsToBeUpdated += number + ";";
    console.log(localStorage.contactsToBeUpdated);
}

function updateContact(number, id, list) {

    var data = JSON.stringify({
        "records": [
            {
                "id": id,
                "fields": {
                    "List": list
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

    xhr.open("PATCH", "https://api.airtable.com/v0/appJn2IJZWW7Yn5Fh/contact?api_key=keynre40bTqHjQ7AD", false);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.send(data);
}

function checkSubList(item){
    //onclick get the name on the click
    var subList = item.parentNode.childNodes[1].nodeValue;
    
    var contacts = JSON.parse(localStorage.number);
    
    contacts.records.map((contact,index) =>{
        var list = contact.fields.List.split(",");
        if(list.includes(subList)){
            //now find this contact and check it
            var holder = document.getElementById("allContacts").children[index].children[0].innerText;
            
            var number = holder.slice(holder.length - 13, holder.length - 1)
            
            console.log(number);
            console.log(index); 
            
            document.getElementById("allContacts").children[index].children[0].children[0].click();
            
        }
    })

    //if contact has tag click it
}
