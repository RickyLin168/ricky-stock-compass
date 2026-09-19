const market=[['加權指數','46,280','+0.62%','up'],['台指期近月','46,210','+0.48%','up'],['台積電 2330','2,185','+0.46%','up'],['費城半導體','8,140','-0.21%','down'],['美元 / 台幣','30.18','+0.05%','up'],['美債 10Y','4.94%','風險觀察','']];
const groups={cooling:[['奇鋐','3017'],['健策','3653'],['雙鴻','3324'],['高力','8996']],server:[['緯穎','6669'],['緯創','3231'],['廣達','2382'],['鴻海','2317']],watch:[['台積電','2330'],['奇鋐','3017'],['緯穎','6669'],['聯發科','2454']]};
document.querySelector('#market').innerHTML=market.map(x=>`<div class="tile"><small>${x[0]}</small><b>${x[1]}</b><span class="${x[3]}">${x[2]}</span></div>`).join('');
for(const [id,list] of Object.entries(groups))document.querySelector('#'+id).innerHTML=list.map(x=>`<div class="stock"><b>${x[0]}</b><small>${x[1]}</small><br><em>支撐 · 量價 · 籌碼</em></div>`).join('');
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
