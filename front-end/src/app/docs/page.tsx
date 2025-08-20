"use client";

import * as React from "react";
import {
  Search,
  Upload,
  FileText,
  File,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  X,
  Settings,
  User,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ThemeToggle from "../theme-toggle";
import { useUser, getAccessToken } from "@auth0/nextjs-auth0";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/utils";
import { useRandomId } from "@/context";
import UploadSuggestionsModal from "../upload-suggestion-modal";
import NavbarNew from "../navbar-new";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useDocuments } from "@/context/DocumentsContext";

//import { Document, Page } from "react-pdf"; 

type ViewMode = "grid" | "list";
type SortOption = "name" | "date" | "size" | "type";
type FilterOption =
  | "all"
  | "pdf"
  | "markdown"
  | "sql"
  | "word"
  | "json"
  | "excel";

export type DocumentMeta = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  tags: string[];
  description: string;
};

export default function DocumentsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  //const apiUrl = "http://localhost:8001";
  // console.log("API URL:", apiUrl);
  const { user } = useUser();
  const { documents, fetchDocuments } = useDocuments();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [sortBy, setSortBy] = React.useState<SortOption>("date");
  const [filterBy, setFilterBy] = React.useState<FilterOption>("all");
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>(
    []
  );
  const { randomId } = useRandomId();
  const [open, setOpen] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [modifyDoc, setModifyDoc] = useState<DocumentMeta | null>(null);
  const [newTags, setNewTags] = useState<string>("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("__all__");
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fetchAllTags = React.useCallback(async () => {
    if (!user) return;
    const accessToken = await getAccessToken();
    const res = await fetch(`${apiUrl}/list`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    // Collect all tags from documents
    const tagsSet = new Set<string>();
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((meta: any) => {
        if (Array.isArray(meta.tags)) {
          meta.tags.forEach((tag: string) => tagsSet.add(tag));
        } else if (typeof meta.tags === "string") {
          meta.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
            .forEach((tag: string) => tagsSet.add(tag));
        }
      });
    }
    setAllTags(Array.from(tagsSet));
  }, [user, apiUrl, getAccessToken]);

  useEffect(() => {
    fetchDocuments();
    fetchAllTags();
  }, [fetchDocuments, fetchAllTags]);

  // Filter and search documents
  const filteredDocuments = React.useMemo(() => {
    let filtered = documents;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (doc: DocumentMeta) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Apply type filter
    if (filterBy !== "all") {
      filtered = filtered.filter((doc) => doc.type.toLowerCase() === filterBy);
    }

    // Apply tag filter
    if (selectedTag && selectedTag !== "__all__") {
      filtered = filtered.filter((doc) =>
        doc.tags.map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case "size":
          return Number.parseFloat(b.size) - Number.parseFloat(a.size);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [documents, searchQuery, filterBy, sortBy, selectedTag]);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "markdown":
        return <FileText className="h-8 w-8 text-blue-500" />;
      case "sql":
        return <FileText className="h-8 w-8 text-green-500" />;
      case "word":
        return <FileText className="h-8 w-8 text-blue-600" />;
      case "json":
        return <FileText className="h-8 w-8 text-yellow-600" />;
      case "excel":
        return <FileText className="h-8 w-8 text-green-600" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getSmallFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "markdown":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "sql":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "word":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "json":
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case "excel":
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    const accessToken = await getAccessToken();

    console.log("doc name", doc.name);
    const response = await fetch(
      `${apiUrl}/delete?title=${encodeURIComponent(doc.name)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    console.log("response", response);

    await fetchDocuments();
    setSelectedDocuments((prev) => prev.filter((id) => id !== docId));
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!apiUrl) {
      toast.error("API URL is not defined");
      return;
    }

    await fetchDocuments();

    const duplicate = documents.find(doc => doc.name === file.name);
    if (duplicate) {
      setPendingFile(file);
      setShowReplaceModal(true);
      return;
    }

    await uploadFiles([file], apiUrl, user, randomId);
    await fetchDocuments();
  };

  const handleReplaceDocument = async () => {
    if (!pendingFile || !apiUrl) return;
    const formData = new FormData();
    formData.append("file", pendingFile);
    formData.append(
      "request",
      JSON.stringify({
        title: pendingFile.name,
        tags: [], 
      })
    );

    const accessToken = await getAccessToken();
    const res = await fetch(`${apiUrl}/replace`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (res.ok) {
      await fetchDocuments();
      toast.success("Document replaced successfully");
    } else {
      toast.error("Failed to replace document");
    }

    setShowReplaceModal(false);
    setPendingFile(null);
    fileInputRef.current!.value = "";
  };

  const handleBulkDelete = async () => {
      const accessToken = await getAccessToken();
  for (const docId of selectedDocuments) {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      await fetch(`${apiUrl}/delete?title=${encodeURIComponent(doc.name)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }, // <-- Add this line
      });
    }
  }
  await fetchDocuments();
  setSelectedDocuments([]);
};

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id));
    }
  };

  const handlePreview = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    const accessToken = await getAccessToken();
    const response = await fetch(
      `${apiUrl}/preview-url?title=${encodeURIComponent(doc.name)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const pdfBlob = await response.blob();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
    window.focus();
  };

  const handleDownload = async (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return;
    const accessToken = await getAccessToken();
    const response = await fetch(
      `${apiUrl}/download?title=${encodeURIComponent(doc.name)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const pdfBlob = await response.blob();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = doc.name;
    a.click();
  };

const handleDeleteCollection = async () => {
  const accessToken = await getAccessToken();
  await fetch(`${apiUrl}/delete-collection`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  await fetchDocuments(); // Refresh the list after deletion
  setSelectedDocuments([]); // Clear selection
};

  const handleModifyTags = (doc: DocumentMeta) => {
    setModifyDoc(doc);
    setNewTags(doc.tags.join(", "));
    setModifyOpen(true);
  };

  const handleSaveTags = async () => {
    if (!modifyDoc) return;
    const accessToken = await getAccessToken();
    const tagsArray = newTags.split(",").map(tag => tag.trim()).filter(Boolean);

    await fetch(`${apiUrl}/update-tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: modifyDoc.name,
        tags: tagsArray,
      }),
    });
    await fetchDocuments(); // <-- Move this before closing modal
    setModifyOpen(false);
    setModifyDoc(null);
    toast.success("Tags updated successfully"); 
  };

  return (
    <div className="flex flex-col h-screen bg-background w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        accept="image/*,text/*,.pdf,.doc,.docx"
      />
      <NavbarNew nav_header="Documents" />
      {/* Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-center gap-4 px-6 py-3">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteCollection}
          >
            Delete Collection
          </Button>
          {/* Search */}
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filterBy}
              onValueChange={(value: FilterOption) => setFilterBy(value)}
            >
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            {/* Tag Dropdown */}
            <Select
              value={selectedTag}
              onValueChange={(value: string) => setSelectedTag(value)}
            >
              <SelectTrigger className="w-32">
                <span className="mr-2">🏷️</span>
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-2 bg-muted/50 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedDocuments.length} selected
            </span>
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDocuments([])}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterBy !== "all"
                ? "No documents found"
                : "No documents yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {user
                ? searchQuery || filterBy !== "all"
                  ? "Try adjusting your search or filters"
                  : "Upload your first document to get started"
                : "Login to get started and view your documents"}
            </p>
            <Button onClick={handleAttachment} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            <p className="text-xs text-muted-foreground fixed bottom-0 pb-12">
              Your documents are stored in private, encrypted storage and
              protected by strict backend authentication — only you can access
              them.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2 sm:px-4 md:px-6 lg:px-8">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDocuments.includes(doc.id)
                    ? "ring-2 ring-primary"
                    : ""
                }`}
                onClick={() => toggleDocumentSelection(doc.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm truncate">
                          {doc.name.length > 20
                            ? doc.name.slice(0, 20) + "..."
                            : doc.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {doc.type}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(doc.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleModifyTags(doc)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Modify Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{doc.size}</span>
                    <span>{formatDate(doc.uploadDate)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* List Header */}
            <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={
                    selectedDocuments.length === filteredDocuments.length
                  }
                  onChange={selectAllDocuments}
                  className="rounded"
                />
              </div>
              <div className="flex-1">Name</div>
              <div className="w-20">Type</div>
              <div className="w-20">Size</div>
              <div className="w-32">Modified</div>
              <div className="w-8"></div>
            </div>

            {/* List Items */}
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 cursor-pointer ${
                  selectedDocuments.includes(doc.id) ? "bg-muted" : ""
                }`}
                onClick={() => toggleDocumentSelection(doc.id)}
              >
                <div className="w-8">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => toggleDocumentSelection(doc.id)}
                    className="rounded"
                  />
                </div>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getSmallFileIcon(doc.type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <div className="w-20 text-sm text-muted-foreground">
                  {doc.type}
                </div>
                <div className="w-20 text-sm text-muted-foreground">
                  {doc.size}
                </div>
                <div className="w-32 text-sm text-muted-foreground">
                  {formatDate(doc.uploadDate)}
                </div>
                <div className="w-8">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(doc.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(doc.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleModifyTags(doc)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Modify Tags
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modify Tags Modal */}
      <Dialog open={modifyOpen} onOpenChange={setModifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Tags for {modifyDoc?.name}</DialogTitle>
          </DialogHeader>
          <Input
            value={newTags}
            onChange={e => setNewTags(e.target.value)}
            placeholder="Enter tags separated by commas"
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveTags}>Save</Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setModifyOpen(false)}>Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace Document Modal */}
      <Dialog open={showReplaceModal} onOpenChange={setShowReplaceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Replace Document
            </DialogTitle>
          </DialogHeader>
          <p>
            A document named <b>{pendingFile?.name}</b> already exists. Do you want to replace it?
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleReplaceDocument}>Yes, Replace</Button>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowReplaceModal(false)}>Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
