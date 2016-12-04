// Firebase Config Setting
const columns = ["이름", "가입일", "주소", "집 전화번호", "핸드폰 번호"];
const yearColumns = ["이름", "집 전화번호", "핸드폰 번호", "보청기 구입일", "모델명"];
// ["이름", "나이", "성별", "보청기 모델", "보청기 구입시기", "배터리 구입시기", "복지카드 유무", "주소", "전화번호", "수정"];

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
//        alert("로그인 해 주세요");
        location.replace("/html/Login.html");
    }
});

let customerRef = firebase.database().ref('customers/');

// Dom Elements
let customerListTable = document.getElementById("customerList");
let oneYearTable = document.getElementById("oneYear").getElementsByTagName("table")[0];
let twoYearTable = document.getElementById("twoYear").getElementsByTagName("table")[0];
let fiveYearTable = document.getElementById("fiveYear").getElementsByTagName("table")[0];

// Global Variables
let now = new Date();
let nowYear = now.getFullYear();
let nowMonth = (now.getMonth()+1) <= 9 ? "0" + (now.getMonth()+1) : (now.getMonth()+1);
let currentDate = nowYear + "/" + nowMonth + "/" + now.getDate();
let before1YearDate = (nowMonth == 12 ? nowYear-0 : nowYear-1) + "/" + (nowMonth == 12 ? "01" : nowMonth+1) + "/" + now.getDate();
let before2YearDate = (nowMonth == 12 ? nowYear-1 : nowYear-2) + "/" + (nowMonth == 12 ? "01" : nowMonth+1) + "/" + now.getDate();
let before5YearDate = (nowMonth == 12 ? nowYear-4 : nowYear-5) + "/" + (nowMonth == 12 ? "01" : nowMonth+1) + "/" + now.getDate();

// Buttons
var btnLogOut = document.getElementById("btnLogOut");
var btnNewCustomer = document.getElementById("btnNewCustomer");
var btnReadCustomer = document.getElementById("btnReadCustomer");
var btnAddCustomer = document.getElementById("btnAddCustomer");
var btnDeleteCustomer = document.getElementById("btnDeleteCustomer");
var btnCancelNewCustomer = document.getElementById("btnCancelNewCustomer");

var updateCustomerId = "";
(function Constructor() {
    var customerListTableHeader = customerListTable.getElementsByTagName("thead")[0];
    var customerListTableTr = customerListTableHeader.insertRow(0);
    columns.forEach(function(columnName, index) {
        var th = document.createElement('th');
        th.innerHTML = columnName;
        customerListTableTr.appendChild(th);
    });

    var oneYearTableHeader = oneYearTable.getElementsByTagName("thead")[0];
    var oneYearTableTr = oneYearTableHeader.insertRow(0);
    yearColumns.forEach(function(columnName, index) {
        var th = document.createElement('th');
        th.innerHTML = columnName;
        oneYearTableTr.appendChild(th);
    });

    var twoYearTableHeader = twoYearTable.getElementsByTagName("thead")[0];
    var twoYearTableTr = twoYearTableHeader.insertRow(0);
    yearColumns.forEach(function(columnName, index) {
        var th = document.createElement('th');
        th.innerHTML = columnName;
        twoYearTableTr.appendChild(th);
    });

    var fiveYearTableHeader = fiveYearTable.getElementsByTagName("thead")[0];
    var fiveYearTableTr = fiveYearTableHeader.insertRow(0);
    yearColumns.forEach(function(columnName, index) {
        var th = document.createElement('th');
        th.innerHTML = columnName;
        fiveYearTableTr.appendChild(th);
    });
}());

btnNewCustomer.addEventListener('click', e => {
    resetDialog();
    updateCustomerId = "";
    // $("#dialogTitle")[0].innerHTML = "신규 고객 추가";
    btnDeleteCustomer.disabled = true;
});

let isEqualYearAndMonth = function(tableDate, purchaseDate) {
    var tableDateYear = tableDate.split("/")[0];
    var tableDateMonth = tableDate.split("/")[1];
    var formattedPurchaseDate = formatDate(purchaseDate);
    var purchaseDateYear = formattedPurchaseDate.split("/")[0];
    var purchaseDateMonth = formattedPurchaseDate.split("/")[1];

    return (tableDateYear == purchaseDateYear && tableDateMonth == purchaseDateMonth);
}

