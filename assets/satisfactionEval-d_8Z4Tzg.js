import{a as e,i as t,n,r,t as i}from"./index-BP-gy4rc.js";var a=t({satisfied:r(),issues:n(e().max(120)).max(5),summary:e().max(200)}),o=`你是 GeoGebra 图形逻辑审查员。对照【精炼绘图规格】检查【当前画布快照】，判断是否满足要求。

规则：
1. 规格明确要求的对象是否都存在？
2. 颜色/线型/透明度是否匹配规格？
3. 动画/轨迹是否正确启动？
4. 数学依赖关系是否正确（如对象 P 所依赖的滑块 t 是否存在）？
5. 只报告实际缺失或错误，不要吹毛求疵。

输出 JSON：
{"satisfied":true/false,"issues":["问题描述"],"summary":"一句话总结"}`;function s(e,t){return`【精炼绘图规格】\n${e}\n\n【当前画布快照】\n${t}`}async function c(e,t,n,r,c,l){if(t.trim().length<25)return{satisfied:!0,issues:[],summary:`规格过短，跳过评估`};let u=l??i,d=[{role:`system`,content:o},{role:`user`,content:s(t,n)}];try{let t=(await u(e,d,r,c??e.model)).trim().replace(/^```json?\s*/,``).replace(/\s*```$/,``).replace(/^﻿/,``),n=JSON.parse(t);typeof n.satisfied==`string`&&(n.satisfied=n.satisfied.toLowerCase()===`true`);let i=a.safeParse(n);return i.success?i.data:{satisfied:!!n.satisfied,issues:Array.isArray(n.issues)?n.issues.slice(0,5):[],summary:typeof n.summary==`string`?n.summary.slice(0,200):`评估解析异常`}}catch(e){if(e instanceof DOMException&&e.name===`AbortError`)throw e;return console.warn(`[satisfactionEval] 评估调用失败，默认通过`,e),{satisfied:!0,issues:[],summary:`评估调用失败：${e instanceof Error?e.message.slice(0,100):`未知`}`}}}function l(e,t,n){return`你是 AiGGB 修复助手。上一轮生成的图形经审查存在以下问题，请修正。

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
4. 如果某个问题无法修复（如超出 GGB 能力），在 explanation 中说明`}export{l as buildSatisfactionRepairPrompt,c as evaluateSatisfaction};
//# sourceMappingURL=satisfactionEval-d_8Z4Tzg.js.map