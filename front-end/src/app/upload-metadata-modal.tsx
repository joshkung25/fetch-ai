"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tag, FileText, Loader2 } from "lucide-react";

interface DocumentMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onSave: (metadata?: DocumentInfoInput) => void;
}

export interface DocumentInfoInput {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
}

const categories = [
  "Documents",
  "Insurance",
  "Financial",
  "Medical",
  "Legal",
  "Personal",
  "Work",
  "Other",
];

export default function DocumentMetadataModal({
  isOpen,
  onClose,
  fileName,
  onSave,
}: DocumentMetadataModalProps) {
  const [title, setTitle] = useState(fileName.replace(/\.[^/.]+$/, "")); // Remove file extension
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [category, setCategory] = useState("Documents");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (isOpen) {
      fetchSuggestedTags();
      console.log("suggestedTags", suggestedTags);
    }
  }, [fileName]);

  const fetchSuggestedTags = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${apiUrl}/suggested_tags?document_title=${fileName}`
    );
    const data = await response.json();
    setSuggestedTags(data.tags);
    setIsLoading(false);
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag("");
    }
  };

  const handleSave = () => {
    const metadata: DocumentInfoInput = {
      //   title,
      description,
      tags: selectedTags,
      //   category,
    };
    onSave(metadata);
    onClose();
  };

  const handleSkip = () => {
    console.log("skipping");
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Information
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardDescription>
              Add optional information to help organize and find your document
              later
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* File Name Display */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Uploaded file:</p>
              <p className="font-medium truncate max-w-[350px]">{fileName}</p>
            </div>

            {/* Document Title */}
            {/* <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title"
              />
            </div> */}

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-input bg-background rounded-md text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any additional notes or description"
                rows={3}
              />
            </div>

            {/* Tags Section */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (Optional)
              </Label>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                />
                <Button onClick={addCustomTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Tags */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    suggestedTags
                      .filter((tag) => !selectedTags.includes(tag))
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => addTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} className="flex-1">
                Save Document
              </Button>
              {/* <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Skip & Save
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
