document.addEventListener("DOMContentLoaded", function(){

const form = document.getElementById("startSessionForm");

if(form){

form.addEventListener("submit", async function(e){

e.preventDefault();

const courseId = document.getElementById("courseId").value;

if(!courseId){
alert("Choose course");
return;
}

const res = await fetch("/start-session",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
courseId:courseId
})
});

const data = await res.json();

if(data.success){
location.reload();
}else{
alert(data.message || "Failed");
}

});

}

// End session buttons
document.querySelectorAll(".btn-end-session").forEach(function(btn){
btn.addEventListener("click", async function(){
const sessionId = this.dataset.sessionId;
if(!confirm("End this session?")) return;

const res = await fetch("/end-session",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({sessionId:sessionId})
});

const data = await res.json();
if(data.success){
location.reload();
}else{
alert(data.message || "Failed");
}
});
});

// Select session for device buttons
document.querySelectorAll(".btn-select-session").forEach(function(btn){
btn.addEventListener("click", function(){
const sessionId = this.dataset.sessionId;
document.getElementById("selectedSessionId").value = sessionId;
var modal = new bootstrap.Modal(document.getElementById("deviceModal"));
modal.show();
});
});

// Device link form
const deviceForm = document.getElementById("selectDeviceForm");
if(deviceForm){
deviceForm.addEventListener("submit", async function(e){
e.preventDefault();

const sessionId = document.getElementById("selectedSessionId").value;
const deviceIp = document.getElementById("deviceIp").value.trim();

if(!deviceIp){
alert("Enter device IP");
return;
}

const res = await fetch("/select-session",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
sessionId:sessionId,
deviceIp:deviceIp
})
});

const data = await res.json();
if(data.success){
bootstrap.Modal.getInstance(document.getElementById("deviceModal")).hide();
location.reload();
}else{
alert(data.message || "Failed");
}
});
}

});
