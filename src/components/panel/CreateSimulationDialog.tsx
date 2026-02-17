import { useState } from 'react';
import {
  Plus, X, ChevronDown, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import type { TestScenario } from '@/hooks/useCanvasState';
import { PERSONAS } from '@/data/mockData';

interface CreateSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddScenario: (scenario: Omit<TestScenario, 'id'>) => void;
}

export default function CreateSimulationDialog({
  open,
  onOpenChange,
  onAddScenario,
}: CreateSimulationDialogProps) {
  const [name, setName] = useState('');
  const [scenario, setScenario] = useState('');
  const [criteria, setCriteria] = useState('');
  const [maxTurns, setMaxTurns] = useState(5);
  const [persona, setPersona] = useState('default');
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([]);
  const [showVars, setShowVars] = useState(false);

  const canCreate = name.trim() && scenario.trim();

  const reset = () => {
    setName('');
    setScenario('');
    setCriteria('');
    setMaxTurns(5);
    setPersona('default');
    setVariables([]);
    setShowVars(false);
  };

  const handleCreate = () => {
    onAddScenario({
      name,
      description: '',
      steps: [],
      scenario,
      successCriteria: criteria,
      maxTurns,
      persona,
      variables: variables.filter(v => v.key.trim()),
      result: null,
      notes: [],
      conversation: [],
      lastRunAt: null,
      createdAt: new Date().toISOString(),
    });
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-[15px]">Create Simulation</DialogTitle>
          <DialogDescription className="text-[12px]">
            Define a test scenario to simulate a user conversation with your agent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4">
            <div>
              <Label className="text-[12px] font-semibold mb-1 block">Test name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your test name"
                className="text-[12px]"
              />
            </div>

            <div>
              <Label className="text-[12px] font-semibold mb-1 block">Describe simulated user scenario</Label>
              <Textarea
                value={scenario}
                onChange={e => setScenario(e.target.value)}
                placeholder={"Describe how the user will interact with the agent.\nExample: A tourist struggling with English is trying to make an order at a restaurant."}
                rows={3}
                className="text-[12px] resize-none"
              />
            </div>

            <div>
              <Label className="text-[12px] font-semibold mb-1 block">Describe success criteria</Label>
              <Textarea
                value={criteria}
                onChange={e => setCriteria(e.target.value)}
                placeholder="Describe successful outcome of the simulation. This will be used to evaluate if the agent passed the test, or not."
                rows={2}
                className="text-[12px] resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-[12px] font-semibold mb-1 block">Max conversation turns</Label>
                <Input
                  type="number"
                  value={maxTurns}
                  onChange={e => setMaxTurns(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  min={1}
                  max={20}
                  className="text-[12px] w-20"
                />
              </div>
              <div className="flex-1">
                <Label className="text-[12px] font-semibold mb-1 block">Persona</Label>
                <Select value={persona} onValueChange={setPersona}>
                  <SelectTrigger className="text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSONAS.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic variables */}
            <div>
              <button
                onClick={() => setShowVars(!showVars)}
                className="flex items-center gap-1 text-[12px] font-semibold text-foreground hover:text-primary transition-colors"
              >
                {showVars ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Dynamic variables
                <span className="text-[10px] text-muted-foreground font-normal">(optional)</span>
              </button>
              {showVars && (
                <div className="mt-2 space-y-2">
                  <p className="text-[10px] text-muted-foreground">
                    Dynamic variables will be replaced with placeholder values when running this test.
                  </p>
                  {variables.map((v, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Input
                        value={v.key}
                        onChange={e => {
                          const updated = [...variables];
                          updated[i] = { ...updated[i], key: e.target.value };
                          setVariables(updated);
                        }}
                        placeholder="Variable name"
                        className="text-[11px] flex-1"
                      />
                      <Input
                        value={v.value}
                        onChange={e => {
                          const updated = [...variables];
                          updated[i] = { ...updated[i], value: e.target.value };
                          setVariables(updated);
                        }}
                        placeholder="Value"
                        className="text-[11px] flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setVariables(variables.filter((_, j) => j !== i))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-[11px]"
                    onClick={() => setVariables([...variables, { key: '', value: '' }])}
                  >
                    Add New
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[12px]"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 text-[12px]"
            disabled={!canCreate}
            onClick={handleCreate}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
