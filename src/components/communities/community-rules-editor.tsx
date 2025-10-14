"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";

interface Rule {
  title: string;
  description: string;
}

interface CommunityRulesEditorProps {
  communityName: string;
  initialRules: Rule[];
}

export function CommunityRulesEditor({
  communityName,
  initialRules,
}: CommunityRulesEditorProps) {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addRule = () => {
    setRules([...rules, { title: "", description: "" }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof Rule, value: string) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Filter out empty rules
    const validRules = rules.filter(
      (rule) => rule.title.trim() && rule.description.trim(),
    );

    try {
      const response = await fetch(`/api/communities/${communityName}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules: validRules,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update rules");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update rules",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-200">
          Community rules updated successfully!
        </div>
      )}

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <div key={index} className="border rounded-lg p-4 relative">
            <button
              type="button"
              onClick={() => removeRule(index)}
              className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="space-y-3 pr-8">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rule {index + 1} Title
                </label>
                <input
                  type="text"
                  value={rule.title}
                  onChange={(e) => updateRule(index, "title", e.target.value)}
                  placeholder="Be respectful"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={rule.description}
                  onChange={(e) =>
                    updateRule(index, "description", e.target.value)
                  }
                  placeholder="Treat all members with respect and kindness"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                  maxLength={500}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRule}
        className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md hover:bg-muted transition-colors"
        disabled={isSubmitting}
      >
        <Plus className="h-4 w-4" />
        Add Rule
      </button>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save Rules"}
        </button>
      </div>
    </form>
  );
}
