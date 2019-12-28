var //oXHR = oXHRMake(),
    UNINITIALIZED = 0,
    sUrl = document.location.href,
    bQuote = false,
    bANSI = false,
    bOffice = true,
    bTrim = false,
	bSMS = false,
    bBcc = false,
	sAll = "ALLE inkl lærere",
    sSep = [';', ','],
    //oList = [], //replaced by oDB
    currSelection = [],
    sGroup = "V",
    newLine = '\r\n' /*\r\n or \n*/
	//sSend=["Send e-post\&nbsp;\&nbsp;\&#9993;","Send SMS\&nbsp;\&nbsp;\&#9993;"]
	sSend=["Send e-post\u0020\u0020\u2709","Send SMS\u0020\u0020\u2709"]
	// \u0020 \u2709
    ;
	
var oSubject = {
    V: "[KG3B-1980]",
    A: "[KG3B-1980]",
    E: "[KG3B-1980 - Elever]",
    L: "[KG3B-1980 - Lærere]"
};

var oBrackets = {
    braC: ['<', '>'],
    bra1: ['<', '>'],
    bra2: ['[', ']']
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/, '');
};

function is_ios() { //Checking for Mac|iPad|iPhone|iPod
    var ios = (navigator.userAgent.match(/(Mac|iPad|iPhone|iPod)/g) ? true : false);
    if (ios) document.getElementById("sep").checked = true;
    return ios;
};

function uDef(o) {
    return (typeof o == "undefined" ? true : false)
};

function loadList() {
    bOffice = !is_ios(); //Checking for iPad|iPhone|iPod
    //ajaxData(String.fromCharCode(122, 122, 46, 116, 120, 116));
	showNameList();
};

function showNameList() {
    var oNamePage = [document.getElementById("namepage1"),document.getElementById("namepage2")];
    if (oNamePage[0].innerHTML.length == 0) {
        var nTotal = oDB.length, //oList.length,
            nCol = oNamePage.length,
			s, numPrCol = Math.ceil((nTotal+1)/ nCol), i = 0;
        for (var j = 0; j < nCol; j++) {
        	var s = '<table>', k=1;
			if (j==0) {
            	s += '<tr><td><input type="checkbox" id="all" onclick="checkNames(this.checked)" /></td>'+
				'<td width="100%"><label for="all"/><strong>'+sAll+'</strong></td></tr>';
				k++;
			}
            for (; k <= numPrCol && i < nTotal; i++, k++) {
                if (oDB[i].name == "") continue; //if (oList[i][0] == "") continue;
                s += '<tr><td><input id="cb'+i+'" type="checkbox" name="Name" value="' + i + '" '+
				'onclick="initGroup()"' + (oDB[i].email.length==0?"disabled":"") + '/></td>'+
				'<td width="100%"><label for="cb'+i+'"/>' + oDB[i].name +
				'&nbsp;&nbsp;<a class="call" href="tel:'+ oDB[i].mobile + '">&#9742;</a>' +
				'&nbsp;&nbsp;<a class="sms" href="sms:'+ oDB[i].mobile + '">SMS</a>' +
				'</td></tr>';
            }
            s += "</td></tr></table>";
    	    oNamePage[j].innerHTML = s;
        }
    }
};

function checkNames(b) {
    var oName = document.getElementsByName("Name");
    for (var i = 0; i < oName.length; i++) if (!oName[i].disabled) oName[i].checked = b;
	initGroup(b);
};

function initGroup(b){
	if (!b) document.getElementById("all").checked=false;
	sGroup = "V";
	document.getElementById("select").selectedIndex=0
	getNameList();
	showCurrSelection();
};

function showGroup(o) {
    sGroup = o.value;
    currSelection = []; //empty selection
    for (var i = 0; i < oDB.length; i++) {
        if (oDB[i].email.length != 0 && isGroup(oDB[i].category)) currSelection.push(i);
    }
	document.getElementById("all").checked=false;
	var oName = document.getElementsByName("Name");
	for (var i = 0; i < oName.length; i++) oName[i].checked = false;
	for (var i = 0; i < currSelection.length; i++) oName[currSelection[i]].checked = true;
	
	showCurrSelection();
};


function getNameList() {
    var oName = document.getElementsByName("Name");
	currSelection=[];
    for (var i = 0; i < oName.length; i++) {
        if (oName[i].checked) currSelection.push(oName[i].value);
    }
};

function showCurrSelection() {
    var oMailPage = document.getElementById("mailpage"), sMailStr, sSMSStr;
    if (oMailPage.style.display != "none") {
		if (!bSMS){
        	sMailStr = writeCurrSelection();
        	oMailPage.innerHTML = myEscape2(sMailStr);
		} else {
			sSMSStr = writeCurrSelectionSMS();
			oMailPage.innerHTML = sSMSStr;
		}
    }
};

