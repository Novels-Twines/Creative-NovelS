const STORAGE_KEY="novels-twines-reader-preferences";
const DEFAULTS={fontSize:18,wide:false,night:false};
function readPreferences(){try{return {...DEFAULTS,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{return {...DEFAULTS}}}
let preferences={...DEFAULTS};
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(preferences))}catch{/* Preferences remain active for this visit. */}}
function apply(){
 const paper=document.querySelector("#readerContent");
 const width=document.querySelector("#readerWidthToggle");
 const theme=document.querySelector("#readerThemeToggle");
 if(!paper)return;
 paper.style.setProperty("--reader-font-size",preferences.fontSize+"px");
 paper.classList.toggle("reader-wide",preferences.wide);
 paper.classList.toggle("reader-night",preferences.night);
 if(width){width.setAttribute("aria-pressed",String(preferences.wide));width.textContent=preferences.wide?"Narrow page":"Wide page"}
 if(theme){theme.setAttribute("aria-pressed",String(preferences.night));theme.textContent=preferences.night?"Day reading":"Night reading"}
}
export function setReaderMode(kind){const page=document.querySelector("#page-reader");if(page)page.dataset.readerKind=kind==="ColorNovel"?"color":"text"}
export function initReaderControls(){
 preferences=readPreferences();
 document.querySelector("#readerFontDown")?.addEventListener("click",()=>{preferences.fontSize=Math.max(14,preferences.fontSize-1);apply();save()});
 document.querySelector("#readerFontUp")?.addEventListener("click",()=>{preferences.fontSize=Math.min(24,preferences.fontSize+1);apply();save()});
 document.querySelector("#readerWidthToggle")?.addEventListener("click",()=>{preferences.wide=!preferences.wide;apply();save()});
 document.querySelector("#readerThemeToggle")?.addEventListener("click",()=>{preferences.night=!preferences.night;apply();save()});
 document.querySelector("#readerReset")?.addEventListener("click",()=>{preferences={...DEFAULTS};apply();save()});
 apply();
}