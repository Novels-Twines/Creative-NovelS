const safeList=value=>Array.isArray(value)?value:[];
export async function loadCharacters(fetchJson,publishedNovels){
 const index=await fetchJson("characters/index.json");
 const entries=Array.isArray(index)?index:safeList(index.characters);
 const publishedIds=new Set(publishedNovels.map(novel=>novel.id));
 return entries.filter(item=>item&&item.id&&item.name&&item.status==="published"&&item.approvalStatus==="approved"&&publishedIds.has(item.novelId));
}
