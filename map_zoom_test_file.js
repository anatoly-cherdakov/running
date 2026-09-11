const { chromium } = require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  let failed=false;
  for (const file of ['map-test-v34.html','map-test-v35.html']) {
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    const errors=[]; const failedReq=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>failedReq.push({url:r.url(),error:r.failure()?.errorText||'unknown'}));
    await page.goto('file://' + process.cwd() + '/' + file,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('#leaflet-map .leaflet-tile',{timeout:30000});
    await page.waitForTimeout(2500);
    const before=await page.evaluate(()=>{const e=document.querySelector('#leaflet-map');const r=e.getBoundingClientRect();return {rect:[r.x,r.y,r.width,r.height],display:getComputedStyle(e).display,visibility:getComputedStyle(e).visibility,tiles:e.querySelectorAll('.leaflet-tile').length,markers:e.querySelectorAll('.leaflet-marker-icon').length,zoomButtons:!!e.querySelector('.leaflet-control-zoom-in')};});
    await page.locator('.leaflet-control-zoom-in').click();
    await page.waitForTimeout(2500);
    const after1=await page.evaluate(()=>{const e=document.querySelector('#leaflet-map');const r=e.getBoundingClientRect();return {rect:[r.x,r.y,r.width,r.height],display:getComputedStyle(e).display,visibility:getComputedStyle(e).visibility,tiles:e.querySelectorAll('.leaflet-tile').length,markers:e.querySelectorAll('.leaflet-marker-icon').length,blank:e.querySelectorAll('.leaflet-tile').length===0};});
    await page.locator('.leaflet-control-zoom-in').click();
    await page.waitForTimeout(2500);
    const after2=await page.evaluate(()=>{const e=document.querySelector('#leaflet-map');const r=e.getBoundingClientRect();return {rect:[r.x,r.y,r.width,r.height],display:getComputedStyle(e).display,visibility:getComputedStyle(e).visibility,tiles:e.querySelectorAll('.leaflet-tile').length,markers:e.querySelectorAll('.leaflet-marker-icon').length,blank:e.querySelectorAll('.leaflet-tile').length===0};});
    console.log(JSON.stringify({file,before,after1,after2,errors,failedReq:failedReq.slice(0,20)},null,2));
    if(errors.length || after1.rect[2]===0 || after1.rect[3]===0 || after1.display==='none' || after1.visibility==='hidden' || after1.blank || after2.rect[2]===0 || after2.rect[3]===0 || after2.display==='none' || after2.visibility==='hidden' || after2.blank){failed=true;}
    await page.close();
  }
  await browser.close();
  if(failed) process.exit(1);
})();
