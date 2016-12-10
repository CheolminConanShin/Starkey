// Firebase Config Setting
const columns = ["이름", "가입일", "주소", "집 전화번호", "핸드폰 번호"];
const repairColumns = ["이름", "가입일", "최근 수리내역", "집 전화번호", "핸드폰 번호"];
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
        location.replace("/html/Login.html");
    }
});

let customerRef = firebase.database().ref('customers/');
let repairRef = firebase.database().ref('repairs/');

// Components
let customerListTable = document.getElementById("customerList");
let repairCustomerListTable = document.getElementById("repairCustomerList");
let oneWeekTable = document.getElementById("oneWeek").getElementsByTagName("table")[0];
let threeWeekTable = document.getElementById("threeWeek").getElementsByTagName("table")[0];
let sevenWeekTable = document.getElementById("sevenWeek").getElementsByTagName("table")[0];
let oneYearTable = document.getElementById("oneYear").getElementsByTagName("table")[0];
let twoYearTable = document.getElementById("twoYear").getElementsByTagName("table")[0];
let fiveYearTable = document.getElementById("fiveYear").getElementsByTagName("table")[0];
let newCustomerForm = $('.newCustomerForm');
let newRepairForm = $('.repairCustomerForm');

// Global Variables
function convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat);
    return [pad(d.getFullYear()), pad(d.getMonth()+1), pad(d.getDate())].join('/');
}

let now = new Date();
let currentDate = convertDate(now);
let weekAgo = convertDate(new Date().setDate(now.getDate() - 7));
let threeWeeksAgo = convertDate(new Date().setDate(now.getDate() - 21));
let sevenWeeksAgo = convertDate(new Date().setDate(now.getDate() - 49));
let before1YearDate = convertDate(new Date().setFullYear(now.getFullYear() - 1));
let before2YearDate = convertDate(new Date().setFullYear(now.getFullYear() - 2));
let before5YearDate = convertDate(new Date().setFullYear(now.getFullYear() - 5));

// Buttons
var btnBuyRepair = $("#btnBuyRepair input:radio");
var btnLogOut = document.getElementById("btnLogOut");

var btnNewCustomer = document.getElementById("btnNewCustomer");
var btnNewRepairCustomer = document.getElementById("btnNewRepairCustomer");

var btnReadCustomer = document.getElementById("btnReadCustomer");

var btnAddCustomer = document.getElementById("btnAddCustomer");
var btnAddRepairCustomer = document.getElementById("btnAddRepairCustomer");

var btnDeleteCustomer = document.getElementById("btnDeleteCustomer");
var btnDeleteRepairCustomer = document.getElementById("btnDeleteRepairCustomer");

var btnCancelNewCustomer = document.getElementById("btnCancelNewCustomer");
var btnCancelRepairCustomer = document.getElementById("btnCancelRepairCustomer");

var updateCustomerId = "";

btnBuyRepair.change(function() {
    if(this.value == "buy") {
        btnNewCustomer.style.display = "inline";
        btnNewRepairCustomer.style.display = "none";
        customerListTable.style.display = "table";
        repairCustomerListTable.style.display = "none";
    } else {
        btnNewCustomer.style.display = "none";
        btnNewRepairCustomer.style.display = "inline";
        customerListTable.style.display = "none";
        repairCustomerListTable.style.display = "table";
    }
    updateCustomerId = "";
    document.getElementById("filterInput").value = "";
    filterTable();
});

(function Constructor() {
    let setTableHeader = function(table) {
        var tableHeader = table.getElementsByTagName("thead")[0];
        var tableTr = tableHeader.insertRow(0);
        yearColumns.forEach(function(columnName, index) {
            var th = document.createElement('th');
            th.innerHTML = columnName;
            tableTr.appendChild(th);
        });
    }

    var customerListTableHeader = customerListTable.getElementsByTagName("thead")[0];
    var customerListTableTr = customerListTableHeader.insertRow(0);
    columns.forEach(function(columnName, index) {
        var th = document.createElement('th');
        th.innerHTML = columnName;
        customerListTableTr.appendChild(th);
    });

    var repairCustomerListTableHeader = repairCustomerListTable.getElementsByTagName("thead")[0];
    var repairCustomerListTableTr = repairCustomerListTableHeader.insertRow(0);
    repairColumns.forEach(function(columnName, index) {
        var th = document.createElement('th');
        th.innerHTML = columnName;
        repairCustomerListTableTr.appendChild(th);
    });

    setTableHeader(oneWeekTable);
    setTableHeader(threeWeekTable);
    setTableHeader(sevenWeekTable);
    setTableHeader(oneYearTable);
    setTableHeader(twoYearTable);
    setTableHeader(fiveYearTable);
}());

