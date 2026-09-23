const FALLBACK_MARKET=[
 {id:'TAIEX',name:'加權指數',value:'—',change:null,status:'等待資料'},
 {id:'TX',name:'台指期近月',value:'—',change:null,status:'待接期交所'},
 {id:'2330',name:'台積電 2330',value:'—',change:null,status:'證交所'},
 {id:'NASDAQ',name:'NASDAQ',value:'—',change:null,status:'待接國際源'},
 {id:'SOX',name:'費城半導體',value:'—',change:null,status:'待接國際源'},
 {id:'TSM',name:'台積電 ADR',value:'—',change:null,status:'待接國際源'},
 {id:'TWD',name:'美元 / 台幣',value:'—',change:null,status:'待接匯率源'},
 {id:'US10Y',name:'美債 10Y',value:'—',change:null,status:'待接國際源'},
 {id:'BRENT',name:'布蘭特油價',value:'—',change:null,status:'待接國際源'},
 {id:'VIX',name:'VIX',value:'—',change:null,status:'待接國際源'}
];

const groups={
 cooling:[['奇鋐','3017','散熱核心'],['健策','3653','高階散熱'],['雙鴻','3324','液冷'],['高力','8996','熱交換']],
 server:[['緯穎','6669','AI Server'],['緯創','3231','ODM'],['廣達','2382','AI Server'],['鴻海','2317','AI / 雲端']],
 watch:[['台積電','2330','權值核心'],['奇鋐','3017','散熱'],['緯穎','6669','伺服器'],['聯發科','2454','IC設計']]
};
let market=structuredClone(FALLBACK_MARKET), twseMap=new Map(), lastUpdate=null;

const n=v=>{const x=Number(String(v??'').replaceAll(',',''));return Number.isFinite(x)?x:null}
const fmt=v=>v==null?'—':Number(v).toLocaleString('en-US',{maximumFractionDigits:2});
const pct=v=>v==null?'—':`${v>0?'+':''}${v.toFixed(2)}%`;
const cls=v=>v>0?'up':v<0?'down':'flat';

function normalizeTwse(r){
 const code=r.Code??r.code??r.證券代號;
 const name=r.Name??r.name??r.證券名稱;
 const close=n(r.ClosingPrice??r.close??r.收盤價);
 const change=n(r.Change??r.change??r.漲跌價差);
 const prev=(close!=null&&change!=null)?close-change:null;
 const changePct=(prev&&change!=null)?change/prev*100:null;
 return {code,name,close,change,changePct};
}

async function fetchTWSE(){
 const res=await fetch('https://ricky-stock-api-v2.y28rf5d2rv.workers.dev');
 if(!res.ok) throw new Error(`TWSE ${res.status}`);
 const data=await res.json();
 const rows=data.stocks||[];
 const marketRows=data.market||[];
marketRows.forEach(q=>{
  const m=market.find(x=>x.id===q.id);
  if(m&&q.value!=null){
    m.value=q.value;
    m.change=q.change;
  }
});
 twseMap=new Map(rows.map(normalizeTwse).filter(x=>x.code).map(x=>[x.code,x]));
 const t=twseMap.get('2330');
 if(t){const m=market.find(x=>x.id==='2330');m.value=fmt(t.close);m.change=t.changePct;m.status='TWSE 收盤資料'}
 lastUpdate=new Date();
}

function stockCard([name,code,tag]){
 const x=twseMap.get(code);
 const price=x?fmt(x.close):'—', change=x?pct(x.changePct):'等待資料';
 return `<div class="stock ${x?.changePct>1?'strong':''}">
 <span class="tag">${tag}</span><b>${name}</b><small>${code}</small>
 <div style="margin-top:8px;font-size:16px;font-weight:700">${price}</div>
 <em class="${cls(x?.changePct)}">${change}</em></div>`;
}
function render(){
 document.querySelector('#market').innerHTML=market.map(x=>`<div class="tile"><small>${x.name}</small><b>${x.value}</b><span class="${cls(x.change)}">${x.change==null?x.status:pct(x.change)}</span></div>`).join('');
 Object.entries(groups).forEach(([id,list])=>document.querySelector('#'+id).innerHTML=list.map(stockCard).join(''));
 document.querySelector('#watchCount').textContent=`${groups.watch.length} 檔`;
 compass(); brief();
 const mode=document.querySelector('#mode');
 mode.textContent=lastUpdate?'● TWSE':'● CONNECTING';
 mode.className='live';
}
function compass(){
 const valid=market.filter(x=>x.change!=null);
 const tsmc=market.find(x=>x.id==='2330')?.change;
 if(valid.length<2){
  document.querySelector('#signal').textContent='資料建置中';
  document.querySelector('#arrow').textContent='→';
  document.querySelector('#scores').textContent='台股個股已接 TWSE；完整羅盤等待其他市場資料';
  return;
 }
 const avg=valid.reduce((s,x)=>s+x.change,0)/valid.length;
 const trend=Math.max(0,Math.min(100,50+avg*20));
 const chips=tsmc==null?50:Math.max(0,Math.min(100,50+tsmc*15));
 const risk=50, valuation=50;
 const total=trend*.4+chips*.25+risk*.2+valuation*.15;
 let signal='震盪 · 等待方向',arrow='→';
 if(total>=60){signal='偏多 · 留意震盪';arrow='↗'}
 if(total<43){signal='偏空 · 優先控風險';arrow='↘'}
 document.querySelector('#signal').textContent=signal;
 document.querySelector('#arrow').textContent=arrow;
 document.querySelector('#scores').textContent=`趨勢 ${trend.toFixed(0)}　籌碼 ${chips.toFixed(0)}　風險 ${risk}　估值 ${valuation}`;
}
function brief(){
 const stamp=lastUpdate?lastUpdate.toLocaleString('zh-TW',{hour:'2-digit',minute:'2-digit'}):'尚未取得';
 document.querySelector('#brief').innerHTML=`
 <div class="brief-item"><b>資料狀態：</b>台股上市個股已改接臺灣證券交易所 OpenAPI。最後讀取：${stamp}</div>
 <div class="brief-item"><b>AI 散熱：</b>奇鋐、健策、雙鴻、高力會直接顯示證交所最近一個交易日收盤價與漲跌幅。</div>
 <div class="brief-item"><b>AI Server：</b>緯穎、緯創、廣達、鴻海同步接入，不再使用手填假價格。</div>
 <div class="brief-item"><b>下一階段：</b>台指期與國際市場需要另一個資料層；未接上前顯示「待接」，不拿假數字冒充即時行情。</div>`;
}
function toast(s){const t=document.querySelector('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
async function update(){
 document.querySelector('#mode').textContent='● UPDATING';
 try{await fetchTWSE();render();toast('TWSE 資料更新完成 🧭')}
 catch(e){console.error(e);render();toast('TWSE 暫時讀不到，保留安全空值')}
}
document.querySelector('#refresh').onclick=update;
document.querySelector('#mode').onclick=()=>toast(lastUpdate?'台股來源：TWSE OpenAPI':'正在等待 TWSE 資料');
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');toast(b.dataset.tab==='home'?'首頁':b.querySelector('span').textContent+'下一版繼續開通')});
render(); update();
setInterval(update,60000);
fetch("https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_2330.tw&json=1&delay=0").then(r=>r.text()).then(x=>console.log("MIS2330",x)).catch(e=>console.log("MIS_ERR",e));
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');
