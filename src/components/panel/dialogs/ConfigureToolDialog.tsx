import { useState, useEffect } from 'react';
import { Webhook, Plug, Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ToolItem } from '@/hooks/useCanvasState';

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
}

interface ConfigureToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'webhook' | 'custom_api';
  editTool?: ToolItem | null;
  onSave: (tool: Omit<ToolItem, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<ToolItem>) => void;
}

export default function ConfigureToolDialog({
  open,
  onOpenChange,
  mode,
  editTool,
  onSave,
  onUpdate,
}: ConfigureToolDialogProps) {
  const isEditing = !!editTool;
  const isWebhook = mode === 'webhook';

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState(isWebhook ? 'POST' : 'GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [timeout, setTimeout] = useState(20);
  const [disableInterruptions, setDisableInterruptions] = useState(false);
  const [executionMode, setExecutionMode] = useState('immediate');
  const [parameters, setParameters] = useState<Parameter[]>([]);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      if (editTool) {
        setName(editTool.name);
        setDescription(editTool.description);
        setMethod(editTool.config.method || (isWebhook ? 'POST' : 'GET'));
        setUrl(editTool.config.url || '');
        setHeaders(editTool.config.headers || '');
        setTimeout(parseInt(editTool.config.timeout || '20', 10));
        setDisableInterruptions(editTool.config.disableInterruptions === 'true');
        setExecutionMode(editTool.config.executionMode || 'immediate');
        try {
          setParameters(JSON.parse(editTool.config.parameters || '[]'));
        } catch {
          setParameters([]);
        }
      } else {
        setName('');
        setDescription(isWebhook ? 'Custom webhook' : 'Custom API tool');
        setMethod(isWebhook ? 'POST' : 'GET');
        setUrl('');
        setHeaders('');
        setTimeout(20);
        setDisableInterruptions(false);
        setExecutionMode('immediate');
        setParameters([]);
      }
    }
  }, [open, editTool, isWebhook]);

  const handleSave = () => {
    const config: Record<string, string> = {
      method,
      url,
      headers,
      timeout: String(timeout),
      disableInterruptions: String(disableInterruptions),
      executionMode,
      parameters: JSON.stringify(parameters),
    };

    if (isEditing && editTool && onUpdate) {
      onUpdate(editTool.id, { name, description, config });
    } else {
      onSave({
        category: mode,
        name,
        description,
        enabled: true,
        config,
      });
    }
    onOpenChange(false);
  };

  const addParameter = () => {
    setParameters([...parameters, { name: '', type: 'string', required: false }]);
  };

  const updateParameter = (index: number, updates: Partial<Parameter>) => {
    setParameters(parameters.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="max-w-lg flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isWebhook ? 'bg-blue-50' : 'bg-purple-50'}`}>
              {isWebhook
                ? <Webhook className="h-4.5 w-4.5 text-blue-600" />
                : <Plug className="h-4.5 w-4.5 text-purple-600" />
              }
            </div>
            <SheetTitle className="text-[16px]">
              {isEditing
                ? `Edit ${isWebhook ? 'Webhook' : 'API'} Tool`
                : `Add ${isWebhook ? 'Webhook' : 'Custom API'} Tool`
              }
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 space-y-6 min-h-0 py-6">

          {/* Configuration Section */}
          <section>
            <div className="mb-1">
              <h3 className="text-[13px] font-semibold">Configuration</h3>
              <p className="text-[11px] text-muted-foreground">Describe to the LLM how and when to use the tool.</p>
            </div>
            <div className="rounded-lg border p-4 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isWebhook ? 'e.g. send_notification' : 'e.g. get_user_data'}
                  className="text-[13px]"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this tool does and when the agent should use it..."
                  rows={3}
                  className="text-[13px] resize-none"
                />
              </div>

              {/* Method + URL */}
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="w-28">
                    <Label className="text-[12px] font-medium mb-1.5 block">Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="h-9 text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        {!isWebhook && <SelectItem value="PUT">PUT</SelectItem>}
                        {!isWebhook && <SelectItem value="DELETE">DELETE</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-[12px] font-medium mb-1.5 block">URL</Label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={isWebhook ? 'https://example.com/webhook' : 'https://api.example.com/endpoint'}
                      className="text-[13px]"
                    />
                  </div>
                </div>
              </div>

              {/* Headers */}
              <div className="space-y-1.5">
                <Label className="text-[12px] font-medium">Headers (JSON)</Label>
                <Input
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                  placeholder='{"Authorization": "Bearer ...", "Content-Type": "application/json"}'
                  className="text-[13px] font-mono"
                />
              </div>
            </div>
          </section>

          {/* Behavior Section */}
          <section>
            <div className="mb-1">
              <h3 className="text-[13px] font-semibold">Behavior</h3>
              <p className="text-[11px] text-muted-foreground">Configure how the tool executes during conversations.</p>
            </div>
            <div className="rounded-lg border p-4 space-y-5">
              {/* Response timeout */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[12px] font-medium">Response timeout (seconds)</div>
                    <div className="text-[10px] text-muted-foreground">How long to wait before timing out. Default is 20 seconds.</div>
                  </div>
                  <span className="text-[13px] font-mono font-medium tabular-nums w-8 text-right">{timeout}s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={timeout}
                  onChange={(e) => setTimeout(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Disable interruptions */}
              <div className="flex items-start gap-3">
                <Switch
                  checked={disableInterruptions}
                  onCheckedChange={setDisableInterruptions}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-[12px] font-medium">Disable interruptions</div>
                  <div className="text-[10px] text-muted-foreground">Prevent the agent from being interrupted while this tool is running.</div>
                </div>
              </div>

              {/* Execution mode */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-[12px] font-medium">Execution mode</div>
                  <div className="text-[10px] text-muted-foreground">Determines when and how the tool executes relative to agent speech.</div>
                </div>
                <Select value={executionMode} onValueChange={setExecutionMode}>
                  <SelectTrigger className="w-36 h-8 text-[12px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="after_speech">After speech</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Parameters Section (Custom API only) */}
          {!isWebhook && (
            <section>
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="text-[13px] font-semibold">Parameters</h3>
                  <p className="text-[11px] text-muted-foreground">Define the parameters that will be sent with the request.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 px-2"
                  onClick={addParameter}
                >
                  <Plus className="h-3 w-3" />
                  Add param
                </Button>
              </div>
              <div className="rounded-lg border">
                {parameters.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-[11px] text-muted-foreground">No parameters defined yet.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {parameters.map((param, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-2.5">
                        <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        <Input
                          value={param.name}
                          onChange={(e) => updateParameter(index, { name: e.target.value })}
                          placeholder="param_name"
                          className="h-7 text-[12px] font-mono flex-1"
                        />
                        <Select
                          value={param.type}
                          onValueChange={(value) => updateParameter(index, { type: value as Parameter['type'] })}
                        >
                          <SelectTrigger className="w-24 h-7 text-[11px] shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Switch
                            checked={param.required}
                            onCheckedChange={(checked) => updateParameter(index, { required: checked })}
                            className="scale-75"
                          />
                          <span className="text-[10px] text-muted-foreground w-12">
                            {param.required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeParameter(index)}
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-[13px]">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="text-[13px]">
            {isEditing ? 'Save Changes' : 'Add Tool'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
