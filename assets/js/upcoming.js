const safeList=value=>Array.isArray(value)?value:[];
export async function loadUpcoming(fetchJson){
 const index=await fetchJson("upcoming/index.json");
 const entries=Array.isArray(index)?index:safeList(index.upcomingNovels||index.items);
 return entries.filter(item=>item&&item.id&&item.title&&item.status==="published"&&item.approvalStatus==="approved");
}
