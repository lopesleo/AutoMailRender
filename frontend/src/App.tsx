import "./App.css";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BrainCircuit,
  Wand2,
  Zap,
  LoaderCircle,
  UploadCloud,
  X,
  FolderClock,
  Coffee,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisResult {
  category: "PRODUTIVO" | "IMPRODUTIVO";
  reason: string;
  response: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];

    if (
      file &&
      (file.type === "text/plain" || file.type === "application/pdf")
    ) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();

      if (activeTab === "file" && selectedFile) {
        formData.append("file", selectedFile);
      } else if (activeTab === "text" && textInput.trim()) {
        formData.append("content", textInput);
      } else {
        setError("Por favor, insira um texto ou selecione um arquivo.");
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch("/api/email/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Ocorreu um erro na análise.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error analyzing email:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao analisar o e-mail. Tente novamente.";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    if (result?.response) {
      try {
        await navigator.clipboard.writeText(result.response);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }
  };

  const canAnalyze =
    (activeTab === "text" && textInput.trim()) ||
    (activeTab === "file" && selectedFile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black p-4 flex items-center justify-center">
      <Card className="w-full max-w-4xl border-slate-700 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BrainCircuit className="h-8 w-8 text-blue-400" />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Analisador de E-mails com IA
            </CardTitle>
            <Wand2 className="h-8 w-8 text-purple-400" />
          </div>
          <CardDescription className="text-slate-400 text-lg">
            Cole um texto ou envie um arquivo (.txt, .pdf) para classificar o
            conteúdo e gerar uma resposta automática.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger
                value="text"
                className="data-[state=active]:bg-slate-700"
              >
                Colar Texto
              </TabsTrigger>
              <TabsTrigger
                value="file"
                className="data-[state=active]:bg-slate-700"
              >
                Enviar Arquivo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                placeholder="Cole o corpo do e-mail aqui..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[200px] bg-slate-800 border-slate-600 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
              />
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
                  isDragOver
                    ? "border-sky-400 border-solid bg-sky-400/10"
                    : "border-slate-600 hover:border-slate-500"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <UploadCloud
                    className={cn(
                      "h-12 w-12 transition-colors",
                      isDragOver ? "text-sky-400" : "text-slate-400"
                    )}
                  />
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      Arraste um arquivo .txt ou .pdf aqui, ou clique para
                      selecionar
                    </p>
                    <p className="text-sm text-slate-500">Máximo 10MB</p>
                  </div>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <span className="text-slate-300 truncate">
                    {selectedFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
          >
            {isAnalyzing ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Analisar Agora
              </>
            )}
          </Button>

          {/* Results Section */}
          {(isAnalyzing || result || error) && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/50 bg-red-500/10"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Ocorreu um Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isAnalyzing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-32 bg-slate-700" />
                  </div>
                  <Skeleton className="h-4 w-3/4 bg-slate-700" />
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <Skeleton className="h-6 w-48 bg-slate-700" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full bg-slate-700" />
                    </CardContent>
                  </Card>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        result.category === "PRODUTIVO"
                          ? "default"
                          : "secondary"
                      }
                      className={cn(
                        "text-lg px-4 py-2",
                        result.category === "PRODUTIVO"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-600 hover:bg-slate-700"
                      )}
                    >
                      {result.category === "PRODUTIVO" ? (
                        <FolderClock className="mr-2 h-5 w-5" />
                      ) : (
                        <Coffee className="mr-2 h-5 w-5" />
                      )}
                      {result.category}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground">{result.reason}</p>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl">
                        Sugestão de Resposta
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyToClipboard}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={result.response}
                        readOnly
                        className="min-h-[100px] bg-slate-900 border-slate-600 resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
