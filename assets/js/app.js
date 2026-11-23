import { initTheme } from "./theme.js";
import { loadCharacters } from "./characters.js";
import { loadUpcoming } from "./upcoming.js";

const CONTENT_BASE="https://raw.githubusercontent.com/Novels-Twines/Novels-Twines-Content/main/";
const CONTENT_FALLBACK_BASE="https://cdn.jsdelivr.net/gh/Novels-Twines/Novels-Twines-Content@main/";
const $=s=>document.querySelector(s);
let stories=[],colorStories=[],characters=[],upcomingStories=[],currentStory=null,currentEpisode=0,episodeCache=new Map();
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
function contentPath(path){return path.split("/").map(encodeURIComponent).join("/")}
async function fetchContent(path){
 const encoded=contentPath(path),errors=[];
 for(const base of [CONTENT_BASE,CONTENT_FALLBACK_BASE]){
  try{const response=await fetch(base+encoded,{cache:"no-store"});if(!response.ok)throw new Error("HTTP "+response.status);return response}
  catch(error){errors.push(new URL(base).host+": "+error.message)}
 }
 throw new Error("Could not retrieve "+path+". Tried primary and backup content sources ("+errors.join("; ")+").");
}
async function fetchJson(path){const response=await fetchContent(path);try{return await response.json()}catch(error){throw new Error("Invalid JSON in "+path+": "+error.message)}}
function normalizeEntry(meta,kind,index){
 const episodes=(meta.episodeIds||[]).map((id,i)=>({id,order:i+1,file:(kind==="ColorNovel"?"color-novels/":"novels/")+meta.id+"/episodes/episode-"+String(i+1).padStart(3,"0")+".md"}));
 return {...meta,type:kind,genre:Array.isArray(meta.genre)?meta.genre[0]||"General":meta.genre||"General",genres:Array.isArray(meta.genre)?meta.genre:[meta.genre||"General"],episodesList:episodes,episodes:episodes.length,episodeTitles:[],glyph:["✦","◉","◇","❧","♛","✧","☼","❀"][index%8],tone:index%6+1,updated:meta.status==="published"?"Published":"Recently added"};
}
function parseEpisodeMarkdown(markdown,path){
 const match=markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
 if(!match)throw new Error("Episode file has invalid frontmatter: "+path);
 const fields={};
 match[1].split(/\r?\n/).forEach(line=>{const part=line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);if(part)fields[part[1]]=part[2].replace(/^["']|["']$/g,"")});
 return {...fields,body:match[2].trim()};
}
async function fetchEpisodeText(path){
 const response=await fetchContent(path);
 return response.text();
}
async function loadGroup(entries,kind){
 const ids=(entries||[]).map(entry=>typeof entry==="string"?entry:entry&&entry.id).filter(Boolean);
 const loaded=await Promise.all(ids.map(id=>fetchJson((kind==="ColorNovel"?"color-novels/":"novels/")+id+"/novel.json")));
 return Promise.all(loaded.filter(meta=>meta.status==="published").map(async(meta,index)=>{
  const item=normalizeEntry(meta,kind,index),visible=[];
  for(const episodeRef of item.episodesList){
   try{const episode=parseEpisodeMarkdown(await fetchEpisodeText(episodeRef.file),episodeRef.file);if(episode.status==="published")visible.push({...episodeRef,title:episode.title||episodeRef.id})}
   catch(error){console.warn("Skipping unavailable episode:",episodeRef.id,error)}
  }
  item.episodesList=visible;item.episodes=visible.length;item.episodeTitles=visible.map(episode=>episode.title);
  return item;
 }));
}
async function loadLibrary(){
 const novelStatus=$("#novelStatus"),colorStatus=$("#colorStatus");
 for(const status of [novelStatus,colorStatus]){status.classList.remove("error");status.textContent="Connecting to the content library…"}
 try{
  const catalog=await fetchJson("catalog/index.json");
  const [novelItems,colorItems]=await Promise.all([loadGroup(catalog.novels,"Novel"),loadGroup(catalog.colorNovels,"ColorNovel")]);
  stories=novelItems;colorStories=colorItems;
  render();
  novelStatus.textContent=stories.length?"Showing approved, published novels from the content repository.": "No published novels yet. Approved stories will appear here when they are added to the public catalogue.";
  colorStatus.textContent=colorStories.length?"Showing approved, published ColorNovels from the content repository.":"No published ColorNovels yet. Approved collections will appear here when they are added to the public catalogue.";
 }catch(error){
  console.error("Content library loading failed:",error);
  const message=error&&error.message?error.message:"An unknown network or content error occurred.";
  novelStatus.textContent="The library could not be loaded. "+message+" ";
  novelStatus.classList.add("error");
  colorStatus.textContent="ColorNovels could not be loaded because the shared content catalogue request failed. ";
  colorStatus.classList.add("error");
  for(const status of [novelStatus,colorStatus]){
   const retry=document.createElement("button");
   retry.type="button";retry.className="outline-button";retry.textContent="Retry";
   retry.addEventListener("click",loadLibrary);status.appendChild(retry);
  }
  $("#resultCount").textContent="Library unavailable";
 }
}
function coverMarkup(s){return s.cover?'<img class="cover-image" src="'+escapeHtml(CONTENT_BASE+contentPath(s.cover))+'" alt="Cover of '+escapeHtml(s.title)+'" loading="lazy" onerror="this.parentElement.classList.remove(\'has-cover\');this.remove()">':""}
function card(s){const index=(s.type==="ColorNovel"?colorStories:stories).indexOf(s)+1;return '<article class="novel-card" data-story="'+escapeHtml(s.id)+'" tabindex="0" role="button" aria-label="Open '+escapeHtml(s.title)+'"><div class="cover-art tone-'+s.tone+(s.cover?' has-cover':'')+'">'+coverMarkup(s)+'<span class="cover-index">NT / '+String(index).padStart(2,"0")+'</span><span class="cover-glyph">'+escapeHtml(s.glyph)+'</span><span class="cover-kind">'+escapeHtml(s.type.toUpperCase())+'</span></div><div class="card-body"><div class="card-meta"><span>'+escapeHtml(s.genres.join(", "))+'</span><span>'+(s.type==="ColorNovel"?"FULL COLOUR":"SERIAL STORY")+'</span></div><h3>'+escapeHtml(s.title)+'</h3><div class="card-author">by '+escapeHtml(s.author)+'</div><div class="card-bottom"><span>'+s.episodes+' episode'+(s.episodes===1?"":"s")+'</span><span class="status-tag">'+escapeHtml(s.updated)+'</span></div></div></article>'}
function filtered(){const q=$("#novelSearch").value.toLowerCase(),g=$("#genreFilter").value;return stories.filter(s=>(g==="all"||s.genres.includes(g))&&[s.title,s.author,...s.genres].join(" ").toLowerCase().includes(q)).sort((a,b)=>$("#sortFilter").value==="az"?a.title.localeCompare(b.title):0)}
function render(){
 const genreFilter=$("#genreFilter");
 const selectedGenre=genreFilter.value;
 const availableGenres=[...new Set(stories.flatMap(story=>story.genres))].sort((a,b)=>a.localeCompare(b));
 genreFilter.innerHTML='<option value="all">All genres</option>'+availableGenres.map(genre=>'<option value="'+escapeHtml(genre)+'">'+escapeHtml(genre)+'</option>').join("");
 genreFilter.value=availableGenres.includes(selectedGenre)?selectedGenre:"all";
 const matches=filtered();
 const latest=stories.slice(0,4);
 $("#latestGrid").innerHTML=latest.map(card).join("")||'<div class="empty-state"><strong>Stories are being prepared</strong>New novels will appear here after their chapters are reviewed and approved.</div>';
 $("#novelGrid").innerHTML=matches.map(card).join("")||'<div class="empty-state"><strong>No matching novels</strong>Try another title, author, or genre. Published stories will appear here when they are ready.</div>';
 $("#colorGrid").innerHTML=colorStories.map(card).join("")||'<div class="empty-state"><strong>ColorNovels are in preparation</strong>Visual stories will appear here after their artwork and chapters are ready.</div>';
 const featured=stories[0];
 const featuredHost=$("#featuredStory");
 if(featured){
  featuredHost.innerHTML='<button class="featured-story-button" type="button" data-story="'+escapeHtml(featured.id)+'"><span class="featured-art tone-'+featured.tone+'">'+(featured.cover?'<img src="'+escapeHtml(CONTENT_BASE+contentPath(featured.cover))+'" alt="" loading="lazy">':'<span class="featured-art-glyph">'+escapeHtml(featured.glyph)+'</span>')+'<span class="featured-art-stamp">NOVELS-TWINES ORIGINAL</span></span><span class="featured-copy"><span class="eyebrow">START YOUR NEXT JOURNEY</span><strong>'+escapeHtml(featured.title)+'</strong><span class="featured-author">By '+escapeHtml(featured.author)+' · '+escapeHtml(featured.genres.join(", "))+'</span><span class="featured-description">'+escapeHtml(featured.description||"Open this story and explore its published episodes.")+'</span><span class="featured-cta">Explore this novel <span aria-hidden="true">↗</span></span></span></button>';
  const heroCover=$("#heroFeatureCover");
  heroCover.innerHTML=featured.cover?'<img src="'+escapeHtml(CONTENT_BASE+contentPath(featured.cover))+'" alt="Cover of '+escapeHtml(featured.title)+'" loading="lazy"><span class="hero-cover-caption">'+escapeHtml(featured.title)+'</span>':'<div class="feature-cover-placeholder"><span>NT</span><strong>'+escapeHtml(featured.title)+'</strong><small>FEATURED STORY</small></div>';
  heroCover.dataset.story=featured.id;heroCover.setAttribute("role","button");heroCover.setAttribute("tabindex","0");heroCover.setAttribute("aria-label","Open featured novel "+featured.title);
 }else{
  featuredHost.innerHTML='<div class="featured-placeholder"><span>FEATURED</span><strong>Stories are on their way</strong><p>Published novels will appear here when available.</p></div>';
  $("#heroFeatureCover").innerHTML='<div class="feature-cover-placeholder"><span>NT</span><strong>THE NEXT<br>GREAT STORY</strong><small>DISCOVER BELOW</small></div>';
  $("#heroFeatureCover").removeAttribute("data-story");$("#heroFeatureCover").removeAttribute("role");$("#heroFeatureCover").removeAttribute("tabindex");
 }
 const genreNames=[...new Set(stories.flatMap(story=>story.genres))].slice(0,8);
 $("#homeGenreChips").innerHTML=genreNames.length?genreNames.map(genre=>'<button type="button" data-genre="'+escapeHtml(genre)+'">'+escapeHtml(genre)+'</button>').join(""):'<span class="genre-empty">Genres will appear as published stories are added.</span>';
 const recentEpisodes=stories.flatMap(story=>story.episodesList.map((episode,index)=>({story,episode,index}))).slice(0,4);
 $("#latestEpisodesGrid").innerHTML=recentEpisodes.length?recentEpisodes.map(item=>'<button class="latest-episode-card" type="button" data-story="'+escapeHtml(item.story.id)+'" data-open-episode="'+item.index+'"><span class="episode-card-mark">'+escapeHtml(item.story.glyph)+'</span><span class="episode-card-copy"><small>'+escapeHtml(item.story.title)+'</small><strong>'+escapeHtml(item.episode.title||("Episode "+(item.index+1)))+'</strong><span>Read episode <span aria-hidden="true">→</span></span></span></button>').join(""):'<div class="empty-state"><strong>New chapters will appear here</strong>Published episodes from the library will be featured in this section.</div>';
 $("#resultCount").textContent=matches.length+" stories";
}
function renderCharacterCard(character){
 const image=character.image?'<img src="'+escapeHtml(CONTENT_BASE+contentPath(character.image))+'" alt="" loading="lazy">':'<span class="character-avatar-mark">'+escapeHtml((character.name||"?").slice(0,1).toUpperCase())+'</span>';
 const novel=stories.find(story=>story.id===character.novelId);
 return '<button class="character-card" type="button" data-character="'+escapeHtml(character.id)+'"><span class="character-card-art">'+image+'</span><span class="character-card-copy"><small>'+escapeHtml(character.role||"STORY CHARACTER")+'</small><strong>'+escapeHtml(character.name)+'</strong><span>'+escapeHtml(novel?novel.title:"Published story")+'</span></span></button>';
}
function renderUpcomingCard(item){
 const image=item.cover?'<img src="'+escapeHtml(CONTENT_BASE+contentPath(item.cover))+'" alt="" loading="lazy">':'<span class="upcoming-art-mark">NT</span>';
 const date=item.dateConfirmed===true&&item.expectedDate?'<span class="upcoming-date">Expected '+escapeHtml(item.expectedDate)+'</span>':'<span class="upcoming-date">Release date to be announced</span>';
 return '<article class="upcoming-card"><div class="upcoming-card-art">'+image+'<span class="coming-soon-label">COMING SOON</span></div><div class="upcoming-card-copy"><small>'+escapeHtml(item.genre||"UPCOMING STORY")+'</small><h2>'+escapeHtml(item.title)+'</h2><p>'+escapeHtml(item.teaser||"A new story is on its way.")+'</p>'+date+'</div></article>';
}
function renderPublicExtras(){
 const characterCards=characters.map(renderCharacterCard);
 $("#charactersGrid").innerHTML=characterCards.join("")||'<div class="empty-state"><strong>No public character profiles yet</strong>Character profiles will appear after they are approved and published.</div>';
 $("#homeCharactersGrid").innerHTML=characterCards.slice(0,3).join("")||'<div class="empty-state"><strong>Characters are coming</strong>Approved public profiles will be featured here.</div>';
 const upcomingCards=upcomingStories.map(renderUpcomingCard);
 $("#upcomingGrid").innerHTML=upcomingCards.join("")||'<div class="empty-state"><strong>No upcoming announcements yet</strong>Approved announcements will appear here when they are ready.</div>';
 $("#homeUpcomingGrid").innerHTML=upcomingCards.slice(0,2).join("")||'<div class="empty-state"><strong>More stories are on the horizon</strong>Approved announcements will appear here.</div>';
}
async function loadPublicExtras(){
 const characterStatus=$("#charactersStatus"),upcomingStatus=$("#upcomingStatus");
 try{
  characters=await loadCharacters(fetchJson,stories);
  characterStatus.textContent=characters.length?"Showing approved and published public character profiles.":"No approved public character profiles are available yet.";
 }catch(error){characters=[];characterStatus.textContent="Character profiles are not available yet.";console.info("Optional character catalogue unavailable:",error)}
 try{
  upcomingStories=await loadUpcoming(fetchJson);
  upcomingStatus.textContent=upcomingStories.length?"Showing approved and published upcoming-story announcements.":"No approved upcoming-story announcements are available yet.";
 }catch(error){upcomingStories=[];upcomingStatus.textContent="Upcoming announcements are not available yet.";console.info("Optional upcoming catalogue unavailable:",error)}
 renderPublicExtras();
}
function openCharacter(id){
 const character=characters.find(item=>item.id===id);if(!character)return;
 const novel=stories.find(story=>story.id===character.novelId);
 const image=character.image?'<img src="'+escapeHtml(CONTENT_BASE+contentPath(character.image))+'" alt="'+escapeHtml(character.name)+'">':'<div class="character-profile-placeholder">'+escapeHtml((character.name||"?").slice(0,1).toUpperCase())+'</div>';
 $("#characterProfile").innerHTML='<div class="character-profile-art">'+image+'</div><div class="character-profile-copy"><div class="eyebrow">CHARACTER PROFILE</div><h1>'+escapeHtml(character.name)+'</h1><div class="character-role">'+escapeHtml(character.role||"Story character")+'</div><p>'+escapeHtml(character.introduction||"A character in the Novels-Twines story collection.")+'</p><div class="character-related"><small>FEATURED IN</small><strong>'+escapeHtml(novel?novel.title:"A published Novels-Twines story")+'</strong>'+(novel?'<button class="primary-button" type="button" data-story="'+escapeHtml(novel.id)+'">Explore this novel →</button>':'')+'</div></div>';
 go("character-detail");
}
function go(p){const target=$("#page-"+p);if(!target)return;document.querySelectorAll(".page").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-hidden","true")});target.classList.add("active");target.setAttribute("aria-hidden","false");document.querySelectorAll(".nav-link").forEach(x=>{const active=x.dataset.page===(p==="character-detail"?"characters":p);x.classList.toggle("active",active);if(active)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current")});$("#mainNav").classList.remove("open");$("#mobileMenu").setAttribute("aria-expanded","false");window.scrollTo({top:0,behavior:"smooth"})}
function getEpisodePath(story,index){return story.episodesList[index].file}
async function getEpisode(story,index){
 const path=getEpisodePath(story,index);
 if(episodeCache.has(path))return episodeCache.get(path);
 const episode=parseEpisodeMarkdown(await fetchEpisodeText(path),path);
 if(episode.status!=="published")throw new Error("This episode is not published.");
 episodeCache.set(path,episode);return episode;
}
function renderMarkdown(source){
 const escaped=escapeHtml(source);
 return escaped.split(/\n{2,}/).map(block=>{
  const lines=block.split("\n");
  if(lines.every(line=>/^#{1,3}\s/.test(line)))return lines.map(line=>{const n=line.match(/^(#{1,3})\s(.*)$/);return n?"<h"+n[1].length+">"+n[2]+"</h"+n[1].length+">":""}).join("");
  if(lines.every(line=>/^>\s?/.test(line)))return "<blockquote>"+lines.map(line=>line.replace(/^>\s?/,"")).join("<br>")+"</blockquote>";
  if(lines.every(line=>/^[-*]\s/.test(line)))return "<ul>"+lines.map(line=>"<li>"+line.replace(/^[-*]\s/,"")+"</li>").join("")+"</ul>";
  return "<p>"+lines.join("<br>")+"</p>";
 }).join("");
}
async function openStory(id){
 currentStory=[...stories,...colorStories].find(s=>s.id===id);
 if(!currentStory)return;
 const s=currentStory;
 const cover='<div class="detail-cover cover-art tone-'+s.tone+(s.cover?' has-cover':'')+'">'+coverMarkup(s)+'<span class="cover-glyph">'+escapeHtml(s.glyph)+'</span></div>';
 $("#detailContent").innerHTML=cover+'<div class="detail-copy"><div class="eyebrow">'+escapeHtml(s.type.toUpperCase())+' / '+escapeHtml(s.genres.join(", ").toUpperCase())+'</div><h1>'+escapeHtml(s.title)+'</h1><div class="card-author">Written by '+escapeHtml(s.author)+' · '+s.episodes+' episodes</div><p class="description">'+escapeHtml(s.description)+'</p><div class="detail-tags">'+s.genres.map(g=>'<span>'+escapeHtml(g)+'</span>').join("")+'<span>'+escapeHtml(s.type)+'</span><span>Novels-Twines</span></div><h2>Episodes</h2><div class="episode-list">'+(s.episodesList.length?s.episodesList.map((ep,i)=>'<button class="episode-row" data-episode="'+i+'"><span>Episode '+String(i+1).padStart(2,"0")+' — '+escapeHtml(ep.id)+'</span><small>Read →</small></button>').join(""):'<p class="description">No published episodes are available yet.</p>')+'</div></div>';
 $("#detailBack").dataset.go=s.type==="ColorNovel"?"color":"novels";
 go("detail");
 for(let i=0;i<s.episodesList.length;i++){try{const ep=await getEpisode(s,i);const row=$("#detailContent").querySelector('[data-episode="'+i+'"]');if(row)row.querySelector("span").textContent="Episode "+String(i+1).padStart(2,"0")+" — "+(ep.title||ep.id)}catch(err){console.warn(err)}}
}
async function openEpisode(i){
 if(!currentStory||!currentStory.episodesList[i])return;
 currentEpisode=Math.max(0,Math.min(i,currentStory.episodesList.length-1));
 $("#readerContent").innerHTML='<p class="reader-loading">Loading episode…</p>';$("#episodePosition").textContent="Loading…";go("reader");
 try{
  const ep=await getEpisode(currentStory,currentEpisode);
  $("#readerContent").innerHTML='<div class="chapter-kicker">'+escapeHtml(currentStory.title.toUpperCase())+'</div><h1>'+escapeHtml(ep.title||"Episode "+(currentEpisode+1))+'</h1>'+renderMarkdown(ep.body);
  $("#episodePosition").textContent='Episode '+(currentEpisode+1)+' of '+currentStory.episodesList.length;
 }catch(error){
  console.error(error);$("#readerContent").innerHTML='<h1>Episode unavailable</h1><p>The episode could not be loaded. Check your connection and try again.</p><button class="outline-button" type="button" data-episode="'+currentEpisode+'">Retry episode</button>';$("#episodePosition").textContent="Unavailable";
 }
 $("#prevEpisode").disabled=currentEpisode===0;
 $("#nextEpisode").textContent=currentEpisode===currentStory.episodesList.length-1?"Back to novel":"Next episode →";
}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
document.addEventListener("click",e=>{
 const p=e.target.closest("[data-page]");if(p){e.preventDefault();go(p.dataset.page);return}
 const g=e.target.closest("[data-go]");if(g){go(g.dataset.go);return}
 const character=e.target.closest("[data-character]");if(character){openCharacter(character.dataset.character);return}
 const c=e.target.closest("[data-story]");if(c){if(c.dataset.openEpisode!==undefined){openStory(c.dataset.story).then(()=>openEpisode(Number(c.dataset.openEpisode)));return}openStory(c.dataset.story);return}
 const genre=e.target.closest("[data-genre]");if(genre){$("#genreFilter").value=genre.dataset.genre;render();go("novels");return}
 const ep=e.target.closest("[data-episode]");if(ep)openEpisode(Number(ep.dataset.episode));
});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-story]")){e.preventDefault();e.target.click()}});
$("#novelSearch").addEventListener("input",render);$("#genreFilter").addEventListener("change",render);$("#sortFilter").addEventListener("change",render);
$("#mobileMenu").addEventListener("click",()=>{const open=$("#mainNav").classList.toggle("open");$("#mobileMenu").setAttribute("aria-expanded",String(open))});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("#mainNav").classList.contains("open")){$("#mainNav").classList.remove("open");$("#mobileMenu").setAttribute("aria-expanded","false");$("#mobileMenu").focus()}});
$("#loginButton").addEventListener("click",()=>toast("Sign-in will be connected when the backend is ready."));
$("#readerBack").addEventListener("click",()=>go("detail"));
$("#characterBack").addEventListener("click",()=>go("characters"));
$("#prevEpisode").addEventListener("click",()=>openEpisode(currentEpisode-1));
$("#nextEpisode").addEventListener("click",()=>currentEpisode===currentStory.episodesList.length-1?go("detail"):openEpisode(currentEpisode+1));
$("#year").textContent=new Date().getFullYear();
initTheme();
document.querySelectorAll(".page").forEach(x=>x.setAttribute("aria-hidden",String(!x.classList.contains("active"))));
render();loadLibrary().then(loadPublicExtras);
