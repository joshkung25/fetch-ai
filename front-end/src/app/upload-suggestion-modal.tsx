"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Car,
  CreditCard,
  Shield,
  Home,
  Heart,
  Briefcase,
} from "lucide-react";
import { uploadFiles } from "@/lib/utils";
import { useUser } from "@auth0/nextjs-auth0";
import { useRandomId } from "@/context";
import { useApiUrl } from "@/context";

const suggestedDocuments = [
  {
    id: "drivers-license",
    name: "Driver's License",
    icon: CreditCard,
    description: "Valid driver's license",
    tags: ["Driver's License", "ID"],
  },
  {
    id: "car-registration",
    name: "Car Registration",
    icon: Car,
    description: "Vehicle registration documents",
    tags: ["Car Registration", "Vehicle"],
  },
  {
    id: "car-insurance",
    name: "Car Insurance",
    icon: Shield,
    description: "Auto insurance policy",
    tags: ["Car Insurance", "Insurance", "Vehicle"],
  },
  {
    id: "health-insurance",
    name: "Health Insurance",
    icon: Heart,
    description: "Health insurance card",
    tags: ["Health Insurance", "Insurance", "Health"],
  },
  {
    id: "home-insurance",
    name: "Home Insurance",
    icon: Home,
    description: "Homeowner's/renter's insurance",
    tags: ["Home Insurance", "Insurance", "Home"],
  },
  {
    id: "passport",
    name: "Passport",
    icon: FileText,
    description: "Valid passport",
    tags: ["Passport", "ID", "Travel"],
  },
  {
    id: "employment-docs",
    name: "Employment Documents",
    icon: Briefcase,
    description: "Pay stubs, employment letter",
    tags: ["Employment"],
  },
];

export default function UploadSuggestionsModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const { user } = useUser();
  const { randomId } = useRandomId();
  const { apiUrl } = useApiUrl();
  const handleFileUpload = async (documentId: string, tags: string[]) => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      console.log("file", file);
      if (file) {
        // Here you would typically upload the file to your server
        console.log(`Uploading ${file.name} for ${documentId}`);
        setUploadedFiles((prev) => new Set(prev).add(documentId));

        if (!file) return;
        console.log("tags", tags);
        await uploadFiles([file], apiUrl, user, randomId, tags); // TODO: add the document label to the file
      }
    };

    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogTitle className="sr-only">Upload Suggestions</DialogTitle>
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">
              Get Started with Fetch
            </CardTitle>
            <CardDescription className="text-base">
              Upload suggested files to begin using Fetch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedDocuments.map((doc) => {
              const IconComponent = doc.icon;
              const isUploaded = uploadedFiles.has(doc.id);

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleFileUpload(doc.id, doc.tags)}
                    variant={isUploaded ? "secondary" : "default"}
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {isUploaded ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Uploaded
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
            <div className="pt-4 border-t">
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="w-full"
              >
                Continue Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