let formatDate = function(insertDate) {
    if(insertDate == undefined || insertDate == "") return "";
    var insertYear = insertDate.split("/")[0];
    var insertMonth = insertDate.split("/")[1];
    var insertDay = insertDate.split("/")[2];

    var formattedMonth = insertMonth.length < 2 ? "0" + insertMonth : insertMonth;
    var formattedDay = insertDay.length < 2 ? "0" + insertDay : insertDay;

    return insertYear + "/" + formattedMonth + "/" + formattedDay;
}

btnReadCustomer.addEventListener('click', e => {
    $(".customersTable").hide();
    $("#loader").show();
    customerRef.on('value', function(snapshot) {
        document.getElementById("myInput").value = "";

        var customerListTableBody = customerListTable.getElementsByTagName("tbody")[0];
        customerListTableBody.innerHTML = "";

        var oneYearTableBody = oneYearTable.getElementsByTagName("tbody")[0];
        oneYearTableBody.innerHTML = "";

        var twoYearTableBody = twoYearTable.getElementsByTagName("tbody")[0];
        twoYearTableBody.innerHTML = "";

        var fiveYearTableBody = fiveYearTable.getElementsByTagName("tbody")[0];
        fiveYearTableBody.innerHTML = "";

        snapshot.forEach(function(data, index) {
            var bodyRow = customerListTableBody.insertRow(index);
            var customerData = data.val();
            // row.insertCell(0).innerHTML = data.key();
            bodyRow.insertCell(0).innerHTML = '<a href="#" onclick="updateCustomer(\'' + data.key + '\')">'+customerData.name+'</a>';
            bodyRow.insertCell(1).innerHTML = customerData.registrationDate;
            bodyRow.insertCell(2).innerHTML = customerData.address;
            bodyRow.insertCell(3).innerHTML = customerData.phoneNumber;
            bodyRow.insertCell(4).innerHTML = customerData.mobilePhoneNumber;
//            bodyRow.insertCell(4).innerHTML = '<button onclick="deleteCustomer(\'' + data.key + '\')">DELETE</button>';

            if(customerData.hearingAid != undefined){
                customerData.hearingAid.forEach(function(hearingAidData, index) {
                    var yearTableRow;
                    if(isEqualYearAndMonth(before1YearDate, hearingAidData.date)) {
                        yearTableRow = oneYearTableBody.insertRow(oneYearTableBody.length);
                    } else if(isEqualYearAndMonth(before2YearDate, hearingAidData.date)) {
                        yearTableRow = twoYearTableBody.insertRow(twoYearTableBody.length);
                    } else if(isEqualYearAndMonth(before5YearDate, hearingAidData.date)) {
                        yearTableRow = fiveYearTableBody.insertRow(fiveYearTableBody.length);
                    } else {
                        return;
                    }
                    yearTableRow.insertCell(0).innerHTML = '<a href="#" onclick="updateCustomer(\'' + data.key + '\')">'+customerData.name+'</a>';
                    yearTableRow.insertCell(1).innerHTML = customerData.phoneNumber;
                    yearTableRow.insertCell(2).innerHTML = customerData.mobilePhoneNumber;
                    yearTableRow.insertCell(3).innerHTML = hearingAidData.date;
                    yearTableRow.insertCell(4).innerHTML = hearingAidData.model;
                });
            }
        });
        
        sorttable.makeSortable(customerListTable);

        // $("#customerCount")[0].innerHTML = $("#customerList tr").length-1;

        filterTable();

        $("#loader").hide();
        $(".customersTable").show();
    });
});

btnLogOut.addEventListener('click', e => {
    const promise = firebase.auth().signOut();
    location.replace("/html/Login.html");
    promise.catch(e => console.log(e.message));
});

