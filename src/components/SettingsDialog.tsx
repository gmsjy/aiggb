/**
 * API 设置面板 —— SPEC.md §5.1 / §6
 */
import { useState } from "react";
import { X, ExternalLink, ShieldAlert } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { PROVIDER_PRESETS, findProvider } from "../lib/providers";
import { ping, AIError, type AIConfig } from "../lib/aiClient";

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

  const onProviderChange = (id: string) => {
    setProviderId(id);
    const p = findProvider(id);
    if (p) {
      if (p.baseURL) setBaseURL(p.baseURL);
      setModel(p.models[0] ?? "");
      setCustomMode(false);
      setLightCustomMode(false);
      setAgentCustomMode(false);
      // 切换 provider 时不自动重置 lightModel/agentModel——用户可能想保留自定义值
    }
  };

  const buildConfig = (): AIConfig => ({
    provider: providerId,
    baseURL: baseURL.trim(),
    apiKey: apiKey.trim(),
    model: model.trim(),
    temperature,
    lightModel: lightModel.trim() || undefined,
    agentModel: agentModel.trim() || undefined,
  });

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
      setTestResult({ ok: true, msg: "连接成功 ✅" });
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
