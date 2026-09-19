const market=[
 {name:'加權指數',value:'46,280',change:0.62},
 {name:'台指期近月',value:'46,210',change:0.48},
 {name:'台積電 2330',value:'2,185',change:0.46},
 {name:'NASDAQ',value:'24,860',change:0.31},
 {name:'費城半導體',value:'8,140',change:-0.21},
 {name:'台積電 ADR',value:'386.4',change:0.54},
 {name:'美元 / 台幣',value:'30.18',change:0.05},
 {name:'美債 10Y',value:'4.94%',change:null,note:'風險觀察'},
 {name:'布蘭特油價',value:'102.0',change:-1.12},
 {name:'VIX',value:'18.6',change:-2.05}
];

const groups={
 cooling:[
  {name:'奇鋐',code:'3017',tag:'散熱核心',state:'strong'},
  {name:'健策',code:'3653',tag:'高階散熱',state:''},
  {name:'雙鴻',code:'3324',tag:'液冷',state:''},
  {name:'高力',code:'8996',tag:'熱交換',state:''}
 ],
 server:[
  {name:'緯穎',code:'6669',tag:'AI Server',state:'strong'},
  {name:'緯創',code:'3231',tag:'ODM',state:''},
  {name:'廣達',code:'2382',tag:'AI Server',state:''},
  {name:'鴻海',code:'2317',tag:'AI / 雲端',state:''}
 ],
 watch:[
  {name:'台積電',code:'2330',tag:'權值核心',state:'strong'},
  {name:'奇鋐',code:'3017',tag:'散熱',state:''},
  {name:'緯穎',code:'6669',tag:'伺服器',state:''},
  {name:'聯發科',code:'2454',tag:'IC設計',state:''}
 ]
};

function cls(n){return n>0?'up':n<0?'down':'flat'}
function pct(n){return n==null?'':`${n>0?'+':''}${n.toFixed(2)}%`}
function render(){
 document.querySelector('#market').innerHTML=market.map(x=>`<div class="tile"><small>${x.name}</small><b>${x.value}</b><span class="${cls(x.change)}">${x.change==null?x.note:pct(x.change)}</span></div>`).join('');
 for(const [id,list] of Object.entries(groups)){
  document.querySelector('#'+id).innerHTML=list.map(x=>`<div class="stock ${x.state}"><span class="tag">${x.tag}</span><b>${x.name}</b><small>${x.code}</small><br><em>支撐 · 量價 · 籌碼</em></div>`).join('');
 }
 document.querySelector('#watchCount').textContent=`${groups.watch.length} 檔`;
 compass();
 brief();
}
function compass(){
 const eq=market[0].change??0, fut=market[1].change??0, tsmc=market[2].change??0, sox=market[4].change??0, vix=market[9].change??0;
 const trend=Math.max(0,Math.min(100,50+(eq+fut+tsmc+sox)*12));
 const chips=Math.max(0,Math.min(100,50+(tsmc+fut)*10));
 const risk=Math.max(0,Math.min(100,50-vix*4-(market[7].value.startsWith('5')?8:0)));
 const valuation=61;
 const total=trend*.4+chips*.25+risk*.2+valuation*.15;
 let signal='震盪 · 等待方向',arrow='→';
 if(total>=65){signal='偏多 · 留意震盪';arrow='↗'}
 if(total<45){signal='偏空 · 優先控風險';arrow='↘'}
 document.querySelector('#signal').textContent=signal;
 document.querySelector('#arrow').textContent=arrow;
 document.querySelector('#scores').textContent=`趨勢 ${trend.toFixed(0)}　籌碼 ${chips.toFixed(0)}　風險 ${risk.toFixed(0)}　估值 ${valuation}`;
}
function brief(){
 const items=[
  ['權值風向','台積電與加權是否同向帶量，若背離就降低追價衝動。'],
  ['AI 散熱','奇鋐、健策、雙鴻、高力看回測支撐後的量價反應，不只看紅綠。'],
  ['AI Server','緯穎搭配緯創、廣達、鴻海觀察族群同步性，消息面要和成交量一起驗證。'],
  ['外部風險','美債 10Y、油價、VIX 與美元/台幣一起看，避免只被單一指標牽著走。']
 ];
 document.querySelector('#brief').innerHTML=items.map(x=>`<div class="brief-item"><b>${x[0]}：</b>${x[1]}</div>`).join('');
}
function toast(s){const t=document.querySelector('#toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}
document.querySelector('#refresh').onclick=()=>{render();toast('已重新計算羅盤 🧭')};
document.querySelector('#mode').onclick=()=>toast('目前為 DEMO 示意資料');
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');toast(b.dataset.tab==='home'?'首頁':b.querySelector('span').textContent+'功能下一版接上')});
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js');