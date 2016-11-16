// Firebase Config Setting
const config = {
    apiKey: "AIzaSyAAjby47cHjqBOCPy4PzThrfbeSmUnk9eU",
    authDomain: "starkey.firebaseapp.com",
    databaseURL: "https://starkey.firebaseio.com/"
}
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(currentUser) {
    if (currentUser) {
        console.log("Welcome " + currentUser.email);
    } else {
        alert("로그인 해 주세요");
        window.location="Login.html";
    }
});

// Elements
const customerRef = firebase.database().ref('customers/');
const btnLogOut = document.getElementById("btnLogOut");
const btnNewCustomer = document.getElementById("btnNewCustomer");
const btnReadCustomer = document.getElementById("btnReadCustomer");
const btnAddCustomer = document.getElementById("btnAddCustomer");
const columns = ["이름", "가입일", "주소", "전화번호"];
var updateCustomerId = "";
// ["이름", "나이", "성별", "보청기 모델", "보청기 구입시기", "배터리 구입시기", "복지카드 유무", "주소", "전화번호", "수정"];
var now = new Date();
var currentDate = now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate();;

btnNewCustomer.addEventListener('click', e => {
    resetDialog();

    window.location='#open';
});

btnReadCustomer.addEventListener('click', e => {
    customerRef.on('value', function(snapshot) {
        var customerListTable = document.getElementById("customerList");
        var oneYearTable = document.getElementById("oneYear").getElementsByTagName("table")[0];

        customerListTable.innerHTML = "";
        oneYearTable.innerHTML = "";
        var customerListTableHeader = customerListTable.createTHead();
        var customerListTableBody = customerListTable.createTBody();
        var headerRow = customerListTableHeader.insertRow(0);
        columns.forEach(function(columnName, index) {
            headerRow.insertCell(index).innerHTML = columnName;
        });

        snapshot.forEach(function(data, index) {
            var bodyRow = customerListTableBody.insertRow(index);
            var customerData = data.val();
            // row.insertCell(0).innerHTML = data.key();
            bodyRow.insertCell(0).innerHTML = '<a href="#open" onclick="updateCustomer(\'' + data.key + '\')">'+customerData.name+'</a>';
            bodyRow.insertCell(1).innerHTML = customerData.registrationDate;
            bodyRow.insertCell(2).innerHTML = customerData.address;
            bodyRow.insertCell(3).innerHTML = customerData.phoneNumber;
            bodyRow.insertCell(4).innerHTML = '<button onclick="deleteCustomer(\'' + data.key + '\')">DELETE</button>';

            customerData.hearingAid.forEach(function(hearingAidData, index) {
                var oneYearTableRow = oneYearTable.insertRow(oneYearTable.length);
                oneYearTableRow.insertCell(0).innerHTML = customerData.name;
                oneYearTableRow.insertCell(1).innerHTML = customerData.phoneNumber;
                oneYearTableRow.insertCell(2).innerHTML = hearingAidData.date;
                oneYearTableRow.insertCell(3).innerHTML = hearingAidData.model;
            });
        });
        sorttable.makeSortable(customerListTable);
    });
});

btnLogOut.addEventListener('click', e => {
    const promise = firebase.auth().signOut();
    window.location = "Login.html";
    promise.catch(e => console.log(e.message));
});

btnAddCustomer.addEventListener('click', e => {
    var customerData = $('.modalDialog').find('input').serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    var emptyFlag = false;
    var emptyMsg = "";
    customerData.hearingAid = [];

    $(".hearingAidInfo").each(function(index) {
        if(index % 2 == 0) {
            var dateValue = $(".hearingAidInfo")[index+1].value;
            if(this.value == undefined || this.value == "" || dateValue == ""){
                emptyFlag = true;
                emptyMsg = "빈 값이 존재합니다";
            }
            customerData.hearingAid.push({"side" : this.getAttribute("side"), "model" : this.value, "date" : dateValue});
        }
    });

    if(customerData.customerName == undefined || customerData.customerName == "") {
        emptyFlag = true;
        emptyMsg = "가입자 성함을 입력해 주세요";
    }

    if(emptyFlag) {
        alert(validation.msg);
    } else {
        if(btnAddCustomer.getAttribute("isUpdate") == "false") {
            customerRef.push().set({
                name: customerData.customerName,
                age: customerData.customerAge,
                sex : customerData.customerSex,
                hearingAid: customerData.hearingAid,
                batteryOrderDate: customerData.batteryOrderDate,
                cardAvailability: customerData.cardYN,
                address: customerData.address,
                phoneNumber : customerData.phoneNumber,
                registrationDate : customerData.registrationDate
            });
        } else {
            var updates = {};
            updates[updateCustomerId] = {
                name: customerData.customerName,
                age: customerData.customerAge,
                sex : customerData.customerSex,
                hearingAid: customerData.hearingAid,
                batteryOrderDate: customerData.batteryOrderDate,
                cardAvailability: customerData.cardYN,
                address: customerData.address,
                phoneNumber : customerData.phoneNumber,
                registrationDate : customerData.registrationDate
            };
            customerRef.update(updates);
        }
        btnAddCustomer.setAttribute("isUpdate", "false");
        window.location='#close';
        btnReadCustomer.click();
        alert("저장완료");
    }
});

