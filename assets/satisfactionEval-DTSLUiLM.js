import{a as e,i as t,n,o as r,r as i,t as a}from"./index-CJbuaqjQ.js";var o=e({satisfied:t(),issues:i(r().max(120)).max(5),summary:r().max(200)}),s=`你是 GeoGebra 图形逻辑审查员。对照【精炼绘图规格】检查【当前画布快照】，判断是否满足要求。

规则：
1. 规格明确要求的对象是否都存在？
2. 颜色/线型/透明度是否匹配规格？
3. 动画/轨迹是否正确启动？
4. 数学依赖关系是否正确（如对象 P 所依赖的滑块 t 是否存在）？
5. 只报告实际缺失或错误，不要吹毛求疵。

输出 JSON：
{"satisfied":true/false,"issues":["问题描述"],"summary":"一句话总结"}`;function c(e,t){return`【精炼绘图规格】\n${e}\n\n【当前画布快照】\n${t}`}async function l(e,t,r,i,l,u,d){if(t.trim().length<25)return{satisfied:!0,issues:[],summary:`规格过短，跳过评估`};let f=u??a,p=[{role:`system`,content:s},{role:`user`,content:c(t,r)}];try{let t=await f(e,p,i,l??e.model,void 0,!0,d);t.trim()||(console.warn(`[satisfactionEval] ${n()} 空响应，重试 1 次`),t=await f(e,p,i,l??e.model,void 0,!0,d));let r=t.trim().replace(/^```json?\s*/,``).replace(/\s*```$/,``).replace(/^\uFEFF/,``),a=JSON.parse(r);typeof a.satisfied==`string`&&(a.satisfied=a.satisfied.toLowerCase()===`true`);let s=o.safeParse(a);return s.success?s.data:{satisfied:!!a.satisfied,issues:Array.isArray(a.issues)?a.issues.slice(0,5):[],summary:typeof a.summary==`string`?a.summary.slice(0,200):`评估解析异常`}}catch(e){if(e instanceof DOMException&&e.name===`AbortError`)throw e;return console.warn(`[satisfactionEval] 评估调用失败，默认通过`,e),{satisfied:!0,issues:[],summary:`评估调用失败：${e instanceof Error?e.message.slice(0,100):`未知`}`}}}function u(e,t,n){return`你是 AiGGB 修复助手。上一轮生成的图形经审查存在以下问题，请修正。

【精炼绘图规格】
${e}

【当前画布状态】
${n}

【审查发现的问题】
${t.map((e,t)=>`${t+1}. ${e}`).join(`
`)}

【修复要求】
1. 只输出修正后的 commands JSON（{ "explanation": "...", "commands": [...] }）
2. 保留画布上已正确的对象（不要删除或重建）
3. 针对每个问题逐一修正：缺失对象 → 创建；颜色/样式不符 → 用 style op 修正；依赖缺失 → 补充声明
4. 如果某个问题无法修复（如超出 GGB 能力），在 explanation 中说明`}export{u as buildSatisfactionRepairPrompt,l as evaluateSatisfaction};
//# sourceMappingURL=satisfactionEval-DTSLUiLM.js.map