"use client";
import React, { useState, useRef } from "react";
import { X, Upload, Music, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function UploadModal({ isOpen, onClose, onUpload, themes = [] }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadStep, setUploadStep] = useState(""); // Current step description
  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setDescription("");
      setSelectedTheme("");
      setUploading(false);
      setUploadProgress(0);
      setUploadStatus(null);
      setUploadMessage("");
      setUploadStep("");
      setDragActive(false);
    }
  }, [isOpen]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (isAudioFile(file)) {
        setSelectedFile(file);
      } else {
        setUploadStatus("error");
        setUploadMessage("Por favor, selecione apenas arquivos de áudio (MP3, WAV, FLAC, AAC, OGG, M4A)");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isAudioFile(file)) {
        setSelectedFile(file);
        setUploadStatus(null); // Clear any previous error
        setUploadMessage("");
      } else {
        setUploadStatus("error");
        setUploadMessage("Por favor, selecione apenas arquivos de áudio (MP3, WAV, FLAC, AAC, OGG, M4A)");
        e.target.value = ""; // Clear file input
      }
    }
  };

  const isAudioFile = (file) => {
    const audioTypes = [
      'audio/mpeg',        // MP3
      'audio/wav',         // WAV
      'audio/wave',        // WAV (alternative)
      'audio/x-wav',       // WAV (alternative)
      'audio/flac',        // FLAC
      'audio/x-flac',      // FLAC (alternative)
      'audio/aac',         // AAC
      'audio/mp4',         // M4A
      'audio/x-m4a',       // M4A (alternative)
      'audio/ogg',         // OGG
      'audio/vorbis',      // OGG Vorbis
    ];
    
    const audioExtensions = [
      '.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'
    ];
    
    const fileName = file.name.toLowerCase();
    const hasValidExtension = audioExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = audioTypes.includes(file.type.toLowerCase());
    
    return hasValidExtension || hasValidMimeType;
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      setUploadStatus("error");
      setUploadMessage("Por favor, selecione um arquivo de áudio e adicione uma descrição.");
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setUploadMessage("");
    setUploadProgress(0);
    setUploadStep("Preparando upload...");

    try {
      // Progress callback for upload
      const onProgress = (progress) => {
        setUploadProgress(progress);
        if (progress < 100) {
          setUploadStep(`Enviando arquivo... ${progress}%`);
        } else {
          setUploadStep("Finalizando upload...");
        }
      };

      await onUpload(selectedFile, description.trim(), onProgress, selectedTheme);
      
      setUploadProgress(100);
      setUploadStep("Upload concluído!");
      setUploadStatus("success");
      setUploadMessage("Arquivo enviado com sucesso!");
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(error.message || "Erro ao enviar arquivo");
      setUploadStep("");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload de Áudio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={uploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Progress */}
          {uploading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">{uploadStep}</span>
                <span className="text-sm text-blue-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mb-4 p-3 rounded-lg flex items-center ${
              uploadStatus === "success" 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {uploadStatus === "success" ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {uploadMessage}
            </div>
          )}

          {/* Drag and Drop Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-[#174A8B] bg-blue-50"
                : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              disabled={uploading}
              accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg"
            />

            {selectedFile ? (
              <div className="space-y-2">
                <Music className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-red-600 hover:text-red-800"
                  disabled={uploading}
                >
                  Remover arquivo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Music className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Arraste um arquivo de áudio aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos suportados: MP3, WAV, FLAC, AAC, OGG, M4A
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Theme Selection */}
          <div className="mt-4">
            <label htmlFor="audio-theme" className="block text-sm font-medium text-gray-900 mb-2">
              Tema (Opcional)
            </label>
            <select
              id="audio-theme"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#174A8B] focus:border-[#174A8B]"
              disabled={uploading}
            >
              <option value="">Selecione um tema (opcional)</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Classifique este áudio com um tema específico para melhor organização
            </p>
          </div>

          {/* Description Field */}
          <div className="mt-4">
            <label htmlFor="audio-description" className="block text-sm font-medium text-gray-900 mb-2">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="audio-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do áudio (ex: música instrumental, podcast sobre tecnologia, gravação de reunião...)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#174A8B] focus:border-[#174A8B] resize-none"
              rows={3}
              disabled={uploading}
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Máximo 500 caracteres
              </p>
              <p className="text-xs text-gray-400">
                {description.length}/500
              </p>
            </div>
          </div>

          {/* Audio File Info */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Informações do Áudio:</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div><strong>Nome:</strong> {selectedFile.name}</div>
                <div><strong>Tamanho:</strong> {formatFileSize(selectedFile.size)}</div>
                <div><strong>Tipo:</strong> {selectedFile.type || "Não especificado"}</div>
                <div><strong>Última modificação:</strong> {new Date(selectedFile.lastModified).toLocaleString("pt-BR")}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || !description.trim() || uploading || uploadStatus === "success"}
            className="px-4 py-2 text-sm font-medium text-white bg-[#174A8B] hover:bg-[#0f3a6b] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Enviar Áudio
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