var updateCustomer = function(customerId) {
    resetDialog();
    btnAddCustomer.setAttribute("isUpdate", "true");
    updateCustomerId = customerId;
    var customerName = document.getElementsByName("customerName")[0];
    var customerAge = document.getElementsByName("customerAge")[0];
    var customerSexMale = document.getElementsByName("customerSex")[0];
    var customerSexFemale = document.getElementsByName("customerSex")[1];
    var batteryOrderDate = document.getElementsByName("batteryOrderDate")[0];
    var cardAvailabilityYes = document.getElementsByName("cardYN")[0];
    var cardAvailabilityNo = document.getElementsByName("cardYN")[1];
    var address = document.getElementsByName("address")[0];
    var phoneNumber = document.getElementsByName("phoneNumber")[0];
    var registrationDate = document.getElementsByName("registrationDate")[0];

    customerRef.child(customerId).on("value", function(snapshot) {
        var customerData = snapshot.val();
        customerName.value = customerData.name;
        customerAge.value = customerData.age;
        if(customerData.sex == "Male") {
            customerSexMale.checked = true;
            customerSexFemale.checked = false;
        } else {
            customerSexMale.checked = false;
            customerSexFemale.checked = true;
        }
        customerData.hearingAid.forEach(function(hearingAidData, index) {
            var aidContent = addEarAid(hearingAidData.side)[0];
            var aidModelName = aidContent.getElementsByTagName("input")[0];
            var aidPurchaseDate = aidContent.getElementsByTagName("input")[1];
            aidModelName.value = hearingAidData.model;
            aidPurchaseDate.value = hearingAidData.date;
        });
        batteryOrderDate.value = customerData.batteryOrderDate;
        if(customerData.cardAvailability == "Yes") {
            cardAvailabilityYes.checked = true;
            cardAvailabilityNo.checked = false;
        } else {
            cardAvailabilityYes.checked = false;
            cardAvailabilityNo.checked = true;
        }
        address.value = customerData.address;
        phoneNumber.value = customerData.phoneNumber;
        registrationDate.value = customerData.registrationDate;
    });
}

var deleteCustomer = function(customerId) {
    customerRef.child(customerId).remove();
}

var deleteAidContent = function(component) {
    component.parentElement.remove();
}

var addEarAid = function(side) {
    if(side == "left"){
        var side_ko = "좌";
    }else{
        var side_ko = "우";
    }
    var newAidContent = '<p class="hearingAidInfoTag">'+
    '<label>모델명('+side_ko+')</label>'+
    '<input class="hearingAidInfo" type="text" name="hearingAidModel" side="'+side+'"/>'+
    '<label>구입날짜</label>'+
    '<input class="hearingAidInfo" type="text" name="hearingAidPurchaseDate" value="'+currentDate+'" side="'+side+'"/>'+
    '<button onclick="deleteAidContent(this)">X</button>'+
    '</p>'
    return $(newAidContent).insertBefore("#batteryOrderDate");
}

var resetDialog = function() {
    $(".hearingAidInfoTag").remove();

    $.each($('.modalDialog input'), function(index, inputTag) {
        if(inputTag.name == "customerSex" || inputTag.name == "cardYN") {
           if(inputTag.value == "Male") inputTag.checked = true;
           if(inputTag.value == "Female") inputTag.checked = false;
           if(inputTag.value == "Yes") inputTag.checked = true;
           if(inputTag.value == "No") inputTag.checked = false;
        } else if(inputTag.name == "hearingAidPurchaseDate" || inputTag.name == "batteryOrderDate" || inputTag.name == "registrationDate") {
           inputTag.value = currentDate;
        } else {
           inputTag.value = "";
        }
    });
}

btnReadCustomer.click();