btnAddCustomer.addEventListener('click', e => {
    var customerData = $('.modal-body').find('input').serializeArray().reduce(function(obj, item) {
        obj[item.name] = item.value;
        return obj;
    }, {});

    customerData.note = $('.modal-body textarea')[0].value;

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
            customerData.hearingAid.push({"side" : this.getAttribute("side"), "model" : this.value, "date" : formatDate(dateValue)});
        }
    });

    if(customerData.customerName == undefined || customerData.customerName == "") {
        emptyFlag = true;
        emptyMsg = "가입자 성함을 입력해 주세요";
    }

    if(emptyFlag) {
        alert(emptyMsg);
    } else {
        var customerObject = {
            name: customerData.customerName,
            age: customerData.customerAge,
            sex : customerData.customerSex,
            hearingAid: customerData.hearingAid,
            batteryOrderDate: formatDate(customerData.batteryOrderDate),
            cardAvailability: customerData.cardYN,
            address: customerData.address,
            phoneNumber : customerData.phoneNumber,
            mobilePhoneNumber : customerData.mobilePhoneNumber,
            registrationDate : formatDate(customerData.registrationDate),
            note : customerData.note
        }
        if(btnAddCustomer.getAttribute("isUpdate") == "false") {
            customerRef.push().set(customerObject);
        } else {
            if(updateCustomerId == "") {
                alert("예상치 못 한 오류 발생");
                resetUpdateStatus();
                return;
            }
            var updates = {};
            updates[updateCustomerId] = customerObject;
            customerRef.update(updates);
        }
        resetUpdateStatus();
        alert("반영완료");
    }
});

btnDeleteCustomer.addEventListener('click', e => {
   var confirmVal = confirm("정말 삭제하시겠습니까?");
   if(confirmVal == true) {
       customerRef.child(updateCustomerId).remove();
       resetUpdateStatus();
       alert("삭제완료");
   } else {
       resetUpdateStatus();
   }
});

let resetUpdateStatus = function() {
   btnAddCustomer.setAttribute("isUpdate", "false");
   btnCancelNewCustomer.click();
   updateCustomerId = "";
}

let updateCustomer = function(customerId) {
    resetDialog();
    btnNewCustomer.click();
    btnDeleteCustomer.disabled = false;
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
    var mobilePhoneNumber = document.getElementsByName("mobilePhoneNumber")[0];
    var registrationDate = document.getElementsByName("registrationDate")[0];
    var note = $('.modal-body textarea')[0];

    customerRef.child(customerId).once("value").then(function(snapshot) {
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

        if(customerData.hearingAid != undefined){
            customerData.hearingAid.forEach(function(hearingAidData, index) {
                var aidContent = addEarAid(hearingAidData.side)[0];
                var aidModelName = aidContent.getElementsByTagName("input")[0];
                var aidPurchaseDate = aidContent.getElementsByTagName("input")[1];
                aidModelName.value = hearingAidData.model;
                aidPurchaseDate.value = hearingAidData.date;
            });
        }

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
        mobilePhoneNumber.value = customerData.mobilePhoneNumber;
        registrationDate.value = customerData.registrationDate;
        note.value = customerData.note;
    });
}

let deleteAidContent = function(component) {
    component.parentNode.parentNode.remove()
}

let addEarAid = function(side) {
    if(side == "left"){
        var side_ko = "좌";
        var text_color = "text-primary";
    }else{
        var side_ko = "우";
        var text_color = "text-danger";
    }
    var newAidContent = '<tr class="hearingAidInfoTag">'+
    '<td>'+
    '<label class="'+text_color+'">모델명('+side_ko+')</label>'+
    '</td>'+
    '<td>'+
    '<input class="hearingAidInfo form-control" type="text" name="hearingAidModel" side="'+side+'"/>'+
    '</td>'+
    '<td>'+
    '<label>구입날짜</label>'+
    '</td>'+
    '<td>'+
    '<input class="hearingAidInfo form-control" type="text" name="hearingAidPurchaseDate" value="'+currentDate+'" side="'+side+'"/>'+
    '</td>'+
    '<td>'+
    '<button class="btn btn-default" onclick="deleteAidContent(this)">X</button>'+
    '</td>'+
    '</tr>'
    return $(newAidContent).insertBefore("#batteryOrderDate");
}

let resetDialog = function() {
    $(".hearingAidInfoTag").remove();

    $.each($('.modal-body input'), function(index, inputTag) {
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

    $('.modal-body textarea')[0].value = "";
}

let filterTable = function() {
    let filter, table, tr, td, i, count;
    filter = document.getElementById("myInput").value;
    table = document.getElementById("customerList");
    tr = table.getElementsByTagName("tr");
    count = 0;

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        for (j = 0; j < 5; j++) {
            td = tr[i].getElementsByTagName("td")[j];
            if (td) {
                if (td.innerHTML.indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    count++;
                    if(count % 10 == 0) {
                        tr[i].className = "highlight";
                    } else {
                        tr[i].className = "";
                    }
                    break;
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
    $("#customerCount")[0].innerHTML = count;    
}

btnReadCustomer.click();