function myEscape1(sMailStr) {
    return sMailStr.replace(new RegExp('Æ', 'g'), '%C6').replace(new RegExp('Ø', 'g'), '%D8').replace(new RegExp('Å', 'g'), '%C5').replace(new RegExp('æ', 'g'), '%E6').replace(new RegExp('ø', 'g'), '%F8').replace(new RegExp('å', 'g'), '%E5');
    //.replace(new RegExp('<','g'),'%3C').replace(new RegExp('>','g'),'%3E').replace(new RegExp(';','g'),'%3B').replace(new RegExp(' ','g'),'%20');
};

function myEscape2(sMailStr) {
    return sMailStr.replace(new RegExp('<', 'g'), '&lt;').replace(new RegExp('>', 'g'), '&gt;');
};

function fixEmails(a) {
    var fix = [],
        sQuote = (bQuote ? "\"" : "");
    for (var i = 0; i < a.length; i++) {
        fix[i] = (!bTrim ? sQuote + a[i][0].trim() + sQuote + oBrackets.braC[0] : "") + a[i][1].trim() + (!bTrim ? oBrackets.braC[1] : "");
        //fix[i]=a[i][0].trim()+" "+oBrackets.braC[0]+a[i][1].trim()+oBrackets.braC[1];
    }
    return fix.join(bOffice ? sSep[0] : sSep[1]).replace(new RegExp('#', 'g'), '@');
};

function writeCurrSelection() {
    var email, emails = [];
    for (var i = 0; i < currSelection.length; i++) {
        email = oDB[currSelection[i]].email;
        for (var j = 0; j < email.length; j++) {
            if (email[j].trim().length < 1) break;
            emails.push([oDB[currSelection[i]].name, email[j]]);
        }
    }
    return fixEmails(emails);
};

function writeCurrSelectionSMS() {
    var number, numbers = [];
    for (var i = 0; i < currSelection.length; i++) {
        number = oDB[currSelection[i]].mobile;
        numbers.push(number);
    }
    return numbers.join(',');
};

function sendSelection() {
	if (!bSMS) sendSelectionMail();
	else sendSelectionSMS(); 
};

function sendSelectionMail() {
    var sMailStr = "", sHeader = "mailto:";
	var sFooter = (sGroup.length > 0 ? "subject=" + oSubject[sGroup] : "") + "&body=%0A---------%0ASend epost: " + sUrl;
	getNameList();
    sMailStr = writeCurrSelection();
    if (!bBcc) {
        sMailStr += "?"
    } else {
        sMailStr = "?bcc=" + sMailStr + "&"
    }
    sMailStr = (bANSI ? myEscape1(sHeader + sMailStr + sFooter) : sHeader + sMailStr + sFooter);
    window.location = sMailStr;
};

function sendSelectionSMS() {
    var sSMSStr = "", sHeader = "sms:", sFooter = (bOffice?"?":";");
    //var sFooter += (sGroup.length > 0 ? "body=" + encodeURIComponent(oSubject[sGroup]) : "") + "%0A%0A---------%0ASend SMS: " + sUrl;
	var sFooter = ""; //empty footer
	getNameList();
    sSMSStr = writeCurrSelectionSMS();
    sSMSStr = sHeader + sSMSStr + sFooter;
    window.location = sSMSStr;
};

function checkBra(o) {
    var sObj = "bra" + (o.checked ? 2 : 1);
    oBrackets.braC[0] = oBrackets[sObj][0];
    oBrackets.braC[1] = oBrackets[sObj][1];
    showCurrSelection();
};

function checkANSI(o) {
    bANSI = o.checked;
};

function checkSMS(o){
	bSMS = o.checked;
    document.getElementById("trim").disabled = bSMS;
    document.getElementById("sep").disabled = bSMS;
    document.getElementById("bcc").disabled = bSMS;
    document.getElementById("ansi").disabled = bSMS;
    document.getElementById("quote").disabled = bSMS;
	oSend=document.getElementById("Send");
	oSend.value=(bSMS?sSend[1]:sSend[0])
	showCurrSelection();
}

function checkSep(o) {
    bOffice = !o.checked;
    showCurrSelection();
};

function checkBcc(o) {
    bBcc = o.checked;
};

function checkTrim(o) {
    bTrim = o.checked;
    //document.getElementById("bra").disabled = bTrim;
    document.getElementById("quote").disabled = bTrim;
    document.getElementById("ansi").disabled = bTrim;
    showCurrSelection();
};

function checkQuote(o) {
    bQuote = o.checked;
    showCurrSelection();
};

function isGroup(sValues) {
    var bOK = false;
    if (sGroup == "P") bOK = true;
    else if (sGroup == "A" && sValues.indexOf("P") == -1) bOK = true;
    else if (sValues.indexOf(sGroup) != -1) bOK = true;
    return bOK;
};

function toggleOptions(){
	var	o1 = document.getElementById("options"), d1 = o1.style.display,
		o2 = document.getElementById("mailpage"), d2 = o2.style.display;
	//o1.style.display = (d1=="inline-table" ? "none" : "inline-table");
	o1.style.display = (d1=="block" ? "none" : "block");
	o2.style.display = (d2=="block" ? "none" : "block");
};
