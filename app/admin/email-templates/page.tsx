"use client";

import { useState, useEffect } from "react";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Save, 
  Eye, 
  Settings
} from "lucide-react";
import { 
  getEmailTemplates, 
  updateEmailTemplate, 
  EmailTemplate
} from "@/lib/actions/email-templates";

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit: (template: EmailTemplate) => void;
  onUpdate: (id: string, data: Partial<EmailTemplate>) => void;
}

const TemplateCard = ({ template, onEdit, onUpdate }: TemplateCardProps) => {
  const [isActive, setIsActive] = useState(template.isActive);
  const [updating, setUpdating] = useState(false);

  const handleToggleActive = async () => {
    setUpdating(true);
    try {
      await onUpdate(template.id, { isActive: !isActive });
      setIsActive(!isActive);
    } catch (error) {
      console.error("Failed to update template:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
            <Badge variant="secondary" className="w-fit">
              {template.type.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleActive}
                disabled={updating}
              />
              <Label className="text-sm">Active</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(template)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Subject</Label>
            <p className="text-sm text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
              {template.subject}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">HTML Content</Label>
              <p className="text-sm text-muted-foreground">
                {template.htmlContent ? `${template.htmlContent.length} characters` : 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Text Content</Label>
              <p className="text-sm text-muted-foreground">
                {template.textContent ? `${template.textContent.length} characters` : 'Not set'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="h-3 w-3" />
            Last updated: {new Date(template.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await getEmailTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to load email templates:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const handleUpdateTemplate = async (id: string, data: {
  name?: string;
  subject?: string;
  htmlContent?: string | null;
  textContent?: string | null;
  isActive?: boolean;
  description?: string | null;
}) => {
    try {
      const updated = await updateEmailTemplate(id, data);
      setTemplates(prev => 
        prev.map(t => t.id === id ? { ...t, ...updated } : t)
      );
      if (editingTemplate && editingTemplate.id === id) {
        setEditingTemplate({ ...editingTemplate, ...updated });
      }
    } catch (error) {
      console.error("Failed to update template:", error);
      throw error;
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    setSaving(true);
    try {
      await handleUpdateTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        htmlContent: editingTemplate.htmlContent,
        textContent: editingTemplate.textContent,
        description: editingTemplate.description
      });
      setEditingTemplate(null);
    } catch (error) {
      console.error("Failed to save template:", error);
      alert("Failed to save template. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <AdminBreadcrumbs />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-muted-foreground">Loading email templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminBreadcrumbs />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight uppercase">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage and customize email templates sent to donors and administrators.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={setEditingTemplate}
            onUpdate={handleUpdateTemplate}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Edit Email Template</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTemplate(null)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-type">Type</Label>
                  <Input
                    id="template-type"
                    value={editingTemplate.type}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={editingTemplate.description || ''}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    description: e.target.value
                  })}
                  placeholder="Brief description of when this template is used"
                />
              </div>

              <div>
                <Label htmlFor="template-subject">Subject</Label>
                <Input
                  id="template-subject"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    subject: e.target.value
                  })}
                  placeholder="Email subject line (use {{variable}} for placeholders)"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="template-html">HTML Content</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(editingTemplate)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  <Textarea
                    id="template-html"
                    value={editingTemplate.htmlContent || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      htmlContent: e.target.value
                    })}
                    placeholder="HTML email content (use {{variable}} for placeholders)"
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="template-text">Text Content</Label>
                  <Textarea
                    id="template-text"
                    value={editingTemplate.textContent || ''}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      textContent: e.target.value
                    })}
                    placeholder="Plain text email content (fallback for email clients that don't support HTML)"
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Available Variables</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p><code>{'{{donorName}}'}</code> - Donor&apos;s name</p>
                  <p><code>{'{{campaignName}}'}</code> - Campaign name</p>
                  <p><code>{'{{items}}'}</code> - Array of claimed items (use with <code>{'{{#each items}}...{{/each}}'}</code>)</p>
                  <p><code>{'{{dropOffAddress}}'}</code> - Drop-off location</p>
                  <p><code>{'{{dropOffDeadline}}'}</code> - Drop-off deadline</p>
                  <p><code>{'{{urgencyEmoji}}'}</code> - Urgency indicator (🎅⏰🎁)</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditingTemplate(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Template Preview</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(null)}
                >
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <div className="p-3 bg-muted rounded font-mono text-sm">
                    {previewTemplate.subject}
                  </div>
                </div>
                
                {previewTemplate.htmlContent && (
                  <div>
                    <Label>HTML Preview</Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <div dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }} />
                    </div>
                  </div>
                )}
                
                {previewTemplate.textContent && (
                  <div>
                    <Label>Text Preview</Label>
                    <div className="p-3 bg-muted rounded font-mono text-sm whitespace-pre-wrap">
                      {previewTemplate.textContent}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
