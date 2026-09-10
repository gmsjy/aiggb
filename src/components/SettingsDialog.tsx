/**
 * API 设置面板 —— SPEC.md §5.1 / §6
 */
import { useState } from "react";
import { X, ExternalLink, ShieldAlert } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { PROVIDER_PRESETS, findProvider } from "../lib/providers";
import { ping, AIError, type AIConfig } from "../lib/aiClient";
import { isBatch3DEnabled, setBatch3DEnabled } from "../lib/repaintGate";
import { TokenUsageChart } from "./TokenUsageChart";
import { fmtTokens } from "../lib/format";

interface Props {
  onClose: () => void;
  /** 打开训练数据管理面板（可选） */
  onOpenTraining?: () => void;
}

export function SettingsDialog({ onClose, onOpenTraining }: Props) {
  const existing = useAppStore(s => s.config);
  const privacyAcknowledged = useAppStore(s => s.privacyAcknowledged);
  const setConfig = useAppStore(s => s.setConfig);
  const clearKey = useAppStore(s => s.clearKey);
  const acknowledgePrivacy = useAppStore(s => s.acknowledgePrivacy);
  const tokenHistory = useAppStore(s => s.tokenHistory);
  const totalPrompt = tokenHistory.reduce((a, r) => a + r.prompt, 0);
  const totalCompletion = tokenHistory.reduce((a, r) => a + r.completion, 0);
  const totalAll = totalPrompt + totalCompletion;

  const [providerId, setProviderId] = useState<string>(existing?.provider ?? "deepseek");
  const [baseURL, setBaseURL] = useState<string>(
    existing?.baseURL ?? findProvider("deepseek")?.baseURL ?? ""
  );
  const [apiKey, setApiKey] = useState<string>(existing?.apiKey ?? "");
  const [model, setModel] = useState<string>(
    existing?.model ?? findProvider("deepseek")?.models[0] ?? ""
  );
  const [temperature, setTemperature] = useState<number>(existing?.temperature ?? 0.2);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // ★ 角色专用模型（可选，留空则回退到主力模型）
  const [lightModel, setLightModel] = useState<string>(existing?.lightModel ?? existing?.flashModel ?? "");
  const [agentModel, setAgentModel] = useState<string>(existing?.agentModel ?? "");
  const [visionModel, setVisionModel] = useState<string>(existing?.visionModel ?? "");
  // ★ 思考深度（V4 reasoning_effort；留空 = 不发参数 = 仍会思考，none = 显式关闭）
  const [reasoningEffort, setReasoningEffort] = useState<"none" | "low" | "medium" | "high" | "">(
    existing?.reasoningEffort ?? ""
  );
  // ★ 输出预算（max_tokens；留空 = 自动：16384 / 思考模式 32768）
  const [maxOutputTokens, setMaxOutputTokens] = useState<string>(
    existing?.maxOutputTokens ? String(existing.maxOutputTokens) : ""
  );
  // ★ 3D 批量重绘开关（画布渲染策略，存 localStorage，不改 AIConfig）
  const [batch3D, setBatch3D] = useState<boolean>(() => isBatch3DEnabled());

  const preset = findProvider(providerId);

  /** 用户是否主动切到"自定义模型"输入模式 */
  const [customMode, setCustomMode] = useState<boolean>(
    () => !!(preset && preset.models.length > 0 && !preset.models.includes(model))
  );
  const [lightCustomMode, setLightCustomMode] = useState<boolean>(
    () => !!(preset && preset.models.length > 0 && lightModel !== "" && !preset.models.includes(lightModel))
  );
  const [agentCustomMode, setAgentCustomMode] = useState<boolean>(
    () => !!(preset && preset.models.length > 0 && agentModel !== "" && !preset.models.includes(agentModel))
  );
  const [visionCustomMode, setVisionCustomMode] = useState<boolean>(
    () => {
      const candidates = [...(preset?.models ?? []), ...(preset?.visionModels ?? [])];
      return !!(candidates.length > 0 && visionModel !== "" && !candidates.includes(visionModel));
    }
  );

  const onProviderChange = (id: string) => {
    setProviderId(id);
    const p = findProvider(id);
    if (p) {
      if (p.baseURL) setBaseURL(p.baseURL);
      setModel(p.models[0] ?? "");
      setCustomMode(false);
      setLightCustomMode(false);
      setAgentCustomMode(false);
      setVisionCustomMode(false);
      // 切换 provider 时不自动重置 lightModel/agentModel——用户可能想保留自定义值
    }
  };

  const buildConfig = (): AIConfig => {
    const parsedMax = Number.parseInt(maxOutputTokens.trim(), 10);
    return {
      provider: providerId,
      baseURL: baseURL.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
      temperature,
      reasoningEffort: reasoningEffort || undefined,
      maxOutputTokens: Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : undefined,
      lightModel: lightModel.trim() || undefined,
      agentModel: agentModel.trim() || undefined,
      visionModel: visionModel.trim() || undefined,
    };
  };

  const onTest = async () => {
    const cfg = buildConfig();
    if (!cfg.baseURL || !cfg.apiKey || !cfg.model) {
      setTestResult({ ok: false, msg: "请填写 baseURL / API Key / model" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await ping(cfg);
      let msg = "连接成功 ✅";
      if (cfg.visionModel) {
        try {
          await ping(cfg, undefined, cfg.visionModel);
          msg += " / 视觉模型 ✅";
        } catch (vErr) {
          const vMsg = vErr instanceof AIError ? vErr.message : vErr instanceof Error ? vErr.message : String(vErr);
          msg += ` / 视觉模型 ❌ ${vMsg.slice(0, 80)}`;
        }
      }
      setTestResult({ ok: true, msg });
    } catch (err) {
      const msg = err instanceof AIError ? err.message : err instanceof Error ? err.message : String(err);
      setTestResult({ ok: false, msg });
    } finally {
      setTesting(false);
    }
  };

  const onSave = () => {
    const cfg = buildConfig();
    if (!cfg.baseURL || !cfg.apiKey || !cfg.model) {
      setTestResult({ ok: false, msg: "请填写 baseURL / API Key / model" });
      return;
    }
    if (!isSafeBaseURL(cfg.baseURL)) {
      setTestResult({ ok: false, msg: "baseURL 必须为 http(s)://，且不允许 0.0.0.0/169.254.*" });
      return;
    }
    setConfig(cfg);
    if (!privacyAcknowledged) acknowledgePrivacy();
    onClose();
  };

  const onClear = () => {
    if (confirm("确定清除已保存的 API Key？")) {
      clearKey();
      setApiKey("");
      setTestResult({ ok: true, msg: "已从本机清除" });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>API 设置</h2>
          <button className="icon-btn" onClick={onClose} aria-label="close">
            <X size={18} />
          </button>
        </header>

        {!privacyAcknowledged && (
          <div className="privacy-banner">
            <ShieldAlert size={16} />
            <span>
              你的 API Key 将以明文保存在浏览器 localStorage 中。
              <strong>请勿在公共电脑或共享浏览器中使用本工具。</strong>
              你可以随时点击下方「清除 Key」从本机移除。
            </span>
          </div>
        )}

        <div className="form">
          <label>
            <span>Provider</span>
            <select value={providerId} onChange={e => onProviderChange(e.target.value)}>
              {PROVIDER_PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {preset?.note && <small className="hint">{preset.note}</small>}
            {preset?.apiKeyUrl && (
              <a className="hint" href={preset.apiKeyUrl} target="_blank" rel="noreferrer">
                获取 Key <ExternalLink size={10} />
              </a>
            )}
          </label>

          <label>
            <span>Base URL</span>
            <input
              type="text"
              value={baseURL}
              onChange={e => setBaseURL(e.target.value)}
              placeholder="https://api.deepseek.com/v1"
              autoComplete="off"
            />
          </label>

          <label>
            <span>API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
            />
          </label>

          <label>
            <span>主力模型 (编译/修复)</span>
            {preset && preset.models.length > 0 ? (
              <>
                <select
                  value={customMode ? "__custom__" : model}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "__custom__") { setCustomMode(true); return; }
                    setCustomMode(false);
                    setModel(v);
                  }}
                >
                  {preset.models.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                  <option value="__custom__">— 自定义 —</option>
                </select>
                {customMode && (
                  <input
                    type="text"
                    value={model}
                    placeholder="输入自定义模型名"
                    onChange={e => setModel(e.target.value)}
                    autoFocus
                    style={{ marginTop: 4 }}
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="model id"
              />
            )}
          </label>

          <details className="form-details">
            <summary>高级：角色专用模型（可选）</summary>
            <label>
              <span>轻量模型 (精炼/评估)</span>
              {preset && preset.models.length > 0 ? (
                <>
                  <select
                    value={lightCustomMode ? "__custom__" : lightModel}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === "__custom__") { setLightCustomMode(true); return; }
                      setLightCustomMode(false);
                      setLightModel(v);
                    }}
                  >
                    <option value="">跟随主力模型</option>
                    {preset.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__custom__">— 自定义 —</option>
                  </select>
                  {lightCustomMode && (
                    <input
                      type="text"
                      value={lightModel}
                      placeholder="输入自定义模型名"
                      onChange={e => setLightModel(e.target.value)}
                      autoFocus
                      style={{ marginTop: 4 }}
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={lightModel}
                  onChange={e => setLightModel(e.target.value)}
                  placeholder="留空则使用主力模型"
                />
              )}
              <small className="hint">用于 Phase 1 规格精炼和满足度评估。便宜快速的模型即可。</small>
            </label>
            <label>
              <span>Agent 模型 (对话代理)</span>
              {preset && preset.models.length > 0 ? (
                <>
                  <select
                    value={agentCustomMode ? "__custom__" : agentModel}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === "__custom__") { setAgentCustomMode(true); return; }
                      setAgentCustomMode(false);
                      setAgentModel(v);
                    }}
                  >
                    <option value="">跟随主力模型</option>
                    {preset.models.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__custom__">— 自定义 —</option>
                  </select>
                  {agentCustomMode && (
                    <input
                      type="text"
                      value={agentModel}
                      placeholder="输入自定义模型名"
                      onChange={e => setAgentModel(e.target.value)}
                      autoFocus
                      style={{ marginTop: 4 }}
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={agentModel}
                  onChange={e => setAgentModel(e.target.value)}
                  placeholder="留空则使用主力模型"
                />
              )}
              <small className="hint">用于 Agent 模式的 ReAct 循环。需支持 Function Calling。</small>
            </label>
            <label>
              <span>视觉模型 (题目识别)</span>
              {preset && (preset.models.length > 0 || (preset.visionModels?.length ?? 0) > 0) ? (
                <>
                  <select
                    value={visionCustomMode ? "__custom__" : visionModel}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === "__custom__") { setVisionCustomMode(true); return; }
                      setVisionCustomMode(false);
                      setVisionModel(v);
                    }}
                  >
                    <option value="">跟随主力模型</option>
                    {(preset.visionModels ?? []).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    {preset.models.filter(m => !(preset.visionModels ?? []).includes(m)).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="__custom__">— 自定义 —</option>
                  </select>
                  {visionCustomMode && (
                    <input
                      type="text"
                      value={visionModel}
                      placeholder="输入自定义模型名"
                      onChange={e => setVisionModel(e.target.value)}
                      autoFocus
                      style={{ marginTop: 4 }}
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={visionModel}
                  onChange={e => setVisionModel(e.target.value)}
                  placeholder="留空则使用主力模型"
                />
              )}
              <small className="hint">用于题目图片识别，需支持图片输入。DeepSeek 的 deepseek-flash（V4.1）原生多模态，视觉角色可直接跟随主力；留空时主力须为多模态模型。</small>
            </label>
            <label>
              <span>思考深度 (Thinking)</span>
              <select
                value={reasoningEffort}
                onChange={e => setReasoningEffort(e.target.value as "none" | "low" | "medium" | "high" | "")}
              >
                <option value="none">关闭（思考不占输出预算）</option>
                <option value="">跟随 provider 默认（V4.1 仍会思考）</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
              <small className="hint">
                V4 思考深度（reasoning_effort）。<strong>思考 token 与正文共享 max_tokens</strong>
                （服务端统一计入 completion tokens，客户端无法剔除），实测 baseline 下一次简单构造
                就有 <strong>90% 的输出 token 花在推理上</strong>。「关闭」= 发
                <code>reasoning_effort: "none"</code>，实测推理归零、全部预算留给正文与工具调用
                （GLM 走 <code>thinking.type=disabled</code>）；代价是复杂构造的质量可能下降。
              </small>
            </label>
            <label>
              <span>输出预算 (max_tokens)</span>
              <input
                type="number"
                min={1024}
                step={1024}
                placeholder="留空 = 自动（16384 / 思考 32768）"
                value={maxOutputTokens}
                onChange={e => setMaxOutputTokens(e.target.value)}
              />
              <small className="hint">
                单次回复的最大输出 token（思维链 + 正文共享）。这是上限而非计费量，调高不额外花钱。
                Agent 模式截断失败时会自动扩容 2 倍并降一档思考重试一次。
              </small>
            </label>
            <label>
              <span>3D 批量重绘</span>
              <select
                value={batch3D ? "on" : "off"}
                onChange={e => {
                  const on = e.target.value === "on";
                  setBatch3D(on);
                  setBatch3DEnabled(on);
                }}
              >
                <option value="on">开启（代数区不逐条重建）</option>
                <option value="off">关闭（3D 绘图区更平滑）</option>
              </select>
              <small className="hint">
                批量重绘 = 暂停重绘 → 整批执行 → 恢复重绘（一次渲染）。
                开启可避免<strong>代数区</strong>逐条重建闪烁，但 3D 恢复重绘时会整屏重建
                WebGL canvas（表现为 3D 绘图区闪一下）；关闭则相反。
                **任何非空批次都会批处理**（含单条命令，其内部常展开为多条 GGB 命令）；切换后立即生效（存 localStorage）。
              </small>
            </label>
          </details>

          {/* ── 用量统计 ── */}
          <details className="form-details usage-details" open={tokenHistory.length > 0}>
            <summary>
              用量统计
              {tokenHistory.length > 0 && (
                <span className="usage-summary-inline">
                  · {tokenHistory.length} 次对话 · 累计 {fmtTokens(totalAll)} tok
                </span>
              )}
            </summary>
            <div className="usage-totals">
              <div className="usage-total">
                <span className="usage-total-label">累计输入</span>
                <span className="usage-total-value">{fmtTokens(totalPrompt)}</span>
              </div>
              <div className="usage-total">
                <span className="usage-total-label">累计输出</span>
                <span className="usage-total-value">{fmtTokens(totalCompletion)}</span>
              </div>
              <div className="usage-total">
                <span className="usage-total-label">合计</span>
                <span className="usage-total-value">{fmtTokens(totalAll)}</span>
              </div>
            </div>
            <TokenUsageChart history={tokenHistory} />
          </details>

          <label className="row">
            <span>Temperature</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
            />
            <code>{temperature.toFixed(2)}</code>
          </label>

          {testResult && (
            <div className={`test-result ${testResult.ok ? "ok" : "fail"}`}>{testResult.msg}</div>
          )}

          <div className="actions">
            <button onClick={onTest} disabled={testing}>
              {testing ? "测试中…" : "测试连接"}
            </button>
            {onOpenTraining && (
              <button className="secondary" onClick={onOpenTraining} title="管理训练数据（导入/导出/回放）">
                训练数据
              </button>
            )}
            <div className="spacer" />
            {existing?.apiKey && (
              <button className="danger" onClick={onClear}>
                清除 Key
              </button>
            )}
            <button className="primary" onClick={onSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function isSafeBaseURL(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/^https?:\/\/(0\.0\.0\.0|169\.254\.)/i.test(url)) return false;
  return true;
}