btnNewCustomer.addEventListener('click', e => {
    resetDialog();
    updateCustomerId = "";
    btnDeleteCustomer.disabled = true;
});

btnNewRepairCustomer.addEventListener('click', e => {
    resetDialog();
    updateCustomerId = "";
    btnDeleteCustomer.disabled = true;
});

let isNull = function(subject) {
    return subject == undefined || subject == "";
}

let formatDate = function(insertDate) {
    if(isNull(insertDate)) return "";
    var insertYear = insertDate.split("/")[0];
    var insertMonth = insertDate.split("/")[1];
    var insertDay = insertDate.split("/")[2];

    var formattedMonth = insertMonth.length < 2 ? "0" + insertMonth : insertMonth;
    var formattedDay = insertDay.length < 2 ? "0" + insertDay : insertDay;

    return insertYear + "/" + formattedMonth + "/" + formattedDay;
}

let isInNextThreeDays = function(tableDate, purchaseDate) {
    var tableDateYear = tableDate.split("/")[0];
    var tableDateMonth = tableDate.split("/")[1];
    var tableDateDay = tableDate.split("/")[2];
    var tableDate = new Date(tableDateYear, tableDateMonth-1, tableDateDay);

    var formattedPurchaseDate = formatDate(purchaseDate);
    var purchaseDateYear = formattedPurchaseDate.split("/")[0];
    var purchaseDateMonth = formattedPurchaseDate.split("/")[1];
    var purchaseDateDay = formattedPurchaseDate.split("/")[2];
    var purchaseDate = new Date(purchaseDateYear, purchaseDateMonth-1, purchaseDateDay);

    return purchaseDate >= tableDate && purchaseDate <= tableDate.setDate(tableDate.getDate() + 3);
}

let isEqualYearAndMonth = function(tableDate, purchaseDate) {
    var tableDateYear = tableDate.split("/")[0];
    var tableDateMonth = tableDate.split("/")[1];

    var formattedPurchaseDate = formatDate(purchaseDate);
    var purchaseDateYear = formattedPurchaseDate.split("/")[0];
    var purchaseDateMonth = formattedPurchaseDate.split("/")[1];

    return (tableDateYear == purchaseDateYear && tableDateMonth == purchaseDateMonth);
}

let clearTableAndReturn = function(table) {
    var tableBody = table.getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";
    return tableBody;
}

btnReadCustomer.addEventListener('click', e => {
    $("#loader").show();
    customerRef.on('value', function(snapshot) {
        var customerListTableBody = customerListTable.getElementsByTagName("tbody")[0];
        customerListTableBody.innerHTML = "";

        var oneWeekTableBody = clearTableAndReturn(oneWeekTable);
        var threeWeekTableBody = clearTableAndReturn(threeWeekTable);
        var sevenWeekTableBody = clearTableAndReturn(sevenWeekTable);
        var oneYearTableBody = clearTableAndReturn(oneYearTable);
        var twoYearTableBody = clearTableAndReturn(twoYearTable);
        var fiveYearTableBody = clearTableAndReturn(fiveYearTable);

        snapshot.forEach(function(data, index) {
            var bodyRow = customerListTableBody.insertRow(index);
            var customerData = data.val();
            bodyRow.insertCell(0).innerHTML = '<a href="#" onclick="updateCustomer(\'' + data.key + '\')">'+customerData.name+'</a>';
            bodyRow.insertCell(1).innerHTML = customerData.registrationDate;
            bodyRow.insertCell(2).innerHTML = customerData.address;
            bodyRow.insertCell(3).innerHTML = customerData.phoneNumber;
            bodyRow.insertCell(4).innerHTML = customerData.mobilePhoneNumber;

            if(!isNull(customerData.hearingAid)) {
                customerData.hearingAid.forEach(function(hearingAidData, index) {
                    var tableRow = null;

                    // Week and Year Check 
                    if(isInNextThreeDays(weekAgo, hearingAidData.date)) {
                        tableRow = oneWeekTableBody.insertRow(oneWeekTableBody.length);
                    } else if(isInNextThreeDays(threeWeeksAgo, hearingAidData.date)) {
                        tableRow = threeWeekTableBody.insertRow(threeWeekTableBody.length);
                    } else if(isInNextThreeDays(sevenWeeksAgo, hearingAidData.date)) {
                        tableRow = sevenWeekTableBody.insertRow(sevenWeekTableBody.length);
                    } else if(isEqualYearAndMonth(before1YearDate, hearingAidData.date)) {
                        tableRow = oneYearTableBody.insertRow(oneYearTableBody.length);
                    } else if(isEqualYearAndMonth(before2YearDate, hearingAidData.date)) {
                        tableRow = twoYearTableBody.insertRow(twoYearTableBody.length);
                    } else if(isEqualYearAndMonth(before5YearDate, hearingAidData.date)) {
                        tableRow = fiveYearTableBody.insertRow(fiveYearTableBody.length);
                    } else {
                        return;
                    }

                    tableRow.insertCell(0).innerHTML = '<a href="#" onclick="updateCustomer(\'' + data.key + '\')">'+customerData.name+'</a>';
                    tableRow.insertCell(1).innerHTML = customerData.phoneNumber;
                    tableRow.insertCell(2).innerHTML = customerData.mobilePhoneNumber;
                    tableRow.insertCell(3).innerHTML = hearingAidData.date;
                    tableRow.insertCell(4).innerHTML = hearingAidData.model;
                });
            }
        });
        
        sorttable.makeSortable(customerListTable);
        $("#loader").hide();
        btnBuyRepair[0].click();
    });

    repairRef.on('value', function(snapshot) {
        var repairCustomerListTableBody = clearTableAndReturn(repairCustomerListTable);

        snapshot.forEach(function(data, index) {
            var bodyRow = repairCustomerListTableBody.insertRow(index);
            var customerData = data.val();
            bodyRow.insertCell(0).innerHTML = '<a href="#" onclick="updateRepairCustomer(\'' + data.key + '\')">'+customerData.name+'</a>';
            bodyRow.insertCell(1).innerHTML = customerData.registrationDate;
            bodyRow.insertCell(2).innerHTML = isNull(customerData.repairReport) ? "" : customerData.repairReport[0].content;
            bodyRow.insertCell(3).innerHTML = customerData.phoneNumber;
            bodyRow.insertCell(4).innerHTML = customerData.mobilePhoneNumber;
        });
    });
});

