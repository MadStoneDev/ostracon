"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import {
  IconSend,
  IconPhoto,
  IconGif,
  IconMicrophone,
  IconX,
} from "@tabler/icons-react";

type MessageInputProps = {
  onSendMessage: (
    content: string | null,
    messageType: string,
    mediaUrl?: string | null,
    mediaType?: string | null,
  ) => Promise<void>;
  conversationId: string;
  currentUser: User;
};

export default function MessageInput({
  onSendMessage,
  conversationId,
  currentUser,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const supabase = createClient();

  const handleSend = async () => {
    if (isUploading) return;

    if (message.trim() === "" && !preview) return;

    try {
      if (preview && attachmentType) {
        // Message with media
        await onSendMessage(
          message.trim() || null,
          attachmentType,
          preview,
          attachmentType === "image"
            ? "image/jpeg"
            : attachmentType === "gif"
              ? "image/gif"
              : "audio/mpeg",
        );
      } else {
        // Text-only message
        await onSendMessage(message.trim(), "text");
      }

      // Reset input
      setMessage("");
      setPreview(null);
      setAttachmentType(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleGifClick = async () => {
    // In a real app, you'd implement a GIF picker here
    // For now, we'll use a placeholder GIF
    setPreview("https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif");
    setAttachmentType("gif");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileName = `${conversationId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("message_media")
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("message_media")
        .getPublicUrl(fileName);

      setPreview(urlData.publicUrl);
      setAttachmentType("image");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      stopRecording();
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup event listeners
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/mpeg",
        });

        setIsUploading(true);

        try {
          // Upload to Supabase Storage
          const fileName = `${conversationId}/${Date.now()}-voice.mp3`;
          const { data, error } = await supabase.storage
            .from("message_media")
            .upload(fileName, audioBlob);

          if (error) throw error;

          // Get public URL
          const { data: urlData } = supabase.storage
            .from("message_media")
            .getPublicUrl(fileName);

          setPreview(urlData.publicUrl);
          setAttachmentType("voice");
        } catch (error) {
          console.error("Error uploading voice recording:", error);
          alert("Failed to upload voice recording");
        } finally {
          setIsUploading(false);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Reset recording state
        setIsRecording(false);
        setRecordingTime(0);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancelAttachment = () => {
    setPreview(null);
    setAttachmentType(null);
  };

  const formatRecordingTime = () => {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col">
      {/* Preview */}
      {preview && (
        <div className="mb-2 relative">
          {attachmentType === "image" || attachmentType === "gif" ? (
            <div className="relative inline-block">
              <Image
                src={preview}
                alt="Preview"
                width={240}
                height={200}
                className="max-h-[200px] rounded-lg"
                unoptimized
              />
              <button
                onClick={handleCancelAttachment}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <IconX size={16} />
              </button>
            </div>
          ) : (
            attachmentType === "voice" && (
              <div className="relative inline-block">
                <audio controls className="max-w-full">
                  <source src={preview} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <button
                  onClick={handleCancelAttachment}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <IconX size={16} />
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-2 p-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 rounded flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
          <div>Recording {formatRecordingTime()}</div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="flex-grow flex items-center border rounded-full px-3 py-2 focus-within:border-primary">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Recording..." : "Type a message..."}
            disabled={isRecording}
            className="flex-grow resize-none max-h-20 outline-none bg-transparent border-none"
            rows={1}
          />
        </div>

        {/* Attachment buttons */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleImageClick}
          className="rounded-full p-2 hover:bg-dark/10 dark:hover:bg-light/10 text-dark dark:text-light"
          title="Attach image"
          disabled={isRecording || isUploading}
        >
          <IconPhoto size={24} />
        </button>

        <button
          onClick={handleGifClick}
          className="rounded-full p-2 hover:bg-dark/10 dark:hover:bg-light/10 text-dark dark:text-light"
          title="Send GIF"
          disabled={isRecording || isUploading}
        >
          <IconGif size={24} />
        </button>

        <button
          onClick={handleMicClick}
          className={`rounded-full p-2 ${
            isRecording
              ? "bg-red-500 text-white"
              : "hover:bg-dark/10 dark:hover:bg-light/10 text-dark dark:text-light"
          }`}
          title={isRecording ? "Stop recording" : "Record voice message"}
          disabled={isUploading}
        >
          <IconMicrophone size={24} />
        </button>

        <button
          onClick={handleSend}
          className="rounded-full p-2 bg-primary text-white disabled:opacity-50"
          disabled={
            (message.trim() === "" && !preview) || isRecording || isUploading
          }
        >
          <IconSend size={24} />
        </button>
      </div>
    </div>
  );
}
