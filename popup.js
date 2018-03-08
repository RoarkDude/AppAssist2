var app_id = "appxKEtWQ9a2e7DZ0";
var app_key = "keySu6kOnDcoz4oQL";

//function getAirtable() {
//    axios.get(
//        "https://api.airtable.com/v0/" + app_id + "/Job%20Leads?maxRecords=3&view=Open%20Positions",
//        {
//            headers: { Authorization: "Bearer " + app_key }
//        }
//    ).then(function (response) {
//        console.log(response);
//        //self.items = response.data.records
//    }).catch(function (error) {
//        console.log(error)
//    });
//}

function makeUrl(tableName, viewName) {
    return "https://api.airtable.com/v0/" + app_id + "/" + encodeURI(tableName) + "?maxRecords=1&view=" + encodeURI(viewName);
}


function getCompany(companyName) {
    console.log('getCompany()');
    var url = makeUrl('Companies', 'All Companies') + "&fields[]=Company&filterByFormula=({Company}='" + encodeURI(companyName) + "')";

    axios.get(
        url,
        {
            headers: { Authorization: "Bearer " + app_key }
        }
    ).then(function (response) {
        console.log('getCompany() then');
        if (response.data.records.length == 0) {
            addCompany(companyName);
        }
        else {
            getJobLead(companyName, response.data.records[0].id);
        }
    }).catch(function (error) {
        console.log(error);
    });
    console.log('getCompany() done');
}

function addCompany(companyName) {
    console.log('addCompany()');

    var locationName = $('#location').val();
    var axiosConfig = {
        "headers": {
            'Authorization': 'Bearer ' + app_key,
            'Content-Type': 'application/json'
        }
    }

    var data = {
        "fields": {
            "Company": companyName,
            "Location": locationName
        }
    }

    url = "https://api.airtable.com/v0/" + app_id + "/" + encodeURI('Companies');
    axios.post(url, data, axiosConfig)
        .then(function (response) {
            if (response.data == undefined) {
                alert('error adding company');
            }
            else {
                getJobLead(companyName, response.data.id);
            }
        }).catch(function (error) {
            console.log(error);
        });
    console.log('addCompany() done');
}

function getJobLead(companyName, companyRecId) {
    console.log('getJobLead()');
    alert('getJobLead');
    var roleName = $('#role').val();
    if (roleName == '') return;

    var url = makeUrl('Job Leads', 'By Date') + "&fields[]=Company&filterByFormula=({Job}='" + encodeURI(companyName) + ' - ' + encodeURI(roleName) + "')";
    axios.get(
        url,
        {
            headers: { Authorization: "Bearer " + app_key }
        }
    ).then(function (response) {
        if (response.data.records.length == 0)
            addJobLead(companyRecId, roleName);
        //        else
        //            $('#alertthere').alert();
    }).catch(function (error) {
        console.log(error)
    });
    console.log('getJobLead() done');
}

function addJobLead(companyRecId, roleName) {
    console.log('addJobLead()');
    var requisitionName = $('#requisition').val();
    var linkUrl = $('#link').val();

    var axiosConfig = {
        "headers": {
            'Authorization': 'Bearer ' + app_key,
            'Content-Type': 'application/json'
        }
    }

    var data = {
        "fields": {
            "Job Title": roleName,
            "Applied": moment(new Date()).format("YYYY-MM-DD"),
            "Company": [companyRecId],
            "Link": linkUrl,
            "Requisition #": requisitionName
        }
    }

    url = "https://api.airtable.com/v0/" + app_id + "/" + encodeURI('Job Leads')
    axios.post(url, data, axiosConfig)
        .then(function (response) {
            if (response.data == undefined)
                //                alert('Error adding Job Lead');
                console.log('Error adding Job Lead')
            //else
            //$('#alertsaved').alert();
        }).catch(function (error) {
            //alert('Error adding Job Lead');
            console.log('Error adding Job Lead')
        });
    console.log('addJobLead() done');
}

function saveJobData() {
    var companyName = $('#company').val();
    if (companyName == '') return;
    getCompany(companyName);
}