btnLogOut.addEventListener('click', e => {
    const promise = firebase.auth().signOut();
    location.replace("/html/Login.html");
    promise.catch(e => console.log(e.message));
});


let getFormObjectFromForm = function(form) {
   return form.find('input').serializeArray().reduce(function(obj, item) {
       obj[item.name] = item.value;
       return obj;
   }, {});
}


btnAddCustomer.addEventListener('click', e => {
    var customerData = getFormObjectFromForm(newCustomerForm);

    var emptyMsg = "";
    customerData.hearingAid = [];

    $(".hearingAidInfo").each(function(index) {
        if(index % 2 == 0) {
            var dateValue = $(".hearingAidInfo")[index+1].value;
            if(isNull(this.value) || isNull(dateValue)){
                emptyMsg = "빈 값이 존재합니다";
            }
            customerData.hearingAid.push({"side" : this.getAttribute("side"), "model" : this.value, "date" : formatDate(dateValue)});
        }
    });

    customerData.note = newCustomerForm.find('textarea').val();

    if(isNull(customerData.customerName)) {
        emptyMsg = "가입자 성함을 입력해 주세요";
    }

    if(!isNull(emptyMsg)) {
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
        if(isNull(updateCustomerId)) {
            customerRef.push().set(customerObject);
        } else {
            if(isNull(updateCustomerId)) {
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

btnAddRepairCustomer.addEventListener('click', e => {
    var customerData = getFormObjectFromForm(newRepairForm);

    var emptyMsg = "";
    customerData.repairList = [];

    $(".repairReportTag").each(function(index) {
        if(index % 2 == 0) {
            var repairDate = $(this).find("input").val();
            customerData.repairList.push({"date" : repairDate});
        } else {
            var repairObject = customerData.repairList[Math.floor(index/2)];
            var repairContent = $(this).find("textarea").val();
            repairObject.content = repairContent;
        }
    });

    if(isNull(customerData.customerName)) {
        emptyMsg = "가입자 성함을 입력해 주세요";
    }

    if(!isNull(emptyMsg)) {
        alert(emptyMsg);
    } else {
        var customerObject = {
            name: customerData.customerName,
            repairReport: customerData.repairList,
            phoneNumber : customerData.phoneNumber,
            mobilePhoneNumber : customerData.mobilePhoneNumber,
            registrationDate : formatDate(customerData.registrationDate),
        }
        if(isNull(updateCustomerId)) {
            repairRef.push().set(customerObject);
        } else {
            if(updateCustomerId == "") {
                alert("예상치 못 한 오류 발생");
                resetUpdateStatus();
                return;
            }
            var updates = {};
            updates[updateCustomerId] = customerObject;
            repairRef.update(updates);
        }
        resetUpdateStatus();
        alert("반영완료");
    }
});

btnDeleteCustomer.addEventListener('click', e => {
   var confirmVal = confirm("정말 삭제하시겠습니까?");
   if(confirmVal == true) {
       customerRef.child(updateCustomerId).remove();
       alert("삭제완료");
   }
   resetUpdateStatus();
});

btnDeleteRepairCustomer.addEventListener('click', e => {
    var confirmVal = confirm("정말 삭제하시겠습니까?");
    if(confirmVal == true) {
       repairRef.child(updateCustomerId).remove();
       alert("삭제완료");
    }
    resetUpdateStatus();
});

let updateCustomer = function(customerId) {
    resetDialog();
    btnNewCustomer.click();
    btnDeleteCustomer.disabled = false;
    updateCustomerId = customerId;
    customerRef.child(customerId).once("value").then(function(snapshot) {
        var customerData = snapshot.val();
        newCustomerForm.find("input[name='customerName']").val(customerData.name);
        newCustomerForm.find("input[name='customerAge']").val(customerData.age);
        let customerSexRadio = newCustomerForm.find("input:radio[name='customerSex']");
        customerData.sex == "Male" ? customerSexRadio[0].checked = true : customerSexRadio[1].checked = true;
        let hearingAidList = customerData.hearingAid;
        if(!isNull(hearingAidList)){
            hearingAidList.forEach(function(hearingAidData, index) {
                var aidContent = $(addEarAid(hearingAidData.side));
                aidContent.find("input[name='hearingAidModel']").val(hearingAidData.model);
                aidContent.find("input[name='hearingAidPurchaseDate']").val(hearingAidData.date);
            });
        }
        newCustomerForm.find("input[name='batteryOrderDate']").val(customerData.batteryOrderDate);
        let cardAvailabilityRadio = newCustomerForm.find("input:radio[name='cardYN']");
        customerData.cardAvailability == "Yes" ? cardAvailabilityRadio[0].checked = true : cardAvailabilityRadio[1].checked = true;
        newCustomerForm.find("input[name='address']").val(customerData.address);
        newCustomerForm.find("input[name='phoneNumber']").val(customerData.phoneNumber);
        newCustomerForm.find("input[name='mobilePhoneNumber']").val(customerData.mobilePhoneNumber);
        newCustomerForm.find("input[name='registrationDate']").val(customerData.registrationDate);
        newCustomerForm.find("textarea").val(customerData.note);
    });
}

let updateRepairCustomer = function(customerId) {
    resetDialog();
    btnNewRepairCustomer.click();
    btnDeleteCustomer.disabled = false;
    updateCustomerId = customerId;

    repairRef.child(customerId).once("value").then(function(snapshot) {
        var customerData = snapshot.val();
        newRepairForm.find("input[name='customerName']").val(customerData.name);
        newRepairForm.find("input[name='phoneNumber']").val(customerData.phoneNumber);
        newRepairForm.find("input[name='mobilePhoneNumber']").val(customerData.mobilePhoneNumber);
        newRepairForm.find("input[name='registrationDate']").val(customerData.registrationDate);
        let repairList = customerData.repairReport;
        if(!isNull(repairList)){
            repairList.forEach(function(repairReport, index) {
                var repairReportContent = $(addNewRepairReport());
                repairReportContent.find("input[name='repairDate']").val(repairReport.date);
                repairReportContent.find("textarea").val(repairReport.content);
            });
        }
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
    var newAidContent =
    '<tr class="hearingAidInfoTag">'+
    '<td><label class="'+text_color+'">모델명('+side_ko+')</label></td>'+
    '<td><input class="hearingAidInfo form-control" type="text" name="hearingAidModel" side="'+side+'"/></td>'+
    '<td><label>구입날짜</label></td>'+
    '<td><input class="hearingAidInfo form-control" type="text" name="hearingAidPurchaseDate" value="'+currentDate+'" side="'+side+'"/></td>'+
    '<td><button class="btn btn-default" onclick="deleteAidContent(this)">X</button></td>'+
    '</tr>'
    return $(newAidContent).insertBefore("#batteryOrderDate");
}

let addNewRepairReport = function() {
    var newRepairReport =
    '<tr class="repairReportTag">'+
    '<td><label>수리일</label></td>'+
    '<td><input type="text" name="repairDate" class="form-control" value="'+currentDate+'"/></td>'+
    '</tr>'+
    '<tr class="repairReportTag">'+
    '<td><label>수리내역</label></td>'+
    '<td colspan="5"><textarea rows="4" colspan="4" class="form-control"></textarea></td>'+
    '</tr>'
    return $(newRepairReport).insertAfter("#repairReportList");
}

let resetDialog = function() {
    $(".hearingAidInfoTag").remove();
    $(".repairReportTag").remove();

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
}

let resetUpdateStatus = function() {
   btnCancelNewCustomer.click();
   btnCancelRepairCustomer.click();
   updateCustomerId = "";
}

let filterTable = function() {
    let filter, tr, td, i, count, listTable;
    filter = document.getElementById("filterInput").value;
    listTable = $("input:radio[name='buyRepair']:checked").val() == 'buy' ? customerListTable : repairCustomerListTable;
    tr = listTable.getElementsByTagName("tr");
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
