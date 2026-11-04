import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import { S3Client, ListObjectVersionsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
const base = process.env.AUTH_TEST_URL || "http://127.0.0.1:3001";
const uri = process.env.AUTH_TEST_MONGODB_URI || "mongodb://127.0.0.1:27028/?replicaSet=studydesk-test";
const databaseName = process.env.AUTH_TEST_MONGODB_DB || "studydesk_auth_test_subjects";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
assert.match(uri, /^mongodb:\/\/(?:127\.0\.0\.1|localhost):\d+\//); assert.ok(databaseName.startsWith("studydesk_auth_test"));
for (const name of ["B2_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_NAME", "B2_ENDPOINT", "B2_REGION"]) assert.ok(process.env[name], `Configure ${name} privately for the storage test`);
const mongo = new MongoClient(uri); const run = randomUUID(); const emails = [`materials-a-${run}@example.test`, `materials-b-${run}@example.test`];
const keys = new Set(); const s3 = new S3Client({ endpoint: process.env.B2_ENDPOINT, region: process.env.B2_REGION, forcePathStyle: true, credentials: { accessKeyId: process.env.B2_KEY_ID, secretAccessKey: process.env.B2_APPLICATION_KEY }, requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED" });
function browser(last) { const cookies = new Map(); return { async request(path, method = "GET", body) { const headers = { Origin: base, "x-forwarded-for": `127.${parseInt(run.slice(0, 2), 16)}.${parseInt(run.slice(2, 4), 16)}.${last}` }; if (cookies.size) headers.Cookie = [...cookies].map(([k,v])=>`${k}=${v}`).join("; "); if(body!==undefined)headers["Content-Type"]="application/json"; const response=await fetch(base+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});for(const value of response.headers.getSetCookie()){const pair=value.split(";")[0],i=pair.indexOf("=");cookies.set(pair.slice(0,i),pair.slice(i+1))}return response; } }; }
async function json(browser,path,method,body,status=200){const response=await browser.request(path,method,body);assert.equal(response.status,status,`${method||"GET"} ${path.split('?')[0]}`);return response.json()}
let connected=false;
try {
 await mongo.connect();connected=true;const db=mongo.db(databaseName);const a=browser(61),b=browser(62),guest=browser(63);
 const users=[];for(const [index,client] of [a,b].entries()){const result=await json(client,"/api/auth/sign-up/email","POST",{name:"Materials student",email:emails[index],password:randomUUID()+"-Password"});users.push(result.user)}
 const subjectA=(await json(a,"/api/subjects","POST",{name:"Full subject",description:"",colour:"sage",goal:45},201)).subject;
 const subjectB=(await json(b,"/api/subjects","POST",{name:"Quota subject",description:"",colour:"sand",goal:null},201)).subject;
 const root=`/api/subjects/${subjectA.id}`, other=`/api/subjects/${subjectB.id}`;
 assert.equal((await guest.request(root+"/workspace")).status,401);assert.equal((await b.request(root+"/workspace")).status,404);
 const folder=(await json(a,root+"/folders","POST",{name:"Chapter one",parentId:null},201)).folder;
 assert.equal((await a.request(root+"/folders","POST",{name:"CHAPTER ONE",parentId:null})).status,409);
 const child=(await json(a,root+"/folders","POST",{name:"Subchapter",parentId:folder.id},201)).folder;
 assert.equal((await a.request(root+`/folders/${folder.id}`,"PATCH",{name:"Chapter one",parentId:child.id})).status,400);
 assert.equal((await b.request(other+"/folders","POST",{name:"Foreign parent",parentId:folder.id})).status,404);
 assert.equal((await b.request(root+`/folders/${folder.id}`,"DELETE")).status,404);
 let parent=child.id;for(let depth=3;depth<=5;depth++)parent=(await json(a,root+"/folders","POST",{name:`Level ${depth}`,parentId:parent},201)).folder.id;
 assert.equal((await a.request(root+"/folders","POST",{name:"Too deep",parentId:parent})).status,400);
 const link=(await json(a,root+"/resources","POST",{type:"link",title:"Class recording",url:"https://example.com/class",folderId:child.id},201)).resource;
 assert.equal((await a.request(root+"/resources","POST",{type:"link",title:"Unsafe",url:"javascript:alert(1)",folderId:null})).status,400);
 await json(a,root+`/resources/${link.id}`,"PATCH",{title:"Renamed class",url:"https://example.com/revision",folderId:null});
 let workspace=await json(a,root+"/workspace");assert.equal(workspace.resources[0].title,"Renamed class");assert.ok(!("key" in workspace.resources[0]));
 let note=(await json(a,root+"/note")).note;assert.equal(note.version,0);note=(await json(a,root+"/note","PUT",{body:"Remember this idea.",version:0})).note;assert.equal(note.version,1);
 assert.equal((await a.request(root+"/note","PUT",{body:"Stale",version:0})).status,409);assert.equal((await b.request(root+"/note")).status,404);assert.equal((await a.request(root+"/note","PUT",{body:"x".repeat(20001),version:1})).status,400);
 const pdf=Buffer.from("%PDF-1.4\n% Test object for header validation\n%%EOF\n");
 const ticket=await json(a,root+"/resources","POST",{type:"pdf",title:"Private test PDF",size:pdf.length,folderId:child.id},201);keys.add(`studydesk/${users[0].id}/${ticket.resource.id}.pdf`);
 const uploaded=await fetch(ticket.uploadUrl,{method:"PUT",headers:{"Content-Type":"application/pdf"},body:pdf});assert.ok(uploaded.ok,`B2 upload status ${uploaded.status}`);
 await json(a,root+`/resources/${ticket.resource.id}/complete`,"POST");
 // A reused upload URL must not replace the validated version, and deferred cleanup removes extras.
 assert.equal((await fetch(base+"/api/maintenance/storage")).status,401);
 assert.ok(process.env.CRON_SECRET, "Configure CRON_SECRET for cleanup verification");
 assert.ok((await fetch(ticket.uploadUrl,{method:"PUT",headers:{"Content-Type":"application/pdf"},body:pdf})).ok);
 await db.collection("storage_cleanup").updateMany({userId:users[0].id},{ $set:{after:new Date(0)} });
 const maintenance=await fetch(base+"/api/maintenance/storage",{headers:{Authorization:`Bearer ${process.env.CRON_SECRET}`}});assert.equal(maintenance.status,200);
 const versions=await s3.send(new ListObjectVersionsCommand({Bucket:process.env.B2_BUCKET_NAME,Prefix:`studydesk/${users[0].id}/${ticket.resource.id}.pdf`}));
 assert.equal(versions.Versions.filter(item=>item.Key===`studydesk/${users[0].id}/${ticket.resource.id}.pdf`).length,1);

 const file=await json(a,root+`/resources/${ticket.resource.id}/file`);const bytes=Buffer.from(await (await fetch(file.url)).arrayBuffer());assert.deepEqual(bytes,pdf);
 assert.equal((await b.request(root+`/resources/${ticket.resource.id}/file`)).status,404);
 const publicUrl=new URL(file.url);publicUrl.search="";assert.ok([401,403].includes((await fetch(publicUrl)).status),"PDF must not be public");
 const download=await json(a,root+`/resources/${ticket.resource.id}/file?download=1`);assert.match((await fetch(download.url)).headers.get("content-disposition"),/attachment/);
 await json(a,root+`/resources/${ticket.resource.id}`,"PATCH",{title:"Renamed PDF",folderId:folder.id});
 const invalid=await json(a,root+"/resources","POST",{type:"pdf",title:"Not a PDF",size:16,folderId:null},201);keys.add(`studydesk/${users[0].id}/${invalid.resource.id}.pdf`);assert.ok((await fetch(invalid.uploadUrl,{method:"PUT",headers:{"Content-Type":"application/pdf"},body:Buffer.from("not-a-pdf-123456")})).ok);assert.equal((await a.request(root+`/resources/${invalid.resource.id}/complete`,"POST")).status,400);await json(a,root+`/resources/${invalid.resource.id}`,"DELETE");
 // Reserve quotas without uploading large files, then release every reservation.
 const pending=[];for(let i=0;i<5;i++){const value=await json(b,other+"/resources","POST",{type:"pdf",title:`Reservation ${i}`,size:20*1024*1024,folderId:null},201);pending.push(value.resource.id);keys.add(`studydesk/${users[1].id}/${value.resource.id}.pdf`)}
 assert.equal((await b.request(other+"/resources","POST",{type:"pdf",title:"Over quota",size:10,folderId:null})).status,413);for(const resource of pending)await json(b,other+`/resources/${resource}`,"DELETE");assert.equal((await json(b,other+"/workspace")).usedBytes,0);
 await json(a,root+`/folders/${folder.id}`,"DELETE");workspace=await json(a,root+"/workspace");assert.equal(workspace.folders.length,0);assert.equal(workspace.usedBytes,0);assert.equal(workspace.resources.length,1); // root link remains
 assert.equal((await a.request(root+`/resources/${ticket.resource.id}/file`)).status,404);
 await json(a,root,"DELETE");assert.equal(await db.collection("notes").countDocuments({userId:users[0].id,subjectId:subjectA.id}),0);assert.equal((await a.request(root+"/workspace")).status,404);
 console.log("Passed: nested folders/depth/cycle checks, links, private B2 upload/validation/view/download, rename/move, quotas, notes/conflicts, owner isolation, recursive deletion and storage cleanup.");
} finally {
 // Only exact keys created by this run are ever removed from B2.
 for(const key of keys){try{const versions=await s3.send(new ListObjectVersionsCommand({Bucket:process.env.B2_BUCKET_NAME,Prefix:key}));for(const object of [...(versions.Versions||[]),...(versions.DeleteMarkers||[])])if(object.Key===key&&object.VersionId)await s3.send(new DeleteObjectCommand({Bucket:process.env.B2_BUCKET_NAME,Key:key,VersionId:object.VersionId}))}catch{console.error("Temporary B2 object cleanup needs retry");process.exitCode=1}}
 if(connected){const db=mongo.db(databaseName);const users=await db.collection("user").find({email:{$in:emails}}).toArray();const ids=users.map(u=>u._id),owners=ids.map(String);if(ids.length){for(const name of ["subjects","folders","resources","notes","storage_cleanup"])await db.collection(name).deleteMany({userId:{$in:owners}});await db.collection("storage_usage").deleteMany({_id:{$in:owners}});for(const name of ["account","session"])await db.collection(name).deleteMany({userId:{$in:ids}});await db.collection("user").deleteMany({_id:{$in:ids}})}}
 s3.destroy();await mongo.close();
}