function makeCoverLetter() {
    var mylink = document.getElementById("link");
    mylink.setAttribute("href", "NBCUniversal - Finance Business Systems Analyst - Home Entertainment Technology - 36977BR.docx");
    mylink.click();
}

//function saveProfileData() {
//    $("form#profile :input").each(function () {
//        saveFormInput($(this));
//    });
//    console.log('post save data');
//    dumpData();

//}

function saveFormInput(inputTag) {
    var inputId = inputTag[0].id;
    var theValue = $("#" + inputId).val();
    if (theValue) {
        var data = {};
        data[inputId] = theValue;
        chrome.storage.local.set(data, function () {
            if (chrome.runtime.lastError) {
                console.log("Error Storing: " + chrome.runtime.lastError);
            }
            //            console.log('set ');
        });
    }
}

function getUrl() {
    chrome.tabs.getSelected(null, function (tab) {
        $('#link').val(tab.url);
        saveFormInput($('#link'))
    });
}

function loadFormData() {
    $("form#profile :input").each(function () {
        loadFormInput($(this));
    });
}

function dumpData() {
    chrome.storage.local.get(function (items) {
        $.each(items, function (index, value) {
            console.log(index + ':' + value);
        });
    });
}

function loadFormInput(inputTag) {
    if (inputTag[0].type == 'submit') return;
    var inputId = inputTag[0].id;
    chrome.storage.local.get(inputId, function (items) {
        if (items[inputId] === undefined) {
            //console.log('No email found');
            return;
        }
        //console.log(items[inputId]);
        $("#" + inputId).val(items[inputId]);
    });
}

function listStoredFields() {
    $(".storage").each(function () {
        console.log(this.id);
    });

    //$("form#profile :input").each(function () {
    //    console.log(this.id);
    //});
}

//$(document).ready(function () {
//    $(".alert").alert('close');
//})

document.addEventListener('DOMContentLoaded', function () {
    //alert('loaded');
    $(".storage").each(function () {
        this.addEventListener('change', function () {
            saveFormInput($(this));
        })
    });

    var saveJobButton = document.getElementById('saveJob');
    saveJobButton.addEventListener('click', function () {
        asyncSaveJobData();
        //const asyncSaveJobData = async () => await sveJobData();
        //asyncSaveJobData();
    })

    var makeCoverLetterButton = document.getElementById('makeCoverLetter');
    makeCoverLetterButton.addEventListener('click', function () {
        makeCoverLetter();
    })

    

    var getUrlButton = document.getElementById('getUrl');
    getUrlButton.addEventListener('click', function () {
        getUrl();
    })

    //var saveProfileButton = document.getElementById('saveProfile');
    //saveProfileButton.addEventListener('click', function () {
    //    saveProfileData();
    //})

    //console.log('initial data');
    //dumpData();

    loadFormData();
});

//function storage_sync_append(val) {
//    // In get, {'data': []} sets the key value pair if it didn't exist; 
//    // in this case the value is an empty Array
//    chrome.storage.sync.get({ 'data': [] }, result => {
//        var temp = result.data;
//        temp.push(val);
//        chrome.storage.sync.set({ 'data': temp }, function () {
//            if (chrome.runtime.error) {
//                console.log("Runtime error.");
//            }
//        });
//    });
//}

//As an aside, if you have more than one array to store with chrome.storage, the append function can be rewritten to work with any key:

//function storage_sync_append(key, data) {
//    //
//    chrome.storage.sync.get({ [key]: [] }, result => {
//        var temp
//        for (property in result)
//            if (property == key)
//                temp = result[property];

//        temp.push(data);
//        chrome.storage.sync.set({ [key]: temp }, function () {
//            if (chrome.runtime.error) {
//                console.log("Runtime error.");
//            }
//        });
//    });
//}

function clearData() {
    var toRemove = [];

    chrome.storage.local.get(function (Items) {
        $.each(Items, function (index, value) {
            toRemove.push(index);
        });

        console.log(toRemove);

        chrome.storage.local.remove(toRemove, function (Items) {
            console.log("removed");

            chrome.storage.local.get(function (Items) {
                $.each(Items, function (index, value) {
                    console.log(index);
                });
            });
        });
    });

};

